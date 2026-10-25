# Sprint 8.5.6 — Painel Consolidado GUDA

## Objetivo
Criar uma leitura técnica da Base Central GUDA sem exportar ou copiar dados manualmente.

## Arquivos novos
- `painel-guda.html`
- `js/painel-guda.js`
- `BLOCO_AREA_TECNICA_PAINEL_GUDA.html`

## Arquivos atualizados
- `apps-script/Code.gs`
- `priorizacao-guda.html`

`js/guda-central-config.js` continua usando a mesma URL `/exec`.

## O que o painel mostra
- número de oficinas/sessões vigentes;
- ações com avaliação consolidada;
- quantidade de avaliações vigentes;
- grupos/setores participantes;
- distribuição por faixa predominante;
- média, mediana, menor e maior pontuação por ação;
- número de sessões por ação;
- justificativas vigentes de cada oficina;
- tabela das sessões registradas.

## Filtros
- busca textual;
- eixo;
- grupo/setor;
- faixa predominante.

## Atualização do Apps Script
1. Substitua `Code.gs`.
2. Apps Script → Implantar → Gerenciar implantações.
3. Edite a implantação existente.
4. Selecione `Nova versão`.
5. Implante.

Não é necessário executar novamente `configurarPlanilhaGUDA()` porque esta sprint não cria novas abas.

## GitHub
Suba:
- `painel-guda.html`
- `js/painel-guda.js`
- `priorizacao-guda.html`

## Teste
Abra diretamente:
`painel-guda.html`

Confirme:
1. quantidade de sessões;
2. quantidade de ações;
3. faixas predominantes;
4. INT-01 com média/mediana coerentes com a planilha;
5. justificativas;
6. filtros por grupo e eixo.

## Uso
Recomendado manter inicialmente na Área Técnica. O painel consolida decisões em construção e não deve ser interpretado como lista pública definitiva de prioridades antes da validação da Comissão.
