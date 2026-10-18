# Tokens Seraphim.co

Fonte única: `seraphim.tokens.json` (W3C DTCG 2025.10). Tudo em `dist/` é gerado; não edite à mão.

Requisitos: Node 24 ou mais recente. Os scripts são TypeScript executado direto pelo Node, sem etapa de compilação, por isso usam só sintaxe apagável (`erasableSyntaxOnly`).

## Comandos

| Comando | O que faz |
|---|---|
| `npm run tokens:build` | Gera `dist/` a partir da fonte e testa os 31 pares de contraste |
| `npm run tokens:check` | Falha se `dist/` estiver desatualizado, se houver alias quebrado ou contraste reprovado |
| `npm run tokens:version` | Compara com `origin/main` e exige o bump de versão e a seção no CHANGELOG |
| `npm run lint:tokens` | Procura em `src/` cor solta (hex, `rgb()`…), token inexistente e primitivo de cor |
| `npm run lint:css` | Stylelint: `color-no-hex`, `color-named` e funções de cor proibidas |
| `npm run typecheck` | TypeScript 7 em modo estrito, incluindo `dist/tokens.ts` |
| `npm run typecheck:ts6` | O mesmo com TypeScript 6.0.3, para código do site que ainda esteja na 6 |
| `npm run ci` | Tudo acima, menos a versão (que precisa da branch base) |

## Saídas

- `dist/tokens.css`: variáveis em três camadas, ligadas por `var()`, e as classes `.type-*`.
- `dist/tokens.ts`: `tokens` (valores resolvidos), `cssVar()`, `typeClass()` e os tipos `TokenName`, `ColorToken`, `SpaceToken`, `TypographyName`.
- `dist/design-system.tokens.json`: o formato do Design System Seraphim.co, que vai para `project/tokens.json` do artefato.

## Regras

- **Use só tokens semânticos e de componente.** Os primitivos de cor (`color-bordo-700`, `color-pedra-600`…) são privados: o `cssVar()` não aceita esses nomes, e o `lint:tokens` recusa `var(--color-bordo-700)`. As escalas (`space-*`, `font-size-*`, `radius-*`) são públicas.
- **CSS:** `var(--color-text-primary)`. **TS:** `cssVar('color-text-primary')`, ou `tokens['color-text-primary']` quando precisar do valor resolvido (canvas, gráfico, e-mail).
- **Breakpoints:** `--breakpoint-*` não funciona dentro de `@media`. Na media query use 640, 960 e 1280 px; o token serve para o JS.
- **Exceções** (ex.: template de e-mail): `tokens-ignore-file` no arquivo, ou `tokens-ignore` na linha. No CSS, o stylelint precisa da diretiva dele: `/* stylelint-disable-next-line color-no-hex */`.

## Mudar um token

1. Edite `seraphim.tokens.json`.
2. Atualize `$extensions["co.seraphim"].version`: token removido ou renomeado é **major**, token novo é **minor**, valor ou descrição alterados é **patch**.
3. Escreva a seção da versão no `CHANGELOG.md`.
4. Rode `npm run tokens:build` e faça commit da fonte e de `dist/` juntos.
5. Depois do merge, publique `dist/design-system.tokens.json` no Design System e `dist/tokens.css` no canvas (`project/tokens/tokens.css`).

O passo 5 continua manual: a CI valida e gera, mas não publica nos artefatos do Claude.
