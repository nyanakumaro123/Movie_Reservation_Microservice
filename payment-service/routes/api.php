<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PaymentController;

// Endpoint for your Frontend to request a token
Route::post('/payments/charge', [PaymentController::class, 'charge']);

// Endpoint for Midtrans to send webhooks (callbacks)
Route::post('/payments/callback', [PaymentController::class, 'callback']);