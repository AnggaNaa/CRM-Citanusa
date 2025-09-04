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
        Schema::create('project_units', function (Blueprint $table) {
            $table->id();
            $table->string('project')->index();
            $table->string('unit_type')->index();
            $table->string('unit_no')->index();
            $table->enum('status', ['available', 'reserved', 'sold', 'blocked'])->default('available');
            $table->decimal('price', 15, 2)->nullable();
            $table->decimal('size', 8, 2)->nullable(); // in square meters
            $table->text('description')->nullable();
            $table->json('specifications')->nullable(); // JSON for additional unit specifications
            $table->timestamps();

            // Unique constraint to prevent duplicate units
            $table->unique(['project', 'unit_type', 'unit_no'], 'unique_project_unit');

            // Index for common queries
            $table->index(['project', 'unit_type']);
            $table->index(['project', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_units');
    }
};
