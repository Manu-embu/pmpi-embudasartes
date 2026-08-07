# Sprint 8.2 — Consolidação Territorial

Esta Sprint é incremental e deve ser aplicada SOMENTE na branch `sprint-8.2`, criada a partir da `main` já recuperada.

## Novos arquivos
- banco-territorial.html
- memoria-governanca.html
- js/rede-intersetorial.js
- js/banco-territorial.js
- js/memoria-governanca.js
- dados/memoria/eventos.json

## Arquivos a substituir
- bairros.html
- centro-inteligencia.html
- js/bairros.js
- js/centro-inteligencia.js
- js/mapa.js

## CSS
Acrescentar `css/ADICIONAR_AO_FINAL_DE_STYLES_8_2.css` ao final do `css/styles.css`.

## O que muda
1. Os 256 equipamentos urbanos passam a ser territorializados por bairro, unidade administrativa e região em tempo de execução.
2. Bairros passam a exibir EI operacional e rede intersetorial histórica separadamente.
3. Centro de Inteligência recebe consultas intersetoriais.
4. Nova página Banco Territorial mostra qualidade e distribuição das bases.
5. Memória e Governança fica estruturada, sem publicar eventos/fotos ainda.
6. Atlas limpa duplicações preparatórias e aumenta o tamanho dos marcadores urbanos conforme o zoom.

## Regra de fonte
- Educação Infantil operacional: base atualizada do município.
- Demais equipamentos: base cartográfica municipal de 2021, tratada como histórica.
- População por bairro: atributos cartográficos de 2010/2015, não atuais.

## Commit sugerido
`Sprint 8.2: consolida rede intersetorial, bairros e memória institucional`

## Testes antes do merge
- Atlas e seletor de camadas
- Bairros
- Centro de Inteligência
- Banco Territorial
- Memória e Governança
- Console do navegador sem erros críticos
