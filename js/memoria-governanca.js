let memoriaEventos = [];
let memoriaGaleriaAtual = [];
let memoriaIndiceAtual = 0;

function esc(v) {
  return String(v ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

function abrirLightbox(imagens, indice, titulo) {
  memoriaGaleriaAtual = imagens;
  memoriaIndiceAtual = indice;
  atualizarLightbox(titulo);
  const lb = document.querySelector("#memoria-lightbox");
  lb.classList.add("aberto");
  lb.setAttribute("aria-hidden","false");
  document.body.classList.add("lightbox-open");
}

function atualizarLightbox(titulo) {
  if (!memoriaGaleriaAtual.length) return;
  const src = memoriaGaleriaAtual[memoriaIndiceAtual];
  document.querySelector("#memoria-lightbox-img").src = src;
  document.querySelector("#memoria-lightbox-img").alt = `${titulo} — registro ${memoriaIndiceAtual + 1}`;
  document.querySelector("#memoria-lightbox-legenda").textContent =
    `${titulo} • ${memoriaIndiceAtual + 1} de ${memoriaGaleriaAtual.length}`;
}

function fecharLightbox() {
  const lb = document.querySelector("#memoria-lightbox");
  lb.classList.remove("aberto");
  lb.setAttribute("aria-hidden","true");
  document.body.classList.remove("lightbox-open");
}

function navegarLightbox(delta) {
  memoriaIndiceAtual = (memoriaIndiceAtual + delta + memoriaGaleriaAtual.length) % memoriaGaleriaAtual.length;
  const eventoId = document.querySelector("#memoria-lightbox").dataset.eventoId;
  const evento = memoriaEventos.find(e => e.id === eventoId);
  atualizarLightbox(evento?.titulo || "Memória do PMPI");
}

function renderizarEvento(evento) {
  const thumbs = evento.imagens.slice(0, 6).map((src, i) => `
    <button class="memoria-thumb" type="button" data-evento="${esc(evento.id)}" data-indice="${i}">
      <img src="${esc(src)}" alt="${esc(evento.titulo)} — registro ${i+1}" loading="lazy">
    </button>
  `).join("");

  return `
    <article class="memoria-evento-card" id="${esc(evento.id)}">
      <div class="memoria-evento-capa">
        <img src="${esc(evento.capa)}" alt="${esc(evento.titulo)}" loading="lazy">
        <span class="status-badge">${esc(evento.tipo)}</span>
      </div>
      <div class="memoria-evento-conteudo">
        <div class="memoria-evento-meta">
          <span>${esc(evento.periodo || "Data a confirmar")}</span>
          <span>${evento.total_imagens} registro(s) fotográfico(s)</span>
        </div>
        <h2>${esc(evento.titulo)}</h2>
        <p>${esc(evento.descricao)}</p>
        <div class="memoria-galeria">${thumbs}</div>
        ${evento.imagens.length > 6 ? `<button class="btn secondary memoria-ver-galeria" type="button" data-evento="${esc(evento.id)}">Ver galeria completa (${evento.imagens.length})</button>` : ""}
      </div>
    </article>
  `;
}

function instalarEventosGaleria() {
  document.querySelectorAll(".memoria-thumb").forEach(btn => {
    btn.addEventListener("click", () => {
      const evento = memoriaEventos.find(e => e.id === btn.dataset.evento);
      if (!evento) return;
      document.querySelector("#memoria-lightbox").dataset.eventoId = evento.id;
      abrirLightbox(evento.imagens, Number(btn.dataset.indice), evento.titulo);
    });
  });

  document.querySelectorAll(".memoria-ver-galeria").forEach(btn => {
    btn.addEventListener("click", () => {
      const evento = memoriaEventos.find(e => e.id === btn.dataset.evento);
      if (!evento) return;
      document.querySelector("#memoria-lightbox").dataset.eventoId = evento.id;
      abrirLightbox(evento.imagens, 0, evento.titulo);
    });
  });
}

async function iniciarMemoria() {
  try {
    const r = await fetch("./dados/memoria/eventos.json", {cache:"no-store"});
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    memoriaEventos = data.eventos || [];

    const totalImagens = memoriaEventos.reduce((s,e)=>s+(e.total_imagens||0),0);
    document.querySelector("#memoria-resumo").innerHTML = `
      <div class="compact-kpi"><strong>${memoriaEventos.length}</strong><span>conjuntos documentados</span></div>
      <div class="compact-kpi"><strong>${totalImagens}</strong><span>registros fotográficos</span></div>
      <div class="compact-kpi"><strong>3</strong><span>dimensões de governança</span></div>
    `;

    document.querySelector("#memoria-eventos").innerHTML =
      memoriaEventos.map(renderizarEvento).join("");

    instalarEventosGaleria();
  } catch (e) {
    console.error(e);
    document.querySelector("#memoria-eventos").innerHTML =
      `<div class="note"><strong>Erro:</strong> não foi possível carregar os registros da memória institucional.</div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".memoria-lightbox-fechar").addEventListener("click", fecharLightbox);
  document.querySelector(".memoria-lightbox-anterior").addEventListener("click", ()=>navegarLightbox(-1));
  document.querySelector(".memoria-lightbox-proxima").addEventListener("click", ()=>navegarLightbox(1));
  document.querySelector("#memoria-lightbox").addEventListener("click", e => {
    if (e.target.id === "memoria-lightbox") fecharLightbox();
  });
  document.addEventListener("keydown", e => {
    if (!document.querySelector("#memoria-lightbox").classList.contains("aberto")) return;
    if (e.key === "Escape") fecharLightbox();
    if (e.key === "ArrowLeft") navegarLightbox(-1);
    if (e.key === "ArrowRight") navegarLightbox(1);
  });
  iniciarMemoria();
});
