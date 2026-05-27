<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// Tidak butuh token
Route::post('/api/auth/register', [AuthController::class, 'register']);
Route::post('/api/auth/login',    [AuthController::class, 'login']);

// Butuh token
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/api/auth/me', [AuthController::class, 'me']);
});