<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SeatController;

// Admin dashboard UI
Route::get('/admin/dashboard', function () {
    return view('admin.dashboard');
})->name('admin.dashboard');

// Redirect root ke dashboard
Route::get('/', function () {
    return redirect('/admin/dashboard');
});

// Health check untuk monitoring
Route::get('/health', function () {
    return response()->json(['status' => 'OK', 'service' => 'inventory-service']);
});