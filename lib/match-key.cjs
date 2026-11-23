// Kotak TV uygulamasından üretildi (scripts/build-data-kit.cjs). Elle düzenlemeyin.
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// <stdin>
var stdin_exports = {};
__export(stdin_exports, {
  HIGHLIGHT_WORDS: () => HIGHLIGHT_WORDS,
  LIVE_WORDS: () => LIVE_WORDS,
  REPLAY_WORDS: () => REPLAY_WORDS,
  SPORT_CHANNEL: () => SPORT_CHANNEL,
  fold: () => fold,
  matchSides: () => matchSides,
  pairKey: () => pairKey,
  sidesOf: () => sidesOf,
  teamCanon: () => teamCanon,
  titleInfo: () => titleInfo
});
module.exports = __toCommonJS(stdin_exports);

// src/native/fold.ts
var FROM = "\xC0\xC1\xC2\xC3\xC4\xC5\xC6\xC7\xC8\xC9\xCA\xCB\xCC\xCD\xCE\xCF\xD0\xD1\xD2\xD3\xD4\xD5\xD6\xD8\xD9\xDA\xDB\xDC\xDD\xDE\xE0\xE1\xE2\xE3\xE4\xE5\xE7\xE8\xE9\xEA\xEB\xEC\xED\xEE\xEF\xF1\xF2\xF3\xF4\xF5\xF6\xF9\xFA\xFB\xFC\xFD\xFF\u0100\u0101\u0102\u0103\u0104\u0105\u0106\u0107\u0108\u0109\u010A\u010B\u010C\u010D\u010E\u010F\u0110\u0112\u0113\u0114\u0115\u0116\u0117\u0118\u0119\u011A\u011B\u011C\u011D\u011E\u011F\u0120\u0121\u0122\u0123\u0124\u0125\u0126\u0128\u0129\u012A\u012B\u012C\u012D\u012E\u012F\u0130\u0131\u0134\u0135\u0136\u0137\u0139\u013A\u013B\u013C\u013D\u013E\u0141\u0143\u0144\u0145\u0146\u0147\u0148\u014A\u014C\u014D\u014E\u014F\u0150\u0151\u0152\u0154\u0155\u0156\u0157\u0158\u0159\u015A\u015B\u015C\u015D\u015E\u015F\u0160\u0161\u0162\u0163\u0164\u0165\u0166\u0168\u0169\u016A\u016B\u016C\u016D\u016E\u016F\u0170\u0171\u0172\u0173\u0174\u0175\u0176\u0177\u0178\u0179\u017A\u017B\u017C\u017D\u017E\u017F\u0181\u0182\u0184\u0186\u0187\u0189\u018A\u018B\u018E\u018F\u0190\u0191\u0193\u0194\u0196\u0197\u0198\u019C\u019D\u019F\u01A0\u01A1\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B0\u01B1\u01B2\u01B3\u01B5\u01B7\u01B8\u01BC\u01CD\u01CE\u01CF\u01D0\u01D1\u01D2\u01D3\u01D4\u01D5\u01D6\u01D7\u01D8\u01D9\u01DA\u01DB\u01DC\u01DE\u01DF\u01E0\u01E1\u01E2\u01E3\u01E4\u01E6\u01E7\u01E8\u01E9\u01EA\u01EB\u01EC\u01ED\u01EE\u01EF\u01F0\u01F4\u01F5\u01F6\u01F7\u01F8\u01F9\u01FA\u01FB\u01FC\u01FD\u01FE\u01FF\u0200\u0201\u0202\u0203\u0204\u0205\u0206\u0207\u0208\u0209\u020A\u020B\u020C\u020D\u020E\u020F\u0210\u0211\u0212\u0213\u0214\u0215\u0216\u0217\u0218\u0219\u021A\u021B\u021C\u021E\u021F\u0220\u0222\u0224\u0226\u0227\u0228\u0229\u022A\u022B\u022C\u022D\u022E\u022F\u0230\u0231\u0232\u0233\u023A\u023B\u023D\u023E\u0241\u0243\u0244\u0245\u0246\u0248\u024A\u024C\u024E";
var TO = "aaaaaa\xE6ceeeeiiii\xF0nooooo\xF8uuuuy\xFEaaaaaaceeeeiiiinooooouuuuyyaaaaaaccccccccdd\u0111eeeeeeeeeegggggggghh\u0127iiiiiiiiiijjkkllllll\u0142nnnnnn\u014Boooooo\u0153rrrrrrsssssssstttt\u0167uuuuuuuuuuuuwwyyyzzzzzzs\u0253\u0183\u0185\u0254\u0188\u0256\u0257\u018C\u01DD\u0259\u025B\u0192\u0260\u0263\u0269\u0268\u0199\u026F\u0272\u0275oo\u01A3\u01A5\u0280\u01A8\u0283\u01AD\u0288uu\u028A\u028B\u01B4\u01B6\u0292\u01B9\u01BDaaiioouuuuuuuuuuaaaa\xE6\xE6\u01E5ggkkoooo\u0292\u0292jgg\u0195\u01BFnnaa\xE6\xE6\xF8\xF8aaaaeeeeiiiioooorrrruuuusstt\u021Dhh\u019E\u0223\u0225aaeeooooooooyy\u2C65\u023C\u019A\u2C66\u0242\u0180\u0289\u028C\u0247\u0249\u024B\u024D\u024F";
var TABLE = /* @__PURE__ */ new Map();
for (let i = 0; i < FROM.length; i++) TABLE.set(FROM.charCodeAt(i), TO[i]);
TABLE.set(223, "ss");
TABLE.set(230, "ae");
TABLE.set(198, "ae");
TABLE.set(339, "oe");
TABLE.set(338, "oe");
var ASCII = /^[\x00-\x7f]*$/;
function fold(value) {
  if (ASCII.test(value)) return value.toLowerCase();
  let out = "";
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    if (c < 128) {
      out += c >= 65 && c <= 90 ? String.fromCharCode(c + 32) : value[i];
      continue;
    }
    if (c >= 768 && c <= 879) continue;
    const mapped = TABLE.get(c);
    out += mapped !== void 0 ? mapped : value[i].toLowerCase();
  }
  return out;
}

// src/native/match-key.ts
var NOT_MATCH = /\b(ozet|ozetleri|tekrar|arsiv|nostalji|replay|highlights?|bant|magazin|studyo|analiz|program|haber\w*|gundem|yorum|sohbet|tahmin|belgesel|antrenman|basin|roportaj|klasik)\b/;
var REPLAY_WORDS = /\b(tekrar\w*|bant|banttan|arsiv|nostalji|replay|rerun|klasik maclar|unutulmaz)\b/;
var HIGHLIGHT_WORDS = /\b(ozet|ozeti|ozetleri|ozetler|highlights?|gollerin? tamami|tum goller)\b/;
var LIVE_WORDS = /(\bcanli\b|\blive\b|\bcnl\b|\(c\))/;
var LEAGUE = /\b(lig\w*|league|liga|ligue|serie|bundesliga|eredivisie|premier|championship|cup|kupa\w*|uefa|fifa|copa|coppa|pokal|trophy|superlig|primeira|laliga|euroleague|eurocup)\b/;
function matchSides(title) {
  if (NOT_MATCH.test(fold(title))) return null;
  let t = title.replace(/\s*[\(\[]\s*(canlı|canli|c|live|cnl|hd|fhd|4k)\s*[\)\]]\s*/gi, " ").replace(/^\s*(canlı|canli|live|cnl)\s*[:\-|·]\s*/i, "").trim();
  let league;
  const colon = t.match(/^([^:]{3,40}):\s*(.+)$/);
  if (colon) {
    league = colon[1].trim();
    t = colon[2].trim();
  }
  let parts = t.split(/\s+(?:-|–|—|vs\.?|v|x)\s+/i);
  if (parts.length === 3 && LEAGUE.test(fold(parts[0]))) {
    league = league || parts[0].trim();
    parts = parts.slice(1);
  }
  if (parts.length !== 2) return null;
  const [home, away] = parts.map((s) => s.replace(/\s*[\(\[][^\)\]]*[\)\]]\s*$/, "").trim());
  const ok = (s) => s.length >= 2 && s.length <= 40 && /[a-zçğıöşü]{2}/i.test(s) && !/\d{3,}/.test(s);
  return ok(home) && ok(away) ? { home, away, league } : null;
}
function sidesOf(title) {
  const cleaned = title.replace(/[\(\[][^\)\]]*[\)\]]/g, " ").replace(/\b(tekrar\w*|bant|banttan|özet\w*|ozet\w*|replay|highlights?)\b\s*[:\-|·]?/gi, " ").replace(/\s+/g, " ").trim();
  return matchSides(cleaned);
}
var DROP = /* @__PURE__ */ new Set(["fk", "sk", "sfk", "jk", "fc", "ac", "cf", "afc", "as", "sc", "cd", "ud", "kulubu", "futbol", "spor kulubu", "ikas", "rams", "tumosan", "ahlatci", "caykur", "corendon", "zecorner", "hesapcom", "hesap", "bellona", "misli", "siltas", "yapi", "natura", "dunyasi", "emlakjet", "atakas", "sipay", "vavacars", "teksut", "mke", "net", "global", "yukatel", "gzt", "fraport", "tav", "aytemiz", "medipol", "demir", "grup"]);
var SAME = { "manchester city": "man city", "manchester united": "man utd", "man united": "man utd", "istanbul basaksehir": "basaksehir", "istanbul bb": "basaksehir", "atletico de madrid": "atletico madrid", "atletico": "atletico madrid", "internazionale": "inter", "inter milan": "inter", "fc internazionale": "inter", "paris saint germain": "psg", "paris sg": "psg", "paris saint-germain": "psg", "bayern munchen": "bayern", "bayern munich": "bayern", "fc bayern": "bayern", "tottenham hotspur": "tottenham", "spurs": "tottenham", "wolverhampton": "wolves", "wolverhampton wanderers": "wolves", "nottingham forest": "nottm forest", "nott m forest": "nottm forest", "nott'm forest": "nottm forest", "newcastle united": "newcastle", "west ham united": "west ham", "brighton hove albion": "brighton", "leeds united": "leeds", "fatih karagumruk": "karagumruk", "genclerbirligi": "genclerbirligi", "turkey": "turkiye", "germany": "almanya", "spain": "ispanya", "england": "ingiltere", "france": "fransa", "italy": "italya", "netherlands": "hollanda", "portugal": "portekiz", "belgium": "belcika", "croatia": "hirvatistan", "switzerland": "isvicre" };
function teamCanon(name) {
  const words = fold(name).replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !DROP.has(w));
  const joined = words.join(" ");
  return SAME[joined] || joined || fold(name).replace(/[^a-z0-9]/g, "");
}
function pairKey(title) {
  return titleInfo(title).key;
}
var infoCache = /* @__PURE__ */ new Map();
function titleInfo(title) {
  let v = infoCache.get(title);
  if (v) return v;
  const f = fold(title);
  v = { key: computePairKey(title), replay: REPLAY_WORDS.test(f), highlight: HIGHLIGHT_WORDS.test(f), live: LIVE_WORDS.test(f) };
  if (infoCache.size >= 4e4) infoCache.clear();
  infoCache.set(title, v);
  return v;
}
function computePairKey(title) {
  const sides = sidesOf(title);
  if (!sides) return null;
  const a = teamCanon(sides.home).replace(/\s+/g, ""), b = teamCanon(sides.away).replace(/\s+/g, "");
  if (a.length < 2 || b.length < 2 || a === b) return null;
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}
var SPORT_CHANNEL = /\b(spor\w*|sports?|bein\w*|exxen\w*|tivibu|s ?sport\w*|eurosport\w*|tabii|dazn|arena ?sport|sky ?sport\w*|futbol|football|gs ?tv|fb ?tv|bjk ?tv|ts ?tv|alkass|ssc|espn|tnt sports|canal\+? ?sport\w*|movistar|eleven|sport ?tv|setanta|supersport|premier sports|viaplay)\b/;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HIGHLIGHT_WORDS,
  LIVE_WORDS,
  REPLAY_WORDS,
  SPORT_CHANNEL,
  fold,
  matchSides,
  pairKey,
  sidesOf,
  teamCanon,
  titleInfo
});
