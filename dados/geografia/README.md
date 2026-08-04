# Dados geográficos

## Limite municipal

O Atlas consulta diretamente a API oficial de Malhas Geográficas do IBGE para o município de Embu das Artes, código 3515004.

## Territórios oficiais

O arquivo `territorios-oficiais.geojson` está vazio porque a planilha de imersão não contém os polígonos oficiais dos territórios de CRAS.

Para publicar esses limites, solicitar à Prefeitura um arquivo oficial em um dos formatos:

- GeoJSON;
- Shapefile;
- KML.

O arquivo convertido para GeoJSON deverá preservar, em cada feição, pelo menos:

- `id`;
- `nome`;
- `cras`;
- `fonte`;
- `data_referencia`.

Não desenhar polígonos aproximados e apresentá-los como oficiais.
