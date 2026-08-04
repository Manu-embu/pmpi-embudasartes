# Sprint 7.2 — Atlas Territorial Oficial

## Camadas convertidas da base SHP

- Limite municipal: 1 feição
- Regiões: 3 feições
- Unidades administrativas: 20 feições
- Bairros: 114 feições

## Sistemas de referência

- Origem: EPSG:31983 — SIRGAS 2000 / UTM zone 23S
- Publicação no Leaflet: EPSG:4326 — WGS 84

## Arquivos a enviar

### Raiz
- `mapa.html`

### js
- `mapa.js`

### dados/geografia
- `limite-municipal-oficial.geojson`
- `regioes-oficiais.geojson`
- `unidades-administrativas.geojson`
- `bairros-oficiais.geojson`
- `metadados-cartografia.json`
- `inventario-bairros.csv`
- `inventario-unidades-administrativas.csv`

### css
Copiar o conteúdo de:
- `ADICIONAR_AO_FINAL_DE_STYLES_7_2.css`

para o final de:
- `css/styles.css`

## Cuidados de interpretação

As geometrias são oriundas da base administrativa fornecida.

Os campos populacionais da base referem-se principalmente a 2010 e 2015.
Eles podem ser usados para contextualização histórica, mas não devem ser apresentados
como população atual nem substituir dados recentes do diagnóstico do PMPI.

As 3 regiões e as 20 unidades administrativas não devem ser chamadas de territórios de CRAS
sem validação institucional.

## Testes

1. Abrir `mapa.html`.
2. Confirmar o limite oficial.
3. Ligar e desligar Bairros, Unidades Administrativas e Regiões.
4. Clicar em cada tipo de polígono.
5. Conferir se os 68 equipamentos continuam visíveis.
