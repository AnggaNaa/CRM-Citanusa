<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class LeadSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        // --- Ambil user id valid dari tabel users (untuk FK) ---
        $userIds = DB::table('users')->pluck('id')->toArray();
        if (empty($userIds)) {
            $this->command->error('❌ Tidak ada data user di tabel users. Jalankan UsersSeeder dulu.');
            return;
        }

        // --- ENUM priority yang valid di DB ---
        $validPriorities = ['Cold','Warm','Hot','Booking','Closing','Lost'];

        // --- Mapping status -> priority (disesuaikan dengan daftar kamu) ---
        // Catatan:
        // - "Cancel" dipetakan ke "Lost" karena enum priority tidak punya "Cancel".
        // - Duplikasi/variasi penulisan disamakan (mis: "Tidak respon" & "Tidak Respon").
        // - "Nomor tidak valid" dipilih ke "Lost" agar tegas (karena muncul di dua kategori di daftar kamu).
        $statusPriorityMap = [
            // Cold
            'Respon' => 'Cold',
            'Perlu di-Update' => 'Cold',
            'Belum berminat' => 'Cold',
            'Belum respon' => 'Cold',
            'Tidak difollow up' => 'Cold',

            // Warm
            'Tertarik' => 'Warm',
            'Tanya Pricelist' => 'Warm',
            'Janji visit' => 'Warm',
            'Janji appointment' => 'Warm',
            'Sudah visit' => 'Warm',

            // Hot
            'Siap Membeli' => 'Hot',
            'Nego Harga' => 'Hot',
            'BI Checking' => 'Hot',
            'Sudah Appointment' => 'Hot',
            'Janji Booking' => 'Hot',

            // Booking / Closing
            'Booking' => 'Booking',
            'Closing' => 'Closing',

            // Lost
            'Leads Expired' => 'Lost',
            'Promo tidak menarik' => 'Lost',
            'DSR Minus' => 'Lost',
            'Beli di tempat lain' => 'Lost',
            'Harga tidak sepakat' => 'Lost',
            'Terlalu mahal' => 'Lost',
            'Ada keperluan lain' => 'Lost',
            'Produk kurang baik' => 'Lost',
            'Lingkungan kurang baik' => 'Lost',
            'Cara bayar tidak menarik' => 'Lost',
            'Unit tidak tersedia' => 'Lost',
            'Tertarik produk lain' => 'Lost',
            'Nomor tidak valid' => 'Lost',
            'Tidak respon' => 'Lost',
            'Tidak Respon' => 'Lost',
            'SLIK tidak rekomen' => 'Lost',
            'Cancel' => 'Lost',
        ];

        $statuses = array_keys($statusPriorityMap);
        $sources = ['website', 'referral', 'event', 'ads', 'agent', 'social', 'walk-in'];

        // --- Load data unit dari CSV ---
        $csvPath = database_path('seeders/tb_unit_type.csv');
        if (!file_exists($csvPath)) {
            $this->command->error("❌ File CSV tidak ditemukan di: $csvPath");
            return;
        }

        $rows = array_map('str_getcsv', file($csvPath));
        if (count($rows) < 2) {
            $this->command->error("❌ CSV kosong / tidak ada data: $csvPath");
            return;
        }

        $header = array_map('trim', array_shift($rows)); // ['project','unit_type','unit_no']
        $unitData = collect($rows)->map(function ($row) use ($header) {
            $row = array_pad($row, count($header), null);
            $assoc = array_combine($header, $row);
            // Normalisasi trimming
            return [
                'project'   => isset($assoc['project']) ? trim($assoc['project']) : null,
                'unit_type' => isset($assoc['unit_type']) ? trim($assoc['unit_type']) : null,
                'unit_no'   => isset($assoc['unit_no']) ? trim($assoc['unit_no']) : null,
            ];
        })->filter(fn ($r) => $r['project'] && $r['unit_type'] && $r['unit_no'])->values();

        if ($unitData->isEmpty()) {
            $this->command->error("❌ Data unit pada CSV tidak valid (cek header: project, unit_type, unit_no).");
            return;
        }

        // --- Generate 1000 leads ---
        $batch = [];
        $total = 1000;

        for ($i = 0; $i < $total; $i++) {
            $status = $faker->randomElement($statuses);
            $priority = $statusPriorityMap[$status] ?? 'Cold';

            // Safety: pastikan priority valid enum (hindari 1265 truncated)
            if (!in_array($priority, $validPriorities, true)) {
                $priority = 'Cold';
            }

            // Ambil unit random dari CSV
            $unit = $unitData->random();

            // FK users (nullable untuk beberapa field)
            $assignedTo = $faker->optional()->randomElement($userIds); // boleh null
            $createdBy  = $faker->randomElement($userIds);            // wajib ada
            $managerId  = $faker->optional()->randomElement($userIds);
            $spvId      = $faker->optional()->randomElement($userIds);

            // Beberapa field contoh realistis
            $createdAt = $faker->dateTimeBetween('-2 years', 'now');
            $expectedClosing = $faker->optional(0.7)->dateTimeBetween('now', '+1 year'); // 70% punya target closing

            $batch[] = [
                'description'            => $faker->sentence(6),
                'priority'               => $priority,
                'priority_changed_at'    => $faker->dateTimeBetween('-1 year', 'now'),
                'status'                 => $status,
                'notes'                  => $faker->optional()->paragraph(),
                'project'                => $unit['project'],
                'unit_type'              => $unit['unit_type'],
                'unit_no'                => $unit['unit_no'],
                'type'                   => $unit['unit_type'], // disamakan supaya konsisten
                'unit'                   => $unit['unit_no'],   // disamakan supaya konsisten
                'estimated_value'        => $faker->numberBetween(100_000_000, 2_000_000_000),
                'expected_closing_date'  => $expectedClosing,
                'source'                 => $faker->randomElement($sources),
                'contact_name'           => $faker->name(),
                'contact_email'          => $faker->unique()->safeEmail(),
                'contact_phone'          => $faker->phoneNumber(),
                'contact_address'        => $faker->address(),
                'contact_company'        => $faker->company(),
                'contact_position'       => $faker->jobTitle(),
                'assigned_to'            => $assignedTo,
                'created_by'             => $createdBy,
                'manager_id'             => $managerId,
                'spv_id'                 => $spvId,
                'created_at'             => $createdAt,
                'updated_at'             => $createdAt,
            ];
        }

        // Insert sekali jalan (lebih cepat)
        DB::table('leads')->insert($batch);

        $this->command->info("✅ Berhasil seed {$total} leads dari CSV + mapping status→priority.");
    }
}
