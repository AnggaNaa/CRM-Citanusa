# Reports System Documentation

## Fitur-Fitur Reports Yang Telah Dibuat

### 1. **Backend - ReportController**
Lokasi: `app/Http/Controllers/ReportController.php`

#### Methods yang tersedia:
- `index()` - Menampilkan halaman reports dengan semua data analytics
- `getLeadStatistics()` - Statistik leads (total, converted, conversion rate, dll)
- `getUserPerformance()` - Performa user berdasarkan leads yang dihandle
- `getDailyLeadTrends()` - Trend leads harian dalam 30 hari terakhir
- `getStatusDistribution()` - Distribusi status leads
- `getTopPerformers()` - 5 user dengan performa terbaik
- `getRecentActivities()` - 10 aktivitas terbaru dari system logs
- `export()` - Export data dalam format CSV atau JSON

#### Filters yang didukung:
- **Date Range**: Filter berdasarkan tanggal dari-sampai
- **User**: Filter berdasarkan user tertentu
- **Status**: Filter berdasarkan status leads

### 2. **Frontend - Reports Page**
Lokasi: `resources/js/Pages/Reports/Index.tsx`

#### Komponen-komponen:
1. **Header dengan Filter & Export**
   - Filter toggle dengan form date range, user selection, status selection
   - Export dropdown dengan opsi CSV/JSON untuk leads, users, activities

2. **Statistics Cards**
   - Total Leads
   - Converted Leads  
   - Conversion Rate
   - In Progress Leads

3. **Charts & Data Visualization**
   - **Daily Lead Trends**: Chart showing leads created dan converted per hari
   - **Status Distribution**: Pie chart showing distribusi status leads
   - **Top Performers**: Ranking users berdasarkan conversion rate
   - **User Performance Table**: Detailed table performance semua users

4. **Recent Activities**
   - Log aktivitas terbaru dengan timestamp

### 3. **Routes**
Lokasi: `routes/web.php`

```php
Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
```

### 4. **Navigation Menu**
Reports sudah terintegrasi dalam navigation bar untuk roles:
- superadmin
- manager  
- spv

## Cara Menggunakan

### 1. **Mengakses Reports**
- Login sebagai user dengan role superadmin/manager/spv
- Klik menu "Reports" di sidebar
- Halaman reports akan memuat data default (30 hari terakhir)

### 2. **Menggunakan Filter**
- Klik tombol "Filters" untuk membuka form filter
- Atur:
  - **From Date**: Tanggal mulai filter
  - **To Date**: Tanggal akhir filter  
  - **User**: Pilih user tertentu (optional)
  - **Status**: Pilih status leads tertentu (optional)
- Klik "Apply Filters" untuk mengupdate data
- Klik "Reset" untuk mereset filter ke default

### 3. **Export Data**
- Klik tombol "Export" untuk membuka dropdown export options
- Pilih format yang diinginkan:
  - **CSV**: Download langsung file CSV
  - **JSON**: Download file JSON
- Pilih jenis report:
  - **Leads Report**: Data leads dengan detail lengkap
  - **User Performance**: Data performa users
  - **Activity Logs**: Log aktivitas system

### 4. **Membaca Analytics**

#### Lead Statistics Cards:
- **Total Leads**: Jumlah total leads dalam periode
- **Converted**: Jumlah leads yang berhasil di-convert
- **Conversion Rate**: Persentase conversion rate
- **In Progress**: Jumlah leads yang sedang dalam proses

#### Daily Lead Trends:
- Menampilkan 7 hari terakhir
- Data leads created vs converted per hari

#### Status Distribution:
- Breakdown percentage setiap status leads
- Progress bar visual untuk easy reading

#### Top Performers:
- 5 users dengan conversion rate tertinggi
- Menampilkan foto profile, nama, email, dan metrics

#### User Performance Table:
- Detailed table semua users dengan metrics:
  - Total leads assigned
  - Converted leads
  - Conversion rate dengan color coding (green: >20%, yellow: 10-20%, red: <10%)

## Technical Implementation

### Backend Data Processing
```php
// Contoh query untuk lead statistics
$leadStats = [
    'total_leads' => Lead::whereBetween('created_at', [$dateFrom, $dateTo])->count(),
    'converted_leads' => Lead::whereBetween('created_at', [$dateFrom, $dateTo])
                             ->where('status', 'converted')->count(),
    'conversion_rate' => // Calculated percentage
];
```

### Frontend State Management
```typescript
// Filter state management
const [formData, setFormData] = useState({
    date_from: filters.date_from,
    date_to: filters.date_to,
    user_id: filters.user_id || '',
    status: filters.status || '',
});
```

### Export Implementation
- **CSV Export**: Server-side streaming response dengan proper headers
- **JSON Export**: Client-side blob creation untuk download
- Support multiple report types dengan dynamic headers

## Future Enhancements

1. **Advanced Charts**: Integrasi dengan Chart.js atau D3.js untuk visualisasi yang lebih rich
2. **Excel Export**: Install Laravel Excel package untuk export .xlsx
3. **PDF Reports**: Generate PDF reports dengan summary dan charts
4. **Scheduled Reports**: Automatic email reports harian/mingguan
5. **Dashboard Widgets**: Real-time dashboard dengan auto-refresh
6. **Advanced Filters**: More granular filtering options (priority, source, etc.)

## Testing

Untuk testing dengan data dummy:
```bash
php artisan db:seed --class=ReportsTestDataSeeder
```

Data yang di-generate:
- 30+ days worth of sample leads
- Various priorities dan statuses
- Multiple users dengan roles berbeda
- Activity logs untuk testing

---

## Summary

Sistem Reports telah berhasil diimplementasikan dengan:
✅ **Backend Controller** dengan 7+ methods analytics  
✅ **Frontend React Page** dengan responsive design  
✅ **Interactive Filters** untuk custom date range dan parameters  
✅ **Export Functionality** dalam format CSV dan JSON  
✅ **Navigation Integration** untuk proper access control  
✅ **Comprehensive Analytics** covering leads, users, dan activities  

Sistem ini memberikan insight mendalam tentang performa CRM dan dapat dengan mudah di-extend untuk kebutuhan analytics tambahan.
