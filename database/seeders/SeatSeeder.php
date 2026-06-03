<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SeatSeeder extends Seeder
{
    public function run()
    {
        $rows = ['A', 'B', 'C', 'D', 'E'];

        foreach ($rows as $row) {
            for ($i = 1; $i <= 10; $i++) {
                DB::table('seats')->insert([
                    'showtime_id' => 1,
                    'seat_row' => $row,
                    'seat_number' => $i,
                    'status' => 'available',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
