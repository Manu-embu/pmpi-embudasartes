# Sprint 7 — Diagnóstico Territorial

## Conteúdo extraído da planilha

- 10 territórios de CRAS;
- 64 potencialidades;
- 61 registros de problemas;
- 88 propostas;
- 68 equipamentos explicitamente inventariados.

## Novas páginas

- `territorios.html`
- `territorio.html?id=vazame`

## Novos dados

- `dados/territorios.json`
- `dados/equipamentos-territoriais.csv`
- `dados/geografia/territorios-oficiais.geojson`

## Atlas

O Atlas passa a:

- consultar o limite municipal oficial pela API de Malhas do IBGE;
- preparar camadas de Saúde, Assistência Social, Cultura, Esporte e espaços para brincar;
- mostrar o catálogo de registros ainda sem coordenadas;
- carregar os territórios oficiais assim que um GeoJSON válido for fornecido.

## Limitação importante

A planilha de imersão não contém:

- polígonos oficiais dos territórios;
- endereços completos de todos os equipamentos;
- coordenadas da maioria dos equipamentos de Saúde, Assistência, Cultura, Esporte e brincar.

Esses dados não foram inventados. Foram incorporados como cadastro pendente de validação e georreferenciamento.

## Arquivos a substituir na raiz

- index.html
- diagnostico.html
- participacao.html
- matriz-decisoes.html
- consulta-publica.html
- componentes.html
- rede-educacao-infantil.html
- mapa.html
- planejamento-orcamento.html
- ods-metas.html

## Arquivos novos na raiz

- territorios.html
- territorio.html

## Pasta js

- mapa.js
- territorios.js
- ods-metas.js

## Pasta dados

- territorios.json
- equipamentos-territoriais.csv
- geografia/territorios-oficiais.geojson
- geografia/README.md

Não substitua:

- `dados/equipamentos-educacao-infantil.json`
- `dados/coordenadas-equipamentos.csv`

## CSS

Copie o conteúdo de `css/ADICIONAR_AO_FINAL_DE_STYLES.css`
para o final do arquivo existente `css/styles.css`.

## Commit sugerido

`Adiciona diagnóstico territorial e novas camadas ao Atlas`
