## O que muda
<!-- Uma ou duas frases: o quê e por quê. -->

## Classe da mudança
<!-- Marque uma. Quem aprova cada classe: governança do projeto, decisão 07. -->
- [ ] patch (dono do sistema)
- [ ] minor (dono do sistema, após prancha no canvas)
- [ ] major (dono do sistema e dono da marca; com alias e nota de migração)
- [ ] marca e conteúdo (dono da marca)

## Checklist
<!-- Itens que não se aplicam: risque com ~~texto~~ e diga por quê numa linha. -->
- [ ] 1. `npm run ci` aprovado localmente, com os testes de navegador (se foram pulados, diga por quê).
- [ ] 2. Tokens: versão e CHANGELOG atualizados conforme a classe.
- [ ] 3. Nenhum valor literal no CSS; só tokens semânticos.
- [ ] 4. Cor nova: pares de contraste incluídos no build.
- [ ] 5. Teclado e foco conferidos nos componentes alterados.
- [ ] 6. Leitor de tela: cenários afetados do roteiro (`docs/acessibilidade/roteiro-leitor-de-tela.md`) rodados, ou "não se aplica" justificado.
- [ ] 7. Major: alias do que foi removido e nota de migração no CHANGELOG.
- [ ] 8. Prancha do canvas e docs do projeto atualizados.
- [ ] 9. Publicação manual pós-merge listada (Design System, canvas).
- [ ] 10. Marca e conteúdo: aprovação da dona da marca registrada (bloco abaixo) e rodapé `Aprovado-por:` nos commits.

## Aprovação da marca
<!-- Só para "marca e conteúdo" ou "major". O repositório é PÚBLICO:
     não cole aqui a mensagem da aprovação, e-mail, telefone ou captura de tela.
     A evidência fica em pasta privada; aqui vai só a referência. -->
- Aprovado por: Tatiane Seraphim (offline; registrado por <!-- nome --> em <!-- AAAA-MM-DD -->)
- Data da aprovação: <!-- AAAA-MM-DD -->
- Canal: <!-- e-mail | mensagem | documento de aprovação -->
- Versão do texto aprovada: <!-- data do documento que ela viu -->
- Decisões: <!-- ex.: 01 princípios 1 a 5; 04 grafia e botões -->

## Depois do merge
<!-- Publicações manuais, tags (tokens-vX.Y.Z), avisos. -->
