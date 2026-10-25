# Sprint 8.5.7 — Integração Matriz + GUDA + Área Técnica

## Arquivos novos
- area-tecnica-guda.html
- BLOCO_INTEGRACAO_AREA_TECNICA.html

## Arquivos atualizados
- matriz-acoes-metas.html
- js/matriz-acoes-metas.js

## Funcionamento
A Matriz consulta a Base Central GUDA pelo código da ação. Quando houver avaliação consolidada, mostra faixa predominante, nº de oficinas, média, mediana e variação. A informação aparece como **em análise**, sem alterar automaticamente o status da ação.

## Implantação
Suba/substitua:
- area-tecnica-guda.html
- matriz-acoes-metas.html
- js/matriz-acoes-metas.js

Mantenha publicados:
- js/guda-central-config.js
- painel-guda.html
- js/painel-guda.js
- priorizacao-guda.html
- js/priorizacao-guda.js

O Apps Script não precisa ser alterado.

## Teste
1. Abra matriz-acoes-metas.html.
2. INT-01 deve exibir o consolidado GUDA.
3. Uma ação não avaliada deve mostrar “Ainda sem avaliação consolidada”.
4. Teste os filtros da Matriz.
5. Abra area-tecnica-guda.html e teste os três acessos.
