<?php

use Illuminate\Support\Facades\Route;

// 1. Point the home directory directly to your checkout page
Route::get('/', function () {
    return view('checkout');
})->name('home');

// 2. Dedicated checkout URL
Route::get('/checkout', function () {
    return view('checkout');
})->name('checkout.index');

// 3. Receives background notifications from Midtrans
Route::post('/midtrans/callback', [CheckoutController::class, 'callback'])->name('checkout.callback');

// 4. The landing page AFTER you click the fake payment button
Route::get('/payment-success', function () {
    return "<h1>🎉 Payment Success! Your seats are reserved.</h1>";
});