let PERFIS = [];
const fmt = v => Number.isFinite(Number(v)) ? new Intl.NumberFormat("pt-BR").format(Number(v)) : "—";
const norm = v => String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();

function renderizar() {
  const termo = norm(document.querySelector("#bairro-busca").value);
  const regiao = document.querySelector("#bairro-regiao").value;
  const filtro = document.querySelector("#bairro-equipamento").value;

  const lista = PERFIS.filter(item => {
    const texto = norm(`${item.nome} ${item.unidade_administrativa} ${item.regiao}`);
    const ok =
      !filtro ||
      (filtro==="com" && item.total_unidades>0) ||
      (filtro==="sem" && item.total_unidades===0) ||
      (filtro==="espera" && item.unidades_lista_espera>0);
    return (!termo || texto.includes(termo)) && (!regiao || item.regiao===regiao) && ok;
  });

  document.querySelector("#bairros-total").textContent = `${lista.length} bairro(s) encontrado(s)`;
  document.querySelector("#bairros-grid").innerHTML = lista.map(item => `
    <article class="bairro-card"><div class="bairro-card-top">
      <span class="status-badge">${item.regiao || "Região não informada"}</span><strong>${item.nome}</strong></div>
      <p>${item.unidade_administrativa || "Unidade administrativa não informada"}</p>
      <div class="bairro-kpis"><div><strong>${item.total_unidades}</strong><span>unidades EI</span></div>
      <div><strong>${fmt(item.atendimentos)}</strong><span>atendimentos</span></div>
      <div><strong>${item.unidades_lista_espera}</strong><span>com espera</span></div></div>
      <small>População cartográfica 2015: ${fmt(item.populacao_2015)}</small>
      <a class="btn secondary" href="bairro.html?codigo=${encodeURIComponent(item.codigo)}">Abrir perfil</a>
    </article>`).join("");
}

async function iniciar() {
  const bases = await PMPI_TERRITORIAL.carregarBases();
  PERFIS = PMPI_TERRITORIAL.agruparPorBairro(PMPI_TERRITORIAL.territorializarTodos(bases),bases.bairros);
  const regioes=[...new Set(PERFIS.map(x=>x.regiao).filter(Boolean))].sort();
  document.querySelector("#bairro-regiao").innerHTML += regioes.map(x=>`<option value="${x}">${x}</option>`).join("");
  const total=PERFIS.reduce((s,x)=>s+x.atendimentos,0), com=PERFIS.filter(x=>x.total_unidades>0).length;
  const espera=PERFIS.filter(x=>x.unidades_lista_espera>0).length;
  document.querySelector("#bairros-resumo").innerHTML=`
    <div class="compact-kpi"><strong>${PERFIS.length}</strong><span>bairros oficiais</span></div>
    <div class="compact-kpi"><strong>${com}</strong><span>com unidade EI</span></div>
    <div class="compact-kpi"><strong>${PERFIS.length-com}</strong><span>sem unidade cadastrada</span></div>
    <div class="compact-kpi"><strong>${fmt(total)}</strong><span>atendimentos</span></div>
    <div class="compact-kpi"><strong>${espera}</strong><span>com espera informada</span></div>`;
  ["#bairro-busca","#bairro-regiao","#bairro-equipamento"].forEach(s=>{
    document.querySelector(s).addEventListener("input",renderizar);
    document.querySelector(s).addEventListener("change",renderizar);
  });
  renderizar();
}
document.addEventListener("DOMContentLoaded",()=>iniciar().catch(console.error));
