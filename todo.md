# À faire

1. ⬜ Publier `2026.8.0` sur le Marketplace.

---

# v2026.8.0 (2026.8.10)

1. ✅ Ajout de l'initialisation de `.vscode/settings.json` à l'ouverture ou l'ajout d'un dossier workspace.
2. ✅ Ajout du réglage `colored-theme.initializeLocalTheme`, activé par défaut.
3. ✅ Bump de version `2026.8.0`.
4. ✅ Documentation du réglage dans le README.

# v1.4.2 (2026.7.20)

1. ✅ Bump 1.4.2 : la 1.4.1 avait été publiée avant la mise à jour du README, la version au Marketplace n'avait donc pas la section modernUI. Republication nécessaire.

# v1.4.1 (2026.7.20)

1. ✅ Bordures `activityBar.border` / `titleBar.border` validées visuellement — conservées.
2. ✅ README : section « Known issue » sur `workbench.experimental.modernUI`, avec la règle CSS en cause et le contournement.
3. ✅ Signalé sur `microsoft/vscode` — pas d'issue créée, le problème était **déjà ouvert** sous [#326445](https://github.com/microsoft/vscode/issues/326445) (« workbench.colorCustomizations stop working after update to V1.130 »). Commentaire technique ajouté avec la règle CSS en cause : [#issuecomment-5019785750](https://github.com/microsoft/vscode/issues/326445#issuecomment-5019785750). Peacock (4M+ utilisateurs) est touché de la même façon.
4. ✅ Remote git corrigé : `huacat.office-theme` → `colored-theme`. Plus de redirection GitHub. (`package.json` pointait déjà sur la bonne URL.)
5. ⚠️ **En 1.130, `modernUI` est activé PAR DÉFAUT** (constaté sur 1.130.0-insider dans #326445). À la sortie stable, tous les utilisateurs verront les barres grises sans avoir rien activé. La section README devient essentielle.

# v1.4.0 (2026.7.20)

1. ✅ Correction `auburn` : `#9d3eoc` → `#9d3e0c`. Le `o` n'est pas hexadécimal, VS Code ignorait silencieusement la couleur — 13 occurrences dans le fichier, tout le thème était touché.
2. ✅ Correction `Arduino-light` : `"type": "default"` → `"light"` (valeur non supportée par VS Code).
3. ✅ Ajout des clés absentes, dérivées des couleurs existantes : `titleBar.inactiveBackground` / `inactiveForeground`, `menu.background` / `foreground`, `menubar.selection*`, `activityBarBadge.*`, `activityBar.inactiveForeground`.
4. ✅ Ajout `activityBar.border` + `titleBar.border` sur les 14 thèmes (commit isolé `5a53840`, annulable seul).
5. ✅ Garde-fou de contraste WCAG sur toutes les couleurs générées : le ratio texte/fond ne descend jamais sous le seuil (3.0 normal, 2.2 pour les états inactifs). Contraste identique à l'état d'origine après modification.
6. ℹ️ `contrastBorder` volontairement non ajouté : réservé aux thèmes haut contraste.
7. ℹ️ **modernUI (VS Code 1.129+)** : la demande initiale était de rendre les thèmes compatibles. Analyse du bundle `workbench.desktop.main.css` — une règle CSS force `background-color: transparent !important` sur `.part.activitybar`, `.part.titlebar` et `.part.statusbar` sous `.floating-panels`. Aucune clé de couleur n'a changé, aucune nouvelle clé n'existe. **Non corrigeable depuis un fichier de thème.** Contournement utilisateur : `workbench.experimental.modernUI: false`.

# v1.3.2 (2026.7.02)

1. ✅ Amélioration mineure du contraste.
