
async function iniciarMapa() {
  const resposta = await fetch("./dados/equipamentos-educacao-infantil.json", { cache: "no-store" });
  const dados = await resposta.json();

  const mapa = L.map("mapa").setView([-23.6487, -46.8522], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(mapa);

  const georreferenciadas = dados.equipamentos.filter(u =>
    Number.isFinite(u.latitude) && Number.isFinite(u.longitude)
  );

  georreferenciadas.forEach(u => {
    L.marker([u.latitude, u.longitude]).addTo(mapa)
      .bindPopup(`<strong>${u.nome}</strong><br>${u.rede}<br>${u.atendimentos} atendimentos`);
  });

  document.querySelector("#mapa-resumo").innerHTML = `
    <strong>${georreferenciadas.length} de ${dados.equipamentos.length} unidades georreferenciadas.</strong>
    <span>Para exibir todos os equipamentos, preencha latitude e longitude no arquivo de coordenadas.</span>
  `;
}
document.addEventListener("DOMContentLoaded", iniciarMapa);
