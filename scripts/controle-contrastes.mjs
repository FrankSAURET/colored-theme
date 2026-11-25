/**
 * Contrôle des contrastes WCAG des 16 thèmes.
 *
 * Usage : node scripts/controle-contrastes.mjs [--tout] [--theme <morceau du nom de fichier>]
 *   --tout : liste aussi les paires conformes.
 *
 * Seuils (contraste-lib.mjs) : texte et icônes ≥ 7:1, secondaires ≥ 4,5:1, bordures ≥ 3:1,
 * textes principaux ≤ 12:1. Code de sortie 1 si une paire passe sous son minimum.
 * Le dépassement de 12:1 est signalé sans faire échouer le contrôle.
 */

import { relative } from 'node:path';
import { fichiersThemes, lireTheme, evaluerTheme, versHex, racine } from './contraste-lib.mjs';

const args = process.argv.slice(2);
const tout = args.includes('--tout');
const filtre = args.includes('--theme') ? args[args.indexOf('--theme') + 1] : null;

const fmt = r => r.toFixed(2).padStart(5);
let totalEchecs = 0, totalForts = 0, totalPaires = 0;

for (const chemin of fichiersThemes()) {
	if (filtre && !chemin.toLowerCase().includes(filtre.toLowerCase())) continue;
	const theme = lireTheme(chemin);
	const res = evaluerTheme(theme);
	const echecs = res.filter(x => !x.ok), forts = res.filter(x => x.ok && x.tropFort);
	totalEchecs += echecs.length; totalForts += forts.length; totalPaires += res.length;
	console.log(`\n${theme.nom} (${relative(racine, chemin).replace(/\\/g, '/')}) : ${res.length} paires, ${echecs.length} sous le minimum, ${forts.length} au-dessus de 12`);
	const lignes = tout ? res : [...echecs, ...forts];
	for (const x of lignes.sort((a, b) => a.r / a.min - b.r / b.min)) {
		const etat = !x.ok ? 'ÉCHEC' : x.tropFort ? 'FORT ' : 'ok   ';
		const dessous = x.paire.dessous.length ? ` sur ${x.paire.dessous.map(c => c.split('|')[0]).join(' > ')}` : '';
		console.log(`  ${etat} ${fmt(x.r)} (min ${x.min}) [${x.paire.cat}] ${x.fg.cle} ${versHex(x.devant)} / ${x.bg.cle} ${versHex(x.fondFinal)}${dessous}`);
	}
}

console.log(`\nTotal : ${totalPaires} paires, ${totalEchecs} sous le minimum, ${totalForts} textes principaux au-dessus de 12:1.`);
process.exit(totalEchecs > 0 ? 1 : 0);
