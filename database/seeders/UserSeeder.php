<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles if they don't exist
        $roles = ['superadmin', 'manager', 'spv', 'ha'];
        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }

        // Create permissions if they don't exist
        $permissions = [
            'view_leads',
            'create_leads',
            'edit_leads',
            'delete_leads',
            'assign_leads',
            'view_users',
            'create_users',
            'edit_users',
            'delete_users',
            'view_reports',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName]);
        }

        // Assign permissions to roles
        $superadminRole = Role::findByName('superadmin');
        $superadminRole->givePermissionTo($permissions);

        $managerRole = Role::findByName('manager');
        $managerRole->givePermissionTo([
            'view_leads', 'create_leads', 'edit_leads', 'assign_leads',
            'view_users', 'edit_users', 'view_reports'
        ]);

        $spvRole = Role::findByName('spv');
        $spvRole->givePermissionTo([
            'view_leads', 'create_leads', 'edit_leads', 'assign_leads', 'view_reports'
        ]);

        $haRole = Role::findByName('ha');
        $haRole->givePermissionTo([
            'view_leads', 'create_leads', 'edit_leads'
        ]);

        // Create Superadmin
        $superadmin = User::firstOrCreate(
            ['email' => 'superadmin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'phone' => '08111111111',
                'address' => 'Jakarta HQ',
                'hire_date' => now()->subYears(2),
                'status' => 'active',
            ]
        );
        $superadmin->assignRole('superadmin');

        // Create Manager
        $manager = User::firstOrCreate(
            ['email' => 'manager@example.com'],
            [
                'name' => 'John Manager',
                'password' => Hash::make('password'),
                'phone' => '08222222222',
                'address' => 'Jakarta Office',
                'hire_date' => now()->subYears(1),
                'status' => 'active',
            ]
        );
        $manager->assignRole('manager');

        // Create SPV
        $spv = User::firstOrCreate(
            ['email' => 'spv@example.com'],
            [
                'name' => 'Jane Supervisor',
                'password' => Hash::make('password'),
                'manager_id' => $manager->id,
                'phone' => '08333333333',
                'address' => 'Jakarta Office',
                'hire_date' => now()->subMonths(8),
                'status' => 'active',
            ]
        );
        $spv->assignRole('spv');

        // Create HA
        $ha = User::firstOrCreate(
            ['email' => 'ha@example.com'],
            [
                'name' => 'Bob Housing Agent',
                'password' => Hash::make('password'),
                'manager_id' => $manager->id,
                'spv_id' => $spv->id,
                'phone' => '08444444444',
                'address' => 'Jakarta Office',
                'hire_date' => now()->subMonths(3),
                'status' => 'active',
            ]
        );
        $ha->assignRole('ha');

        // Create additional HA users
        $ha2 = User::firstOrCreate(
            ['email' => 'ha2@example.com'],
            [
                'name' => 'Alice Real Estate Agent',
                'password' => Hash::make('password'),
                'manager_id' => $manager->id,
                'spv_id' => $spv->id,
                'phone' => '08555555555',
                'address' => 'Jakarta Office',
                'hire_date' => now()->subMonths(2),
                'status' => 'active',
            ]
        );
        $ha2->assignRole('ha');

        $this->command->info('Created sample users with roles and permissions.');
        $this->command->info('Login credentials:');
        $this->command->info('Superadmin: superadmin@example.com / password');
        $this->command->info('Manager: manager@example.com / password');
        $this->command->info('SPV: spv@example.com / password');
        $this->command->info('HA: ha@example.com / password');
        $this->command->info('HA2: ha2@example.com / password');
    }
}
