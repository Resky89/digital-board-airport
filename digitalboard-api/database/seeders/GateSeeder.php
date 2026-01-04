<?php

namespace Database\Seeders;

use App\Models\Gate;
use App\Models\Terminal;
use Illuminate\Database\Seeder;

class GateSeeder extends Seeder
{
    public function run(): void
    {
        $map = [
            'T1' => ['A1', 'A2'],
            'T2' => ['B1', 'B2'],
        ];

        foreach ($map as $terminalCode => $gates) {
            $terminalId = Terminal::where('terminal_code', $terminalCode)->value('terminal_id');
            if (!$terminalId) {
                continue;
            }
            foreach ($gates as $code) {
                Gate::updateOrCreate(
                    ['terminal_id' => $terminalId, 'gate_code' => $code],
                    []
                );
            }
        }
    }
}
