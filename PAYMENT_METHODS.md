# Metode Pembayaran FoodOnline

Aplikasi FoodOnline sekarang mendukung 3 metode pembayaran yang berbeda:

## 1. Xendit (Online Payment Gateway)

### Deskripsi
- Pembayaran online menggunakan Xendit
- Mendukung berbagai metode: Kartu Kredit, Transfer Bank, OVO, DANA, LinkAja
- Real-time payment confirmation
- Rekomendasi: Untuk pelanggan yang ingin pembayaran instan

### Sub-Metode Pembayaran:
- 💳 **Kartu Kredit** - Visa, Mastercard
- 🏦 **Transfer Bank** - Semua bank Indonesia
- 🟣 **OVO** - E-wallet OVO
- 🔵 **DANA** - E-wallet DANA
- 🔴 **LinkAja** - E-wallet LinkAja

### Flow:
1. User pilih "Xendit" di checkout
2. Isi data pengiriman
3. Klik "Lanjutkan ke Pembayaran"
4. Redirect ke halaman pembayaran Xendit
5. Payment berhasil → Order diterima langsung

### Setup:
- Butuh API key Xendit (dari https://dashboard.xendit.co/)
- Set di `.env` file: `XENDIT_SECRET_KEY`

---

## 2. Transfer Manual (Bank Transfer)

### Deskripsi
- Pelanggan transfer manual ke rekening bank FoodOnline
- Pembayaran diverifikasi oleh admin
- Lebih fleksibel untuk pelanggan tanpa kartu kredit
- Rekomendasi: Untuk pelanggan dengan e-banking

### Flow:
1. User pilih "Transfer Manual (Bank)" di checkout
2. Isi data pengiriman
3. Sistem menampilkan rekening bank tujuan
4. User transfer dari bank-nya ke rekening yang diberikan
5. Admin verifikasi transfer
6. Order diproses setelah verifikasi

### Info Transfer:
```
Bank: Bank Mandiri
Nomor Rekening: 1234567890
Atas Nama: PT FoodOnline Indonesia
```

### Status Pesanan:
- **Pending** → Menunggu transfer dari pelanggan
- **Accepted** → Admin sudah verifikasi transfer
- **Delivered** → Pesanan selesai

---

## 3. COD (Cash On Delivery)

### Deskripsi
- Pembayaran saat barang sampai di tangan pelanggan
- Tidak perlu transfer dulu
- Paling fleksibel untuk pelanggan umum
- Rekomendasi: Untuk pelanggan lokal area pengiriman

### Flow:
1. User pilih "COD (Bayar di Tempat)" di checkout
2. Isi data pengiriman
3. Klik "Pesan Sekarang"
4. Kurir akan menghubungi sebelum pengiriman
5. Bayar kepada kurir saat barang sampai (cash/card)

### Status Pesanan:
- **Pending** → Pesanan diterima, siap dikirim
- **Accepted** → Kurir dalam perjalanan
- **Delivered** → Pesanan selesai (setelah pembayaran)

### Keuntungan:
- Pelanggan bisa check barang sebelum membayar
- Fleksibel pembayaran cash atau card
- No risk untuk pelanggan

---

## Perbandingan Metode Pembayaran

| Aspek | Xendit | Transfer | COD |
|-------|--------|----------|-----|
| Kecepatan | Instant ✅ | 1-2 hari | Saat pengiriman |
| Metode | Kartu/E-wallet | Bank Transfer | Cash/Card |
| Verifikasi | Otomatis | Manual | Kurir |
| Biaya | Gratis | Gratis | Gratis |
| Risiko Scam | Rendah | Medium | Rendah |
| Cocok Untuk | Online savvy | Semua | Local |

---

## Database Schema

### Order Model
```javascript
{
  paymentMethod: "xendit" | "transfer" | "cod",
  paymentStatus: "pending" | "paid" | "verified" | "failed",
  
  // Recipient Info
  recipientName: String,
  recipientPhone: String,
  recipientAddress: String,
  notes: String,
  
  // Xendit Info (if xendit)
  xenditInvoiceId: String,
  xenditInvoiceStatus: String,
  
  // Bank Info (if transfer)
  bankName: String,
  bankAccountNumber: String,
  bankAccountName: String
}
```

---

## API Endpoints

### Create Order (All Payment Methods)
```
POST /api/order
Headers: Authorization: Bearer TOKEN
Body: {
  items: [...],
  total: Number,
  paymentMethod: "xendit" | "transfer" | "cod",
  recipientName: String,
  recipientPhone: String,
  recipientAddress: String,
  notes: String (optional)
}
```

### Create Xendit Checkout
```
POST /api/checkout/create
Headers: Authorization: Bearer TOKEN
Body: {
  items: [...],
  total: Number,
  paymentMethod: "xendit"
}
Response: {
  success: true,
  invoiceUrl: "https://pay.xendit.co/..."
}
```

---

## Frontend Implementation

### Checkout Page
File: `backend/public/checkout.html`

Fitur:
- Radio button untuk pilih payment method
- Dynamic form yang berubah per method
- Info payment ditampilkan sesuai method
- Form validation

### Checkout Script
File: `backend/public/js/checkout.js`

Fungsi:
- `selectPaymentMethod()` - Handle payment method selection
- `processCheckout()` - Process berbagai payment method
- Show/hide form sesuai payment method

---

## Implementasi Admin Dashboard (Future)

Untuk implementasi lengkap, perlu:

1. **Admin Panel** untuk verifikasi transfer
2. **Payment History** untuk track pembayaran
3. **Manual Verification** untuk transfer method
4. **Invoice Report** untuk accounting
5. **Webhook Handler** untuk Xendit notifications

---

## Testing

### Test Xendit Payment
- Use card: `4011111111111111`
- Expiry: 12/25
- CVV: 123

### Test Transfer Method
- Data otomatis tersimpan di database
- Admin bisa verifikasi manual di dashboard

### Test COD
- Data pesanan langsung diterima
- Kurir bisa lihat info pelanggan

---

## Security Considerations

1. **Xendit API Key** - Never expose di frontend
2. **Bank Account** - Verify dengan admin sebelum display
3. **Payment Status** - Jangan trust frontend validation
4. **Transfer Verification** - Harus manual oleh admin
5. **COD Confirmation** - Kurir harus confirm di app

---

## Future Enhancements

- [ ] GCash integration
- [ ] PayPal integration
- [ ] Installment payment
- [ ] Digital wallet (GoPay, ShopeePay)
- [ ] QR code payment
- [ ] Auto-verification dengan bank API
