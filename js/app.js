async function carregarIndicadores(){
  const resposta = await fetch('dados/indicadores.json');
  const indicadores = await resposta.json();
  const area = document.querySelector('#indicadores');
  area.innerHTML = indicadores.map(item => `
    <article class="card ${item.status}">
      <div class="eixo">${item.eixo} • ${item.ano}</div>
      <div class="valor">${item.valor}</div>
      <strong>${item.nome}</strong>
      <div class="fonte">Fonte: ${item.fonte}</div>
    </article>`).join('');
}
carregarIndicadores().catch(()=>{
  document.querySelector('#indicadores').innerHTML='<p>Publique no GitHub Pages para carregar os dados.</p>';
});
