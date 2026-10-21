// Fidelidade do site ao design system: decisões de marca aprovadas (2026-10-20), padrões de chamada da Voz,
// estilo só por classe e o logotipo (moldura que abraça o texto, cor pela superfície).
import { test, before, after } from 'node:test';
import { abrir, descer, subir, verificacoes, type Ambiente } from './helpers.ts';

let amb: Ambiente;
before(async () => { amb = await subir(); });
after(async () => { await descer(amb); });

const PAGINAS = ['/src/site/index.html', '/src/site/contato.html'];

test('marca: textos seguem as decisões aprovadas e a Voz', async () => {
  const v = verificacoes();
  for (const url of PAGINAS) {
    const pg = await abrir(amb, url, 1440);
    const nome = url.split('/').pop();
    const texto = (await pg.evaluate(() => document.body.innerText)) as string;
    v.ok(`${nome}: NEXO sem ™ (aprovado em 2026-10-20)`, !texto.includes('™'), texto.match(/.{0,20}™/g));
    v.ok(`${nome}: sem "clique aqui"`, !/clique aqui/i.test(texto));
    v.ok(`${nome}: sem "consultoria de marketing"`, !/consultoria de marketing/i.test(texto));
    v.ok(`${nome}: sem emoji`, !/\p{Extended_Pictographic}/u.test(texto.replace(/[©→]/g, '')), texto.match(/\p{Extended_Pictographic}/gu));
    const grafias = [...texto.matchAll(/seraphim\s*\.?\s*co\b/gi)].map((m) => m[0]);
    v.ok(`${nome}: grafia Seraphim.co (ou SERAPHIM.CO no logotipo)`, grafias.length > 0 && grafias.every((g) => g === 'Seraphim.co' || g === 'SERAPHIM.CO'), grafias);
    const estilos = (await pg.evaluate(() => [...document.querySelectorAll('[style]')].map((e) => `${e.className}: ${e.getAttribute('style')}`))) as string[];
    v.ok(`${nome}: estilo inline só no tamanho do logotipo`, estilos.every((s) => /^wordmark: --s: \d+px$/.test(s)), estilos);
    const cta = (await pg.evaluate(() => { const a = document.querySelector('.site-header__cta')!; return [a.getAttribute('aria-label'), a.querySelector('.is-full')?.textContent, a.querySelector('.is-short')?.textContent]; })) as string[];
    v.ok(`${nome}: botão do cabeçalho "Quero meu diagnóstico" / "Diagnóstico"`, cta.join('|') === 'Quero meu diagnóstico|Quero meu diagnóstico|Diagnóstico', cta);
    await pg.close();
  }
  const pg = await abrir(amb, PAGINAS[0]!, 1440);
  const hero = (await pg.evaluate(() => [...document.querySelectorAll('main .section:first-child .actions .btn')].map((b) => b.textContent!.trim()))) as string[];
  v.ok('home: chamadas do hero seguem a Voz', hero.join('|') === 'Quero meu Diagnóstico NEXO|Ver como funciona o NEXO', hero);
  const final = (await pg.evaluate(() => document.querySelector('#contato .btn')!.textContent!.trim())) as string;
  v.ok('home: chamada final "Quero meu diagnóstico"', final === 'Quero meu diagnóstico', final);
  const links = (await pg.evaluate(() => [...document.querySelectorAll('.link-more')].map((a) => [a.textContent!.trim(), a.getAttribute('aria-label') ?? '', a.closest('article')!.querySelector('h3')!.textContent!.trim()]))) as [string, string, string][];
  v.ok('home: "Saiba mais" com nome próprio por cartão, começando pelo texto visível, sem a seta', links.length === 3 && links.every(([t, n, h]) => t === 'Saiba mais →' && n === `Saiba mais sobre o ${h}`) && new Set(links.map((l) => l[1])).size === 3, links);
  await pg.close();
  v.fim();
});

test('marca: logotipo abraça o texto e pega a cor da superfície', async () => {
  const v = verificacoes();
  for (const url of PAGINAS) {
    for (const w of [1440, 768, 390]) {
      const pg = await abrir(amb, url, w, { fontes: true });
      const nome = `${url.split('/').pop()} ${w}px`;
      const m = (await pg.evaluate(() => [...document.querySelectorAll('.wordmark')].map((e) => {
        const s = getComputedStyle(e);
        return { razao: e.getBoundingClientRect().width / parseFloat(s.fontSize), cor: s.color, escuro: !!e.closest('[data-surface="dark"]') };
      }))) as { razao: number; cor: string; escuro: boolean }[];
      const corOnDark = (await pg.evaluate(() => { const d = document.createElement('div'); d.style.color = 'var(--color-text-on-dark)'; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; })) as string;
      const razoes = m.map((x) => x.razao);
      v.ok(`${nome}: moldura com a mesma proporção no cabeçalho e no rodapé`, m.length === 2 && Math.abs(razoes[0]! - razoes[1]!) < 0.05 * razoes[0]!, razoes);
      v.ok(`${nome}: logotipo sobre escuro usa text-on-dark`, m.filter((x) => x.escuro).every((x) => x.cor === corOnDark) && m.some((x) => x.escuro), m);
      await pg.close();
    }
  }
  const pg = await abrir(amb, PAGINAS[1]!, 1440);
  const req = (await pg.evaluate(() => [...document.querySelectorAll('.field__req')].map((e) => getComputedStyle(e).fontWeight + ' ' + getComputedStyle(e).color))) as string[];
  const sec = (await pg.evaluate(() => { const d = document.createElement('div'); d.style.color = 'var(--color-text-secondary)'; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; })) as string;
  v.ok('contato: "(obrigatório)" em peso regular e texto secundário', req.length === 4 && req.every((r) => r === `400 ${sec}`), req);
  await pg.close();
  v.fim();
});
