let gudaDados=null;
const GUDA_KEY="pmpi_guda_v1";
const GUDA_SESSION_KEY="pmpi_guda_sessao_v1";

const esc=v=>String(v??"")
  .replaceAll("&","&amp;").replaceAll("<","&lt;")
  .replaceAll(">","&gt;").replaceAll('"',"&quot;");

function carregarNotas(){
  try{return JSON.parse(localStorage.getItem(GUDA_KEY)||"{}");}
  catch(e){return {};}
}
function salvarNotas(n){localStorage.setItem(GUDA_KEY,JSON.stringify(n));}

function carregarSessao(){
  try{return JSON.parse(localStorage.getItem(GUDA_SESSION_KEY)||"{}");}
  catch(e){return {};}
}
function salvarSessao(){
  const sessao={
    nome:document.querySelector("#guda-sessao")?.value||"",
    data:document.querySelector("#guda-data")?.value||"",
    grupo:document.querySelector("#guda-grupo")?.value||"",
    facilitador:document.querySelector("#guda-facilitador")?.value||""
  };
  localStorage.setItem(GUDA_SESSION_KEY,JSON.stringify(sessao));
  atualizarEstadoSalvo();
}
function preencherSessao(){
  const s=carregarSessao();
  const hoje=new Date().toISOString().slice(0,10);
  document.querySelector("#guda-sessao").value=s.nome||"";
  document.querySelector("#guda-data").value=s.data||hoje;
  document.querySelector("#guda-grupo").value=s.grupo||"";
  document.querySelector("#guda-facilitador").value=s.facilitador||"";
  ["guda-sessao","guda-data","guda-grupo","guda-facilitador"].forEach(id=>{
    document.querySelector("#"+id).addEventListener("input",salvarSessao);
    document.querySelector("#"+id).addEventListener("change",salvarSessao);
  });
}
function atualizarEstadoSalvo(){
  const el=document.querySelector("#guda-save-msg");
  if(!el)return;
  const agora=new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
  el.textContent=`Salvo automaticamente neste navegador • ${agora}`;
}
function slugArquivo(v){
  return String(v||"oficina")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-zA-Z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"")
    .toLowerCase() || "oficina";
}

function totalRegistro(r){
  const vals=["g","u","d","a"].map(k=>Number(r?.[k]||0));
  return vals.every(v=>v>0)?vals.reduce((s,v)=>s+v,0):0;
}
function faixa(total){
  if(!total)return "Não avaliada";
  if(total>=17)return "Muito alta";
  if(total>=13)return "Alta";
  if(total>=9)return "Média";
  return "Baixa";
}
function fxClass(f){
  return {
    "Muito alta":"fx-muito-alta","Alta":"fx-alta","Média":"fx-media",
    "Baixa":"fx-baixa","Não avaliada":"fx-vazia"
  }[f]||"fx-vazia";
}

function popularFiltros(){
  const s=document.querySelector("#guda-eixo");
  gudaDados.filtros.eixos.forEach(e=>s.insertAdjacentHTML("beforeend",`<option value="${esc(e)}">${esc(e)}</option>`));
  ["guda-busca","guda-eixo","guda-faixa"].forEach(id=>{
    document.querySelector("#"+id).addEventListener(id==="guda-busca"?"input":"change",renderLista);
  });
}

function opts(valor){
  return `<option value="">—</option>`+[1,2,3,4,5].map(n=>`<option value="${n}" ${Number(valor)===n?"selected":""}>${n}</option>`).join("");
}

function card(a,notas){
  const r=notas[a.codigo]||{};
  const t=totalRegistro(r), f=faixa(t);
  return `<article class="guda-card" data-codigo="${esc(a.codigo)}">
    <div class="guda-head">
      <span class="guda-code">${esc(a.codigo)}</span>
      <div>
        <div class="guda-eixo">${esc(a.eixo)}</div>
        <h3>${esc(a.acao)}</h3>
      </div>
      <div class="guda-total"><strong>${t||"—"}</strong><span>de 20</span></div>
    </div>
    <div class="guda-body">
      <div class="guda-context">
        <div class="guda-box"><h4>Problema público</h4><p>${esc(a.problema)}</p></div>
        <div class="guda-box"><h4>Evidências</h4><p>${esc(a.evidencias)}</p></div>
      </div>
      <div class="guda-scores">
        <div class="guda-score"><label>G • Gravidade</label><select data-k="g">${opts(r.g)}</select></div>
        <div class="guda-score"><label>U • Urgência</label><select data-k="u">${opts(r.u)}</select></div>
        <div class="guda-score"><label>D • Desigualdade</label><select data-k="d">${opts(r.d)}</select></div>
        <div class="guda-score"><label>A • Abrangência</label><select data-k="a">${opts(r.a)}</select></div>
      </div>
      <div class="guda-footer">
        <textarea class="guda-just" placeholder="Justificativa da Comissão / evidências consideradas">${esc(r.justificativa||"")}</textarea>
        <span class="guda-faixa ${fxClass(f)}">${f}</span>
      </div>
    </div>
  </article>`;
}

function instalarEdicao(){
  document.querySelectorAll(".guda-card").forEach(card=>{
    const codigo=card.dataset.codigo;
    card.querySelectorAll("select[data-k]").forEach(sel=>{
      sel.addEventListener("change",()=>{
        const notas=carregarNotas();
        notas[codigo]=notas[codigo]||{};
        notas[codigo][sel.dataset.k]=sel.value?Number(sel.value):null;
        notas[codigo].justificativa=card.querySelector(".guda-just").value;
        salvarNotas(notas);
        atualizarEstadoSalvo();
        renderLista();
      });
    });
    card.querySelector(".guda-just").addEventListener("input",e=>{
      const notas=carregarNotas();
      notas[codigo]=notas[codigo]||{};
      notas[codigo].justificativa=e.target.value;
      salvarNotas(notas);
      atualizarEstadoSalvo();
    });
  });
}

function renderLista(){
  const q=document.querySelector("#guda-busca").value.trim().toLowerCase();
  const eixo=document.querySelector("#guda-eixo").value;
  const filtroFaixa=document.querySelector("#guda-faixa").value;
  const notas=carregarNotas();

  const lista=gudaDados.acoes.filter(a=>{
    const texto=[a.codigo,a.acao,a.problema,a.evidencias].join(" ").toLowerCase();
    const f=faixa(totalRegistro(notas[a.codigo]||{}));
    return (!q||texto.includes(q))&&(!eixo||a.eixo===eixo)&&(!filtroFaixa||f===filtroFaixa);
  });

  document.querySelector("#guda-lista").innerHTML=lista.length
    ?lista.map(a=>card(a,notas)).join("")
    :'<div class="note">Nenhuma ação corresponde aos filtros selecionados.</div>';
  instalarEdicao();
}

function exportarCsv(){
  const notas=carregarNotas();
  const s=carregarSessao();
  const linhas=[[
    "Sessão","Data da oficina","Grupo / Comissão / Setor","Facilitador(a)",
    "Código","Eixo","Ação","Gravidade","Urgência","Desigualdade","Abrangência",
    "Total","Faixa","Justificativa"
  ]];

  gudaDados.acoes.forEach(a=>{
    const r=notas[a.codigo]||{};
    const t=totalRegistro(r);
    if(!t && !(r.justificativa||"").trim()) return;
    linhas.push([
      s.nome||"",s.data||"",s.grupo||"",s.facilitador||"",
      a.codigo,a.eixo,a.acao,r.g||"",r.u||"",r.d||"",r.a||"",
      t||"",faixa(t),r.justificativa||""
    ]);
  });

  if(linhas.length===1){
    alert("Nenhuma ação foi avaliada nesta sessão.");
    return;
  }

  const csv=linhas.map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(";")).join("\n");
  const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  const agora=new Date();
  const data=(s.data||agora.toISOString().slice(0,10)).replaceAll("-","");
  const hora=String(agora.getHours()).padStart(2,"0")+String(agora.getMinutes()).padStart(2,"0");
  const grupo=slugArquivo(s.grupo||s.nome||"oficina");
  a.href=url;
  a.download=`Priorizacao_GUDA_PMPI_${data}_${hora}_${grupo}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function iniciar(){
  try{
    const r=await fetch("./dados/planejamento/matriz-acoes-metas.json",{cache:"no-store"});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    gudaDados=await r.json();
    preencherSessao();
    popularFiltros();renderLista();
    document.querySelector("#guda-exportar").addEventListener("click",exportarCsv);
    document.querySelector("#guda-limpar").addEventListener("click",()=>{
      if(confirm("Limpar todas as notas e justificativas salvas neste navegador?")){
        localStorage.removeItem(GUDA_KEY);renderLista();atualizarEstadoSalvo();
      }
    });
  }catch(e){
    console.error(e);
    document.querySelector("#guda-lista").innerHTML='<div class="note"><strong>Erro:</strong> não foi possível carregar a base da matriz.</div>';
  }
}
document.addEventListener("DOMContentLoaded",iniciar);