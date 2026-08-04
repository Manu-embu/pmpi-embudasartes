const nf = new Intl.NumberFormat("pt-BR");

async function carregarOdsMetas() {
  const [resOds, resMetas] = await Promise.all([
    fetch("./dados/ods.json", {cache:"no-store"}),
    fetch("./dados/metas-pmpi.json", {cache:"no-store"})
  ]);

  if (!resOds.ok || !resMetas.ok) {
    throw new Error("Não foi possível carregar os dados de ODS e metas.");
  }

  const odsData = await resOds.json();
  const metasData = await resMetas.json();

  const odsMap = new Map(odsData.ods.map(item => [item.numero, item]));

  document.querySelector("#ods-grid").innerHTML = odsData.ods.map(item => `
    <article class="ods-card" style="--ods-cor:${item.cor}">
      <div class="ods-number">${item.numero}</div>
      <h3>${item.nome}</h3>
      <p>${item.relacao}</p>
    </article>
  `).join("");

  document.querySelector("#metas-grid").innerHTML = metasData.metas.map(meta => `
    <article class="meta-monitoramento-card">
      <div class="meta-topline">
        <span class="status-badge">Em construção</span>
        <strong>${meta.codigo}</strong>
      </div>
      <h3>${meta.titulo}</h3>
      <div class="meta-values">
        <div><small>Linha de base</small><strong>${meta.linha_base}</strong><span>${meta.ano_base}</span></div>
        <div><small>Meta 2035</small><strong>${meta.meta_2035}</strong></div>
      </div>
      <div class="ods-mini-list">
        ${meta.ods.map(n => `<span style="--ods-cor:${odsMap.get(n)?.cor || '#666'}">ODS ${n}</span>`).join("")}
      </div>
      <p><strong>Responsável:</strong> ${meta.responsavel}</p>
    </article>
  `).join("");

  document.querySelector("#tabela-metas").innerHTML = metasData.metas.map(meta => `
    <tr>
      <td><strong>${meta.codigo}</strong><br>${meta.titulo}</td>
      <td>${meta.linha_base} (${meta.ano_base})</td>
      <td>${meta.ods.map(n => `ODS ${n}`).join(", ")}</td>
      <td>${meta.ppa.length ? meta.ppa.join(", ") : "A identificar"}</td>
      <td>${meta.responsavel}</td>
      <td><span class="status-pill status-alerta">Em construção</span></td>
    </tr>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  carregarOdsMetas().catch(erro => {
    console.error(erro);
    document.querySelector("main").insertAdjacentHTML(
      "afterbegin",
      `<section><div class="container"><div class="note"><strong>Erro:</strong> ${erro.message}</div></div></section>`
    );
  });
});
