/**
 * Construit le .vsix de développement et l'installe dans VS Code.
 * Usage : npm run package
 *         npm run package -- --no-install   (construit seulement)
 *
 * Le fichier porte le buildNumber (version interne à 4 segments) : chaque lot a son propre .vsix.
 * La publication, elle, passe par « npm run publier ».
 */

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const racine = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifeste = JSON.parse(readFileSync(join(racine, 'package.json'), 'utf8'));
const installer = !process.argv.slice(2).includes('--no-install');

// Nom relatif : le chemin du projet contient des espaces, que le shell Windows découperait.
const fichier = `${manifeste.name}-${manifeste.buildNumber ?? manifeste.version}.vsix`;

// npx et code sont des .cmd sous Windows : Node refuse de les lancer sans « shell: true ».
const lancer = (etape, commande) => {
	console.log(`\n=== ${etape}\n> ${commande.join(' ')}`);
	const r = spawnSync(commande[0], commande.slice(1), { cwd: racine, stdio: 'inherit', shell: true });
	if (r.status !== 0) {
		console.error(`\nErreur : « ${etape} » a échoué (code ${r.status ?? 'inconnu'}).`);
		process.exit(1);
	}
};

lancer('Construction du paquet', ['npx', 'vsce', 'package', '--out', fichier]);

if (installer) {
	lancer('Installation', ['code', '--install-extension', fichier, '--force']);
	console.log(`\n${fichier} installé. Recharger la fenêtre (Developer: Reload Window).`);
} else {
	console.log(`\n${fichier} construit.`);
}
