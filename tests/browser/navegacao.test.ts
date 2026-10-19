// Navegação e padrões responsivos: cabeçalho, menu, ações, tabelas, cartão, Blueprint, fotos, skip-link e texto a 200%.
// Portado da suíte em Python (t3.py); as verificações têm os mesmos nomes.
import { test, before, after } from 'node:test';
import { abrir, descer, subir, verificacoes, type Ambiente } from './helpers.ts';

let amb: Ambiente;
before(async () => { amb = await subir(); });
after(async () => { await descer(amb); });
const URL = '/tests/browser/fixtures/navegacao.html';
type R = { top: number; bottom: number; width: number };

for (const w of [1280, 960, 959, 768, 640, 639, 390, 320]) {
  test(`navegação ${w}px: cabeçalho, menu, ações, tabelas, cartão, Blueprint, fotos`, async () => {
    const v = verificacoes();
    const pg = await abrir(amb, URL, w, { fontes: true, esperar: 500 });
    const g = <T>(js: string) => pg.evaluate(js) as Promise<T>;
    const band = w >= 960 ? 'd' : w >= 640 ? 't' : 'c';
    const r = await g<{ sw: number; cw: number; hh: number; brandTop: number; navTop: number; ctaTop: number; lh: number[]; short: string; full: string }>(`(()=>{const h=document.querySelector('#h3');const q=s=>document.querySelector(s).getBoundingClientRect();
      const links=[...document.querySelectorAll('#h3n a')].map(a=>a.getBoundingClientRect());
      return {sw:h.scrollWidth,cw:h.clientWidth,hh:Math.round(h.getBoundingClientRect().height),brandTop:Math.round(q('#h3b').top),navTop:Math.round(q('#h3n').top),ctaTop:Math.round(q('#h3c').top),
              lh:links.map(l=>Math.round(l.height)),short:getComputedStyle(document.querySelector('#h3c .is-short')).display,full:getComputedStyle(document.querySelector('#h3c .is-full')).display}})()`);
    v.ok(`${w}px: cabeçalho sem rolagem horizontal`, r.sw <= r.cw, r);
    v.ok(`${w}px: links com 44 px de altura`, r.lh.every((x) => x >= 44), r.lh);
    const umaLinha = Math.abs(r.navTop - r.brandTop) < 30;
    v.ok(`${w}px: ${band !== 'c' ? 'uma linha' : 'duas linhas'}`, umaLinha === (band !== 'c'), [r.brandTop, r.navTop, r.ctaTop]);
    v.ok(`${w}px: rótulo ${band === 'd' ? 'completo' : 'curto'}`, (r.full !== 'none') === (band === 'd') && (r.short !== 'none') === (band !== 'd'), r);
    const m = await g<{ tog: string; nav: string }>(`(()=>({tog:getComputedStyle(document.querySelector('#h5t')).display,nav:getComputedStyle(document.querySelector('#h5n')).display}))()`);
    v.ok(`${w}px: menu ${band === 'd' ? 'visível' : 'recolhido'} com 5 links`, band === 'd' ? m.nav !== 'none' && m.tog === 'none' : m.nav === 'none' && m.tog !== 'none', m);
    const a = await g<{ a1: R; a2: R; cw: number }>(`(()=>{const q=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,width:r.width}};return {a1:q('#a1'),a2:q('#a2'),cw:document.querySelector('#ac').clientWidth}})()`);
    if (band === 'c') v.ok(`${w}px: ações empilhadas, largura total`, a.a2.top > a.a1.bottom - 1 && Math.abs(a.a1.width - a.cw) < 2 && Math.abs(a.a2.width - a.cw) < 2, [a.a1.width, a.cw]);
    else v.ok(`${w}px: ações lado a lado`, Math.abs(a.a1.top - a.a2.top) < 2);
    const t = await g<{ d: string; th: number; lab: string; pad: string }>(`(()=>({d:getComputedStyle(document.querySelector('#tc tbody tr')).display,th:Math.round(document.querySelector('#tc thead').getBoundingClientRect().height),lab:getComputedStyle(document.querySelector('#tc td'),'::before').content,pad:getComputedStyle(document.querySelector('#tc tbody tr')).paddingLeft}))()`);
    if (band === 'c') v.ok(`${w}px: tabela vira cartões com rótulo e padding 24`, t.d === 'flex' && t.lab.includes('Serviço') && t.pad === '24px', t);
    else v.ok(`${w}px: tabela mantida`, t.d === 'table-row', t);
    const s = await g<{ sw: number; cw: number; pg: boolean; pos: string }>(`(()=>{const e=document.querySelector('#ts');return {sw:e.scrollWidth,cw:e.clientWidth,pg:document.documentElement.scrollWidth<=innerWidth,pos:getComputedStyle(e.querySelector('td')).position}})()`);
    v.ok(`${w}px: tabela de dados rola dentro da região, página não rola`, s.pg && s.pos === 'sticky' && (band === 'c' ? s.sw > s.cw : true), s);
    const pad = await g<string>(`getComputedStyle(document.querySelector('#cd')).paddingLeft`);
    v.ok(`${w}px: card padding ${band === 'c' ? '24' : '32'}`, pad === (band === 'c' ? '24px' : '32px'), pad);
    const bl = await g<{ cols: number; last: number; first: number; py: string }>(`(()=>{const it=[...document.querySelectorAll('.blueprint__item')].map(e=>e.getBoundingClientRect());return {cols:getComputedStyle(document.querySelector('#bl')).gridTemplateColumns.split(' ').length,last:Math.round(it[4].width),first:Math.round(it[0].width),py:getComputedStyle(document.querySelector('#bp')).paddingTop}})()`);
    const colsEsp = { d: 5, t: 2, c: 1 }[band];
    v.ok(`${w}px: Blueprint em ${colsEsp} coluna(s)`, bl.cols === colsEsp && (band === 't' ? bl.last > bl.first * 1.5 : true), bl);
    const sy = { d: '96px', t: '80px', c: '64px' }[band];
    v.ok(`${w}px: Blueprint com respiro de seção ${sy}`, bl.py === sy, bl.py);
    const ph = await g<number[]>(`(()=>{const r=s=>{const q=document.querySelector(s).getBoundingClientRect();return +(q.width/q.height).toFixed(2)};return [r('#p1'),r('#p2')]})()`);
    const exp = band === 'c' ? [1.0, 1.33] : [0.8, 1.5];
    v.ok(`${w}px: proporções das fotos ${JSON.stringify(exp)}`, ph.every((x, i) => Math.abs(x - exp[i]!) < 0.02), ph);
    const dw = await g<number>('document.documentElement.scrollWidth');
    v.ok(`${w}px: página sem rolagem horizontal`, dw <= w, dw);
    await pg.close();
    v.fim();
  });
}

test('navegação: menu em 390 px, skip-link e texto a 200% em 320 px', async () => {
  const v = verificacoes();
  let pg = await abrir(amb, URL, 390, { fontes: true, esperar: 300 });
  const ex = () => pg.getAttribute('#h5t', 'aria-expanded');
  v.ok('menu: começa fechado', (await ex()) === 'false');
  await pg.click('#h5t'); v.ok('menu: clique abre', (await ex()) === 'true' && (await pg.evaluate(`getComputedStyle(document.querySelector('#h5n')).display`)) === 'flex');
  const hs = (await pg.evaluate(`[...document.querySelectorAll('#h5n a')].map(a=>Math.round(a.getBoundingClientRect().height))`)) as number[];
  v.ok('menu: itens com 48 px', hs.every((h) => h === 48), hs);
  v.ok('menu: botão de ação visível e de largura total', await pg.evaluate(`(()=>{const c=document.querySelector('#h5c').getBoundingClientRect(),n=document.querySelector('#h5n').getBoundingClientRect();return c.width>=n.width-1&&c.top>n.bottom-1})()`));
  await pg.focus('#h5n a:nth-child(2)'); await pg.keyboard.press('Escape');
  v.ok('menu: Esc fecha e devolve o foco ao botão', (await ex()) === 'false' && (await pg.evaluate('document.activeElement.id')) === 'h5t');
  await pg.click('#h5t'); await pg.click('#h5n a:nth-child(3)'); v.ok('menu: escolher um link fecha', (await ex()) === 'false');
  await pg.click('#h5t'); await pg.setViewportSize({ width: 1100, height: 900 }); await pg.waitForTimeout(200);
  v.ok('menu: ao chegar ao desktop volta ao estado fechado', (await ex()) === 'false');
  await pg.close();
  pg = await abrir(amb, URL, 390, { fontes: true, esperar: 200 }); await pg.keyboard.press('Tab');
  const sk = (await pg.evaluate(`(()=>{const q=document.querySelector('#skip').getBoundingClientRect();return [document.activeElement.id,Math.round(q.top)]})()`)) as [string, number];
  v.ok('skip-link: primeiro foco e visível só com foco', sk[0] === 'skip' && sk[1] >= 0, sk);
  const pg2 = await abrir(amb, URL, 390, { fontes: true });
  v.ok('skip-link: fora da tela sem foco', ((await pg2.evaluate(`document.querySelector('#skip').getBoundingClientRect().bottom`)) as number) <= 0);
  const p3 = await abrir(amb, URL, 320, { fontes: true, extraCss: 'html{font-size:200%}', esperar: 200 });
  const dw = (await p3.evaluate('document.documentElement.scrollWidth')) as number;
  v.ok('320 px, texto 200%: sem rolagem horizontal na página', (await p3.evaluate('document.documentElement.scrollWidth<=innerWidth+1')) as boolean, dw);
  v.fim();
});
