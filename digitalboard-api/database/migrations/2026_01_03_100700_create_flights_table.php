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
        Schema::create('flights', function (Blueprint $table) {
            $table->bigIncrements('flight_id');
            $table->string('flight_code', 20)->index();

            $table->foreignId('airline_id')->constrained('airlines', 'airline_id')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('origin_airport_id')->constrained('airports', 'airport_id')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('destination_airport_id')->constrained('airports', 'airport_id')->cascadeOnUpdate()->restrictOnDelete();

            $table->foreignId('gate_id')->constrained('gates', 'gate_id')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('terminal_id')->constrained('terminals', 'terminal_id')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('status_id')->constrained('flight_status', 'status_id')->cascadeOnUpdate()->restrictOnDelete();

            $table->string('flight_type', 20);
            $table->dateTime('scheduled_time');
            $table->dateTime('actual_time')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users', 'id')->cascadeOnUpdate()->nullOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flights');
    }
};
