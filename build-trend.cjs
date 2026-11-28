// Kotak TV trend listesi (28.11.2026). Gerçek izlenme sayısı veren ücretsiz VE ticari kullanıma açık bir servis yok
// (TMDB / Trakt / IMDb ticari kullanım için lisans ister). En yakın dürüst ölçü: Wikipedia sayfa görüntülenmeleri — insanların
// son günlerde en çok baktığı film ve dizi sayfaları. Veri Wikimedia'nındır, CC0 (kamu malı): ticari kullanım serbesttir.
// Türkçe Wikipedia daha ağır sayılır ("Türkiye'de şu an neye ilgi var"). Anahtar, şifre, kullanıcı verisi YOKTUR.
//
// Akış: son 7 günün en çok okunan 1000'er sayfası (tr, en) → Wikidata'dan yalnız film / dizi olanlar → trend.json
// Uygulama bu küçük dosyayı günde bir kez indirir, kendi kataloğundaki adlarla telefonda eşleştirir (katalog dışarı gitmez).
const fs=require('node:fs');const path=require('node:path');
const FILE=path.join(__dirname,'trend.json');
const UA='KotakTV-trend/1.0 (+https://github.com/ahmetd6189-create/kotak-tv-data)';
const PROJECTS=[{project:'tr.wikipedia',site:'trwiki',weight:1.6},{project:'en.wikipedia',site:'enwiki',weight:1}];
const DAYS=7,KEEP=400;
// Wikidata "nedir" (P31) değerleri: film ve dizi türleri.
// Film: film, uzun metraj, animasyon, animasyon uzun metraj, TV filmi, belgesel, 3B film.
const FILM=new Set(['Q11424','Q24869','Q202866','Q29168811','Q506240','Q93204','Q229390']);
// Dizi: televizyon dizisi, mini dizi, animasyon dizisi, web dizisi, animasyon TV dizisi, anime TV dizisi.
const SERIES=new Set(['Q5398426','Q1259759','Q581714','Q526877','Q117467246','Q63952888']);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(url,tries=3){
 for(let i=0;i<tries;i++){
  try{const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),30000);
   const r=await fetch(url,{headers:{'User-Agent':UA,'Api-User-Agent':UA,Accept:'application/json'},signal:ctl.signal});clearTimeout(t);
   if(r.status===404)return null;if(r.ok)return await r.json();
  }catch{}
  await sleep(1500*(i+1));
 }
 return null;
}
const ymd=d=>[d.getUTCFullYear(),String(d.getUTCMonth()+1).padStart(2,'0'),String(d.getUTCDate()).padStart(2,'0')];
const bare=t=>t.replace(/_/g,' ').replace(/\s*\((?:[^)]*\b(?:film|filmi|dizi|dizisi|TV series|miniseries|series|season|sezon|movie|animated)\b[^)]*|\d{4})\)\s*$/i,'').trim();
const yearOf=claims=>{for(const p of ['P577','P580']){for(const c of claims?.[p]||[]){const t=c?.mainsnak?.datavalue?.value?.time;const m=typeof t==='string'&&t.match(/^\+(\d{4})/);if(m)return +m[1];}}return 0;};
(async()=>{
 const now=new Date();const views=new Map();// "site|Sayfa" → ağırlıklı görüntülenme
 let days=0;
 for(const {project,site,weight} of PROJECTS){
  for(let back=1;back<=DAYS;back++){
   const d=new Date(now.getTime()-back*86400000);const [y,m,dd]=ymd(d);
   const data=await get(`https://wikimedia.org/api/rest_v1/metrics/pageviews/top/${project}/all-access/${y}/${m}/${dd}`);
   const list=data?.items?.[0]?.articles||[];if(list.length)days++;
   for(const a of list){const title=String(a.article||'');if(!title||title.includes(':')||/^Main_Page$|^Ana_Sayfa$/i.test(title))continue;
    const k=`${site}|${title}`;views.set(k,(views.get(k)||0)+Number(a.views||0)*weight);}
   await sleep(150);
  }
 }
 if(!days){console.log('Wikimedia okunamadı; trend.json değiştirilmedi.');return;}
 console.log('okunan gün×dil:',days,'aday sayfa:',views.size);
 // Wikidata: sayfa → varlık (nedir, yıl, Türkçe/İngilizce ad). 50'şerli.
 const bySite=new Map();for(const k of views.keys()){const [site,title]=k.split('|');(bySite.get(site)||bySite.set(site,[]).get(site)).push(title);}
 const items=new Map();// Q → {kind,year,titles:Set,score}
 for(const [site,titles] of bySite){
  for(let i=0;i<titles.length;i+=50){
   const batch=titles.slice(i,i+50);
   const data=await get(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&sites=${site}&titles=${encodeURIComponent(batch.join('|'))}&props=claims|labels|sitelinks&languages=tr|en&sitefilter=trwiki|enwiki`);
   for(const [qid,e] of Object.entries(data?.entities||{})){
    if(!/^Q\d+$/.test(qid))continue;const p31=(e.claims?.P31||[]).map(c=>c?.mainsnak?.datavalue?.value?.id).filter(Boolean);
    const kind=p31.some(x=>FILM.has(x))?'film':p31.some(x=>SERIES.has(x))?'series':null;if(!kind)continue;
    const link=e.sitelinks?.[site]?.title;if(!link)continue;
    const score=views.get(`${site}|${link.replace(/ /g,'_')}`)||0;if(!score)continue;
    const it=items.get(qid)||{kind,year:yearOf(e.claims),titles:new Set(),score:0};
    it.score+=score;
    for(const l of [e.labels?.tr?.value,e.labels?.en?.value,e.sitelinks?.trwiki?.title,e.sitelinks?.enwiki?.title])if(l)it.titles.add(bare(l));
    items.set(qid,it);
   }
   await sleep(120);
  }
 }
 const pack=kind=>[...items.entries()].filter(([,v])=>v.kind===kind).sort((a,b)=>b[1].score-a[1].score).slice(0,KEEP)
  .map(([q,v])=>({q,t:[...v.titles].filter(Boolean).slice(0,4),y:v.year||undefined,s:Math.round(v.score)}));
 const films=pack('film'),series=pack('series');
 fs.writeFileSync(FILE,JSON.stringify({v:1,updated:now.getTime(),days:DAYS,source:'Wikimedia pageviews (CC0) + Wikidata',films,series})+'\n');
 console.log('trend:',films.length,'film,',series.length,'dizi · ilk 5 film:',films.slice(0,5).map(f=>`${f.t[0]} (${f.y})`).join(', '));
})().catch(e=>{console.error(e);process.exit(1);});
