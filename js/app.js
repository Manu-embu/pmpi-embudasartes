async function carregarIndicadores() {
  const area = document.querySelector("#indicadores");

  try {
    const resposta = await fetch("./dados/indicadores.json", {
      cache: "no-store"
    });

    if (!resposta.ok) {
      throw new Error(
        `Falha ao carregar indicadores.json: HTTP ${resposta.status}`
      );
    }

    const dados = await resposta.json();

    // Aceita tanto o formato antigo, em lista,
    // quanto o novo formato padronizado.
    const indicadores = Array.isArray(dados)
      ? dados
      : dados.indicadores;

    if (!Array.isArray(indicadores)) {
      throw new Error(
        "O arquivo JSON não contém uma lista de indicadores."
      );
    }

    const indicadoresHome = indicadores.filter(
      indicador =>
        indicador.publicar_home === true ||
        indicador.publicar_home === undefined
    );

    if (indicadoresHome.length === 0) {
      area.innerHTML =
        "<p>Nenhum indicador foi selecionado para a página inicial.</p>";
      return;
    }

    area.innerHTML = indicadoresHome
      .map(indicador => {
        const ano = indicador.ano_base ?? indicador.ano ?? "";
        const valor =
          indicador.valor_formatado ??
          indicador.valor ??
          "—";

        const nome =
          indicador.nome_curto ??
          indicador.nome ??
          "Indicador";

        const fonte =
          indicador.fonte_primaria ??
          indicador.fonte ??
          "A informar";

        const classe = normalizarClasse(
          indicador.prioridade ??
          indicador.status ??
          "informacao"
        );

        return `
          <article class="card ${classe}">
            <div class="eixo">
              ${indicador.eixo ?? "Indicador"} • ${ano}
            </div>

            <div class="valor">${valor}</div>

            <strong>${nome}</strong>

            <div class="fonte">
              Fonte: ${fonte}
            </div>

            ${
              indicador.nota
                ? `<p class="nota">${indicador.nota}</p>`
                : ""
            }
          </article>
        `;
      })
      .join("");
  } catch (erro) {
    console.error("Erro ao carregar os indicadores:", erro);

    area.innerHTML = `
      <div class="panel">
        <strong>Não foi possível carregar os indicadores.</strong>
        <p>
          Verifique o arquivo
          <code>dados/indicadores.json</code>.
        </p>
      </div>
    `;
  }
}

function normalizarClasse(valor) {
  return String(valor)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("_", "-")
    .replaceAll(" ", "-");
}

document.addEventListener(
  "DOMContentLoaded",
  carregarIndicadores
);
