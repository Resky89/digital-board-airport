<?php

namespace Database\Seeders;

use App\Models\Country;
use Illuminate\Database\Seeder;

class CountrySeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['country_code' => 'ID', 'country_name' => 'Indonesia'],
            ['country_code' => 'SG', 'country_name' => 'Singapore'],
            ['country_code' => 'MY', 'country_name' => 'Malaysia'],
        ];

        foreach ($rows as $row) {
            Country::updateOrCreate(
                ['country_code' => $row['country_code']],
                ['country_name' => $row['country_name']]
            );
        }
    }
}
