<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', function (Request $request) {
    $email = $request->input('email');
    $password = $request->input('password');

    // 1. Simulasi Akun ADMIN (Bisa kelola film)
    if ($email === 'admin@cinereserve.com' && $password === 'admin123') {
        return response()->json([
            'status' => 'success',
            'message' => 'Login Berhasil sebagai Admin',
            'user' => [
                'name' => 'Siti (Admin)',
                'role' => 'admin'
            ],
            'token' => 'mock-token-admin-xyz' // Token khusus admin
        ], 200);
    }

    // 2. Simulasi Akun USER (Bisa booking tiket)
    if ($email === 'user@cinereserve.com' && $password === 'user123') {
        return response()->json([
            'status' => 'success',
            'message' => 'Login Berhasil sebagai Pengguna',
            'user' => [
                'name' => 'Budi (User)',
                'role' => 'user'
            ],
            'token' => 'mock-token-user-abc' // Token khusus user
        ], 200);
    }

    return response()->json([
        'status' => 'error',
        'message' => 'Email atau password salah!'
    ], 401);
});