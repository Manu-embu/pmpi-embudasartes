# Sprint 8.5.5 — Gestão de Sessões e Histórico GUDA

## Novidades
- `Atualizar sessão atual` mantém o mesmo Sessao_ID e protocolo.
- `Nova sessão` gera novo Sessao_ID e novo protocolo.
- Sessão já registrada pede confirmação antes de ser atualizada.
- Nova aba `Historico_GUDA` preserva todas as versões.

## Abas
- `Sessoes_GUDA`: estado atual da oficina.
- `Avaliacoes_GUDA`: avaliações atuais válidas.
- `Consolidado_GUDA`: consolidado somente do estado atual.
- `Historico_GUDA`: trilha completa de versões.

## Atualização
1. Substitua o `Code.gs`.
2. Execute novamente `configurarPlanilhaGUDA()`.
3. Em Apps Script: Implantar → Gerenciar implantações → Editar → Nova versão → Implantar.
4. Mantenha a mesma URL `/exec`.
5. No GitHub substitua:
   - `priorizacao-guda.html`
   - `js/priorizacao-guda.js`

`guda-central-config.js` não precisa mudar se a URL permanecer a mesma.

## Teste
1. Nova sessão.
2. Avalie duas ações e salve.
3. Corrija uma nota e atualize.
4. `Sessoes_GUDA`: continua 1 sessão.
5. `Historico_GUDA`: versões 1 e 2.
6. Clique `Nova sessão`.
7. Salve outra oficina.
8. `Sessoes_GUDA`: agora 2 IDs distintos.
