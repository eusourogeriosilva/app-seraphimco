// Fidelidade do site ao design system: decisões de marca aprovadas (2026-10-20), padrões de chamada da Voz,
// estilo só por classe e o logotipo (moldura que abraça o texto, cor pela superfície).
import { test, before, after } from 'node:test';
import { abrir, descer, subir, verificacoes, type Ambiente } from './helpers.ts';

let amb: Ambiente;
before(async () => { amb = await subir(); });
after(async () => { await descer(amb); });

const PAGINAS = ['/src/site/index.html', '/src/site/contato.html', '/src/site/servicos/diagnostico-nexo.html', '/src/site/servicos/consultoria-nexo.html', '/src/site/palestras.html'];

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
  const artigo = (h: string) => (/^(Consultoria|Palestra|Mentoria)/.test(h) ? 'a' : 'o');
  v.ok('home: "Saiba mais" com nome próprio por cartão, começando pelo texto visível, sem a seta', links.length === 3 && links.every(([t, n, h]) => t === 'Saiba mais →' && n === `Saiba mais sobre ${artigo(h)} ${h}`) && new Set(links.map((l) => l[1])).size === 3, links);
  const titulos = (await pg.evaluate(() => [...document.querySelectorAll('h1, h2, h3')].map((h) => getComputedStyle(h).overflowWrap))) as string[];
  v.ok('home: títulos com overflow-wrap: break-word', titulos.length > 0 && titulos.every((o) => o === 'break-word'), [...new Set(titulos)]);
  await pg.close();
  v.fim();
});

test('conteúdo: portfólio da Tatiane (19/10) aplicado, sem notas internas', async () => {
  const v = verificacoes();
  const INTERNO = /Você vende|Valor estratégico|Público PRINCIPAL|Canal de aquisição|gancho natural|Oferta principal|Para vender (diagnóstico|palestras)/i;
  let todo = '';
  for (const url of PAGINAS) {
    const pg = await abrir(amb, url, 1440);
    const nome = url.split('/').pop();
    // inclui painéis de abas ocultos e respostas fechadas do FAQ
    const texto = (await pg.evaluate(() => document.body.textContent!.replace(/\s+/g, ' '))) as string;
    todo += texto;
    v.ok(`${nome}: sem notas internas do documento`, !INTERNO.test(texto), texto.match(INTERNO));
    v.ok(`${nome}: sem "Programa NEXO" nem "Mentoria NEXO"`, !/Programa NEXO|Mentoria NEXO/.test(texto));
    v.ok(`${nome}: Consultoria sem "8 semanas"`, !/8 semanas|oito semanas/i.test(texto));
    v.ok(`${nome}: nome completo, sem "Tati "`, !/\bTati\b/.test(texto));
    await pg.close();
  }
  v.ok('site: pilares N Negócio, E Experiência, X Expansão, O Oportunidade', ['Negócio', 'Experiência', 'Expansão', 'Oportunidade'].every((p) => todo.includes(p)) && !/Núcleo da carteira|Oportunidades de crescimento/.test(todo));
  v.ok('site: "Conectando relacionamento, carteira e crescimento"', todo.includes('Conectando relacionamento, carteira e crescimento'));
  v.ok('site: Consultoria em 90 dias / 3 meses', /90 dias/.test(todo) && /3 meses/.test(todo));
  const pg = await abrir(amb, PAGINAS[0]!, 1440);
  await pg.waitForFunction(() => !!document.querySelector('script[type="application/ld+json"]'));
  const ld = JSON.parse((await pg.evaluate(() => document.querySelector('script[type="application/ld+json"]')!.textContent)) as string) as { '@type': string; mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
  const faq = (await pg.evaluate(() => [...document.querySelectorAll('#perguntas summary')].map((s) => s.textContent!.trim()))) as string[];
  v.ok('home: FAQPage com as 8 perguntas da página', ld['@type'] === 'FAQPage' && ld.mainEntity.length === 8 && ld.mainEntity.every((q, i) => q.name === faq[i] && q.acceptedAnswer.text.length > 40), ld.mainEntity.map((q) => q.name));
  await pg.close();
  v.fim();
});

test('abas nas páginas: página não rola ao carregar; esmaecimento some no fim da rolagem', async () => {
  const v = verificacoes();
  for (const url of ['/src/site/servicos/consultoria-nexo.html', '/src/site/palestras.html']) {
    const nome = url.split('/').pop();
    for (const w of [1440, 390]) {
      const pg = await abrir(amb, url, w, { fontes: true, esperar: 300 });
      v.ok(`${nome} ${w}px: abre no topo`, (await pg.evaluate(() => scrollY)) === 0, await pg.evaluate(() => scrollY));
      const mascara = () => pg.evaluate(() => { const l = document.querySelector('.tabs')!; const s = getComputedStyle(l); return { fim: l.hasAttribute('data-fim'), mask: s.maskImage || s.getPropertyValue('-webkit-mask-image'), sobra: l.scrollWidth - l.clientWidth }; });
      const ini = await mascara();
      if (ini.sobra > 1) {
        v.ok(`${nome} ${w}px: com rolagem, começa esmaecida`, !ini.fim && ini.mask !== 'none', ini);
        await pg.focus('.tab[aria-selected="true"]');
        const y0 = (await pg.evaluate(() => scrollY)) as number;
        await pg.keyboard.press('End'); await pg.waitForTimeout(100);
        const y1 = (await pg.evaluate(() => scrollY)) as number;
        const fim = await mascara();
        const visivel = (await pg.evaluate(() => { const l = document.querySelector('.tabs')!.getBoundingClientRect(); const t = document.querySelector('.tab[aria-selected="true"]')!.getBoundingClientRect(); return t.left >= l.left - 1 && t.right <= l.right + 1; })) as boolean;
        v.ok(`${nome} ${w}px: End leva à última aba, inteira e sem esmaecimento`, fim.fim && fim.mask === 'none' && visivel, [fim, visivel]);
        v.ok(`${nome} ${w}px: teclado nas abas não rola a página`, y0 === y1, [y0, y1]);
      } else {
        v.ok(`${nome} ${w}px: sem rolagem, sem esmaecimento`, ini.fim, ini);
      }
      await pg.close();
    }
  }
  v.fim();
});

test('páginas: sem rolagem horizontal em 390 e 320 px, também com texto a 200%', async () => {
  const v = verificacoes();
  for (const url of PAGINAS) {
    for (const [w, css] of [[390, ''], [320, ''], [390, 'html{font-size:200%}'], [320, 'html{font-size:200%}']] as const) {
      const pg = await abrir(amb, url, w, { fontes: true, extraCss: css || undefined, esperar: 200 });
      const r = (await pg.evaluate(() => ({ sw: document.documentElement.scrollWidth, fora: [...document.querySelectorAll('main *, header *, footer *')].filter((e) => !e.closest('.tabs') && e.getBoundingClientRect().right > innerWidth + 1).map((e) => `${e.tagName}.${e.className}`).slice(0, 4) }))) as { sw: number; fora: string[] };
      v.ok(`${url.split('/').pop()} ${w}px${css ? ' texto 200%' : ''}: nada passa da largura`, r.sw <= w && r.fora.length === 0, r);
      await pg.close();
    }
  }
  v.fim();
});

test('navegação: cabeçalho e rodapé iguais em todas as páginas', async () => {
  const v = verificacoes();
  let ref = '';
  for (const url of PAGINAS) {
    const pg = await abrir(amb, url, 1440);
    const nav = (await pg.evaluate(() => [...document.querySelectorAll('.site-header__nav a, .site-footer__links a')].map((a) => a.textContent!.trim()).join('|'))) as string;
    if (!ref) ref = nav;
    v.ok(`${url.split('/').pop()}: links do cabeçalho e do rodapé`, nav === ref && nav.includes('Palestras') && nav.includes('Perguntas frequentes'), nav);
    await pg.close();
  }
  v.fim();
});

test('marca: todo botão declara a variante e o primário reage ao hover', async () => {
  const v = verificacoes();
  for (const url of PAGINAS) {
    const pg = await abrir(amb, url, 1440);
    const nome = url.split('/').pop();
    const sem = (await pg.evaluate(() => [...document.querySelectorAll('.btn:not([data-variant])')].map((b) => b.textContent!.trim()))) as string[];
    v.ok(`${nome}: nenhum .btn sem data-variant`, sem.length === 0, sem);
    const ids = (await pg.evaluate(() => [...document.querySelectorAll('.btn[data-variant="primary"]')].map((b, i) => { b.setAttribute('data-t', String(i)); return i; }))) as number[];
    for (const i of ids) {
      const sel = `[data-t="${i}"]`;
      await pg.mouse.move(0, 0);
      const antes = (await pg.$eval(sel, (b) => getComputedStyle(b).backgroundColor)) as string;
      await pg.hover(sel); await pg.waitForTimeout(300); // transição de motion-duration-fast
      const depois = (await pg.$eval(sel, (b) => getComputedStyle(b).backgroundColor)) as string;
      v.ok(`${nome}: hover muda o fundo do primário ${i}`, antes !== depois, [antes, depois]);
    }
    await pg.close();
  }
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
