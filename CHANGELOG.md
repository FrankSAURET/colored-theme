# Change Log
## 2026.8.0 (2026.8.10)
- Add automatic local theme initialization: when a folder is opened or added to a workspace, the global `workbench.colorTheme` is copied to `.vscode/settings.json` if no local value exists.
- Add the `colored-theme.initializeLocalTheme` setting, enabled by default, to disable local theme initialization.
- Switch versioning to CalVer (`year.month.increment`) so releases are ordered by their release date. The increment resets to `0` each month.

## 1.4.3 (2026.7.21)
- add property focusBorder to all but quietlight.

## 1.4.2 (2026.7.20)
- Document the VS Code 1.129+ `workbench.experimental.modernUI` issue in the README: the workbench forces the activity bar, title bar and status bar to transparent, and no color theme can override it. Enabled by default from 1.130. Workaround included, tracked upstream in microsoft/vscode#326445.

## 1.4.1 (2026.7.20)
- Published before the README update below; superseded by 1.4.2.

## 1.4.0 (2026.7.20)
- Fix auburn theme: invalid hex color `#9d3eoc` (letter `o`) silently ignored by VS Code, now `#9d3e0c`.
- Fix Arduino light theme: invalid `"type": "default"`, now `"light"`.
- Add missing color keys (inactive title bar, menu, activity bar badge) on the themes that lacked them.
- Add `activityBar.border` and `titleBar.border` on all themes.

## 1.3.2 (2026.7.02)
- Amélioration mineur (contraste).

## 1.2.9 to 1.3.0 (2023.8.03)
- Change Arduino themes to those from arduino-ide.
- Functionnal version for arduino begin with 1.3.0.
## 1.2.7 (2023.6.15)
- Add color for : Input, Search, Command Center and global setting (Like huacat),
- Change terminal color for all light theme but Arduino.
- Add Arduino themes.
## 1.2.6 (2022.4.22)
- add amber and fuchia theme.
- rename with color name.
- Change terminal color for yellow.
## 1.2.3 (2022.3.19)
- Extension of yellow modifications on all models.
- Redesign of the logo..
## 1.2.2 (2022.3.16)
- Minor change in editor apparence (some bold font) just in yellow theme for now.
## 1.2.0 (2022.2.15)
- Change ref to erase reference to microsoft (logo and other) to respect copyright.
- Added yellow theme based on powerpoint theme (just bar and button background are changed)
## 1.1.4 (2022.2.11)
- Rename themes with added color name
- Added red theme based on powerpoint theme (just bar and button background are changed)

## fork from ([huacat.office-theme](https://github.com/huacat1017/huacat.office-theme))