<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StatusesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            // Cold statuses
            ['name' => 'Respon', 'priority' => 'cold', 'description' => 'Lead memberikan respon awal', 'color' => '#6B7280', 'sort_order' => 1],
            ['name' => 'Perlu di-Update', 'priority' => 'cold', 'description' => 'Lead membutuhkan update informasi', 'color' => '#6B7280', 'sort_order' => 2],
            ['name' => 'Belum berminat', 'priority' => 'cold', 'description' => 'Lead belum menunjukkan minat', 'color' => '#6B7280', 'sort_order' => 3],
            ['name' => 'Belum respon', 'priority' => 'cold', 'description' => 'Lead belum memberikan respon', 'color' => '#6B7280', 'sort_order' => 4],
            ['name' => 'Tidak difollow up', 'priority' => 'cold', 'description' => 'Lead tidak di-follow up', 'color' => '#6B7280', 'sort_order' => 5],
            ['name' => 'Nomor tidak valid Cold', 'priority' => 'cold', 'description' => 'Nomor kontak tidak valid', 'color' => '#6B7280', 'sort_order' => 6],

            // Warm statuses
            ['name' => 'Tertarik', 'priority' => 'warm', 'description' => 'Lead menunjukkan ketertarikan', 'color' => '#F59E0B', 'sort_order' => 1],
            ['name' => 'Tanya Pricelist', 'priority' => 'warm', 'description' => 'Lead menanyakan daftar harga', 'color' => '#F59E0B', 'sort_order' => 2],
            ['name' => 'Janji visit', 'priority' => 'warm', 'description' => 'Lead berjanji untuk berkunjung', 'color' => '#F59E0B', 'sort_order' => 3],
            ['name' => 'Janji appointment', 'priority' => 'warm', 'description' => 'Lead membuat janji temu', 'color' => '#F59E0B', 'sort_order' => 4],
            ['name' => 'Sudah visit', 'priority' => 'warm', 'description' => 'Lead sudah melakukan kunjungan', 'color' => '#F59E0B', 'sort_order' => 5],

            // Hot statuses
            ['name' => 'Siap Membeli', 'priority' => 'hot', 'description' => 'Lead siap untuk melakukan pembelian', 'color' => '#EF4444', 'sort_order' => 1],
            ['name' => 'Nego Harga', 'priority' => 'hot', 'description' => 'Lead sedang negosiasi harga', 'color' => '#EF4444', 'sort_order' => 2],
            ['name' => 'BI Checking', 'priority' => 'hot', 'description' => 'Sedang proses BI checking', 'color' => '#EF4444', 'sort_order' => 3],
            ['name' => 'Sudah Appointment', 'priority' => 'hot', 'description' => 'Sudah ada appointment', 'color' => '#EF4444', 'sort_order' => 4],
            ['name' => 'Janji Booking', 'priority' => 'hot', 'description' => 'Lead berjanji untuk booking', 'color' => '#EF4444', 'sort_order' => 5],

            // Booking status
            ['name' => 'Booking', 'priority' => 'booking', 'description' => 'Lead melakukan booking unit', 'color' => '#3B82F6', 'sort_order' => 1],

            // Closing status
            ['name' => 'Closing', 'priority' => 'closing', 'description' => 'Lead berhasil closing', 'color' => '#10B981', 'sort_order' => 1],

            // Lost statuses
            ['name' => 'Leads Expired', 'priority' => 'lost', 'description' => 'Lead sudah tidak aktif/expired', 'color' => '#DC2626', 'sort_order' => 1],
            ['name' => 'Promo tidak menarik', 'priority' => 'lost', 'description' => 'Promo dianggap tidak menarik', 'color' => '#DC2626', 'sort_order' => 2],
            ['name' => 'DSR Minus', 'priority' => 'lost', 'description' => 'Debt Service Ratio tidak memenuhi', 'color' => '#DC2626', 'sort_order' => 3],
            ['name' => 'Beli di tempat lain', 'priority' => 'lost', 'description' => 'Lead membeli properti di tempat lain', 'color' => '#DC2626', 'sort_order' => 4],
            ['name' => 'Harga tidak sepakat', 'priority' => 'lost', 'description' => 'Tidak ada kesepakatan harga', 'color' => '#DC2626', 'sort_order' => 5],
            ['name' => 'Terlalu mahal', 'priority' => 'lost', 'description' => 'Lead menganggap harga terlalu mahal', 'color' => '#DC2626', 'sort_order' => 6],
            ['name' => 'Ada keperluan lain', 'priority' => 'lost', 'description' => 'Lead memiliki keperluan lain', 'color' => '#DC2626', 'sort_order' => 7],
            ['name' => 'Produk kurang baik', 'priority' => 'lost', 'description' => 'Lead menganggap produk kurang baik', 'color' => '#DC2626', 'sort_order' => 8],
            ['name' => 'Lingkungan kurang baik', 'priority' => 'lost', 'description' => 'Lead menganggap lingkungan kurang baik', 'color' => '#DC2626', 'sort_order' => 9],
            ['name' => 'Cara bayar tidak menarik', 'priority' => 'lost', 'description' => 'Cara pembayaran tidak menarik', 'color' => '#DC2626', 'sort_order' => 10],
            ['name' => 'Unit tidak tersedia', 'priority' => 'lost', 'description' => 'Unit yang diinginkan tidak tersedia', 'color' => '#DC2626', 'sort_order' => 11],
            ['name' => 'Tertarik produk lain', 'priority' => 'lost', 'description' => 'Lead tertarik dengan produk lain', 'color' => '#DC2626', 'sort_order' => 12],
            ['name' => 'Nomor tidak valid Lost', 'priority' => 'lost', 'description' => 'Nomor kontak tidak valid', 'color' => '#DC2626', 'sort_order' => 13],
            ['name' => 'SLIK tidak rekomen', 'priority' => 'lost', 'description' => 'SLIK tidak merekomendasikan', 'color' => '#DC2626', 'sort_order' => 14],
            ['name' => 'Tidak respon', 'priority' => 'lost', 'description' => 'Lead tidak memberikan respon', 'color' => '#DC2626', 'sort_order' => 15],

            // Cancel status
            ['name' => 'Cancel', 'priority' => 'cancel', 'description' => 'Lead dibatalkan', 'color' => '#9CA3AF', 'sort_order' => 1],

            // General status
            ['name' => 'None', 'priority' => 'general', 'description' => 'Status umum/default', 'color' => '#6B7280', 'sort_order' => 1],
        ];

        foreach ($statuses as $status) {
            DB::table('statuses')->updateOrInsert(
                ['name' => $status['name'], 'priority' => $status['priority']],
                [
                    'description' => $status['description'],
                    'color' => $status['color'],
                    'is_active' => true,
                    'sort_order' => $status['sort_order'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
