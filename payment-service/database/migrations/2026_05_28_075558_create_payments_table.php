<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('order_id')->unique();           // reservation/booking ID from booking-service
            $table->decimal('amount', 12, 2);               // payment amount in IDR
            $table->string('status')->default('pending');   // pending | success | failed | expired | refunded
            $table->string('snap_token')->nullable();       // dummy token (or real Midtrans token later)
            $table->string('method')->nullable();           // CREDIT_CARD | DEBIT_CARD | BANK_TRANSFER | E_WALLET | CASH
            $table->string('user_id')->nullable();          // user reference from user/auth service
            $table->string('card_last4')->nullable();       // last 4 digits of card (dummy)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
