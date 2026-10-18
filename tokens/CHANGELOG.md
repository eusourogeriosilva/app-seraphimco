# Changelog dos tokens Seraphim.co

Formato: [semver](https://semver.org/lang/pt-BR/). Token removido ou renomeado é major; token novo é minor; valor ou descrição alterados é patch. A CI recusa um pull request que mude `seraphim.tokens.json` sem o bump e sem a seção correspondente aqui.

## [2.1.0] - 2026-10-18

### Adicionado
- Fonte única em W3C DTCG 2025.10, com três camadas: primitivos, semânticos e componente.
- Semânticos de cor para fundo, texto, acento, borda, foco e estados, incluindo `color-text-secondary-on-dark` (antes `#D9D3CF` solto) e `color-border-on-dark` (antes três transparências diferentes).
- `color-bg-muted` para placeholders de imagem.
- Tokens de componente para botão, campo e card de oferta.
- Escalas de espaçamento (com 20, 40, 56, 72 e 80), raio, espessura de borda, tamanho, breakpoint, tracking, entrelinha, movimento e sombra.
- Estilos de texto compostos para web e redes sociais.
- 31 pares de contraste obrigatórios verificados no build.

### Alterado
- Pedra 400 e Pedra 600 deixam de usar o prefixo de Papel.
- Letter-spacing consolidado de 12 valores para 5 tokens.
