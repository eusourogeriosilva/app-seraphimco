// Seraphim.co — validação acessível de formulário (sem dependências).
// Padrão: erro inline (ícone + texto) ligado por aria-describedby + resumo role="alert" com links para os campos.
// Valida ao enviar e, depois do primeiro envio, ao sair de cada campo; corrigir o campo limpa o erro na hora.
// Após envio inválido o foco vai ao resumo; sucesso vai a um [role="status"] sem mover o foco.
// Marcação: ver src/components/README.md (seção Formulário).

const MENSAGENS = {
  faltando: 'Preencha este campo.',
  email: 'Informe um e-mail completo, como nome@empresa.com.br.',
  telefone: 'Informe o telefone com DDD, só números ou com traços e parênteses.',
  consentimento: 'Marque a caixa para continuar.',
} as const;

type Controle = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

// Ícones da prancha "05 · Componentes": erro de campo 16 px; alertas 20 px. Decorativos: o texto carrega o sentido.
const SVG = 'http://www.w3.org/2000/svg';
type Parte = [string, Record<string, string>];
const ICONES: Record<'campo' | 'erro' | 'sucesso', [number, number, Parte[]]> = {
  campo: [16, 2, [['circle', { cx: '12', cy: '12', r: '9' }], ['path', { d: 'M12 7v6M12 16v.5' }]]],
  erro: [20, 1.75, [['circle', { cx: '12', cy: '12', r: '9' }], ['path', { d: 'M9 9l6 6M15 9l-6 6' }]]],
  sucesso: [20, 1.75, [['path', { d: 'M5 12l4 4 10-10' }]]],
};

function icone(tipo: keyof typeof ICONES): SVGSVGElement {
  const [tam, traco, partes] = ICONES[tipo];
  const s = document.createElementNS(SVG, 'svg');
  const attrs: Record<string, string> = { width: String(tam), height: String(tam), viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': String(traco), 'stroke-linecap': 'square', 'aria-hidden': 'true', focusable: 'false' };
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  for (const [tag, a] of partes) {
    const el = document.createElementNS(SVG, tag);
    for (const [k, v] of Object.entries(a)) el.setAttribute(k, v);
    s.append(el);
  }
  return s;
}

function rotuloDe(c: Controle): string {
  const l = c.labels?.[0];
  if (!l) return c.name || c.id;
  const clone = l.cloneNode(true) as HTMLElement;
  for (const x of clone.querySelectorAll('[data-form-ignore], .field__error')) x.remove();
  return (clone.textContent ?? '').replace(/\s*\(obrigatório\)\s*/i, '').trim().replace(/\.$/, '');
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
    el.append(icone('campo'), document.createElement('span'));
    // Nunca dentro do <label>: o texto do erro entraria no nome do controle. No .check, vai depois do rótulo.
    const campo = c.closest('.field');
    const check = c.closest('.check');
    if (campo) campo.append(el);
    else if (check) check.after(el);
    else c.parentElement?.append(el);
  }
  el.querySelector('span')!.textContent = msg;
  c.setAttribute('aria-invalid', 'true');
  c.setAttribute('aria-describedby', [...resto, id].join(' '));
}

function alerta(destino: HTMLElement, tipo: 'erro' | 'sucesso', titulo: string, corpo: HTMLElement): void {
  const t = document.createElement('strong');
  t.textContent = titulo;
  const div = document.createElement('div');
  div.append(t, corpo);
  destino.replaceChildren(icone(tipo), div);
}

export function initForm(form: HTMLFormElement): void {
  form.noValidate = true;
  const resumo = form.querySelector<HTMLElement>('[data-form-summary]');
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const controles = (): Controle[] => [...form.elements].filter((e): e is Controle => e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement || e instanceof HTMLSelectElement).filter((c) => c.id && c.type !== 'hidden' && c.type !== 'submit');
  let enviado = false;

  const montarResumo = (focar: boolean): number => {
    const erros = controles().map((c) => ({ c, msg: c.getAttribute('aria-invalid') === 'true' ? mensagemDe(c) : '' })).filter((x) => x.msg);
    if (!resumo) return erros.length;
    if (!erros.length) { resumo.hidden = true; resumo.replaceChildren(); delete resumo.dataset['conteudo']; return 0; }
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
    const n = erros.length;
    const titulo = n === 1 ? 'Revise 1 campo antes de enviar' : `Revise ${n} campos antes de enviar`;
    // role="alert" anuncia cada mudança: fora do envio, só refaz o resumo se o conteúdo mudou.
    const novo = `${titulo}|${[...ul.querySelectorAll('a')].map((a) => a.textContent).join('|')}`;
    if (focar || resumo.hidden || resumo.dataset['conteudo'] !== novo) {
      alerta(resumo, 'erro', titulo, ul);
      resumo.dataset['conteudo'] = novo;
    }
    resumo.hidden = false;
    if (focar) { resumo.tabIndex = -1; resumo.focus(); }
    return n;
  };

  // Corrigir limpa na hora; a mensagem de um erro que continua só muda ao sair do campo.
  form.addEventListener('input', (e) => {
    const c = e.target as Controle;
    if (c.getAttribute?.('aria-invalid') === 'true' && !mensagemDe(c)) {
      mostrarErro(c, '');
      if (resumo && !resumo.hidden) montarResumo(false);
    }
  });

  // Depois do primeiro envio, valida ao sair do campo (o checkbox valida ao mudar, que é quando o usuário age nele).
  const validarCampo = (e: Event) => {
    const c = e.target as Controle;
    if (!enviado || !controles().includes(c)) return;
    mostrarErro(c, mensagemDe(c));
    if (resumo && !resumo.hidden) montarResumo(false);
  };
  form.addEventListener('focusout', validarCampo);
  form.addEventListener('change', (e) => { if ((e.target as HTMLInputElement).type === 'checkbox') validarCampo(e); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    enviado = true;
    if (status) status.replaceChildren();
    for (const c of controles()) mostrarErro(c, mensagemDe(c));
    if (montarResumo(true)) return;
    // Cancelável: quem trata o envio (back-end) chama preventDefault() e assume o anúncio de sucesso ou falha.
    const ev = new CustomEvent('seraphim:enviar', { cancelable: true, detail: new FormData(form) });
    if (!form.dispatchEvent(ev)) return;
    if (status) {
      const s = document.createElement('span');
      s.className = 'alert__text';
      s.textContent = 'Respondemos em até 1 dia útil.';
      alerta(status, 'sucesso', 'Mensagem enviada', s);
    }
    form.reset();
    enviado = false;
  });
}
