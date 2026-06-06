<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Payment;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Payment::create([
            'order_id' => 'BOOK-001',
            'amount' => 120000,
            'status' => 'success',
            'snap_token' => 'DUMMY-123456',
            'method' => 'CREDIT_CARD',
            'user_id' => 'USER-1',
            'card_last4' => '1234',
        ]);

        Payment::create([
            'order_id' => 'BOOK-002',
            'amount' => 150000,
            'status' => 'failed',
            'method' => 'DEBIT_CARD',
            'user_id' => 'USER-2',
            'card_last4' => '0000',
        ]);

        // Call additional seeders if present
        $this->call([
            PaymentSeeder::class,
        ]);
    }
}