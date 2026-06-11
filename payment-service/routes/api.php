<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PaymentController;

/*
|--------------------------------------------------------------------------
| Payment Service — API Routes
|--------------------------------------------------------------------------
| All routes are prefixed with /api automatically by Laravel.
|
| Base URL (via Docker / API Gateway): http://payment-nginx:80/api/...
| Local test URL: http://localhost:8003/api/...
|--------------------------------------------------------------------------
*/

// Health check (for API Gateway and Docker healthcheck)
Route::get('/payments/health', [PaymentController::class, 'health']);

// Create & process a payment (called by frontend or booking-service)
Route::post('/payments/charge', [PaymentController::class, 'charge']);

// Webhook / callback endpoint (simulated — called after payment completes)
Route::post('/payments/callback', [PaymentController::class, 'callback']);

// List all payments (supports ?status= ?order_id= ?user_id= filters)
Route::get('/payments', [PaymentController::class, 'index']);

// Get a single payment by ID or order_id
Route::get('/payments/{id}', [PaymentController::class, 'show']);

// Refund a payment
Route::post('/payments/{id}/refund', [PaymentController::class, 'refund']);