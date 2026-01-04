<?php

namespace Database\Seeders;

use App\Models\Airport;
use App\Models\Country;
use Illuminate\Database\Seeder;

class AirportSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['airport_code' => 'CGK', 'airport_name' => 'Soekarno–Hatta International Airport', 'city' => 'Jakarta', 'country_code' => 'ID'],
            ['airport_code' => 'SIN', 'airport_name' => 'Singapore Changi Airport', 'city' => 'Singapore', 'country_code' => 'SG'],
        ];

        foreach ($rows as $row) {
            $countryId = Country::where('country_code', $row['country_code'])->value('country_id');
            if ($countryId) {
                Airport::updateOrCreate(
                    ['airport_code' => $row['airport_code']],
                    [
                        'airport_name' => $row['airport_name'],
                        'city' => $row['city'],
                        'country_id' => $countryId,
                    ]
                );
            }
        }
    }
}
