async function iniciarMemoria(){
 const el=document.querySelector("#memoria-timeline");
 try{
  const r=await fetch("./dados/memoria/eventos.json",{cache:"no-store"});
  if(!r.ok)throw new Error();
  const data=await r.json(), eventos=data.eventos||[];
  if(!eventos.length){
   el.innerHTML=`<div class="empty-state"><strong>Nenhum evento publicado ainda.</strong><p>A estrutura está pronta para receber os registros selecionados da Comissão, conferências e oficinas.</p></div>`;
   return;
  }
  el.innerHTML=eventos.sort((a,b)=>String(a.data).localeCompare(String(b.data))).map(e=>`
   <article class="timeline-event"><span>${e.data||""}</span><div><h3>${e.titulo}</h3><p>${e.descricao||""}</p></div></article>`).join("");
 }catch(e){el.innerHTML=`<div class="note">Não foi possível carregar a memória institucional.</div>`;}
}
document.addEventListener("DOMContentLoaded",iniciarMemoria);
