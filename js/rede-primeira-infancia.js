let RPI=null;

const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[m]));

const slug=v=>String(v||"")
  .toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"")
  .replace(/\s+/g,"-");

function filtrosAtivos(){
  return {
    q:document.querySelector("#rpi-busca").value.toLowerCase(),
    setor:document.querySelector("#rpi-setor").value,
    tipo:document.querySelector("#rpi-tipo").value,
    rel:document.querySelector("#rpi-rel").value
  };
}

function obterRegistrosFiltrados(){
  const f=filtrosAtivos();
  return RPI.registros.filter(x=>{
    const texto=[
      x.nome,x.secretaria,x.categoria,x.subcategoria,x.observacoes,
      x.status_validacao,x.rede,x.modalidade,(x.servicos_vinculados||[]).join(" ")
    ].join(" ").toLowerCase();
    return (!f.q||texto.includes(f.q)) &&
           (!f.setor||x.secretaria===f.setor) &&
           (!f.tipo||x.tipo_registro===f.tipo) &&
           (!f.rel||x.relacao_primeira_infancia===f.rel);
  });
}

function ehFiltroSomenteEducacao(arr){
  const f=filtrosAtivos();
  return f.setor==="Secretaria Municipal de Educação" &&
         !f.q && !f.tipo && !f.rel &&
         arr.length===68;
}

function atualizarScorecards(arr){
  const equipamentos=arr.filter(x=>x.tipo_registro==="Equipamento");
  const servicos=arr.filter(x=>x.tipo_registro==="Serviço/Programa");
  const setores=new Set(arr.map(x=>x.secretaria).filter(Boolean)).size;
  const ofertasDiretas=arr.filter(x=>x.relacao_primeira_infancia==="Direto").length;
  const lacunas=arr.filter(x=>x.tipo_registro==="Lacuna setorial").length;

  let atendimentos=arr.reduce((s,x)=>s+(Number(x.usuarios_ou_atendimentos)||0),0);

  // Quando o recorte é exatamente a Educação inteira, preserva o total oficial
  // já publicado na página Rede de Educação Infantil.
  if(ehFiltroSomenteEducacao(arr)){
    atendimentos=RPI.resumo.atendimentos_educacao_publicado;
  }

  document.querySelector("#rpi-kpis").innerHTML=[
    [equipamentos.length,"equipamentos"],
    [servicos.length,"serviços / programas"],
    [setores,"setores no recorte"],
    [ofertasDiretas,"ofertas diretas 0–6"],
    [new Intl.NumberFormat("pt-BR").format(atendimentos),"atendimentos informados"],
    [lacunas,"lacunas no recorte"]
  ].map(x=>`
    <div class="rpi-kpi">
      <strong>${x[0]}</strong>
      <span>${x[1]}</span>
    </div>
  `).join("");
}

function render(){
  const arr=obterRegistrosFiltrados();
  atualizarScorecards(arr);

  document.querySelector("#rpi-lista").innerHTML=arr.map(x=>`
    <article class="rpi-card">
      <div class="rpi-top">
        <div>
          <span class="rpi-id">${esc(x.id)}</span>
          <div class="rpi-cat">${esc(x.secretaria)} • ${esc(x.categoria)}</div>
          <div class="rpi-title">${esc(x.nome)}</div>
        </div>
        <span class="rpi-badge ${slug(x.relacao_primeira_infancia)}">${esc(x.relacao_primeira_infancia)}</span>
      </div>

      <div class="rpi-grid">
        <div class="rpi-box"><strong>Tipo</strong><span>${esc(x.tipo_registro)}${x.rede?" • "+esc(x.rede):""}${x.modalidade?" • "+esc(x.modalidade):" • "+esc(x.subcategoria)}</span></div>
        <div class="rpi-box"><strong>Faixa etária</strong><span>${esc(x.faixa_etaria)}</span></div>
        <div class="rpi-box"><strong>Território / bairro</strong><span>${esc(x.territorio_cras)} • ${esc(x.bairro)}</span></div>
        <div class="rpi-box"><strong>Usuários / atendimentos</strong><span>${x.usuarios_ou_atendimentos==null?"A validar":new Intl.NumberFormat("pt-BR").format(x.usuarios_ou_atendimentos)}${x.ano_referencia?" • "+x.ano_referencia:""}</span></div>
        <div class="rpi-box"><strong>Serviços vinculados</strong><span>${(x.servicos_vinculados||[]).length?x.servicos_vinculados.map(esc).join(" • "):"—"}</span></div>
        <div class="rpi-box"><strong>${x.tipo_registro==="Equipamento"?"Lista de espera / capacidade":"Capacidade / lacuna"}</strong><span>${x.tipo_registro==="Equipamento" && x.lista_espera ? "Lista de espera: "+esc(x.lista_espera) : esc(x.capacidade_instalada||"A validar")}</span></div>
      </div>

      <div class="rpi-status">
        <b>Fonte:</b> ${esc(x.fonte)}<br>
        <b>Status:</b> ${esc(x.status_validacao)}<br>
        <b>Observação:</b> ${esc(x.observacoes)}
      </div>
    </article>
  `).join("") || `<div class="rpi-note">Nenhum registro encontrado com os filtros selecionados.</div>`;
}

async function init(){
  const r=await fetch("dados/rede-primeira-infancia/catalogo-rede.json",{cache:"no-store"});
  RPI=await r.json();

  const setores=[...new Set(RPI.registros.map(x=>x.secretaria))].sort();
  const tipos=[...new Set(RPI.registros.map(x=>x.tipo_registro))].sort();

  document.querySelector("#rpi-setor").innerHTML=
    '<option value="">Todos os setores</option>'+setores.map(x=>`<option>${esc(x)}</option>`).join("");

  document.querySelector("#rpi-tipo").innerHTML=
    '<option value="">Todos os tipos</option>'+tipos.map(x=>`<option>${esc(x)}</option>`).join("");

  ["#rpi-busca","#rpi-setor","#rpi-tipo","#rpi-rel"].forEach(sel=>{
    document.querySelector(sel).addEventListener("input",render);
    document.querySelector(sel).addEventListener("change",render);
  });

  render();
}
document.addEventListener("DOMContentLoaded",init);