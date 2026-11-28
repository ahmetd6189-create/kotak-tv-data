# Kotak TV maç defteri

`ledger.json`, spor kanallarındaki her maçın **ilk yayın saatini** tutar. Kotak TV bu dosyayla bir maç yayınının
**CANLI** mı yoksa **BANT** (tekrar) mı olduğunu gösterir. Kullanıcı uygulamayı günlerce açmasa da bilgi günceldir.

- Görev (`.github/workflows/ledger.yml`) her 3 saatte bir kendiliğinden çalışır.
- Kaynak yalnız herkese açık, ücretsiz yayın akışlarıdır (epgshare01). Anahtar, şifre ya da IPTV sağlayıcı verisi yoktur.
- Maç adı tanıma kuralı (`lib/match-key.cjs`) Kotak TV uygulamasından üretilir; elle düzenlenmez.

## Trend listesi (`trend.json`)

Son 7 günde Wikipedia'da (Türkçe ağırlıklı, İngilizce de) en çok bakılan **film ve dizi** sayfaları. Kotak TV "Trend Filmler /
Trend Diziler" satırlarını bu gerçek ilgiye göre sıralar; eski yapımlar yine trend sayılmaz.

- Kaynak: Wikimedia sayfa görüntülenme istatistikleri ve Wikidata — ikisi de **CC0** (kamu malı): ücretsiz, ticari kullanım serbest, anahtar yok.
- Görev (`.github/workflows/trend.yml`) günde bir çalışır (`build-trend.cjs`). Kullanıcı ya da katalog bilgisi gönderilmez;
  eşleştirme telefonda yapılır.
- Biçim: `films` / `series` → `{q: Wikidata kimliği, t: adlar, y: yıl, s: 7 günlük ağırlıklı görüntülenme}`.

## Maç defteri biçimi

Dosya biçimi: `first` → `"takim1|takim2": ilk yayın (ms, UTC)`; `since` → defterin kesintisiz izlemeye başladığı an.
