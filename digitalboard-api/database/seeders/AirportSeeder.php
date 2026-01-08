<?php

namespace Database\Seeders;

use App\Models\Airport;
use App\Models\City;
use App\Models\Country;
use Illuminate\Database\Seeder;

class AirportSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['airport_code' => 'CGK', 'airport_name' => 'Soekarno–Hatta International Airport', 'city_name' => 'Jakarta', 'country_code' => 'ID'],
            ['airport_code' => 'SIN', 'airport_name' => 'Singapore Changi Airport', 'city_name' => 'Singapore', 'country_code' => 'SG'],
            ['airport_code' => 'SUB', 'airport_name' => 'Juanda International Airport', 'city_name' => 'Surabaya', 'country_code' => 'ID'],
            ['airport_code' => 'DPS', 'airport_name' => 'Ngurah Rai International Airport', 'city_name' => 'Denpasar', 'country_code' => 'ID'],
            ['airport_code' => 'KUL', 'airport_name' => 'Kuala Lumpur International Airport', 'city_name' => 'Kuala Lumpur', 'country_code' => 'MY'],
        ];

        foreach ($rows as $row) {
            // Dapatkan city_id berdasarkan city_name dan country_code
            $city = City::whereHas('country', function ($query) use ($row) {
                $query->where('country_code', $row['country_code']);
            })->where('city_name', $row['city_name'])->first();
            
            if ($city) {
                Airport::updateOrCreate(
                    ['airport_code' => $row['airport_code']],
                    [
                        'airport_name' => $row['airport_name'],
                        'city_id' => $city->city_id,
                    ]
                );
            }
        }
    }
}
