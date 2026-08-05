const PMPI_TERRITORIAL = (() => {
  function parseNumero(valor) {
    if (valor === null || valor === undefined || valor === "") return null;
    if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
    const numero = Number(String(valor).trim().replace(",", "."));
    return Number.isFinite(numero) ? numero : null;
  }

  function parseCsv(texto) {
    const linhas = texto.split(/\r?\n/).filter(linha => linha.trim() !== "");
    if (linhas.length < 2) return [];

    function separar(linha) {
      const valores = [];
      let atual = "";
      let entreAspas = false;

      for (let i = 0; i < linha.length; i++) {
        const caractere = linha[i];
        if (caractere === '"') {
          if (entreAspas && linha[i + 1] === '"') {
            atual += '"';
            i++;
          } else {
            entreAspas = !entreAspas;
          }
        } else if (caractere === "," && !entreAspas) {
          valores.push(atual);
          atual = "";
        } else {
          atual += caractere;
        }
      }

      valores.push(atual);
      return valores;
    }

    const cabecalhos = separar(linhas[0]).map(item => item.trim());

    return linhas.slice(1).map(linha => {
      const valores = separar(linha);
      const registro = {};
      cabecalhos.forEach((cabecalho, indice) => registro[cabecalho] = valores[indice] ?? "");
      return registro;
    });
  }

  async function buscarJson(caminho, fallback = null) {
    try {
      const resposta = await fetch(caminho, { cache: "no-store" });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      return await resposta.json();
    } catch (erro) {
      console.warn(`Falha ao carregar ${caminho}`, erro);
      return fallback;
    }
  }

  async function buscarTexto(caminho, fallback = "") {
    try {
      const resposta = await fetch(caminho, { cache: "no-store" });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      return await resposta.text();
    } catch (erro) {
      console.warn(`Falha ao carregar ${caminho}`, erro);
      return fallback;
    }
  }

  function pontoNoAnel(ponto, anel) {
    const [x, y] = ponto;
    let dentro = false;

    for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
      const [xi, yi] = anel[i];
      const [xj, yj] = anel[j];
      const cruza = ((yi > y) !== (yj > y)) &&
        (x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi);
      if (cruza) dentro = !dentro;
    }

    return dentro;
  }

  function pontoNoPoligono(ponto, coordenadas) {
    if (!coordenadas?.length || !pontoNoAnel(ponto, coordenadas[0])) return false;
    for (let i = 1; i < coordenadas.length; i++) {
      if (pontoNoAnel(ponto, coordenadas[i])) return false;
    }
    return true;
  }

  function pontoNaGeometria(ponto, geometria) {
    if (!geometria) return false;
    if (geometria.type === "Polygon") return pontoNoPoligono(ponto, geometria.coordinates);
    if (geometria.type === "MultiPolygon") {
      return geometria.coordinates.some(poligono => pontoNoPoligono(ponto, poligono));
    }
    return false;
  }

  function localizarFeicao(latitude, longitude, colecao) {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    const ponto = [longitude, latitude];
    return (colecao?.features || []).find(feicao =>
      pontoNaGeometria(ponto, feicao.geometry)
    ) || null;
  }

  function normalizarTexto(valor) {
    return String(valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\b(jardim|jd|jard)\b/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  function bairroInformadoDoEquipamento(equipamento) {
    if (equipamento.bairro) return equipamento.bairro;
    const endereco = String(equipamento.endereco || "");
    const partes = endereco.split(/[-–,]/).map(item => item.trim()).filter(Boolean);
    return partes.find(item =>
      /jardim|jd\.?|vila|parque|centro|embú|embu/i.test(item)
    ) || "";
  }

  function compararBairros(informado, cartografico) {
    if (!informado || !cartografico) return "sem-comparacao";
    const a = normalizarTexto(informado);
    const b = normalizarTexto(cartografico);
    if (!a || !b) return "sem-comparacao";
    if (a === b || a.includes(b) || b.includes(a)) return "coerente";
    return "revisar";
  }

  function statusOriginal(registro) {
    const texto = String(
      registro.status_geocodificacao ||
      registro.status_georreferenciamento ||
      registro.status ||
      ""
    ).trim().toUpperCase();

    if (texto.includes("REVISAR") || texto.includes("ERRO")) return "revisar";
    if (texto.includes("VALIDADO")) return "validado";
    return "a-validar";
  }

  async function carregarBases() {
    const [equipamentos, coordenadasCsv, limite, bairros, unidades, regioes] =
      await Promise.all([
        buscarJson("./dados/equipamentos-educacao-infantil.json", { equipamentos: [] }),
        buscarTexto("./dados/coordenadas-equipamentos.csv", ""),
        buscarJson("./dados/geografia/limite-municipal-oficial.geojson", { type:"FeatureCollection", features:[] }),
        buscarJson("./dados/geografia/bairros-oficiais.geojson", { type:"FeatureCollection", features:[] }),
        buscarJson("./dados/geografia/unidades-administrativas.geojson", { type:"FeatureCollection", features:[] }),
        buscarJson("./dados/geografia/regioes-oficiais.geojson", { type:"FeatureCollection", features:[] })
      ]);

    const coordenadas = new Map(
      parseCsv(coordenadasCsv)
        .filter(item => item.id)
        .map(item => [String(item.id).trim(), item])
    );

    return {
      equipamentos: equipamentos.equipamentos || [],
      coordenadas,
      limite,
      bairros,
      unidades,
      regioes
    };
  }

  function territorializarEquipamento(equipamento, bases) {
    const coordenada = bases.coordenadas.get(String(equipamento.id).trim()) || {};
    const latitude = parseNumero(equipamento.latitude) ?? parseNumero(coordenada.latitude);
    const longitude = parseNumero(equipamento.longitude) ?? parseNumero(coordenada.longitude);

    const noMunicipio = localizarFeicao(latitude, longitude, bases.limite);
    const bairro = localizarFeicao(latitude, longitude, bases.bairros);
    const unidade = localizarFeicao(latitude, longitude, bases.unidades);
    const regiao = localizarFeicao(latitude, longitude, bases.regioes);

    const bairroInformado = bairroInformadoDoEquipamento(equipamento);
    const bairroCartografico = bairro?.properties?.nome || "";
    const comparacaoBairro = compararBairros(bairroInformado, bairroCartografico);
    const original = statusOriginal(coordenada);

    let situacao = "coerente";
    if (latitude === null || longitude === null) situacao = "sem-coordenada";
    else if (!noMunicipio) situacao = "fora-do-municipio";
    else if (original === "revisar" || comparacaoBairro === "revisar") situacao = "revisar";
    else if (original === "a-validar") situacao = "a-validar";

    return {
      ...equipamento,
      latitude,
      longitude,
      status_original: original,
      situacao_territorial: situacao,
      bairro_informado: bairroInformado,
      bairro_oficial: bairroCartografico,
      bairro_codigo: bairro?.properties?.codigo ?? "",
      unidade_administrativa:
        unidade?.properties?.nome ||
        bairro?.properties?.unidade_administrativa || "",
      unidade_administrativa_codigo:
        unidade?.properties?.codigo ||
        bairro?.properties?.codigo_unidade_administrativa || "",
      regiao_oficial:
        regiao?.properties?.nome ||
        unidade?.properties?.regiao ||
        bairro?.properties?.regiao || "",
      dentro_municipio: Boolean(noMunicipio)
    };
  }

  function territorializarTodos(bases) {
    return bases.equipamentos.map(item => territorializarEquipamento(item, bases));
  }

  function agruparPorBairro(equipamentos, bairrosGeoJson) {
    return (bairrosGeoJson?.features || []).map(feicao => {
      const props = feicao.properties || {};
      const codigo = String(props.codigo ?? "");
      const nome = props.nome || "";

      const unidades = equipamentos.filter(item =>
        String(item.bairro_codigo ?? "") === codigo ||
        (!codigo && item.bairro_oficial === nome)
      );

      return {
        codigo,
        nome,
        nome_abreviado: props.nome_abreviado || "",
        unidade_administrativa: props.unidade_administrativa || "",
        codigo_unidade_administrativa: props.codigo_unidade_administrativa || "",
        regiao: props.regiao || "",
        area_km2: props.area_km2 ?? null,
        populacao_2010: props.populacao_2010 ?? null,
        populacao_2015: props.populacao_2015 ?? null,
        densidade_2015: props.densidade_2015 ?? null,
        equipamentos: unidades,
        total_unidades: unidades.length,
        atendimentos: unidades.reduce((soma, item) => soma + (Number(item.atendimentos) || 0), 0),
        unidades_lista_espera: unidades.filter(item => item.lista_espera).length,
        diretas: unidades.filter(item => item.rede === "Direta").length,
        conveniadas: unidades.filter(item => item.rede === "Conveniada").length
      };
    });
  }

  function gerarCsvAuditoria(registros) {
    const campos = [
      "id","nome","rede","modalidade","latitude","longitude",
      "bairro_informado","bairro_oficial","unidade_administrativa",
      "regiao_oficial","dentro_municipio","status_original","situacao_territorial"
    ];

    const escapar = valor => `"${String(valor ?? "").replace(/"/g, '""')}"`;

    return [
      campos.join(","),
      ...registros.map(registro =>
        campos.map(campo => escapar(registro[campo])).join(",")
      )
    ].join("\n");
  }

  function baixarTexto(nomeArquivo, conteudo, tipo = "text/plain;charset=utf-8") {
    const blob = new Blob(["\ufeff", conteudo], { type: tipo });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return {
    carregarBases,
    territorializarTodos,
    agruparPorBairro,
    gerarCsvAuditoria,
    baixarTexto
  };
})();
