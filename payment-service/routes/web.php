<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes — Payment Service
|--------------------------------------------------------------------------
| These serve the checkout UI (Blade views).
| The actual payment API lives in routes/api.php.
|--------------------------------------------------------------------------
*/

// Checkout page (dummy UI for demo / testing)
Route::get('/', function () {
    return view('checkout');
})->name('home');

Route::get('/checkout', function () {
    return view('checkout');
})->name('checkout.index');

// Success landing page
Route::get('/payment-success', function () {
    return view('payment-success');
})->name('payment.success');
