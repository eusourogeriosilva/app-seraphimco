# Roteiro de teste manual com leitor de tela

Executar uma vez por release do Site. Combinações: **NVDA + Firefox** e **NVDA + Chrome** (Windows); **VoiceOver + Safari** (macOS e iOS). Registrar na tabela de resultados ao final: Aprovado, Reprovado ou Observação, com versão do leitor e do navegador.

Páginas: `src/site/index.html` e `src/site/contato.html`, em desktop e em celular (390 px).

| # | Cenário | Como | Esperado |
|---|---|---|---|
| 1 | Ordem de leitura e landmarks | Lista de landmarks / rotor | banner, navegação “Principal”, main, contentinfo; um h1; sem duplicidade |
| 2 | Pular para o conteúdo | Tab na carga; Enter | primeiro foco no link; o foco vai ao `main` |
| 3 | Menu móvel (390 px) | Abrir pelo botão; Esc; Tab ao redor | estado “expandido” anunciado; Esc devolve o foco ao botão |
| 4 | Cartões de tabela (celular) | Navegação por tabela | cabeçalho de cada célula anunciado; se a semântica se perder, trocar por lista de definição |
| 5 | Cartão de serviço clicável | Tab; Enter | um único link por cartão, com nome claro; foco visível no cartão |
| 6 | Formulário: erro | Enviar vazio | resumo lido (“Revise 4 campos…”); foco nele; cada link leva ao campo; erro lido junto ao campo |
| 7 | Formulário: ajuda e rótulos | Percorrer campos | rótulo, “(obrigatório)” e ajuda (WhatsApp) lidos |
| 8 | Formulário: sucesso | Enviar válido | “Mensagem enviada” anunciada sem mover o foco |
| 9 | FAQ e abas | Teclado e leitor | `details` anuncia aberto/fechado; abas só com o padrão WAI-ARIA |
| 10 | Zoom 400% e texto 200% | Ampliar em 1280 px | sem rolagem em duas direções, sem texto cortado |
| 11 | Alto contraste do Windows | Tema de contraste ativo | cartões, logos e campos com contorno; foco visível |

## Resultados

| Data | Leitor + navegador | Cenários aprovados | Problemas / observações |
|---|---|---|---|
| (a preencher) | | | |
