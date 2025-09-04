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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->text('address')->nullable()->after('phone');
            $table->string('employee_id')->unique()->nullable()->after('address');
            $table->string('department')->nullable()->after('employee_id');
            $table->string('position')->nullable()->after('department');
            $table->date('join_date')->nullable()->after('position');
            $table->date('leave_date')->nullable()->after('join_date');
            $table->boolean('is_active')->default(true)->after('leave_date');
            $table->string('profile_picture')->nullable()->after('is_active');
            $table->timestamp('last_login_at')->nullable()->after('profile_picture');
            $table->string('last_login_ip')->nullable()->after('last_login_at');
            $table->json('settings')->nullable()->after('last_login_ip');
            $table->text('notes')->nullable()->after('settings');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone', 'address', 'employee_id', 'department', 'position',
                'join_date', 'leave_date', 'is_active', 'profile_picture',
                'last_login_at', 'last_login_ip', 'settings', 'notes'
            ]);
        });
    }
};
