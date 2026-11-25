// Kotak TV maç fikstürü — iki ÜCRETSİZ kaynak, birbirini tamamlar (25.11.2026):
//  • football-data.org: Şampiyonlar Ligi, büyük Avrupa ligleri, Dünya Kupası/EURO (dakikada 10 istek; görev 1 istek yapar).
//  • api-football.com (v3.football.api-sports.io): Süper Lig ve Türkiye Kupası (günde 100 istek; görev en çok 3 istek yapar,
//    2 saatte bir → günde ~36).
// Dünden 7 gün sonrasına kadarki maçları fixtures.json'a yazar; uygulama bu herkese açık dosyayı okur.
// Anahtarlar YALNIZ GitHub gizli ayarlarından okunur (FOOTBALL_DATA_KEY, API_FOOTBALL_KEY); dosyaya, kayda, çıktıya YAZILMAZ.
// Bir kaynak o turda okunamazsa onun önceki maçları korunur; diğer kaynak etkilenmez.
const fs=require('node:fs');const path=require('node:path');
const FILE=path.join(__dirname,'fixtures.json');
const DAY=86400000;
const day=t=>new Date(t).toISOString().slice(0,10);
// Kaynakların bu turdaki durumu (herkese açık dosyaya yazılır; görev kaydı girişsiz okunamıyor). Anahtar İÇERMEZ.
const notes=[];const note=(...a)=>{const s=a.join(' ');console.log(s);notes.push(s.slice(0,200));};
async function getJson(url,headers){
 const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),60000);
 try{const r=await fetch(url,{signal:ctl.signal,headers:{'User-Agent':'KotakTV-fixtures/1.0',...headers}});return {status:r.status,ok:r.ok,data:r.ok?await r.json():null};}
 finally{clearTimeout(timer);}
}
/** football-data.org → [{...}] ya da null (okunamadı). */
async function footballData(now){
 const key=process.env.FOOTBALL_DATA_KEY;if(!key){note('football-data: anahtar yok, atlandı');return null;}
 const r=await getJson(`https://api.football-data.org/v4/matches?dateFrom=${day(now-DAY)}&dateTo=${day(now+7*DAY)}`,{'X-Auth-Token':key});
 if(!r.ok){note('football-data yanıtı',r.status);return null;}
 const m=[];
 for(const x of r.data.matches||[]){
  const t=Date.parse(x.utcDate);if(!Number.isFinite(t))continue;
  const h=x.homeTeam?.shortName||x.homeTeam?.name,a=x.awayTeam?.shortName||x.awayTeam?.name;if(!h||!a)continue;
  m.push({id:x.id,c:x.competition?.code||'',cn:x.competition?.name||'',h,a,hn:x.homeTeam?.name||h,an:x.awayTeam?.name||a,t,s:x.status||'',
   hs:x.score?.fullTime?.home??null,as:x.score?.fullTime?.away??null});
 }
 note('football-data:',m.length,'maç');return m;
}
/** api-football durum kısaltması → football-data biçimi (uygulama bunu okur). */
function afStatus(s){
 if(['1H','HT','2H','ET','BT','P','LIVE','INT'].includes(s))return 'IN_PLAY';
 if(['FT','AET','PEN','AWD','WO'].includes(s))return 'FINISHED';
 if(s==='PST')return 'POSTPONED';if(['CANC','ABD'].includes(s))return 'CANCELLED';if(s==='SUSP')return 'SUSPENDED';
 return 'TIMED';
}
const AF_LEAGUES=[{id:203,c:'tur.1',cn:'Süper Lig'},{id:206,c:'tur.cup',cn:'Türkiye Kupası'}];
/** api-football.com → [{...}] ya da null. Sezon her lig için API'den öğrenilir (yıl tahmini yok). */
async function apiFootball(now){
 const key=process.env.API_FOOTBALL_KEY;if(!key){note('api-football: anahtar yok, atlandı');return null;}
 const H={'x-apisports-key':key};const base='https://v3.football.api-sports.io';
 const out=[];let any=false;
 for(const L of AF_LEAGUES){
  const lr=await getJson(`${base}/leagues?id=${L.id}&current=true`,H);
  const errs=lr.data&&lr.data.errors&&Object.keys(lr.data.errors).length?JSON.stringify(lr.data.errors).slice(0,160):'';
  if(!lr.ok||errs){note('api-football',L.cn,'lig bilgisi okunamadı:',lr.status,errs);continue;}
  const season=lr.data.response?.[0]?.seasons?.find(s=>s.current)?.year;if(!season){note('api-football',L.cn,'güncel sezon yok');continue;}
  const fr=await getJson(`${base}/fixtures?league=${L.id}&season=${season}&from=${day(now-DAY)}&to=${day(now+7*DAY)}&timezone=UTC`,H);
  const ferr=fr.data&&fr.data.errors&&Object.keys(fr.data.errors).length?JSON.stringify(fr.data.errors).slice(0,160):'';
  if(!fr.ok||ferr){note('api-football',L.cn,'sezon',season,'maçlar okunamadı:',fr.status,ferr);continue;}
  any=true;let n=0;
  for(const x of fr.data.response||[]){
   const t=Date.parse(x.fixture?.date);const h=x.teams?.home?.name,a=x.teams?.away?.name;if(!Number.isFinite(t)||!h||!a)continue;
   out.push({id:`af${x.fixture.id}`,c:L.c,cn:L.cn,h,a,hn:h,an:a,t,s:afStatus(x.fixture?.status?.short||''),hs:x.goals?.home??null,as:x.goals?.away??null});n++;
  }
  note('api-football',L.cn,'sezon',season+':',n,'maç');
 }
 return any?out:null;
}
(async()=>{
 const now=Date.now();
 let prev=null;try{prev=JSON.parse(fs.readFileSync(FILE,'utf8'));}catch{}
 const old=prev?.m||[];
 const fd=await footballData(now).catch(e=>{note('football-data hatası:',String(e.message||e).slice(0,80));return null;});
 const af=await apiFootball(now).catch(e=>{note('api-football hatası:',String(e.message||e).slice(0,80));return null;});
 if(!fd&&!af)note('Hiçbir kaynak okunamadı; maçlar değiştirilmedi.');
 const isAf=x=>String(x.id).startsWith('af');
 // Okunamayan kaynağın önceki maçları korunur (yalnız hâlâ pencere içindekiler).
 const keep=(list)=>list.filter(x=>x.t>now-2*DAY);
 const m=[...(fd||keep(old.filter(x=>!isAf(x)))),...(af||keep(old.filter(isAf)))];
 m.sort((p,q)=>p.t-q.t||String(p.id).localeCompare(String(q.id)));
 if(prev&&JSON.stringify(prev.m)===JSON.stringify(m)&&JSON.stringify(prev.notes||[])===JSON.stringify(notes)){console.log('fikstür aynı:',m.length,'maç');return;}
 fs.writeFileSync(FILE,JSON.stringify({v:1,updated:now,source:'football-data.org + api-football.com (ücretsiz katmanlar)',notes,m})+'\n');
 console.log('fikstür:',m.length,'maç');
})().catch(e=>{console.error('fikstür hatası:',String(e.message||e).slice(0,120));process.exit(1);});
