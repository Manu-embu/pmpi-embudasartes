let mamDados=null;
let mamGudaPorCodigo={};
const escMam=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
function statusClass(s){const n=(s||"").toLowerCase();if(n.includes("conclu"))return"st-concluida";if(n.includes("execu"))return"st-execucao";if(n.includes("aprov"))return"st-aprovada";if(n.includes("valida"))return"st-validacao";return"st-elaboracao";}
function renderResumo(){const r=mamDados.resumo;document.querySelector("#mam-nota").innerHTML=`<strong>Importante:</strong> ${escMam(mamDados.nota_metodologica)}`;document.querySelector("#mam-kpis").innerHTML=`<div class="mam-kpi"><strong>${r.acoes}</strong><span>ações estruturadas</span></div><div class="mam-kpi"><strong>${r.eixos}</strong><span>eixos do PMPI</span></div><div class="mam-kpi"><strong>${r.linhas_base_a_validar}</strong><span>linhas de base ainda a validar</span></div><div class="mam-kpi"><strong>${r.revisao_intermediaria}</strong><span>revisão intermediária</span></div><div class="mam-kpi"><strong>${r.horizonte_final}</strong><span>horizonte final</span></div>`;}
function popularFiltros(){const eixo=document.querySelector("#mam-eixo");mamDados.filtros.eixos.forEach(x=>eixo.insertAdjacentHTML("beforeend",`<option value="${escMam(x)}">${escMam(x)}</option>`));const resp=document.querySelector("#mam-responsavel");mamDados.filtros.responsaveis.forEach(x=>resp.insertAdjacentHTML("beforeend",`<option value="${escMam(x)}">${escMam(x)}</option>`));const st=document.querySelector("#mam-status");mamDados.filtros.status.forEach(x=>st.insertAdjacentHTML("beforeend",`<option value="${escMam(x)}">${escMam(x)}</option>`));["mam-busca","mam-eixo","mam-responsavel","mam-status"].forEach(id=>document.querySelector("#"+id).addEventListener(id==="mam-busca"?"input":"change",renderLista));}
function chipsOrigem(a){
  const origens=Array.isArray(a.origens) ? a.origens : [];
  if(!origens.length) return '<span class="mam-chip">Origem a validar</span>';
  return origens.map(c=>`<span class="mam-chip">${escMam(c)}</span>`).join("");
}


function gudaClasse(f){
  return {"Muito alta":"guda-muito-alta","Alta":"guda-alta","Média":"guda-media","Baixa":"guda-baixa"}[f] || "guda-sem";
}
function renderGuda(a){
  const g=mamGudaPorCodigo[a.codigo];
  if(!g){
    return `<div class="mam-guda">
      <div class="mam-guda-top"><span class="mam-guda-title">Priorização GUDA</span><span class="mam-guda-badge guda-sem">Ainda sem avaliação consolidada</span></div>
      <div class="mam-guda-note">A ação permanece disponível para avaliação nas oficinas da Comissão.</div>
    </div>`;
  }
  return `<div class="mam-guda">
    <div class="mam-guda-top"><span class="mam-guda-title">Priorização GUDA • síntese técnica</span><span class="mam-guda-badge ${gudaClasse(g.faixa)}">${escMam(g.faixa)} • em análise</span></div>
    <div class="mam-guda-grid">
      <div class="mam-guda-mini"><strong>${g.n_sessoes}</strong><span>oficinas</span></div>
      <div class="mam-guda-mini"><strong>${g.media}</strong><span>média</span></div>
      <div class="mam-guda-mini"><strong>${g.mediana}</strong><span>mediana</span></div>
      <div class="mam-guda-mini"><strong>${g.menor}–${g.maior}</strong><span>variação</span></div>
    </div>
    <div class="mam-guda-note">A pontuação orienta a discussão colegiada e não constitui prioridade oficial até validação formal da Comissão.</div>
  </div>`;
}
function carregarGudaConsolidado(){
  return new Promise(resolve=>{
    const url=window.GUDA_CENTRAL_URL||"";
    if(!url || url.includes("COLE_AQUI")) return resolve();
    const cb=`mamGudaCb_${Date.now()}`;
    const script=document.createElement("script");
    const sep=url.includes("?")?"&":"?";
    const timer=setTimeout(()=>{cleanup();resolve();},7000);
    function cleanup(){clearTimeout(timer);try{delete window[cb]}catch(e){};script.remove();}
    window[cb]=resp=>{
      cleanup();
      if(resp && resp.ok && Array.isArray(resp.consolidado)){
        mamGudaPorCodigo={};
        resp.consolidado.forEach(x=>mamGudaPorCodigo[x.codigo]=x);
      }
      resolve();
    };
    script.src=`${url}${sep}acao=painel&callback=${encodeURIComponent(cb)}&_=${Date.now()}`;
    document.body.appendChild(script);
  });
}

function renderCard(a){return `<article class="mam-card"><div class="mam-card-head"><span class="mam-code">${escMam(a.codigo)}</span><div class="mam-title"><div class="mam-eixo">${escMam(a.eixo)}</div><h3>${escMam(a.acao)}</h3></div><span class="mam-status ${statusClass(a.status_acao)}">${escMam(a.status_acao)}</span></div><div class="mam-body"><div class="mam-grid"><div class="mam-box"><h4>Problema público</h4><p>${escMam(a.problema)}</p></div><div class="mam-box"><h4>Evidências e participação</h4><p>${escMam(a.evidencias)}</p><div class="mam-origin">${chipsOrigem(a)}</div></div></div><div class="mam-meta"><div class="mam-mini"><strong>Linha de base</strong><span>${escMam(a.status_linha_base)}</span><small>Ano-base: ${escMam(a.ano_base)}</small></div><div class="mam-mini"><strong>Responsável</strong><span>${escMam(a.responsavel)}</span></div><div class="mam-mini"><strong>Território</strong><span>${escMam(a.territorio)}</span></div><div class="mam-mini"><strong>ODS</strong><span>${escMam(a.ods)}</span></div></div><div class="mam-grid"><div class="mam-box"><h4>Meta intermediária • 2029</h4><p>${escMam(a.meta_2029)}</p></div><div class="mam-box"><h4>Meta final • 2035</h4><p>${escMam(a.meta_2035)}</p></div></div><details class="mam-details"><summary>Ver indicadores, linha de base e governança</summary><div class="mam-grid"><div class="mam-box"><h4>Indicadores sugeridos</h4><p>${escMam(a.indicadores)}</p></div><div class="mam-box"><h4>Linha de base</h4><p>${escMam(a.linha_base)}</p></div><div class="mam-box"><h4>Corresponsáveis</h4><p>${escMam(a.corresponsaveis)}</p></div><div class="mam-box"><h4>Fonte de verificação</h4><p>${escMam(a.fonte)}</p></div><div class="mam-box"><h4>Participação e devolutiva</h4><p>${escMam(a.participacao)}</p></div><div class="mam-box"><h4>Articulação orçamentária</h4><p>${escMam(a.articulacao_orcamentaria)}</p></div></div></details></div></article>`;}
function renderLista(){const q=document.querySelector("#mam-busca").value.trim().toLowerCase(),eixo=document.querySelector("#mam-eixo").value,resp=document.querySelector("#mam-responsavel").value,st=document.querySelector("#mam-status").value;const lista=mamDados.acoes.filter(a=>{const alvo=[a.codigo,a.eixo,a.acao,a.problema,a.evidencias,a.territorio,a.responsavel].join(" ").toLowerCase();return(!q||alvo.includes(q))&&(!eixo||a.eixo===eixo)&&(!resp||a.responsavel===resp)&&(!st||a.status_acao===st)});document.querySelector("#mam-lista").innerHTML=lista.length?lista.map(renderCard).join(""):`<div class="mam-empty">Nenhuma ação corresponde aos filtros selecionados.</div>`;}
async function iniciarMam(){try{const r=await fetch("./dados/planejamento/matriz-acoes-metas.json",{cache:"no-store"});if(!r.ok)throw new Error(`HTTP ${r.status}`);mamDados=await r.json();renderResumo();popularFiltros();renderLista();}catch(e){console.error(e);document.querySelector("#mam-lista").innerHTML=`<div class="note"><strong>Erro:</strong> não foi possível carregar a Matriz de Ações e Metas.</div>`;}}
document.addEventListener("DOMContentLoaded",iniciarMam);