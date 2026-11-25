// Wikipedia'dan maç fikstürü (ücretsiz, serbest lisanslı içerik; MediaWiki API otomatik okumaya izin verir).
//  • UEFA Avrupa Ligi ve Konferans Ligi lig aşaması sayfaları: bütün maçlar (football-data'nın ücretsiz katmanında yok).
//  • Büyük Türk kulüplerinin sezon sayfaları: Süper Lig ve Türkiye Kupası maçları (api-football olmadan da).
// Yalnız saati yazılmış maçlar alınır (saatsiz maç asistanı yanıltır). Saat dilimi: kutudaki "UTC+3" gibi yazı; yoksa
// UEFA sayfalarında Orta Avrupa saati (UEFA'nın kullandığı), kulüp sayfalarında Türkiye saati.
const UA={'User-Agent':'KotakTV-fixtures/1.0 (+https://github.com/ahmetd6189-create/kotak-tv-data)'};
const MONTHS={january:1,february:2,march:3,april:4,may:5,june:6,july:7,august:8,september:9,october:10,november:11,december:12};
function seasonName(now){const d=new Date(now);const y=d.getUTCFullYear(),m=d.getUTCMonth()+1;const a=m>=7?y:y-1;return `${a}–${String(a+1).slice(2)}`;}
/** Orta Avrupa saati farkı (dakika): Mart'ın son pazarı 01:00 UTC – Ekim'in son pazarı 01:00 UTC arası +120, yoksa +60. */
function cetOffset(y,mo,d){const lastSun=(m)=>{const t=new Date(Date.UTC(y,m,0));return t.getUTCDate()-t.getUTCDay();};
 const t=Date.UTC(y,mo-1,d,12);const start=Date.UTC(y,2,lastSun(3),1),end=Date.UTC(y,9,lastSun(10),1);return t>=start&&t<end?120:60;}
/** Bağlantı ve şablonlardan arınmış düz ad: "[[Beşiktaş J.K.|Beşiktaş]] {{fbaicon|TUR}}" → "Beşiktaş". */
function plainName(s){return String(s||'').replace(/<ref[\s\S]*?(<\/ref>|\/>)/g,'').replace(/\{\{[^{}]*\}\}/g,'').replace(/\{\{[^{}]*\}\}/g,'').replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g,'$1').replace(/\[\[([^\]]*)\]\]/g,'$1').replace(/'''?/g,'').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();}
function field(box,name){const m=new RegExp(`\\|\\s*${name}\\s*=[ \\t]*([^\\n]*)`).exec(box);return m?m[1].trim():'';}
function parseDate(v){
 let m=/Start date\|(\d{4})\|(\d{1,2})\|(\d{1,2})/i.exec(v);if(m)return [+m[1],+m[2],+m[3]];
 m=/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/.exec(plainName(v));if(m&&MONTHS[m[2].toLowerCase()])return [+m[3],MONTHS[m[2].toLowerCase()],+m[1]];
 m=/([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/.exec(plainName(v));if(m&&MONTHS[m[1].toLowerCase()])return [+m[3],MONTHS[m[1].toLowerCase()],+m[2]];
 m=/(\d{4})-(\d{2})-(\d{2})/.exec(v);if(m)return [+m[1],+m[2],+m[3]];
 return null;
}
/** Başlama anı (UTC ms) ya da null (saat yazılmamış). */
function kickoff(dateV,timeV,defaultZone){
 const d=parseDate(dateV);if(!d)return null;
 const head=timeV.split('(')[0];const tm=/(\d{1,2})[:.](\d{2})/.exec(head);if(!tm)return null;
 // Saat, maçın oynandığı yerin saati olabilir (kulüp sayfaları: "20:00 GMT", "21:00 TRT"); dilim yazısından çevrilir.
 let off;const z=/(?:UTC|GMT)\s*([+−-])\s*0?(\d{1,2})(?::(\d{2}))?/.exec(head);const summer=cetOffset(...d)===120;
 if(z)off=(z[1]==='+'?1:-1)*(+z[2]*60+(+z[3]||0));
 else if(/\b(TRT|MSK|AST)\b/.test(head))off=180;
 else if(/\bEES?T\b/.test(head))off=summer?180:120;
 else if(/\bCES?T\b/.test(head))off=summer?120:60;
 else if(/\b(BST|WEST|IST)\b/.test(head))off=60;
 else if(/\b(GMT|UTC|WET)\b/.test(head))off=0;
 else off=defaultZone==='CET'?(summer?120:60):180;
 return Date.UTC(d[0],d[1]-1,d[2],+tm[1],+tm[2])-off*60000;
}
/** Bir sayfadaki maç kutuları: {comp başlığı, ev, deplasman, başlama, skor}. */
function boxes(raw,defaultZone,compOf){
 // Yorum içindeki saatler ("<!-- 03:00 TRT -->": henüz belli değil) gerçek saat sayılmaz.
 const wikitext=raw.replace(/<!--[\s\S]*?-->/g,'');
 const heads=[...wikitext.matchAll(/\n(={2,4})\s*([^=\n]+?)\s*\1/g)].map(x=>({at:x.index,text:x[2]}));
 const out=[];const re=/\{\{\s*(?:#invoke:\s*Football box\s*\|\s*main|football box(?: collapsible)?)\b([\s\S]*?)\n\s*\}\}/gi;let m;
 while((m=re.exec(wikitext))){
  const box=m[1];const above=heads.filter(h=>h.at<m.index).map(h=>h.text);const comp=compOf(above,box);if(!comp)continue;
  const t=kickoff(field(box,'date'),field(box,'time'),defaultZone);if(t===null)continue;
  const h=plainName(field(box,'team1')),a=plainName(field(box,'team2'));if(!h||!a)continue;
  const sc=/^(\d+)\s*[–-]\s*(\d+)/.exec(plainName(field(box,'score')));
  out.push({...comp,h,a,t,s:sc?'FINISHED':'TIMED',hs:sc?+sc[1]:null,as:sc?+sc[2]:null});
 }
 return out;
}
async function wikitext(title){
 const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),45000);
 try{const r=await fetch('https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=wikitext&formatversion=2&redirects=1&page='+encodeURIComponent(title),{signal:ctl.signal,headers:UA});
  if(!r.ok)return null;const j=await r.json();return j.parse?.wikitext||null;}finally{clearTimeout(timer);}
}
const CLUBS=['Galatasaray S.K.','Fenerbahçe S.K.','Beşiktaş J.K.','Trabzonspor','İstanbul Başakşehir F.K.'];
/** Kulüp sayfasındaki bölüm başlığından organizasyon (Avrupa maçları UEFA sayfasından alındığı için burada yalnız yurt içi). */
function domestic(heads){
 // En yakın ORGANİZASYON başlığı karar verir ("Matches", "League phase" gibi alt başlıklar atlanır).
 for(let i=heads.length-1;i>=0;i--){const h=heads[i];
  if(/uefa|champions league|europa|conference league/i.test(h))return null;   // Avrupa maçları UEFA sayfasından
  if(/super cup|süper kupa/i.test(h))return {c:'tur.sc',cn:'Süper Kupa'};
  if(/turkish cup|türkiye kupası|ziraat/i.test(h))return {c:'tur.cup',cn:'Türkiye Kupası'};
  if(/süper lig|super lig/i.test(h))return {c:'tur.1',cn:'Süper Lig'};
  if(/^(competitions|season summary|transfers|references|statistics)$/i.test(h.trim()))return null;
 }
 return null;
}
/** Bütün Wikipedia fikstürü + durum notları. */
async function wikiFixtures(now,note,from,to){
 const season=seasonName(now);const out=[];
 for(const [title,c,cn] of [[`${season} UEFA Europa League league phase`,'EL','UEFA Avrupa Ligi'],[`${season} UEFA Conference League league phase`,'ECL','UEFA Konferans Ligi']]){
  try{const w=await wikitext(title);if(!w){note('wikipedia',cn,'sayfası yok');continue;}
   const list=boxes(w,'CET',()=>({c,cn})).filter(x=>x.t>=from&&x.t<=to);out.push(...list);note('wikipedia',cn+':',list.length,'maç');}
  catch(e){note('wikipedia',cn,'hatası:',String(e.message||e).slice(0,60));}
 }
 let dom=0;
 for(const club of CLUBS){
  try{const w=await wikitext(`${season} ${club} season`);if(!w)continue;
   const list=boxes(w,'TRT',domestic).filter(x=>x.t>=from&&x.t<=to);out.push(...list);dom+=list.length;}
  catch(e){note('wikipedia',club,'hatası:',String(e.message||e).slice(0,60));}
 }
 note('wikipedia Süper Lig/Kupa (kulüp sayfaları):',dom,'maç');
 // Aynı maç iki kulübün sayfasında: başlama + iki adın ilk 5 harfi (sıradan bağımsız) ile bir kez.
 const p=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,5);
 const key=x=>`${x.t}|${[p(x.h),p(x.a)].sort().join('|')}`;
 const seen=new Set();const uniq=[];for(const x of out){const k=key(x);if(seen.has(k))continue;seen.add(k);uniq.push(x);}
 // Kalıcı kimlik (her turda aynı): dosya gereksiz yere değişmesin.
 return uniq.map(x=>({id:`wk-${x.c}-${x.t}-${p(x.h)}-${p(x.a)}`,...x,hn:x.h,an:x.a}));
}
module.exports={wikiFixtures,boxes,kickoff,cetOffset,plainName,seasonName,domestic};
