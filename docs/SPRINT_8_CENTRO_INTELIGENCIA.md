# Sprint 8 — Centro de Inteligência Territorial

## Novas páginas
- painel-executivo.html
- centro-inteligencia.html

## Novos scripts
- js/painel-executivo.js
- js/centro-inteligencia.js

## Banco Municipal de Indicadores
- dados/indicadores/catalogo-indicadores.json

O catálogo separa:
- cartografia oficial, relativamente estável;
- indicadores, que precisam de atualização periódica.

## Painel Executivo
Calcula dinamicamente:
- unidades de Educação Infantil;
- atendimentos informados;
- bairros com equipamentos;
- registros de lista de espera;
- diagnóstico participativo;
- situação das bases temáticas.

## Centro de Inteligência
Executa consultas estruturadas sobre as bases publicadas:
- bairros com lista de espera;
- bairros sem unidade cadastrada;
- revisão geográfica;
- distribuição regional;
- recorrência de problemas e propostas.

Não utiliza IA externa e não inventa respostas. As consultas são transparentes e reproduzíveis.

## Implantação
Substituir os HTMLs presentes no pacote para unificar o menu.
Enviar as novas páginas, scripts e o catálogo.

Copiar:
css/ADICIONAR_AO_FINAL_DE_STYLES_8.css
para o final de:
css/styles.css

## Commit sugerido
`Cria Painel Executivo e Centro de Inteligência Territorial`
