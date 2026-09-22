# DESIGN.md: Website Hotel
Arah visual: hangat, tenang, dan elegan. Dominan teal dan cream, dengan banyak ruang kosong, huruf Poppins yang bersih, dan foto yang bercerita. Terasa seperti boutique hotel, bukan template. Stack: HTML, CSS, Bootstrap 5.3, JavaScript Dokumen terkait: PRD dan Project Brief Website Hotel

## 1. Prinsip Desain
Tenang dulu, indah kemudian. Ruang kosong yang lega lebih mewah daripada dekorasi.
Foto adalah bintangnya. Layout memberi ruang besar untuk foto; teks mendukung, tidak berebut.
Hangat, bukan dingin. Cream memberi kehangatan pada teal yang tegas. Hindari putih murni dan hitam murni.
Tidak simetris kaku. Variasikan rasio foto, geser posisi, dan tumpuk sedikit elemen agar terasa disusun manusia.
Satu aksi jelas per layar. Tombol Booking selalu mudah ditemukan, tidak berteriak.
Sederhana itu disiplin. Sedikit warna, satu font (Poppins), satu gaya ikon.
2. Warna
2.1 Palet utama
Token	Hex	Pemakaian
--cream-50	#FBF8F1	Latar kartu, form, navbar saat scroll
--cream-100	#F7F1E5	Latar utama halaman
--cream-200	#EFE6D3	Seksi selang-seling, latar input, badge netral
--cream-300	#E3D6BC	Garis pembatas, border halus
--teal-50	#E6F1EF	Latar informasi/hover lembut
--teal-100	#CFE4E0	Badge, highlight ringan
--teal-300	#7FB5AE	Dekorasi, ikon di latar gelap
--teal-500	#2E8B85	Focus ring, aksen interaktif
--teal-700	#1F6F6B	Warna utama: tombol, link, judul kecil
--teal-800	#175552	Hover tombol
--teal-900	#0E3B3A	Footer, seksi gelap, judul besar
--ink	#1B2B2A	Teks utama (bukan hitam murni)
--ink-muted	#5A6B69	Teks sekunder, keterangan
--brass	#B08D57	Aksen dekoratif saja: garis tipis, ornamen kecil
2.2 Proporsi pemakaian
±60% cream (latar dan ruang kosong)
±30% teal (tombol, teks judul, seksi gelap, footer)
±10% aksen (brass, foto, status)
Seksi gelap (--teal-900) dipakai maksimal 2 kali di satu halaman: satu band ajakan booking dan footer.

2.3 Warna status (panel admin)
Status	Teks	Latar
Pending	#8A5A12	#F6E7C8
Dikonfirmasi	#175552	#CFE4E0
Dibatalkan	#9A3B30	#F2D9D4
Selesai	#4A5A58	#E3E8E6
2.4 Kontras (WCAG)
--ink di atas --cream-100: sangat tinggi, aman untuk semua teks.
--teal-700 di atas --cream-100: sekitar 5,3:1 (lulus AA untuk teks biasa).
--cream-50 di atas --teal-700 atau --teal-900: lulus AA.
--ink-muted di atas --cream-100: sekitar 5:1 (lulus AA).
--brass tidak dipakai sebagai warna teks di atas cream karena kontrasnya rendah.
3. Tipografi
Peran	Font	Catatan
Judul (display)	Poppins	Weight 500, jarak huruf sedikit dirapatkan pada ukuran besar. Hindari 700 ke atas agar tetap elegan.
Isi / UI	Poppins	Weight 400 (isi) dan 300 (paragraf pengantar besar). Weight 500 untuk label dan tombol.
Satu font untuk semuanya. Hierarki dibentuk lewat ukuran, weight, dan jarak, bukan lewat pergantian font.

Fallback: system-ui, -apple-system, "Segoe UI", sans-serif.

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
Skala teks
Elemen	Ukuran (responsif)	Font	Weight	Line-height
Hero (h1)	clamp(2.4rem, 5.5vw, 4rem), jarak huruf -0.02em	Poppins	500	1.15
Judul seksi (h2)	clamp(1.85rem, 3.6vw, 2.6rem), jarak huruf -0.015em	Poppins	500	1.2
Sub-judul (h3)	1.4rem	Poppins	500	1.3
Judul kartu (h4)	1.15rem	Poppins	500	1.35
Isi	1rem (16px)	Poppins	400	1.75
Isi besar (intro)	1.125rem	Poppins	300	1.8
Keterangan	0.875rem	Poppins	400	1.55
Label kecil (eyebrow)	0.75rem, huruf kapital, jarak huruf 0.12em	Poppins	500	1.4
Aturan:

Lebar baris teks maksimal 65–72 karakter (artikel blog: max-width: 720px).
Eyebrow (label kecil di atas judul) berwarna --teal-700, dipakai hemat.
Judul rata kiri secara default. Rata tengah hanya untuk seksi ajakan pendek.
Boleh satu kata dalam judul diberi warna --teal-700 sebagai sentuhan personal.
Poppins cukup lebar, jadi beri line-height lebih longgar pada isi (1.75) dan hindari paragraf terlalu panjang.
4. Bentuk, Jarak, dan Bayangan
Spasi (kelipatan 4px): 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128

Jarak antar seksi: 96px desktop, 64px mobile.
Jarak dalam kartu: 20–24px.
Container maksimal 1200px, padding samping 24px (mobile) hingga 48px (desktop).
Radius

Token	Nilai	Pemakaian
--radius-sm	8px	Badge, tag kecil
--radius-md	12px	Input, dropdown
--radius-lg	20px	Kartu, foto
--radius-pill	999px	Tombol
Bentuk khas: lengkung (arch). Beberapa foto penting (hero, tentang) dipotong dengan bagian atas melengkung penuh. Ini menjadi ciri khas hotel dan dipakai hemat (maksimal 2 foto per halaman).

Bayangan. Sangat lembut dan bernuansa teal, hanya untuk elemen yang melayang (navbar saat scroll, kartu saat hover): 0 10px 30px -12px rgba(14, 59, 58, 0.18) Kartu diam memakai border tipis --cream-300, bukan bayangan.

5. Komponen
5.1 Navbar
Di atas hero: transparan, teks krem. Setelah scroll: latar --cream-50 dengan bayangan lembut.
Logo: nama hotel dengan Poppins weight 500, bukan gambar berat.
Menu: Beranda, Tentang, Ruangan, Galeri, Blog, Booking. Menu aktif diberi garis bawah tipis 1.5px --teal-700.
Tombol Booking di navbar berbentuk pill (isi teal) supaya menonjol.
Mobile: hamburger, menu terbuka sebagai panel penuh berlatar --cream-50, tautan berukuran besar (Poppins 500, 1.5rem).
5.2 Tombol
Jenis	Tampilan	Pemakaian
Primer	Isi --teal-700, teks --cream-50, pill	Booking, Kirim
Sekunder	Outline --teal-700 1.5px, teks teal, pill	Lihat detail, aksi kedua
Tautan	Teks teal + panah tipis →, garis bawah muncul saat hover	"Baca selengkapnya"
Di latar gelap	Isi --cream-100, teks --teal-900	Band ajakan
Padding 0.7rem 1.5rem, weight 500. Hover: warna menggelap ke --teal-800, tanpa efek loncat atau glow. Tombol nonaktif: opacity 0.5, kursor not-allowed.

5.3 Kartu kamar (halaman Ruangan)
Foto rasio 4:3 dengan radius 20px, di atas kartu berlatar --cream-50 dan border --cream-300.
Label harga kecil di pojok foto: "Rp 450.000 / malam" (latar --cream-50, teks --ink, radius pill).
Nama kamar (Poppins 500, 1.15rem), lalu 3 fasilitas utama sebagai teks kecil dipisah titik tengah (contoh: AC · Wi-Fi · Sarapan), tanpa ikon berlingkar.
Kapasitas ditulis biasa: "2 tamu".
Tombol Booking (primer) dan tautan "Detail".
Hover: foto zoom sangat halus (scale(1.03), 500ms), kartu tidak terangkat.
5.4 Kartu blog dan halaman detail blog
Kartu: foto 3:2, tanggal dan kategori sebagai eyebrow, judul Poppins 500, ringkasan 2 baris, tautan "Baca".

Detail blog:

Judul besar (h1 Poppins 500), tanggal dan kategori di atasnya.
Foto 1: lebar penuh container, rasio 16:9, tepat di bawah judul.
Isi artikel di kolom kiri (max-width: 720px), foto 2 disisipkan di tengah isi dengan keterangan kecil.
Sidebar kanan (lebar ±320px, position: sticky): Artikel terbaru (thumbnail kecil + judul), Kategori (daftar teks sederhana), dan kartu kecil ajakan booking.
Mobile: sidebar pindah ke bawah artikel.
5.5 Form booking
Label di atas input, ukuran 0.875rem, weight 500.
Input: latar --cream-50, border 1px --cream-300, radius 12px, tinggi 48px.
Fokus: border --teal-500 dan cincin 3px rgba(46,139,133,.2).
Error: border dan teks #9A3B30, pesan singkat di bawah input, tanpa ikon berlebihan.
Susunan desktop: form di kiri (2 kolom untuk tanggal), ringkasan kamar terpilih di kanan (sticky): foto kecil, nama, harga. Mobile: ringkasan di atas form.
Pesan sukses: kartu --teal-50 dengan garis kiri teal, bahasa hangat dan singkat.
Tombol kirim menampilkan status "Mengirim…" dan nonaktif saat proses.
5.6 Galeri
Tata letak masonry (CSS columns: 1 kolom mobile, 2 tablet, 3 desktop) dengan rasio foto bervariasi.
Jarak antar foto 16px, radius 16px.
Klik foto membuka tampilan besar (lightbox sederhana, latar --teal-900 92%).
5.7 Footer
Latar --teal-900, teks --cream-100, tautan --teal-300 yang menjadi krem saat hover.
Tiga blok: nama hotel + kalimat singkat, tautan cepat, kontak dan jam layanan.
Garis pemisah tipis --brass di atas baris hak cipta.
5.8 Panel admin
Lebih fungsional dan padat, tetap memakai palet dan font yang sama.

Latar --cream-100, konten dalam kartu --cream-50.
Tabel booking: header huruf kapital kecil --ink-muted, baris dipisah garis --cream-300, hover baris --teal-50.
Badge status memakai warna di 2.3 (radius pill, teks 0.75rem, weight 500).
Tombol Kirim WhatsApp: gaya sekunder (outline teal) dengan ikon WhatsApp kecil. Tidak memakai hijau WhatsApp agar palet tetap konsisten.
Ubah status lewat dropdown sederhana atau tombol aksi kecil.
Baris berstatus pending diberi penanda titik teal kecil di sisi kiri.
6. Tata Letak per Halaman
Beranda

Hero dibagi dua kolom. Kiri: eyebrow, judul besar Poppins (satu kata berwarna teal), kalimat pendek, tombol Booking + tautan "Lihat kamar". Kanan: foto berbentuk lengkung dengan foto kecil kedua yang menumpuk sedikit di pojok.
Kamar pilihan: 3 kartu, judul seksi rata kiri dengan tautan "Lihat semua kamar" di kanan.
Tentang singkat: foto besar bergeser ke kiri, teks di kanan, dengan satu angka atau fakta menonjol (contoh: "Sejak 2015").
Fasilitas: daftar bergaya tipografi (dua kolom teks dengan garis pemisah tipis), bukan grid ikon berlingkar.
Blog terbaru: 3 kartu.
Band ajakan booking: latar --teal-900, satu kalimat, satu tombol.
Tentang: cerita hotel dengan foto bervariasi, nilai-nilai dalam 3 kalimat pendek, peta lokasi, kontak.

Ruangan: judul + kalimat pengantar, grid kartu 3 kolom (desktop), 2 (tablet), 1 (mobile).

Galeri: judul singkat, lalu masonry.

Blog: kartu pertama berukuran besar (artikel utama), sisanya grid 3 kolom.

Booking: form + ringkasan kamar (5.5).

7. Foto dan Ikon
Foto

Cahaya alami, tone hangat, konsisten dari satu fotografer atau satu gaya olah warna.
Utamakan foto asli hotel. Bila memakai stok, pilih yang tidak terlihat "stok" (tanpa model berpose, tanpa senyum kaku).
Kompres ke WebP, lebar maksimal 1600px, loading="lazy" kecuali hero, dan selalu beri teks alt yang deskriptif.
Bila foto terlalu terang atau dingin, beri lapisan hangat halus saat diolah, bukan lewat CSS filter.
Ikon

Satu set garis tipis (Bootstrap Icons atau Lucide), stroke ±1.5px, warna mengikuti teks.
Dipakai fungsional (WhatsApp, panah, hamburger, tutup), bukan hiasan.
Emoji tidak dipakai sebagai ikon.
8. Gerak (Motion)
Muncul halus saat scroll: naik 16px + fade, durasi 500–600ms, cubic-bezier(.2,.7,.2,1), sekali saja.
Hover: perubahan warna 200ms, zoom foto 500ms.
Tidak ada parallax berat, animasi berputar, atau elemen yang bergerak terus-menerus.
Hormati preferensi pengguna:
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
9. Nada Bahasa
Singkat, hangat, dan tenang. Tulis seperti pemilik hotel berbicara kepada tamu.

Hindari	Gunakan
"Selamat datang di website kami"	"Tempat singgah yang tenang di [kota]."
"Nikmati pengalaman menginap mewah tak terlupakan"	"Kamar yang bersih, tenang, dan sarapan yang enak."
"Submit"	"Kirim permintaan booking"
"Terjadi kesalahan sistem"	"Booking belum terkirim. Coba lagi sebentar ya."
"Booking berhasil disubmit!"	"Terima kasih. Kami akan mengabari lewat WhatsApp."
10. Yang Harus Dihindari (Checklist Anti-Generik)
 Gradasi ungu, biru neon, atau gradasi teks
 Kartu kaca (glassmorphism) di mana-mana
 Grid 3 kolom berisi ikon di dalam lingkaran berwarna
 Semua teks dan seksi rata tengah
 Kalimat klise dan kosong, serta teks lorem ipsum di versi rilis
 Sisa warna biru bawaan Bootstrap (#0d6efd), putih #fff, atau hitam #000
 Bayangan berlapis, glow, atau efek kartu naik di semua elemen
 Emoji sebagai ikon atau dekorasi
 Lebih dari satu font atau lebih dari satu gaya ikon
 Foto stok yang jelas terlihat stok dan tidak sesuai hotel
11. Implementasi di Bootstrap 5.3
Tambahkan file css/custom.css setelah Bootstrap dan timpa variabelnya.

:root {
  /* Warna */
  --cream-50:#FBF8F1; --cream-100:#F7F1E5; --cream-200:#EFE6D3; --cream-300:#E3D6BC;
  --teal-50:#E6F1EF; --teal-100:#CFE4E0; --teal-300:#7FB5AE; --teal-500:#2E8B85;
  --teal-700:#1F6F6B; --teal-800:#175552; --teal-900:#0E3B3A;
  --ink:#1B2B2A; --ink-muted:#5A6B69; --brass:#B08D57;

  /* Tipografi */
  --font-display:"Poppins", system-ui, sans-serif;
  --font-body:"Poppins", system-ui, sans-serif;

  /* Bentuk */
  --radius-md:12px; --radius-lg:20px; --radius-pill:999px;
  --shadow-soft:0 10px 30px -12px rgba(14,59,58,.18);
  --ease:cubic-bezier(.2,.7,.2,1);

  /* Timpa variabel Bootstrap */
  --bs-body-bg:var(--cream-100);
  --bs-body-color:var(--ink);
  --bs-body-font-family:var(--font-body);
  --bs-body-line-height:1.75;
  --bs-primary:#1F6F6B; --bs-primary-rgb:31,111,107;
  --bs-link-color:var(--teal-700);
  --bs-link-hover-color:var(--teal-800);
  --bs-border-color:var(--cream-300);
}

h1, h2, h3, h4 { font-family:var(--font-display); font-weight:500; color:var(--teal-900);
                 letter-spacing:-0.015em; line-height:1.2; }
.lead { font-weight:300; font-size:1.125rem; line-height:1.8; }

.btn { --bs-btn-border-radius:var(--radius-pill); --bs-btn-padding-x:1.5rem;
       --bs-btn-padding-y:.7rem; font-weight:500; transition:background-color .2s var(--ease); }
.btn-primary { --bs-btn-bg:var(--teal-700); --bs-btn-border-color:var(--teal-700);
  --bs-btn-color:var(--cream-50); --bs-btn-hover-bg:var(--teal-800);
  --bs-btn-hover-border-color:var(--teal-800); --bs-btn-hover-color:var(--cream-50);
  --bs-btn-active-bg:var(--teal-900); --bs-btn-active-border-color:var(--teal-900); }
.btn-outline-primary { --bs-btn-color:var(--teal-700); --bs-btn-border-color:var(--teal-700);
  --bs-btn-hover-bg:var(--teal-700); --bs-btn-hover-color:var(--cream-50); }

.form-control, .form-select { background:var(--cream-50); border-color:var(--cream-300);
  border-radius:var(--radius-md); min-height:48px; }
.form-control:focus, .form-select:focus { border-color:var(--teal-500);
  box-shadow:0 0 0 3px rgba(46,139,133,.2); }

.card { background:var(--cream-50); border:1px solid var(--cream-300);
  border-radius:var(--radius-lg); overflow:hidden; }

.eyebrow { font-size:.75rem; font-weight:500; letter-spacing:.12em;
  text-transform:uppercase; color:var(--teal-700); }
.img-arch { border-radius:999px 999px var(--radius-lg) var(--radius-lg); overflow:hidden; }
.section { padding-block:clamp(4rem, 8vw, 6rem); }
.section-dark { background:var(--teal-900); color:var(--cream-100); }
.section-dark h2 { color:var(--cream-50); }
Struktur file yang disarankan

/css/bootstrap.min.css
/css/custom.css        ← token + komponen di atas
/js/main.js            ← animasi scroll, navbar, lightbox
/img/                  ← foto WebP
12. Checklist Sebelum Rilis
 Tidak ada warna biru bawaan Bootstrap yang tersisa
 Semua teks lulus kontras AA di atas latar cream dan teal
 Hanya Poppins yang dimuat (weight 300, 400, 500, 600), dengan display=swap
 Foto berformat WebP, terkompres, dan memiliki alt
 Tampilan diuji di lebar 360px, 768px, 1024px, dan 1440px
 Fokus keyboard terlihat pada semua tautan, tombol, dan input
 Animasi mati saat prefers-reduced-motion aktif
 Teks sudah dibaca ulang dan bebas kalimat klise
## 