<?php

namespace Database\Seeders;

use App\Models\Terminal;
use Illuminate\Database\Seeder;

class TerminalSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['terminal_code' => 'T1', 'terminal_name' => 'Terminal 1', 'description' => null],
            ['terminal_code' => 'T2', 'terminal_name' => 'Terminal 2', 'description' => null],
        ];

        foreach ($rows as $row) {
            Terminal::updateOrCreate(
                ['terminal_code' => $row['terminal_code']],
                ['terminal_name' => $row['terminal_name'], 'description' => $row['description']]
            );
        }
    }
}
