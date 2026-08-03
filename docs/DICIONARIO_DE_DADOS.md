# Dicionário de Dados — Indicadores v0.1

## Objetivo

Este documento descreve o padrão do arquivo `dados/indicadores.json`, que alimentará os cartões, gráficos e páginas do Observatório.

## Estrutura geral

```json
{
  "metadados": {},
  "indicadores": []
}
```

## Campos principais

| Campo | Tipo | Uso |
|---|---|---|
| `codigo` | texto | identificador único |
| `eixo` | texto | eixo temático do PMPI |
| `tema` | texto | assunto específico |
| `nome` | texto | denominação completa |
| `nome_curto` | texto | rótulo para cartões |
| `definicao` | texto | explicação do indicador |
| `valor` | número | valor utilizável em cálculos e gráficos |
| `valor_formatado` | texto | valor pronto para exibição |
| `unidade` | texto | %, crianças, notificações etc. |
| `ano_base` | número | ano de referência |
| `fonte_apresentada` | texto | relatório ou documento usado |
| `fonte_primaria` | texto | sistema ou base oficial |
| `secretaria_responsavel` | texto | órgão responsável pela validação |
| `periodicidade` | texto | frequência de atualização |
| `abrangencia` | texto | municipal, territorial ou amostral |
| `desagregacoes` | lista | recortes possíveis |
| `qualidade` | A/B/C/D | classificação da confiabilidade |
| `situacao` | texto padronizado | disponibilidade ou pendência |
| `prioridade` | texto padronizado | crítica, alta, média ou baixa |
| `publicar_home` | verdadeiro/falso | exibição na página inicial |
| `visualizacao` | texto | cartão, linha, barra ou mapa |
| `pagina` | texto | módulo do Observatório |
| `nota` | texto | limitação ou interpretação breve |

## Qualidade

- `A`: fonte oficial consolidada.
- `B`: fonte reconhecida, ainda sem validação municipal.
- `C`: estimativa, cobertura limitada ou conceito pendente.
- `D`: dado inexistente ou não localizado.

## Situações permitidas

- `disponivel`
- `disponivel_com_limitacao`
- `divergente`
- `a_validar`
- `solicitar`
- `a_construir`

## Regra editorial

O campo `valor` deve ser numérico. O campo `valor_formatado` deve conter a apresentação ao público.

Exemplo:

```json
{
  "valor": 42.05,
  "valor_formatado": "42,05%"
}
```

## Regra de publicação

Indicadores com `publicar_home: true` poderão ser exibidos nos cartões da página inicial. Isso não significa que sejam linhas de base oficialmente aprovadas.

## Validação

O arquivo `schema-indicadores.json` registra a estrutura esperada e poderá ser usado futuramente em validações automáticas.
