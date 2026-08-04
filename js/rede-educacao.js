
const fmt = new Intl.NumberFormat("pt-BR");

async function iniciarRede() {
  const resposta = await fetch("./dados/equipamentos-educacao-infantil.json", { cache: "no-store" });
  const dados = await resposta.json();
  const unidades = dados.equipamentos;

  document.querySelector("#kpi-total").textContent = fmt.format(dados.resumo.total_unidades);
  document.querySelector("#kpi-diretas").textContent = fmt.format(dados.resumo.diretas);
  document.querySelector("#kpi-conveniadas").textContent = fmt.format(dados.resumo.conveniadas);
  document.querySelector("#kpi-atendimentos").textContent = fmt.format(dados.resumo.atendimentos);
  document.querySelector("#kpi-espera").textContent = fmt.format(dados.resumo.unidades_com_lista_espera);

  const filtroRede = document.querySelector("#filtro-rede");
  const filtroModalidade = document.querySelector("#filtro-modalidade");
  const filtroEspera = document.querySelector("#filtro-espera");
  const busca = document.querySelector("#busca");

  function renderizar() {
    const termo = busca.value.trim().toLowerCase();
    const filtradas = unidades.filter(u => {
      const combinaRede = !filtroRede.value || u.rede === filtroRede.value;
      const combinaModalidade = !filtroModalidade.value || u.modalidade === filtroModalidade.value;
      const combinaEspera = !filtroEspera.value ||
        (filtroEspera.value === "sim" && u.lista_espera) ||
        (filtroEspera.value === "nao" && !u.lista_espera);
      const texto = `${u.nome} ${u.endereco} ${u.bairro} ${u.desafios}`.toLowerCase();
      return combinaRede && combinaModalidade && combinaEspera && (!termo || texto.includes(termo));
    });

    document.querySelector("#total-filtrado").textContent = `${filtradas.length} unidades encontradas`;
    document.querySelector("#tabela-unidades").innerHTML = filtradas.map(u => `
      <tr>
        <td><strong>${u.nome}</strong><br><small>${u.id}</small></td>
        <td>${u.rede}</td>
        <td>${u.modalidade}</td>
        <td>${u.bairro || "A validar"}</td>
        <td>${fmt.format(u.atendimentos)}</td>
        <td><span class="status-pill ${u.lista_espera ? "status-alerta" : "status-ok"}">${u.lista_espera ? "Sim" : "Não"}</span></td>
        <td>${u.desafios || "Não informado"}</td>
        <td><button class="link-button" data-id="${u.id}">Ver ficha</button></td>
      </tr>
    `).join("");

    document.querySelectorAll(".link-button").forEach(botao => {
      botao.addEventListener("click", () => abrirFicha(unidades.find(u => u.id === botao.dataset.id)));
    });
  }

  function abrirFicha(u) {
    const modal = document.querySelector("#ficha-modal");
    document.querySelector("#ficha-conteudo").innerHTML = `
      <button class="modal-close" id="fechar-modal" aria-label="Fechar">×</button>
      <span class="section-kicker">${u.rede} • ${u.modalidade}</span>
      <h2>${u.nome}</h2>
      <div class="detail-grid">
        <div><small>Atendimentos</small><strong>${fmt.format(u.atendimentos)}</strong></div>
        <div><small>Lista de espera</small><strong>${u.lista_espera ? "Sim" : "Não"}</strong></div>
        <div><small>Faixa etária</small><strong>${u.faixa_etaria || "A informar"}</strong></div>
        <div><small>Horário</small><strong>${u.horario || "A informar"}</strong></div>
      </div>
      <h3>Endereço</h3><p>${u.endereco || "A informar"}</p>
      <h3>Objetivo/serviço</h3><p>${u.objetivo || "A informar"}</p>
      <h3>Principais resultados</h3><p>${u.resultados || "Não informado"}</p>
      <h3>Principais desafios</h3><p>${u.desafios || "Não informado"}</p>
    `;
    modal.showModal();
    document.querySelector("#fechar-modal").addEventListener("click", () => modal.close());
  }

  [filtroRede, filtroModalidade, filtroEspera, busca].forEach(el => el.addEventListener("input", renderizar));
  renderizar();
}

document.addEventListener("DOMContentLoaded", iniciarRede);
