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
        Schema::create('gates', function (Blueprint $table) {
            $table->bigIncrements('gate_id');
            $table->string('gate_code', 20);
            $table->foreignId('terminal_id')->constrained('terminals', 'terminal_id')->cascadeOnUpdate()->restrictOnDelete();
            $table->timestamps();

            $table->unique(['terminal_id', 'gate_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gates');
    }
};
