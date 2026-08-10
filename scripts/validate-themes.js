const fs = require('fs');
const path = require('path');

const themesDirectory = path.join(__dirname, '..', 'themes');
const requiredColors = [
    'commandCenter.background',
    'editorStickyScroll.background',
    'editorStickyScrollHover.background',
    'editorStickyScroll.border',
    'editorStickyScroll.shadow',
    'editorIndentGuide.background1',
    'editorIndentGuide.activeBackground1',
    'editorInlayHint.background',
    'editorInlayHint.foreground',
    'testing.iconPassed',
    'testing.iconFailed',
    'testing.iconSkipped',
    'chat.requestBackground',
    'chat.requestBorder',
    'editorBracketHighlight.foreground1',
    'editorBracketPairGuide.background1',
    'editorBracketPairGuide.activeBackground1'
];
const themeFiles = [];

function collectThemeFiles(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            collectThemeFiles(entryPath);
        } else if (entry.name.endsWith('-color-theme.json')) {
            themeFiles.push(entryPath);
        }
    }
}

function removeJsonComments(source) {
    let result = '';
    let inString = false;
    let escaped = false;
    let lineComment = false;
    let blockComment = false;

    for (let index = 0; index < source.length; index += 1) {
        const character = source[index];
        const nextCharacter = source[index + 1];

        if (lineComment) {
            if (character === '\n') {
                lineComment = false;
                result += character;
            }
            continue;
        }

        if (blockComment) {
            if (character === '*' && nextCharacter === '/') {
                blockComment = false;
                index += 1;
            }
            continue;
        }

        if (inString) {
            result += character;
            if (escaped) {
                escaped = false;
            } else if (character === '\\') {
                escaped = true;
            } else if (character === '"') {
                inString = false;
            }
            continue;
        }

        if (character === '"') {
            inString = true;
            result += character;
        } else if (character === '/' && nextCharacter === '/') {
            lineComment = true;
            index += 1;
        } else if (character === '/' && nextCharacter === '*') {
            blockComment = true;
            index += 1;
        } else {
            result += character;
        }
    }

    return result.replace(/,\s*([}\]])/g, '$1');
}

collectThemeFiles(themesDirectory);

const failures = [];
for (const themeFile of themeFiles) {
    try {
        const theme = JSON.parse(removeJsonComments(fs.readFileSync(themeFile, 'utf8')));
        const missingColors = requiredColors.filter((color) => !Object.hasOwn(theme.colors ?? {}, color));
        if (typeof theme.name !== 'string' || typeof theme.type !== 'string' || missingColors.length > 0) {
            failures.push(`${path.relative(process.cwd(), themeFile)}: métadonnées ou couleurs manquantes (${missingColors.join(', ')})`);
        }
    } catch (error) {
        failures.push(`${path.relative(process.cwd(), themeFile)}: ${error.message}`);
    }
}

if (failures.length > 0) {
    console.error(failures.join('\n'));
    process.exit(1);
}

console.log(`${themeFiles.length} thèmes JSONC valides.`);