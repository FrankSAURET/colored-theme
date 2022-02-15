# Change Log
## 1.1.8 (2022.2.15)
### Theme add
- Added yellow theme based on powerpoint theme (just bar and button background are changed)
## 1.1.4 (2022.2.11)
fork from ([huacat.office-theme](https://github.com/huacat1017/huacat.office-theme))
### Theme Changes
- Rename themes with added color name
### Theme add
- Added red theme based on powerpoint theme (just bar and button background are changed)
## 1.1.3 (2022.2.10)
### Theme Changes
- Renamed Dark Themes to Black ([Reference page](https://support.microsoft.com/en-us/office/change-the-look-and-feel-of-office-63e65e1c-08d4-4dea-820e-335f54672310))
- Fixed terminal text colors (some colored texts couldn't see)
- Fixed title(menu) bar and menu colors

## 1.1.2 (2022.1.30)
### Theme Changes
- Recolored welcome walkthroughs tiles(It seems like that [Update 1.61](https://code.visualstudio.com/updates/v1_61) added these properties)
- Recolored the list.focus(background, foreground, outline) of Office Dark Theme (Word)
- Recolored `list.dropBackground` -> `#2b579a`(I don't know how to color it, you can [open an issue](https://github.com/huacat1017/huacat.office-theme/issues/new) to advise me)
### Others
- ([#12](https://github.com/huacat1017/huacat.office-theme/issues/12)) Edited [README.md](https://github.com/huacat1017/huacat.office-theme/blame/master/README.md)(especially added declaration to say it's unofficial)

## 1.1.1 (2021.8.6)
### Fixed Issues (Office Dark Theme (Word))
#### ([#9](https://github.com/huacat1017/huacat.office-theme/issues/9))
- `textLink.activeForeground` set to `#79cdfe`(couldn't see before)
- `textLink.foreground` set to `#23a6e8`(couldn't see before)
- extensionButton bg&fg set to the style in the light one
#### and Others:
- `textBlockQuote.background` set to `#363636`(it was light, we could't see text.)
### Theme Changes
changes below make the themes more like original Office:
- `editorLink.activeForeground` set to `#0563c1` for light and `#7eb1ff` for dark
- `textLink.activeForeground` set to `sideBarTitle.foreground` in each light theme
- Add Feedback Describtion to [README.md](https://github.com/huacat1017/huacat.office-theme/blame/master/README.md)

## 1.1.0 (2021.7.17)
### Theme Changes
### **PREVIEW: Office Dark Theme (Word) is out!**
([#7](https://github.com/huacat1017/huacat.office-theme/pull/7))
Thanks ([YazeedAlKhalaf](https://github.com/YazeedAlKhalaf)) for support.
#### Activity Bar Changes
Because I'm using Office 2019 now, so I'll modify a few colors:
- `activityBar.foreground`<br>
`activityBar.inactiveForeground` : `#f3f3f3` -> `#ededed`
`activityBarBadge.background`
- Added `activityBar.dropBorder` -> `#ffffff`

## 1.0.2 (2020.7.19)
### Theme Changes
([#4](https://github.com/huacat1017/huacat.office-theme/pull/4))
- `minimap.background` sat color to `#fafafa`
- `panel.background` sat color to `#f3f3f3`
- `terminal.background` sat color to `#fafafa`
- `terminalCursor.background` sat color to `#fafafa`
- exchange terminal ansi colors and ansi bright colors (Not #4)

## 1.0.1 (2020.6.26)
### Fixed issues
- Published extension to [open-vsx.org](https://open-vsx.org) ([#1](https://github.com/huacat1017/huacat.office-theme/issues/1))
- README.md improved readability ([#2](https://github.com/huacat1017/huacat.office-theme/pull/2))

### Theme Changes
- `editor.lineHighlightBackground` and `editor.lineHighlightBorder` recolored to `#f3f3f3`
- `editor.hoverHighlightBackground`,`editor.selectionHighlightBackground`, and `editor.wordHighlightStrongBackground`
set opacity to `a0` (It could cover something before) 

## 1.0.0 (2020.6.22)
### HUGE UPDATE \! Added the other 4 themes \!
\- Excel, Onenote, Access and Publisher

### Theme Colors
- Fixed `list.highlightForeground` was still blue in PowerPoint Theme
- `list.activeSelectionForeground` and `list.inactiveSelectionForeground` changed to Theme's titlebar background color
- The color of `textLink` changed to Theme's titlebar  background color
- Office Theme (Powerpoint) was ranamed to Office Theme (PowerPoint)
- `editor.hoverHighlightBackground` and `editor.selectionHighlightBackground` set opacity to `ff` (Microsoft fixed the bug in terminal at 0.46)

### Syntax Colors
- Added `punctuation.definition.string.end.cpp` and `punctuation.definition.string.begin.cpp`
to `Punctuation` group

## 0.1.1 (2020.6.6)
- `editor.hoverHighlightBackground` and `editor.selectionHighlightBackground` set opacity to `80`
- Fix README.md Powerpoint label position.

- Added color to following theme keys:
`editor.wordHighlightBackground`
`editor.wordHighlightStrongBackground`
`list.highlightForeground`

## 0.1.0 (2020.5.18)
- **Powerpoint Theme is out\!**

### Theme Colors
- No opacity in `editorGroup.dropBackground`
- `textLink.activeForeground` changes color to `#4472c4`
- Added `notification` settings
- Changed `progressBar.background` to themes' titlebar color

### Syntax Colors
- Changes some `punctuation` settings
- `CSS Classes` changes color to `#a8d08d`
- `CSS: Property Names` changes color to `#70ad47`

### Package structure changes
- All of the images (except logo.png) are moved to image folder and delete from extension (they are at github)

## 0.0.1 (2020.5.3)
- Initial release