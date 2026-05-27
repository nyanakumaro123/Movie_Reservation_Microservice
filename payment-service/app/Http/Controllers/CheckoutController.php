<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CheckoutController;

// Ensure this points to the array class syntax
Route::get('/', [CheckoutController::class, 'index'])->name('checkout.index');

Route::get('/payment-success', function () {
    return "<h1>🎉 Payment Success! Your seats are reserved.</h1>";
});