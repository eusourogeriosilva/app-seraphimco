# Saúde do projeto (`npm run health`)

`npm run health` roda o gate local (`npm run ci`) e depois audita as dependências. Serve para a revisão periódica e antes de cada release; não roda no pre-push, porque precisa de rede e um alerta novo não deve bloquear um push sem relação com ele.

| Comando | O que faz |
|---|---|
| `npm run health` | Gate completo + auditoria. |
| `npm run health -- --no-browser` | Gate sem testes de navegador + auditoria. |
| `npm run health -- --sem-gate` | Só a auditoria. |

## Quando reprova
- O gate reprova.
- Há alerta alto ou crítico em dependência de **produção**. Aqui não existe exceção: corrige-se ou troca-se a dependência.
- Há alerta alto ou crítico em dependência de **desenvolvimento** sem exceção registrada, ou com exceção vencida.
- O `npm audit` não pôde rodar (sem rede, registro fora). Saúde não verificada não conta como aprovada.

Alertas moderados e baixos aparecem como aviso e não bloqueiam.

## Exceções (`security/audit-excecoes.json`)
Uma exceção aceita um alerta de desenvolvimento por prazo definido. Campos: `id` (GHSA), `cve`, `pacote`, `escopo` (sempre `"dev"`), `motivo`, `registrada` e `revisarAte` (AAAA-MM-DD, no máximo 183 dias depois do registro).

- Exceção vencida reprova: força a reavaliação, em vez de aceitar o alerta para sempre.
- Exceção que não corresponde a nenhum alerta atual gera aviso para ser removida.
- O motivo diz por que o alerta não é explorável aqui, não só que "é de dev".

## Exceção atual
| Alerta | Pacote | Por que aceito | Revisar até |
|---|---|---|---|
| [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) (CVE-2026-93687, alto, não revisado pelo GitHub) | `braces` ≤ 3.0.3, via `micromatch` → `stylelint` | Sem versão corrigida. Recursão sem limite em padrões de chaves muito aninhados derruba o processo. O único consumidor é o stylelint, com padrões da nossa configuração; o pior caso é o lint de CSS cair. Produção: 0 alertas. | 2027-01-31 |

O `npm audit` conta esse único alerta como 5 vulnerabilidades (um por pacote da cadeia) e sugere rebaixar o stylelint da 17 para a 7. Não aplicar: é o `npm audit fix --force` voltando dez versões maiores. Quando sair versão corrigida do `braces` (ou do `micromatch` sem ele), atualizar e remover a exceção.
