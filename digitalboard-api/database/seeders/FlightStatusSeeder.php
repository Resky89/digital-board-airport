<?php

namespace Database\Seeders;

use App\Models\FlightStatus;
use Illuminate\Database\Seeder;

class FlightStatusSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['status_name' => 'Scheduled'],
            ['status_name' => 'On Time'],
            ['status_name' => 'Delayed'],
            ['status_name' => 'Cancelled'],
            ['status_name' => 'Boarding'],
            ['status_name' => 'Departed'],
            ['status_name' => 'Arrived'],
        ];

        foreach ($rows as $row) {
            FlightStatus::updateOrCreate(
                ['status_name' => $row['status_name']],
                []
            );
        }
    }
}
