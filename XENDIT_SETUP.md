# Setup Xendit API Key - FoodOnline

## ❌ Error: INVALID_API_KEY

Jika Anda melihat error ini:
```
The API key provided is invalid. Please make sure to use the secret/public API key 
that you can obtain from the Xendit Dashboard
```

**Ini normal!** Ada 2 solusi:

---

## 📋 Opsi 1: Development Mode (Testing Tanpa API Key) ✅ **RECOMMENDED**

Saat ini aplikasi sudah dikonfigurasi untuk **mode testing/mock payment** jika Xendit API key tidak valid.

### Yang Sudah Siap:
- ✅ Checkout tanpa error, bahkan tanpa API key valid
- ✅ Mock payment page untuk testing
- ✅ Order dibuat di database
- ✅ Redirect ke success/failed page

### Cara Menggunakan:
1. **Biarkan `.env` seperti sekarang** (dengan `xxx` placeholder)
2. **Ketika checkout Xendit:**
   - Link mock payment akan terbuka
   - Auto-redirect ke success page
   - Order tercatat di database sebagai "Pending"
3. **Untuk transfer manual & COD:**
   - Langsung buat order & tampilkan success page
   - Tidak butuh Xendit key

**Keuntungan:**
- Bisa test seluruh flow checkout
- Tidak perlu API key Xendit
- Cepat development

---

## 🔑 Opsi 2: Production Mode (Real Xendit Payment)

Jika ingin menggunakan pembayaran REAL dari Xendit:

### Step 1: Daftar/Login ke Xendit Dashboard
1. Buka: https://dashboard.xendit.co/
2. Login atau buat akun baru
3. Pilih **Developers** → **API Keys**

### Step 2: Dapatkan API Keys
- **Secret API Key**: `xnd_development_...` (untuk development) atau `xnd_live_...` (untuk production)
- **Public API Key**: `xnd_public_...`

⚠️ **PENTING:**
- Gunakan **development key** dulu untuk testing
- Jangan commit key ke git (sudah di `.gitignore`)
- Simpan dengan aman!

### Step 3: Update `.env` File

Edit file `.env` di root project:

```env
MONGODB_URI=mongodb://localhost:27017/foodonline
PORT=5000
JWT_SECRET=your_jwt_secret_key_here

# Xendit Configuration - UPDATE THESE
XENDIT_SECRET_KEY=xnd_development_XXXXXXXXXXXXX   # ← Ganti ini
XENDIT_PUBLIC_KEY=xnd_public_development_XXXXX   # ← Dan ini

CLIENT_URL=http://localhost:5000
```

### Step 4: Restart Server

```bash
# Hentikan server (Ctrl+C)
# Jalankan ulang:
node backend/server.js
```

### Step 5: Test Payment

1. Login ke aplikasi
2. Pilih menu → Add to cart → Checkout
3. Pilih "Xendit" sebagai payment method
4. Klik checkout
5. **Akan redirect ke halaman pembayaran Xendit**
6. Test dengan card: `4011111111111111` (test card)

---

## 🧪 Testing Card Details (Development Mode)

Untuk test payment di Xendit development environment:

| Field | Value |
|-------|-------|
| Card Number | `4011 1111 1111 1111` |
| Expiry | `12/25` (atau masa depan) |
| CVC | `123` |

---

## 📝 Catatan Penting

### Development vs Production

**Development Mode** (sekarang):
- ✅ Mock payment bekerja tanpa API key
- ✅ Order tetap tercatat di DB
- ✅ Cocok untuk demo/testing
- ❌ Pembayaran tidak real

**Production Mode** (dengan API key):
- ✅ Pembayaran langsung ke rekening real
- ✅ Webhook untuk notifikasi pembayaran
- ✅ Full integration Xendit
- ❌ Butuh API key valid

### Bagaimana Sistem Bekerja?

```
1. User click "Checkout" di Xendit payment
   ↓
2. Backend check XENDIT_SECRET_KEY di .env
   ↓
3. Jika ada "xxx" atau invalid → USE MOCK MODE
   ↓
4. Generate mock invoice URL
   ↓
5. Frontend redirect ke mock URL
   ↓
6. Auto-redirect ke order-success page
   ↓
7. Order tercatat di database
```

---

## ✅ Checklist Setup

- [ ] `.env` file sudah ada (di root project)
- [ ] `XENDIT_SECRET_KEY` dikonfigurasi (atau biarkan `xxx` untuk test)
- [ ] Server running di `http://localhost:5000`
- [ ] Database MongoDB connected
- [ ] Bisa login/register
- [ ] Checkout bekerja (mock atau real)

---

## 🚨 Troubleshooting

### "INVALID_API_KEY" Error
**Solusi:** Ini normal! Berarti:
1. API key placeholder (`xxx`) masih ada
2. Gunakan mock payment mode untuk testing ✅ (Sekarang sudah aktif)
3. Atau update dengan real API key dari Xendit

### Checkout tidak berfungsi
**Solusi:**
1. Pastikan MongoDB connected
2. Check console log di server
3. Jika ada error, berarti API key issue (tapi mock mode harus tetap bekerja)

### "Order not found" saat redirect success
**Solusi:**
1. Pastikan MongoDB connected
2. Order harus tercatat di DB saat checkout
3. Check console log di server

---

## 📚 Resources

- Xendit Docs: https://developers.xendit.co/
- API Reference: https://developers.xendit.co/api-reference/
- Test Cards: https://developers.xendit.co/docs/testing/
- Dashboard: https://dashboard.xendit.co/

---

## 💡 Tips

**Untuk Development:**
- Gunakan mock payment mode (✅ **Saat ini sudah aktif**)
- Focus pada UI/UX
- Test semua flow checkout tanpa API key

**Untuk Testing Real Payment:**
- Dapatkan development API key dari Xendit
- Update `.env` dengan key baru
- Test dengan test card: `4011111111111111`

**Untuk Production:**
- Gunakan live API key (bukan development)
- Setup webhook untuk auto-confirmation
- Enable 2FA di Xendit Dashboard
- Regular backup database


### Di Mode Development (Sandbox):

Gunakan test card berikut untuk payment testing:

**Success Payment:**
- Card Number: `4011111111111111`
- Expiry: Bulan/Tahun apapun di masa depan (misal: 12/25)
- CVV: Angka apapun (misal: 123)

**Failed Payment:**
- Card Number: `5555555555554444`
- Expiry: Bulan/Tahun apapun di masa depan
- CVV: Angka apapun

**Pending Payment:**
- Card Number: `4111111111111111`
- Expiry: Bulan/Tahun apapun di masa depan
- CVV: Angka apapun

### Test Flow:

1. Login ke aplikasi
2. Tambah item ke cart
3. Klik "Checkout"
4. Isi form data pengiriman
5. Klik "Lanjutkan ke Pembayaran"
6. Gunakan card virtual di atas untuk test

## Troubleshooting

### Error: "API key provided is invalid"

**Solusi:**
- Pastikan XENDIT_SECRET_KEY benar di `.env` file
- Cek bahwa key dimulai dengan `xnd_development_` (untuk sandbox) atau `xnd_` (untuk production)
- Copy ulang key dari Xendit Dashboard (jangan ada spasi/karakter ekstra)
- Restart server setelah ubah `.env`

### Error: "Unauthorized"

**Solusi:**
- Pastikan format Authorization header benar: `Authorization: Basic [base64(secret_key:)]`
- Secret key harus di-encode ke base64 dengan format `key:` (ada colon)

### Invoice tidak muncul

**Solusi:**
- Cek console server untuk error message
- Pastikan total amount adalah integer (bukan float)
- Minimal amount adalah IDR 10.000

### Webhook tidak diterima

**Solusi:**
1. Di Xendit Dashboard, buka **"Settings" → "Webhooks"**
2. Tambah URL webhook: `http://yourdomain.com/api/checkout/webhook/xendit`
3. Untuk local testing, gunakan ngrok:
   ```bash
   ngrok http 3000
   ```
   Kemudian set webhook URL ke: `https://xxxxx.ngrok.io/api/checkout/webhook/xendit`

## Mode Production

Setelah testing berhasil, untuk production:

1. Change `.env`:
```env
XENDIT_SECRET_KEY=xnd_xxxxxxxxxxxxxxxxxxxxx (production key)
XENDIT_PUBLIC_KEY=xnd_public_xxxxxxxxxxxxxxxxxxxxx
CLIENT_URL=https://yourdomain.com
```

2. Switch card payment method ke production di frontend
3. Deploy ke server

## Dokumentasi Resmi

- Xendit Docs: https://docs.xendit.co/
- API Reference: https://docs.xendit.co/api-reference/
- Invoice API: https://docs.xendit.co/api-reference/#create-invoice
- Webhook: https://docs.xendit.co/api-reference/#invoice-webhook

---

**Need Help?**
- Xendit Support: https://xendit.co/support
- Live Chat: Available di Xendit Dashboard
