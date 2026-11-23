# Kotak TV maç defteri

`ledger.json`, spor kanallarındaki her maçın **ilk yayın saatini** tutar. Kotak TV bu dosyayla bir maç yayınının
**CANLI** mı yoksa **BANT** (tekrar) mı olduğunu gösterir. Kullanıcı uygulamayı günlerce açmasa da bilgi günceldir.

- Görev (`.github/workflows/ledger.yml`) her 3 saatte bir kendiliğinden çalışır.
- Kaynak yalnız herkese açık, ücretsiz yayın akışlarıdır (epgshare01). Anahtar, şifre ya da IPTV sağlayıcı verisi yoktur.
- Maç adı tanıma kuralı (`lib/match-key.cjs`) Kotak TV uygulamasından üretilir; elle düzenlenmez.

Dosya biçimi: `first` → `"takim1|takim2": ilk yayın (ms, UTC)`; `since` → defterin kesintisiz izlemeye başladığı an.
