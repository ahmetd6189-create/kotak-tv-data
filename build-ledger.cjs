// Kotak TV maç defteri. Herkese açık ücretsiz yayın akışlarındaki SPOR kanallarını okur, her maçın (iki takım, sıradan
// bağımsız) İLK yayın saatini ledger.json'a yazar. Uygulama bu dosyayla bir yayının CANLI mı BANT (tekrar) mı olduğunu bilir;
// kullanıcı uygulamayı günlerce açmasa bile. Anahtar, şifre, sağlayıcı verisi YOKTUR.
const {gunzipSync}=require('node:zlib');const fs=require('node:fs');const path=require('node:path');
const {pairKey,fold,REPLAY_WORDS,HIGHLIGHT_WORDS,SPORT_CHANNEL}=require('./lib/match-key.cjs');
const BASE='https://epgshare01.online/epgshare01/';
/** Türkiye (beIN, S Sport, TRT Spor, A Spor, Tabii, Eurosport), S Sport Plus, beIN MENA ve büyük Avrupa ülkelerinin spor kanalları. */
const SOURCES=['TR1','TR3','SSPORTPLUS1','BEIN1','UK1','DE1','ES1','IT1','FR1','NL1','PT1'].map(c=>`epg_ripper_${c}.xml.gz`);
const FILE=path.join(__dirname,'ledger.json');
const DAY=86400000,KEEP=14*DAY,NEW_MATCH=10*DAY,SHORT=45*60000,RECHECK=6*3600000;
const decode=s=>s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;|&#39;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(+n)).trim();
function xmltvTime(v){const m=/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)?\s*([+-]\d{4})?/.exec(v||'');if(!m)return NaN;const off=m[7]?(m[7][0]==='-'?-1:1)*(+m[7].slice(1,3)*60+ +m[7].slice(3)):0;return Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0))-off*60000;}
async function download(name){
 const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),180000);
 try{const r=await fetch(BASE+name,{signal:ctl.signal,headers:{'User-Agent':'KotakTV-ledger/1.0 (+https://github.com/ahmetd6189-create/kotak-tv-data)'}});if(!r.ok)throw new Error('HTTP '+r.status);
  const buf=Buffer.from(await r.arrayBuffer());return (buf[0]===0x1f&&buf[1]===0x8b?gunzipSync(buf):buf).toString('utf8');}finally{clearTimeout(timer);}
}
/** Spor kanallarındaki maç yayınları: [{key,start}] */
function airings(xml){
 const names=new Map();for(const m of xml.matchAll(/<channel\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/channel>/g)){const dn=/<display-name[^>]*>([\s\S]*?)<\/display-name>/.exec(m[2]);names.set(m[1],decode(dn?dn[1]:''));}
 const sport=new Set();for(const [id,name] of names)if(SPORT_CHANNEL.test(fold(`${id.replace(/[._]/g,' ')} ${name}`)))sport.add(id);
 const out=[];let programmes=0,from=Infinity;
 for(const m of xml.matchAll(/<programme\b([^>]*)>([\s\S]*?)<\/programme>/g)){
  const ch=/channel="([^"]+)"/.exec(m[1])?.[1];if(!ch||!sport.has(ch))continue;programmes++;
  const start=xmltvTime(/start="([^"]+)"/.exec(m[1])?.[1]);if(!Number.isFinite(start))continue;
  if(start<from)from=start;
  // 45 dk'dan kısa (bazı akışlar canlı maçı 60 dk'lık blokla yazar) "A - B" yayını kısaltılmış tekrar/özettir (ör. 26.11.2026 beIN 20:30–21:00 Göztepe - Trabzonspor); ilk yayın sayılmaz.
  const stop=xmltvTime(/stop="([^"]+)"/.exec(m[1])?.[1]);if(Number.isFinite(stop)&&stop>start&&stop-start<SHORT)continue;
  const t=/<title[^>]*>([\s\S]*?)<\/title>/.exec(m[2]);if(!t)continue;const title=decode(t[1]);const f=fold(title);
  if(REPLAY_WORDS.test(f)||HIGHLIGHT_WORDS.test(f))continue;const key=pairKey(title);if(key)out.push({key,start});
 }
 return {channels:sport.size,programmes,from,airings:out};
}
(async()=>{
 const now=Date.now();let prev={v:1,since:0,first:{}};try{prev=JSON.parse(fs.readFileSync(FILE,'utf8'));}catch{}
 const first={...(prev.first||{})};const sources=[];let ok=0,earliest=Infinity;
 // Kaynakların HEPSİNİN kapsadığı zaman aralığındaki kayıtlar her çalışmada kaynaklardan yeniden hesaplanır: daha önce yanlış
 // yazılmış bir kayıt (ör. kısa tekrar) böylece kendiliğinden düzelir. Sabit "son 6 saat" yetmedi (27.11.2026): GitHub
 // zamanlanmış işi günde ~2 kez çalıştırıyor, hatalı kayıt pencereden kaçtı. Kapsam dışındaki eski kayıtlar korunur.
 // Bir kaynak okunamadıysa yeniden hesaplama yapılmaz (o kaynağın kayıtları kaybolmasın).
 const read=[];
 for(const name of SOURCES){
  try{const xml=await download(name);const r=airings(xml);ok++;read.push(r);
   sources.push({file:name,channels:r.channels,programmes:r.programmes,matches:r.airings.length});console.log(name,'spor kanalı',r.channels,'maç yayını',r.airings.length);}
  catch(e){sources.push({file:name,error:String(e.message||e).slice(0,80)});console.log(name,'HATA',e.message);}
 }
 if(!ok){console.log('Hiçbir kaynak okunamadı; defter değiştirilmedi.');return;}
 if(ok===SOURCES.length){
  // Her kaynağın en eski programının en GEÇ olanı: bu andan sonrası bütün kaynaklarda var, güvenle yeniden hesaplanır.
  const starts=read.filter(r=>r.programmes>0&&Number.isFinite(r.from)).map(r=>r.from);
  const cover=starts.length?Math.min(Math.max(...starts),now-RECHECK):now-RECHECK;
  let n=0;for(const [k,at] of Object.entries(first))if(at>=cover){delete first[k];n++;}
  console.log('yeniden hesaplanan kayıt:',n,'· kapsam başı:',new Date(cover).toISOString());}
 for(const r of read)for(const a of r.airings){if(a.start<earliest)earliest=a.start;const known=first[a.key];if(known===undefined||a.start<known||a.start-known>NEW_MATCH)first[a.key]=a.start;}
 for(const [k,at] of Object.entries(first))if(at<now-KEEP)delete first[k];
 // since: defterin kesintisiz izlediği başlangıç. Uygulama "CANLI" yazmak için maçın bundan en az 1 gün sonra olmasını ister.
 const since=prev.since||Math.min(earliest,now);
 const sorted=Object.fromEntries(Object.entries(first).sort((a,b)=>a[0]<b[0]?-1:1));
 fs.writeFileSync(FILE,JSON.stringify({v:1,updated:now,since,sources,first:sorted})+'\n');
 console.log('defter:',Object.keys(sorted).length,'maç');
})().catch(e=>{console.error(e);process.exit(1);});
