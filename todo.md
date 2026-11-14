# À faire

1. ⬜ Publier `2026.11.0` : `npm run publier` (OVSX_PAT requis).
2. ⬜ Vérifier à l'écran les 15 thèmes sous modernUI (coque, poignée, onglets), surtout Quietlight, Black et Arduino.
3. ⏳ README : pas de capture des thèmes Ice et Pink (section à ajouter avec une image).

---

# v2026.11.0.18

1. ✅ Publication préparée : CHANGELOG `2026.11.0` daté du 14 novembre 2026.
2. ✅ `version` `2026.11.0`, `buildNumber` `2026.11.0.18`.
3. ✅ `2026.10.0` confirmée en ligne sur la place de marché (`vsce show`).
4. ⏳ README anglais : pas de mention des thèmes Ice/Pink ni de la coloration Arduino/Python — traduction sur demande.

---

# v2026.10.0.17

1. ✅ Coloration sémantique activée (`"semanticHighlighting": true`) dans les 16 thèmes ; Quietlight l'avait déjà.
2. ✅ `semanticTokenColors` ajoutés partout, limités aux langages `python`, `cpp`, `c` (sélecteurs `type:langage`) : 32 jetons × 3 langages. Types standard + Pylance (`selfParameter`, `clsParameter`, `module`) + C/C++ (`macro`, `templateType`, `operatorOverload`…). Couleurs relevées sur la coloration TextMate actuelle de chaque thème (couleur, gras, italique) : `macro`, `enumMember`, `variable.readonly` → constante (`LED_PIN` enfin en couleur de constante) ; `parameter` → paramètre ; `selfParameter` → couleur de `self`.
3. ✅ Arduino Light/Dark : l'entrée `"macro"` existante est conservée ; le bloc s'ajoute à la suite.
4. ℹ️ L'activation vaut pour tous les langages : ailleurs qu'en Python/C/C++, VS Code se rabat sur les scopes TextMate équivalents, donc à peu près les mêmes couleurs qu'avant. À surveiller à l'écran (TypeScript, JavaScript).
5. ℹ️ Non vérifiable par script (il faut Pylance / C/C++ en marche) : contrôle à l'écran avec `Developer: Inspect Editor Tokens and Scopes` sur `tests/`.
6. ✅ `buildNumber` `2026.10.0.17`.

---

# v2026.10.0.16

1. ✅ Coloration complète Arduino (C/C++) et Python/MicroPython. Mesure faite avec le moteur TextMate de VS Code (`vscode-textmate` + grammaires `cpp` et `MagicPython` de l'installation) sur les deux exemples : jetons à la couleur par défaut avant → après : colorés 11 thèmes 530 → 0, Black 530 → 0, Arduino Light/Dark 601 → 0, Quietlight 179 → 0, Ice déjà 0 (inchangé).
2. ✅ Bloc `// --- Compléments Arduino (C/C++) et Python / MicroPython ---` en fin de `tokenColors`. Toutes les règles sont préfixées `source.cpp` / `source.c` / `source.python` : aucun effet sur les autres langages. Racine `source.python`/`source.cpp` = couleur des variables (noms nus que la grammaire ne qualifie pas).
3. ✅ Couleurs reprises de la palette de chaque thème (fonctions, types, constantes, ponctuation…). Teintes nouvelles seulement là où le thème n'avait rien : clairs variables `#375623`, attributs `#548235`, `self`/`this`/noms magiques `#c00000` italique ; Black `#9cdcfe`, `#a9d18e`, `#ff7c80` (ses variables `#ffffff` étaient indiscernables du défaut `#f6f6f6`).
4. ✅ Filtre : une règle (ou un scope) qui changeait la couleur d'un jeton déjà coloré a été écartée. Contrôle final : 0 jeton déjà coloré modifié.
5. ℹ️ Limite TextMate : `LED_PIN` (MAJUSCULES avec `_`) reste en couleur variable — la grammaire C++ le classe `snake-case` comme `ma_variable`. `HIGH`, `OUTPUT`, `A0` (MAJUSCULES sans `_`) prennent la couleur des constantes.
6. ℹ️ Coloration sémantique (Pylance, C/C++) non activée dans les thèmes : inchangé.
7. ✅ `tests/exemple-arduino.ino` et `tests/exemple-micropython.py` ; `tests/**` exclu du `.vsix`.
8. ✅ CHANGELOG : section `2026.10.1` renommée `2026.11.0` (mois courant = novembre).
9. ✅ `buildNumber` `2026.10.0.16`.

---

# v2026.10.0.15

1. ✅ Ice : traits des tableaux de Claude Code invisibles. Leur CSS lit `inlineChatInput.border` → `input.border` → `widget.border` ; Ice avait `input.border` `#e0eff1` (quasi blanc). Ajout de `inlineChatInput.border` `#8fb5bb`, `input.border` laissé tel quel.
2. ℹ️ Autres thèmes non concernés : `input.border` `#ababab` ou valeur par défaut `#7f7f7f66`, visibles.
3. ✅ `buildNumber` `2026.10.0.15`.

---

# v2026.10.0.14

1. ✅ Zone de recherche (Command Center) façon Ice sur les 11 thèmes colorés clairs : `commandCenter.background` = 12 % de la bordure + 88 % de blanc, `commandCenter.foreground` foncé jusqu'à 7:1 minimum (Yellow `#d6ab00` → `#675200`, Amber `#675300`), `inactiveForeground` ≥ 4,5:1 (déjà le cas partout).
2. ✅ Amber et Yellow : bordures du Command Center `#ffcb00` → `#a68500` (2,1:1 sur la barre au lieu de 1,1).
3. ✅ Arduino Dark : fond du Command Center `#171e21` (identique à la barre) → `#163235`, teinté sarcelle.
4. ℹ️ Black, Arduino Light, Quietlight et Ice inchangés : fond déjà distinct de la barre et texte contrasté.
5. ✅ `buildNumber` `2026.10.0.14`.

---

# v2026.10.0.13

1. ✅ Pink : retouches de Frank enregistrées (barres `#ffa7c4`, barre d'état `#fd7fb6`, fond du terminal `#f2e7ed`).
2. ✅ Pink : terminal accordé au fond pâle. Texte `#3a0a24`, 16 couleurs ANSI foncées dans leur teinte jusqu'à 4,5:1 minimum (`ansiWhite`/`ansiBrightWhite` en gris lisible), curseur `#c2185b`, sélection `#d81b6033`.
3. ℹ️ Les variantes « bright » sont presque identiques aux normales : sur fond pâle, la marge entre lisible et clair est étroite.
4. ✅ `buildNumber` `2026.10.0.13`.

---

# v2026.10.0.12

1. ✅ Nouveau thème `pink-color-theme.json` (« Colored Theme (Pink) »), création originale : Light Pink (`mgwg.light-pink-theme`) n'a aucune licence, donc rien n'en est repris. Structure copiée de Fushia, palette rose tendre : fond des barres `#f48fb1`, accent `#c2185b`, texte sur barres `#6d0b3f` (contraste 5,3), bouton blanc sur accent (5,9).
2. ✅ Fonds inactifs et textes inactifs calculés avec les mêmes règles que les autres thèmes clairs (`#fbd8e4`, titre inactif `#f171b5`).
3. ✅ `buildNumber` `2026.10.0.12`.

---

# v2026.10.0.11

1. ✅ `activityBar.inactiveForeground` remis partout à sa valeur d'origine (celle de v2026.10.0.6), à la demande de Frank. `titleBar.inactiveForeground` garde la version éclaircie.
2. ✅ `buildNumber` `2026.10.0.11`.

---

# v2026.10.0.10

1. ✅ Correction de v2026.10.0.9 (Frank voulait l'inverse) : `titleBar.inactiveForeground` et `activityBar.inactiveForeground` = teinte et saturation de l'équivalent actif, luminosité HSL rapprochée du blanc de 60 % (`l + (1 − l) × 0,6`). Effet pâle : contraste 1,1 à 2,5 sur le fond inactif.
2. ✅ `buildNumber` `2026.10.0.10`.

---

# v2026.10.0.9

1. ✅ 13 thèmes clairs : `titleBar.inactiveForeground` et `activityBar.inactiveForeground` = teinte et saturation de leur équivalent actif (`titleBar.activeForeground`, `activityBar.foreground`), luminosité HSL divisée par 2. Les blancs `#ededed`/`#f3f3f3` deviennent gris `#777777`/`#7a7a7a`.
2. ℹ️ `activityBar.inactiveForeground` colore aussi les icônes non sélectionnées de la fenêtre active.
3. ✅ `buildNumber` `2026.10.0.9`.

---

# v2026.10.0.8

1. ✅ Lot v2026.10.0.7 annulé à la demande de Frank : `titleBar.inactiveForeground` et `activityBar.inactiveForeground` reviennent aux valeurs de v2026.10.0.6. Modifications de Frank sur yellow (`#ffee00`) conservées.
2. ✅ `buildNumber` `2026.10.0.8`.

---

# v2026.10.0.7

1. ✅ 13 thèmes clairs : `titleBar.inactiveForeground` estompé (teinte du thème, saturation × 0,6, contraste 2:1 sur le fond inactif). Choix de Frank : pâle plutôt que lisible.
2. ✅ `activityBar.inactiveForeground` : même teinte, contraste ≥ 2:1 à la fois sur la barre active et sur la barre inactive pastel. Les icônes non sélectionnées deviennent foncées sur auburn, cognac, fushia, green malachite, peacock et red (au lieu de `#ededed`).
3. ✅ `buildNumber` `2026.10.0.7`.

---

# v2026.10.0.6

1. ✅ 13 thèmes clairs : `titleBar.inactiveBackground`, `modernUI.inactiveShellBackground`, `modernActivityBar.inactiveBackground` = `titleBar.activeBackground` mélangé à 65 % de blanc (même teinte, pastel). Script ponctuel, non conservé.
2. ✅ `titleBar.inactiveForeground` et `commandCenter.inactiveForeground` foncés (même teinte) jusqu'à un contraste ≥ 4,5:1 sur le nouveau fond.
3. ℹ️ Thèmes sombres (Black, Arduino dark) non modifiés : un fond inactif clair y casserait le thème.
4. ✅ `buildNumber` `2026.10.0.6`.

---

# v2026.10.0.5

1. ✅ `npm run package` (`scripts/paquet.mjs`) : construit `coloredtheme-<buildNumber>.vsix` et l'installe dans VS Code (`--no-install` pour construire seulement).
2. ✅ `buildNumber` `2026.10.0.5`.

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
