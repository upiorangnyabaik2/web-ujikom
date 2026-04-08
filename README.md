# FoodOnline

Express + MongoDB backend untuk aplikasi pemesanan makanan.

## Ringkasan

- Backend utama: `backend/server.js`
- API untuk: autentikasi, menu, order, checkout, Xendit integration
- Admin dapat mengelola menu dengan CRUD
- Checkout mendukung invoice Xendit dan webhook pembayaran

## Frontend

Frontend adalah aplikasi web statis yang disajikan oleh backend Express. File frontend terletak di `backend/public/` dan mencakup halaman-halaman seperti login, register, menu, checkout, dan dashboard admin.

## Instalasi

1. Clone repository
2. Jalankan:
   ```bash
   npm install
   ```
3. Salin file environment:
   ```bash
   copy .env.example .env
   ```
4. Isi variabel lingkungan di `.env`

## Menjalankan

- `npm run dev` — jalankan server dengan `nodemon`
- `npm start` — jalankan server dengan `node`
- `npm run seed` — seed data awal jika tersedia

Setelah server berjalan, akses aplikasi di `http://localhost:5000` untuk frontend, dan API di `http://localhost:5000/api/*`.

## Struktur Proyek

- `backend/`
  - `server.js` — entry point server utama
  - `src/` — kode sumber Express modern
  - `legacy/` — versi lama dan middleware cadangan
  - `public/` — aset front-end statis
  - `scripts/seed.js` — script seed data
- `image/` — folder gambar tambahan
- `.env` / `.env.example` — konfigurasi environment

## Dependensi Utama

- `express`
- `mongoose`
- `jsonwebtoken`
- `bcryptjs`
- `cors`
- `dotenv`
- `multer`
- `axios`

## Dependensi Development

- `nodemon`

## Environment Variables

Contoh variabel yang diperlukan:

- `MONGO_URI`
- `JWT_SECRET`
- `XENDIT_SECRET_KEY`
- `XENDIT_PUBLIC_KEY`
- `CLIENT_URL`

## Skrip Penting

- `npm run dev`
- `npm start`
- `npm run seed`

## API Utama

### Autentikasi
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Menu
- `GET /api/menu`
- `GET /api/menu/:id`
- `POST /api/menu` (admin saja)
- `PUT /api/menu/:id` (admin saja)
- `DELETE /api/menu/:id` (admin saja)

### Order
- `POST /api/order`
- `GET /api/order/me`
- `GET /api/order/:orderId`
- `PUT /api/order/:orderId`
- `GET /api/order` (admin saja)
- `DELETE /api/order/:orderId` (admin saja)

### Checkout / Xendit
- `POST /api/checkout/create`
- `GET /api/checkout/invoice/:invoiceId`
- `GET /api/checkout/order/:orderId`
- `POST /api/checkout/webhook/xendit`

## Testing

Untuk testing pembayaran secara lokal, gunakan endpoint mock:
- `GET /mock-payment?orderId=<orderId>&status=success` — simulasi pembayaran berhasil
- `GET /mock-payment?orderId=<orderId>&status=failed` — simulasi pembayaran gagal

## Fitur Utama

- menu management CRUD
- autentikasi JWT
- checkout dengan gateway Xendit
- webhook pembayaran
- order history dan order status

- Akun : Admin: admin@local
            pw: admin123
         User : smkbpibdg@gmail.com
            pw: bpi123