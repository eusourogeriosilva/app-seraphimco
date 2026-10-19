# Declaração de acessibilidade — Site Seraphim.co (rascunho)

**Estado:** meta de conformidade com WCAG 2.2 nível AA. A conformidade **não está demonstrada** até que o roteiro de leitor de tela (`roteiro-leitor-de-tela.md`) seja executado; este texto só passa a dizer “conforme” depois disso.

## O que é verificado automaticamente
- Contraste de 70 pares de cores nos tokens (`npm run tokens:check`).
- axe-core nas páginas do Site em 1440, 768 e 390 px, sem violações (`npm run test:browser`).
- Estrutura de HTML: um h1, níveis de título, `lang`, texto alternativo e rótulos (`npm run lint:html`).
- Modos de alto contraste do sistema (forced-colors e prefers-contrast), formulário e cartões.

## Limitações conhecidas
- Teste com leitor de tela real ainda não executado.
- Testado em Chromium; Firefox e Safari pendentes.
- O espaçamento entre letras (tracking) é fixo em px e não acompanha texto ampliado pelo usuário.
- Fotos e textos atuais são marcadores de posição.

## Contato para relatar barreiras
[e-mail de contato — a definir pela Seraphim.co]
