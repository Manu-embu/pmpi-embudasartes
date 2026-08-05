const fmt = valor => new Intl.NumberFormat("pt-BR").format(Number(valor) || 0);

async function json(caminho, fallback) {
  try {
    const r = await fetch(caminho, {cache:"no-store"});
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    console.warn(caminho, e);
    return fallback;
  }
}

async function iniciarPainel() {
  const [bases, territorios, ods, metas, catalogo] = await Promise.all([
    PMPI_TERRITORIAL.carregarBases(),
    json("./dados/territorios.json", {territorios:[]}),
    json("./dados/ods.json", {ods:[]}),
    json("./dados/metas-pmpi.json", {metas:[]}),
    json("./dados/indicadores/catalogo-indicadores.json", {dominios:[]})
  ]);

  const equipamentos = PMPI_TERRITORIAL.territorializarTodos(bases);
  const atendimentos = equipamentos.reduce((s, x) => s + (Number(x.atendimentos) || 0), 0);
  const espera = equipamentos.filter(x => x.lista_espera).length;
  const bairros = PMPI_TERRITORIAL.agruparPorBairro(equipamentos, bases.bairros);
  const bairrosComEI = bairros.filter(x => x.total_unidades > 0).length;
  const revisao = equipamentos.filter(x =>
    ["revisar","fora-do-municipio","sem-coordenada"].includes(x.situacao_territorial)
  ).length;

  document.querySelector("#executivo-kpis").innerHTML = `
    <article><strong>${fmt(equipamentos.length)}</strong><span>unidades de Educação Infantil</span></article>
    <article><strong>${fmt(atendimentos)}</strong><span>atendimentos informados</span></article>
    <article><strong>${fmt(bairrosComEI)}</strong><span>bairros com unidade cadastrada</span></article>
    <article><strong>${fmt(espera)}</strong><span>unidades que informaram lista de espera</span></article>
    <article><strong>${fmt(territorios.territorios.length)}</strong><span>territórios participativos</span></article>
    <article><strong>${fmt(metas.metas.length)}</strong><span>metas preliminares cadastradas</span></article>
  `;

  document.querySelector("#executivo-alerta").innerHTML = revisao
    ? `<strong>Qualidade geográfica:</strong> ${revisao} equipamento(s) precisam de revisão ou correção.`
    : `<strong>Qualidade geográfica:</strong> não há erros críticos identificados pela auditoria automática.`;

  const regioes = equipamentos.reduce((acc, item) => {
    const nome = item.regiao_oficial || "Não localizada";
    acc[nome] ||= {unidades:0, atendimentos:0, espera:0};
    acc[nome].unidades++;
    acc[nome].atendimentos += Number(item.atendimentos) || 0;
    if (item.lista_espera) acc[nome].espera++;
    return acc;
  }, {});

  document.querySelector("#executivo-regioes").innerHTML =
    Object.entries(regioes).sort().map(([nome, x]) => `
      <article class="executive-region-card">
        <span class="status-badge">${nome}</span>
        <h3>${fmt(x.unidades)} unidade(s)</h3>
        <p><strong>${fmt(x.atendimentos)}</strong> atendimentos informados</p>
        <p>${fmt(x.espera)} unidade(s) com lista de espera</p>
      </article>`).join("");

  const ts = territorios.territorios || [];
  const potencialidades = ts.reduce((s,t) => s + (t.potencialidades?.length || 0), 0);
  const problemas = ts.reduce((s,t) => s + (t.problemas?.length || 0), 0);
  const propostas = ts.reduce((s,t) => s + (t.propostas?.length || 0), 0);

  document.querySelector("#executivo-participacao").innerHTML = `
    <article><strong>${fmt(potencialidades)}</strong><span>potencialidades</span></article>
    <article><strong>${fmt(problemas)}</strong><span>problemas identificados</span></article>
    <article><strong>${fmt(propostas)}</strong><span>propostas registradas</span></article>
    <article><strong>${fmt(ods.ods.length)}</strong><span>ODS prioritários</span></article>
  `;

  const rotulos = {
    a_atualizar:"Atualização necessária", parcial:"Base parcial",
    a_integrar:"Integração pendente", inventario_inicial:"Inventário inicial"
  };
  document.querySelector("#executivo-indicadores").innerHTML =
    (catalogo.dominios || []).map(d => `
      <article class="indicator-domain-card">
        <span class="indicator-state ${d.status}">${rotulos[d.status] || d.status}</span>
        <h3>${d.nome}</h3>
        <p><strong>Periodicidade:</strong> ${d.periodicidade}</p>
        <p>${(d.fontes_prioritarias || []).join(" • ")}</p>
      </article>`).join("");
}
document.addEventListener("DOMContentLoaded", () => iniciarPainel().catch(console.error));
