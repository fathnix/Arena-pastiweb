# Arena Pasti — Sistem Booking Lapangan Olahraga

Aplikasi booking lapangan olahraga multi-cabang dengan 3 role: **Superadmin**, **Admin/Kasir**, dan **Customer**. Backend Laravel (API) + frontend React SPA.

## Tech Stack

- **Backend**: Laravel 13, Sanctum (token auth), MySQL/MariaDB
- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS v4
- **Arsitektur backend**: Controller → Service → Repository → Model
- **Warna**: Emerald `#10B981`, Navy/Slate `#0F172A`, Amber `#F59E0B`

## Fitur

- Auth: register, login, logout, `me` (token Bearer)
- Role-based access (customer / admin / superadmin) via Gate
- Multi-cabang (branch) dari awal
- Manajemen lapangan & slot waktu
- **Anti double-booking** dengan transaksi DB + row lock
- Dynamic pricing: weekend +20%, jam sibuk (18–22) +15%, diskon 5% untuk ≥3 jam
- Booking flow: pilih lapangan → tanggal → slot → checkout
- Pembayaran manual: transfer bank (upload bukti) atau tunai, verifikasi admin
- Check-in & complete booking oleh admin
- Dashboard analytics: revenue harian/bulanan, peak hours, performa cabang (superadmin)
- 15 slot waktu (08:00–23:00) per lapangan

## Prasyarat

- PHP 8.3+ dan Composer
- Node.js 20+
- MySQL 8 / MariaDB 10.11+

## Setup Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# sesuaikan kredensial DB di .env, lalu:
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve --host=0.0.0.0 --port=8000
```

## Setup Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

- Lokal: `http://localhost:5173`
- LAN: `http://<IP-LOKAL>:5173` (mis. `http://192.168.101.67:5173`)

Frontend otomatis memanggil API di `http://<host-yang-sama>:8000/api/v1`.
Untuk override, buat `frontend/.env`:

```
VITE_API_URL=http://192.168.101.67:8000/api/v1
```

## Akun Test (semua password: `password`)

| Role | Email | Cabang |
|---|---|---|
| Superadmin | `superadmin@test.com` | Semua cabang |
| Admin / Kasir | `admin@test.com` | Arena Pasti Pusat |
| Customer | `customer@test.com` | — |

Seeder bisa dijalankan ulang (idempotent): `php artisan db:seed`

## Alur Pemakaian

1. **Customer** login → Booking → pilih lapangan & slot → Booking Sekarang
2. Di **Booking Saya** → Bayar Sekarang → pilih Transfer (upload bukti) atau Tunai
3. **Admin** login → Verifikasi Pembayaran → Terima (booking jadi `confirmed`)
4. Hari H, **Admin** → Manajemen Booking → Check-in → Selesai (`completed`)
5. **Superadmin** melihat dashboard global semua cabang + performa per cabang

## Status Booking

`pending_payment` → `confirmed` → `checked_in` → `completed`
(dapat juga `cancelled` / `expired`)

## API Endpoints (prefix `/api/v1`)

| Method | Path | Akses | Keterangan |
|---|---|---|---|
| POST | `/auth/register` | publik | daftar customer |
| POST | `/auth/login` | publik | dapat token |
| POST | `/auth/logout` | auth | hapus token |
| GET | `/auth/me` | auth | profil |
| GET | `/fields` | publik | daftar lapangan |
| GET | `/fields/{id}/availability?date=` | publik | slot terisi/kosong |
| POST | `/bookings` | auth | buat booking |
| GET | `/bookings` | auth | list (customer: upcoming; admin: harian) |
| POST | `/bookings/{code}/check-in` | admin | check-in |
| POST | `/bookings/{id}/complete` | admin | selesaikan |
| POST | `/bookings/{code}/cancel` | auth | batal |
| POST | `/payments` | auth | buat pembayaran |
| POST | `/payments/{id}/upload-proof` | auth | upload bukti |
| GET | `/payments/pending` | admin | antrian verifikasi |
| POST | `/payments/{id}/verify` | admin | terima |
| POST | `/payments/{id}/reject` | admin | tolak |
| GET | `/dashboard/stats` | admin | ringkasan |
| GET | `/dashboard/revenue` | admin | revenue chart |
| GET | `/dashboard/peak-hours` | admin | jam terlaris |
| GET | `/dashboard/branches` | superadmin | performa cabang |

## Build Produksi

```bash
cd frontend && npm run build      # output: frontend/dist
cd backend && php artisan migrate --force
```

## Struktur Singkat

```
backend/
  app/Http/Controllers/Api/   # endpoint
  app/Services/               # business logic (Booking, Payment, Pricing)
  app/Repositories/           # query data
  app/Http/Resources/         # format JSON
  app/Models/                 # Eloquent
frontend/
  src/pages/                  # halaman per role
  src/components/Layout.tsx   # shell navigasi
  src/contexts/AuthContext.tsx
  src/lib/api.ts              # axios + base URL dinamis
```
