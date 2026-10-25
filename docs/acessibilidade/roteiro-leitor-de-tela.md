# Roteiro de teste manual com leitor de tela

Executar uma vez por release do Site. Combinações: **NVDA + Firefox** e **NVDA + Chrome** (Windows); **VoiceOver + Safari** (macOS e iOS). Registrar na tabela de resultados ao final: Aprovado, Reprovado ou Observação, com versão do leitor e do navegador.

Páginas: `src/site/index.html` e `src/site/contato.html`, em desktop e em celular (390 px).

## Preparação
1. No computador com o leitor de tela: `npm ci` (uma vez) e `npm run site`. O terminal imprime os endereços (`http://127.0.0.1:4173/...`); deixe-o aberto.
2. Abra os endereços no navegador do teste. Para o celular (390 px), use a janela estreita do navegador ou o VoiceOver no iPhone com o computador na mesma rede (troque `127.0.0.1` pelo IP do computador e rode `npm run site` com o firewall liberado para a porta).
3. Percorra os cenários na ordem, nas páginas: home, contato (inclusive com `?interesse=palestra`), Diagnóstico NEXO, Consultoria NEXO e Palestras.
4. Preencha a tabela de resultados; cada Reprovado vira um item no PR de correção.

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
| 12 | Formulário: campos de Palestra | Marcar “Palestra…” e seguir com Tab | os campos “Organização ou evento” e “Data prevista” aparecem depois da corretora; rótulo e ajuda lidos; ao trocar de interesse, somem |

## Resultados

| Data | Leitor + navegador | Cenários aprovados | Problemas / observações |
|---|---|---|---|
| (a preencher) | | | |
