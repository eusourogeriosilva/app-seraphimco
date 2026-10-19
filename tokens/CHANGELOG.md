# Changelog dos tokens Seraphim.co

Formato: [semver](https://semver.org/lang/pt-BR/). Token removido ou renomeado é major; token novo é minor; valor ou descrição alterados é patch. A CI recusa um pull request que mude `seraphim.tokens.json` sem o bump e sem a seção correspondente aqui.

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
