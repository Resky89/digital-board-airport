<?php

namespace Database\Seeders;

use App\Models\Country;
use Illuminate\Database\Seeder;

class CountrySeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            // Southeast Asia
            ['country_code' => 'ID', 'country_name' => 'Indonesia'],
            ['country_code' => 'SG', 'country_name' => 'Singapore'],
            ['country_code' => 'MY', 'country_name' => 'Malaysia'],
            ['country_code' => 'TH', 'country_name' => 'Thailand'],
            ['country_code' => 'PH', 'country_name' => 'Philippines'],
            ['country_code' => 'VN', 'country_name' => 'Vietnam'],
            ['country_code' => 'BN', 'country_name' => 'Brunei'],
            ['country_code' => 'MM', 'country_name' => 'Myanmar'],
            ['country_code' => 'KH', 'country_name' => 'Cambodia'],
            ['country_code' => 'LA', 'country_name' => 'Laos'],
            // East Asia
            ['country_code' => 'JP', 'country_name' => 'Japan'],
            ['country_code' => 'KR', 'country_name' => 'South Korea'],
            ['country_code' => 'CN', 'country_name' => 'China'],
            ['country_code' => 'TW', 'country_name' => 'Taiwan'],
            ['country_code' => 'HK', 'country_name' => 'Hong Kong'],
            ['country_code' => 'MO', 'country_name' => 'Macau'],
            // Middle East
            ['country_code' => 'AE', 'country_name' => 'United Arab Emirates'],
            ['country_code' => 'SA', 'country_name' => 'Saudi Arabia'],
            ['country_code' => 'QA', 'country_name' => 'Qatar'],
            ['country_code' => 'OM', 'country_name' => 'Oman'],
            ['country_code' => 'KW', 'country_name' => 'Kuwait'],
            ['country_code' => 'BH', 'country_name' => 'Bahrain'],
            ['country_code' => 'TR', 'country_name' => 'Turkey'],
            // South Asia
            ['country_code' => 'IN', 'country_name' => 'India'],
            ['country_code' => 'BD', 'country_name' => 'Bangladesh'],
            ['country_code' => 'PK', 'country_name' => 'Pakistan'],
            ['country_code' => 'LK', 'country_name' => 'Sri Lanka'],
            ['country_code' => 'NP', 'country_name' => 'Nepal'],
            // Oceania
            ['country_code' => 'AU', 'country_name' => 'Australia'],
            ['country_code' => 'NZ', 'country_name' => 'New Zealand'],
            // Europe
            ['country_code' => 'GB', 'country_name' => 'United Kingdom'],
            ['country_code' => 'FR', 'country_name' => 'France'],
            ['country_code' => 'DE', 'country_name' => 'Germany'],
            ['country_code' => 'NL', 'country_name' => 'Netherlands'],
            ['country_code' => 'IT', 'country_name' => 'Italy'],
            ['country_code' => 'ES', 'country_name' => 'Spain'],
            ['country_code' => 'CH', 'country_name' => 'Switzerland'],
            // Americas
            ['country_code' => 'US', 'country_name' => 'United States'],
            ['country_code' => 'CA', 'country_name' => 'Canada'],
            ['country_code' => 'BR', 'country_name' => 'Brazil'],
        ];

        foreach ($rows as $row) {
            Country::updateOrCreate(
                ['country_code' => $row['country_code']],
                ['country_name' => $row['country_name']]
            );
        }
    }
}
