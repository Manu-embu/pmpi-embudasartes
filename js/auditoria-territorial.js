let REGISTROS = [];

function classe(s) {
  return {
    "coerente":"territorial-ok","a-validar":"territorial-pendente",
    "revisar":"territorial-revisar","fora-do-municipio":"territorial-erro",
    "sem-coordenada":"territorial-erro"
  }[s] || "territorial-pendente";
}

function rotulo(s) {
  return {
    "coerente":"Coerente","a-validar":"A validar","revisar":"Revisar",
    "fora-do-municipio":"Fora do município","sem-coordenada":"Sem coordenada"
  }[s] || s;
}

function normalizar(v) {
  return String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
}

function renderizar() {
  const busca = normalizar(document.querySelector("#auditoria-busca").value);
  const status = document.querySelector("#auditoria-status").value;

  const filtrados = REGISTROS.filter(item => {
    const texto = normalizar([
      item.nome,item.bairro_informado,item.bairro_oficial,
      item.unidade_administrativa,item.regiao_oficial
    ].join(" "));
    return (!busca || texto.includes(busca)) &&
      (!status || item.situacao_territorial === status);
  });

  document.querySelector("#auditoria-total").textContent = `${filtrados.length} registro(s) encontrado(s)`;
  document.querySelector("#auditoria-corpo").innerHTML = filtrados.map(item => {
    const maps = item.latitude !== null && item.longitude !== null
      ? `https://www.google.com/maps?q=${item.latitude},${item.longitude}` : "";
    return `<tr><td><strong>${item.nome}</strong><br><small>${item.id} • ${item.rede}</small></td>
      <td>${item.bairro_informado || "Não informado"}</td>
      <td>${item.bairro_oficial || "Não localizado"}</td>
      <td>${item.unidade_administrativa || "Não localizada"}</td>
      <td>${item.regiao_oficial || "Não localizada"}</td>
      <td><span class="territorial-status ${classe(item.situacao_territorial)}">${rotulo(item.situacao_territorial)}</span></td>
      <td>${maps ? `<a href="${maps}" target="_blank" rel="noopener">Conferir</a>` : "—"}</td></tr>`;
  }).join("");
}

async function iniciar() {
  const bases = await PMPI_TERRITORIAL.carregarBases();
  REGISTROS = PMPI_TERRITORIAL.territorializarTodos(bases);
  const contar = s => REGISTROS.filter(x => x.situacao_territorial === s).length;

  document.querySelector("#auditoria-resumo").innerHTML = `
    <div class="compact-kpi"><strong>${REGISTROS.length}</strong><span>analisados</span></div>
    <div class="compact-kpi"><strong>${contar("coerente")}</strong><span>coerentes</span></div>
    <div class="compact-kpi"><strong>${contar("a-validar")}</strong><span>a validar</span></div>
    <div class="compact-kpi"><strong>${contar("revisar")}</strong><span>revisar</span></div>
    <div class="compact-kpi"><strong>${contar("fora-do-municipio")+contar("sem-coordenada")}</strong><span>erros críticos</span></div>`;

  document.querySelector("#auditoria-busca").addEventListener("input",renderizar);
  document.querySelector("#auditoria-status").addEventListener("change",renderizar);
  document.querySelector("#baixar-auditoria").addEventListener("click",() =>
    PMPI_TERRITORIAL.baixarTexto("auditoria-territorial-equipamentos.csv",
      PMPI_TERRITORIAL.gerarCsvAuditoria(REGISTROS),"text/csv;charset=utf-8")
  );
  renderizar();
}
document.addEventListener("DOMContentLoaded",() => iniciar().catch(console.error));
