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
        Schema::table('airports', function (Blueprint $table) {
            // Hapus kolom city (string) dan country_id lama
            $table->dropForeign(['country_id']);
            $table->dropColumn(['city', 'country_id']);
            
            // Tambahkan relasi ke tabel cities
            $table->foreignId('city_id')
                ->after('airport_name')
                ->constrained('cities', 'city_id')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('airports', function (Blueprint $table) {
            // Kembalikan ke struktur lama
            $table->dropForeign(['city_id']);
            $table->dropColumn('city_id');
            
            $table->string('city')->after('airport_name');
            $table->foreignId('country_id')
                ->after('city')
                ->constrained('countries', 'country_id')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
        });
    }
};
