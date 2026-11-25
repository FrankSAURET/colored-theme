/**
 * Extrait du VS Code installé les valeurs par défaut des couleurs du plan de travail
 * (registre `registerColor`) et les écrit dans `scripts/defauts-vscode.json`.
 *
 * Usage : node scripts/extraire-defauts-vscode.mjs [chemin/vers/workbench.desktop.main.js]
 *
 * Les défauts sont des expressions (darken, transparent, référence à une autre clé…) :
 * on les garde sous forme d'arbre, évalué ensuite thème par thème par contraste-lib.mjs.
 * Le fichier produit est versionné : le contrôle des contrastes tourne sans VS Code installé.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Recherche du paquet du plan de travail à partir de l'exécutable « code ».
function trouverPaquet() {
	if (process.argv[2]) return process.argv[2];
	const commande = process.platform === 'win32' ? 'where code' : 'which code';
	const bin = execSync(commande, { encoding: 'utf8' }).split(/\r?\n/)[0].trim();
	let dossier = dirname(dirname(bin));
	const candidats = [join(dossier, 'resources', 'app'), join(dossier, 'Resources', 'app')];
	// Windows : les ressources sont dans un sous-dossier haché (« 8a14f0cc1b/resources/app »).
	for (const sous of readdirSync(dossier, { withFileTypes: true })) {
		if (sous.isDirectory()) candidats.push(join(dossier, sous.name, 'resources', 'app'));
	}
	for (const app of candidats) {
		const f = join(app, 'out', 'vs', 'workbench', 'workbench.desktop.main.js');
		if (existsSync(f)) return f;
	}
	throw new Error('workbench.desktop.main.js introuvable : passer son chemin en argument.');
}

const fichier = trouverPaquet();
const source = readFileSync(fichier, 'utf8');
let versionVSCode = 'inconnue';
try {
	versionVSCode = JSON.parse(readFileSync(join(dirname(fichier), '..', '..', '..', 'package.json'), 'utf8')).version;
} catch { /* version facultative */ }

// --- Repérage des noms minifiés -------------------------------------------------------------

// Fonction d'enregistrement : « function pe(s,o,e,t,i){return X.registerColor(s,o,e,t,i)} »
const enregistrement = /function (\w+)\(\w+,\w+,\w+,\w+,\w+\)\{return \w+\.registerColor\(/.exec(source)?.[1];
if (!enregistrement) throw new Error('Fonction registerColor introuvable.');

// Fonctions de transformation : « function gh(s,o){return{op:0,...} »
const nomsOp = { 0: 'darken', 1: 'lighten', 2: 'transparent', 3: 'opaque', 4: 'oneOf', 5: 'lessProminent', 6: 'ifDefinedThenElse', 8: 'opacity' };
const transformations = {};
for (const m of source.matchAll(/function (\w+)\(([^)]*)\)\{return\{op:(\d)/g)) {
	if (nomsOp[m[3]]) transformations[m[1]] = nomsOp[m[3]];
}

// Classe Color minifiée : « if(s instanceof ct)return s »
const classeCouleur = /if\(\w+ instanceof (\w+)\)return \w+;if\(typeof \w+=="object"\)/.exec(source)?.[1] ?? 'ct';
const constantes = { white: '#ffffff', black: '#000000', transparent: '#00000000', red: '#ff0000', blue: '#0000ff', green: '#00ff00', cyan: '#00ffff', lightgrey: '#d3d3d3' };

// Variables minifiées → clé de couleur, avec leur position (le même nom court peut resservir).
const definitions = new Map();
const motifDef = new RegExp(`([\\w$]+)=${enregistrement}\\("([^"]+)"`, 'g');
for (const m of source.matchAll(motifDef)) {
	if (!definitions.has(m[1])) definitions.set(m[1], []);
	definitions.get(m[1]).push({ pos: m.index, cle: m[2] });
}

// --- Mini-analyseur d'expressions JS (sous-ensemble utilisé par les défauts) -----------------

class Analyseur {
	constructor(texte, pos) { this.t = texte; this.p = pos; }
	espaces() { while (/\s/.test(this.t[this.p])) this.p++; }
	voir() { this.espaces(); return this.t[this.p]; }
	attendre(c) { if (this.voir() !== c) throw new Error(`« ${c} » attendu à ${this.p}`); this.p++; }
	ident() { this.espaces(); const m = /^[A-Za-z_$][\w$]*/.exec(this.t.slice(this.p, this.p + 80)); if (!m) throw new Error(`identifiant attendu à ${this.p}`); this.p += m[0].length; return m[0]; }
	expression() {
		let n = this.primaire();
		for (;;) {
			const c = this.voir();
			if (c === '.') { this.p++; n = { type: 'membre', objet: n, nom: this.ident() }; }
			else if (c === '(') { this.p++; const args = []; if (this.voir() !== ')') { args.push(this.expression()); while (this.voir() === ',') { this.p++; args.push(this.expression()); } } this.attendre(')'); n = { type: 'appel', fn: n, args }; }
			else return n;
		}
	}
	primaire() {
		const c = this.voir();
		if (c === '"' || c === "'" || c === '`') { const fin = this.t.indexOf(c, this.p + 1); const v = this.t.slice(this.p + 1, fin); this.p = fin + 1; return { type: 'chaine', v }; }
		if (c === '{') {
			this.p++; const champs = {};
			while (this.voir() !== '}') {
				let cle; if (this.voir() === '"') { const fin = this.t.indexOf('"', this.p + 1); cle = this.t.slice(this.p + 1, fin); this.p = fin + 1; } else cle = this.ident();
				this.attendre(':'); champs[cle] = this.expression();
				if (this.voir() === ',') this.p++;
			}
			this.p++; return { type: 'objet', champs };
		}
		if (c === '(') { this.p++; const e = this.expression(); this.attendre(')'); return e; }
		if (c === '!') { this.p++; const e = this.primaire(); return { type: 'nombre', v: e.v ? 0 : 1 }; }
		if (c === '-' || c === '.' || /\d/.test(c)) { const m = /^-?(\d*\.?\d+(e-?\d+)?)/.exec(this.t.slice(this.p, this.p + 40)); this.p += m[0].length; return { type: 'nombre', v: parseFloat(m[0]) }; }
		const id = this.ident();
		if (id === 'null' || id === 'void') { if (id === 'void') this.primaire(); return { type: 'nul' }; }
		if (id === 'new') {
			// « new ct(new Mi(r,g,b,a)) » : couleur RGBA littérale.
			const cls = this.ident(); this.attendre('(');
			const args = []; if (this.voir() !== ')') { args.push(this.expression()); while (this.voir() === ',') { this.p++; args.push(this.expression()); } }
			this.attendre(')');
			return { type: 'nouveau', cls, args };
		}
		return { type: 'ident', nom: id, pos: this.p };
	}
}

// Valeur d'une variable minifiée qui n'est pas une couleur enregistrée (objet de défauts partagé…).
function valeurVariable(nom, pos, profondeur) {
	const motif = new RegExp(`[,;{(\\s]${nom.replace(/\$/g, '\\$')}=(?![=>])`, 'g');
	let meilleur = -1;
	for (const m of source.matchAll(motif)) { if (m.index < pos) meilleur = m.index + m[0].length; else break; }
	if (meilleur < 0) throw new Error(`variable ${nom} introuvable`);
	return new Analyseur(source, meilleur).expression();
}

// Arbre JS → arbre de couleur pour un thème (« light » ou « dark »).
function convertir(n, theme, profondeur = 0) {
	if (profondeur > 12) throw new Error('trop de niveaux');
	switch (n.type) {
		case 'nul': return null;
		case 'nombre': return n.v;
		case 'chaine': return n.v.startsWith('#') ? n.v.toLowerCase() : { ref: n.v };
		case 'membre':
			if (n.objet.type === 'ident' && n.objet.nom === classeCouleur && constantes[n.nom]) return constantes[n.nom];
			throw new Error(`membre ${n.nom} non géré`);
		case 'ident': {
			const defs = definitions.get(n.nom);
			if (defs) { let d = null; for (const x of defs) if (x.pos < n.pos) d = x; if (d) return { ref: d.cle }; }
			return convertir(valeurVariable(n.nom, n.pos, profondeur), theme, profondeur + 1);
		}
		case 'objet': {
			const ch = n.champs;
			if ('light' in ch || 'dark' in ch) return ch[theme] ? convertir(ch[theme], theme, profondeur + 1) : null;
			if (ch.op?.type === 'nombre' && ch.op.v === 7) return { op: 'mix', color: convertir(ch.color, theme, profondeur + 1), with: convertir(ch.with, theme, profondeur + 1), ratio: ch.ratio.v };
			throw new Error('objet non géré');
		}
		case 'nouveau': {
			if (n.args.length === 1 && n.args[0].type === 'nouveau') {
				const [r, g, b, a = { v: 1 }] = n.args[0].args.map(x => convertir(x, theme, profondeur + 1)).map(v => (typeof v === 'number' ? { v } : v));
				const h = x => Math.round(x).toString(16).padStart(2, '0');
				return `#${h(r.v)}${h(g.v)}${h(b.v)}${h(a.v * 255)}`;
			}
			throw new Error('« new » non géré');
		}
		case 'appel': {
			// Méthodes de la classe Color : ct.fromHex("#…"), couleur.transparent(f), .darken(f), .lighten(f).
			if (n.fn.type === 'membre') {
				const { objet, nom } = n.fn;
				if (objet.type === 'ident' && objet.nom === classeCouleur && nom === 'fromHex') return convertir(n.args[0], theme, profondeur + 1);
				if (['transparent', 'darken', 'lighten'].includes(nom)) return { op: nom, value: convertir(objet, theme, profondeur + 1), factor: convertir(n.args[0], theme, profondeur + 1) };
				throw new Error(`méthode ${nom} non gérée`);
			}
			const op = n.fn.type === 'ident' ? transformations[n.fn.nom] : undefined;
			if (!op) throw new Error(`appel ${n.fn.nom ?? '?'} non géré`);
			const a = n.args.map(x => convertir(x, theme, profondeur + 1));
			switch (op) {
				case 'darken': case 'lighten': case 'transparent': return { op, value: a[0], factor: a[1] };
				case 'opacity': return { op, value: a[0], opacity: a[1] };
				case 'opaque': return { op, value: a[0], background: a[1] };
				case 'oneOf': return { op, values: a };
				case 'ifDefinedThenElse': return { op, if: n.args[0].type === 'chaine' ? n.args[0].v : a[0]?.ref, then: a[1], else: a[2] };
				case 'lessProminent': return { op, value: a[0], background: a[1], factor: a[2], transparency: a[3] };
			}
		}
	}
	throw new Error(`nœud ${n.type} non géré`);
}

// --- Parcours de tous les enregistrements ----------------------------------------------------

const couleurs = {};
const echecs = [];
const motifAppel = new RegExp(`(?<![\\w$.])${enregistrement}\\("([^"]+)",`, 'g');
for (const m of source.matchAll(motifAppel)) {
	const cle = m[1];
	if (couleurs[cle]) continue;
	try {
		const arbre = new Analyseur(source, m.index + m[0].length).expression();
		couleurs[cle] = { light: convertir(arbre, 'light'), dark: convertir(arbre, 'dark') };
	} catch (e) {
		echecs.push(`${cle} : ${e.message}`);
	}
}

const sortie = { source: 'registre des couleurs de VS Code (registerColor)', versionVSCode, couleurs };
writeFileSync(join(racine, 'scripts', 'defauts-vscode.json'), JSON.stringify(sortie, null, '\t') + '\n');
console.log(`VS Code ${versionVSCode} : ${Object.keys(couleurs).length} couleurs extraites, ${echecs.length} échecs.`);
if (echecs.length) console.log(echecs.slice(0, 40).join('\n'));
