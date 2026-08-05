const fmt=(v,c=0)=>Number.isFinite(Number(v))?new Intl.NumberFormat("pt-BR",{minimumFractionDigits:c,maximumFractionDigits:c}).format(Number(v)):"—";
async function iniciar(){
  const codigo=new URLSearchParams(location.search).get("codigo");
  const bases=await PMPI_TERRITORIAL.carregarBases();
  const equipamentos=PMPI_TERRITORIAL.territorializarTodos(bases);
  const perfis=PMPI_TERRITORIAL.agruparPorBairro(equipamentos,bases.bairros);
  const p=perfis.find(x=>String(x.codigo)===String(codigo))||perfis[0];
  if(!p) throw new Error("Bairro não localizado.");
  document.title=`${p.nome} | PMPI`;
  document.querySelector("#perfil-bairro-titulo").textContent=p.nome;
  document.querySelector("#perfil-bairro-subtitulo").textContent=`${p.unidade_administrativa||"UA não informada"} • ${p.regiao||"Região não informada"}`;
  document.querySelector("#perfil-bairro-kpis").innerHTML=`
    <div class="compact-kpi"><strong>${p.total_unidades}</strong><span>unidades EI</span></div>
    <div class="compact-kpi"><strong>${fmt(p.atendimentos)}</strong><span>atendimentos</span></div>
    <div class="compact-kpi"><strong>${p.unidades_lista_espera}</strong><span>com espera</span></div>
    <div class="compact-kpi"><strong>${fmt(p.populacao_2015)}</strong><span>população 2015</span></div>
    <div class="compact-kpi"><strong>${fmt(p.area_km2,3)}</strong><span>área km²</span></div>`;
  const c=document.querySelector("#perfil-bairro-equipamentos");
  if(!p.equipamentos.length){
    c.innerHTML=`<div class="empty-state">Nenhuma unidade da base atual foi localizada neste bairro.</div>`;return;
  }
  c.innerHTML=p.equipamentos.map(x=>`<article class="equipment-territory-card">
    <span class="status-badge">${x.rede} • ${x.modalidade}</span><h3>${x.nome}</h3>
    <p><strong>Atendimentos:</strong> ${fmt(x.atendimentos)}</p>
    <p><strong>Lista de espera:</strong> ${x.lista_espera?"Sim":"Não"}</p>
    <p><strong>Endereço:</strong> ${x.endereco||"A informar"}</p>
    <p><strong>Situação territorial:</strong> ${x.situacao_territorial}</p>
    <a href="https://www.google.com/maps?q=${x.latitude},${x.longitude}" target="_blank" rel="noopener">Abrir no Google Maps</a>
  </article>`).join("");
}
document.addEventListener("DOMContentLoaded",()=>iniciar().catch(console.error));
