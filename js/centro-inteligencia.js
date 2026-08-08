let contexto=null;
async function carregarJson(caminho,fallback){try{const r=await fetch(caminho,{cache:"no-store"});if(!r.ok)throw new Error();return await r.json();}catch(e){return fallback;}}
function norm(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
function tabela(cab,linhas){return `<div class="table-wrap"><table><thead><tr>${cab.map(x=>`<th>${x}</th>`).join("")}</tr></thead><tbody>${linhas.map(l=>`<tr>${l.map(x=>`<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;}
function palavrasFrequentes(lista){const stop=new Set(["de","da","do","das","dos","e","a","o","em","para","com","mais","na","no","um","uma","por","que","ao","as","os"]);const c={};lista.join(" ").split(/[^\p{L}\p{N}]+/u).map(norm).filter(x=>x.length>3&&!stop.has(x)).forEach(x=>c[x]=(c[x]||0)+1);return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,15);}

async function iniciar(){
  const [basesEI,basesRede,territorios]=await Promise.all([
    PMPI_TERRITORIAL.carregarBases(),
    PMIT_REDE.carregar(),
    carregarJson("./dados/territorios.json",{territorios:[]})
  ]);
  const ei=PMPI_TERRITORIAL.territorializarTodos(basesEI);
  const bairrosEI=PMPI_TERRITORIAL.agruparPorBairro(ei,basesEI.bairros);
  const bairrosRede=PMIT_REDE.agregarPorBairro(basesRede);
  const redeMap=new Map(bairrosRede.map(x=>[String(x.codigo),x]));
  const bairros=bairrosEI.map(x=>({...x,...(redeMap.get(String(x.codigo))||{total_equipamentos:0,categorias:{},equipamentos:[]})}));
  contexto={equipamentos:ei,bairros,urbanos:basesRede.itens,territorios:territorios.territorios||[]};
  executar();
}

function executar(){
  const q=document.querySelector("#consulta-inteligencia").value;
  const el=document.querySelector("#intelligence-answer");
  if(!contexto)return;

  if(q==="espera"){
    const x=contexto.bairros.filter(b=>b.unidades_lista_espera>0).sort((a,b)=>b.unidades_lista_espera-a.unidades_lista_espera);
    el.innerHTML=`<h2>${x.length} bairro(s) com registro de lista de espera</h2>`+tabela(["Bairro","Região","Unidades EI","Com espera","Atendimentos"],x.map(b=>[b.nome,b.regiao,b.total_unidades,b.unidades_lista_espera,b.atendimentos]));
  }else if(q==="sem-ei"){
    const x=contexto.bairros.filter(b=>b.total_unidades===0);
    el.innerHTML=`<h2>${x.length} bairro(s) sem unidade de EI atualizada</h2><p>Não significa ausência de cobertura por unidades próximas.</p>`+tabela(["Bairro","Unidade administrativa","Região","Equipamentos 2021"],x.map(b=>[b.nome,b.unidade_administrativa,b.regiao,b.total_equipamentos]));
  }else if(q==="sem-saude"){
    const x=contexto.bairros.filter(b=>(b.categorias["Saúde"]||0)===0);
    el.innerHTML=`<h2>${x.length} bairro(s) sem equipamento de Saúde na base cartográfica de 2021</h2><p>Leitura territorial da base histórica; não representa necessariamente a rede atual.</p>`+tabela(["Bairro","Região","EI atual","Equipamentos 2021"],x.map(b=>[b.nome,b.regiao,b.total_unidades,b.total_equipamentos]));
  }else if(q==="ei-sem-saude"){
    const x=contexto.bairros.filter(b=>b.total_unidades>0&&(b.categorias["Saúde"]||0)===0);
    el.innerHTML=`<h2>${x.length} bairro(s) com EI atualizada e sem Saúde cadastrada na base 2021</h2>`+tabela(["Bairro","Região","Unidades EI","Atendimentos"],x.map(b=>[b.nome,b.regiao,b.total_unidades,b.atendimentos]));
  }else if(q==="mais-equipamentos"){
    const x=[...contexto.bairros].sort((a,b)=>b.total_equipamentos-a.total_equipamentos).slice(0,15);
    el.innerHTML=`<h2>Bairros com maior número de equipamentos cadastrados</h2><p>Base cartográfica de equipamentos urbanos de 2021.</p>`+tabela(["Bairro","Região","Equipamentos","População cartográfica 2015"],x.map(b=>[b.nome,b.regiao,b.total_equipamentos,b.populacao_2015??"—"]));
  }else if(q==="categorias"){
    const acc={};contexto.urbanos.forEach(x=>acc[x.categoria]=(acc[x.categoria]||0)+1);
    el.innerHTML=`<h2>Equipamentos urbanos por política pública</h2>`+tabela(["Categoria","Quantidade"],Object.entries(acc).sort((a,b)=>b[1]-a[1]));
  }else if(q==="revisar"){
    const x=contexto.equipamentos.filter(e=>["revisar","fora-do-municipio","sem-coordenada"].includes(e.situacao_territorial));
    el.innerHTML=`<h2>${x.length} equipamento(s) de EI precisam de conferência</h2>`+tabela(["Equipamento","Bairro informado","Bairro oficial","Situação"],x.map(e=>[e.nome,e.bairro_informado||"—",e.bairro_oficial||"—",e.situacao_territorial]));
  }else if(q==="regioes"){
    const acc={};contexto.urbanos.forEach(e=>{const r=e.regiao_oficial||"Não localizada";acc[r]=(acc[r]||0)+1;});
    el.innerHTML=`<h2>Distribuição regional da rede intersetorial</h2>`+tabela(["Região","Equipamentos 2021"],Object.entries(acc).sort());
  }else if(q==="problemas"||q==="propostas"){
    const textos=contexto.territorios.flatMap(t=>t[q]||[]);
    el.innerHTML=`<h2>Termos mais recorrentes em ${q==="problemas"?"problemas":"propostas"}</h2><p>Leitura exploratória por frequência de palavras; não substitui análise qualitativa.</p>`+tabela(["Termo","Ocorrências"],palavrasFrequentes(textos));
  }
}
document.addEventListener("DOMContentLoaded",()=>{
  document.querySelector("#executar-consulta").addEventListener("click",executar);
  document.querySelector("#consulta-inteligencia").addEventListener("change",executar);
  iniciar().catch(console.error);
});
