# Setup Checkout & Payment dengan Xendit

## Langkah-langkah Setup

### 1. Install Dependencies
```bash
npm install
npm install xendit
```

### 2. Konfigurasi Xendit

#### Daftar Akun Xendit
- Kunjungi https://www.xendit.co
- Buat akun baru atau login
- Pergi ke Dashboard → Settings → API Keys
- Copy Secret Key dan Public Key

#### Setup Environment Variables
1. Copy `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` dan masukkan:
```
XENDIT_SECRET_KEY=xnd_development_xxxxxxx
XENDIT_PUBLIC_KEY=xnd_public_development_xxxxxxx
CLIENT_URL=http://localhost:3000
```

### 3. Jalankan Server
```bash
npm run dev
# atau
node backend/server.js
```

### 4. Akses Checkout
- Login terlebih dahulu
- Tambah item ke keranjang
- Klik "Checkout"
- Isi data pengiriman
- Pilih metode pembayaran Xendit
- Klik "Lanjutkan ke Pembayaran"
- Anda akan diarahkan ke halaman Xendit

## Fitur-Fitur

### ✅ Checkout
- Validasi form pengiriman
- Ringkasan pesanan dengan perhitungan pajak
- Multiple payment methods (Kartu Kredit, Transfer Bank, OVO, DANA, LinkAja)

### 💳 Payment Gateway (Xendit)
- Invoice creation otomatis
- Multiple payment methods support
- Real-time payment status
- Webhook untuk payment confirmation

### 📦 Order Management
- Order status tracking (Pending → Accepted → Delivered)
- Order history
- Payment status integration

## API Endpoints

### POST /api/checkout/create
Membuat checkout dan Xendit invoice
```json
{
  "items": [
    {
      "menuId": "id",
      "name": "Nasi Goreng",
      "qty": 1,
      "price": 25000,
      "image": "image.jpg"
    }
  ],
  "total": 25000
}
```

### GET /api/checkout/invoice/:invoiceId
Mendapatkan status invoice

### GET /api/checkout/order/:orderId
Mendapatkan detail order

### POST /api/checkout/webhook/xendit
Webhook endpoint untuk payment confirmation

## Testing Xendit

### Menggunakan Xendit Sandbox
1. Login ke Xendit Dashboard
2. Switch ke Sandbox Mode (Development)
3. Gunakan test credentials
4. Test payment dengan test card: `4011111111111111`

### Test Scenarios
- **Success**: Gunakan test card yang valid
- **Failed**: Gunakan test card yang invalid
- **Pending**: Beberapa metode pembayaran memerlukan konfirmasi manual

## Troubleshooting

### Error: "Route.post() requires a callback function"
- Pastikan controller function sudah di-export
- Cek import path di routes file

### Error: Xendit API not responding
- Pastikan XENDIT_SECRET_KEY benar
- Cek koneksi internet
- Verifikasi API key di Xendit Dashboard

### Webhook tidak diterima
- Pastikan server berjalan di URL yang accessible
- Cek firewall settings
- Verify webhook URL di Xendit Dashboard: Settings → Webhooks

## Database Fields (Order Model)

```javascript
{
  user: ObjectId,           // Reference ke User
  items: [                  // Array of ordered items
    {
      menuId: String,
      name: String,
      qty: Number,
      price: Number,
      image: String
    }
  ],
  total: Number,            // Total amount
  status: String,           // Pending, Accepted, Delivered, Cancelled
  xenditInvoiceId: String,  // Xendit invoice ID
  xenditInvoiceStatus: String, // PENDING, PAID, EXPIRED
  paymentMethod: String,    // Payment method used
  createdAt: Date,
  updatedAt: Date
}
```

## Next Steps

1. Implementasi email notification untuk confirmation
2. Add SMS notification via Xendit
3. Implementasi admin dashboard untuk order management
4. Add real-time order status updates
5. Integrasi dengan delivery tracking

## Resources

- Xendit Documentation: https://docs.xendit.co
- Xendit API Reference: https://docs.xendit.co/api-reference/
- Express Documentation: https://expressjs.com/
- MongoDB Documentation: https://docs.mongodb.com/

## Support

Untuk bantuan lebih lanjut, hubungi:
- Xendit Support: https://xendit.co/support
- Email: support@example.com
