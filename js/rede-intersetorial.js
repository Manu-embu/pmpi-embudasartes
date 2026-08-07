const PMIT_REDE = (() => {
  function numero(v) {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : Number(String(v).trim().replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }

  async function json(url, fallback) {
    try {
      const r = await fetch(url, {cache:"no-store"});
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      console.warn("Falha ao carregar", url, e);
      return fallback;
    }
  }

  function pontoNoAnel(ponto, anel) {
    const [x,y] = ponto;
    let dentro = false;
    for (let i=0,j=anel.length-1;i<anel.length;j=i++) {
      const [xi,yi]=anel[i], [xj,yj]=anel[j];
      const cruza=((yi>y)!==(yj>y)) &&
        (x < ((xj-xi)*(y-yi))/((yj-yi)||Number.EPSILON)+xi);
      if (cruza) dentro=!dentro;
    }
    return dentro;
  }

  function pontoNoPoligono(ponto, coords) {
    if (!coords?.length || !pontoNoAnel(ponto, coords[0])) return false;
    for (let i=1;i<coords.length;i++) if (pontoNoAnel(ponto,coords[i])) return false;
    return true;
  }

  function pontoNaGeometria(ponto, geom) {
    if (!geom) return false;
    if (geom.type==="Polygon") return pontoNoPoligono(ponto,geom.coordinates);
    if (geom.type==="MultiPolygon") return geom.coordinates.some(p=>pontoNoPoligono(ponto,p));
    return false;
  }

  function localizar(lat,lng,colecao) {
    if (!Number.isFinite(lat)||!Number.isFinite(lng)) return null;
    const ponto=[lng,lat];
    return (colecao?.features||[]).find(f=>pontoNaGeometria(ponto,f.geometry))||null;
  }

  async function carregar() {
    const [catalogo,bairros,unidades,regioes,limite] = await Promise.all([
      json("./dados/equipamentos/catalogo-camadas.json",{camadas:[]}),
      json("./dados/geografia/bairros-oficiais.geojson",{type:"FeatureCollection",features:[]}),
      json("./dados/geografia/unidades-administrativas.geojson",{type:"FeatureCollection",features:[]}),
      json("./dados/geografia/regioes-oficiais.geojson",{type:"FeatureCollection",features:[]}),
      json("./dados/geografia/limite-municipal-oficial.geojson",{type:"FeatureCollection",features:[]})
    ]);

    const itens=[];
    for (const camada of (catalogo.camadas||[])) {
      const geo = await json(`./${camada.arquivo}`,{type:"FeatureCollection",features:[]});
      for (const feature of (geo.features||[])) {
        if (feature.geometry?.type!=="Point") continue;
        const [lng,lat]=feature.geometry.coordinates||[];
        if (!Number.isFinite(lat)||!Number.isFinite(lng)) continue;

        const bairro=localizar(lat,lng,bairros);
        const unidade=localizar(lat,lng,unidades);
        const regiao=localizar(lat,lng,regioes);
        const dentro=Boolean(localizar(lat,lng,limite));
        const p=feature.properties||{};

        itens.push({
          id:p.id||"",
          nome:p.nome||"Equipamento",
          categoria:camada.categoria||p.categoria||"Outros",
          subcategoria:camada.subcategoria||p.subcategoria||"",
          camada:camada.id,
          fonte:camada.fonte||p.fonte||"",
          ano_referencia:p.ano_referencia||camada.ano_referencia||"",
          endereco:p.endereco||"",
          bairro_informado:p.bairro_informado||"",
          latitude:lat,
          longitude:lng,
          dentro_municipio:dentro,
          bairro_oficial:bairro?.properties?.nome||"",
          bairro_codigo:String(bairro?.properties?.codigo??""),
          unidade_administrativa:
            unidade?.properties?.nome||bairro?.properties?.unidade_administrativa||"",
          regiao_oficial:
            regiao?.properties?.nome||unidade?.properties?.regiao||bairro?.properties?.regiao||""
        });
      }
    }

    return {catalogo,bairros,unidades,regioes,limite,itens};
  }

  function agregarPorBairro(bases) {
    return (bases.bairros?.features||[]).map(f=>{
      const p=f.properties||{};
      const codigo=String(p.codigo??"");
      const itens=bases.itens.filter(x=>x.bairro_codigo===codigo);
      const categorias={};
      itens.forEach(x=>categorias[x.categoria]=(categorias[x.categoria]||0)+1);
      return {
        codigo,
        nome:p.nome||"",
        regiao:p.regiao||"",
        unidade_administrativa:p.unidade_administrativa||"",
        populacao_2010:p.populacao_2010??null,
        populacao_2015:p.populacao_2015??null,
        densidade_2015:p.densidade_2015??null,
        total_equipamentos:itens.length,
        categorias,
        equipamentos:itens
      };
    });
  }

  function agruparCategoria(itens) {
    const out={};
    itens.forEach(x=>out[x.categoria]=(out[x.categoria]||0)+1);
    return out;
  }

  return {carregar,agregarPorBairro,agruparCategoria};
})();
