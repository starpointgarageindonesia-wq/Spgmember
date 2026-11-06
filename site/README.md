# Website Cireng Indi — versi 2

Website statis responsif untuk cirengindi.com (tanpa VPS/cPanel). Halaman katalog dan checkout lewat WhatsApp — tidak ada penagihan pembayaran langsung atau penyimpanan data pelanggan di server.

## Isi
- index.html — landing page, cerita brand, kategori, paket, kontak, SEO.
- styles.css — tampilan desktop dan mobile.
- app.js — 31 produk, filter, pencarian, pilihan varian, keranjang yang tersimpan lokal, checkout ke WhatsApp.
- _headers, robots.txt, sitemap.xml — keamanan dasar dan SEO.

## Foto asli
Gambar menggunakan aset WebP dan PNG resmi dari repository publik Cirengindiapp:
https://github.com/rizkyhidayat8999-netizen/Cirengindiapp/tree/main/apps/member/app/src/main/assets/assets

Perhatian: foto saat ini dimuat dari raw.githubusercontent.com. Agar seluruh aset mandiri dan tidak bergantung pada repository lain, salin logo_cireng_indi.png, official_01.webp–official_31.webp, dan empat banner ke direktori site/assets, lalu ubah BASE_IMAGE di app.js dan URL absolut di index.html.

## Publikasi Cloudflare Pages
1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
2. Pilih repository: starpointgarageindonesia-wq/cirengindi.
3. Production branch: cirengindi-website-v2.
4. Framework preset: None; build command: kosong; build output directory: site.
5. Deploy. Tambahkan custom domain cirengindi.com, ikuti instruksi DNS Cloudflare. www.cirengindi.com opsional; jika diaktifkan, arahkan ke domain utama.

Repository tersebut punya branch utama berisi wrapper Android Starpoint Garage. Jangan mengganti atau menghapus branch main; website disimpan di branch terpisah agar proyek lain tetap utuh.

## Sumber data dan batasan
Produk/harga diperoleh dari HTML website lama pada rizhidayatullah5758-art/Cirengindi. Ada 31 gambar produk yang dipetakan dari source website ke aset aplikasi. Harga adalah harga yang tertulis di website lama, **bukan** harga atau stok realtime. Pelanggan dikirim ke WhatsApp untuk konfirmasi.

Tidak memakai server, database, atau kredensial rahasia. Keranjang disimpan di localStorage pengunjung, tidak dikirim ke sistem eksternal sebelum pelanggan memilih checkout WhatsApp. Produk dengan keterangan "mulai dari" hanya dihitung dengan harga awal sebagai estimasi.

## Uji
- Buka index.html via web server statis.
- Cari "cireng" → hasil terfilter.
- Pilih kategori → item berubah tanpa refresh.
- Pada Cireng Original, ubah varian → harga berubah.
- Klik +, ubah qty, hapus → subtotal ikut berubah.
- Checkout → membuka WhatsApp dengan ringkasan produk dan catatan.
- Uji 320px, 390px, tablet, dan desktop.

## Pembaruan
Ubah harga atau detail katalog di app.js -> PRODUCTS. Jangan mengubah harga tanpa konfirmasi dari pemilik usaha. Jika perlu integrasi status stok/live order, evaluasi sistem Member/Supabase dengan autentikasi dan keamanan yang memadai terlebih dahulu.
