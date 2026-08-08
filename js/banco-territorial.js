const fmt=v=>new Intl.NumberFormat("pt-BR").format(Number(v)||0);
async function iniciarBanco(){
 const [eiBases,rede]=await Promise.all([PMPI_TERRITORIAL.carregarBases(),PMIT_REDE.carregar()]);
 const ei=PMPI_TERRITORIAL.territorializarTodos(eiBases);
 const urban=rede.itens;
 const cats=PMIT_REDE.agruparCategoria(urban);
 const fora=urban.filter(x=>!x.dentro_municipio).length;
 const semBairro=urban.filter(x=>!x.bairro_oficial).length;
 const anos=[...new Set(urban.map(x=>x.ano_referencia).filter(Boolean))].join(", ")||"—";

 document.querySelector("#banco-resumo").innerHTML=`
 <div class="compact-kpi"><strong>${fmt(ei.length)}</strong><span>EI operacional</span></div>
 <div class="compact-kpi"><strong>${fmt(urban.length)}</strong><span>equipamentos históricos</span></div>
 <div class="compact-kpi"><strong>${Object.keys(cats).length}</strong><span>políticas públicas</span></div>
 <div class="compact-kpi"><strong>${anos}</strong><span>referência histórica</span></div>`;

 document.querySelector("#banco-categorias").innerHTML=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`
 <article class="indicator-domain-card"><span class="status-badge">${k}</span><h3>${fmt(v)} equipamento(s)</h3><p>Base cartográfica municipal de 2021.</p></article>`).join("");

 const regs={};urban.forEach(x=>{const r=x.regiao_oficial||"Não localizada";regs[r]=(regs[r]||0)+1;});
 document.querySelector("#banco-regioes").innerHTML=Object.entries(regs).map(([k,v])=>`
 <article class="executive-region-card"><span class="status-badge">${k}</span><h3>${fmt(v)} equipamento(s)</h3><p>Rede intersetorial territorializada.</p></article>`).join("");

 document.querySelector("#banco-qualidade").innerHTML=`
 <div class="compact-kpi"><strong>${fmt(urban.length-fora)}</strong><span>dentro do município</span></div>
 <div class="compact-kpi"><strong>${fmt(fora)}</strong><span>fora do limite</span></div>
 <div class="compact-kpi"><strong>${fmt(semBairro)}</strong><span>sem bairro identificado</span></div>
 <div class="compact-kpi"><strong>${fmt(ei.filter(x=>x.situacao_territorial==="revisar").length)}</strong><span>EI para revisar</span></div>`;
}
document.addEventListener("DOMContentLoaded",()=>iniciarBanco().catch(console.error));
