# Sprint 9.1 — Infraestrutura de Dados Territoriais

## Conversão realizada
11 camadas SHP convertidas de EPSG:31983 para GeoJSON EPSG:4326.

## Camadas e quantidades
{
  "Escolas Municipais": 50,
  "Creches Conveniadas": 26,
  "Escolas Estaduais": 44,
  "Escolas Particulares": 19,
  "Equipamentos de Saúde": 29,
  "Assistência Social": 17,
  "Equipamentos Culturais": 13,
  "Equipamentos Esportivos": 24,
  "Conselhos Tutelares": 2,
  "ONGs e OSCs": 8,
  "CCI e Equipamentos Comunitários": 24
}

Total: 256 equipamentos.

## Arquivos novos
- catalogo-dados.html
- js/catalogo-dados.js
- js/equipamentos-multicamadas.js
- dados/equipamentos/catalogo-camadas.json
- dados/equipamentos/inventario-equipamentos-urbanos.csv
- 11 GeoJSONs em dados/equipamentos

## Arquivos a substituir
- index.html
- mapa.html

## Cuidados
A base é de 2021. A geometria e os atributos foram preservados da fonte recebida,
mas a existência e a situação atual de cada equipamento precisam ser validadas.
A base atual validada de Educação Infantil não deve ser substituída pela camada histórica de 2021.

## Commit sugerido
`Converte equipamentos urbanos e cria catálogo multicamadas`
