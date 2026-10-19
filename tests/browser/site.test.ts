// Página do Site em todas as faixas: layout por seção, tipografia, respiro e texto a 200%. Portado de st/t.py.
import { test, before, after } from 'node:test';
import { abrir, descer, subir, verificacoes, type Ambiente } from './helpers.ts';

let amb: Ambiente;
before(async () => { amb = await subir(); });
after(async () => { await descer(amb); });
const URL = '/src/site/index.html';
type Caixa = { l: number; r: number; t: number; b: number; w: number; h: number };

for (const w of [1440, 1280, 960, 959, 768, 640, 639, 390, 320]) {
  test(`site ${w}px: layout por seção`, async () => {
    const v = verificacoes();
    const pg = await abrir(amb, URL, w, { fontes: true, esperar: 700 });
    const band = w >= 960 ? 'd' : w >= 640 ? 't' : 'c';
    const g = <T>(js: string) => pg.evaluate(js) as Promise<T>;
    const caixa = (s: string) => pg.evaluate((q) => { const e = document.querySelector(q)!.getBoundingClientRect(); return { l: Math.round(e.left), r: Math.round(e.right), t: Math.round(e.top), b: Math.round(e.bottom), w: Math.round(e.width), h: Math.round(e.height) }; }, s) as Promise<Caixa>;
    const sw = await g<number>('document.documentElement.scrollWidth');
    v.ok(`${w}px: sem rolagem horizontal`, sw <= w, sw);
    const tx = await caixa('main section:first-child .stack'); const ph = await caixa('main section:first-child .frame');
    const lado = ph.l > tx.r - 1 && Math.abs(ph.t - tx.t) < 400;
    v.ok(`${w}px: hero ${band === 'd' ? 'lado a lado' : 'empilhado'}`, lado === (band === 'd'), [tx.w, ph.l]);
    const h1 = await g<number>(`parseFloat(getComputedStyle(document.querySelector('h1')).fontSize)`);
    v.ok(`${w}px: h1 ${{ d: 72, t: 56, c: 40 }[band]} px`, h1 === { d: 72, t: 56, c: 40 }[band], h1);
    const lc = await g<number>(`getComputedStyle(document.querySelector('.logos')).gridTemplateColumns.split(' ').length`);
    v.ok(`${w}px: logos em ${band !== 'c' ? 4 : 2} colunas`, lc === (band !== 'c' ? 4 : 2), lc);
    const mi = await g<number[]>(`[...document.querySelectorAll('.method__item')].map(e=>Math.round(e.getBoundingClientRect().top))`);
    v.ok(`${w}px: Método ${{ d: 4, t: 2, c: 1 }[band]} por linha`, mi.filter((x) => x === mi[0]).length === { d: 4, t: 2, c: 1 }[band], mi);
    const sv = await g<number[][]>(`[...document.querySelectorAll('.card--service')].map(e=>{const q=e.getBoundingClientRect();return [Math.round(q.top),Math.round(q.width)]})`);
    v.ok(`${w}px: Serviços ${{ d: 3, t: 2, c: 1 }[band]} na primeira linha`, sv.filter((x) => x[0] === sv[0]![0]).length === { d: 3, t: 2, c: 1 }[band], sv);
    if (band === 't') v.ok(`${w}px: terceiro card na linha inteira`, sv[2]![1]! > sv[0]![1]! * 1.8, sv);
    const pad = await g<string>(`getComputedStyle(document.querySelector('.card--service')).paddingLeft`);
    v.ok(`${w}px: card padding ${band === 'c' ? '24' : '32'}`, pad === (band === 'c' ? '24px' : '32px'), pad);
    const fp = await caixa('#quem-lidera .frame'); const ft = await caixa('#quem-lidera .stack');
    v.ok(`${w}px: fundador ${band === 'c' ? 'empilhado' : 'lado a lado'}`, (ft.l > fp.r - 1) === (band !== 'c'), [fp, ft]);
    const pr = await g<number>(`(()=>{const q=document.querySelector('#quem-lidera .photo').getBoundingClientRect();return +(q.width/q.height).toFixed(2)})()`);
    v.ok(`${w}px: retrato ${band === 'c' ? '1:1' : '4:5'}`, Math.abs(pr - (band === 'c' ? 1.0 : 0.8)) < 0.02, pr);
    const fc = await g<number[]>(`[...document.querySelectorAll('.site-footer .grid > *')].map(e=>Math.round(e.getBoundingClientRect().top))`);
    const per = fc.filter((x) => x === fc[0]).length;
    v.ok(`${w}px: rodapé ${band === 'd' ? 3 : band === 'c' ? 1 : 2} na primeira linha`, per === { d: 3, t: 1, c: 1 }[band] || (band === 't' && per === 1), fc);
    const sy = await g<string>(`getComputedStyle(document.querySelector('#metodo')).paddingTop`);
    const syEsp = { d: 96, t: 80, c: 64 }[band];
    v.ok(`${w}px: respiro de seção ${syEsp}`, sy === `${syEsp}px`, sy);
    const cb = await g<number[]>(`(()=>{const a=document.querySelector('#contato .actions .btn').getBoundingClientRect(),c=document.querySelector('#contato .container').getBoundingClientRect();return [Math.round(a.width),Math.round(c.width)]})()`);
    if (band === 'c') v.ok(`${w}px: botão final de largura total`, Math.abs(cb[0]! - (cb[1]! - 2 * 16)) < 3, cb);
    await pg.close();
    v.fim();
  });
}

test('site: texto a 200% em 390 e 320 px', async () => {
  const v = verificacoes();
  for (const w of [390, 320]) {
    const pg = await abrir(amb, URL, w, { fontes: true, extraCss: 'html{font-size:200%}', esperar: 500 });
    const bad = (await pg.evaluate(`[...document.querySelectorAll('main *, footer *, header *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>e.tagName+'.'+e.className).slice(0,5)`)) as string[];
    v.ok(`${w}px, texto 200%: nada passa da largura`, bad.length === 0, bad);
    await pg.close();
  }
  v.fim();
});
