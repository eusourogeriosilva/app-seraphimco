# Changelog dos tokens Seraphim.co

Formato: [semver](https://semver.org/lang/pt-BR/). Token removido ou renomeado é major; token novo é minor; valor ou descrição alterados é patch. A CI recusa um pull request que mude `seraphim.tokens.json` sem o bump e sem a seção correspondente aqui.

## [2.4.0] - 2026-10-18

Base: grade e espaçamento aprovados na placa "04 · Grid e espaçamento" do canvas.

### Adicionado
- Grade por faixa de tela: `layout-columns` (12, 8, 4), `layout-gutter` (24, 24, 16). Faixas: desktop a partir de 960 px, tablet de 640 a 959 px, celular até 639 px.
- `layout-gap-tight` (8 px), `layout-measure-body` (680 px) e `layout-measure-lead` (840 px).
- Suporte a valores por faixa na fonte (`$extensions["co.seraphim"].responsive`, com `md` e `sm`): o `tokens.css` ganha blocos `@media (max-width: 959px)` e `(max-width: 639px)`, e o `tokens.ts` exporta o mapa `responsive`. O valor padrão do token é o de desktop. O `check-version` passa a comparar também esses valores.
- Lint `espacamento-fora-da-escala`: `padding`, `margin` e `gap` só com `var(--space-*)`, 0, auto ou ±1 px. Falha a CI.
- `src/styles/base.css`: `.grid` com `data-span` (desktop) e `data-span-md` (tablet), `.container`, `.measure-body` e `.measure-lead`. No celular a grade empilha.

### Alterado
- `layout-page-x` passa a 32 px no tablet e 16 px no celular (64 px no desktop, como antes).
- `layout-section-y` passa a 80 px no tablet e 64 px no celular (96 px no desktop, como antes).
- `layout-section-gap` passa a 48 px no tablet e 40 px no celular (56 px no desktop, como antes).
- Descrições de `layout-gap-stack` e `layout-section-gap`.
- Folha de componentes na escala: 10 px, 6 px, 14 px e 28 px viram 8, 8, 16 e 24 px (alerta 4 px mais alto); padding lateral da aba, de 2 px para 0.

### Fora desta versão
- Escala tipográfica por faixa e o site completo em tablet e celular.
- Os breakpoints de `@media` em `base.css` (640 e 960) são literais, porque CSS não aceita `var()` em media query. Se `breakpoint-sm` ou `breakpoint-md` mudar, ajuste-os.

## [2.3.1] - 2026-10-18

### Alterado
- `size-control-sm`: de 40 px para 44 px. Alinha o token à decisão de botão sm da placa "05 · Variantes" (o cabeçalho tinha 40 px em Componentes e 44 px no Site) e ao alvo da aba. Nenhuma peça em `src/` o usava antes.

## [2.3.0] - 2026-10-18

Base: matriz de estados aprovada na placa "05 · Estados" do canvas (estado vem de pseudo-classe ou atributo ARIA, nunca de classe).

### Adicionado
- `color-button-disabled-dark-text` e `color-button-disabled-dark-border`: botão desabilitado sobre bordô e grafite, sem preenchimento (3,24:1 e 4,58:1).
- `color-input-bg-disabled`: fundo do campo desabilitado.
- `color-bg-skeleton`: barras do esqueleto de carregamento de conteúdo (decorativo, sem animação).
- `motion-duration-spin` (900 ms): uma volta do indicador de carregando. Entra porque o lint passa a exigir token em toda animação.
- 8 pares de contraste obrigatórios no build (de 52 para 60): desabilitado sobre escuro, texto desabilitado sobre os dois fundos desabilitados, borda e mensagem de erro do campo.
- Regras de lint `movimento-literal` (transition e animation só com tokens `motion-*`) e `sem-movimento-reduzido` (animation exige `prefers-reduced-motion` no mesmo arquivo). Ambas falham a CI.

### Alterado
- Descrição de `color-button-disabled-bg`: vale para superfície clara.

### Fora desta versão
- Hover de campo, aba e FAQ: sem desenho ainda.
- Estado desabilitado de tag, aba e FAQ: sem uso real.
- Estados de página (vazio, 404, offline).

## [2.2.0] - 2026-10-18

Base: modelo de variantes (tipo, tom, tamanho e superfície) aprovado na placa "05 · Variantes" do canvas.

### Adicionado
- 22 tokens de botão nomeados por tipo e superfície: `color-button-{primary|secondary|tertiary}-{light|dark}-*`, com fundo, texto, contorno, sublinhado e estados de hover. Inclui o hover que não existia (secundário, terciário e superfícies escuras) e o terciário sobre escuro. `color-button-disabled-bg` e `color-button-disabled-text` cobrem o desabilitado sobre superfície clara.
- 3 tokens de casca de card: `color-card-light-bg`, `color-card-light-border` e `color-card-dark-bg`.
- 21 pares de contraste obrigatórios no build (de 31 para 52): hover, contorno e sublinhado do botão em superfície clara e escura, texto do terciário sobre bordô e grafite.
- Suporte a `$deprecated` (DTCG) na fonte, no build e no lint: o `tokens.ts` ganha o mapa `deprecated`, o `lint:tokens` emite o aviso `token-obsoleto` (não falha a CI) e o editor do Design System deixa de listar tokens obsoletos.

### Descontinuado
Seguem funcionando, com o mesmo valor, e saem na 3.0.0.
- `color-button-primary-bg`, `-primary-bg-hover` e `-primary-text`: use `color-button-primary-light-bg`, `-bg-hover` e `-text`.
- `color-button-secondary-border` e `-secondary-text`: use `color-button-secondary-light-border` e `-text`.
- `color-button-inverse-bg` e `-inverse-text`: use `color-button-primary-dark-bg` e `-text`.
- `color-button-outline-on-dark`: use `color-button-secondary-dark-text` (texto) ou `color-button-secondary-dark-border` (contorno).

### Alterado
- A regra de cor proibida sobre escuro (framboesa sobre grafite) passa a valer também para tokens com `-dark-` no nome.

### Fora desta versão
- Tokens de tag e de alerta: o tom já está nos tokens `color-status-*`, sem variação de estado. Um token de componente só entra com dois usos e variação própria.
- Estado desabilitado sobre superfície escura e superfície escura de tag, campo, abas, FAQ e tabela: sem desenho ainda.

## [2.1.0] - 2026-10-18

### Adicionado
- Fonte única em W3C DTCG 2025.10, com três camadas: primitivos, semânticos e componente.
- Semânticos de cor para fundo, texto, acento, borda, foco e estados, incluindo `color-text-secondary-on-dark` (antes `#D9D3CF` solto) e `color-border-on-dark` (antes três transparências diferentes).
- `color-bg-muted` para placeholders de imagem.
- Tokens de componente para botão, campo e card de oferta.
- Escalas de espaçamento (com 20, 40, 56, 72 e 80), raio, espessura de borda, tamanho, breakpoint, tracking, entrelinha, movimento e sombra.
- Estilos de texto compostos para web e redes sociais.
- 31 pares de contraste obrigatórios verificados no build.

### Alterado
- Pedra 400 e Pedra 600 deixam de usar o prefixo de Papel.
- Letter-spacing consolidado de 12 valores para 5 tokens.
