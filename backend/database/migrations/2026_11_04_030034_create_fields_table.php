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
        Schema::create('fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('type', 50)->nullable();
            $table->integer('capacity')->nullable();
            $table->unsignedBigInteger('base_hourly_rate');
            $table->text('description')->nullable();
            $table->time('open_time')->default('08:00');
            $table->time('close_time')->default('23:00');
            $table->integer('slot_duration')->default(60);
            $table->string('status', 20)->default('active');
            $table->timestamps();

            $table->index(['branch_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fields');
    }
};
