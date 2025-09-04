# Growth Hubber CRM System

Growth Hubber adalah sistem CRM (Customer Relationship Management) berbasis web yang dibangun menggunakan Laravel 10, Inertia.js, React TypeScript, dan TailwindCSS.

## Fitur Utama

### 🔐 Sistem Role & User Management
- **Superadmin**: Akses penuh ke semua fitur sistem
- **Manager**: Mengelola tim, leads, dan laporan
- **Supervisor (SPV)**: Mengelola leads dan tim di bawahnya
- **HA (Sales)**: Mengelola leads pribadi

### 📊 Lead Management System
- **Priority Levels**: Cold, Warm, Hot, Booking, Closing
- **Lead Tracking**: Status, notes, description, contact information
- **History Tracking**: Otomatis mencatat perubahan priority dengan timestamp
- **File Attachments**: Wajib upload lampiran untuk status Booking dan Closing
- **Flexible Assignment**: Hierarki fleksibel antara Manager, SPV, dan HA

### 📈 Dashboard & Reports
- Dashboard statistik real-time per role
- Laporan leads per HA, Tim (SPV), dan Manager
- Grafik perkembangan leads
- Analytics dan insights

### 📱 Responsive Design
- Mobile-first design dengan TailwindCSS
- Responsive di semua device (desktop, tablet, mobile)

## Tech Stack

- **Backend**: Laravel 10 (PHP 8.1+)
- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS + Headless UI
- **Bridge**: Inertia.js
- **Database**: MySQL
- **Authorization**: Spatie Laravel Permission
- **Build Tool**: Vite

## Requirements

- PHP 8.1 atau lebih tinggi
- Composer
- Node.js 16+ dan npm
- MySQL/MariaDB
- Extension PHP: mbstring, pdo_mysql, openssl, tokenizer, xml, ctype, json

## Installation

### 1. Clone & Setup Project

```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

Edit file `.env` dan sesuaikan konfigurasi database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=growth_hubber_crm
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Database Setup

```bash
# Run migrations
php artisan migrate

# Seed database dengan roles dan sample users
php artisan db:seed
```

### 4. Build Assets

```bash
# Development
npm run dev

# Production
npm run build
```

## Running the Application

### Development Server

```bash
# Terminal 1: Laravel development server
php artisan serve

# Terminal 2: Vite development server (untuk hot reload)
npm run dev
```

Aplikasi akan tersedia di: `http://localhost:8000`

### Default Users

Setelah menjalankan seeder, tersedia user default:

| Role | Email | Password |
|------|-------|----------|
| Superadmin | admin@growthhubber.com | password |
| Manager | manager@growthhubber.com | password |
| SPV | spv@growthhubber.com | password |
| HA | ha@growthhubber.com | password |

## Quick Start

1. Pastikan PHP 8.1+, Composer, Node.js terinstall
2. Clone repository dan masuk ke folder `laravel-crm`
3. Jalankan: `composer install && npm install`
4. Copy `.env.example` ke `.env` dan setup database
5. Jalankan: `php artisan key:generate`
6. Jalankan: `php artisan migrate && php artisan db:seed`
7. Jalankan: `npm run build`
8. Start server: `php artisan serve`

---

**Growth Hubber CRM** - Streamline your sales process with intelligent lead management.
