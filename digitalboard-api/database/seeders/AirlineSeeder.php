<?php

namespace Database\Seeders;

use App\Models\Airline;
use Illuminate\Database\Seeder;

class AirlineSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['airline_code' => 'GA', 'airline_name' => 'Garuda Indonesia'],
            ['airline_code' => 'SQ', 'airline_name' => 'Singapore Airlines'],
            ['airline_code' => 'MH', 'airline_name' => 'Malaysia Airlines'],
        ];

        foreach ($rows as $row) {
            Airline::updateOrCreate(
                ['airline_code' => $row['airline_code']],
                ['airline_name' => $row['airline_name']]
            );
        }
    }
}
