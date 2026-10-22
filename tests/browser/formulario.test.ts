// Formulário de contato: erros, resumo, foco, sucesso e teclado.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { abrir, descer, subir, type Ambiente } from './helpers.ts';

let amb: Ambiente;
before(async () => { amb = await subir(); });
after(async () => { await descer(amb); });
const URL = '/src/site/contato.html';

test('envio vazio: resumo com links, foco no resumo, campos marcados', async () => {
  const page = await abrir(amb, URL, 390);
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  const r = await page.evaluate(() => {
    const s = document.querySelector<HTMLElement>('[data-form-summary]')!;
    return {
      visivel: !s.hidden, foco: document.activeElement === s, role: s.getAttribute('role'),
      links: [...s.querySelectorAll('a')].map((a) => a.getAttribute('href')),
      invalidos: [...document.querySelectorAll('[aria-invalid="true"]')].map((e) => e.id),
      ligados: [...document.querySelectorAll('[aria-invalid="true"]')].every((e) => { const d = e.getAttribute('aria-describedby') ?? ''; return d.split(' ').some((id) => document.getElementById(id)?.classList.contains('field__error')); }),
      titulo: s.querySelector('strong')?.textContent,
    };
  });
  assert.equal(r.visivel, true); assert.equal(r.foco, true); assert.equal(r.role, 'alert');
  assert.deepEqual(r.links, ['#nome', '#email', '#mensagem', '#lgpd']);
  assert.deepEqual(r.invalidos, ['nome', 'email', 'mensagem', 'lgpd']);
  assert.equal(r.ligados, true);
  assert.equal(r.titulo, 'Revise 4 campos antes de enviar');
  await page.close();
});

test('link do resumo leva o foco ao campo; corrigir limpa o erro', async () => {
  const page = await abrir(amb, URL, 1440);
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  await page.locator('[data-form-summary] a[href="#email"]').click();
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'email');
  await page.fill('#email', 'ana@corretora');
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  assert.match((await page.textContent('#email-erro')) ?? '', /e-mail completo/);
  await page.fill('#email', 'ana@corretora.com.br');
  assert.equal(await page.locator('#email-erro').count(), 0);
  assert.equal(await page.getAttribute('#email', 'aria-invalid'), null);
  await page.close();
});

test('ajuda do campo (aria-describedby) é preservada ao marcar e limpar erro', async () => {
  const page = await abrir(amb, URL, 1440);
  await page.fill('#whatsapp', '123');
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  assert.equal(await page.getAttribute('#whatsapp', 'aria-describedby'), 'whatsapp-ajuda whatsapp-erro');
  await page.fill('#whatsapp', '11 98888-7777');
  assert.equal(await page.getAttribute('#whatsapp', 'aria-describedby'), 'whatsapp-ajuda');
  await page.close();
});

test('envio válido: status anunciado, foco não se move, formulário limpo', async () => {
  const page = await abrir(amb, URL, 1440);
  await page.fill('#nome', 'Ana Souza'); await page.fill('#email', 'ana@corretora.com.br'); await page.fill('#mensagem', 'Quero entender a minha carteira.');
  await page.check('#lgpd');
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  const r = await page.evaluate(() => { const st = document.querySelector<HTMLElement>('[data-form-status]')!; return { role: st.getAttribute('role'), texto: st.textContent, foco: document.activeElement?.tagName, resumoOculto: document.querySelector<HTMLElement>('[data-form-summary]')!.hidden, nome: (document.getElementById('nome') as HTMLInputElement).value }; });
  assert.equal(r.role, 'status'); assert.match(r.texto ?? '', /Mensagem enviada/); assert.equal(r.foco, 'BUTTON'); assert.equal(r.resumoOculto, true); assert.equal(r.nome, '');
  await page.close();
});

test('erro de campo, resumo e sucesso trazem ícone e texto (nunca só cor)', async () => {
  const page = await abrir(amb, URL, 1440);
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  const erro = await page.evaluate(() => [...document.querySelectorAll('.field__error')].map((p) => [p.querySelector('svg')?.getAttribute('aria-hidden'), p.querySelector('svg')?.getAttribute('width'), p.textContent!.trim().length > 0]));
  assert.equal(erro.length, 4);
  for (const e of erro) assert.deepEqual(e, ['true', '16', true]);
  const resumo = await page.evaluate(() => { const s = document.querySelector('[data-form-summary]')!; return [s.firstElementChild?.tagName.toLowerCase(), s.querySelector('svg')?.getAttribute('width'), s.querySelector('svg')?.getAttribute('aria-hidden')]; });
  assert.deepEqual(resumo, ['svg', '20', 'true']);
  await page.fill('#nome', 'Ana Souza'); await page.fill('#email', 'ana@corretora.com.br'); await page.fill('#mensagem', 'Quero entender a minha carteira.');
  await page.check('#lgpd');
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  const ok = await page.evaluate(() => { const s = document.querySelector('[data-form-status]')!; return [s.firstElementChild?.tagName.toLowerCase(), s.querySelector('svg')?.getAttribute('width'), s.querySelector('strong')?.textContent]; });
  assert.deepEqual(ok, ['svg', '20', 'Mensagem enviada']);
  await page.close();
});

test('depois do primeiro envio, valida ao sair do campo e atualiza o resumo', async () => {
  const page = await abrir(amb, URL, 1440);
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  await page.fill('#email', 'abc');
  assert.match((await page.textContent('#email-erro')) ?? '', /Preencha/, 'a mensagem só muda ao sair do campo');
  await page.locator('#email').press('Tab');
  assert.match((await page.textContent('#email-erro')) ?? '', /e-mail completo/);
  await page.fill('#nome', 'Ana'); await page.locator('#nome').press('Tab');
  assert.equal(await page.getAttribute('#nome', 'aria-invalid'), null);
  await page.fill('#nome', ''); await page.locator('#nome').press('Tab');
  assert.equal(await page.getAttribute('#nome', 'aria-invalid'), 'true');
  const links = await page.evaluate(() => [...document.querySelectorAll('[data-form-summary] a')].map((a) => a.textContent));
  assert.ok(links.some((t) => /^E-mail: Informe um e-mail completo/.test(t ?? '')), JSON.stringify(links));
  await page.close();
});

test('resumo (role="alert") não é refeito quando sair do campo não muda nada', async () => {
  const page = await abrir(amb, URL, 1440);
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  await page.evaluate(() => { const w = window as unknown as { mut: number }; w.mut = 0; new MutationObserver((m) => { w.mut += m.length; }).observe(document.querySelector('[data-form-summary]')!, { childList: true, subtree: true, characterData: true }); });
  await page.focus('#nome'); await page.locator('#nome').press('Tab'); await page.locator('#email').press('Tab');
  assert.equal(await page.evaluate(() => (window as unknown as { mut: number }).mut), 0, 'sem mudança, sem novo anúncio');
  await page.fill('#corretora', 'x'); await page.focus('#nome'); await page.fill('#nome', 'Ana'); await page.locator('#nome').press('Tab');
  assert.ok((await page.evaluate(() => (window as unknown as { mut: number }).mut)) > 0, 'corrigir um campo atualiza o resumo');
  assert.equal(await page.evaluate(() => document.querySelector('[data-form-summary] strong')!.textContent), 'Revise 3 campos antes de enviar');
  await page.close();
});

test('antes do primeiro envio, sair do campo vazio não acusa erro', async () => {
  const page = await abrir(amb, URL, 1440);
  await page.focus('#nome'); await page.locator('#nome').press('Tab');
  assert.equal(await page.getAttribute('#nome', 'aria-invalid'), null);
  assert.equal(await page.locator('.field__error').count(), 0);
  await page.close();
});

test('consentimento: erro fora do rótulo, abaixo dele, e fora do nome acessível', async () => {
  const page = await abrir(amb, URL, 1440);
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  const r = await page.evaluate(() => {
    const err = document.getElementById('lgpd-erro')!; const lbl = document.querySelector('label.check')!;
    return { dentro: lbl.contains(err), abaixo: err.getBoundingClientRect().top >= lbl.getBoundingClientRect().bottom, link: document.querySelector('[data-form-summary] a[href="#lgpd"]')!.textContent };
  });
  assert.equal(r.dentro, false); assert.equal(r.abaixo, true);
  assert.equal(r.link, 'Concordo em ser contatado(a) por e-mail ou WhatsApp sobre esta mensagem: Marque a caixa para continuar');
  const nome = await page.getByRole('checkbox').evaluate((c) => (c as HTMLInputElement).labels![0]!.textContent!);
  assert.doesNotMatch(nome, /Marque a caixa/);
  await page.check('#lgpd');
  assert.equal(await page.locator('#lgpd-erro').count(), 0);
  await page.close();
});

test('seraphim:enviar cancelado: nada é anunciado nem limpo', async () => {
  const page = await abrir(amb, URL, 1440);
  await page.evaluate(() => document.querySelector('form')!.addEventListener('seraphim:enviar', (e) => e.preventDefault()));
  await page.fill('#nome', 'Ana Souza'); await page.fill('#email', 'ana@corretora.com.br'); await page.fill('#mensagem', 'Oi.');
  await page.check('#lgpd');
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  const r = await page.evaluate(() => ({ status: document.querySelector('[data-form-status]')!.textContent, nome: (document.getElementById('nome') as HTMLInputElement).value }));
  assert.equal(r.status, ''); assert.equal(r.nome, 'Ana Souza');
  await page.close();
});

test('?interesse= pré-seleciona a opção; valor desconhecido não seleciona nada', async () => {
  for (const [q, esperado] of [['palestra', 'palestra'], ['consultoria', 'consultoria'], ['x"]', null], ['', null]] as const) {
    const page = await abrir(amb, `${URL}${q ? `?interesse=${encodeURIComponent(q)}` : ''}`, 1440);
    await page.waitForFunction(() => document.querySelector('form')?.noValidate === true);
    const v = await page.evaluate(() => (document.querySelector('input[name="interesse"]:checked') as HTMLInputElement | null)?.value ?? null);
    assert.equal(v, esperado, q);
    await page.close();
  }
});

test('interesse é opcional e vai no envio', async () => {
  const page = await abrir(amb, `${URL}?interesse=palestra`, 1440);
  await page.waitForFunction(() => document.querySelector('form')?.noValidate === true);
  await page.evaluate(() => document.querySelector('form')!.addEventListener('seraphim:enviar', (e) => { (window as unknown as { dados: string }).dados = String((e as CustomEvent<FormData>).detail.get('interesse')); }));
  await page.fill('#nome', 'Ana Souza'); await page.fill('#email', 'ana@corretora.com.br'); await page.fill('#mensagem', 'Evento em março.');
  await page.check('#lgpd');
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  assert.equal(await page.evaluate(() => (window as unknown as { dados: string }).dados), 'palestra');
  assert.equal(await page.locator('[aria-invalid="true"]').count(), 0);
  await page.close();
});

test('todo controle tem rótulo, type e autocomplete; alvo de 44 px', async () => {
  const page = await abrir(amb, URL, 390);
  const r = await page.evaluate(() => [...document.querySelectorAll<HTMLInputElement>('input, textarea')].map((c) => ({ id: c.id, rotulo: !!c.labels?.length, auto: c.type === 'checkbox' || c.type === 'radio' || c.tagName === 'TEXTAREA' || !!c.autocomplete, h: Math.round((c.closest('.check') ?? c).getBoundingClientRect().height) })));
  for (const x of r) { assert.equal(x.rotulo, true, x.id); assert.equal(x.auto, true, x.id); assert.ok(x.h >= 44, `${x.id} ${x.h}`); }
  await page.close();
});

test('zoom de texto a 200% sem rolagem horizontal em 390 px', async () => {
  const page = await abrir(amb, URL, 390);
  await page.addStyleTag({ content: 'html{font-size:200% !important}' });
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  assert.ok(r.sw <= r.cw, JSON.stringify(r));
  await page.close();
});
