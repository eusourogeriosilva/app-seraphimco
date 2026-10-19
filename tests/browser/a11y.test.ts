// Acessibilidade automatizada: axe-core (WCAG 2.2 AA + best-practice) nas páginas do Site, em três faixas.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { abrir, descer, subir, type Ambiente } from './helpers.ts';

const axeFonte = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const PAGINAS = ['/src/site/index.html', '/src/site/contato.html'];
const LARGURAS = [1440, 768, 390];
let amb: Ambiente;
before(async () => { amb = await subir(); });
after(async () => { await descer(amb); });

interface Resultado { violations: { id: string; impact: string; nodes: { target: string[] }[] }[]; incomplete: { id: string; nodes: { target: string[] }[] }[] }

for (const pagina of PAGINAS) {
  for (const largura of LARGURAS) {
    test(`axe: ${pagina} @${largura}px sem violações`, async () => {
      const page = await abrir(amb, pagina, largura);
      await page.evaluate(axeFonte);
      const r = (await page.evaluate(`axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice'] } })`)) as Resultado;
      const resumo = r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(' ; ')}`);
      assert.deepEqual(resumo, []);
      // Itens que o axe não decide: contraste do logotipo (moldura em pseudo-elemento) e do textarea
      // (o axe não mede textarea; ele usa os mesmos tokens do input, que o axe mede e aprova).
      const inesperados = r.incomplete.flatMap((i) => i.nodes.map((n) => `${i.id}: ${n.target.join(' ')}`)).filter((t) => !/wordmark|^color-contrast: #mensagem$/.test(t));
      assert.deepEqual(inesperados, []);
      await page.close();
    });
  }
}

test('estrutura: um h1, sem salto de nível, lang pt-BR, img com alt', async () => {
  for (const pagina of PAGINAS) {
    const page = await abrir(amb, pagina);
    const r = await page.evaluate(() => {
      const h = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((e) => Number(e.tagName[1]));
      const saltos = h.filter((n, i) => i > 0 && n - h[i - 1]! > 1).length;
      return { h1: h.filter((n) => n === 1).length, saltos, lang: document.documentElement.lang, semAlt: [...document.querySelectorAll('img:not([alt])')].length };
    });
    assert.deepEqual(r, { h1: 1, saltos: 0, lang: 'pt-BR', semAlt: 0 }, pagina);
    await page.close();
  }
});
