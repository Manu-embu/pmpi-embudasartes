let RPI=null;
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const slug=v=>String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"-");
function render(){
 const q=document.querySelector("#rpi-busca").value.toLowerCase(), setor=document.querySelector("#rpi-setor").value, tipo=document.querySelector("#rpi-tipo").value, rel=document.querySelector("#rpi-rel").value;
 const arr=RPI.registros.filter(x=>{
   const t=[x.nome,x.secretaria,x.categoria,x.subcategoria,x.observacoes,(x.servicos_vinculados||[]).join(" ")].join(" ").toLowerCase();
   return (!q||t.includes(q))&&(!setor||x.secretaria===setor)&&(!tipo||x.tipo_registro===tipo)&&(!rel||x.relacao_primeira_infancia===rel);
 });
 document.querySelector("#rpi-lista").innerHTML=arr.map(x=>`<article class="rpi-card">
  <div class="rpi-top"><div><span class="rpi-id">${esc(x.id)}</span><div class="rpi-cat">${esc(x.secretaria)} • ${esc(x.categoria)}</div><div class="rpi-title">${esc(x.nome)}</div></div><span class="rpi-badge ${slug(x.relacao_primeira_infancia)}">${esc(x.relacao_primeira_infancia)}</span></div>
  <div class="rpi-grid">
    <div class="rpi-box"><strong>Tipo</strong><span>${esc(x.tipo_registro)} • ${esc(x.subcategoria)}</span></div>
    <div class="rpi-box"><strong>Faixa etária</strong><span>${esc(x.faixa_etaria)}</span></div>
    <div class="rpi-box"><strong>Território / bairro</strong><span>${esc(x.territorio_cras)} • ${esc(x.bairro)}</span></div>
    <div class="rpi-box"><strong>Usuários / atendimentos</strong><span>${x.usuarios_ou_atendimentos==null?"A validar":new Intl.NumberFormat("pt-BR").format(x.usuarios_ou_atendimentos)}${x.ano_referencia?" • "+x.ano_referencia:""}</span></div>
    <div class="rpi-box"><strong>Serviços vinculados</strong><span>${(x.servicos_vinculados||[]).length?x.servicos_vinculados.map(esc).join(" • "):"—"}</span></div>
    <div class="rpi-box"><strong>Capacidade / lacuna</strong><span>${esc(x.capacidade_instalada||"A validar")}</span></div>
  </div>
  <div class="rpi-status"><b>Fonte:</b> ${esc(x.fonte)}<br><b>Status:</b> ${esc(x.status_validacao)}<br><b>Observação:</b> ${esc(x.observacoes)}</div>
 </article>`).join("")||'<div class="rpi-note">Nenhum registro encontrado.</div>';
}
async function init(){
 const r=await fetch("dados/rede-primeira-infancia/catalogo-rede.json",{cache:"no-store"}); RPI=await r.json();
 const s=RPI.resumo;
 document.querySelector("#rpi-kpis").innerHTML=[[s.registros_iniciais,"registros iniciais"],[s.setores_mapeados,"setores mapeados"],[s.servicos_com_quantitativo,"serviços com quantitativo"],[s.lacunas_setoriais_explicitas,"lacunas explícitas"]].map(x=>`<div class="rpi-kpi"><strong>${x[0]}</strong><span>${x[1]}</span></div>`).join("");
 const setores=[...new Set(RPI.registros.map(x=>x.secretaria))].sort(), tipos=[...new Set(RPI.registros.map(x=>x.tipo_registro))].sort();
 document.querySelector("#rpi-setor").innerHTML='<option value="">Todos os setores</option>'+setores.map(x=>`<option>${esc(x)}</option>`).join("");
 document.querySelector("#rpi-tipo").innerHTML='<option value="">Todos os tipos</option>'+tipos.map(x=>`<option>${esc(x)}</option>`).join("");
 ["#rpi-busca","#rpi-setor","#rpi-tipo","#rpi-rel"].forEach(x=>document.querySelector(x).addEventListener("input",render)); render();
}
document.addEventListener("DOMContentLoaded",init);