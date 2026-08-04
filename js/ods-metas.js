
const ODS_PADRAO=[
{numero:1,nome:"Erradicação da Pobreza",cor:"#E5243B",relacao:"CadÚnico, pobreza, proteção social e acesso equitativo."},
{numero:2,nome:"Fome Zero e Agricultura Sustentável",cor:"#DDA63A",relacao:"Segurança alimentar, nutrição, aleitamento e alimentação escolar."},
{numero:3,nome:"Saúde e Bem-Estar",cor:"#4C9F38",relacao:"Pré-natal, vacinação, mortalidade, desenvolvimento e saúde infantil."},
{numero:4,nome:"Educação de Qualidade",cor:"#C5192D",relacao:"Creche, pré-escola, inclusão, qualidade e formação profissional."},
{numero:5,nome:"Igualdade de Gênero",cor:"#FF3A21",relacao:"Parentalidade, cuidado, proteção e autonomia das mulheres."},
{numero:6,nome:"Água Potável e Saneamento",cor:"#26BDE2",relacao:"Água, higiene, saneamento e condições dos equipamentos."},
{numero:10,nome:"Redução das Desigualdades",cor:"#DD1367",relacao:"Equidade territorial, raça/cor, deficiência e renda."},
{numero:11,nome:"Cidades e Comunidades Sustentáveis",cor:"#FD9D24",relacao:"Mobilidade, praças, parques, moradia e território seguro."},
{numero:16,nome:"Paz, Justiça e Instituições Eficazes",cor:"#00689D",relacao:"Proteção integral, prevenção da violência, participação e governança."},
{numero:17,nome:"Parcerias e Meios de Implementação",cor:"#19486A",relacao:"Intersetorialidade, dados, financiamento e cooperação."}
];
const METAS_PADRAO=[
{codigo:"EDU-01",titulo:"Ampliar o atendimento em creche",linha_base:"42,05%",ano_base:2025,meta_2035:"A pactuar",responsavel:"Secretaria Municipal de Educação",ods:[4,5,10],ppa:["1005","1010","2036","2067"]},
{codigo:"EDU-02",titulo:"Universalizar o atendimento na pré-escola",linha_base:"87,81%",ano_base:2025,meta_2035:"100%",responsavel:"Secretaria Municipal de Educação",ods:[4,10],ppa:["2035","2036"]},
{codigo:"SAU-01",titulo:"Reduzir os óbitos infantis por causas evitáveis",linha_base:"50%",ano_base:2024,meta_2035:"A pactuar",responsavel:"Secretaria Municipal de Saúde",ods:[3,10],ppa:[]},
{codigo:"SAU-02",titulo:"Ampliar a cobertura da segunda dose da tríplice viral",linha_base:"83,86%",ano_base:2025,meta_2035:"A pactuar",responsavel:"Secretaria Municipal de Saúde",ods:[3,10],ppa:[]},
{codigo:"CID-01",titulo:"Qualificar espaços públicos para brincar",linha_base:"Inventário a construir",ano_base:2026,meta_2035:"A pactuar",responsavel:"Obras, Cultura, Esportes e Meio Ambiente",ods:[10,11,16],ppa:[]}
];
async function carregar(url,fallback){
  try{const r=await fetch(url,{cache:"no-store"}); if(!r.ok) throw new Error(); return await r.json();}
  catch(e){return fallback;}
}
async function iniciar(){
  const [o,m]=await Promise.all([
    carregar("./dados/ods.json",{ods:ODS_PADRAO}),
    carregar("./dados/metas-pmpi.json",{metas:METAS_PADRAO})
  ]);
  const ods=o.ods||ODS_PADRAO, metas=m.metas||METAS_PADRAO;
  const map=new Map(ods.map(x=>[x.numero,x]));
  document.querySelector("#ods-grid").innerHTML=ods.map(x=>`
    <article class="ods-card" style="--ods-cor:${x.cor}">
      <div class="ods-number">${x.numero}</div><h3>${x.nome}</h3><p>${x.relacao}</p>
    </article>`).join("");
  document.querySelector("#metas-grid").innerHTML=metas.map(x=>`
    <article class="meta-monitoramento-card">
      <div class="meta-topline"><span class="status-badge">Em construção</span><strong>${x.codigo}</strong></div>
      <h3>${x.titulo}</h3>
      <div class="meta-values"><div><small>Linha de base</small><strong>${x.linha_base}</strong><span>${x.ano_base}</span></div><div><small>Meta 2035</small><strong>${x.meta_2035}</strong></div></div>
      <div class="ods-mini-list">${x.ods.map(n=>`<span style="--ods-cor:${map.get(n)?.cor||"#666"}">ODS ${n}</span>`).join("")}</div>
      <p><strong>Responsável:</strong> ${x.responsavel}</p>
    </article>`).join("");
  document.querySelector("#tabela-metas").innerHTML=metas.map(x=>`
    <tr><td><strong>${x.codigo}</strong><br>${x.titulo}</td><td>${x.linha_base} (${x.ano_base})</td><td>${x.ods.map(n=>`ODS ${n}`).join(", ")}</td><td>${x.ppa.length?x.ppa.join(", "):"A identificar"}</td><td>${x.responsavel}</td><td><span class="status-pill status-alerta">Em construção</span></td></tr>`).join("");
}
document.addEventListener("DOMContentLoaded",iniciar);
