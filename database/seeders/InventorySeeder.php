<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InventorySeeder extends Seeder
{
    // 🎬 Daftar film populer dari TMDB (bisa diupdate sesuai kebutuhan)
    private array $popularMovies = [
        [
            'title' => 'Avatar: The Way of Water',
            'duration' => 192, // menit
            'genre' => 'Sci-Fi, Adventure',
            'base_price' => 45000,
        ],
        [
            'title' => 'Spider-Man: Across the Spider-Verse',
            'duration' => 140,
            'genre' => 'Animation, Action',
            'base_price' => 40000,
        ],
        [
            'title' => 'Guardians of the Galaxy Vol. 3',
            'duration' => 150,
            'genre' => 'Action, Adventure',
            'base_price' => 42000,
        ],
        [
            'title' => 'Fast X',
            'duration' => 141,
            'genre' => 'Action, Crime',
            'base_price' => 38000,
        ],
        [
            'title' => 'The Little Mermaid',
            'duration' => 135,
            'genre' => 'Family, Fantasy',
            'base_price' => 35000,
        ],
    ];

    // 🏢 Konfigurasi Studio
    private array $studiosConfig = [
        [
            'name' => 'Studio 1',
            'seat_type' => 'Regular',
            'capacity' => 50,
            'rows' => ['A', 'B', 'C', 'D', 'E'],
            'seats_per_row' => 10,
            'price_modifier' => 0,
        ],
        [
            'name' => 'Studio 2',
            'seat_type' => 'Velvet',
            'capacity' => 40,
            'rows' => ['A', 'B', 'C', 'D'],
            'seats_per_row' => 10,
            'price_modifier' => 15000,
        ],
        [
            'name' => 'Studio 3',
            'seat_type' => 'VIP',
            'capacity' => 30,
            'rows' => ['A', 'B', 'C'],
            'seats_per_row' => 10,
            'price_modifier' => 30000,
        ],
    ];

    // 🕐 Jadwal tayang (jam dalam format 24h)
    private array $showtimeSlots = ['13:00', '16:00', '19:00', '21:30'];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Clear existing data (opsional, untuk development)
        DB::table('seat_availability')->truncate();
        DB::table('showtimes')->truncate();
        DB::table('seats')->truncate();
        DB::table('studios')->truncate();
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        echo "🎬 Seeding Inventory Data...\n";

        // 1️⃣ Seed Studios & Seats
        $studios = $this->seedStudiosAndSeats();

        // 2️⃣ Seed Showtimes dengan film populer
        $showtimes = $this->seedShowtimes($studios);

        // 3️⃣ Seed Seat Availability untuk setiap showtime
        $this->seedSeatAvailability($showtimes);

        echo "✅ Inventory seeding completed!\n";
        echo "📊 Summary:\n";
        echo "   - Studios: " . DB::table('studios')->count() . "\n";
        echo "   - Seats: " . DB::table('seats')->count() . "\n";
        echo "   - Showtimes: " . DB::table('showtimes')->count() . "\n";
        echo "   - Seat Availabilities: " . DB::table('seat_availability')->count() . "\n";
    }

    /**
     * Seed studios dan kursi-kursinya
     */
    private function seedStudiosAndSeats(): array
    {
        $studios = [];

        foreach ($this->studiosConfig as $config) {
            // Create Studio
            $studioId = DB::table('studios')->insertGetId([
                'name' => $config['name'],
                'seat_type' => $config['seat_type'],
                'capacity' => $config['capacity'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $studios[] = [
                'id' => $studioId,
                'name' => $config['name'],
                'seat_type' => $config['seat_type'],
                'price_modifier' => $config['price_modifier'],
            ];

            echo "   🏢 Created {$config['name']} ({$config['seat_type']}, {$config['capacity']} seats)\n";

            // Create Seats for this studio
            $seatCount = 0;
            foreach ($config['rows'] as $row) {
                for ($num = 1; $num <= $config['seats_per_row']; $num++) {
                    $label = $row . $num;
                    
                    DB::table('seats')->insert([
                        'studio_id' => $studioId,
                        'row' => $row,
                        'number' => $num,
                        'label' => $label,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $seatCount++;
                }
            }
            echo "      💺 Created {$seatCount} seats (A1 - {$config['rows'][count($config['rows'])-1]}{$config['seats_per_row']})\n";
        }

        return $studios;
    }

    /**
     * Seed showtimes dengan film populer untuk 7 hari ke depan
     */
    private function seedShowtimes(array $studios): array
    {
        $showtimes = [];
        $today = Carbon::today();

        // Generate showtimes untuk 7 hari ke depan
        for ($day = 0; $day < 7; $day++) {
            $showDate = $today->copy()->addDays($day);

            foreach ($studios as $studio) {
                // Setiap studio menampilkan 2-3 film berbeda per hari
                $moviesForDay = array_slice(
                    $this->popularMovies, 
                    ($day + array_search($studio['id'], array_column($studios, 'id'))) % count($this->popularMovies),
                    2
                );

                foreach ($moviesForDay as $movie) {
                    // Setiap film tayang di 2-3 slot waktu
                    $slots = array_slice($this->showtimeSlots, 0, 3);
                    
                    foreach ($slots as $time) {
                        $price = $movie['base_price'] + $studio['price_modifier'];
                        
                        $showtimeId = DB::table('showtimes')->insertGetId([
                            'studio_id' => $studio['id'],
                            'movie_title' => $movie['title'],
                            'show_date' => $showDate->toDateString(),
                            'show_time' => $time,
                            'price' => $price,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);

                        $showtimes[] = [
                            'id' => $showtimeId,
                            'studio_id' => $studio['id'],
                            'movie_title' => $movie['title'],
                            'show_date' => $showDate->toDateString(),
                            'show_time' => $time,
                            'price' => $price,
                        ];

                        echo "   🎥 {$movie['title']} @ {$studio['name']} - {$showDate->format('D, d M')} {$time} (Rp " . number_format($price, 0, ',', '.') . ")\n";
                    }
                }
            }
        }

        return $showtimes;
    }

    /**
     * Seed seat availability untuk setiap kombinasi showtime + seat
     */
    private function seedSeatAvailability(array $showtimes): void
    {
        $batchSize = 100;
        $batch = [];
        $count = 0;

        foreach ($showtimes as $showtime) {
            // Ambil semua kursi dari studio terkait
            $seats = DB::table('seats')
                ->where('studio_id', $showtime['studio_id'])
                ->get();

            foreach ($seats as $seat) {
                $batch[] = [
                    'showtime_id' => $showtime['id'],
                    'seat_id' => $seat->id,
                    'status' => 'available',
                    'locked_until' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $count++;

                // Insert dalam batch untuk performa
                if (count($batch) >= $batchSize) {
                    DB::table('seat_availability')->insert($batch);
                    $batch = [];
                }
            }
        }

        // Insert sisa batch
        if (!empty($batch)) {
            DB::table('seat_availability')->insert($batch);
        }

        echo "   🔐 Created {$count} seat availability records\n";
    }
}