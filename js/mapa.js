function parseNumero(valor) {
  if (valor === null || valor === undefined || valor === "") return null;
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
  const convertido = Number(String(valor).trim().replace(",", "."));
  return Number.isFinite(convertido) ? convertido : null;
}

function statusCoordenada(item) {
  const valor = String(
    item.status_geocodificacao ||
    item.status_georreferenciamento ||
    item.status ||
    ""
  ).trim().toUpperCase();

  if (valor.includes("REVISAR") || valor.includes("ERRO")) return "revisar";
  if (valor.includes("VALIDADO")) return "validado";
  return "a-validar";
}

function parseCsv(texto) {
  const linhas = texto.split(/\r?\n/).filter(l => l.trim() !== "");
  if (linhas.length < 2) return [];

  function separarLinha(linha) {
    const valores = [];
    let atual = "";
    let entreAspas = false;

    for (let i = 0; i < linha.length; i++) {
      const c = linha[i];
      if (c === '"') {
        if (entreAspas && linha[i + 1] === '"') {
          atual += '"';
          i++;
        } else {
          entreAspas = !entreAspas;
        }
      } else if (c === "," && !entreAspas) {
        valores.push(atual);
        atual = "";
      } else {
        atual += c;
      }
    }
    valores.push(atual);
    return valores;
  }

  const cabecalhos = separarLinha(linhas[0]).map(v => v.trim());
  return linhas.slice(1).map(linha => {
    const valores = separarLinha(linha);
    const obj = {};
    cabecalhos.forEach((h, i) => obj[h] = valores[i] ?? "");
    return obj;
  });
}

function criarIcone(cor) {
  return L.divIcon({
    className: "custom-map-marker",
    html: `<span style="background:${cor}"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12]
  });
}

function formatarInteiro(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? new Intl.NumberFormat("pt-BR").format(numero) : "Não informado";
}

function formatarDecimal(valor, casas = 2) {
  const numero = Number(valor);
  return Number.isFinite(numero)
    ? new Intl.NumberFormat("pt-BR", {minimumFractionDigits: casas, maximumFractionDigits: casas}).format(numero)
    : "Não informado";
}

async function buscarJson(url, fallback = null) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Não foi possível carregar ${url}`, error);
    return fallback;
  }
}

async function buscarTexto(url, fallback = "") {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } catch (error) {
    console.warn(`Não foi possível carregar ${url}`, error);
    return fallback;
  }
}

function estiloLimite() {
  return { color:"#173d50", weight:4, fillColor:"#175a7a", fillOpacity:0.025 };
}

function estiloRegiao(feature) {
  const cores = {CENTRO:"#f2bf4a", LESTE:"#2f7d62", OESTE:"#7b4ea3"};
  return {
    color: cores[feature.properties?.nome] || "#666",
    weight: 2,
    fillColor: cores[feature.properties?.nome] || "#666",
    fillOpacity: 0.10
  };
}

function estiloUA() {
  return { color:"#3d6f88", weight:1.4, fillColor:"#dceaf1", fillOpacity:0.08 };
}

function estiloBairro() {
  return { color:"#7c8790", weight:0.8, fillColor:"#eef2f4", fillOpacity:0.025 };
}

function popupLimite(props) {
  return `
    <div class="map-popup">
      <span class="map-popup-badge">Limite municipal oficial</span>
      <h3>${props.nome || "Embu das Artes"}</h3>
      <p><strong>Área:</strong> ${formatarDecimal(props.area_km2)} km²</p>
      <p><strong>Fonte:</strong> ${props.fonte_cartografica || "Base cartográfica municipal"}</p>
    </div>`;
}

function popupRegiao(props) {
  return `
    <div class="map-popup">
      <span class="map-popup-badge">Região oficial</span>
      <h3>${props.nome || "Região"}</h3>
      <p><strong>População 2010:</strong> ${formatarInteiro(props.populacao_2010)}</p>
      <p><strong>População 2015:</strong> ${formatarInteiro(props.populacao_2015)}</p>
      <p><strong>Domicílios:</strong> ${formatarInteiro(props.domicilios)}</p>
      <p class="map-data-warning">Dados demográficos históricos da base cartográfica.</p>
    </div>`;
}

function popupUA(props) {
  return `
    <div class="map-popup">
      <span class="map-popup-badge">Unidade administrativa</span>
      <h3>${props.nome || "Unidade Administrativa"}</h3>
      <p><strong>Código:</strong> ${props.codigo ?? "Não informado"}</p>
      <p><strong>Região:</strong> ${props.regiao || "Não informada"}</p>
      <p><strong>Área:</strong> ${formatarDecimal(props.area_km2)} km²</p>
      <p><strong>População 2015:</strong> ${formatarInteiro(props.populacao_2015)}</p>
      <p><strong>Densidade 2015:</strong> ${formatarDecimal(props.densidade_2015)} hab./km²</p>
      <p class="map-data-warning">Dados demográficos históricos da base cartográfica.</p>
    </div>`;
}

function popupBairro(props) {
  return `
    <div class="map-popup">
      <span class="map-popup-badge">Bairro oficial</span>
      <h3>${props.nome || "Bairro"}</h3>
      <p><strong>Código:</strong> ${props.codigo ?? "Não informado"}</p>
      <p><strong>Unidade administrativa:</strong> ${props.unidade_administrativa || "Não informada"}</p>
      <p><strong>Região:</strong> ${props.regiao || "Não informada"}</p>
      <p><strong>Área:</strong> ${formatarDecimal(props.area_km2, 3)} km²</p>
      <p><strong>População 2015:</strong> ${formatarInteiro(props.populacao_2015)}</p>
      <p><strong>Densidade 2015:</strong> ${formatarDecimal(props.densidade_2015, 0)} hab./km²</p>
      <p class="map-data-warning">Dados demográficos históricos da base cartográfica.</p>
    </div>`;
}

async function iniciarMapa() {
  const [
    equipamentosData,
    coordenadasTexto,
    equipamentosTerritoriaisTexto,
    limiteOficial,
    regioes,
    unidadesAdministrativas,
    bairros
  ] = await Promise.all([
    buscarJson("./dados/equipamentos-educacao-infantil.json", { equipamentos: [] }),
    buscarTexto("./dados/coordenadas-equipamentos.csv"),
    buscarTexto("./dados/equipamentos-territoriais.csv"),
    buscarJson("./dados/geografia/limite-municipal-oficial.geojson", {type:"FeatureCollection",features:[]}),
    buscarJson("./dados/geografia/regioes-oficiais.geojson", {type:"FeatureCollection",features:[]}),
    buscarJson("./dados/geografia/unidades-administrativas.geojson", {type:"FeatureCollection",features:[]}),
    buscarJson("./dados/geografia/bairros-oficiais.geojson", {type:"FeatureCollection",features:[]})
  ]);

  const mapa = L.map("mapa", { preferCanvas:true }).setView([-23.6487, -46.8522], 12);

  const baseClara = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(mapa);

  const bases = {"Mapa de ruas": baseClara};

  const camadas = {
    "Educação Infantil — direta": L.layerGroup().addTo(mapa),
    "Educação Infantil — conveniada": L.layerGroup().addTo(mapa),
    "Coordenadas para revisar": L.layerGroup().addTo(mapa),
    "Saúde": L.layerGroup(),
    "Assistência Social": L.layerGroup(),
    "Cultura": L.layerGroup(),
    "Esporte": L.layerGroup(),
    "Espaços para brincar": L.layerGroup()
  };

  const cores = {
    "Educação Infantil — direta": "#175a7a",
    "Educação Infantil — conveniada": "#e6793d",
    "Saúde": "#b94646",
    "Assistência Social": "#7b4ea3",
    "Cultura": "#d94e8f",
    "Esporte": "#2f7d62",
    "Espaços para brincar": "#f2bf4a",
    "Coordenadas para revisar": "#b94646"
  };

  const coordenadas = new Map(
    parseCsv(coordenadasTexto)
      .filter(item => item.id)
      .map(item => [String(item.id).trim(), {
        latitude: parseNumero(item.latitude),
        longitude: parseNumero(item.longitude),
        status: statusCoordenada(item),
        endereco_encontrado: item.endereco_encontrado || ""
      }])
  );

  const pontos = [];
  const statusResumo = { validado:0, revisar:0, "a-validar":0 };

  (equipamentosData.equipamentos || []).forEach(item => {
    const coord = coordenadas.get(String(item.id).trim());
    const lat = parseNumero(item.latitude) ?? coord?.latitude ?? null;
    const lng = parseNumero(item.longitude) ?? coord?.longitude ?? null;
    if (lat === null || lng === null) return;

    const status = coord?.status || statusCoordenada(item);
    statusResumo[status] = (statusResumo[status] || 0) + 1;

    const redeLayer = item.rede === "Conveniada"
      ? "Educação Infantil — conveniada"
      : "Educação Infantil — direta";

    const layerName = status === "revisar" ? "Coordenadas para revisar" : redeLayer;

    L.marker([lat, lng], { icon:criarIcone(cores[layerName]) })
      .addTo(camadas[layerName])
      .bindPopup(`
        <div class="map-popup">
          <span class="map-popup-badge">${item.rede} • ${item.modalidade || "Educação Infantil"}</span>
          <h3>${item.nome}</h3>
          <p><strong>Atendimentos:</strong> ${item.atendimentos ?? "A informar"}</p>
          <p><strong>Lista de espera:</strong> ${item.lista_espera ? "Sim" : "Não"}</p>
          <p><strong>Endereço:</strong> ${item.endereco || "A informar"}</p>
          <p><strong>Status da coordenada:</strong> ${status === "validado" ? "Validado" : status === "revisar" ? "Revisar" : "A validar"}</p>
          <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" rel="noopener">Conferir no Google Maps</a><br>
          <a href="rede-educacao-infantil.html">Consultar rede completa</a>
        </div>`);
    pontos.push([lat, lng]);
  });

  const territoriais = parseCsv(equipamentosTerritoriaisTexto);
  const semCoordenadas = {};

  territoriais.forEach(item => {
    const layerName = item.categoria;
    if (!camadas[layerName]) return;

    const lat = parseNumero(item.latitude);
    const lng = parseNumero(item.longitude);

    if (lat === null || lng === null) {
      semCoordenadas[layerName] = (semCoordenadas[layerName] || 0) + 1;
      return;
    }

    L.marker([lat, lng], { icon:criarIcone(cores[layerName]) })
      .addTo(camadas[layerName])
      .bindPopup(`
        <div class="map-popup">
          <span class="map-popup-badge">${layerName}</span>
          <h3>${item.nome}</h3>
          <p><strong>Território:</strong> ${item.territorio}</p>
          <p><strong>Bairro:</strong> ${item.bairro || "A confirmar"}</p>
          <a href="territorio.html?id=${encodeURIComponent(item.territorio_id)}">Ver território</a>
        </div>`);
    pontos.push([lat, lng]);
  });

  const overlays = {...camadas};

  const bairrosLayer = L.geoJSON(bairros, {
    style:estiloBairro,
    onEachFeature:(feature, layer) => {
      layer.bindPopup(popupBairro(feature.properties || {}));
      layer.on({
        mouseover:e => e.target.setStyle({weight:2, fillOpacity:0.12}),
        mouseout:e => bairrosLayer.resetStyle(e.target)
      });
    }
  });
  overlays["Bairros oficiais (114)"] = bairrosLayer;

  const uaLayer = L.geoJSON(unidadesAdministrativas, {
    style:estiloUA,
    onEachFeature:(feature, layer) => layer.bindPopup(popupUA(feature.properties || {}))
  });
  overlays["Unidades administrativas (20)"] = uaLayer;

  const regioesLayer = L.geoJSON(regioes, {
    style:estiloRegiao,
    onEachFeature:(feature, layer) => layer.bindPopup(popupRegiao(feature.properties || {}))
  });
  overlays["Regiões oficiais (3)"] = regioesLayer;

  const limiteLayer = L.geoJSON(limiteOficial, {
    style:estiloLimite,
    onEachFeature:(feature, layer) => layer.bindPopup(popupLimite(feature.properties || {}))
  }).addTo(mapa);
  overlays["Limite municipal oficial"] = limiteLayer;

  L.control.layers(bases, overlays, { collapsed:false }).addTo(mapa);
  L.control.scale({imperial:false}).addTo(mapa);

  if (limiteLayer.getBounds().isValid()) {
    mapa.fitBounds(limiteLayer.getBounds(), {padding:[18,18]});
  } else if (pontos.length) {
    mapa.fitBounds(pontos, {padding:[28,28], maxZoom:15});
  }

  const pendingDetails = Object.entries(semCoordenadas)
    .map(([category, count]) => `${category}: ${count}`)
    .join(" • ");

  document.querySelector("#mapa-resumo").innerHTML = `
    <strong>Atlas com cartografia oficial e ${pontos.length} equipamentos georreferenciados.</strong>
    <span>
      Educação Infantil: ${statusResumo.validado} validado(s) •
      ${statusResumo["a-validar"]} a validar •
      ${statusResumo.revisar} para revisar.
      ${pendingDetails ? ` Outras camadas aguardando coordenadas — ${pendingDetails}.` : ""}
    </span>
  `;

  const status = document.querySelector("#territory-boundary-status");
  if (status) {
    status.innerHTML = `
      <strong>Cartografia oficial incorporada:</strong>
      1 limite municipal, 3 regiões, 20 unidades administrativas e 114 bairros.
      Os territórios de CRAS continuam pendentes de uma base geográfica específica.
    `;
  }

  const catalog = document.querySelector("#atlas-layer-catalog");
  if (catalog) {
    const counts = territoriais.reduce((acc, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + 1;
      return acc;
    }, {});
    catalog.innerHTML = Object.entries(counts).map(([category, count]) => `
      <div class="atlas-layer-item">
        <span style="background:${cores[category] || "#666"}"></span>
        <strong>${category}</strong>
        <small>${count} registro(s) inventariado(s)</small>
      </div>`).join("");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarMapa().catch(error => {
    console.error(error);
    document.querySelector("#mapa-resumo").innerHTML =
      `<strong>Não foi possível carregar completamente o Atlas.</strong><span>${error.message}</span>`;
  });
});
