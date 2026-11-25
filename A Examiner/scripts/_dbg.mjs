import { fichiersThemes, lireTheme, evaluerTheme, lireHex } from './contraste-lib.mjs';
const th = lireTheme(fichiersThemes().find(f => f.includes(process.argv[2])));
const s = JSON.parse(process.argv[3]);
for (const k in s) s[k] = lireHex(s[k]);
const a = evaluerTheme(th), b = evaluerTheme(th, s);
for (let i = 0; i < a.length; i++) if (Math.abs(a[i].vis - b[i].vis) > 1e-3 || Math.abs(a[i].r - b[i].r) > 1e-3) console.log(a[i].paire.fg, '/', a[i].paire.bg, 'r', a[i].r.toFixed(2), '→', b[i].r.toFixed(2), 'vis', a[i].vis.toFixed(3), '→', b[i].vis.toFixed(3), a[i].paire.dessous.join('>'));
