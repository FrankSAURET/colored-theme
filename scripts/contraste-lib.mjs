/**
 * Bibliothèque commune au contrôle et à la correction des contrastes des thèmes.
 *
 * - lecture des thèmes JSONC ;
 * - résolution d'une clé de couleur comme VS Code : valeur du thème, sinon défaut du registre
 *   (`defauts-vscode.json`, extrait par extraire-defauts-vscode.mjs) évalué pour le type du thème ;
 * - liste des paires avant-plan / arrière-plan contrôlées, avec leurs seuils ;
 * - rapport de contraste WCAG 2, transparence comprise (composition sur le fond sous-jacent).
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const racine = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defauts = JSON.parse(readFileSync(join(racine, 'scripts', 'defauts-vscode.json'), 'utf8')).couleurs;

// --- Seuils ----------------------------------------------------------------------------------

/** Seuils par catégorie : min obligatoire ; max seulement pour les textes principaux. */
export const SEUILS = {
	texte: { min: 7 },
	icone: { min: 7 },
	secondaire: { min: 4.5 },	// description, indication de saisie, astuces en ligne : 7 visé, 4,5 toléré
	bordure: { min: 3 },
};
export const MAX_PRINCIPAL = 12;

// --- Lecture des thèmes ----------------------------------------------------------------------

/** Retire commentaires et virgules finales d'un JSONC. */
export function retirerCommentaires(source) {
	let r = '', chaine = false, echap = false, ligne = false, bloc = false;
	for (let i = 0; i < source.length; i++) {
		const c = source[i], s = source[i + 1];
		if (ligne) { if (c === '\n') { ligne = false; r += c; } continue; }
		if (bloc) { if (c === '*' && s === '/') { bloc = false; i++; } continue; }
		if (chaine) { r += c; if (echap) echap = false; else if (c === '\\') echap = true; else if (c === '"') chaine = false; continue; }
		if (c === '"') { chaine = true; r += c; }
		else if (c === '/' && s === '/') { ligne = true; i++; }
		else if (c === '/' && s === '*') { bloc = true; i++; }
		else r += c;
	}
	return r.replace(/,\s*([}\]])/g, '$1');
}

/** Liste des 16 thèmes (chemins absolus), triés. */
export function fichiersThemes() {
	const res = [];
	for (const sous of ['Black', 'Colorful']) {
		const d = join(racine, 'themes', sous);
		for (const f of readdirSync(d)) if (f.endsWith('-color-theme.json')) res.push(join(d, f));
	}
	return res.sort();
}

export function lireTheme(chemin) {
	const texte = readFileSync(chemin, 'utf8');
	const json = JSON.parse(retirerCommentaires(texte));
	return { chemin, texte, nom: json.name, type: json.type === 'dark' ? 'dark' : 'light', colors: json.colors ?? {} };
}

// --- Couleurs : conversions et opérations (mêmes règles que la classe Color de VS Code) -------

const arrondi3 = v => Math.round(v * 1000) / 1000;

export function lireHex(h) {
	if (typeof h !== 'string' || h[0] !== '#') return null;
	let x = h.slice(1);
	if (x.length === 3 || x.length === 4) x = [...x].map(c => c + c).join('');
	if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(x)) return null;
	return { r: parseInt(x.slice(0, 2), 16), g: parseInt(x.slice(2, 4), 16), b: parseInt(x.slice(4, 6), 16), a: x.length === 8 ? arrondi3(parseInt(x.slice(6, 8), 16) / 255) : 1 };
}

export function versHex(c) {
	const h = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
	return `#${h(c.r)}${h(c.g)}${h(c.b)}${c.a < 1 ? h(c.a * 255) : ''}`;
}

export function versHsl({ r, g, b, a }) {
	r /= 255; g /= 255; b /= 255;
	const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
	let h = 0, s = 0;
	if (d > 0) {
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
		h *= 60;
	}
	return { h, s, l, a };
}

export function depuisHsl({ h, s, l, a }) {
	const f = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
	l = Math.max(0, Math.min(1, l));
	if (s === 0) return { r: l * 255, g: l * 255, b: l * 255, a };
	const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q, t = h / 360;
	return { r: Math.round(f(p, q, t + 1 / 3) * 255), g: Math.round(f(p, q, t) * 255), b: Math.round(f(p, q, t - 1 / 3) * 255), a };
}

const assombrir = (c, f) => { const x = versHsl(c); return depuisHsl({ ...x, h: x.h | 0, l: arrondi3(Math.max(0, x.l - x.l * f)) }); };
const eclaircir = (c, f) => { const x = versHsl(c); return depuisHsl({ ...x, h: x.h | 0, l: arrondi3(Math.min(1, x.l + x.l * f)) }); };
const luminanceVSCode = c => luminance(c);

/** Luminance relative WCAG d'une couleur opaque. */
export function luminance({ r, g, b }) {
	const v = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
	return 0.2126 * v(r) + 0.7152 * v(g) + 0.0722 * v(b);
}

/** Compose une couleur (éventuellement transparente) sur un fond opaque. */
export function composer(dessus, dessous) {
	const a = dessus.a;
	return { r: dessus.r * a + dessous.r * (1 - a), g: dessus.g * a + dessous.g * (1 - a), b: dessus.b * a + dessous.b * (1 - a), a: 1 };
}

export function rapport(c1, c2) {
	const l1 = luminance(c1), l2 = luminance(c2);
	return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// --- Résolution des clés comme VS Code -------------------------------------------------------

/**
 * Crée un résolveur pour un thème. `surcharges` remplace des valeurs du thème
 * (utilisé par le correcteur pour essayer une couleur candidate).
 */
export function creerResolveur(theme, surcharges = {}) {
	const memo = new Map();
	const valeurTheme = cle => {
		if (Object.hasOwn(surcharges, cle)) return surcharges[cle];
		const v = theme.colors[cle];
		return typeof v === 'string' ? lireHex(v) : null;
	};
	const definit = cle => valeurTheme(cle) !== null;
	const evaluer = (n, pile) => {
		if (n === null || n === undefined) return null;
		if (typeof n === 'string') return lireHex(n);
		if (n.ref) return obtenir(n.ref, pile);
		const v = () => evaluer(n.value, pile);
		switch (n.op) {
			case 'darken': { const c = v(); return c && assombrir(c, n.factor); }
			case 'lighten': { const c = v(); return c && eclaircir(c, n.factor); }
			case 'transparent': { const c = v(); return c && { ...c, a: arrondi3(c.a * n.factor) }; }
			case 'opacity': { const c = v(); return c && { ...c, a: n.opacity }; }
			case 'opaque': {
				const c = v(), fond = evaluer(n.background, pile);
				if (!c || !fond || c.a === 1 || fond.a !== 1) return c;
				return { r: (fond.r - c.a * (fond.r - c.r)) | 0, g: (fond.g - c.a * (fond.g - c.g)) | 0, b: (fond.b - c.a * (fond.b - c.b)) | 0, a: 1 };
			}
			case 'oneOf': for (const x of n.values) { const c = evaluer(x, pile); if (c) return c; } return null;
			case 'ifDefinedThenElse': return evaluer(definit(n.if) ? n.then : n.else, pile);
			case 'mix': {
				const a = evaluer(n.color, pile) ?? { r: 0, g: 0, b: 0, a: 0 }, b = evaluer(n.with, pile) ?? { r: 0, g: 0, b: 0, a: 0 };
				const m = (x, y) => x + n.ratio * (y - x);
				return { r: m(a.r, b.r) | 0, g: m(a.g, b.g) | 0, b: m(a.b, b.b) | 0, a: m(a.a, b.a) };
			}
			case 'lessProminent': {
				const c = v(); if (!c) return null;
				const fond = evaluer(n.background, pile);
				if (!fond) return { ...c, a: c.a * n.factor * n.transparency };
				const l1 = luminanceVSCode(c), l2 = luminanceVSCode(fond);
				// Plus foncé que le fond → éclairci vers lui, sinon assombri (getLighterColor / getDarkerColor).
				const f = n.factor || 0.5;
				const r = l1 < l2 ? eclaircir(c, f * (l2 - l1) / l2) : l1 > 0 ? assombrir(c, f * (l1 - l2) / l1) : c;
				return { ...r, a: r.a * n.transparency };
			}
		}
		return null;
	};
	function obtenir(cle, pile = new Set()) {
		if (memo.has(cle)) return memo.get(cle);
		if (pile.has(cle)) return null;
		pile.add(cle);
		let c = valeurTheme(cle);
		if (!c && defauts[cle]) c = evaluer(defauts[cle][theme.type], pile);
		pile.delete(cle);
		memo.set(cle, c);
		return c;
	}
	/** Première clé de la chaîne qui donne une couleur (thème ou défaut non nul). */
	function chaine(ch) {
		for (const cle of ch.split('|')) { const c = obtenir(cle); if (c) return { cle, c }; }
		return null;
	}
	return { obtenir, chaine, definit };
}

// --- Paires contrôlées -----------------------------------------------------------------------
//
// [fg, bg, dessous, catégorie, options]
//   fg / bg : chaîne de clés « a|b|c » — la première qui a une valeur l'emporte (héritage CSS).
//   dessous : couches sous un fond transparent, de la plus haute à la plus basse, séparées par « > ».
//   catégorie : texte | icone | secondaire | bordure. Option « p » : texte principal (max 12:1).
//   Option « inv » : la correction peut inverser le sens (texte clair → foncé) avant de toucher au fond.
//   Option « f » : la correction touche d'abord au fond (surlignage, survol) plutôt qu'au texte.

const SB = 'sideBar.background', PB = 'panel.background', EB = 'editor.background';
const FG_SB = 'sideBar.foreground|foreground';
const QI = 'quickInput.background';

const P = [
	// Barre latérale, explorateur, listes
	[FG_SB, SB, '', 'texte', 'p'],
	['sideBarTitle.foreground|' + FG_SB, 'sideBarTitle.background|' + SB, SB, 'texte'],
	['sideBarSectionHeader.foreground|' + FG_SB, 'sideBarSectionHeader.background', SB, 'texte'],
	['icon.foreground', SB, '', 'icone'],
	['icon.foreground', 'toolbar.hoverBackground', SB, 'icone'],
	['icon.foreground', 'toolbar.activeBackground', SB, 'icone'],
	['icon.foreground', 'sideBarSectionHeader.background', SB, 'icone'],
	['list.hoverForeground|' + FG_SB, 'list.hoverBackground', SB, 'texte'],
	['list.activeSelectionForeground|' + FG_SB, 'list.activeSelectionBackground', SB, 'texte'],
	['list.activeSelectionIconForeground|list.activeSelectionForeground|icon.foreground', 'list.activeSelectionBackground', SB, 'icone'],
	['list.inactiveSelectionForeground|' + FG_SB, 'list.inactiveSelectionBackground', SB, 'texte'],
	['list.inactiveSelectionIconForeground|list.inactiveSelectionForeground|icon.foreground', 'list.inactiveSelectionBackground', SB, 'icone'],
	['list.focusForeground|list.activeSelectionForeground|' + FG_SB, 'list.focusBackground|list.activeSelectionBackground', SB, 'texte'],
	['list.highlightForeground', SB, '', 'texte'],
	['list.highlightForeground', 'list.hoverBackground', SB, 'texte'],
	['list.focusHighlightForeground', 'list.activeSelectionBackground', SB, 'texte'],
	['list.errorForeground', SB, '', 'texte'],
	['list.warningForeground', SB, '', 'texte'],
	['list.deemphasizedForeground', SB, '', 'secondaire'],
	['gitDecoration.modifiedResourceForeground', SB, '', 'texte'],
	['gitDecoration.addedResourceForeground', SB, '', 'texte'],
	['gitDecoration.untrackedResourceForeground', SB, '', 'texte'],
	['gitDecoration.deletedResourceForeground', SB, '', 'texte'],
	['gitDecoration.conflictingResourceForeground', SB, '', 'texte'],
	['gitDecoration.ignoredResourceForeground', SB, '', 'secondaire'],
	['descriptionForeground', SB, '', 'secondaire'],
	['errorForeground', SB, '', 'texte'],
	['textLink.foreground', SB, '', 'texte'],
	['textLink.activeForeground', SB, '', 'texte'],
	['textPreformat.foreground', SB, '', 'texte'],
	['textPreformat.foreground', 'textCodeBlock.background', SB, 'texte'],
	['foreground', 'chat.requestBackground', SB, 'texte'],
	['badge.foreground', 'badge.background', SB, 'texte'],
	['sideBar.border|contrastBorder', SB, '', 'bordure'],

	// Barre d'activité
	['activityBar.foreground', 'activityBar.background', '', 'icone'],
	['activityBar.inactiveForeground', 'activityBar.background', '', 'icone'],
	['activityBarBadge.foreground', 'activityBarBadge.background', '', 'texte'],
	['modernActivityBarItem.activeForeground', 'modernActivityBarItem.activeBackground', 'modernActivityBar.background', 'icone'],
	['modernActivityBarItem.hoverForeground', 'modernActivityBarItem.hoverBackground', 'modernActivityBar.background', 'icone'],
	['activityBar.inactiveForeground', 'modernActivityBar.background', '', 'icone', 'f'],
	['activityBar.inactiveForeground', 'modernActivityBar.inactiveBackground', '', 'icone', 'f'],

	// Barre de titre, centre de commande, menus
	['titleBar.activeForeground', 'titleBar.activeBackground', '', 'texte'],
	['titleBar.inactiveForeground', 'titleBar.inactiveBackground', '', 'texte', 'inv'],
	['titleBar.activeForeground', 'toolbar.hoverBackground', 'titleBar.activeBackground', 'icone'],
	['commandCenter.foreground', 'commandCenter.background', 'titleBar.activeBackground', 'texte'],
	['commandCenter.activeForeground', 'commandCenter.activeBackground', 'titleBar.activeBackground', 'texte'],
	['commandCenter.inactiveForeground', 'commandCenter.background', 'titleBar.inactiveBackground', 'texte', 'inv'],
	['menubar.selectionForeground|titleBar.activeForeground', 'menubar.selectionBackground', 'titleBar.activeBackground', 'texte'],
	['menu.foreground', 'menu.background', '', 'texte', 'p'],
	['menu.selectionForeground', 'menu.selectionBackground', 'menu.background', 'texte'],
	['modernUI.shellForeground|titleBar.activeForeground', 'modernUI.shellBackground', '', 'texte'],
	['titleBar.inactiveForeground', 'modernUI.inactiveShellBackground', '', 'texte', 'inv'],

	// Barre d'état
	['statusBar.foreground', 'statusBar.background', '', 'texte'],
	['statusBar.noFolderForeground|statusBar.foreground', 'statusBar.noFolderBackground', '', 'texte'],
	['statusBar.debuggingForeground|statusBar.foreground', 'statusBar.debuggingBackground', '', 'texte'],
	['statusBarItem.hoverForeground', 'statusBarItem.hoverBackground', 'statusBar.background', 'texte'],
	['statusBar.foreground', 'statusBarItem.activeBackground', 'statusBar.background', 'texte'],
	['statusBarItem.remoteForeground', 'statusBarItem.remoteBackground', 'statusBar.background', 'texte'],
	['statusBarItem.remoteHoverForeground|statusBarItem.remoteForeground', 'statusBarItem.remoteHoverBackground', 'statusBarItem.remoteBackground>statusBar.background', 'texte'],
	['statusBarItem.prominentForeground', 'statusBarItem.prominentBackground', 'statusBar.background', 'texte'],
	['statusBarItem.errorForeground', 'statusBarItem.errorBackground', 'statusBar.background', 'texte'],
	['statusBarItem.warningForeground', 'statusBarItem.warningBackground', 'statusBar.background', 'texte'],

	// Onglets, fil d'Ariane, en-tête des groupes
	['tab.activeForeground', 'tab.activeBackground', 'editorGroupHeader.tabsBackground', 'texte'],
	['tab.inactiveForeground', 'tab.inactiveBackground|editorGroupHeader.tabsBackground', 'editorGroupHeader.tabsBackground', 'texte'],
	['tab.unfocusedActiveForeground', 'tab.unfocusedActiveBackground|tab.activeBackground', 'editorGroupHeader.tabsBackground', 'texte'],
	['tab.unfocusedInactiveForeground', 'tab.unfocusedInactiveBackground|tab.inactiveBackground|editorGroupHeader.tabsBackground', 'editorGroupHeader.tabsBackground', 'texte'],
	['tab.hoverForeground|tab.inactiveForeground', 'tab.hoverBackground', 'tab.inactiveBackground|editorGroupHeader.tabsBackground', 'texte'],
	['modernEditorTab.activeForeground', 'modernEditorTab.activeBackground', EB, 'texte'],
	['modernEditorTab.hoverForeground', 'modernEditorTab.hoverBackground', 'editorGroupHeader.tabsBackground', 'texte'],
	['tab.inactiveForeground', 'modernEditorTab.inactiveBackground', 'editorGroupHeader.tabsBackground', 'texte'],
	['modernTab.activeForeground', 'modernTab.activeBackground', SB, 'texte'],
	['modernTab.hoverForeground', 'modernTab.hoverBackground', SB, 'texte'],
	['icon.foreground', 'editorGroupHeader.tabsBackground', '', 'icone'],
	['icon.foreground', 'toolbar.hoverBackground', 'editorGroupHeader.tabsBackground', 'icone'],
	['breadcrumb.foreground', 'breadcrumb.background', EB, 'texte'],
	['breadcrumb.focusForeground', 'breadcrumb.background', EB, 'texte'],
	['breadcrumb.activeSelectionForeground', 'breadcrumb.background', EB, 'texte'],

	// Éditeur
	['editor.foreground', EB, '', 'texte', 'p'],
	['editor.foreground', 'editor.lineHighlightBackground', EB, 'texte'],
	['editor.selectionForeground|editor.foreground', 'editor.selectionBackground', EB, 'texte'],
	['editor.foreground', 'editor.findMatchBackground', EB, 'texte'],
	['editor.foreground', 'editor.findMatchHighlightBackground', EB, 'texte'],
	['editor.foreground', 'editorStickyScroll.background|' + EB, EB, 'texte'],
	['editor.foreground', 'editorStickyScrollHover.background', 'editorStickyScroll.background|' + EB, 'texte'],
	['editorLineNumber.foreground', EB, '', 'secondaire'],
	['editorLineNumber.activeForeground', EB, '', 'texte'],
	['editorCodeLens.foreground', EB, '', 'secondaire'],
	['editorInlayHint.foreground', 'editorInlayHint.background', EB, 'secondaire'],
	['editorLink.activeForeground', EB, '', 'texte'],

	// Composants flottants : suggestions, survol, palette de commandes
	['editorWidget.foreground', 'editorWidget.background', EB, 'texte', 'p'],
	['editorSuggestWidget.foreground', 'editorSuggestWidget.background', EB, 'texte'],
	['editorSuggestWidget.selectedForeground', 'editorSuggestWidget.selectedBackground', 'editorSuggestWidget.background>' + EB, 'texte'],
	['editorSuggestWidget.selectedIconForeground|icon.foreground', 'editorSuggestWidget.selectedBackground', 'editorSuggestWidget.background>' + EB, 'icone'],
	['editorSuggestWidget.highlightForeground', 'editorSuggestWidget.background', EB, 'texte'],
	['editorSuggestWidget.focusHighlightForeground', 'editorSuggestWidget.selectedBackground', 'editorSuggestWidget.background>' + EB, 'texte'],
	['editorHoverWidget.foreground', 'editorHoverWidget.background', EB, 'texte'],
	['quickInput.foreground', QI, EB, 'texte'],
	['quickInputList.focusForeground', 'quickInputList.focusBackground', QI + '>' + EB, 'texte'],
	['quickInputList.focusIconForeground|icon.foreground', 'quickInputList.focusBackground', QI + '>' + EB, 'icone'],
	['quickInputList.focusHighlightForeground', 'quickInputList.focusBackground', QI + '>' + EB, 'texte'],
	['list.hoverForeground|quickInput.foreground', 'list.hoverBackground', QI + '>' + EB, 'texte'],
	['list.highlightForeground', QI, EB, 'texte'],
	['pickerGroup.foreground', QI, EB, 'texte'],
	['keybindingLabel.foreground', 'keybindingLabel.background', QI + '>' + EB, 'texte'],
	['icon.foreground', QI, EB, 'icone'],
	['icon.foreground', 'toolbar.hoverBackground', QI + '>' + EB, 'icone'],
	['peekViewTitleLabel.foreground', 'peekViewTitle.background', EB, 'texte'],
	['peekViewResult.fileForeground', 'peekViewResult.background', EB, 'texte'],
	['peekViewResult.lineForeground', 'peekViewResult.background', EB, 'texte'],
	['peekViewResult.selectionForeground', 'peekViewResult.selectionBackground', 'peekViewResult.background>' + EB, 'texte'],
	['icon.foreground', 'debugToolBar.background', EB, 'icone'],

	// Champs de saisie, listes déroulantes, cases, boutons
	['input.foreground', 'input.background', SB, 'texte', 'p'],
	['input.placeholderForeground', 'input.background', SB, 'secondaire'],
	['inputOption.activeForeground', 'inputOption.activeBackground', 'input.background>' + SB, 'icone'],
	['icon.foreground', 'inputOption.hoverBackground', 'input.background>' + SB, 'icone'],
	['inputOption.activeForeground', 'inputOption.hoverBackground', 'inputOption.activeBackground>input.background>' + SB, 'icone'],
	['inputValidation.errorForeground|input.foreground', 'inputValidation.errorBackground', 'input.background>' + SB, 'texte'],
	['inputValidation.warningForeground|input.foreground', 'inputValidation.warningBackground', 'input.background>' + SB, 'texte'],
	['inputValidation.infoForeground|input.foreground', 'inputValidation.infoBackground', 'input.background>' + SB, 'texte'],
	['dropdown.foreground', 'dropdown.background', SB, 'texte'],
	['dropdown.foreground', 'dropdown.listBackground|dropdown.background', SB, 'texte'],
	['checkbox.foreground', 'checkbox.background', SB, 'icone'],
	['button.foreground', 'button.background', SB, 'texte'],
	['button.foreground', 'button.hoverBackground', SB, 'texte'],
	['button.secondaryForeground', 'button.secondaryBackground', SB, 'texte', 'f'],
	['button.secondaryForeground', 'button.secondaryHoverBackground', SB, 'texte', 'f'],
	['extensionButton.foreground', 'extensionButton.background', EB, 'texte'],
	['extensionButton.prominentForeground', 'extensionButton.prominentBackground', EB, 'texte'],
	['input.border', SB, '', 'bordure'],
	['dropdown.border', SB, '', 'bordure'],
	['checkbox.border', SB, '', 'bordure'],
	['focusBorder', SB, '', 'bordure'],
	['focusBorder', EB, '', 'bordure'],

	// Panneau, terminal, barre d'outils active (moniteur série, sortie…)
	['foreground', PB, '', 'texte', 'p'],
	['panelTitle.activeForeground', PB, '', 'texte'],
	['panelTitle.inactiveForeground', PB, '', 'texte'],
	['panelSectionHeader.foreground|foreground', 'panelSectionHeader.background', PB, 'texte'],
	['icon.foreground', PB, '', 'icone'],
	['icon.foreground', 'toolbar.hoverBackground', PB, 'icone'],
	['icon.foreground', 'toolbar.activeBackground', PB, 'icone'],
	['icon.foreground', 'actionBar.toggledBackground', PB, 'icone'],
	['foreground', 'toolbar.hoverBackground', PB, 'icone'],						// moniteur série : bouton survolé
	['button.foreground', 'button.hoverBackground', PB, 'icone'],				// moniteur série : bouton coché
	['button.foreground', 'button.secondaryHoverBackground', PB, 'icone', 'f'],		// moniteur série : bouton coché survolé
	['terminal.foreground', 'terminal.background|' + PB, PB, 'texte', 'p'],
	['panelTitleBadge.foreground', 'panelTitleBadge.background', PB, 'texte'],

	// Notifications, bannières, paramètres
	['notifications.foreground|editorWidget.foreground', 'notifications.background|editorWidget.background', EB, 'texte'],
	['notificationCenterHeader.foreground|notifications.foreground|editorWidget.foreground', 'notificationCenterHeader.background', 'notifications.background|editorWidget.background>' + EB, 'texte'],
	['notificationLink.foreground', 'notifications.background|editorWidget.background', EB, 'texte'],
	['banner.foreground', 'banner.background', EB, 'texte'],
	['settings.headerForeground', EB, '', 'texte'],
	['settings.textInputForeground', 'settings.textInputBackground', EB, 'texte'],
	['settings.dropdownForeground', 'settings.dropdownBackground', EB, 'texte'],
	['textLink.foreground', EB, '', 'texte'],
	['textLink.activeForeground', EB, '', 'texte'],
	['textPreformat.foreground', EB, '', 'texte'],
	['chat.slashCommandForeground', 'chat.slashCommandBackground', SB, 'texte'],
];

// Fonds de survol / surlignage : on les ajuste avant de toucher au texte qui passe dessus.
const SURLIGNAGES = /^(toolbar\.(hover|active)Background|actionBar\.toggledBackground|inputOption\.hoverBackground|statusBarItem\.(hover|active)Background|editor\.(lineHighlight|selection|findMatch|findMatchHighlight)Background|editorStickyScroll(Hover)?\.background)$/;

export const PAIRES = P.map(([fg, bg, dessous, cat, opt = ''], i) => ({
	id: i, fg, bg, dessous: dessous ? dessous.split('>') : [], cat,
	principal: opt.includes('p'), inverser: opt.includes('inv'),
	fondDabord: opt.includes('f') || SURLIGNAGES.test(bg.split('|')[0]),
}));

/** Calcule une paire : couleurs effectives, rapport, seuils. null si une des clés n'a aucune valeur. */
export function evaluerPaire(res, paire, theme) {
	const fg = res.chaine(paire.fg), bg = res.chaine(paire.bg);
	if (!fg || !bg) return null;
	// Bordure entièrement transparente : absence voulue, rien à mesurer.
	if (paire.cat === 'bordure' && fg.c.a === 0) return null;
	// Pile des fonds, du bas vers le haut ; le fond de base retombe sur l'éditeur puis blanc/noir.
	let fond = theme.type === 'dark' ? { r: 30, g: 30, b: 30, a: 1 } : { r: 255, g: 255, b: 255, a: 1 };
	const ed = res.obtenir(EB); if (ed) fond = composer(ed, fond);
	for (const couche of [...paire.dessous].reverse()) { const c = res.chaine(couche); if (c) fond = composer(c.c, fond); }
	const fondFinal = composer(bg.c, fond);
	const devant = composer(fg.c, fondFinal);
	const r = rapport(devant, fondFinal);
	const min = SEUILS[paire.cat].min, max = paire.principal ? MAX_PRINCIPAL : Infinity;
	// vis : écart entre le fond de la paire et ce qu'il recouvre (survol, sélection visibles ?).
	return { paire, fg, bg, fondFinal, devant, r, vis: rapport(fondFinal, fond), min, max, ok: r >= min - 1e-9, tropFort: r > max + 1e-9 };
}

export function evaluerTheme(theme, surcharges = {}) {
	const res = creerResolveur(theme, surcharges);
	return PAIRES.map(p => evaluerPaire(res, p, theme)).filter(Boolean);
}
