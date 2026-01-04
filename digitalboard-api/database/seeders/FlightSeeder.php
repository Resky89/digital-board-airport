<?php

namespace Database\Seeders;

use App\Models\Airline;
use App\Models\Airport;
use App\Models\Flight;
use App\Models\FlightStatus;
use App\Models\Gate;
use App\Models\Terminal;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class FlightSeeder extends Seeder
{
    public function run(): void
    {
        $adminId = User::where('email', 'admin@example.com')->value('id');

        $ga = Airline::where('airline_code', 'GA')->value('airline_id');
        $sq = Airline::where('airline_code', 'SQ')->value('airline_id');

        $cgk = Airport::where('airport_code', 'CGK')->value('airport_id');
        $sin = Airport::where('airport_code', 'SIN')->value('airport_id');

        $t1 = Terminal::where('terminal_code', 'T1')->value('terminal_id');
        $t2 = Terminal::where('terminal_code', 'T2')->value('terminal_id');

        $gA1 = Gate::where('gate_code', 'A1')->where('terminal_id', $t1)->value('gate_id');
        $gB1 = Gate::where('gate_code', 'B1')->where('terminal_id', $t2)->value('gate_id');

        $scheduled = Carbon::now()->addHour();
        $onTimeId = FlightStatus::where('status_name', 'On Time')->value('status_id');
        $scheduledId = FlightStatus::where('status_name', 'Scheduled')->value('status_id');

        if ($ga && $cgk && $sin && $t1 && $gA1 && $scheduledId) {
            Flight::updateOrCreate(
                ['flight_code' => 'GA-100'],
                [
                    'airline_id' => $ga,
                    'origin_airport_id' => $cgk,
                    'destination_airport_id' => $sin,
                    'gate_id' => $gA1,
                    'terminal_id' => $t1,
                    'status_id' => $scheduledId,
                    'flight_type' => 'Departure',
                    'scheduled_time' => $scheduled->toDateTimeString(),
                    'actual_time' => null,
                    'created_by' => $adminId,
                ]
            );
        }

        if ($sq && $cgk && $sin && $t2 && $gB1 && $onTimeId) {
            Flight::updateOrCreate(
                ['flight_code' => 'SQ-200'],
                [
                    'airline_id' => $sq,
                    'origin_airport_id' => $sin,
                    'destination_airport_id' => $cgk,
                    'gate_id' => $gB1,
                    'terminal_id' => $t2,
                    'status_id' => $onTimeId,
                    'flight_type' => 'Arrival',
                    'scheduled_time' => $scheduled->copy()->addHour()->toDateTimeString(),
                    'actual_time' => null,
                    'created_by' => $adminId,
                ]
            );
        }
    }
}
