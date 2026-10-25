# 0003 · Três faixas de largura
Status: Implementado · Data: registro retroativo de 2026-10-24 · Decisor: dono do sistema

## Contexto
Breakpoints por dispositivo envelhecem; o layout precisa de poucos pontos de quebra, previsíveis.

## Decisão
Desktop a partir de 960 px (12 colunas), tablet de 640 a 959 px (8 colunas) e celular até 639 px (4 colunas). Tipografia e espaçamento fluidos dentro de cada faixa.

## Alternativas
Quatro ou mais faixas: mais ajuste fino, mais casos a testar.

## Consequências
Os testes de navegador renderizam em 1440, 768 e 390 px. O lint recusa espaço fora da escala.
