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
            // Update priority enum to match requirements: Cold, Warm, Hot, Booking, Closing, Lost
            $table->enum('priority', ['Cold', 'Warm', 'Hot', 'Booking', 'Closing', 'Lost'])->default('Cold')->change();

            // Add priority_changed_at column to track when priority was last changed
            $table->timestamp('priority_changed_at')->nullable()->after('priority');

            // Add fields that might be missing
            if (!Schema::hasColumn('leads', 'project')) {
                $table->string('project')->after('description');
            }

            // Make sure we have all required contact fields
            if (!Schema::hasColumn('leads', 'contact_name')) {
                $table->string('contact_name')->nullable()->after('project');
            }
            if (!Schema::hasColumn('leads', 'contact_email')) {
                $table->string('contact_email')->nullable()->after('contact_name');
            }
            if (!Schema::hasColumn('leads', 'contact_phone')) {
                $table->string('contact_phone')->nullable()->after('contact_email');
            }
            if (!Schema::hasColumn('leads', 'contact_company')) {
                $table->string('contact_company')->nullable()->after('contact_phone');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn('priority_changed_at');
            // Revert priority enum back to original values if needed
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium')->change();
        });
    }
};
