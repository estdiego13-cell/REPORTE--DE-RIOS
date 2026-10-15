export const SOURCE_DEFS = [
 {id:'ina',name:'INA · monitoreo de ríos',url:'https://alerta.ina.gob.ar/a5/diario/reporte_diario',kind:'structured',date:'2026-10-13'},
 {id:'smn',name:'SMN · El Niño / ENOS',url:'https://ws2.smn.gob.ar/enos',reference:'https://repositorio.smn.gob.ar/handle/20.500.12160/3332',kind:'climate',date:'2026-10-02'},
 {id:'municipio',name:'Municipio de Paso de los Libres',url:'https://pasodeloslibres.gob.ar/noticias/1c31c259-78f3-434b-b5c8-79c6472cfc96',listing:'https://pasodeloslibres.gob.ar/noticias',kind:'libres',date:'2026-10-07'},
 {id:'confirmado',name:'Confirmado · Paso de los Libres',url:'https://www.confirmado.com.ar/vernota.asp?id_noticia=35058',listing:'https://www.confirmado.com.ar/',kind:'libres',date:'2026-10-11'},
 {id:'concordia',name:'Concordia 24 · parte municipal / COE',url:'https://concordia24.com.ar/hasta-este-domingo-son-7-familias-evacuadas/',listing:'https://concordia24.com.ar/',kind:'concordia',date:'2026-10-11'},
 {id:'weather',name:'Pronóstico automático · Open-Meteo / MET Norway',url:'https://open-meteo.com/en/docs',kind:'weather',date:'2026-10-14'},
 {id:'esri',name:'Base topográfica · Esri y colaboradores',url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer?f=json',kind:'map',date:null}
];
export const CITIES = [
 ['Formosa / Formosa',-26.18,-58.16],['Chaco / Resistencia',-27.45,-58.99],['Misiones / Puerto Iguazú',-25.60,-54.58],['Corrientes / Corrientes',-27.47,-58.83],['Corrientes / Paso de los Libres',-29.72,-57.08],['Entre Ríos / Concordia',-31.39,-58.02],['Entre Ríos / Concepción del U.',-32.48,-58.23],['Entre Ríos / Gualeguaychú',-33.01,-58.51],['Santa Fe / Santa Fe',-31.65,-60.70],['Santa Fe / Rosario',-32.95,-60.63]
];
export function plain(s){return String(s).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#0*39;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/\s+/g,' ').trim();}
const norm=s=>plain(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const attr=(s,k)=>(s.match(new RegExp(k+'=["\']([^"\']*)["\']','i'))||[])[1];
export function parseNumber(s){const m=plain(s).match(/-?\d[\d.,]*/);if(!m)return NaN;let v=m[0];if(v.includes(','))v=v.replace(/\./g,'').replace(',','.');else if(/^\d{1,3}(\.\d{3})+$/.test(v))v=v.replace(/\./g,'');return +v;}
export function parseIna(html,previous){
 const dateMatch=plain(html).match(/Fecha de actualizaci[oó]n:\s*(\d{2})\/(\d{2})\/(\d{4})/i);
 if(!dateMatch)throw Error('El reporte no contiene una fecha verificable');
 const date=[dateMatch[3],dateMatch[2],dateMatch[1]].join('-');
 const result=structuredClone(previous);let count=0;
 for(const m of html.matchAll(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/gi)){
  const cells=[...m[2].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(x=>x[1]);if(cells.length<6)continue;
  const name=plain(cells[0]);let item=result.find(x=>norm(x.name.replace(/ \(Brasil\)/,''))===norm(name));
  if(!item&&norm(name)==='represaitaipu')item=result.find(x=>norm(x.name)==='itaipubrasil');if(!item)continue;
  const value=parseNumber(cells[2]),alert=parseNumber(cells[3]),evacuation=parseNumber(cells[4]);
  if(![value,alert,evacuation].every(Number.isFinite)||alert>=evacuation||value<0)continue;
  const status=plain(cells[5]);const category=value>=evacuation?3:value>=alert?2:/altas/i.test(status)?1:0;
  const observed=(cells[2].match(/fecha:\s*(\d{2})\/(\d{2})\/(\d{4})/i)||[]);
  const observedDate=observed.length?[observed[3],observed[2],observed[1]].join('-'):date;
  if(observedDate<item.date)continue;
  Object.assign(item,{previous:item.value,previousDate:item.date,value,alert,evacuation,category,status,date:observedDate,reportDate:date,river:plain(cells[1]),lat:+attr(m[1],'data-y')||item.lat,lon:+attr(m[1],'data-x')||item.lon,trend:attr(m[1],'data-tendencia')||'sin dato',fresh:true});count++;
 }
 if(count<5)throw Error('No se pudieron validar suficientes estaciones del reporte');
 return {stations:result,date,count};
}
async function remote(url){const res=await fetch(url,{headers:{'accept':'text/html,application/json;q=0.9','user-agent':'CrecidasLitoralDMO/1.0 https://crecidas-litoral-dmo.dearghost128.chatgpt.site'},signal:AbortSignal.timeout(12000)});if(!res.ok)throw Error('La fuente devolvió HTTP '+res.status);return res;}
function publicationDate(html){
 const iso=html.match(/(?:datePublished|article:published_time)["'\s:=content]+([12]\d{3}-\d{2}-\d{2})/i);if(iso)return iso[1];
 const text=plain(html);const months=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
 const m=text.match(/\b(\d{1,2})\s+(?:de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(?:de\s+)?(20\d{2})\b/i);
 return m?m[3]+'-'+String(months.indexOf(m[2].toLowerCase())+1).padStart(2,'0')+'-'+m[1].padStart(2,'0'):null;
}
export function extractEvacuation(html,kind){
 const text=plain(html);const amounts=new Set();
 for(const m of text.matchAll(/(?:ya son|son|total de)\s*(\d+)\s*(?:las\s+)?familias\s*(?:evacuadas|que debieron)/gi))amounts.add(+m[1]);
 for(const m of text.matchAll(/(?:fueron evacuadas|permanecen evacuadas|familias permanecen alojadas|actualmente,?)\s*(\d+)\s*familias/gi))amounts.add(+m[1]);
 for(const m of text.matchAll(/(\d+)\s*familias\s*(?:permanecen alojadas|permanecen evacuadas|fueron evacuadas)/gi))amounts.add(+m[1]);
 if(amounts.size!==1)return null;
 const families=[...amounts][0];if(families>100000)return null;
 let people=null;const pm=text.match(/(?:grupo est[aá] integrado por|hay)\s*(\d+)\s*personas/i);if(pm)people=+pm[1];
 return {families,people,kind};
}
async function collectArticles(source){
 const pages=[{url:source.url,html:await (await remote(source.url)).text()}];
 if(source.listing){
  try{
   const html=await (await remote(source.listing)).text();const links=[];
   for(const m of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
    if(!/evacu|crecida|inunda|r[ií]o uruguay/i.test(plain(m[2])+' '+m[1]))continue;
    const u=new URL(m[1],source.listing);if(u.hostname!==new URL(source.url).hostname||u.href===source.url||links.includes(u.href))continue;links.push(u.href);if(links.length===2)break;
   }
   const extra=await Promise.allSettled(links.map(async url=>({url,html:await(await remote(url)).text()})));for(const e of extra)if(e.status==='fulfilled')pages.push(e.value);
  }catch{}
 }
 return pages.map(x=>({...x,date:publicationDate(x.html)}));
}
export function weatherText(code){return code===0?'Despejado':code<=3?'Nubes y sol':code<=48?'Niebla':code<=57?'Llovizna':code<=67?'Lluvia':code<=77?'Nieve':code<=82?'Chubascos':code<=86?'Nieve':code>=95?'Tormentas':'Sin dato';}
async function weather(){
 const params=new URLSearchParams({latitude:CITIES.map(x=>x[1]).join(','),longitude:CITIES.map(x=>x[2]).join(','),daily:'temperature_2m_min,temperature_2m_max,weather_code,precipitation_probability_max,precipitation_sum',forecast_days:'4',timezone:'America/Argentina/Buenos_Aires'});
 const json=await(await remote('https://api.open-meteo.com/v1/forecast?'+params)).json();const items=Array.isArray(json)?json:[json];if(items.length!==CITIES.length)throw Error('Pronóstico incompleto');
 return items.map((r,i)=>{const d=r.daily;if(!d||d.time.length<4)throw Error('Faltan días de pronóstico');return {name:CITIES[i][0],source:'Open-Meteo',days:d.time.slice(1,4).map((date,j)=>({date,min:d.temperature_2m_min[j+1],max:d.temperature_2m_max[j+1],condition:weatherText(d.weather_code[j+1]),rainProbability:d.precipitation_probability_max[j+1],rainMm:d.precipitation_sum[j+1]}))};});
}
async function weatherFallback(){
 const today=new Date(Date.now()-3*3600000).toISOString().slice(0,10),dates=[1,2,3].map(i=>new Date(Date.parse(today+'T12:00:00Z')+i*86400000).toISOString().slice(0,10));
 return await Promise.all(CITIES.map(async ([name,lat,lon])=>{
  const j=await(await remote('https://api.met.no/weatherapi/locationforecast/2.0/compact?lat='+lat+'&lon='+lon)).json();if(!j.properties?.timeseries)throw Error('Pronóstico alternativo inválido');
  const days=dates.map(date=>{
   const rows=j.properties.timeseries.filter(r=>new Date(Date.parse(r.time)-3*3600000).toISOString().startsWith(date));if(rows.length<3)throw Error('Pronóstico horario incompleto');
   const temps=rows.map(r=>r.data.instant.details.air_temperature).filter(Number.isFinite);if(temps.length<3)throw Error('Faltan temperaturas');
   const symbols=rows.map(r=>r.data.next_1_hours?.summary?.symbol_code||r.data.next_6_hours?.summary?.symbol_code||'');const combined=symbols.join(' ');
   const condition=/thunder/.test(combined)?'Tormentas':/rain|showers/.test(combined)?'Lluvia / chubascos':/snow/.test(combined)?'Nieve':/fog/.test(combined)?'Niebla':/cloud/.test(combined)?'Nubes y sol':'Despejado';
   return {date,min:Math.round(Math.min(...temps)),max:Math.round(Math.max(...temps)),condition,rainProbability:null,rainMm:null};
  });return {name,source:'MET Norway · extremos estimados del pronóstico horario',days};
 }));
}
let inFlight;
export async function readData(env,seed){const obj=env.BUCKET?await env.BUCKET.get('state/current.json'):null;const state=obj?await obj.json():structuredClone(seed);state.sources=(state.sources||[]).filter(s=>s.id!=='canal26');return state;}
export async function refresh(env,seed,force=false){
 if(inFlight)return inFlight;
 inFlight=(async()=>{
  if(!env.BUCKET)throw Error('Almacenamiento compartido no disponible');
  const old=await readData(env,seed);if(!force&&old.checkedAt&&Date.now()-Date.parse(old.checkedAt)<45*60*1000)return old;
  const next=structuredClone(old),now=new Date().toISOString();const runs=await Promise.allSettled(SOURCE_DEFS.map(async source=>{
   const entry={...source,checkedAt:now,status:'ok',message:'Fuente consultada'};
   if(source.kind==='structured'){
    const p=parseIna(await(await remote(source.url)).text(),old.stations);next.stations=p.stations;next.hydroDate=p.date;entry.date=p.date;entry.message=p.count+' estaciones validadas';
   }else if(source.kind==='weather'){
    try{next.weather=await weather();entry.message='Pronóstico de 3 días para 10 ciudades · Open-Meteo';}catch(error){next.weather=await weatherFallback();entry.latestUrl='https://api.met.no/weatherapi/locationforecast/2.0/documentation';entry.message='Pronóstico de 3 días para 10 ciudades · respaldo MET Norway; Open-Meteo no disponible';}next.weatherDate=now;entry.date=now.slice(0,10);
   }else if(source.kind==='climate'){
    let html;try{html=await(await remote(source.url)).text();}catch{
     let report=source.reference;
     try{const collection=await(await remote('https://repositorio.smn.gob.ar/handle/20.500.12160/187')).text();for(const m of collection.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){if(/El fen[oó]meno El Ni[nñ]o.*(?:ENOS|Oscilaci[oó]n)/i.test(plain(m[2]))&&/\/handle\//.test(m[1])){const candidate=new URL(m[1],'https://repositorio.smn.gob.ar');if(candidate.hostname==='repositorio.smn.gob.ar'){report=candidate.href;break;}}}}catch{}
     html=await(await remote(report)).text();entry.latestUrl=report;
    }let text=plain(html);const match=text.match(/(?:Las condiciones|condiciones del ENOS)[\s\S]{0,500}?(?:fase|Niño|Niña)[\s\S]{0,250}/i);
    if(!match)throw Error('No se pudo identificar un diagnóstico ENOS verificable');
    const date=publicationDate(html)||(text.match(/Fecha\s+(20\d{2}-\d{2}-\d{2})/i)||[])[1];next.enso={text:match[0].slice(0,500),date:date||old.enso.date,url:entry.latestUrl||source.url};entry.date=date||old.enso.date;entry.message=date?'Informe climático consultado':'Contenido consultado; fecha del informe pendiente de revisión';if(!date)entry.status='review';
   }else if(source.kind==='map'){
    const j=await(await remote(source.url)).json();if(!j.tileInfo)throw Error('Servicio topográfico no disponible');entry.message='Servicio de mapa disponible';
   }else{
    const pages=await collectArticles(source);const latest=pages.filter(p=>p.date).sort((a,b)=>b.date.localeCompare(a.date))[0];if(!latest){entry.status='review';entry.message='Contenido consultado, sin fecha de publicación verificable';return entry;}
    entry.date=latest.date;entry.latestUrl=latest.url;
    const signature=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(plain(latest.html)));entry.hash=[...new Uint8Array(signature)].map(x=>x.toString(16).padStart(2,'0')).join('');
    const prior=(old.sources||[]).find(x=>x.id===source.id);entry.changed=!!prior?.hash&&prior.hash!==entry.hash;
    if(source.kind==='libres'||source.kind==='concordia'){
     const city=source.kind==='libres'?'Paso de los Libres':'Concordia';const record=next.evacuations.find(x=>x.city===city);const parsed=extractEvacuation(latest.html,source.kind);
     if(parsed&&latest.date>record.date){
      Object.assign(record,{families:parsed.families,people:parsed.people,autoEvacuated:null,date:latest.date,url:latest.url,source:source.name,summary:'Reporte actualizado automáticamente: '+parsed.families+' familias evacuadas'+(parsed.people!==null?', '+parsed.people+' personas alojadas.':'. Total de personas alojadas no confirmado en el nuevo reporte.')});entry.message='Conteo fechado incorporado';
     }else{entry.status=latest.date>record.date?'review':'ok';entry.message=latest.date>record.date?'Nuevo reporte: conteo ambiguo; se conserva el dato anterior':'Sin un conteo verificable más reciente';}
    }else{entry.message='Nota consultada; las afectaciones se mantienen con su fecha original';if(latest.date>old.impactDate||entry.changed){entry.status='review';entry.message='Nuevo contenido disponible: revisar delimitación de afectaciones';}}
   }
   return entry;
  }));
  next.sources=runs.map((r,i)=>r.status==='fulfilled'?r.value:{...SOURCE_DEFS[i],checkedAt:now,status:'error',date:(old.sources||[]).find(x=>x.id===SOURCE_DEFS[i].id)?.date||SOURCE_DEFS[i].date,message:String(r.reason?.message||r.reason),lastSuccess:(old.sources||[]).find(x=>x.id===SOURCE_DEFS[i].id)?.lastSuccess||null});
  for(const s of next.sources)if(s.status!=='error')s.lastSuccess=now;
  next.checkedAt=now;next.history=[{at:now,ok:next.sources.filter(x=>x.status==='ok').length,review:next.sources.filter(x=>x.status==='review').length,errors:next.sources.filter(x=>x.status==='error').length},...(old.history||[])].slice(0,20);
  await env.BUCKET.put('state/current.json',JSON.stringify(next),{httpMetadata:{contentType:'application/json'}});return next;
 })();try{return await inFlight;}finally{inFlight=null;}
}
