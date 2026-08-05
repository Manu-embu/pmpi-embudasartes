let CAMADAS=[];
const norm=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function render(){
 const termo=norm(document.querySelector("#catalogo-busca").value);
 const categoria=document.querySelector("#catalogo-categoria").value;
 const lista=CAMADAS.filter(c=>{
  const texto=norm([c.nome,c.categoria,c.subcategoria,...(c.campos_publicados||[])].join(" "));
  return (!termo||texto.includes(termo))&&(!categoria||c.categoria===categoria);
 });
 document.querySelector("#catalogo-total").textContent=`${lista.length} camada(s) encontrada(s)`;
 document.querySelector("#catalogo-grid").innerHTML=lista.map(c=>`
  <article class="data-catalog-card" style="--layer-color:${c.cor}">
   <div class="data-catalog-head"><span style="background:${c.cor}"></span>
    <div><small>${c.categoria}</small><h3>${c.nome}</h3></div></div>
   <div class="data-catalog-kpis"><div><strong>${c.quantidade}</strong><span>registros</span></div>
    <div><strong>${c.ano_referencia}</strong><span>referência</span></div>
    <div><strong>${(c.campos_publicados||[]).length}</strong><span>atributos</span></div></div>
   <p><strong>Arquivo:</strong> <code>${c.arquivo}</code></p>
   <p><strong>Subcategoria:</strong> ${c.subcategoria}</p>
   <p><strong>Atualização:</strong> validar com a secretaria responsável.</p>
   <details><summary>Ver campos publicados</summary><p>${(c.campos_publicados||[]).join(" • ")}</p></details>
  </article>`).join("");
}
async function iniciar(){
 const r=await fetch("./dados/equipamentos/catalogo-camadas.json",{cache:"no-store"});
 if(!r.ok) throw new Error(`HTTP ${r.status}`);
 const data=await r.json();CAMADAS=data.camadas||[];
 const cats=[...new Set(CAMADAS.map(x=>x.categoria))].sort();
 document.querySelector("#catalogo-categoria").innerHTML+=cats.map(x=>`<option value="${x}">${x}</option>`).join("");
 const total=CAMADAS.reduce((s,x)=>s+x.quantidade,0);
 document.querySelector("#catalogo-resumo").innerHTML=`
  <article><strong>${CAMADAS.length}</strong><span>camadas oficiais</span></article>
  <article><strong>${total}</strong><span>equipamentos cadastrados</span></article>
  <article><strong>${new Set(CAMADAS.map(x=>x.categoria)).size}</strong><span>categorias</span></article>
  <article><strong>2021</strong><span>ano de referência</span></article>`;
 document.querySelector("#catalogo-busca").addEventListener("input",render);
 document.querySelector("#catalogo-categoria").addEventListener("change",render);render();
}
document.addEventListener("DOMContentLoaded",()=>iniciar().catch(console.error));
