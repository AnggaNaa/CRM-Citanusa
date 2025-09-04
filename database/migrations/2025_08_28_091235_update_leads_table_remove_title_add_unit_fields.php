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
            // Remove title column if it exists
            if (Schema::hasColumn('leads', 'title')) {
                $table->dropColumn('title');
            }

            // Add unit_type and unit_no columns if they don't exist
            if (!Schema::hasColumn('leads', 'unit_type')) {
                $table->string('unit_type')->nullable()->after('project');
            }

            if (!Schema::hasColumn('leads', 'unit_no')) {
                $table->string('unit_no')->nullable()->after('unit_type');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            // Add title column back
            $table->string('title')->nullable()->after('id');

            // Remove unit_type and unit_no columns
            if (Schema::hasColumn('leads', 'unit_type')) {
                $table->dropColumn('unit_type');
            }

            if (Schema::hasColumn('leads', 'unit_no')) {
                $table->dropColumn('unit_no');
            }
        });
    }
};
