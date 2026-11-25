// Kotak TV maç fikstürü. football-data.org'un ÜCRETSİZ katmanından (Şampiyonlar Ligi, Premier Lig, LaLiga, Serie A,
// Bundesliga, Ligue 1, Eredivisie, Portekiz, Championship, Brezilya, Dünya Kupası, EURO) dünden 7 gün sonrasına kadarki
// maçları fixtures.json'a yazar. Uygulama bu herkese açık dosyayı okur; asistan "Fenerbahçe maçı ne zaman" sorusunu saat,
// rakip ve organizasyonla cevaplar, yayın akışından kanalı bulur.
// API anahtarı YALNIZ GitHub gizli ayarından (FOOTBALL_DATA_KEY) okunur; dosyaya, kayda, çıktıya YAZILMAZ.
// Ücretsiz sınır dakikada 10 istek; görev tek istek yapar.
const fs=require('node:fs');const path=require('node:path');
const FILE=path.join(__dirname,'fixtures.json');
const DAY=86400000;
const day=t=>new Date(t).toISOString().slice(0,10);
(async()=>{
 const key=process.env.FOOTBALL_DATA_KEY;
 if(!key){console.log('FOOTBALL_DATA_KEY gizli ayarı yok; fikstür güncellenmedi.');return;}
 const now=Date.now();
 const url=`https://api.football-data.org/v4/matches?dateFrom=${day(now-DAY)}&dateTo=${day(now+7*DAY)}`;
 const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),60000);
 let data;
 try{
  const r=await fetch(url,{signal:ctl.signal,headers:{'X-Auth-Token':key,'User-Agent':'KotakTV-fixtures/1.0'}});
  if(!r.ok){console.log('football-data yanıtı',r.status,'; fikstür değiştirilmedi.');return;}
  data=await r.json();
 }finally{clearTimeout(timer);}
 const m=[];
 for(const x of data.matches||[]){
  const t=Date.parse(x.utcDate);if(!Number.isFinite(t))continue;
  const h=x.homeTeam?.shortName||x.homeTeam?.name,a=x.awayTeam?.shortName||x.awayTeam?.name;if(!h||!a)continue;
  m.push({id:x.id,c:x.competition?.code||'',cn:x.competition?.name||'',h,a,hn:x.homeTeam?.name||h,an:x.awayTeam?.name||a,t,s:x.status||'',
   hs:x.score?.fullTime?.home??null,as:x.score?.fullTime?.away??null});
 }
 m.sort((p,q)=>p.t-q.t||String(p.id).localeCompare(String(q.id)));
 // Yalnız maçlar değiştiyse yaz (gereksiz kayıt olmasın): "updated" karşılaştırmaya girmez.
 let prev=null;try{prev=JSON.parse(fs.readFileSync(FILE,'utf8'));}catch{}
 if(prev&&JSON.stringify(prev.m)===JSON.stringify(m)){console.log('fikstür aynı:',m.length,'maç');return;}
 fs.writeFileSync(FILE,JSON.stringify({v:1,updated:now,source:'football-data.org (ücretsiz katman)',m})+'\n');
 console.log('fikstür:',m.length,'maç');
})().catch(e=>{console.error('fikstür hatası:',String(e.message||e).slice(0,120));process.exit(1);});
