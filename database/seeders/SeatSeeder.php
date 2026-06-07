<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SeatSeeder extends Seeder
{
    public function run(): void
    {
        $rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        $seats = [];
        
        for ($showtimeId = 1; $showtimeId <= 4; $showtimeId++) {
            foreach ($rows as $row) {
                for ($col = 1; $col <= 12; $col++) {
                    $seats[] = [
                        'showtime_id' => $showtimeId,
                        'seat_row' => $row,
                        'seat_number' => $col,
                        'status' => 'available',
                        'locked_by' => null,
                        'locked_until' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
        }
        
        DB::table('seats')->insert($seats);
    }
}