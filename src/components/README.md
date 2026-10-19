# Componentes

`src/styles/components.css` traz botão, tag, alerta, campo, casca de card, esqueleto, abas, navegação por etapas e FAQ. `src/components/tabs.ts` traz o comportamento das abas de painel. Só tokens semânticos e de componente.

## Regras
- Variação por atributo: `data-variant` (primary, secondary, tertiary), `data-tone` (neutral, brand, accent, success, warning, danger, info), `data-size` (md é o padrão, sm), `data-surface` (light é o padrão, dark, declarado no contêiner).
- Estado nunca é classe: `:hover` (só com `@media (hover: hover)`), `:focus-visible`, `:disabled` ou `[aria-disabled="true"]`, `[aria-busy="true"]`, `[aria-invalid="true"]`, `[aria-selected]`, `[aria-current]`, `[open]`.
- Use `aria-disabled` quando houver motivo a explicar (mantém o foco); `disabled` nos demais casos.

- Alturas são mínimas (`min-height`): botão 48, botão sm 44, terciário 32, campo 48, tag 28 e 26. Em contêiner flex com `align-items` padrão, itens de tamanhos diferentes na mesma linha se esticam; use `align-items: flex-start` ou `center`.
- Tamanho de fonte só por token (`var(--font-size-*)`); botão, campo e corpo ficam em 16 px, apoio em 14 px e tag em 12 px. O lint `fonte-fora-da-escala` barra o resto.

## Marcação
```html
<button class="btn" data-variant="primary" data-size="sm">Falar conosco</button>
<button class="btn" data-variant="primary" aria-busy="true">Enviando…</button>
<span class="tag" data-tone="success">Concluído</span>
<div class="alert" data-tone="danger" role="alert"><strong>Revise 2 campos</strong><span class="alert__text">Nome. E-mail.</span></div>

<div class="field">
  <label class="field__label" for="email">E-mail</label>
  <input class="field__input" id="email" type="email" aria-invalid="true" aria-describedby="email-erro">
  <p class="field__error" id="email-erro">Informe um e-mail completo.</p>
</div>

<nav aria-label="Etapas"><div class="steps"><a href="/atrair" aria-current="page">Atrair</a><a href="/converter">Converter</a></div></nav>

<div class="tabs" role="tablist" aria-label="Etapas">
  <button class="tab" role="tab" id="t1" aria-controls="p1" aria-selected="true" tabindex="0">Atrair</button>
  <button class="tab" role="tab" id="t2" aria-controls="p2" aria-selected="false" tabindex="-1">Converter</button>
</div>
<div class="tabpanel" role="tabpanel" id="p1" aria-labelledby="t1" tabindex="0">…</div>
<div class="tabpanel" role="tabpanel" id="p2" aria-labelledby="t2" tabindex="0" hidden>…</div>

<details class="faq"><summary>Pergunta<span class="faq__sign" aria-hidden="true"></span></summary><div class="faq__answer">Resposta.</div></details>
```

```ts
import { initTabs } from './components/tabs.ts';
initTabs();
```

Navegação por etapas (`.steps`, links com endereço próprio) e abas de painel (`.tabs`, mesmo painel) têm o mesmo visual e marcação diferente. Não misture.

## Grade
```html
<div class="container">
  <div class="grid">
    <article data-span="4" data-span-md="4">…</article>
    <article data-span="4" data-span-md="4">…</article>
    <article data-span="4" data-span-md="8">…</article>
  </div>
</div>
```
12, 8 ou 4 colunas por faixa. `data-span` vale a partir de 960 px, `data-span-md` de 640 a 959 px; no celular tudo empilha. Sem atributo, o item ocupa a linha inteira.

## Verificado em navegador
Teclado das abas (setas, Home, End, volta nas pontas, foco móvel, Tab para o painel), FAQ com itens independentes (Enter e Espaço), alturas (botão 48/44/32, aba 44, linha do FAQ 56), tamanhos dos títulos nas três faixas, texto a 200% sem corte em 1280, 390 e 320 px, hover, desabilitado, indicador de carregando com e sem `prefers-reduced-motion`, rolagem horizontal das abas em 390 px, grade (colunas, gutter, margem e respiros) em 1280, 1000, 768 e 390 px, sem rolagem horizontal da página. Ainda não verificado com leitor de tela.
