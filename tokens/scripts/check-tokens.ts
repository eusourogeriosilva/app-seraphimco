// Seraphim.co — lint de tokens para CSS e TypeScript.
// Uso: node tokens/scripts/check-tokens.ts [pasta ...]   (padrão: src)
//
// Regras
//   cor-literal       hex, rgb(), hsl(), oklch()… em CSS ou em strings de TS
//   token-inexistente var(--x) que não existe em tokens.css nem é definido no próprio arquivo
//   primitivo-de-cor  var(--color-bordo-700) e afins: use o token semântico
//   token-obsoleto    var(--x) com $deprecated na fonte: AVISO, não falha. Migre antes da próxima major.
//   movimento-literal       transition ou animation com tempo ou curva solta (ex.: 200ms, ease): use motion-*
//   sem-movimento-reduzido  arquivo com animation sem bloco prefers-reduced-motion
// Exceções: comentário "tokens-ignore" na linha, ou "tokens-ignore-file" no arquivo
// (ex.: templates de e-mail, que não suportam variáveis CSS).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { DIST, colorPrimitives, cssName, loadSource, walk } from './lib.ts';

const EXTS = new Set(['.css', '.ts', '.tsx', '.mts', '.html']);
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'coverage']);
const HEX = /(?<![\w&$./-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;
const COLOR_FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/g;
const MOTION_DECL = /(?<![\w-])(transition|animation)(?:-duration|-timing-function|-delay)?\s*:\s*([^;}\n]*)/g;
const TIME = /(?<![\w.-])\d*\.?\d+m?s\b/;
const CURVE = /\b(?:ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)\b|cubic-bezier\(|steps\(/;
const VAR = /var\(\s*--([\w-]+)/g;
const STRING = /(['"`])((?:\\.|(?!\1)[^\\\n])*)\1/g;

const defined = new Set([...readFileSync(join(DIST, 'tokens.css'), 'utf8').matchAll(/--([\w-]+)\s*:/g)].map((m) => m[1]!));
const allTokens = walk(loadSource());
const primitives = colorPrimitives(allTokens);
const deprecated = new Map([...allTokens.values()].filter((t) => t.deprecated).map((t) => [cssName(t.path), t.deprecated as string]));

interface Issue { file: string; line: number; col: number; rule: string; message: string }
const issues: Issue[] = [];
const warnings: Issue[] = [];

function files(dir: string): string[] {
  let entries: string[];
  try { entries = readdirSync(dir); } catch { return []; }
  return entries.flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return SKIP_DIRS.has(name) ? [] : files(p);
    return EXTS.has(extname(p)) ? [p] : [];
  });
}

/** Troca comentários de bloco por espaços, preservando posições. */
const blankBlockComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

/** Corta um comentário de linha (//) que esteja fora de strings. */
function stripLineComment(line: string): string {
  let quote = '';
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!;
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = ''; continue; }
    if (c === '"' || c === "'" || c === '`') quote = c;
    else if (c === '/' && line[i + 1] === '/') return line.slice(0, i);
  }
  return line;
}

function scanLine(file: string, lineNo: number, text: string, offset: number, localVars: Set<string>) {
  const report = (rule: string, idx: number, message: string) =>
    issues.push({ file, line: lineNo, col: offset + idx + 1, rule, message });
  const hint = file.endsWith('.css') || file.endsWith('.html') ? 'var(--color-text-primary)' : "cssVar('color-text-primary')";
  for (const m of text.matchAll(HEX)) report('cor-literal', m.index, `${m[0]}: use um token (ex.: ${hint})`);
  for (const m of text.matchAll(COLOR_FN)) report('cor-literal', m.index, `${m[0]}…): use um token de cor`);
  if (file.endsWith('.css') || file.endsWith('.html')) {
    for (const m of text.matchAll(MOTION_DECL)) {
      const value = (m[2] ?? '').replace(/var\([^)]*\)/g, '');
      if (/^\s*(none|0s?)\s*$/.test(value)) continue;
      if (TIME.test(value) || (CURVE.test(value) && !(m[1] === 'animation' && /\blinear\b/.test(value) && !TIME.test(value))))
        report('movimento-literal', m.index, `${m[1]}: use var(--motion-duration-*) e var(--motion-easing-*), não ${value.trim()}`);
    }
  }
  for (const m of text.matchAll(VAR)) {
    const name = m[1]!;
    if (primitives.has(name)) report('primitivo-de-cor', m.index, `--${name} é primitivo: use o token semântico equivalente`);
    else if (deprecated.has(name)) warnings.push({ file, line: lineNo, col: offset + m.index + 1, rule: 'token-obsoleto', message: `--${name} está obsoleto. ${deprecated.get(name)}` });
    else if (!defined.has(name) && !localVars.has(name)) report('token-inexistente', m.index, `--${name} não existe em tokens.css`);
  }
}

const roots = process.argv.slice(2).length ? process.argv.slice(2) : ['src'];
const all = roots.flatMap(files);
for (const file of all) {
  const raw = readFileSync(file, 'utf8');
  if (raw.includes('tokens-ignore-file')) continue;
  const isCss = extname(file) === '.css';
  const body = blankBlockComments(raw);
  const localVars = new Set([...body.matchAll(/(?<![\w-])--([\w-]+)\s*:/g)].map((m) => m[1]!));
  if ((isCss || extname(file) === '.html') && /(?<![\w-])animation(?:-name)?\s*:\s*(?!none\b)/.test(body) && !body.includes('prefers-reduced-motion')) {
    const idx = body.search(/(?<![\w-])animation(?:-name)?\s*:/);
    issues.push({ file, line: body.slice(0, idx).split('\n').length, col: 1, rule: 'sem-movimento-reduzido', message: 'animation exige @media (prefers-reduced-motion: reduce) no mesmo arquivo' });
  }
  body.split('\n').forEach((line, i) => {
    if (raw.split('\n')[i]?.includes('tokens-ignore')) return;
    if (isCss || extname(file) === '.html') { scanLine(file, i + 1, line, 0, localVars); return; }
    // TS: só o conteúdo de strings e template literals (evita falso positivo com campos #privados)
    for (const s of stripLineComment(line).matchAll(STRING)) scanLine(file, i + 1, s[2] ?? '', s.index + 1, localVars);
  });
}

for (const w of warnings) console.warn(`AVISO ${relative(process.cwd(), w.file)}:${w.line}:${w.col}  ${w.rule}  ${w.message}`);
for (const i of issues) console.error(`${relative(process.cwd(), i.file)}:${i.line}:${i.col}  ${i.rule}  ${i.message}`);
if (issues.length) {
  console.error(`\n${issues.length} problema(s) em ${new Set(issues.map((i) => i.file)).size} arquivo(s).`);
  process.exit(1);
}
console.log(`tokens: ${all.length} arquivo(s) verificados, nenhuma cor solta, nenhum token inexistente${warnings.length ? `, ${warnings.length} aviso(s) de token obsoleto` : ''}.`);
