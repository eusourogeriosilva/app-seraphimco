# Governança do sistema

Uma página, para uma equipe pequena. Decisões e recomendações completas estão nos documentos do projeto Seraphim.co (claude.ai); o que vale como regra fica aqui. Decisões individuais ficam em `docs/decisoes/`.

## Papéis
- **Dono do sistema:** Rogério. Aprova tokens, componentes, testes e publicação.
- **Dono da marca:** Tatiane Seraphim. Aprova nome, voz, conteúdo e promessas. Aprova offline; o dono do sistema registra a aprovação (procedimento abaixo).

## Princípios que valem para o sistema
- **Acessível por padrão.** Meta WCAG 2.2 AA. Nenhuma cor, componente ou texto entra sem passar pelas verificações de contraste, teclado e foco.
- **Uma fonte de verdade.** Tokens no repositório; o CSS do canvas e do Design System é cópia dele. Se divergirem, vale o repositório.
- **Desempate**, quando princípios conflitam: acessibilidade, clareza para o corretor, sobriedade, assinatura da marca, conveniência de implementação.

Os princípios de marca (1 a 5) e a lista do que o site nunca faz são da dona da marca e ficam nos documentos do projeto.

## Ciclo de vida de uma mudança
Proposto → Aprovado → Implementado → **Publicado** → Obsoleto → Removido.

- *Proposto:* prancha ou documento com decisões numeradas.
- *Aprovado:* pelo dono da classe (abaixo), por escrito. Silêncio não é aprovação.
- *Implementado:* na `main`, com o gate (`npm run ci`) aprovado.
- *Publicado:* **publicação manual** do Design System e do canvas, listada no PR em "Depois do merge". Sem isso, a mudança não terminou: as cópias ficam desatualizadas.
- *Obsoleto:* token ou componente marcado, com alias e nota de migração. *Removido* só em major.

## Classes de mudança
| Classe | Exemplo | Aprova |
|---|---|---|
| patch | valor de token, correção de CSS | dono do sistema |
| minor | token ou componente novo | dono do sistema, após prancha no canvas |
| major | remoção ou renomeação | dono do sistema e dono da marca; alias e nota de migração |
| marca e conteúdo | nome, voz, textos, promessas | dono da marca |

O template de PR (`.github/pull_request_template.md`) traz a classe e o checklist.

## Aprovação da marca (offline)
1. Pacote em linguagem de negócio, item a item, com a opção recomendada.
2. Resposta por escrito: "aprovo", "não aprovo" ou "ajustar".
3. Registro com data, canal e versão do texto vista; em nome, promessas e termos de marca, as palavras dela.
4. Evidência fora do repositório, que é **público**. Aqui vai só a referência.
5. Commits com o rodapé `Aprovado-por: Tatiane Seraphim (offline; registrado por Rogério em AAAA-MM-DD)`.
6. A aprovação vale para a versão que ela viu.

## Arquitetura da informação do site
- **Ordem da home** (narrativa): Hero, Cenário, Método, Serviços, Quem lidera, Perguntas frequentes, chamada final. Mudar a ordem é decisão de conteúdo (marca).
- **Entrada de páginas novas:** o cabeçalho tem no máximo **4 links mais a chamada**. Página nova só entra no cabeçalho se uma existente sair ou se o rodapé a absorver. Hoje: Método, Serviços, Palestras e Quem lidera.
- **Um primário por tela.** Na página de contato, o primário é "Enviar mensagem"; o do cabeçalho é secundário.

## Release
- Tag `tokens-vX.Y.Z` na versão publicada (a tag é criada à mão).
- `npm run health` antes de cada release (`docs/health.md`).
- A exceção de segurança registrada em `security/audit-excecoes.json` tem prazo de revisão; vencida, o `health` reprova.

## Cadência
Revisão datada em **janeiro de 2027**, com pauta fixa: exceções de segurança vencendo, ADRs sem implementação, itens em aberto da auditoria, pranchas do canvas desatualizadas, e pendências de leitor de tela e de motores de navegador. Depois, a cada trimestre, na mesma pauta.

## Adiado
Índice na Capa do canvas e letras de seção (A a G): feitos por último, porque renumerar as pranchas muda referências em todos os documentos.
