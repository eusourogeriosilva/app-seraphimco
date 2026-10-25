# Registro de decisões (ADR)

Uma decisão que muda o sistema, o site ou a marca ganha uma página aqui. O repositório é a única casa dos ADRs; os documentos do projeto no claude.ai guardam propostas e rastro de aprovação, e apontam para cá.

## Quando escrever
- Toda mudança **minor** ou **major** (ver `docs/governanca.md`, classes de mudança).
- Toda decisão que alguém perguntaria "por que é assim?" daqui a seis meses.
- Patch não precisa de ADR.

## Formato (uma página)
```
# NNNN · Título curto
Status: Proposto | Aprovado | Implementado | Substituído por NNNN
Data: AAAA-MM-DD · Decisor: dono do sistema | dono da marca
Aprovação da marca: referência (nunca o conteúdo da mensagem; o repositório é público)

## Contexto
O problema e o que o motivou.
## Decisão
O que ficou decidido, em uma ou duas frases.
## Alternativas
O que foi considerado e por que não.
## Consequências
O que passa a valer, o custo e como se verifica (teste, lint ou revisão).
```
Numeração sequencial, sem reaproveitar números. Decisão revista ganha um ADR novo que substitui o anterior; o antigo muda só o status.

## Índice
| ADR | Tema | Status |
|---|---|---|
| [0001](0001-estado-nunca-e-classe.md) | Estado nunca é classe | Implementado |
| [0002](0002-tokens-dtcg-em-tres-camadas.md) | Tokens em W3C DTCG, em três camadas | Implementado |
| [0003](0003-faixas-de-largura.md) | Três faixas de largura | Implementado |
| [0004](0004-acessibilidade-vence-o-desempate.md) | Acessibilidade vence o desempate | Implementado |

Os quatro primeiros são registro retroativo (2026-10-24) de decisões já em vigor.
