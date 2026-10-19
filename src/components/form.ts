// Seraphim.co — validação acessível de formulário (sem dependências).
// Padrão: erro inline ligado por aria-describedby + resumo role="alert" com links para os campos.
// Após envio inválido o foco vai ao resumo; sucesso vai a um [role="status"] sem mover o foco.
// Marcação: ver src/components/README.md (seção Formulário).

const MENSAGENS = {
  faltando: 'Preencha este campo.',
  email: 'Informe um e-mail completo, como nome@empresa.com.br.',
  telefone: 'Informe o telefone com DDD, só números ou com traços e parênteses.',
  consentimento: 'Marque a caixa para continuar.',
} as const;

type Controle = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function rotuloDe(c: Controle): string {
  const l = c.labels?.[0];
  if (!l) return c.name || c.id;
  const clone = l.cloneNode(true) as HTMLElement;
  for (const x of clone.querySelectorAll('[data-form-ignore]')) x.remove();
  return (clone.textContent ?? '').replace(/\s*\(obrigatório\)\s*/i, '').trim();
}

function mensagemDe(c: Controle): string {
  if (c instanceof HTMLInputElement && c.type === 'checkbox') return c.checked || !c.required ? '' : MENSAGENS.consentimento;
  const v = c.value.trim();
  if (!v) return c.required ? MENSAGENS.faltando : '';
  if (c instanceof HTMLInputElement && c.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return MENSAGENS.email;
  if (c instanceof HTMLInputElement && c.type === 'tel' && v.replace(/\D/g, '').length < 10) return MENSAGENS.telefone;
  return '';
}

function ids(c: Controle): string[] {
  return (c.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
}

function mostrarErro(c: Controle, msg: string): void {
  const id = `${c.id}-erro`;
  let el = document.getElementById(id);
  const resto = ids(c).filter((x) => x !== id);
  if (!msg) {
    el?.remove();
    c.removeAttribute('aria-invalid');
    if (resto.length) c.setAttribute('aria-describedby', resto.join(' '));
    else c.removeAttribute('aria-describedby');
    return;
  }
  if (!el) {
    el = document.createElement('p');
    el.className = 'field__error';
    el.id = id;
    (c.closest('.field, .check') ?? c.parentElement)?.append(el);
  }
  el.textContent = msg;
  c.setAttribute('aria-invalid', 'true');
  c.setAttribute('aria-describedby', [...resto, id].join(' '));
}

export function initForm(form: HTMLFormElement): void {
  form.noValidate = true;
  const resumo = form.querySelector<HTMLElement>('[data-form-summary]');
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const controles = (): Controle[] => [...form.elements].filter((e): e is Controle => e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement || e instanceof HTMLSelectElement).filter((c) => c.id && c.type !== 'hidden' && c.type !== 'submit');

  form.addEventListener('input', (e) => {
    const c = e.target as Controle;
    if (c.getAttribute?.('aria-invalid') === 'true' && !mensagemDe(c)) mostrarErro(c, '');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (status) status.replaceChildren();
    const erros: { c: Controle; msg: string }[] = [];
    for (const c of controles()) {
      const msg = mensagemDe(c);
      mostrarErro(c, msg);
      if (msg) erros.push({ c, msg });
    }
    if (erros.length && resumo) {
      const n = erros.length;
      resumo.hidden = false;
      resumo.replaceChildren();
      const t = document.createElement('strong');
      t.textContent = n === 1 ? 'Revise 1 campo antes de enviar' : `Revise ${n} campos antes de enviar`;
      const ul = document.createElement('ul');
      ul.className = 'alert__text';
      for (const { c, msg } of erros) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${c.id}`;
        a.textContent = `${rotuloDe(c)}: ${msg.replace(/\.$/, '')}`;
        a.addEventListener('click', (ev) => { ev.preventDefault(); c.focus(); });
        li.append(a);
        ul.append(li);
      }
      resumo.append(t, ul);
      resumo.tabIndex = -1;
      resumo.focus();
      return;
    }
    if (resumo) { resumo.hidden = true; resumo.replaceChildren(); }
    const ev = new CustomEvent('seraphim:enviar', { cancelable: true, detail: new FormData(form) });
    form.dispatchEvent(ev);
    if (status) {
      const t = document.createElement('strong');
      t.textContent = 'Mensagem enviada';
      const s = document.createElement('span');
      s.className = 'alert__text';
      s.textContent = 'Respondemos em até 1 dia útil.';
      status.replaceChildren(t, s);
    }
    form.reset();
  });
}
