# Gate local (CI sem GitHub Actions)

Enquanto o GitHub Actions estiver indisponível, `npm run ci` reproduz o workflow `tokens.yml` na máquina e o hook de pre-push o roda antes de cada push.

## Comandos
| Comando | O que faz |
|---|---|
| `npm run ci` | Todas as verificações: tokens (build em dia e contraste), versão e CHANGELOG, tipos em TS 7 e TS 6, stylelint, lint de tokens e de HTML, e os testes de navegador se houver Chromium. |
| `npm run ci:rapido` | O mesmo, sem os testes de navegador. |
| `npm run ci:navegador` | O `ci` exigindo os testes de navegador: sem Chromium, reprova. |
| `git push --no-verify` | Pula o hook (emergência; registre o motivo no PR). |

O hook é instalado sozinho no `npm ci` (script `prepare`, que define `core.hooksPath` como `.githooks`). Push que só remove branch passa direto.

## O que o gate não substitui
- O workflow continua no repositório e volta a valer quando houver créditos; o gate não o apaga nem o altera.
- Testes de navegador só rodam com Chromium. Sem ele, o gate **avisa que pulou**; um push com esse aviso não passou pelos 44 testes de navegador.
- A checagem de versão compara com `origin/main` (busca o remoto antes; sem rede, usa o que houver localmente).

## Chromium
- `npx playwright install chromium` (se o download não estiver bloqueado), ou
- `PW_CHROMIUM=/caminho/do/executavel npm run ci`. No macOS, por exemplo, o Chrome instalado em `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. Um Chrome mais novo que o esperado pelo Playwright 1.56 pode divergir do Chromium dos testes; confirme que os 44 testes passam antes de confiar nele.

## Proteção de branch
Não exija status checks do GitHub na proteção de `main` enquanto não houver Actions: nenhum check chegará e o merge ficará bloqueado.
