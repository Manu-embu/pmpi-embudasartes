# Arquitetura do Observatório da Primeira Infância de Embu das Artes

## 1. Missão
Reunir, organizar, interpretar e divulgar informações qualificadas sobre a primeira infância em Embu das Artes, apoiando decisões públicas, participação social e monitoramento do PMPI 2026–2035.

## 2. Objetivos
- Apoiar a elaboração e a revisão do PMPI.
- Tornar os dados acessíveis e compreensíveis.
- Integrar Educação, Saúde, Assistência Social e território.
- Valorizar a escuta de crianças, famílias e profissionais.
- Monitorar metas, indicadores, responsáveis e prazos.
- Preservar memória institucional e transparência.

## 3. Públicos
Comissão Intersetorial, equipes técnicas, conselhos, Câmara Municipal, órgãos de controle, serviços públicos, famílias, crianças, sociedade civil e pesquisadores.

## 4. Princípios
Prioridade absoluta; intersetorialidade; territorialização; equidade; participação infantil; acessibilidade; proteção de dados; transparência; evidências; atualização contínua.

## 5. Arquitetura de informação
- Início
- Diagnóstico
- Crianças e Famílias
- Territórios
- Saúde e Nutrição
- Educação e Aprendizagem
- Assistência e Proteção
- O Brincar e a Cidade
- PMPI 2026–2035
- Indicadores e Metas
- Biblioteca
- Comissão

## 6. Arquitetura técnica
### Versão inicial
GitHub Pages, HTML semântico, CSS responsivo, JavaScript puro e dados em JSON.

### Evolução possível
Google Sheets como fonte, Apps Script para exportação JSON, Leaflet/OpenStreetMap, Chart.js, GitHub Actions e domínio institucional.

## 7. Estrutura do repositório
```text
pmpi-embudasartes/
├── index.html
├── README.md
├── ARQUITETURA_DO_OBSERVATORIO.md
├── DESIGN_SYSTEM.md
├── ROADMAP.md
├── css/styles.css
├── js/app.js
├── dados/
│   ├── indicadores.json
│   ├── metas.json
│   └── fontes.json
├── assets/
│   ├── img/
│   └── desenhos/
└── docs/
```

## 8. Governança editorial
- Cada secretaria valida os dados de sua área.
- A Comissão Intersetorial aprova conteúdos estratégicos.
- Dados pessoais nunca são publicados.
- Desenhos e falas exigem autorização e anonimização.
- Toda página deve exibir fonte e data de atualização.
- Alterações relevantes devem ser registradas no GitHub.

## 9. Critérios de publicação
Validar fonte, período e denominador; verificar anonimização; registrar data de atualização; revisar linguagem e acessibilidade; testar em celular e computador.
