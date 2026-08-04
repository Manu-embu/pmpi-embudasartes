async function verificarArquivo(item) {
  try {
    const resposta = await fetch(`./${item.caminho}`, {
      cache: "no-store",
      method: "GET"
    });

    if (!resposta.ok) {
      return {...item, disponivel:false, detalhe:`HTTP ${resposta.status}`};
    }

    let detalhe = "Arquivo disponível";
    const tipo = resposta.headers.get("content-type") || "";

    if (item.caminho.endsWith(".json") || item.caminho.endsWith(".geojson")) {
      try {
        const dados = await resposta.json();
        if (Array.isArray(dados.territorios)) {
          detalhe = `${dados.territorios.length} território(s)`;
        } else if (Array.isArray(dados.equipamentos)) {
          detalhe = `${dados.equipamentos.length} equipamento(s)`;
        } else if (Array.isArray(dados.ods)) {
          detalhe = `${dados.ods.length} ODS`;
        } else if (Array.isArray(dados.metas)) {
          detalhe = `${dados.metas.length} meta(s)`;
        } else if (dados.type === "FeatureCollection") {
          detalhe = `${(dados.features || []).length} feição(ões) geográfica(s)`;
        }
      } catch (erro) {
        return {...item, disponivel:false, detalhe:"JSON inválido"};
      }
    } else if (item.caminho.endsWith(".csv")) {
      const texto = await resposta.text();
      const linhas = texto.split(/\r?\n/).filter(Boolean);
      detalhe = `${Math.max(linhas.length - 1, 0)} registro(s)`;
    }

    return {...item, disponivel:true, detalhe};
  } catch (erro) {
    return {...item, disponivel:false, detalhe:"Falha de rede ou publicação"};
  }
}

async function iniciarStatus() {
  const resposta = await fetch("./dados/manifesto.json", {cache:"no-store"});
  if (!resposta.ok) throw new Error(`manifesto.json: HTTP ${resposta.status}`);

  const manifesto = await resposta.json();
  const resultados = await Promise.all(
    manifesto.arquivos.map(verificarArquivo)
  );

  const disponiveis = resultados.filter(x => x.disponivel).length;
  const ausentes = resultados.filter(x => !x.disponivel).length;
  const obrigatoriosAusentes = resultados.filter(
    x => !x.disponivel && x.obrigatorio
  ).length;

  document.querySelector("#status-resumo").innerHTML = `
    <div class="compact-kpi"><strong>${resultados.length}</strong><span>bases monitoradas</span></div>
    <div class="compact-kpi"><strong>${disponiveis}</strong><span>arquivos disponíveis</span></div>
    <div class="compact-kpi"><strong>${ausentes}</strong><span>arquivos ausentes ou inválidos</span></div>
    <div class="compact-kpi"><strong>${obrigatoriosAusentes}</strong><span>pendências obrigatórias</span></div>
  `;

  document.querySelector("#status-arquivos").innerHTML = resultados.map(item => `
    <article class="status-data-card ${item.disponivel ? "status-data-ok" : "status-data-error"}">
      <div>
        <span class="status-pill ${item.disponivel ? "status-ok" : "status-alerta"}">
          ${item.disponivel ? "Disponível" : "Pendência"}
        </span>
        <h3>${item.nome}</h3>
        <code>${item.caminho}</code>
        <p>${item.detalhe}</p>
        <small>Módulos: ${item.modulos.join(", ")}</small>
      </div>
      <strong>${item.obrigatorio ? "Obrigatório" : "Opcional"}</strong>
    </article>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarStatus().catch(erro => {
    document.querySelector("main").insertAdjacentHTML(
      "afterbegin",
      `<section><div class="container"><div class="note"><strong>Erro:</strong> ${erro.message}</div></div></section>`
    );
  });
});
