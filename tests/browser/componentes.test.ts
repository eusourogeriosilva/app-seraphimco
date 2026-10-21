// Comportamento dos componentes: abas, FAQ, botões, campo, foco, movimento reduzido, 390 px e grade por faixa.
// Portado da suíte em Python (t.py); as verificações têm os mesmos nomes.
import { test, before, after } from 'node:test';
import { abrir, descer, subir, verificacoes, type Ambiente } from './helpers.ts';

let amb: Ambiente;
before(async () => { amb = await subir(); });
after(async () => { await descer(amb); });
const URL = '/tests/browser/fixtures/componentes.html';

test('componentes: abas, FAQ, botões, campo e foco', async () => {
  const v = verificacoes();
  const pg = await abrir(amb, URL, 1000);
  await pg.setViewportSize({ width: 1000, height: 800 });
  const sel = () => pg.evaluate(`[...document.querySelectorAll('[role=tab]')].map(t=>t.getAttribute('aria-selected')+':'+t.tabIndex).join(' ')`) as Promise<string>;
  const vis = () => pg.evaluate(`[...document.querySelectorAll('[role=tabpanel]')].filter(p=>!p.hidden).map(p=>p.id).join()`) as Promise<string>;
  const H = (s: string) => pg.evaluate((q) => document.querySelector(q)!.getBoundingClientRect().height, s);
  const cs = (s: string, p: string) => pg.evaluate(([q, pr]) => (getComputedStyle(document.querySelector(q!)!) as unknown as Record<string, string>)[pr!], [s, p]) as Promise<string>;
  const ativo = () => pg.evaluate('document.activeElement.id') as Promise<string>;

  v.ok('inicial: aba 1 ativa, painel p1', (await vis()) === 'p1' && (await sel()).startsWith('true:0 false:-1'), [await vis(), await sel()]);
  await pg.focus('#t2'); await pg.keyboard.press('ArrowRight');
  v.ok('seta direita ativa e foca aba 3', (await vis()) === 'p3' && (await ativo()) === 't3');
  await pg.keyboard.press('End'); v.ok('End vai à última', (await vis()) === 'p6' && (await ativo()) === 't6');
  await pg.keyboard.press('ArrowRight'); v.ok('seta direita na última volta à primeira', (await vis()) === 'p1');
  await pg.keyboard.press('ArrowLeft'); v.ok('seta esquerda na primeira vai à última', (await vis()) === 'p6');
  await pg.keyboard.press('Home'); v.ok('Home vai à primeira', (await vis()) === 'p1');
  v.ok('foco móvel: só uma aba com tabindex 0', (await pg.evaluate(`[...document.querySelectorAll('[role=tab]')].filter(t=>t.tabIndex===0).length`)) === 1);
  await pg.click('#t4'); v.ok('clique ativa', (await vis()) === 'p4');
  v.ok('aba mede 44 px', (await H('#t1')) === 44, await H('#t1'));
  await pg.keyboard.press('Tab'); v.ok('Tab sai da lista para o painel', (await ativo()) === 'p4');
  // FAQ
  await pg.click('#f1 summary'); await pg.click('#f2 summary');
  v.ok('FAQ: itens independentes abertos', await pg.evaluate(`document.querySelector('#f1').open&&document.querySelector('#f2').open&&!document.querySelector('#f3').open`));
  await pg.focus('#f3 summary'); await pg.keyboard.press('Enter'); v.ok('FAQ: Enter abre', await pg.evaluate(`document.querySelector('#f3').open`));
  await pg.keyboard.press('Space'); v.ok('FAQ: Espaço fecha', !(await pg.evaluate(`document.querySelector('#f3').open`)));
  const h = await pg.evaluate(`document.querySelector('#f1 summary').getBoundingClientRect().height`); v.ok('FAQ: linha de 56 px (summary)', h === 56, h);
  // botões
  v.ok('botão md 48 px', (await H('#b1')) === 48, await H('#b1'));
  v.ok('botão sm 44 px', (await H('#b5')) === 44, await H('#b5'));
  v.ok('terciário 32 px', (await H('#b6')) === 32, await H('#b6'));
  const bg0 = await cs('#b1', 'backgroundColor'); await pg.hover('#b1'); await pg.waitForTimeout(300);
  const bg1 = await cs('#b1', 'backgroundColor'); v.ok('hover muda fundo do primário', bg0 !== bg1, [bg0, bg1]);
  v.ok('desabilitado: cursor not-allowed', (await cs('#b3', 'cursor')) === 'not-allowed');
  v.ok('desabilitado muda fundo', (await cs('#b3', 'backgroundColor')) !== bg0);
  const anim = (await pg.evaluate(`getComputedStyle(document.querySelector('#b4'),'::before').animationName`)) as string;
  v.ok('aria-busy: animação ativa', anim.includes('seraphim-gira'), anim);
  v.ok('escuro: desabilitado sem preenchimento', ['rgba(0, 0, 0, 0)', 'transparent'].includes(await cs('#d3', 'backgroundColor')), await cs('#d3', 'backgroundColor'));
  v.ok('escuro: primário é claro', (await cs('#d1', 'backgroundColor')) !== bg0, await cs('#d1', 'backgroundColor'));
  v.ok('campo erro: borda de erro', (await cs('#in1', 'borderTopColor')) !== (await cs('#in2', 'borderTopColor')));
  // hover de campo: só a borda escurece, e só no estado de repouso
  const tok = (n: string) => pg.evaluate((t) => { const d = document.createElement('div'); d.style.color = `var(${t})`; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; }, n);
  const bHover = await tok('--color-input-border-hover');
  const bRepouso = await tok('--color-input-border');
  const borda = (s: string) => cs(s, 'borderTopColor');
  const sobCursor = async (s: string) => { await pg.mouse.move(0, 0); const a = await borda(s); await pg.hover(s); const b = await borda(s); return [a, b] as const; };
  const [in3a, in3b] = await sobCursor('#in3');
  v.ok('hover de campo: repouso usa a borda do campo', in3a === bRepouso, [in3a, bRepouso]);
  v.ok('hover de campo: borda escurece para o token', in3b === bHover && in3b !== in3a, [in3a, in3b, bHover]);
  const [, ta1b] = await sobCursor('#ta1');
  v.ok('hover de campo: vale em textarea', ta1b === bHover, [ta1b, bHover]);
  const fundo0 = await cs('#in3', 'backgroundColor'); await pg.hover('#in3');
  v.ok('hover de campo: fundo não muda', (await cs('#in3', 'backgroundColor')) === fundo0);
  for (const [id, nome] of [['#in1', 'com erro'], ['#in2', 'desabilitado'], ['#in4', 'somente leitura']] as const) {
    const [a, b] = await sobCursor(id);
    v.ok(`hover de campo: não vale ${nome}`, a === b && b !== bHover, [a, b]);
  }
  await pg.focus('#in3'); await pg.hover('#in3');
  const focoCor = await borda('#in3');
  v.ok('hover de campo: foco vence o hover', focoCor === (await tok('--color-input-border-focus')), [focoCor]);
  await pg.evaluate(() => (document.activeElement as HTMLElement).blur());
  await pg.mouse.move(0, 0);
  // foco visível
  await pg.keyboard.press('Escape'); await pg.focus('#b1'); await pg.keyboard.press('Shift+Tab'); await pg.keyboard.press('Tab');
  v.ok('foco visível no botão: outline 2px', (await cs('#b1', 'outlineWidth')) === '2px', await cs('#b1', 'outlineWidth'));
  await pg.close();
  v.fim();
});

test('componentes: movimento reduzido e 390 px', async () => {
  const v = verificacoes();
  const q = await abrir(amb, URL, 1280, { reducedMotion: 'reduce' });
  v.ok('movimento reduzido: sem animação no indicador', (await q.evaluate(`getComputedStyle(document.querySelector('#b4'),'::before').animationName`)) === 'none');
  const r = await abrir(amb, URL, 390);
  const sw = (await r.evaluate(`[document.querySelector('#tl').scrollWidth,document.querySelector('#tl').clientWidth]`)) as number[];
  v.ok('390 px: abas rolam na horizontal', sw[0]! > sw[1]!, sw);
  await r.focus('#t2'); await r.keyboard.press('End'); await r.waitForTimeout(400);
  v.ok('390 px: aba ativa rola para a vista', await r.evaluate(`(()=>{const t=document.querySelector('#t6').getBoundingClientRect(),l=document.querySelector('#tl').getBoundingClientRect();return t.right<=l.right+1&&t.left>=l.left-1})()`));
  const dw = await r.evaluate('document.documentElement.scrollWidth');
  v.ok('390 px: sem rolagem horizontal da página', (dw as number) <= 390, dw);
  v.fim();
});

for (const [w, cols, gut, px, sy] of [[1280, 12, 24, 64, 96], [1000, 12, 24, 64, 96], [768, 8, 24, 32, 80], [390, 4, 16, 16, 64]] as const) {
  test(`grade ${w}px: colunas, margem, respiro e blocos`, async () => {
    const v = verificacoes();
    const r = await abrir(amb, URL, w);
    const m = (await r.evaluate(`(()=>{const s=getComputedStyle(document.documentElement);const g=getComputedStyle(document.querySelector('#gd'));const ct=getComputedStyle(document.querySelector('#ct'));return {cols:s.getPropertyValue('--layout-columns').trim(),gut:g.columnGap,tpl:g.gridTemplateColumns.split(' ').length,px:ct.paddingLeft,sy:s.getPropertyValue('--layout-section-y').trim(),sg:s.getPropertyValue('--layout-section-gap').trim(),w:[...document.querySelectorAll('#gd > div')].map(e=>Math.round(e.getBoundingClientRect().width))}})()`)) as { cols: string; gut: string; tpl: number; px: string; sy: string; sg: string; w: number[] };
    v.ok(`${w}px: ${cols} colunas, gutter ${gut}, margem ${px}`, m.cols === String(cols) && m.gut === `${gut}px` && m.tpl === cols && m.px === `${px}px`, m);
    v.ok(`${w}px: respiro de seção ${sy} e entre blocos`, m.sy !== '' && m.sg !== '', m);
    const ws = m.w;
    if (w >= 960) v.ok(`${w}px: 4+4+4 em linha, cada um de 4 colunas`, ws[0] === ws[1] && ws[1] === ws[2] && Math.abs(ws[0]! * 3 + gut * 2 - Math.min(1200, w - 2 * px)) <= 3, ws);
    else if (w >= 640) v.ok(`${w}px: 4+4 e 8 (terceiro ocupa a largura toda)`, ws[0] === ws[1] && ws[2]! > ws[0]! * 2 - 1, ws);
    else v.ok(`${w}px: coluna única, três itens com a largura toda`, ws[0] === ws[1] && ws[1] === ws[2], ws);
    v.ok(`${w}px: sem rolagem horizontal`, await r.evaluate('document.documentElement.scrollWidth<=window.innerWidth'));
    v.fim();
  });
}
