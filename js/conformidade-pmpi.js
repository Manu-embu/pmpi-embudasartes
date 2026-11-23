let CONF=null;
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const slug=v=>String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"-");
function render(){
 const q=document.querySelector("#conf-busca").value.toLowerCase();
 const d=document.querySelector("#conf-dim").value;
 const s=document.querySelector("#conf-status").value;
 const f=document.querySelector("#conf-fonte").value;
 const arr=CONF.criterios.filter(c=>{
  const t=[c.id,c.dimensao,c.criterio,c.evidencia,c.providencia,...c.fontes].join(" ").toLowerCase();
  return (!q||t.includes(q))&&(!d||c.dimensao===d)&&(!s||c.status===s)&&(!f||c.fontes.includes(f));
 });
 document.querySelector("#conf-lista").innerHTML=arr.map(c=>`<article class="conf-card">
   <div class="conf-head"><div><span class="conf-id">${esc(c.id)}</span><div class="conf-dim">${esc(c.dimensao)}</div><div class="conf-title">${esc(c.criterio)}</div></div>
   <div><span class="conf-status ${slug(c.status)}">${esc(c.status)}</span> <span class="conf-prio ${slug(c.prioridade)}">${esc(c.prioridade)}</span></div></div>
   <div class="conf-grid"><div class="conf-box"><strong>Evidência atual</strong><p>${esc(c.evidencia)}</p></div><div class="conf-box"><strong>Providência para fechamento</strong><p>${esc(c.providencia)}</p></div></div>
   <div class="conf-src"><strong>Referências:</strong> ${c.fontes.map(esc).join(" • ")}</div>
   ${c.referencias_internas?.length?`<div class="conf-links">${c.referencias_internas.map(x=>`<a href="${esc(x)}">${esc(x)}</a>`).join("")}</div>`:""}
 </article>`).join("") || `<div class="conf-note">Nenhum requisito encontrado com os filtros selecionados.</div>`;
}
async function init(){
 const r=await fetch("dados/governanca/conformidade-pmpi.json",{cache:"no-store"}); CONF=await r.json();
 const s=CONF.resumo;
 document.querySelector("#conf-kpis").innerHTML=[
  [s.criterios,"critérios auditados"],[s.atendidos,"atendidos"],[s.parciais,"parciais"],[s.pendentes,"pendentes"],[s.criticos,"itens críticos"]
 ].map(x=>`<div class="conf-kpi"><strong>${x[0]}</strong><span>${x[1]}</span></div>`).join("");
 const dims=[...new Set(CONF.criterios.map(c=>c.dimensao))].sort();
 const fontes=[...new Set(CONF.criterios.flatMap(c=>c.fontes))].sort();
 document.querySelector("#conf-dim").innerHTML='<option value="">Todas as dimensões</option>'+dims.map(x=>`<option>${esc(x)}</option>`).join("");
 document.querySelector("#conf-fonte").innerHTML='<option value="">Todas as referências</option>'+fontes.map(x=>`<option>${esc(x)}</option>`).join("");
 ["#conf-busca","#conf-dim","#conf-status","#conf-fonte"].forEach(x=>document.querySelector(x).addEventListener("input",render));
 render();
}
document.addEventListener("DOMContentLoaded",init);