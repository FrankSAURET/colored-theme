/**
 * Correcteur des contrastes des thèmes (outil ponctuel, à relancer si un thème change).
 *
 * Usage : node scripts/corriger-contrastes.mjs [--ecrire] [--theme <morceau du nom>]
 *   sans --ecrire : simulation, affiche les modifications prévues.
 *
 * Méthode, thème par thème :
 * 1. règle préalable : boutons secondaires dérivés des boutons principaux (sinon le défaut de
 *    VS Code, `lighten(list.hoverBackground)`, met un fond presque blanc sous `button.foreground`
 *    dans le moniteur série : icône cochée invisible au survol) ;
 * 2. tant qu'une paire est hors seuil : on modifie UNE clé (avant-plan, sinon fond), en ne
 *    changeant que la luminosité HSL (teinte et saturation conservées), au plus près de la valeur
 *    d'origine. La somme des déficits sous le minimum doit baisser strictement, ce qui garantit
 *    la fin de la boucle. Le dépassement de 12:1 (textes principaux) ne se corrige que s'il ne
 *    crée aucun déficit ailleurs.
 * Les clés modifiées sont remplacées sur place ; les clés absentes sont ajoutées en tête de
 * `colors`, sous un commentaire.
 */

import { writeFileSync } from 'node:fs';
import { relative } from 'node:path';
import { fichiersThemes, lireTheme, creerResolveur, evaluerTheme, versHsl, depuisHsl, versHex, luminance, racine } from './contraste-lib.mjs';

const args = process.argv.slice(2);
const ecrire = args.includes('--ecrire');
const filtre = args.includes('--theme') ? args[args.indexOf('--theme') + 1] : null;

const MARGE_MIN = 0.03, MARGE_MAX = 0.05;
// Surfaces de base : jamais modifiées (tout le thème repose dessus).
const INTOUCHABLES = new Set(['editor.background', 'sideBar.background', 'panel.background', 'terminal.background']);
const PRIORITE = { texte: 0, icone: 0, secondaire: 1, bordure: 2 };
// Écart maximal d'un fond par rapport à sa valeur d'origine (luminosité HSL, opacité en hausse).
const ECART_FOND_L = 0.3, ECART_FOND_L_LARGE = 0.55, ECART_FOND_A = 0.35;

// Déficit (sous le minimum) et excès (au-dessus de 12) d'un résultat de paire.
const deficit = x => Math.max(0, x.min + MARGE_MIN - x.r);
const exces = x => (x.max === Infinity ? 0 : Math.max(0, x.r - (x.max - MARGE_MAX)));

// Garde-fou : un fond posé sur un autre (survol, sélection, résultat de recherche) doit rester
// visible. Plancher = min(écart d'origine - VIS_TOL, VIS_MIN) ; aucune modification ne doit
// faire passer un fond sous son plancher (contrainte dure dans optimiser).
const VIS_MIN = 1.15, VIS_TOL = 0.08, POIDS_VIS = 1;
// Seuls les calques d'état comptent (survol, sélection, focus, recherche…), pas les pastilles
// colorées de la barre d'état (avertissement, distant…) qui portent leur propre texte.
const CALQUE_ETAT = /hover|active|selection|focus|toggled|highlight|findMatch|stickyScroll/i;
let planchers = new Map();
const perteVis = x => { const p = planchers.get(x.paire.id); return p ? Math.max(0, p - x.vis) * POIDS_VIS : 0; };

function bilan(theme, surch) {
	const res = evaluerTheme(theme, surch);
	let dur = 0, doux = 0, vis = 0;
	for (const x of res) { dur += deficit(x); doux += exces(x); vis += perteVis(x); }
	return { res, dur, doux, vis };
}

// Teinte et saturation d'origine de chaque clé : un passage par le noir ne doit pas les perdre.
let teintes = new Map();
/** Couleur de même teinte/saturation (celles d'origine), luminosité l, opacité a. */
const varier = (cle, c0, l, a) => { const h = teintes.get(cle) ?? versHsl(c0); const c = depuisHsl({ h: h.h, s: h.s, l }); for (const k of ['r', 'g', 'b']) c[k] = Math.round(c[k]); c.a = Math.round(a * 255) / 255; return c; };
// Arrondi à l'entier : la simulation doit voir exactement la couleur écrite en hexadécimal.

/**
 * Cherche la luminosité (et l'opacité, pour une couleur transparente) de `cle`.
 * D'abord en mode sobre : régler la paire visée sans aggraver aucune autre, au plus près de
 * la valeur actuelle (évite de foncer une barre bien au-delà du besoin). Si ce mode ne fait
 * pas progresser la paire, on minimise (déficit total, excès total, écart).
 * `sens` : +1 si la couleur doit rester plus claire que `reference`, -1 plus foncée, 0 libre.
 */
function optimiser(theme, surch, cle, c0, sens, reference, opaque, idPaire) {
	const l0 = versHsl(c0).l, a0 = c0.a;
	const lumRef = luminance(reference);
	const alphas = opaque ? [1] : a0 === 1 ? [1] : [...new Set([a0, ...Array.from({ length: 19 }, (_, i) => (i + 1) / 20), 1])];
	const fondBorne = /background/i.test(cle);
	// Fond hérité du défaut de VS Code, ou fond « fenêtre inactive » : marge plus large.
	const ecartL = theme.colors[cle] === undefined || /\.inactiveBackground$/.test(cle) ? ECART_FOND_L_LARGE : ECART_FOND_L;
	const aOrig = creerResolveur(theme).obtenir(cle)?.a ?? a0;
	const b0 = bilan(theme, surch);
	const visAvant = b0.vis;
	const x0 = b0.res.find(y => y.paire.id === idPaire);
	const cible0 = x0 ? deficit(x0) + exces(x0) : 0;
	const autres0 = b0.dur + b0.doux - cible0;
	const evaluer = (l, a) => {
		const c = varier(cle, c0, l, a);
		const lum = luminance(c);
		if (sens > 0 && lum < lumRef) return null;
		if (sens < 0 && lum > lumRef) return null;
		// Couleur franche : ni noir ni blanc si elle ne l'était pas (l'identité du thème reste).
		const o = teintes.get(cle);
		if (fondBorne && o && o.s > 0.2 && (l < Math.min(o.l, 0.12) || l > Math.max(o.l, 0.92))) return null;
		// Fond : écart borné (pas de bannière passée au blanc ni de barre inversée).
		if (fondBorne && o && (Math.abs(l - o.l) > ecartL || a - aOrig > ECART_FOND_A)) return null;
		const b = bilan(theme, { ...surch, [cle]: c });
		if (b.vis > visAvant + 1e-9) return null;
		const cible = b.res.find(y => y.paire.id === idPaire);
		const cv = cible ? deficit(cible) + exces(cible) : 0;
		return { c, l, a, dur: b.dur, doux: b.doux, cible: cv, sobre: b.dur + b.doux - cv <= autres0 + 1e-6, ecart: Math.abs(l - l0) + Math.abs(a - a0) };
	};
	const total = (p, q) => {
		if (!p) return q; if (!q) return p;
		if (Math.abs(p.dur - q.dur) > 1e-6) return p.dur < q.dur ? p : q;
		if (Math.abs(p.doux - q.doux) > 1e-6) return p.doux < q.doux ? p : q;
		return p.ecart <= q.ecart ? p : q;
	};
	const sobre = (p, q) => {
		if (p && !p.sobre) p = null; if (q && !q.sobre) q = null;
		if (!p) return q; if (!q) return p;
		if (Math.abs(p.cible - q.cible) > 1e-6) return p.cible < q.cible ? p : q;
		return p.ecart <= q.ecart ? p : q;
	};
	const pas = alphas.length > 1 ? 50 : 100;
	const grille = [];
	for (const a of alphas) for (let i = 0; i <= pas; i++) grille.push(evaluer(i / pas, a));
	const chercher = meilleur => {
		let best = null;
		for (const g of grille) best = meilleur(best, g);
		if (!best) return null;
		const { l: lc, a: ac } = best;
		for (let d = -0.02; d <= 0.02; d += 0.0005) { const l = lc + d; if (l >= 0 && l <= 1) best = meilleur(best, evaluer(l, ac)); }
		if (alphas.length > 1) for (let d = -0.05; d <= 0.05; d += 0.005) { const a = ac + d; if (a > 0 && a <= 1) best = meilleur(best, evaluer(best.l, a)); }
		return best;
	};
	const s = chercher(sobre);
	if (s && s.cible < cible0 - 1e-4) return s;
	return chercher(total);
}

function corrigerTheme(theme) {
	const surch = {};
	const journal = [];
	const res0 = creerResolveur(theme);
	teintes = new Map();
	planchers = new Map();

	// 1. Boutons secondaires : même teinte que les boutons principaux, saturation réduite.
	if (!theme.colors['button.secondaryHoverBackground']) {
		const desat = (c, k) => { const h = versHsl(c); const x = depuisHsl({ ...h, s: h.s * k }); x.a = 1; return x; };
		surch['button.secondaryBackground'] = desat(res0.obtenir('button.background'), 0.4);
		surch['button.secondaryHoverBackground'] = desat(res0.obtenir('button.hoverBackground'), 0.4);
		surch['button.secondaryForeground'] = { ...res0.obtenir('button.foreground') };
		journal.push('règle : boutons secondaires dérivés des boutons principaux');
	}

	// Teintes des clés posées par la règle : celles de la règle, pas celles du défaut de VS Code.
	for (const [k, c] of Object.entries(surch)) teintes.set(k, versHsl(c));

	// Planchers de visibilité, mesurés après la règle des boutons secondaires.
	for (const x of evaluerTheme(theme, surch)) {
		if ((x.paire.dessous.length || x.paire.fondDabord) && CALQUE_ETAT.test(x.paire.bg.split('|')[0]) && x.vis - VIS_TOL > 1.0001) planchers.set(x.paire.id, Math.min(x.vis - VIS_TOL, VIS_MIN));
	}

	// 2. Boucle de correction.
	boucle(theme, surch, journal, res0);

	// 3. Textes encore au-dessus de 12:1 : on adoucit le texte d'office, puis on relance la boucle
	//    sans toucher à ce texte (elle éclaircit les surlignages qui le bloquaient). Adopté
	//    seulement si aucun déficit n'apparaît.
	for (const x of bilan(theme, surch).res.filter(y => exces(y) > 0)) {
		const b = bilan(theme, surch);
		const y = b.res.find(z => z.paire.id === x.paire.id);
		if (!y || exces(y) === 0) continue;
		const cle = x.paire.fg.split('|')[0];
		const c0 = creerResolveur(theme, surch).obtenir(cle);
		if (!c0) continue;
		if (!teintes.has(cle)) teintes.set(cle, versHsl(res0.obtenir(cle) ?? c0));
		const sens = luminance(y.devant) >= luminance(y.fondFinal) ? 1 : -1;
		const l0 = versHsl(c0).l;
		let doux = null;
		for (let i = 0; i <= 1000 && !doux; i++) {
			const l = l0 - sens * i / 1000;
			if (l < 0 || l > 1) break;
			const c = varier(cle, c0, l, c0.a);
			const z = evaluerTheme(theme, { ...surch, [cle]: c }).find(w => w.paire.id === x.paire.id);
			if (z && exces(z) === 0) doux = c;
		}
		if (!doux) continue;
		const essai = { ...surch, [cle]: doux };
		const j2 = [`${cle} ${versHex(c0)} → ${versHex(doux)}  (${cle} / ${x.paire.bg.split('|')[0]} ${y.r.toFixed(2)}, adoucissement)`];
		boucle(theme, essai, j2, res0, new Set([cle]));
		const b2 = bilan(theme, essai);
		if (b2.dur <= b.dur + 1e-9 && b2.vis <= b.vis + 1e-9 && b2.doux < b.doux - 1e-4) {
			for (const k of Object.keys(surch)) delete surch[k];
			Object.assign(surch, essai);
			journal.push(...j2);
		}
	}
	return { surch, journal };
}

/** Boucle de correction : une clé modifiée par tour ; `gelees` = clés à ne pas toucher. */
function boucle(theme, surch, journal, res0, gelees = new Set()) {
	const bloquees = new Set();
	for (let tour = 0; tour < 600; tour++) {
		const b = bilan(theme, surch);
		const fautes = b.res.filter(x => !bloquees.has(x.paire.id) && (deficit(x) > 0 || exces(x) > 0))
			.sort((p, q) => (deficit(q) > 0) - (deficit(p) > 0) || PRIORITE[p.paire.cat] - PRIORITE[q.paire.cat] || p.paire.dessous.length - q.paire.dessous.length || (p.r / p.min) - (q.r / q.min));
		if (!fautes.length) break;
		const x = fautes[0];
		const dur = deficit(x) > 0;
		const res = creerResolveur(theme, surch);
		const cleFg = x.paire.fg.split('|')[0], cleBg = x.paire.bg.split('|')[0];
		const cFg = res.obtenir(cleFg) ?? x.fg.c, cBg = res.obtenir(cleBg) ?? x.bg.c;
		// Luminances presque égales : le sens d'origine ne veut rien dire, on laisse libre.
		const fgPlusClair = x.r < 1.6 ? 0 : luminance(x.devant) >= luminance(x.fondFinal) ? 1 : -1;
		const ciblePaire = deficit(x) + exces(x);
		for (const [k, c] of [[cleFg, cFg], [cleBg, cBg]]) if (!teintes.has(k) && c) teintes.set(k, versHsl(res0.obtenir(k) ?? c));

		// Stratégies : avant-plan même sens, fond même sens, avant-plan inversé (ordre ajusté par paire).
		const avantPlan = [
			{ cle: cleFg, c0: cFg, sens: fgPlusClair, ref: x.fondFinal, opaque: false },
			{ cle: cleFg, c0: cFg, sens: fgPlusClair, ref: x.fondFinal, opaque: true },
		];
		const fond = [
			{ cle: cleBg, c0: cBg, sens: -fgPlusClair, ref: x.devant, opaque: false },
			{ cle: cleBg, c0: cBg, sens: -fgPlusClair, ref: x.devant, opaque: true },
		];
		// Dernier recours : la surface sous le calque (ex. barre de titre sous le survol de la barre d'outils).
		const cleDessous = x.paire.dessous[0]?.split('|')[0];
		const cDessous = cleDessous && cleDessous !== 'editor.background' ? res.obtenir(cleDessous) : null;
		if (cDessous && !teintes.has(cleDessous)) teintes.set(cleDessous, versHsl(res0.obtenir(cleDessous) ?? cDessous));
		const dessous = cDessous && dur ? [{ cle: cleDessous, c0: cDessous, sens: -fgPlusClair, ref: x.devant, opaque: false }] : [];
		const inverse = fgPlusClair ? [{ cle: cleFg, c0: cFg, sens: -fgPlusClair, ref: x.fondFinal, opaque: true }] : [];
		let strategies;
		if (!dur || x.paire.cat === 'bordure') strategies = avantPlan;
		else if (x.paire.inverser) strategies = [...avantPlan, ...inverse, ...fond];
		else if (x.paire.fondDabord) strategies = [...fond, ...avantPlan, ...inverse];
		else strategies = [...avantPlan, ...fond, ...inverse];
		if (x.paire.cat !== 'bordure') strategies.push(...dessous);
		// Une couleur déjà opaque n'a pas besoin de sa variante « opaque ».
		strategies = strategies.filter(s => !gelees.has(s.cle) && !INTOUCHABLES.has(s.cle) && !(s.opaque && s.c0.a === 1 && strategies.some(t => t !== s && t.cle === s.cle && !t.opaque && t.sens === s.sens)));

		let retenu = null;
		for (const s of strategies) {
			const r = optimiser(theme, surch, s.cle, s.c0, s.sens, s.ref, s.opaque, x.paire.id);
			if (!r) continue;
			const progres = dur ? r.dur < b.dur - 1e-4 && r.cible < ciblePaire - 1e-4 : (r.dur <= b.dur + 1e-9 && r.doux < b.doux - 1e-4);
			if (!progres) continue;
			if (r.cible === 0) { retenu = { s, r }; break; }
			if (x.paire.fondDabord && s.cle === cleBg && !retenu) { retenu = { s, r, partiel: true }; break; }
			if (!retenu || r.cible < retenu.r.cible) retenu = { s, r, partiel: true };
		}
		if (!retenu) { bloquees.add(x.paire.id); continue; }
		const avant = versHex(retenu.s.c0), apres = versHex(retenu.r.c);
		surch[retenu.s.cle] = retenu.r.c;
		journal.push(`${retenu.s.cle} ${avant} → ${apres}  (${x.paire.fg.split('|')[0]} / ${x.paire.bg.split('|')[0]} ${x.r.toFixed(2)}${retenu.partiel ? ', partiel' : ''})`);
	}
}

// --- Écriture dans le fichier JSONC ----------------------------------------------------------

/** Bornes [début, fin] du bloc `"colors": { … }` (chaînes et commentaires respectés). */
function blocColors(texte) {
	const debut = texte.indexOf('{', texte.search(/"colors"\s*:/));
	let prof = 0, chaine = false, echap = false;
	for (let i = debut; i < texte.length; i++) {
		const c = texte[i];
		if (chaine) { if (echap) echap = false; else if (c === '\\') echap = true; else if (c === '"') chaine = false; continue; }
		if (c === '"') chaine = true;
		else if (c === '/' && texte[i + 1] === '/') { i = texte.indexOf('\n', i); if (i < 0) break; }
		else if (c === '{') prof++;
		else if (c === '}' && --prof === 0) return [debut, i];
	}
	throw new Error('bloc colors non fermé');
}

function ecrireTheme(theme, surch) {
	let texte = theme.texte;
	const fin = texte.includes('\r\n') ? '\r\n' : '\n';
	const [d, f] = blocColors(texte);
	let bloc = texte.slice(d, f);
	const ajouts = [];
	for (const [cle, c] of Object.entries(surch)) {
		const hex = versHex(c);
		const echappe = cle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const motif = new RegExp(`("${echappe}"\\s*:\\s*)"[^"]*"`, 'g');
		let trouve = false;
		bloc = bloc.split(fin).map(l => (l.trim().startsWith('//') ? l : l.replace(motif, (m, p) => { trouve = true; return `${p}"${hex}"`; }))).join(fin);
		if (!trouve) ajouts.push([cle, hex]);
	}
	if (ajouts.length) {
		const indent = /\{\s*?\r?\n([ \t]*)/.exec(bloc)?.[1] ?? '    ';
		const lignes = [`${indent}// Contrastes 7:1 à 12:1 — clés ajoutées par scripts/corriger-contrastes.mjs`, ...ajouts.sort().map(([k, v]) => `${indent}"${k}": "${v}",`)];
		const premiereLigne = bloc.indexOf(fin) + fin.length;
		bloc = bloc.slice(0, premiereLigne) + lignes.join(fin) + fin + bloc.slice(premiereLigne);
	}
	texte = texte.slice(0, d) + bloc + texte.slice(f);
	writeFileSync(theme.chemin, texte);
}

// --- Programme principal ---------------------------------------------------------------------

for (const chemin of fichiersThemes()) {
	if (filtre && !chemin.toLowerCase().includes(filtre.toLowerCase())) continue;
	const theme = lireTheme(chemin);
	const avant = evaluerTheme(theme);
	const { surch, journal } = corrigerTheme(theme);
	const apres = evaluerTheme(theme, surch);
	const n = l => l.filter(x => !x.ok).length, forts = l => l.filter(x => x.ok && x.tropFort).length;
	console.log(`\n=== ${theme.nom} (${relative(racine, chemin).replace(/\\/g, '/')}) : sous le minimum ${n(avant)} → ${n(apres)}, au-dessus de 12 ${forts(avant)} → ${forts(apres)}, ${Object.keys(surch).length} clés modifiées`);
	for (const l of journal) console.log('  ' + l);
	for (const x of apres.filter(y => !y.ok)) console.log(`  RESTE ${x.r.toFixed(2)} (min ${x.min}) ${x.fg.cle} / ${x.bg.cle}`);
	for (const x of apres.filter(y => y.ok && y.tropFort)) console.log(`  FORT ${x.r.toFixed(2)} ${x.fg.cle} / ${x.bg.cle}`);
	if (ecrire) ecrireTheme(theme, surch);
}
