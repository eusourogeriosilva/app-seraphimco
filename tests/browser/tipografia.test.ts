// Tipografia responsiva: tamanhos por faixa, tracking proporcional e texto a 200%. Portado de t2.py.
import { test, before, after } from 'node:test';
import { abrir, descer, subir, verificacoes, type Ambiente } from './helpers.ts';

let amb: Ambiente;
before(async () => { amb = await subir(); });
after(async () => { await descer(amb); });
const URL = '/tests/browser/fixtures/tipografia.html';
const fs = (s: string) => `parseFloat(getComputedStyle(document.querySelector('${s}')).fontSize)`;

const D = { '#x': 72, '#l': 56, '#h1': 40, '#h2': 32, '#h3': 22, '#ld': 20 };
const T = { '#x': 56, '#l': 48, '#h1': 36, '#h2': 30, '#h3': 22, '#ld': 20 };
const C = { '#x': 40, '#l': 36, '#h1': 32, '#h2': 28, '#h3': 20, '#ld': 18 };
const ESPERADO: Record<number, Record<string, number>> = { 1280: D, 960: D, 959: T, 640: T, 639: C, 390: C, 320: C };

test('tipografia: tamanhos por faixa', async () => {
  const v = verificacoes();
  for (const [ws, e] of Object.entries(ESPERADO)) {
    const w = Number(ws);
    const pg = await abrir(amb, URL, w);
    const got: Record<string, unknown> = {};
    for (const k of Object.keys(e)) got[k] = await pg.evaluate(fs(k));
    v.ok(`${w}px: tamanhos dos títulos ${JSON.stringify(Object.values(e))}`, JSON.stringify(got) === JSON.stringify(e), got);
    const fixed: Record<string, unknown> = {};
    for (const k of ['#bd', '#sm', '#ey', '#b', '#i']) fixed[k] = await pg.evaluate(fs(k));
    v.ok(`${w}px: corpo 16, pequeno 14, eyebrow 12, botão 16, campo 16`, JSON.stringify(fixed) === JSON.stringify({ '#bd': 16, '#sm': 14, '#ey': 12, '#b': 16, '#i': 16 }), fixed);
    const sw = await pg.evaluate('document.documentElement.scrollWidth');
    v.ok(`${w}px: sem rolagem horizontal`, (sw as number) <= w, sw);
    const ls = (await pg.evaluate(`parseFloat(getComputedStyle(document.querySelector('#x')).letterSpacing)`)) as number;
    v.ok(`${w}px: tracking display-xl proporcional`, Math.abs(ls / e['#x']! + 0.015) < 0.001, ls);
    await pg.close();
  }
  v.fim();
});

test('tipografia: texto a 200% (preferência do usuário)', async () => {
  const v = verificacoes();
  for (const w of [1280, 390, 320]) {
    const pg = await abrir(amb, URL, w, { extraCss: 'html{font-size:200%}', esperar: 100 });
    const r = (await pg.evaluate(`(()=>{const o={};const c=(s)=>{const e=document.querySelector(s);return e.scrollHeight<=e.clientHeight+1&&e.scrollWidth<=e.clientWidth+1};
      o.btn=c('#b');o.bs=c('#bs');o.tag=c('#tg');o.tgs=c('#tgs');o.inp=c('#i');o.x=parseFloat(getComputedStyle(document.querySelector('#bd')).fontSize);
      o.bh=document.querySelector('#b').getBoundingClientRect().height;o.hs=document.documentElement.scrollWidth<=innerWidth+1;return o})()`)) as Record<string, number | boolean>;
    v.ok(`${w}px, texto 200%: corpo 32 px, botão cresce sem cortar`, r['x'] === 32 && r['btn'] && r['bs'] && r['tag'] && r['tgs'] && r['inp'] && (r['bh'] as number) >= 48, r);
    await pg.close();
  }
  v.fim();
});
