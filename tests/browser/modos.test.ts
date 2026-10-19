// Modos de contraste do sistema operacional e cartão clicável.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { abrir, descer, subir, type Ambiente } from './helpers.ts';

let amb: Ambiente;
before(async () => { amb = await subir(); });
after(async () => { await descer(amb); });

test('forced-colors: cartões, logos e alertas mantêm contorno como border', async () => {
  const page = await abrir(amb, '/src/site/index.html', 1440, { forcedColors: 'active' });
  const r = await page.evaluate(() => [...document.querySelectorAll('.card, .logos__item, .photo--placeholder')].map((e) => { const s = getComputedStyle(e); return { c: e.className, borda: s.borderTopStyle, largura: s.borderTopWidth, sombra: s.boxShadow }; }));
  assert.ok(r.length >= 7, 'esperava cartões, logos e foto');
  for (const x of r) { assert.equal(x.borda, 'solid', x.c); assert.equal(x.largura, '1px', x.c); assert.equal(x.sombra, 'none', x.c); }
  await page.close();
});

test('forced-colors: moldura do logotipo permanece desenhada', async () => {
  const page = await abrir(amb, '/src/site/index.html', 1440, { forcedColors: 'active' });
  const adj = await page.evaluate(() => getComputedStyle(document.querySelector('.wordmark')!, '::after').getPropertyValue('forced-color-adjust'));
  assert.equal(adj, 'none');
  await page.close();
});

test('prefers-contrast: more eleva borda sutil e texto secundário', async () => {
  const normal = await abrir(amb, '/src/site/index.html');
  const mais = await abrir(amb, '/src/site/index.html', 1440, { contrast: 'more' });
  const ler = (p: typeof normal) => p.evaluate(() => { const s = getComputedStyle(document.documentElement); return { borda: s.getPropertyValue('--color-border-subtle').trim(), sec: s.getPropertyValue('--color-text-secondary').trim(), prim: s.getPropertyValue('--color-text-primary').trim(), forte: s.getPropertyValue('--color-border-strong').trim() }; });
  const a = await ler(normal); const b = await ler(mais);
  assert.notEqual(a.borda, a.forte);
  assert.equal(b.borda, b.forte);
  assert.equal(b.sec, b.prim);
  await normal.close(); await mais.close();
});

test('cartão clicável: link cobre o cartão e o foco aparece no cartão', async () => {
  const page = await abrir(amb, '/src/site/index.html', 1440);
  const r = await page.evaluate(() => {
    const c = document.querySelector<HTMLElement>('.card[data-interactive]')!;
    const a = c.querySelector<HTMLAnchorElement>('a')!;
    a.focus();
    const area = getComputedStyle(a, '::after');
    return { pos: area.position, inset: area.top + area.left, outline: getComputedStyle(c).outlineStyle, outlineA: getComputedStyle(a).outlineStyle };
  });
  assert.equal(r.pos, 'absolute');
  assert.equal(r.outline, 'solid');
  assert.equal(r.outlineA, 'none');
  await page.close();
});
