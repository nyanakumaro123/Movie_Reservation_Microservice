<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure CORS settings for your Laravel application.
    | This configuration is used to handle preflight requests automatically.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:8080',      // API Gateway
        'http://127.0.0.1:8080',      // API Gateway (localhost)
        'http://localhost:3000',      // Frontend (jika ada)
        'http://localhost:*',         // Any localhost port
        '*',                           // Allow all origins (development only)
    ],

    'allowed_origins_patterns' => ['*'],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
