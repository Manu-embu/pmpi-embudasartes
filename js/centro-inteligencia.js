let contexto = null;

async function carregarJson(caminho, fallback) {
  try {
    const r = await fetch(caminho,{cache:"no-store"});
    if(!r.ok) throw new Error();
    return await r.json();
  } catch(e) { return fallback; }
}
function norm(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
function palavrasFrequentes(lista) {
  const stop = new Set(["de","da","do","das","dos","e","a","o","em","para","com","mais","na","no","um","uma","por","que","ao","as","os"]);
  const contagem = {};
  lista.join(" ").split(/[^\p{L}\p{N}]+/u).map(norm).filter(x=>x.length>3&&!stop.has(x))
    .forEach(x=>contagem[x]=(contagem[x]||0)+1);
  return Object.entries(contagem).sort((a,b)=>b[1]-a[1]).slice(0,15);
}
function tabela(cabecalhos, linhas) {
  return `<div class="table-wrap"><table><thead><tr>${cabecalhos.map(x=>`<th>${x}</th>`).join("")}</tr></thead>
  <tbody>${linhas.map(l=>`<tr>${l.map(x=>`<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
async function iniciar() {
  const bases = await PMPI_TERRITORIAL.carregarBases();
  const equipamentos = PMPI_TERRITORIAL.territorializarTodos(bases);
  const bairros = PMPI_TERRITORIAL.agruparPorBairro(equipamentos,bases.bairros);
  const territorios = await carregarJson("./dados/territorios.json",{territorios:[]});
  contexto={equipamentos,bairros,territorios:territorios.territorios||[]};
  executar();
}
function executar() {
  const q=document.querySelector("#consulta-inteligencia").value;
  const el=document.querySelector("#intelligence-answer");
  if(!contexto) return;
  if(q==="espera"){
    const x=contexto.bairros.filter(b=>b.unidades_lista_espera>0).sort((a,b)=>b.unidades_lista_espera-a.unidades_lista_espera);
    el.innerHTML=`<h2>${x.length} bairro(s) com registro de lista de espera</h2>`+
      tabela(["Bairro","Região","Unidades EI","Com espera","Atendimentos"],x.map(b=>[b.nome,b.regiao,b.total_unidades,b.unidades_lista_espera,b.atendimentos]));
  } else if(q==="sem-ei"){
    const x=contexto.bairros.filter(b=>b.total_unidades===0);
    el.innerHTML=`<h2>${x.length} bairro(s) sem unidade cadastrada</h2><p>Isso não significa ausência de cobertura por unidades próximas.</p>`+
      tabela(["Bairro","Unidade administrativa","Região"],x.map(b=>[b.nome,b.unidade_administrativa,b.regiao]));
  } else if(q==="revisar"){
    const x=contexto.equipamentos.filter(e=>["revisar","fora-do-municipio","sem-coordenada"].includes(e.situacao_territorial));
    el.innerHTML=`<h2>${x.length} equipamento(s) precisam de conferência</h2>`+
      tabela(["Equipamento","Bairro informado","Bairro oficial","Situação"],x.map(e=>[e.nome,e.bairro_informado||"—",e.bairro_oficial||"—",e.situacao_territorial]));
  } else if(q==="regioes"){
    const acc={};
    contexto.equipamentos.forEach(e=>{const r=e.regiao_oficial||"Não localizada";acc[r]||={u:0,a:0,w:0};acc[r].u++;acc[r].a+=Number(e.atendimentos)||0;if(e.lista_espera)acc[r].w++;});
    el.innerHTML=`<h2>Distribuição regional da Educação Infantil</h2>`+
      tabela(["Região","Unidades","Atendimentos","Com espera"],Object.entries(acc).map(([r,x])=>[r,x.u,x.a,x.w]));
  } else if(q==="problemas" || q==="propostas"){
    const campo=q;
    const textos=contexto.territorios.flatMap(t=>t[campo]||[]);
    const freq=palavrasFrequentes(textos);
    el.innerHTML=`<h2>Termos mais recorrentes em ${q==="problemas"?"problemas":"propostas"}</h2>
      <p>Leitura exploratória por frequência de palavras; não substitui análise qualitativa.</p>`+
      tabela(["Termo","Ocorrências"],freq.map(([p,n])=>[p,n]));
  }
}
document.addEventListener("DOMContentLoaded",()=>{
  document.querySelector("#executar-consulta").addEventListener("click",executar);
  document.querySelector("#consulta-inteligencia").addEventListener("change",executar);
  iniciar().catch(console.error);
});
