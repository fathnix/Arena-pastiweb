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

## Default Accounts

- **Superadmin**: `superadmin@arenapasti.test` / `password`
- **Admin**: `admin@arenapasti.test` / `password`
- **Customer**: `customer@arenapasti.test` / `password`

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
