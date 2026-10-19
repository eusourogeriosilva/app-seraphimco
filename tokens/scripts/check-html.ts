// Seraphim.co — lint de HTML (acessibilidade e conteúdo) para os arquivos de src/.
// Regras: html-sem-lang, h1-unico, salto-de-nivel, img-sem-alt, controle-sem-rotulo.
// Uso: node tokens/scripts/check-html.ts src
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function arquivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? arquivos(p) : p.endsWith('.html') ? [p] : [];
  });
}

const raiz = process.argv[2] ?? 'src';
const erros: string[] = [];
const lista = arquivos(raiz);
for (const arq of lista) {
  const html = readFileSync(arq, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const falha = (regra: string, msg: string) => erros.push(`${arq}: [${regra}] ${msg}`);
  if (!/<html\b[^>]*\blang="[a-z]{2}(-[A-Za-z]{2})?"/.test(html)) falha('html-sem-lang', '<html lang="pt-BR"> ausente');
  const niveis = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
  if (niveis.filter((n) => n === 1).length !== 1) falha('h1-unico', `esperado 1 <h1>, achei ${niveis.filter((n) => n === 1).length}`);
  niveis.forEach((n, i) => { if (i > 0 && n - niveis[i - 1]! > 1) falha('salto-de-nivel', `h${niveis[i - 1]} seguido de h${n}`); });
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0])) falha('img-sem-alt', m[0].slice(0, 80));
  const rotulos = new Set([...html.matchAll(/<label\b[^>]*\bfor="([^"]+)"/g)].map((m) => m[1]!));
  for (const m of html.matchAll(/<(input|textarea|select)\b([^>]*)>/g)) {
    const attrs = m[2]!;
    if (/\btype="(hidden|submit|button)"/.test(attrs)) continue;
    const id = /\bid="([^"]+)"/.exec(attrs)?.[1];
    if (!(id && rotulos.has(id)) && !/\baria-label(ledby)?=/.test(attrs)) falha('controle-sem-rotulo', m[0].slice(0, 80));
  }
}
if (erros.length) { console.error(erros.join('\n')); console.error(`\nhtml: ${erros.length} problema(s) em ${lista.length} arquivo(s)`); process.exit(1); }
console.log(`html: ${lista.length} arquivo(s) verificados, sem problemas de acessibilidade estática.`);
