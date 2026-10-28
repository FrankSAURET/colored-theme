# À faire

1. ⬜ Publier `2026.10.0` : `npm run publier`.
2. ⬜ Vérifier à l'écran les 15 thèmes sous modernUI (coque, poignée, onglets), surtout Quietlight, Black et Arduino.
3. ⏳ README : pas de capture du thème Ice (section à ajouter avec une image).

---

# v2026.10.0.4

1. ✅ Préparation de la publication : version publique `2026.10.0`, CHANGELOG daté du 28 octobre 2026.
2. ✅ `buildNumber` `2026.10.0.4`.

---

# v2026.9.1.3

1. ✅ Ice : clés du panneau et du terminal regroupées sous des commentaires.
2. ✅ Ice : terminal sur fond bleu `#164aaa`, texte blanc, curseur jaune, sélection en voile blanc, 16 couleurs ANSI claires (contraste ≥ 4,5:1 sauf `ansiBlack`).
3. ℹ️ Command Center en Modern UI : fond forcé à transparent par VS Code (`.modern-ui .agent-status-pill … !important`), aucune clé de remplacement. Seuls `commandCenter.border` et les couleurs de texte agissent. Contournement : `chat.agentsControl.enabled: false` (non testé).
4. ✅ `buildNumber` `2026.9.1.3`, `.vsix` construit sur demande.

---

# v2026.9.1.2

1. ✅ 30 clés Modern UI ajoutées aux 14 thèmes, calculées depuis les couleurs classiques : coque = `titleBar.activeBackground`, cartes = fond de l'éditeur, barre d'activité = `activityBar.*`, onglets = `tab.*`, poignée et `sash.hoverBorder` = `titleBar.activeForeground` (visible sur la coque). Script ponctuel, non conservé dans le projet.
2. ✅ Ice : `sash.hoverBorder` ajouté, barre de menu (`titleBar.activeBackground`) alignée sur la coque.
3. ✅ `buildNumber` `2026.9.1.2`.
4. ✅ Ice : 15 clés manquantes ajoutées (Command Center, Sticky Scroll, Inlay Hints, Testing, Chat, brackets) — `npm run validate:themes` passe sur les 15 thèmes.
5. ℹ️ Correction de l'analyse v1.4.1 : modernUI SE corrige depuis le thème, via les clés `modernUI.*`, `modernActivityBar*`, `surface.*` (doc Theme Color, section « Modern UI colors »).

---

# v2026.9.1.1 (en cours)

1. ✅ Ajout du thème `ice-color-theme` (copie de Noctis Hibernus, MIT, crédit Liviu Schera dans le JSON et le README).
2. ✅ `buildNumber` `2026.9.1.1` ajouté au manifeste.
3. ⏳ Capture d'écran du thème Ice pour le README.
4. ✅ Ice : clés abandonnées corrigées (`activityBar.dropBackground` → `dropBorder`, `welcomePage.button*` retirées, `editorIndentGuide.*` → `*1`).
5. ℹ️ modernUI actif : `activityBar.foreground` et `activityBar.border` sont aussi ignorés (constaté le 26/10/2026), pas seulement les fonds. Essais de thème à faire avec `workbench.experimental.modernUI: false`.

---

# v2026.9.1 (en cours)

1. ✅ Coloration syntaxique Arduino light/dark alignée sur l'IDE officiel (theme.txt).
2. ✅ Macros `HIGH`/`OUTPUT`/etc. forcées en teal via `semanticTokenColors`.
3. ✅ Trait vertical de l'explorateur : contraste renforcé une nouvelle fois (14 thèmes).
4. ✅ Couleur des liens très fortement contrastée (14 thèmes).
5. ✅ `npm run publier` : [publier.mjs](scripts/publier.mjs) construit un `.vsix` puis l'envoie au Marketplace et à Open VSX. Garde-fou CHANGELOG, `OVSX_PAT` exigé, `--dry-run`. `"private": true` ajouté.
5. ✅ Correction `textPreformat.foreground` codé en dur en vert → aligné sur l'accent de chaque thème.
6. ✅ Bump de version `2026.9.1`.

---

# v2026.8.1 (2026.8.10)

1. ✅ Retrait des 12 clés `welcomePage.button*` dépréciées.
2. ✅ Ajout des couleurs Command Center, Sticky Scroll, guides, Inlay Hints, Testing, Chat et brackets dans les 14 thèmes.
3. ✅ Ajout de la validation JSONC des thèmes via `npm run validate:themes`.
4. ✅ Correction de Quietlight : type `light` manquant.
5. ✅ Bump de version `2026.8.1`.

# v2026.8.0 (2026.8.10)

1. ✅ Ajout de l'initialisation de `.vscode/settings.json` à l'ouverture ou l'ajout d'un dossier workspace.
2. ✅ Ajout du réglage `colored-theme.initializeLocalTheme`, activé par défaut.
3. ✅ Bump de version `2026.8.0`.
4. ✅ Documentation du réglage dans le README.
5. ✅ CHANGELOG : ajout des notes de version et de l'explication CalVer.

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
