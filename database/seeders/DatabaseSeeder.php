<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
        ]);

        // Create default superadmin user
        \App\Models\User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'admin@growthhubber.com',
        ])->assignRole('superadmin');

        // Create test users for other roles
        \App\Models\User::factory()->create([
            'name' => 'Manager User',
            'email' => 'manager@growthhubber.com',
        ])->assignRole('manager');

        \App\Models\User::factory()->create([
            'name' => 'SPV User',
            'email' => 'spv@growthhubber.com',
        ])->assignRole('spv');

        \App\Models\User::factory()->create([
            'name' => 'HA User',
            'email' => 'ha@growthhubber.com',
        ])->assignRole('ha');
    }
}
