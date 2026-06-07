<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SeatController;

// API endpoints untuk service lain (Booking, Payment)
Route::get('/seats/{showtimeId}', [SeatController::class, 'index']);
Route::post('/seats/reserve', [SeatController::class, 'reserve']);
Route::post('/seats/confirm', [SeatController::class, 'confirm']);