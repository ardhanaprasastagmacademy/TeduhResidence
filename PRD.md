# PRD: Website Hotel dengan Sistem Booking
Nama hotel: Teduh Residence Penulis: Ardhana Prasasta Versi: 1.0 (draf awal) Status: Draft Dokumen terkait: Project Brief: Website Hotel

1. Latar Belakang dan Masalah
Hotel membutuhkan website untuk memperkenalkan hotel dan kamar kepada calon tamu, sekaligus menerima permintaan booking secara online. Saat ini [isi kondisi saat ini, misalnya: booking hanya lewat telepon/WhatsApp langsung, sehingga pencatatan tidak rapi dan mudah terlewat].

Masalah yang diselesaikan:

Calon tamu sulit melihat kamar, harga, dan fasilitas secara lengkap.
Booking manual tidak tercatat terpusat sehingga rawan terlewat.
Admin butuh cara cepat untuk mengelola booking dan menghubungi tamu.
2. Tujuan dan Metrik Keberhasilan
Tujuan	Metrik	Target
Memudahkan tamu booking	Waktu menyelesaikan form booking	< 2 menit
Semua booking tercatat	Booking yang masuk dan tampil di panel admin	100%
Mempercepat respons admin	Langkah dari buka booking sampai WhatsApp terbuka	1 klik
Website nyaman dipakai	Waktu muat halaman utama	< 3 detik
Data tamu aman	Data booking bisa dibaca publik	0 (tidak bisa)
3. Pengguna
Calon tamu – Pengunjung umum yang ingin melihat kamar dan memesan, tanpa perlu membuat akun. Mayoritas kemungkinan mengakses dari HP.

Admin hotel – Staf yang mengelola booking dan data kamar. Login memakai akun admin. Jumlah admin: 1.

4. User Stories
Tamu

Sebagai tamu, saya ingin melihat daftar kamar beserta foto, harga, dan fasilitas agar bisa memilih kamar yang cocok.
Sebagai tamu, saya ingin klik tombol Booking di kamar yang saya pilih agar form terisi otomatis dengan kamar tersebut.
Sebagai tamu, saya ingin booking tanpa login agar prosesnya cepat.
Sebagai tamu, saya ingin tahu bahwa booking saya berhasil terkirim.
Sebagai tamu, saya ingin membaca artikel blog dan melihat foto hotel di galeri.
Admin

Sebagai admin, saya ingin login agar hanya saya yang bisa mengakses data booking.
Sebagai admin, saya ingin melihat semua booking masuk dan memfilternya berdasarkan status agar mudah menindaklanjuti.
Sebagai admin, saya ingin mengubah status booking agar catatan selalu terkini.
Sebagai admin, saya ingin membuka WhatsApp tamu dengan pesan yang sudah terisi agar tidak mengetik ulang.
Sebagai admin, saya ingin menambah, mengubah, dan menghapus data kamar agar informasi di website selalu benar.
5. Ruang Lingkup
Termasuk (versi 1.0)
6 halaman publik: Beranda, Tentang, Ruangan, Galeri, Blog (dengan halaman detail), Booking
Form booking tanpa login yang menyimpan data ke Firestore
Panel admin: login, kelola booking, kirim WhatsApp, kelola kamar
Tidak termasuk
Pembayaran online
Akun/login tamu
Pengiriman WhatsApp otomatis (WhatsApp Business API)
Pengelolaan blog dan galeri lewat panel admin (keduanya berupa konten statis di file HTML)
Pengecekan ketersediaan kamar otomatis (dicek manual oleh admin)
Multi-bahasa
6. Kebutuhan Fungsional
6.1 Website publik
ID	Kebutuhan	Prioritas
FR-01	Navbar berisi menu: Beranda, Tentang, Ruangan, Galeri, Blog, Booking; responsif dan tampil di semua halaman	Wajib
FR-02	Beranda: banner utama, sorotan kamar, fasilitas, ringkasan hotel, blog terbaru, tombol ajakan booking	Wajib
FR-03	Tentang: profil hotel, fasilitas, lokasi/peta, informasi kontak	Wajib
FR-04	Ruangan: menampilkan semua kamar dari Firestore dalam bentuk card (foto, nama, harga per malam, kapasitas, fasilitas singkat)	Wajib
FR-05	Setiap card kamar memiliki tombol Booking yang mengarah ke halaman Booking dengan kamar terpilih otomatis	Wajib
FR-06	Kamar dengan isAvailable = false tidak ditampilkan, atau tampil dengan label tidak tersedia dan tombol Booking dinonaktifkan	Wajib
FR-07	Galeri: kumpulan foto hotel dalam grid responsif (konten statis di HTML)	Wajib
FR-08	Blog: daftar artikel dalam bentuk card (foto, judul, tanggal, ringkasan) (konten statis di HTML)	Wajib
FR-09	Detail blog: judul, tanggal, isi artikel, 2 foto, dan sidebar (artikel terbaru dan kategori)	Wajib
6.2 Booking (tanpa login)
ID	Kebutuhan	Prioritas
FR-10	Form berisi: nama lengkap, nomor WhatsApp, email (opsional), tipe kamar, tanggal check-in, tanggal check-out, jumlah tamu, catatan (opsional)	Wajib
FR-11	Tipe kamar terisi otomatis jika tamu datang dari tombol Booking di card kamar, dan tetap bisa diganti	Wajib
FR-12	Validasi sisi klien: kolom wajib terisi, check-in tidak boleh sebelum hari ini, check-out harus setelah check-in, jumlah tamu tidak melebihi kapasitas kamar	Wajib
FR-13	Nomor WhatsApp dinormalisasi ke format internasional (contoh: 0812xxxx menjadi 62812xxxx) sebelum disimpan	Wajib
FR-14	Saat dikirim, data disimpan ke koleksi bookings dengan status = pending dan createdAt otomatis	Wajib
FR-15	Setelah berhasil, tamu melihat pesan sukses bahwa booking diterima dan akan dikonfirmasi lewat WhatsApp; form dikosongkan	Wajib
FR-16	Jika gagal, tamu melihat pesan error yang jelas dan data yang sudah diisi tidak hilang	Wajib
FR-17	Tombol kirim dinonaktifkan saat proses berjalan untuk mencegah kiriman ganda	Wajib
FR-18	Perlindungan spam (Firebase App Check atau reCAPTCHA)	Wajib
6.3 Panel admin
ID	Kebutuhan	Prioritas
FR-19	Login admin dengan Firebase Authentication (email dan password); halaman admin tidak bisa diakses tanpa login	Wajib
FR-20	Tombol logout	Wajib
FR-21	Daftar booking berisi: nama, nomor WhatsApp, kamar, check-in, check-out, jumlah tamu, status, waktu dibuat; urut dari terbaru	Wajib
FR-22	Filter daftar booking berdasarkan status; pencarian berdasarkan nama	Wajib
FR-23	Lihat detail booking (termasuk catatan tamu)	Wajib
FR-24	Ubah status booking: pending, confirmed, cancelled, completed	Wajib
FR-25	Tombol Kirim WhatsApp yang membuka https://wa.me/<nomor>?text=<pesan> dengan pesan sesuai status booking (lihat 6.4)	Wajib
FR-26	Kelola kamar: tambah, ubah, hapus, dan atur isAvailable; data langsung tampil di halaman Ruangan	Wajib
FR-27	Hapus booking dengan konfirmasi sebelum dihapus	Sebaiknya
FR-28	Penanda visual untuk booking berstatus pending yang belum ditangani	Sebaiknya
6.4 Templat pesan WhatsApp
Pesan terisi otomatis dan bisa diubah admin sebelum dikirim.

Dikonfirmasi

Halo {nama}, booking Anda di {nama hotel} telah dikonfirmasi. Kamar: {kamar}, check-in {tanggal}, check-out {tanggal}. Sampai jumpa!

Dibatalkan

Halo {nama}, mohon maaf booking Anda di {nama hotel} untuk kamar {kamar} tanggal {tanggal} tidak dapat kami proses. Silakan hubungi kami untuk pilihan tanggal atau kamar lain.

Pending / pengecekan

Halo {nama}, terima kasih telah booking di {nama hotel}. Kami sedang mengecek ketersediaan kamar {kamar} dan akan segera mengabari Anda.

Selesai

Halo {nama}, terima kasih telah menginap di {nama hotel}. Kami berharap Anda nyaman dan sampai jumpa kembali.

6.5 Alur status booking
pending ──► confirmed ──► completed
   │            │
   └────────────┴──► cancelled
7. Model Data (Firestore)
Collection rooms

Field	Tipe	Keterangan
name	string	Nama kamar
description	string	Deskripsi
pricePerNight	number	Harga per malam (Rupiah)
capacity	number	Kapasitas tamu
facilities	array	Daftar fasilitas
images	array	URL foto kamar
isAvailable	boolean	Tampil dan bisa dibooking
Collection bookings

Field	Tipe	Keterangan
guestName	string	Nama tamu
phone	string	Format 62xxxxxxxxxx
email	string	Opsional
roomId	string	ID dokumen kamar
roomName	string	Nama kamar (disimpan agar riwayat tetap utuh jika kamar diubah)
checkIn	timestamp	Tanggal check-in
checkOut	timestamp	Tanggal check-out
guests	number	Jumlah tamu
notes	string	Opsional
status	string	pending, confirmed, cancelled, completed
createdAt	timestamp	Waktu booking dibuat
8. Kebutuhan Non-Fungsional
Keamanan

rooms: publik boleh membaca; hanya admin yang boleh menulis.
bookings: publik hanya boleh membuat dokumen baru dengan status = pending dan field tervalidasi; membaca, mengubah, dan menghapus hanya untuk admin.
Aturan Firestore membatasi tipe dan panjang data, serta memastikan checkOut setelah checkIn.
Akses admin dibatasi ke akun yang terdaftar sebagai admin (custom claim atau daftar UID), bukan semua pengguna terautentikasi.
Tidak ada kunci rahasia di kode; konfigurasi Firebase publik dilindungi lewat aturan dan App Check.
Performa

Halaman utama termuat < 3 detik pada koneksi seluler normal.
Gambar dikompres dan berukuran wajar, memakai lazy loading.
Kompatibilitas dan tampilan

Responsif (mobile-first) memakai Bootstrap, diuji di layar HP, tablet, dan desktop.
Mendukung versi terbaru Chrome, Safari, Firefox, dan Edge.
Aksesibilitas dan SEO dasar

Teks alternatif pada gambar, kontras warna memadai, form memiliki label.
Judul halaman dan meta deskripsi unik di tiap halaman.
Keandalan

Penggunaan Firebase dipantau agar tidak melewati kuota paket.
9. Kriteria Penerimaan (Acceptance Criteria)
Booking

Diberikan tamu mengisi semua kolom wajib dengan benar, ketika menekan kirim, maka dokumen baru muncul di bookings dengan status pending dan tamu melihat pesan sukses.
Diberikan tanggal check-out sebelum atau sama dengan check-in, ketika tamu menekan kirim, maka form menolak dan menampilkan pesan kesalahan.
Diberikan nomor 08123456789, ketika disimpan, maka tersimpan sebagai 628123456789.
Diberikan pengunjung tanpa login, ketika mencoba membaca bookings lewat SDK atau REST, maka akses ditolak.
Admin

Diberikan admin belum login, ketika membuka halaman admin, maka diarahkan ke halaman login.
Diberikan booking pending, ketika admin mengubah status ke confirmed, maka status tersimpan dan tampil di daftar.
Diberikan booking dengan nomor tamu, ketika admin klik Kirim WhatsApp, maka WhatsApp terbuka dengan nomor tamu dan pesan sesuai status.
Diberikan admin menambah kamar baru, ketika disimpan, maka kamar langsung tampil di halaman Ruangan.
Halaman publik

Halaman Ruangan menampilkan semua kamar tersedia dalam bentuk card dengan tombol Booking yang mengarah ke form dengan kamar terpilih.
Setiap halaman detail blog menampilkan judul, isi, 2 foto, dan sidebar.
10. Rencana Rilis
Milestone	Cakupan	Perkiraan
M1 – Desain	Wireframe dan desain UI seluruh halaman	Minggu 1–2
M2 – Halaman publik	Beranda, Tentang, Galeri, Blog + detail, Ruangan (tampilan)	Minggu 2–3
M3 – Integrasi booking	Firestore, form booking, validasi, aturan keamanan	Minggu 4
M4 – Panel admin	Login, kelola booking, WhatsApp, kelola kamar	Minggu 5
M5 – Pengujian	Uji fungsi, keamanan, dan perangkat; perbaikan	Minggu 6
M6 – Peluncuran	Deploy, domain, pelatihan admin	Minggu 7
11. Asumsi dan Ketergantungan
Konten (foto, teks, harga, artikel) disediakan sebelum M2 selesai.
Admin memakai WhatsApp di HP atau WhatsApp Web untuk mengirim pesan.
Paket gratis Firebase (Spark) cukup untuk traffic awal.
Konfirmasi ketersediaan kamar dilakukan manual oleh admin.
12. Risiko
Risiko	Dampak	Mitigasi
Booking spam	Data kotor, admin kerepotan	App Check/reCAPTCHA, validasi, konfirmasi manual
Double booking	Tamu kecewa	Admin cek sebelum konfirmasi; pertimbangkan cek otomatis di versi berikutnya
Kebocoran data tamu	Masalah privasi	Aturan Firestore ketat, uji aturan sebelum rilis
Nomor WhatsApp salah	Tamu tidak terhubung	Normalisasi dan validasi format
Kuota Firebase habis	Website atau booking terganggu	Pantau penggunaan, optimalkan query dan gambar
13. Pertanyaan Terbuka
Apakah admin perlu notifikasi saat ada booking baru (misalnya email atau WhatsApp), atau cukup membuka panel admin?
Foto kamar disimpan di mana: Firebase Storage atau file statis di folder website?
Berapa banyak akun admin yang dibutuhkan?
Apakah perlu cek ketersediaan kamar otomatis di versi berikutnya?
Apakah harga ditampilkan di website, atau hanya "hubungi kami"?
Apakah perlu menampilkan syarat dan ketentuan atau kebijakan pembatalan di form booking?