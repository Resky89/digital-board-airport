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
        Schema::create('cities', function (Blueprint $table) {
            $table->bigIncrements('city_id');
            $table->string('city_name');
            $table->foreignId('country_id')->constrained('countries', 'country_id')->cascadeOnUpdate()->restrictOnDelete();
            $table->timestamps();
            $table->unique(['country_id', 'city_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cities');
    }
};
