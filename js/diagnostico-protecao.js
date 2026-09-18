function tabela(headers, rows){
  return `<table class="diag-table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
  <tbody>${rows.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

async function carregar(){
  const [ctRes, temasRes, eqRes] = await Promise.all([
    fetch('./dados/diagnostico/conselho-tutelar-2025.json',{cache:'no-store'}),
    fetch('./dados/diagnostico/temas-recorrentes.json',{cache:'no-store'}),
    fetch('./dados/diagnostico/equipamentos-imersao.json',{cache:'no-store'})
  ]);
  if(!ctRes.ok || !temasRes.ok || !eqRes.ok) throw new Error('Falha ao carregar bases da Sprint 8.4');
  const ct=await ctRes.json(), temas=await temasRes.json(), eq=await eqRes.json();

  document.querySelector('#kpis').innerHTML = [
    ['3','Conselhos Tutelares'],
    [ct.violacoes_direito.length,'categorias de violações'],
    [ct.principais_bairros.length,'bairros destacados'],
    [eq.total,'equipamentos inventariados nas imersões']
  ].map(([n,t])=>`<div class="diag-kpi"><strong>${n}</strong><span>${t}</span></div>`).join('');

  document.querySelector('#violacoes').innerHTML =
    tabela(['Violação','Registros'],ct.violacoes_direito.slice(0,10));
  document.querySelector('#bairros').innerHTML =
    tabela(['Bairro','Registros'],ct.principais_bairros);
  document.querySelector('#idades').innerHTML =
    tabela(['Idade','Registros'],ct.idade_primeira_infancia);

  const temasRows=temas.temas
    .sort((a,b)=>b.n_territorios-a.n_territorios)
    .map(t=>[t.tema,t.n_territorios,t.territorios.join(', ')]);
  document.querySelector('#temas').innerHTML =
    tabela(['Tema','Territórios','Onde aparece'],temasRows);
}

carregar().catch(err=>{
  console.error(err);
  document.querySelector('#kpis').innerHTML='<div class="diag-note">Não foi possível carregar as bases do diagnóstico.</div>';
});
