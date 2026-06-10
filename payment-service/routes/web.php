<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes — Headless Backend
|--------------------------------------------------------------------------
| Views have been extracted to the Front End service.
| This service now strictly serves the API on /api.
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return response()->json([
        'service' => 'payment-service',
        'status' => 'active',
        'message' => 'This is a headless API. Please use the /api endpoints.'
    ]);
});