
function parseNumero(valor){
  if(valor===null||valor===undefined||valor==="") return null;
  if(typeof valor==="number") return Number.isFinite(valor)?valor:null;
  const n=Number(String(valor).trim().replace(",","."));
  return Number.isFinite(n)?n:null;
}
function parseCsv(texto){
  const linhas=texto.split(/\r?\n/).filter(l=>l.trim()!=="");
  if(linhas.length<2) return [];
  function splitLine(linha){
    const out=[]; let atual=""; let aspas=false;
    for(let i=0;i<linha.length;i++){
      const c=linha[i];
      if(c==='"'){
        if(aspas && linha[i+1]==='"'){atual+='"'; i++;}
        else aspas=!aspas;
      }else if(c===","&&!aspas){out.push(atual); atual="";}
      else atual+=c;
    }
    out.push(atual); return out;
  }
  const cab=splitLine(linhas[0]).map(v=>v.trim());
  return linhas.slice(1).map(l=>{
    const vals=splitLine(l); const o={};
    cab.forEach((h,i)=>o[h]=vals[i]??""); return o;
  });
}
function criarIcone(rede){
  const cor=rede==="Conveniada"?"#e6793d":"#175a7a";
  return L.divIcon({className:"custom-map-marker",html:`<span style="background:${cor}"></span>`,iconSize:[22,22],iconAnchor:[11,11],popupAnchor:[0,-12]});
}
async function iniciarMapa(){
  const [resEquip,resCoord]=await Promise.all([
    fetch("./dados/equipamentos-educacao-infantil.json",{cache:"no-store"}),
    fetch("./dados/coordenadas-equipamentos.csv",{cache:"no-store"})
  ]);
  if(!resEquip.ok) throw new Error(`Equipamentos: HTTP ${resEquip.status}`);
  const dados=await resEquip.json();
  const unidades=dados.equipamentos||[];
  let coordMap=new Map();
  if(resCoord.ok){
    const rows=parseCsv(await resCoord.text());
    coordMap=new Map(rows.filter(r=>r.id).map(r=>[
      String(r.id).trim(),
      {latitude:parseNumero(r.latitude),longitude:parseNumero(r.longitude)}
    ]));
  }
  const mapa=L.map("mapa").setView([-23.6487,-46.8522],12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap"}).addTo(mapa);
  const grupos={"Rede direta":L.layerGroup().addTo(mapa),"Rede conveniada":L.layerGroup().addTo(mapa)};
  const pontos=[];
  unidades.forEach(u=>{
    const c=coordMap.get(String(u.id).trim());
    const lat=parseNumero(u.latitude)??c?.latitude??null;
    const lng=parseNumero(u.longitude)??c?.longitude??null;
    if(lat===null||lng===null) return;
    const grupo=u.rede==="Conveniada"?grupos["Rede conveniada"]:grupos["Rede direta"];
    const link=`https://www.google.com/maps?q=${lat},${lng}`;
    L.marker([lat,lng],{icon:criarIcone(u.rede)}).addTo(grupo).bindPopup(`
      <div class="map-popup">
        <span class="map-popup-badge">${u.rede} • ${u.modalidade||"Educação Infantil"}</span>
        <h3>${u.nome}</h3>
        <p><strong>Atendimentos:</strong> ${u.atendimentos??"A informar"}</p>
        <p><strong>Lista de espera:</strong> ${u.lista_espera?"Sim":"Não"}</p>
        <p><strong>Endereço:</strong> ${u.endereco||"A informar"}</p>
        <p><strong>Desafio:</strong> ${u.desafios||"Não informado"}</p>
        <a href="${link}" target="_blank" rel="noopener">Abrir no Google Maps</a>
      </div>`);
    pontos.push([lat,lng]);
  });
  L.control.layers(null,grupos,{collapsed:false}).addTo(mapa);
  if(pontos.length) mapa.fitBounds(pontos,{padding:[28,28],maxZoom:15});
  document.querySelector("#mapa-resumo").innerHTML=`<strong>${pontos.length} de ${unidades.length} unidades georreferenciadas.</strong><span>Azul: rede direta • Laranja: rede conveniada.</span>`;
}
document.addEventListener("DOMContentLoaded",()=>iniciarMapa().catch(e=>{
  console.error(e);
  document.querySelector("#mapa-resumo").innerHTML=`<strong>Não foi possível carregar os equipamentos.</strong><span>${e.message}</span>`;
}));
