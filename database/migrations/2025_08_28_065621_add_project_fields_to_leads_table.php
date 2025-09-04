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
            $table->string('project')->nullable()->after('notes');
            $table->string('type')->nullable()->after('project');
            $table->string('unit')->nullable()->after('type');
            $table->decimal('estimated_value', 15, 2)->nullable()->after('unit');
            $table->date('expected_closing_date')->nullable()->after('estimated_value');
            $table->string('source')->nullable()->after('expected_closing_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn([
                'project',
                'type',
                'unit',
                'estimated_value',
                'expected_closing_date',
                'source'
            ]);
        });
    }
};
