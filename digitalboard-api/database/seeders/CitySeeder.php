<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Country;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            // Indonesia
            ['city_code' => 'JKT', 'city_name' => 'Jakarta', 'country_code' => 'ID'],
            ['city_code' => 'SUB', 'city_name' => 'Surabaya', 'country_code' => 'ID'],
            ['city_code' => 'DPS', 'city_name' => 'Denpasar', 'country_code' => 'ID'],
            ['city_code' => 'MES', 'city_name' => 'Medan', 'country_code' => 'ID'],
            ['city_code' => 'UPG', 'city_name' => 'Makassar', 'country_code' => 'ID'],
            ['city_code' => 'JOG', 'city_name' => 'Yogyakarta', 'country_code' => 'ID'],
            ['city_code' => 'SRG', 'city_name' => 'Semarang', 'country_code' => 'ID'],
            ['city_code' => 'BPN', 'city_name' => 'Balikpapan', 'country_code' => 'ID'],
            ['city_code' => 'PLM', 'city_name' => 'Palembang', 'country_code' => 'ID'],
            ['city_code' => 'BDO', 'city_name' => 'Bandung', 'country_code' => 'ID'],
            ['city_code' => 'PDG', 'city_name' => 'Padang', 'country_code' => 'ID'],
            ['city_code' => 'PKU', 'city_name' => 'Pekanbaru', 'country_code' => 'ID'],
            ['city_code' => 'BTH', 'city_name' => 'Batam', 'country_code' => 'ID'],
            ['city_code' => 'SOC', 'city_name' => 'Solo', 'country_code' => 'ID'],
            ['city_code' => 'MLG', 'city_name' => 'Malang', 'country_code' => 'ID'],
            ['city_code' => 'PNK', 'city_name' => 'Pontianak', 'country_code' => 'ID'],
            ['city_code' => 'BDJ', 'city_name' => 'Banjarmasin', 'country_code' => 'ID'],
            ['city_code' => 'AMQ', 'city_name' => 'Ambon', 'country_code' => 'ID'],
            ['city_code' => 'MDC', 'city_name' => 'Manado', 'country_code' => 'ID'],
            ['city_code' => 'JJP', 'city_name' => 'Jayapura', 'country_code' => 'ID'],
            // Singapore
            ['city_code' => 'SIN', 'city_name' => 'Singapore', 'country_code' => 'SG'],
            // Malaysia
            ['city_code' => 'KUL', 'city_name' => 'Kuala Lumpur', 'country_code' => 'MY'],
            ['city_code' => 'PEN', 'city_name' => 'Penang', 'country_code' => 'MY'],
            ['city_code' => 'JHB', 'city_name' => 'Johor Bahru', 'country_code' => 'MY'],
            ['city_code' => 'KCH', 'city_name' => 'Kuching', 'country_code' => 'MY'],
            ['city_code' => 'KBR', 'city_name' => 'Kota Bharu', 'country_code' => 'MY'],
            ['city_code' => 'LGK', 'city_name' => 'Langkawi', 'country_code' => 'MY'],
        ];

        foreach ($rows as $row) {
            $countryId = Country::where('country_code', $row['country_code'])->value('country_id');
            
            if ($countryId) {
                City::updateOrCreate(
                    ['city_code' => $row['city_code']],
                    [
                        'city_name' => $row['city_name'],
                        'country_id' => $countryId,
                    ]
                );
            }
        }
    }
}
