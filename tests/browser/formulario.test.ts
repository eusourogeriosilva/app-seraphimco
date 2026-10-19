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

test('todo controle tem rótulo, type e autocomplete; alvo de 44 px', async () => {
  const page = await abrir(amb, URL, 390);
  const r = await page.evaluate(() => [...document.querySelectorAll<HTMLInputElement>('input, textarea')].map((c) => ({ id: c.id, rotulo: !!c.labels?.length, auto: c.type === 'checkbox' || c.tagName === 'TEXTAREA' || !!c.autocomplete, h: Math.round((c.closest('.check') ?? c).getBoundingClientRect().height) })));
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
