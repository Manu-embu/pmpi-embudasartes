let TERRITORIOS = [];

function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function contarEquipamentos(territorio) {
  return Array.isArray(territorio.equipamentos) ? territorio.equipamentos.length : 0;
}

function resumoTerritorio(territorio) {
  const parts = [];
  if (territorio.potencialidades.length) parts.push(`${territorio.potencialidades.length} potencialidades`);
  if (territorio.problemas.length) parts.push(`${territorio.problemas.length} problemas`);
  if (territorio.propostas.length) parts.push(`${territorio.propostas.length} propostas`);
  if (territorio.equipamentos.length) parts.push(`${territorio.equipamentos.length} equipamentos`);
  return parts.join(" • ") || "Conteúdo a complementar";
}

function criarCardTerritorio(territorio) {
  const destaques = territorio.problemas.slice(0, 2);
  return `
    <article class="territory-card">
      <div class="territory-card-top">
        <span class="status-badge">Diagnóstico preliminar</span>
        <strong>${territorio.nome}</strong>
      </div>
      <p class="territory-card-summary">${resumoTerritorio(territorio)}</p>
      ${destaques.length ? `
        <div class="territory-highlights">
          <small>Desafios em destaque</small>
          <ul>${destaques.map(item => `<li>${item}</li>`).join("")}</ul>
        </div>` : `
        <div class="territory-highlights">
          <small>Registro da oficina</small>
          <p>Não há coluna específica de problemas na fonte para este território.</p>
        </div>`}
      <a class="btn secondary" href="territorio.html?id=${encodeURIComponent(territorio.id)}">Explorar território</a>
    </article>
  `;
}

function renderizarIndice() {
  const cards = document.querySelector("#territory-cards");
  if (!cards) return;

  const search = document.querySelector("#buscar-territorio");
  const filter = document.querySelector("#filtro-conteudo");

  document.querySelector("#total-territorios").textContent = TERRITORIOS.length;
  document.querySelector("#total-potencialidades").textContent =
    TERRITORIOS.reduce((sum, t) => sum + t.potencialidades.length, 0);
  document.querySelector("#total-problemas").textContent =
    TERRITORIOS.reduce((sum, t) => sum + t.problemas.length, 0);
  document.querySelector("#total-propostas").textContent =
    TERRITORIOS.reduce((sum, t) => sum + t.propostas.length, 0);
  document.querySelector("#total-equipamentos-territoriais").textContent =
    TERRITORIOS.reduce((sum, t) => sum + contarEquipamentos(t), 0);

  function update() {
    const term = normalizar(search.value);
    const condition = filter.value;

    const filtered = TERRITORIOS.filter(t => {
      const text = normalizar([
        t.nome,
        ...t.potencialidades,
        ...t.problemas,
        ...t.propostas,
        ...t.equipamentos.map(e => `${e.nome} ${e.bairro} ${e.categoria}`)
      ].join(" "));

      const matchesText = !term || text.includes(term);
      const matchesCondition =
        !condition ||
        (condition === "equipamentos" && t.equipamentos.length > 0) ||
        (condition === "problemas" && t.problemas.length > 0) ||
        (condition === "propostas" && t.propostas.length > 0);

      return matchesText && matchesCondition;
    });

    document.querySelector("#resultado-territorios").textContent =
      `${filtered.length} território(s) encontrado(s)`;
    cards.innerHTML = filtered.map(criarCardTerritorio).join("");
  }

  search.addEventListener("input", update);
  filter.addEventListener("change", update);
  update();
}

function criarLista(items, emptyMessage) {
  if (!items.length) {
    return `<div class="empty-state">${emptyMessage}</div>`;
  }
  return items.map(item => `<div class="thematic-item">${item}</div>`).join("");
}

function agruparEquipamentos(equipamentos) {
  return equipamentos.reduce((groups, item) => {
    (groups[item.categoria] ||= []).push(item);
    return groups;
  }, {});
}

function renderizarTerritorio() {
  const title = document.querySelector("#territory-title");
  if (!title) return;

  const id = new URLSearchParams(location.search).get("id");
  const territory = TERRITORIOS.find(item => item.id === id) || TERRITORIOS[0];

  if (!territory) {
    title.textContent = "Território não encontrado";
    document.querySelector("#territory-main").innerHTML =
      `<section><div class="container"><div class="note">Não foi possível localizar o território solicitado.</div></div></section>`;
    return;
  }

  document.title = `${territory.nome} | PMPI`;
  title.textContent = territory.nome;
  document.querySelector("#territory-intro").textContent =
    `A oficina registrou ${territory.potencialidades.length} potencialidades, ${territory.problemas.length} problemas, ${territory.propostas.length} propostas e ${territory.equipamentos.length} equipamentos.`;
  document.querySelector("#territory-footer").textContent = territory.nome;

  document.querySelector("#territory-kpis").innerHTML = `
    <div class="compact-kpi"><strong>${territory.potencialidades.length}</strong><span>potencialidades</span></div>
    <div class="compact-kpi"><strong>${territory.problemas.length}</strong><span>problemas</span></div>
    <div class="compact-kpi"><strong>${territory.propostas.length}</strong><span>propostas</span></div>
    <div class="compact-kpi"><strong>${territory.equipamentos.length}</strong><span>equipamentos inventariados</span></div>
  `;

  if (territory.observacao) {
    const note = document.querySelector("#territory-note");
    note.hidden = false;
    note.innerHTML = `<strong>Observação da fonte:</strong> ${territory.observacao}`;
  }

  document.querySelector("#strengths-list").innerHTML =
    criarLista(territory.potencialidades, "Nenhuma potencialidade foi registrada nesta coluna da planilha.");
  document.querySelector("#problems-list").innerHTML =
    criarLista(territory.problemas, "A planilha não registra uma coluna específica de problemas para este território.");
  document.querySelector("#proposals-list").innerHTML =
    territory.propostas.length
      ? territory.propostas.map((item, index) => `
          <article class="proposal-card">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <p>${item}</p>
          </article>`).join("")
      : `<div class="empty-state">Nenhuma proposta foi registrada.</div>`;

  const groups = agruparEquipamentos(territory.equipamentos);
  const groupContainer = document.querySelector("#equipment-groups");

  if (!Object.keys(groups).length) {
    groupContainer.innerHTML = `
      <div class="empty-state">
        A planilha não apresenta inventário próprio de equipamentos para este território.
        O cadastro deverá ser complementado pelas secretarias responsáveis.
      </div>`;
  } else {
    groupContainer.innerHTML = Object.entries(groups).map(([category, items]) => `
      <section class="equipment-category">
        <div class="equipment-category-title">
          <h3>${category}</h3><span>${items.length}</span>
        </div>
        <div class="equipment-card-grid">
          ${items.map(item => `
            <article class="equipment-territory-card">
              <strong>${item.nome}</strong>
              <p>${item.bairro ? `Bairro: ${item.bairro}` : "Bairro a confirmar"}</p>
              <span class="status-pill status-alerta">Georreferenciamento pendente</span>
            </article>`).join("")}
        </div>
      </section>`).join("");
  }
}

async function iniciarTerritorios() {
  const caminho = "./dados/territorios.json";
  const response = await fetch(caminho, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      `Arquivo obrigatório não encontrado: ${caminho} (HTTP ${response.status}). ` +
      "Envie o arquivo territorios.json para a pasta dados do repositório."
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (erro) {
    throw new Error(
      `O arquivo ${caminho} foi encontrado, mas não contém JSON válido.`
    );
  }

  TERRITORIOS = Array.isArray(data.territorios) ? data.territorios : [];

  if (!TERRITORIOS.length) {
    throw new Error(
      `O arquivo ${caminho} foi carregado, mas não possui territórios cadastrados.`
    );
  }

  renderizarIndice();
  renderizarTerritorio();
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarTerritorios().catch(error => {
    console.error(error);
    const main = document.querySelector("main");
    if (main) {
      main.insertAdjacentHTML("afterbegin",
        `<section><div class="container"><div class="note"><strong>Erro de dados:</strong> ${error.message}</div></div></section>`);
    }
  });
});
