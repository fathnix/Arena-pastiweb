# Arena Pasti - Sistem Booking Lapangan Olahraga

Sistem booking lapangan olahraga profesional dengan fitur manajemen jadwal real-time, pembayaran terintegrasi, dan dashboard analytics.

## Tech Stack

- **Backend**: Laravel 11 + Sanctum + MySQL
- **Frontend**: React 18 + Vite + TypeScript + Tailwind + shadcn/ui
- **Architecture**: Service-Repository-Handler pattern, API-first

## Quick Start

### Prerequisites

- PHP 8.2+
- Composer 2.7+
- Node.js 20+
- MySQL 8.0+ / MariaDB 10.11+

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend akan jalan di `http://localhost:5173`, backend di `http://localhost:8000`.

Untuk akses dari perangkat lain di jaringan yang sama, jalankan backend dengan host terbuka:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

Lalu buka `http://<IP-LOKAL>:5173`. IP lokal bisa dicek dengan `ip route get 1.1.1.1`.

## Default Accounts

Semua akun memakai password `password`.

| Role | Email | Cabang |
|---|---|---|
| Superadmin | `superadmin@arenapasti.test` | Semua |
| Admin | `admin@arenapasti.test` | Arena Pasti Pusat |
| Kasir | `kasir@arenapasti.test` | Arena Pasti Pusat |
| Admin | `admin.selatan@arenapasti.test` | Arena Pasti Cabang Selatan |
| Customer | `customer@arenapasti.test` | - |
| Customer | `customer2@arenapasti.test` | - |

Seeder bersifat idempotent, jadi aman dijalankan ulang:

```bash
php artisan db:seed
```

## API Documentation

Buka `http://localhost:8000/docs/api` setelah server jalan.

## Architecture

```
Controller → FormRequest → Handler → Service → Repository → Model
                                  ↓
                              Event (after commit)
                                  ↓
                          Listener / Queue Job
```

## Development

```bash
# Code quality
cd backend
./vendor/bin/pint
./vendor/bin/phpstan
./vendor/bin/pest

# Database refresh
php artisan migrate:fresh --seed
```
