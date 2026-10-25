# 0001 · Estado nunca é classe
Status: Implementado · Data: registro retroativo de 2026-10-24 · Decisor: dono do sistema

## Contexto
Componentes com classes de estado (`.is-hover`, `.is-error`) divergem do que o navegador e as tecnologias assistivas sabem. O estado visual e o estado semântico podem se separar.

## Decisão
Variação é atributo (`data-variant`, `data-tone`, `data-size`, `data-surface`). Estado vem do navegador e do HTML: `:hover` só dentro de `@media (hover: hover)`, `:focus-visible`, `:disabled` e `aria-*`.

## Alternativas
Classes de estado aplicadas por JavaScript: mais flexíveis, mas deixam o visual e o `aria-*` fora de sincronia.

## Consequências
Todo `.btn` declara `data-variant`; sem ele não há hover. Testes de navegador cobrem hover, foco e erro. Detalhes: `src/components/README.md`.
