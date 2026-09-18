function rankingHTML(rows){
  return rows.map(([nome,valor]) => `
    <div class="ranking-row">
      <div class="name">${nome}</div>
      <div class="value">${valor}</div>
    </div>
  `).join('');
}

function barrasHTML(rows){
  const max = Math.max(...rows.map(([,v]) => Number(v) || 0), 1);
  return rows.map(([nome,valor]) => {
    const pct = ((Number(valor) || 0) / max) * 100;
    return `<div class="bar-row">
      <div class="bar-label">${nome}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct.toFixed(1)}%"></div></div>
      <div class="bar-value">${valor}</div>
    </div>`;
  }).join('');
}

function temaHTML(tema){
  return `<article class="theme-card">
    <div class="theme-count">${tema.n_territorios} território(s)</div>
    <h3>${tema.tema}</h3>
    <p>${tema.territorios.join(', ')}</p>
  </article>`;
}

function conexaoHTML(titulo,texto){
  return `<article class="connection-card"><h3>${titulo}</h3><p>${texto}</p></article>`;
}

async function carregar(){
  const [ctRes, temasRes, eqRes] = await Promise.all([
    fetch('./dados/diagnostico/conselho-tutelar-2025.json',{cache:'no-store'}),
    fetch('./dados/diagnostico/temas-recorrentes.json',{cache:'no-store'}),
    fetch('./dados/diagnostico/equipamentos-imersao.json',{cache:'no-store'})
  ]);

  if(!ctRes.ok || !temasRes.ok || !eqRes.ok) throw new Error('Falha ao carregar bases da Sprint 8.4');

  const ct = await ctRes.json();
  const temas = await temasRes.json();
  const eq = await eqRes.json();

  document.querySelector('#kpis').innerHTML = [
    ['3','unidades do Conselho Tutelar'],
    [ct.violacoes_direito.length,'categorias de violações'],
    [ct.principais_bairros.length,'bairros destacados'],
    [eq.total,'equipamentos inventariados nas imersões']
  ].map(([n,t]) => `<div class="diag-kpi"><strong>${n}</strong><span>${t}</span></div>`).join('');

  document.querySelector('#violacoes-lista').innerHTML = rankingHTML(ct.violacoes_direito.slice(0,10));
  document.querySelector('#bairros-lista').innerHTML = rankingHTML(ct.principais_bairros);
  document.querySelector('#idades-lista').innerHTML = barrasHTML(ct.idade_primeira_infancia);

  const temasOrdenados = [...temas.temas].sort((a,b) => b.n_territorios - a.n_territorios);
  document.querySelector('#temas-lista').innerHTML = temasOrdenados.map(temaHTML).join('');

  const getTema = nome => temasOrdenados.find(t => t.tema === nome);
  const vagas = getTema('Educação infantil / vagas');
  const saude = getTema('Saúde / especialistas');
  const brincar = getTema('Brincar / lazer / cultura');
  const acess = getTema('Acessibilidade / PCD');
  const mobil = getTema('Mobilidade / transporte');
  const seguranca = getTema('Segurança');
  const conexoes = [];

  if(vagas) conexoes.push(['Acesso à educação infantil',`O tema aparece em ${vagas.n_territorios} território(s) nas imersões. No Conselho Tutelar, a falta de vaga escolar e a vaga em creche também aparecem entre as categorias registradas.`]);
  if(saude) conexoes.push(['Saúde e atendimento especializado',`Demandas por saúde e especialistas aparecem em ${saude.n_territorios} território(s), indicando a necessidade de aprofundar indicadores de oferta, acesso e cobertura.`]);
  if(brincar) conexoes.push(['Brincar, cultura e lazer',`Necessidades relacionadas a brincar, lazer e cultura aparecem em ${brincar.n_territorios} território(s), reforçando a importância de mapear espaços existentes e lacunas territoriais.`]);
  if(acess) conexoes.push(['Acessibilidade e inclusão',`Demandas ligadas à acessibilidade e às pessoas com deficiência aparecem em ${acess.n_territorios} território(s), sugerindo monitoramento intersetorial de barreiras e atendimento.`]);
  if(mobil) conexoes.push(['Mobilidade e acesso aos serviços',`Questões de mobilidade e transporte aparecem em ${mobil.n_territorios} território(s), podendo afetar o acesso a educação, saúde, assistência e lazer.`]);
  if(seguranca) conexoes.push(['Segurança e proteção',`Demandas de segurança aparecem em ${seguranca.n_territorios} território(s). Esse tema deve ser lido em conjunto com os registros de violência apresentados pelo Conselho Tutelar, sem misturar os universos das duas fontes.`]);

  document.querySelector('#conexoes').innerHTML = conexoes.map(([t,x]) => conexaoHTML(t,x)).join('');
}

carregar().catch(err => {
  console.error(err);
  document.querySelector('#kpis').innerHTML = '<div class="diag-note">Não foi possível carregar as bases do diagnóstico.</div>';
});
