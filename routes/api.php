<?php

use App\Http\Controllers\SeatController;

Route::get('/seats/{showtimeId}', [SeatController::class, 'index']);
Route::post('/seats/reserve', [SeatController::class, 'reserve']);
Route::post('/seats/confirm', [SeatController::class, 'confirm']);
