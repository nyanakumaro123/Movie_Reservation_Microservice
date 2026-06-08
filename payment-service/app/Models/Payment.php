<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
    'order_id',
    'amount',
    'status',
    'payment_status',
    'snap_token',
    'method',
    'user_id',
    'card_last4',
];

    protected $casts = [
        'amount' => 'float',
    ];
}
