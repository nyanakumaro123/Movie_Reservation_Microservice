<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Buat akun admin
        User::updateOrCreate(
            ['email' => 'admin@cinereserve.com'],
            [
                'name'     => 'Admin CineReserve',
                'password' => Hash::make('admin123'),
                'role'     => 'admin',
            ]
        );

        // Buat akun user biasa
        User::updateOrCreate(
            ['email' => 'user@cinereserve.com'],
            [
                'name'     => 'Budi Santoso',
                'password' => Hash::make('user123'),
                'role'     => 'user',
            ]
        );

        echo "✅ User seeder selesai\n";
        echo "   Admin : admin@cinereserve.com / admin123\n";
        echo "   User  : user@cinereserve.com  / user123\n";
    }
}