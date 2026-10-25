# 0002 · Tokens em W3C DTCG, em três camadas
Status: Implementado · Data: registro retroativo de 2026-10-24 · Decisor: dono do sistema

## Contexto
Valores literais no CSS tornam a troca de marca e a verificação de contraste manuais.

## Decisão
Tokens no formato W3C DTCG, em três camadas: primitivo, semântico e componente. O CSS usa só semânticos e de componente. O build gera o CSS e verifica os pares de contraste.

## Alternativas
Variáveis CSS escritas à mão: sem verificação de contraste nem versão.

## Consequências
`tokens/CHANGELOG.md` e o gate (`npm run ci`) exigem versão coerente com a mudança. O lint de tokens recusa cor literal, token inexistente e primitivo de cor no CSS.
