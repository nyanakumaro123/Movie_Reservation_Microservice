<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\InventoryController;

// Tidak butuh token
// Route::post('/api/auth/register', [AuthController::class, 'register']);
// Route::post('/api/auth/login',    [AuthController::class, 'login']);

// Butuh token
// Route::middleware('auth:sanctum')->group(function () {
    Route::get('/api/auth/me', [AuthController::class, 'me']);

    Route::get('/api/inventory/studios',              [InventoryController::class, 'studios']);
    Route::get('/api/inventory/showtimes',            [InventoryController::class, 'showtimes']);
    Route::get('/api/inventory/showtimes/{id}/seats', [InventoryController::class, 'seats']);
    Route::post('/api/inventory/seats/lock',          [InventoryController::class, 'lockSeat']);
    Route::post('/api/inventory/seats/book',          [InventoryController::class, 'bookSeat']);
    Route::post('/api/inventory/seats/release',       [InventoryController::class, 'releaseSeat']);
// });
