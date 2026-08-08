let PERFIS=[];
const fmt=v=>Number.isFinite(Number(v))?new Intl.NumberFormat("pt-BR").format(Number(v)):"—";
const norm=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();

function chips(categorias){
  const ordem=["Educação","Saúde","Assistência Social","Cultura","Esporte","Proteção","Sociedade Civil","Equipamentos Comunitários"];
  return ordem.filter(k=>categorias[k]).map(k=>`<span class="territory-chip">${k}: ${categorias[k]}</span>`).join("");
}

function renderizar(){
  const termo=norm(document.querySelector("#bairro-busca").value);
  const regiao=document.querySelector("#bairro-regiao").value;
  const filtro=document.querySelector("#bairro-equipamento").value;

  const lista=PERFIS.filter(item=>{
    const texto=norm(`${item.nome} ${item.unidade_administrativa} ${item.regiao}`);
    const ok=!filtro||
      (filtro==="ei"&&item.total_unidades>0)||
      (filtro==="intersetorial"&&item.total_equipamentos>0)||
      (filtro==="saude"&&(item.categorias["Saúde"]||0)>0)||
      (filtro==="sem-saude"&&(item.categorias["Saúde"]||0)===0)||
      (filtro==="espera"&&item.unidades_lista_espera>0);
    return (!termo||texto.includes(termo))&&(!regiao||item.regiao===regiao)&&ok;
  });

  document.querySelector("#bairros-total").textContent=`${lista.length} bairro(s) encontrado(s)`;
  document.querySelector("#bairros-grid").innerHTML=lista.map(item=>`
    <article class="bairro-card">
      <div class="bairro-card-top">
        <span class="status-badge">${item.regiao||"Região não informada"}</span>
        <strong>${item.nome}</strong>
      </div>
      <p>${item.unidade_administrativa||"Unidade administrativa não informada"}</p>
      <div class="bairro-kpis">
        <div><strong>${item.total_unidades}</strong><span>unidades EI atuais</span></div>
        <div><strong>${item.total_equipamentos}</strong><span>equip. base 2021</span></div>
        <div><strong>${fmt(item.atendimentos)}</strong><span>atendimentos EI</span></div>
      </div>
      <div class="territory-chips">${chips(item.categorias)}</div>
      <small>População cartográfica 2015: ${fmt(item.populacao_2015)} • dado histórico</small>
      <a class="btn secondary" href="bairro.html?codigo=${encodeURIComponent(item.codigo)}">Abrir perfil</a>
    </article>`).join("");
}

async function iniciar(){
  const [basesEI,basesRede]=await Promise.all([
    PMPI_TERRITORIAL.carregarBases(),
    PMIT_REDE.carregar()
  ]);
  const ei=PMPI_TERRITORIAL.agruparPorBairro(PMPI_TERRITORIAL.territorializarTodos(basesEI),basesEI.bairros);
  const rede=PMIT_REDE.agregarPorBairro(basesRede);
  const redeMap=new Map(rede.map(x=>[String(x.codigo),x]));

  PERFIS=ei.map(x=>({...x,...(redeMap.get(String(x.codigo))||{total_equipamentos:0,categorias:{},equipamentos:[]})}));

  const regioes=[...new Set(PERFIS.map(x=>x.regiao).filter(Boolean))].sort();
  document.querySelector("#bairro-regiao").innerHTML+=regioes.map(x=>`<option value="${x}">${x}</option>`).join("");

  const comEI=PERFIS.filter(x=>x.total_unidades>0).length;
  const comRede=PERFIS.filter(x=>x.total_equipamentos>0).length;
  const totalUrbanos=PERFIS.reduce((s,x)=>s+x.total_equipamentos,0);
  const totalAtend=PERFIS.reduce((s,x)=>s+x.atendimentos,0);

  document.querySelector("#bairros-resumo").innerHTML=`
    <div class="compact-kpi"><strong>${PERFIS.length}</strong><span>bairros oficiais</span></div>
    <div class="compact-kpi"><strong>${comEI}</strong><span>com EI atualizada</span></div>
    <div class="compact-kpi"><strong>${comRede}</strong><span>com equipamento 2021</span></div>
    <div class="compact-kpi"><strong>${fmt(totalUrbanos)}</strong><span>equipamentos históricos</span></div>
    <div class="compact-kpi"><strong>${fmt(totalAtend)}</strong><span>atendimentos EI</span></div>`;

  ["#bairro-busca","#bairro-regiao","#bairro-equipamento"].forEach(s=>{
    document.querySelector(s).addEventListener("input",renderizar);
    document.querySelector(s).addEventListener("change",renderizar);
  });
  renderizar();
}
document.addEventListener("DOMContentLoaded",()=>iniciar().catch(console.error));
