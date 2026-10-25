# Sprint 8.5.4 — Registro Central das Oficinas GUDA

## Objetivo
Centralizar as avaliações GUDA em uma única planilha Google, preservando sessão, data, grupo/setor, facilitador(a), notas, total, faixa, justificativa e protocolo.

O salvamento local e a exportação CSV continuam disponíveis como segurança.

## Estrutura criada pelo Apps Script
- Sessoes_GUDA — uma linha por oficina/sessão.
- Avaliacoes_GUDA — uma linha por ação avaliada.
- Consolidado_GUDA — síntese automática por ação (sessões, média, mediana, faixa predominante, mínimo, máximo e última atualização).

## Regra contra duplicidade
Cada sessão recebe um Sessao_ID. Ao salvar novamente a mesma oficina, o script atualiza a sessão, substitui as avaliações daquela sessão e recalcula o consolidado.

## Instalação
1. Crie uma nova Planilha Google, por exemplo: PMPI - Priorização GUDA - Base Central.
2. Copie o ID da planilha na URL.
3. Na planilha: Extensões → Apps Script.
4. Substitua Code.gs pelo arquivo apps-script/Code.gs.
5. Em CONFIG_GUDA, troque COLE_AQUI_O_ID_DA_PLANILHA pelo ID real.
6. Execute uma vez configurarPlanilhaGUDA() e autorize.
7. Implante como Aplicativo da Web: executar como você; acesso conforme a política do domínio, de modo que a página pública consiga enviar os registros.
8. Copie a URL final /exec.
9. No GitHub, abra js/guda-central-config.js e substitua COLE_AQUI_A_URL_DO_WEB_APP pela URL /exec.
10. Suba priorizacao-guda.html, js/priorizacao-guda.js e js/guda-central-config.js.

## Fluxo
- Preencha a identificação da oficina.
- Avalie as ações.
- Clique Salvar na base central.
- Aguarde a confirmação com protocolo.
- Se alterar notas, salve novamente: não duplica a sessão.
- Exportar CSV permanece como backup.
- Use Nova sessão para iniciar outra oficina.

## Privacidade
Não registrar dados pessoais de crianças nas justificativas. Use fundamentos técnicos, territoriais e participativos agregados.

## Próxima etapa
Após validar registros reais, criar painel de consolidação GUDA no Observatório e relacionar prioridade com metas e execução.
