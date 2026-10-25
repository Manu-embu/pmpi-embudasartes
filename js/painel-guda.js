let pgDados=null;

const escPg=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");

function fxClass(f){
  return {"Muito alta":"fx-muito-alta","Alta":"fx-alta","Média":"fx-media","Baixa":"fx-baixa"}[f]||"";
}

function carregarPainel(){
  const url=window.GUDA_CENTRAL_URL||"";
  if(!url || url.includes("COLE_AQUI")){
    document.querySelector("#pg-lista").innerHTML='<div class="note"><strong>Configuração pendente:</strong> informe a URL do Web App em js/guda-central-config.js.</div>';
    return;
  }
  const cb=`pgCallback_${Date.now()}`;
  const script=document.createElement("script");
  const sep=url.includes("?")?"&":"?";
  const timer=setTimeout(()=>{
    cleanup();
    document.querySelector("#pg-lista").innerHTML='<div class="note"><strong>Erro:</strong> não foi possível carregar o consolidado GUDA.</div>';
  },10000);

  function cleanup(){clearTimeout(timer);try{delete window[cb]}catch(e){};script.remove();}

  window[cb]=resp=>{
    cleanup();
    if(!resp||!resp.ok){
      document.querySelector("#pg-lista").innerHTML='<div class="note"><strong>Erro:</strong> retorno inválido da Base Central.</div>';
      return;
    }
    pgDados=resp;
    renderResumo();
    popularFiltros();
    renderLista();
    renderSessoes();
  };

  script.src=`${url}${sep}acao=painel&callback=${encodeURIComponent(cb)}&_=${Date.now()}`;
  document.body.appendChild(script);
}

function renderResumo(){
  const r=pgDados.resumo;
  document.querySelector("#pg-kpis").innerHTML=`
    <div class="pg-kpi"><strong>${r.sessoes}</strong><span>oficinas / sessões vigentes</span></div>
    <div class="pg-kpi"><strong>${r.acoes_avaliadas}</strong><span>ações com avaliação consolidada</span></div>
    <div class="pg-kpi"><strong>${r.avaliacoes_vigentes}</strong><span>avaliações vigentes</span></div>
    <div class="pg-kpi"><strong>${r.grupos}</strong><span>grupos / setores participantes</span></div>`;

  const f=r.faixas||{};
  document.querySelector("#pg-faixas").innerHTML=["Muito alta","Alta","Média","Baixa"].map(x=>`
    <div class="pg-faixa ${fxClass(x)}"><b>${f[x]||0}</b><span>${x}</span></div>`).join("");
}

function popularFiltros(){
  const eixo=document.querySelector("#pg-eixo");
  const grupo=document.querySelector("#pg-grupo");
  if(eixo.options.length===1){
    (pgDados.filtros.eixos||[]).forEach(x=>eixo.insertAdjacentHTML("beforeend",`<option value="${escPg(x)}">${escPg(x)}</option>`));
    (pgDados.filtros.grupos||[]).forEach(x=>grupo.insertAdjacentHTML("beforeend",`<option value="${escPg(x)}">${escPg(x)}</option>`));
    ["pg-busca","pg-eixo","pg-grupo","pg-faixa"].forEach(id=>{
      document.querySelector("#"+id).addEventListener(id==="pg-busca"?"input":"change",renderLista);
    });
  }
}

function gruposDaAcao(codigo){
  const arr=pgDados.justificativas?.[codigo]||[];
  return [...new Set(arr.map(x=>x.grupo).filter(Boolean))];
}

function card(x){
  const just=pgDados.justificativas?.[x.codigo]||[];
  const justHtml=just.length?just.map(j=>`
    <div class="pg-just-item">
      <div class="pg-just-meta">${escPg(j.data_oficina)} • ${escPg(j.nome_sessao)} • ${escPg(j.grupo)} • ${escPg(j.faixa)} (${j.total||"—"})</div>
      <p>${escPg(j.justificativa||"Sem justificativa registrada.")}</p>
    </div>`).join(""):'<div class="pg-just-item"><p>Sem justificativas vigentes registradas.</p></div>';

  return `<article class="pg-card">
    <div class="pg-head">
      <span class="pg-code">${escPg(x.codigo)}</span>
      <div><div class="pg-eixo">${escPg(x.eixo)}</div><h3>${escPg(x.acao)}</h3></div>
      <span class="pg-badge ${fxClass(x.faixa)}">${escPg(x.faixa)}</span>
    </div>
    <div class="pg-body">
      <div class="pg-metricas">
        <div class="pg-mini"><strong>${x.n_sessoes}</strong><span>sessões</span></div>
        <div class="pg-mini"><strong>${x.media}</strong><span>média</span></div>
        <div class="pg-mini"><strong>${x.mediana}</strong><span>mediana</span></div>
        <div class="pg-mini"><strong>${x.menor}–${x.maior}</strong><span>variação</span></div>
        <div class="pg-mini"><strong>${escPg(x.ultima_atualizacao||"—")}</strong><span>última atualização</span></div>
      </div>
      <details class="pg-details"><summary>Ver justificativas das oficinas (${just.length})</summary><div class="pg-just">${justHtml}</div></details>
    </div>
  </article>`;
}

function renderLista(){
  const q=document.querySelector("#pg-busca").value.trim().toLowerCase();
  const eixo=document.querySelector("#pg-eixo").value;
  const grupo=document.querySelector("#pg-grupo").value;
  const faixa=document.querySelector("#pg-faixa").value;

  const lista=(pgDados.consolidado||[]).filter(x=>{
    const texto=[x.codigo,x.eixo,x.acao].join(" ").toLowerCase();
    const grupos=gruposDaAcao(x.codigo);
    return (!q||texto.includes(q))&&(!eixo||x.eixo===eixo)&&(!faixa||x.faixa===faixa)&&(!grupo||grupos.includes(grupo));
  });

  document.querySelector("#pg-lista").innerHTML=lista.length?lista.map(card).join(""):'<div class="note">Nenhuma ação corresponde aos filtros selecionados.</div>';
}

function renderSessoes(){
  const rows=(pgDados.sessoes||[]).slice().sort((a,b)=>String(b.data_oficina).localeCompare(String(a.data_oficina)));
  document.querySelector("#pg-sessoes").innerHTML=rows.map(s=>`
    <tr><td>${escPg(s.data_oficina)}</td><td>${escPg(s.nome_sessao)}</td><td>${escPg(s.grupo)}</td><td>${escPg(s.facilitador)}</td><td>${s.total_acoes}</td><td>${escPg(s.protocolo)}</td></tr>`).join("");
}

document.addEventListener("DOMContentLoaded",carregarPainel);