let PPA=null;
const escP=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
function fmt(v){return new Intl.NumberFormat("pt-BR",{maximumFractionDigits:2}).format(v)}
function refHtml(id){
  const r=PPA.catalogo_ppa[id]; if(!r)return "";
  const tr=r.trajetoria;
  let meta=tr?`Referência: ${fmt(tr.referencia)} • 2026: ${fmt(tr["2026"])} • 2029: ${fmt(tr["2029"])}`:
    (r.meta_2026!=null?`Meta 2026: ${fmt(r.meta_2026)}`:"");
  const validar=r.validacao?`<div style="margin-top:6px;color:#9a5e00;font-weight:800">⚠ Validar com o setor responsável</div>`:"";
  return `<div class="ppa-ref"><strong>${escP(r.programa_codigo)} • ${escP(r.programa)} — ${escP(r.tipo)} ${escP(r.codigo)}</strong>
  <div>${escP(r.descricao)}</div><small>${escP(r.secretaria)}${meta?" • "+escP(meta):""}</small>${validar}</div>`;
}
function render(){
 const q=document.querySelector("#ppa-busca").value.toLowerCase();
 const tipo=document.querySelector("#ppa-tipo").value, eixo=document.querySelector("#ppa-eixo").value;
 const arr=PPA.vinculos.filter(v=>{
   const refs=v.referencias_ppa.map(id=>PPA.catalogo_ppa[id]).filter(Boolean);
   const text=[v.codigo_pmpi,v.acao_pmpi,v.eixo_pmpi,...refs.map(r=>r.programa+" "+r.secretaria+" "+r.descricao)].join(" ").toLowerCase();
   return (!q||text.includes(q))&&(!tipo||v.tipo_vinculo===tipo)&&(!eixo||v.eixo_pmpi===eixo);
 });
 document.querySelector("#ppa-lista").innerHTML=arr.map(v=>`<article class="ppa-card">
   <div class="ppa-head"><div><span class="ppa-code">${escP(v.codigo_pmpi)}</span><div class="ppa-eixo">${escP(v.eixo_pmpi)}</div><div class="ppa-title">${escP(v.acao_pmpi)}</div></div><span class="ppa-badge ${v.tipo_vinculo.toLowerCase()}">${escP(v.tipo_vinculo)}</span></div>
   <p>${escP(v.justificativa)}</p>
   ${v.referencias_ppa.length?v.referencias_ppa.map(refHtml).join(""):`<div class="ppa-ref"><strong>Lacuna identificada</strong><div>Não foi localizada correspondência específica no PPA analisado. Recomenda-se construção de linha de base e indicador setorial.</div></div>`}
 </article>`).join("") || `<div class="ppa-alerta">Nenhuma ação encontrada com os filtros selecionados.</div>`;
}
async function init(){
 const r=await fetch("dados/planejamento/ppa-pmpi.json",{cache:"no-store"}); PPA=await r.json();
 const s=PPA.resumo;
 document.querySelector("#ppa-kpis").innerHTML=[
  [s.acoes_pmpi,"ações do PMPI"],[s.vinculo_direto,"vínculos diretos"],[s.vinculo_transversal,"vínculos transversais"],[s.vinculo_referencial,"vínculos referenciais"],[s.referencias_a_validar,"referências a validar"]
 ].map(x=>`<div class="ppa-kpi"><strong>${x[0]}</strong><span>${x[1]}</span></div>`).join("");
 const e=[...new Set(PPA.vinculos.map(v=>v.eixo_pmpi))].sort();
 document.querySelector("#ppa-eixo").innerHTML='<option value="">Todos os eixos</option>'+e.map(x=>`<option>${escP(x)}</option>`).join("");
 ["#ppa-busca","#ppa-tipo","#ppa-eixo"].forEach(sel=>document.querySelector(sel).addEventListener("input",render));
 render();
}
document.addEventListener("DOMContentLoaded",init);