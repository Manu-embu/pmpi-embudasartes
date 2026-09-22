let memoriaEventos = [];
let memoriaGaleriaAtual = [];
let memoriaIndiceAtual = 0;


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function esc(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}


/* =========================================================
   ORDENAÇÃO DOS EVENTOS
   Eventos com destaque:true aparecem primeiro.
   Os demais mantêm a ordem original do JSON.
   ========================================================= */

function ordenarEventos(eventos) {
  return [...eventos].sort((a, b) => {
    const destaqueA = a.destaque === true ? 1 : 0;
    const destaqueB = b.destaque === true ? 1 : 0;

    return destaqueB - destaqueA;
  });
}


/* =========================================================
   LIGHTBOX
   ========================================================= */

function abrirLightbox(imagens, indice, titulo) {
  memoriaGaleriaAtual = imagens || [];
  memoriaIndiceAtual = indice || 0;

  if (!memoriaGaleriaAtual.length) return;

  atualizarLightbox(titulo);

  const lb = document.querySelector("#memoria-lightbox");

  if (!lb) return;

  lb.classList.add("aberto");
  lb.setAttribute("aria-hidden", "false");

  document.body.classList.add("lightbox-open");
}


function atualizarLightbox(titulo) {
  if (!memoriaGaleriaAtual.length) return;

  const src = memoriaGaleriaAtual[memoriaIndiceAtual];

  const imagem = document.querySelector("#memoria-lightbox-img");
  const legenda = document.querySelector("#memoria-lightbox-legenda");

  if (imagem) {
    imagem.src = src;
    imagem.alt =
      `${titulo} — registro ${memoriaIndiceAtual + 1}`;
  }

  if (legenda) {
    legenda.textContent =
      `${titulo} • ${memoriaIndiceAtual + 1} de ${memoriaGaleriaAtual.length}`;
  }
}


function fecharLightbox() {
  const lb = document.querySelector("#memoria-lightbox");

  if (!lb) return;

  lb.classList.remove("aberto");
  lb.setAttribute("aria-hidden", "true");

  document.body.classList.remove("lightbox-open");
}


function navegarLightbox(delta) {
  if (!memoriaGaleriaAtual.length) return;

  memoriaIndiceAtual =
    (
      memoriaIndiceAtual +
      delta +
      memoriaGaleriaAtual.length
    ) % memoriaGaleriaAtual.length;

  const lightbox = document.querySelector("#memoria-lightbox");

  if (!lightbox) return;

  const eventoId = lightbox.dataset.eventoId;

  const evento =
    memoriaEventos.find(e => e.id === eventoId);

  atualizarLightbox(
    evento?.titulo || "Memória do PMPI"
  );
}


/* =========================================================
   RENDERIZAÇÃO DOS EVENTOS
   ========================================================= */

function renderizarEvento(evento) {

  const imagens = Array.isArray(evento.imagens)
    ? evento.imagens
    : [];

  const totalImagens =
    evento.total_imagens ||
    imagens.length;

  const thumbs = imagens
    .slice(0, 6)
    .map((src, i) => `
      <button
        class="memoria-thumb"
        type="button"
        data-evento="${esc(evento.id)}"
        data-indice="${i}"
        aria-label="Abrir registro ${i + 1} de ${esc(evento.titulo)}"
      >
        <img
          src="${esc(src)}"
          alt="${esc(evento.titulo)} — registro ${i + 1}"
          loading="lazy"
        >
      </button>
    `)
    .join("");


  /* Classe especial para o evento destacado */
  const classeDestaque =
    evento.destaque === true
      ? " memoria-evento-destaque"
      : "";


  /* Selo adicional dentro do conteúdo */
  const seloDestaque =
    evento.destaque === true
      ? `
        <div class="memoria-destaque-selo">
          Destaque institucional
        </div>
      `
      : "";


  return `
    <article
      class="memoria-evento-card${classeDestaque}"
      id="${esc(evento.id)}"
    >

      <div class="memoria-evento-capa">

        <img
          src="${esc(evento.capa)}"
          alt="${esc(evento.titulo)}"
          loading="${evento.destaque ? "eager" : "lazy"}"
        >

        <span class="status-badge">
          ${esc(evento.tipo)}
        </span>

      </div>


      <div class="memoria-evento-conteudo">

        ${seloDestaque}

        <div class="memoria-evento-meta">

          <span>
            ${esc(evento.periodo || "Data a confirmar")}
          </span>

          <span>
            ${totalImagens} registro(s) fotográfico(s)
          </span>

        </div>


        <h2>
          ${esc(evento.titulo)}
        </h2>


        <p>
          ${esc(evento.descricao)}
        </p>


        <div class="memoria-galeria">
          ${thumbs}
        </div>


        ${
          imagens.length > 6
            ? `
              <button
                class="btn secondary memoria-ver-galeria"
                type="button"
                data-evento="${esc(evento.id)}"
              >
                Ver galeria completa (${imagens.length})
              </button>
            `
            : ""
        }

      </div>

    </article>
  `;
}


/* =========================================================
   EVENTOS DA GALERIA
   ========================================================= */

function instalarEventosGaleria() {

  document
    .querySelectorAll(".memoria-thumb")
    .forEach(btn => {

      btn.addEventListener("click", () => {

        const evento =
          memoriaEventos.find(
            e => e.id === btn.dataset.evento
          );

        if (!evento) return;

        const lightbox =
          document.querySelector("#memoria-lightbox");

        if (lightbox) {
          lightbox.dataset.eventoId =
            evento.id;
        }

        abrirLightbox(
          evento.imagens || [],
          Number(btn.dataset.indice),
          evento.titulo
        );

      });

    });


  document
    .querySelectorAll(".memoria-ver-galeria")
    .forEach(btn => {

      btn.addEventListener("click", () => {

        const evento =
          memoriaEventos.find(
            e => e.id === btn.dataset.evento
          );

        if (!evento) return;

        const lightbox =
          document.querySelector("#memoria-lightbox");

        if (lightbox) {
          lightbox.dataset.eventoId =
            evento.id;
        }

        abrirLightbox(
          evento.imagens || [],
          0,
          evento.titulo
        );

      });

    });
}


/* =========================================================
   CARREGAMENTO DOS DADOS
   ========================================================= */

async function iniciarMemoria() {

  try {

    const r = await fetch(
      "./dados/memoria/eventos.json",
      { cache: "no-store" }
    );


    if (!r.ok) {
      throw new Error(
        `HTTP ${r.status}`
      );
    }


    const data = await r.json();


    /*
      Primeiro recebe os eventos do JSON.
    */

    memoriaEventos =
      Array.isArray(data.eventos)
        ? data.eventos
        : [];


    /*
      Depois ordena:
      destaque:true aparece em primeiro lugar.
    */

    memoriaEventos =
      ordenarEventos(memoriaEventos);


    /* -----------------------------------------
       RESUMO
       ----------------------------------------- */

    const totalImagens =
      memoriaEventos.reduce(
        (s, e) => {

          const total =
            e.total_imagens ||
            (Array.isArray(e.imagens)
              ? e.imagens.length
              : 0);

          return s + total;

        },
        0
      );


    const resumo =
      document.querySelector(
        "#memoria-resumo"
      );


    if (resumo) {

      resumo.innerHTML = `

        <div class="compact-kpi">

          <strong>
            ${memoriaEventos.length}
          </strong>

          <span>
            conjuntos documentados
          </span>

        </div>


        <div class="compact-kpi">

          <strong>
            ${totalImagens}
          </strong>

          <span>
            registros fotográficos
          </span>

        </div>


        <div class="compact-kpi">

          <strong>
            3
          </strong>

          <span>
            dimensões de governança
          </span>

        </div>

      `;
    }


    /* -----------------------------------------
       EVENTOS
       ----------------------------------------- */

    const areaEventos =
      document.querySelector(
        "#memoria-eventos"
      );


    if (areaEventos) {

      areaEventos.innerHTML =
        memoriaEventos
          .map(renderizarEvento)
          .join("");

    }


    instalarEventosGaleria();


  } catch (e) {

    console.error(e);


    const areaEventos =
      document.querySelector(
        "#memoria-eventos"
      );


    if (areaEventos) {

      areaEventos.innerHTML = `
        <div class="note">
          <strong>Erro:</strong>
          não foi possível carregar
          os registros da memória institucional.
        </div>
      `;

    }

  }

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const fechar =
      document.querySelector(
        ".memoria-lightbox-fechar"
      );

    const anterior =
      document.querySelector(
        ".memoria-lightbox-anterior"
      );

    const proxima =
      document.querySelector(
        ".memoria-lightbox-proxima"
      );

    const lightbox =
      document.querySelector(
        "#memoria-lightbox"
      );


    if (fechar) {

      fechar.addEventListener(
        "click",
        fecharLightbox
      );

    }


    if (anterior) {

      anterior.addEventListener(
        "click",
        () => navegarLightbox(-1)
      );

    }


    if (proxima) {

      proxima.addEventListener(
        "click",
        () => navegarLightbox(1)
      );

    }


    if (lightbox) {

      lightbox.addEventListener(
        "click",
        e => {

          if (
            e.target.id ===
            "memoria-lightbox"
          ) {
            fecharLightbox();
          }

        }
      );

    }


    document.addEventListener(
      "keydown",
      e => {

        const lb =
          document.querySelector(
            "#memoria-lightbox"
          );


        if (
          !lb ||
          !lb.classList.contains("aberto")
        ) {
          return;
        }


        if (e.key === "Escape") {
          fecharLightbox();
        }


        if (e.key === "ArrowLeft") {
          navegarLightbox(-1);
        }


        if (e.key === "ArrowRight") {
          navegarLightbox(1);
        }

      }
    );


    iniciarMemoria();

  }
);
