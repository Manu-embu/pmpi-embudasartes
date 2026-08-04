function numeroCoordenada(valor) {
  if (valor === null || valor === undefined || valor === "") return null;
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
  const convertido = Number(String(valor).trim().replace(",", "."));
  return Number.isFinite(convertido) ? convertido : null;
}

function corPorRede(rede) {
  return rede === "Conveniada" ? "#e6793d" : "#175a7a";
}

function criarIcone(rede) {
  const cor = corPorRede(rede);
  return L.divIcon({
    className: "custom-map-marker",
    html: `<span style="background:${cor}"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12]
  });
}

async function iniciarMapa() {
  const resposta = await fetch("./dados/equipamentos-educacao-infantil.json", { cache: "no-store" });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

  const dados = await resposta.json();
  const unidades = dados.equipamentos || [];

  const mapa = L.map("mapa").setView([-23.6487, -46.8522], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(mapa);

  const grupos = {
    "Rede direta": L.layerGroup().addTo(mapa),
    "Rede conveniada": L.layerGroup().addTo(mapa)
  };

  const pontos = [];

  unidades.forEach(u => {
    const lat = numeroCoordenada(u.latitude);
    const lng = numeroCoordenada(u.longitude);
    if (lat === null || lng === null) return;

    const grupo = u.rede === "Conveniada" ? grupos["Rede conveniada"] : grupos["Rede direta"];
    const linkMaps = `https://www.google.com/maps?q=${lat},${lng}`;

    const marcador = L.marker([lat, lng], { icon: criarIcone(u.rede) })
      .bindPopup(`
        <div class="map-popup">
          <span class="map-popup-badge">${u.rede} • ${u.modalidade || "Educação Infantil"}</span>
          <h3>${u.nome}</h3>
          <p><strong>Atendimentos:</strong> ${u.atendimentos ?? "A informar"}</p>
          <p><strong>Lista de espera:</strong> ${u.lista_espera ? "Sim" : "Não"}</p>
          <p><strong>Endereço:</strong> ${u.endereco || "A informar"}</p>
          <p><strong>Desafio:</strong> ${u.desafios || "Não informado"}</p>
          <a href="${linkMaps}" target="_blank" rel="noopener">Abrir no Google Maps</a>
        </div>
      `);

    marcador.addTo(grupo);
    pontos.push([lat, lng]);
  });

  L.control.layers(null, grupos, { collapsed: false }).addTo(mapa);

  if (pontos.length > 0) {
    mapa.fitBounds(pontos, { padding: [28, 28], maxZoom: 15 });
  }

  document.querySelector("#mapa-resumo").innerHTML = `
    <strong>${pontos.length} de ${unidades.length} unidades georreferenciadas.</strong>
    <span>Azul: rede direta • Laranja: rede conveniada.</span>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarMapa().catch(erro => {
    console.error(erro);
    document.querySelector("#mapa-resumo").innerHTML =
      `<strong>Não foi possível carregar os equipamentos.</strong><span>${erro.message}</span>`;
  });
});
