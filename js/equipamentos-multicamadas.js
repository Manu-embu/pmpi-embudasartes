(() => {
 const cores=["#175a7a","#e6793d","#b94646","#7b4ea3","#d94e8f","#2f7d62","#d9822b","#6f7d35","#8b6f47"];
 function icon(cor){return L.divIcon({className:"custom-map-marker",html:`<span style="background:${cor}"></span>`,iconSize:[20,20],iconAnchor:[10,10],popupAnchor:[0,-11]});}
 function popup(f,c){const p=f.properties||{};return `<div class="map-popup"><span class="map-popup-badge">${c.categoria} • ${c.subcategoria}</span>
  <h3>${p.nome||"Equipamento"}</h3><p><strong>Endereço:</strong> ${p.endereco||"Não informado"}</p>
  <p><strong>Bairro informado:</strong> ${p.bairro_informado||"Não informado"}</p>
  <p><strong>Ano da base:</strong> ${p.ano_referencia||c.ano_referencia}</p>
  <p class="map-data-warning">Cadastro histórico: validar situação atual com a secretaria responsável.</p></div>`;}
 async function run(){
  const mapDiv=document.querySelector("#mapa"); if(!mapDiv||typeof L==="undefined")return;
  let map=null;
  for(const k of Object.keys(window)){try{if(window[k] instanceof L.Map&&window[k].getContainer()===mapDiv){map=window[k];break;}}catch(e){}}
  if(!map){console.warn("Mapa Leaflet não localizado.");return;}
  const r=await fetch("./dados/equipamentos/catalogo-camadas.json",{cache:"no-store"}); if(!r.ok)throw new Error(`HTTP ${r.status}`);
  const cat=await r.json(); const overlays={};
  for(let i=0;i<(cat.camadas||[]).length;i++){const c=cat.camadas[i];
   const rr=await fetch(`./${c.arquivo}`,{cache:"no-store"});if(!rr.ok)continue;
   const g=await rr.json(); const layer=L.geoJSON(g,{pointToLayer:(f,ll)=>L.marker(ll,{icon:icon(c.cor||cores[i%cores.length])}),onEachFeature:(f,l)=>l.bindPopup(popup(f,c))});
   overlays[`${c.categoria} — ${c.nome} (${c.quantidade})`]=layer;
  }
  L.control.layers(null,overlays,{collapsed:true,position:"topright"}).addTo(map);
 }
 window.addEventListener("load",()=>setTimeout(()=>run().catch(console.error),900));
})();
