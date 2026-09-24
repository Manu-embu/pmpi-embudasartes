let ltiDados = null;

const escLti = (v) => String(v ?? "")
  .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");

function statusInfo(s){
  if(s==="provisorio_unico") return ["Correspondência provisória","lti-ok"];
  if(s==="validacao_necessaria") return ["Validar associação","lti-review"];
  return ["Sem correspondência","lti-none"];
}

function renderKpis(){
  const r=ltiDados.resumo;
  document.querySelector("#lti-kpis").innerHTML=`
    <div class="lti-kpi"><strong>${r.territorios_cras}</strong><span>territórios CRAS</span></div>
    <div class="lti-kpi"><strong>${r.equipamentos_inventariados}</strong><span>equipamentos inventariados</span></div>
    <div class="lti-kpi"><strong>${r.bairros_destacados_ct}</strong><span>bairros destacados pelo Conselho Tutelar</span></div>
    <div class="lti-kpi"><strong>${r.associacoes_provisorias_unicas}</strong><span>associações provisórias com correspondência única</span></div>
    <div class="lti-kpi"><strong>${r.associacoes_a_validar}</strong><span>associação ambígua a validar</span></div>`;
}

function renderCrosswalk(){
  document.querySelector("#lti-crosswalk").innerHTML=ltiDados.cruzamento_bairros.map(x=>{
    const [rotulo,classe]=statusInfo(x.status);
    const ev=Object.entries(x.evidencias_inventario_equipamentos||{})
      .map(([t,n])=>`${escLti(t)} (${n})`).join(", ") || "Não localizada";
    return `<tr>
      <td><strong>${escLti(x.bairro_conselho_tutelar)}</strong></td>
      <td>${x.registros_conselho_tutelar}</td>
      <td>${escLti(x.territorio_provisorio || "—")}</td>
      <td>${ev}</td>
      <td><span class="lti-status ${classe}">${rotulo}</span></td>
    </tr>`;
  }).join("");
}

function montarFiltros(){
  const selectT=document.querySelector("#lti-territorio");
  ltiDados.territorios.forEach(t=>{
    selectT.insertAdjacentHTML("beforeend",`<option value="${escLti(t.territorio)}">${escLti(t.territorio)}</option>`);
  });
  const temas=[...new Set(ltiDados.territorios.flatMap(t=>t.temas_recorrentes))].sort();
  const selectTema=document.querySelector("#lti-tema");
  temas.forEach(t=>selectTema.insertAdjacentHTML("beforeend",`<option value="${escLti(t)}">${escLti(t)}</option>`));
  selectT.addEventListener("change",renderTerritorios);
  selectTema.addEventListener("change",renderTerritorios);
}

function renderTerritorios(){
  const ft=document.querySelector("#lti-territorio").value;
  const ftema=document.querySelector("#lti-tema").value;
  const lista=ltiDados.territorios.filter(t=>
    (!ft || t.territorio===ft) &&
    (!ftema || t.temas_recorrentes.includes(ftema))
  );

  document.querySelector("#lti-territorios").innerHTML=lista.map(t=>{
    const bairros=t.bairros_ct_associados_provisoriamente.length
      ? t.bairros_ct_associados_provisoriamente.map(b=>`<li>${escLti(b.bairro)} — ${b.registros} registros</li>`).join("")
      : "<li>Sem bairro do quadro do Conselho Tutelar associado provisoriamente.</li>";

    const cats=Object.entries(t.equipamentos_por_categoria||{})
      .map(([c,n])=>`<span class="lti-chip">${escLti(c)}: ${n}</span>`).join("");

    const temas=t.temas_recorrentes.map(x=>`<span class="lti-chip">${escLti(x)}</span>`).join("");

    return `<article class="lti-card">
      <div class="eyebrow">Território CRAS</div>
      <h3>${escLti(t.territorio)}</h3>
      <div class="lti-mini">
        <div><strong>${t.equipamentos_total}</strong><span>equipamentos</span></div>
        <div><strong>${t.n_temas}</strong><span>temas recorrentes</span></div>
        <div><strong>${t.bairros_ct_associados_provisoriamente.length}</strong><span>bairros CT associados</span></div>
      </div>
      <strong>Equipamentos por categoria</strong>
      <div class="lti-chips">${cats || '<span class="lti-chip">Sem registro</span>'}</div>
      <strong>Temas recorrentes</strong>
      <div class="lti-chips">${temas || '<span class="lti-chip">Sem classificação</span>'}</div>
      <strong>Bairros destacados no Conselho Tutelar</strong>
      <ul class="lti-list">${bairros}</ul>
      <details>
        <summary><strong>Ver problemas e propostas das imersões</strong></summary>
        <p><strong>Problemas registrados</strong></p>
        <ul class="lti-list">${t.problemas.map(x=>`<li>${escLti(x)}</li>`).join("")}</ul>
        <p><strong>Propostas registradas</strong></p>
        <ul class="lti-list">${t.propostas.map(x=>`<li>${escLti(x)}</li>`).join("")}</ul>
      </details>
    </article>`;
  }).join("") || `<div class="note">Nenhum território corresponde aos filtros selecionados.</div>`;
}

async function iniciarLti(){
  try{
    const r=await fetch("./dados/diagnostico/leitura-territorial-integrada.json",{cache:"no-store"});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    ltiDados=await r.json();
    renderKpis();
    renderCrosswalk();
    montarFiltros();
    renderTerritorios();
  }catch(e){
    console.error(e);
    document.querySelector("#lti-territorios").innerHTML='<div class="note"><strong>Erro:</strong> não foi possível carregar a leitura territorial integrada.</div>';
  }
}
document.addEventListener("DOMContentLoaded",iniciarLti);
