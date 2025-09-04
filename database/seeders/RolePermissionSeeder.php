<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            'view-leads',
            'create-leads',
            'edit-leads',
            'delete-leads',
            'view-own-leads',
            'manage-users',
            'view-reports',
            'manage-teams',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        $superadmin = Role::create(['name' => 'superadmin']);
        $superadmin->givePermissionTo(Permission::all());

        $manager = Role::create(['name' => 'manager']);
        $manager->givePermissionTo([
            'view-leads',
            'create-leads',
            'edit-leads',
            'view-reports',
            'manage-teams',
        ]);

        $spv = Role::create(['name' => 'spv']);
        $spv->givePermissionTo([
            'view-leads',
            'create-leads',
            'edit-leads',
            'view-reports',
        ]);

        $ha = Role::create(['name' => 'ha']);
        $ha->givePermissionTo([
            'view-own-leads',
            'create-leads',
            'edit-leads',
        ]);
    }
}
