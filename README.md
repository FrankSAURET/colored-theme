<p align=center><img width=600px src=https://github.com/FrankSAURET/colored-theme/raw/master/image/welcome.png/></p>

Begin with a fork from ([huacat.office-theme](https://github.com/huacat1017/huacat.office-theme))

## Screenshots

### Blue Theme
![BLUE](https://github.com/FrankSAURET/colored-theme/raw/master/image/blue.png)

### Orange Theme
![ORANGE](https://github.com/FrankSAURET/colored-theme/raw/master/image/orange.png)

### Green Theme
![GREEN](https://github.com/FrankSAURET/colored-theme/raw/master/image/green.png)

### Purple Theme
![PURPLE](https://github.com/FrankSAURET/colored-theme/raw/master/image/purple.png)

### Brown Theme
![BROWN](https://github.com/FrankSAURET/colored-theme/raw/master/image/brown.png)

### DarkGreen Theme
![DARKGREEN](https://github.com/FrankSAURET/colored-theme/raw/master/image/darkGreen.png)

### Red Theme
![RED](https://github.com/FrankSAURET/colored-theme/raw/master/image/red.png)

### Yellow Theme
![YELLOW](https://github.com/FrankSAURET/colored-theme/raw/master/image/yellow.png)

### Arduino Light
![ARDUINO LIGHT](https://github.com/FrankSAURET/colored-theme/raw/master/image/vscode_arduino.png)

and so on...

## **Black Theme**
![DARK BLACK](https://github.com/FrankSAURET/colored-theme/raw/master/image/darkblack.png)

### Arduino Dark
![ARDUINO DARK](https://github.com/FrankSAURET/colored-theme/raw/master/image/vscode_arduino_dark.png)

## Known issue: VS Code 1.129+ "Modern UI" preview

If you enable the `workbench.experimental.modernUI` setting (VS Code 1.129 and later), the **activity bar, title bar and status bar lose their color** and stay grey — with any theme, not just this one.

This is not a bug in the theme. The workbench applies its own stylesheet rule:

```css
.monaco-workbench.floating-panels .part.activitybar,
.monaco-workbench.floating-panels .part.statusbar,
.monaco-workbench.floating-panels .part.titlebar {
   background-color: transparent !important;
   border-color: transparent !important;
}
```

Because of `!important`, no color theme can override it — a theme only supplies color values, never CSS. Menu **text** still gets colored, which is why the bars look half-themed.

To get the colors back, set:

```jsonc
"workbench.experimental.modernUI": false
```

The setting is flagged `experimental`, so this behaviour may still change in a future release.

## Installation
### 1. Install Colored Theme from activity bar
- Launch VS Code
- Click Extensions from activity bar
- Search for "Colored Theme"
- Press Install
- Choose your color
- And now you can enjoy Colored Theme!

