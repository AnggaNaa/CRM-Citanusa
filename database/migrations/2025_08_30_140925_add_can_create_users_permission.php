<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create permission for creating users
        \Spatie\Permission\Models\Permission::create(['name' => 'create_users']);

        // Assign to superadmin and manager roles by default
        $superadminRole = \Spatie\Permission\Models\Role::where('name', 'superadmin')->first();
        $managerRole = \Spatie\Permission\Models\Role::where('name', 'manager')->first();

        if ($superadminRole) {
            $superadminRole->givePermissionTo('create_users');
        }

        if ($managerRole) {
            $managerRole->givePermissionTo('create_users');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Spatie\Permission\Models\Permission::where('name', 'create_users')->delete();
    }
};
