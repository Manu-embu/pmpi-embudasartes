function parseNumero(valor) {
  if (valor === null || valor === undefined || valor === "") return null;
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
  const convertido = Number(String(valor).trim().replace(",", "."));
  return Number.isFinite(convertido) ? convertido : null;
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

async function iniciarMapa() {
  const [
    equipamentosData,
    coordenadasTexto,
    equipamentosTerritoriaisTexto,
    territoriosData,
    territoriosGeo
  ] = await Promise.all([
    buscarJson("./dados/equipamentos-educacao-infantil.json", { equipamentos: [] }),
    buscarTexto("./dados/coordenadas-equipamentos.csv"),
    buscarTexto("./dados/equipamentos-territoriais.csv"),
    buscarJson("./dados/territorios.json", { territorios: [] }),
    buscarJson("./dados/geografia/territorios-oficiais.geojson", { type: "FeatureCollection", features: [] })
  ]);

  const mapa = L.map("mapa").setView([-23.6487, -46.8522], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(mapa);

  const camadas = {
    "Educação Infantil — direta": L.layerGroup().addTo(mapa),
    "Educação Infantil — conveniada": L.layerGroup().addTo(mapa),
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
    "Espaços para brincar": "#f2bf4a"
  };

  const coordenadas = new Map(
    parseCsv(coordenadasTexto)
      .filter(item => item.id)
      .map(item => [String(item.id).trim(), {
        latitude: parseNumero(item.latitude),
        longitude: parseNumero(item.longitude)
      }])
  );

  const pontos = [];
  (equipamentosData.equipamentos || []).forEach(item => {
    const coord = coordenadas.get(String(item.id).trim());
    const lat = parseNumero(item.latitude) ?? coord?.latitude ?? null;
    const lng = parseNumero(item.longitude) ?? coord?.longitude ?? null;
    if (lat === null || lng === null) return;

    const layerName = item.rede === "Conveniada"
      ? "Educação Infantil — conveniada"
      : "Educação Infantil — direta";

    L.marker([lat, lng], { icon: criarIcone(cores[layerName]) })
      .addTo(camadas[layerName])
      .bindPopup(`
        <div class="map-popup">
          <span class="map-popup-badge">${item.rede} • ${item.modalidade || "Educação Infantil"}</span>
          <h3>${item.nome}</h3>
          <p><strong>Atendimentos:</strong> ${item.atendimentos ?? "A informar"}</p>
          <p><strong>Lista de espera:</strong> ${item.lista_espera ? "Sim" : "Não"}</p>
          <p><strong>Endereço:</strong> ${item.endereco || "A informar"}</p>
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

    L.marker([lat, lng], { icon: criarIcone(cores[layerName]) })
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

  // Limite municipal oficial — API de Malhas do IBGE
  const limiteMunicipal = await buscarJson(
    "https://servicodados.ibge.gov.br/api/v3/malhas/municipios/3515004?formato=application/vnd.geo+json&qualidade=minima",
    null
  );

  const overlays = { ...camadas };

  if (limiteMunicipal?.features?.length) {
    const limiteLayer = L.geoJSON(limiteMunicipal, {
      style: {
        color: "#173d50",
        weight: 3,
        fillColor: "#175a7a",
        fillOpacity: 0.04
      }
    }).addTo(mapa);
    overlays["Limite municipal — IBGE"] = limiteLayer;
  }

  if (territoriosGeo?.features?.length) {
    const territoryLayer = L.geoJSON(territoriosGeo, {
      style: {
        color: "#7b4ea3",
        weight: 2,
        fillColor: "#7b4ea3",
        fillOpacity: 0.10
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.nome || feature.properties?.cras || "Território";
        layer.bindPopup(`<strong>${name}</strong>`);
      }
    }).addTo(mapa);
    overlays["Territórios oficiais de CRAS"] = territoryLayer;
  }

  L.control.layers(null, overlays, { collapsed: false }).addTo(mapa);

  if (pontos.length) {
    mapa.fitBounds(pontos, { padding: [28, 28], maxZoom: 15 });
  }

  const pendingDetails = Object.entries(semCoordenadas)
    .map(([category, count]) => `${category}: ${count}`)
    .join(" • ");

  document.querySelector("#mapa-resumo").innerHTML = `
    <strong>${pontos.length} equipamentos georreferenciados no Atlas.</strong>
    <span>${pendingDetails ? `Camadas territoriais aguardando coordenadas — ${pendingDetails}.` : "Todas as camadas cadastradas possuem coordenadas."}</span>
  `;

  const territoryStatus = document.querySelector("#territory-boundary-status");
  if (territoryStatus) {
    territoryStatus.innerHTML = territoriosGeo?.features?.length
      ? `<strong>${territoriosGeo.features.length} territórios oficiais carregados.</strong>`
      : `<strong>Territórios oficiais ainda não incorporados.</strong> Solicitar à Prefeitura o arquivo GeoJSON, Shapefile ou KML dos territórios de CRAS.`;
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
