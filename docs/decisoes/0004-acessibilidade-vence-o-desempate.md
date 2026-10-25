# 0004 · Acessibilidade vence o desempate
Status: Implementado · Data: registro retroativo de 2026-10-24 · Decisor: dono do sistema

## Contexto
Acessibilidade perde quando compete, caso a caso, com estética ou prazo.

## Decisão
Meta WCAG 2.2 AA. Quando princípios conflitam, a ordem é: acessibilidade, clareza para o corretor, sobriedade, assinatura da marca, conveniência de implementação.

## Alternativas
Tratar acessibilidade como etapa final: o custo de corrigir cresce, e o conflito é decidido por quem tem mais pressa.

## Consequências
Pares de cor com contraste insuficiente (por exemplo, framboesa sobre grafite) não passam no build. Há testes com axe-core, modos `forced-colors` e `prefers-contrast`, e um roteiro de leitor de tela em `docs/acessibilidade/`.
