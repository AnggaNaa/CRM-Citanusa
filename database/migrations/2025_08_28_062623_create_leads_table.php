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
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('priority', ['cold', 'warm', 'hot', 'booking', 'closing'])->default('cold');
            $table->string('status')->default('new');
            $table->text('notes')->nullable();

            // Project information
            $table->string('project')->nullable();
            $table->string('type')->nullable(); // Type of lead (residential, commercial, etc.)
            $table->string('unit')->nullable(); // Unit type/specification
            $table->decimal('estimated_value', 15, 2)->nullable(); // Estimated deal value
            $table->date('expected_closing_date')->nullable();
            $table->string('source')->nullable(); // Lead source (website, referral, etc.)

            // Contact information
            $table->string('contact_name');
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->text('contact_address')->nullable();
            $table->string('contact_company')->nullable();
            $table->string('contact_position')->nullable();

            // Assignment and hierarchy
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('manager_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('spv_id')->nullable()->constrained('users')->onDelete('set null');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
