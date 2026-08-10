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

With the `workbench.experimental.modernUI` setting on, the **activity bar, title bar and status bar lose their color** and stay grey — with any theme, not just this one.

It is opt-in on VS Code 1.129, but **enabled by default from 1.130**, so you may hit this without having changed anything.

To get the colors back, set:

```jsonc
"workbench.experimental.modernUI": false
```

Tracked upstream in [microsoft/vscode#326445](https://github.com/microsoft/vscode/issues/326445). The setting is flagged `experimental`, so this behaviour may still change in a future release.

## Local theme setting

When a folder is opened or added to a VS Code workspace, Colored Theme creates `.vscode/settings.json` when needed and copies the global `workbench.colorTheme` into it. An existing local theme setting is never replaced.

Set the following setting to `false` to disable this behaviour:

```jsonc
"colored-theme.initializeLocalTheme": false
```

## Installation
### 1. Install Colored Theme from activity bar
- Launch VS Code
- Click Extensions from activity bar
- Search for "Colored Theme"
- Press Install
- Choose your color
- And now you can enjoy Colored Theme!

