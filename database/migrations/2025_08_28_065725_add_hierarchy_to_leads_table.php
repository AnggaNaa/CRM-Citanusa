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
        Schema::table('leads', function (Blueprint $table) {
            $table->unsignedBigInteger('manager_id')->nullable()->after('created_by');
            $table->unsignedBigInteger('spv_id')->nullable()->after('manager_id');

            $table->foreign('manager_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('spv_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropForeign(['manager_id']);
            $table->dropForeign(['spv_id']);
            $table->dropColumn(['manager_id', 'spv_id']);
        });
    }
};
