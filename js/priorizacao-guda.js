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
  const anterior=carregarSessao();
  const sessao={
    id:anterior.id||gerarSessaoId(),
    protocolo:anterior.protocolo||gerarProtocoloLocal(),
    nome:document.querySelector("#guda-sessao")?.value||"",
    data:document.querySelector("#guda-data")?.value||"",
    grupo:document.querySelector("#guda-grupo")?.value||"",
    facilitador:document.querySelector("#guda-facilitador")?.value||"",
    salvo_centralmente:anterior.salvo_centralmente||false,
    salvo_centralmente_em:anterior.salvo_centralmente_em||""
  };
  localStorage.setItem(GUDA_SESSION_KEY,JSON.stringify(sessao));
  atualizarEstadoSalvo();
}
function preencherSessao(){
  let s=carregarSessao();
  if(!s.id){
    s={...s,id:gerarSessaoId(),protocolo:gerarProtocoloLocal(),salvo_centralmente:false};
    localStorage.setItem(GUDA_SESSION_KEY,JSON.stringify(s));
  }
  const hoje=new Date().toISOString().slice(0,10);
  document.querySelector("#guda-sessao").value=s.nome||"";
  document.querySelector("#guda-data").value=s.data||hoje;
  document.querySelector("#guda-grupo").value=s.grupo||"";
  document.querySelector("#guda-facilitador").value=s.facilitador||"";
  if(s.salvo_centralmente){atualizarEstadoCentral(`Último registro central confirmado • <strong>${esc(s.protocolo||"")}</strong>`,true,false);}else{atualizarEstadoCentral("Registro central ainda não enviado.",false,false);}
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

function gerarSessaoId(){
  if(window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `guda-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
}
function gerarProtocoloLocal(){
  const d=new Date();
  const y=d.getFullYear();
  const m=String(d.getMonth()+1).padStart(2,"0");
  const dia=String(d.getDate()).padStart(2,"0");
  const h=String(d.getHours()).padStart(2,"0");
  const min=String(d.getMinutes()).padStart(2,"0");
  const s=String(d.getSeconds()).padStart(2,"0");
  return `GUDA-${y}${m}${dia}-${h}${min}${s}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
}
function atualizarEstadoCentral(msg,ok=false,warn=false){
  const el=document.querySelector("#guda-central-msg");
  const dot=document.querySelector("#guda-central-dot");
  if(el) el.innerHTML=msg;
  if(dot) dot.className="guda-central-dot"+(ok?" ok":warn?" warn":"");
}
function avaliacoesParaEnvio(){
  const notas=carregarNotas();
  return gudaDados.acoes.map(a=>{
    const r=notas[a.codigo]||{};
    const total=totalRegistro(r);
    if(!total && !(r.justificativa||"").trim()) return null;
    return {codigo:a.codigo,eixo:a.eixo,acao:a.acao,g:r.g||"",u:r.u||"",d:r.d||"",a:r.a||"",total:total||"",faixa:faixa(total),justificativa:r.justificativa||""};
  }).filter(Boolean);
}
function salvarCentralmente(){
  const url=window.GUDA_CENTRAL_URL||"";
  if(!url || url.includes("COLE_AQUI")){alert("Configure primeiro a URL do Web App em js/guda-central-config.js.");return;}
  salvarSessao();
  const sessao=carregarSessao();
  const avaliacoes=avaliacoesParaEnvio();
  if(!sessao.nome.trim()){alert("Informe o nome da sessão.");document.querySelector("#guda-sessao").focus();return;}
  if(!sessao.grupo.trim()){alert("Informe o grupo/comissão/setor.");document.querySelector("#guda-grupo").focus();return;}
  if(!avaliacoes.length){alert("Nenhuma ação foi avaliada nesta sessão.");return;}
  const payload={acao:"salvarSessaoGuda",sessao_id:sessao.id,protocolo:sessao.protocolo,nome_sessao:sessao.nome,data_oficina:sessao.data,grupo:sessao.grupo,facilitador:sessao.facilitador,origem:"Observatório PMPI",avaliacoes};
  let iframe=document.querySelector("#guda-central-frame");
  if(!iframe){iframe=document.createElement("iframe");iframe.id="guda-central-frame";iframe.name="guda-central-frame";iframe.style.display="none";document.body.appendChild(iframe);}
  const form=document.createElement("form");form.method="POST";form.action=url;form.target="guda-central-frame";form.style.display="none";
  const input=document.createElement("input");input.type="hidden";input.name="payload";input.value=JSON.stringify(payload);form.appendChild(input);document.body.appendChild(form);
  atualizarEstadoCentral("Enviando sessão para a base central...",false,true);form.submit();form.remove();setTimeout(()=>verificarRegistroCentral(sessao.id,0),1400);
}
function verificarRegistroCentral(sessaoId,tentativa){
  const url=window.GUDA_CENTRAL_URL||"";if(!url || url.includes("COLE_AQUI")) return;
  const callback=`gudaCentralCallback_${Date.now()}_${tentativa}`;const script=document.createElement("script");const sep=url.includes("?")?"&":"?";
  const timer=setTimeout(()=>{cleanup();if(tentativa<3) verificarRegistroCentral(sessaoId,tentativa+1);else atualizarEstadoCentral("Envio realizado, mas a confirmação automática não retornou. Confira a planilha central.",false,true);},5000);
  function cleanup(){clearTimeout(timer);try{delete window[callback];}catch(e){}script.remove();}
  window[callback]=resp=>{cleanup();if(resp&&resp.ok&&resp.encontrado){const sessao=carregarSessao();sessao.salvo_centralmente=true;sessao.salvo_centralmente_em=new Date().toISOString();if(resp.protocolo)sessao.protocolo=resp.protocolo;localStorage.setItem(GUDA_SESSION_KEY,JSON.stringify(sessao));atualizarEstadoCentral(`Registrado na base central • <strong>${esc(resp.protocolo||sessao.protocolo)}</strong> • ${resp.total_acoes||0} ação(ões)`,true,false);}else if(tentativa<3){setTimeout(()=>verificarRegistroCentral(sessaoId,tentativa+1),1000);}else atualizarEstadoCentral("Não foi possível confirmar o registro central. Confira a planilha.",false,true);};
  script.src=`${url}${sep}acao=status&sessao_id=${encodeURIComponent(sessaoId)}&callback=${encodeURIComponent(callback)}&_=${Date.now()}`;document.body.appendChild(script);
}
function novaSessao(){
  if(!confirm("Iniciar uma nova sessão? O formulário local será limpo.")) return;
  localStorage.removeItem(GUDA_KEY);const hoje=new Date().toISOString().slice(0,10);const s={id:gerarSessaoId(),protocolo:gerarProtocoloLocal(),nome:"",data:hoje,grupo:"",facilitador:"",salvo_centralmente:false,salvo_centralmente_em:""};localStorage.setItem(GUDA_SESSION_KEY,JSON.stringify(s));
  document.querySelector("#guda-sessao").value="";document.querySelector("#guda-data").value=hoje;document.querySelector("#guda-grupo").value="";document.querySelector("#guda-facilitador").value="";atualizarEstadoCentral("Nova sessão iniciada. Ainda não enviada para a base central.",false,false);renderLista();atualizarEstadoSalvo();
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
    document.querySelector("#guda-salvar-central").addEventListener("click",salvarCentralmente);
    document.querySelector("#guda-exportar").addEventListener("click",exportarCsv);
    document.querySelector("#guda-nova-sessao").addEventListener("click",novaSessao);
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