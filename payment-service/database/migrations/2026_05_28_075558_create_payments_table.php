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

            $table->string('order_id')->unique();           
            $table->decimal('amount', 12, 2);

            // Existing payment status
            $table->string('status')->default('pending');

            // New payment_status field
            $table->string('payment_status')->default('unpaid');
            // unpaid | paid | failed | refunded

            $table->string('snap_token')->nullable();
            $table->string('method')->nullable();
            $table->string('user_id')->nullable();
            $table->string('card_last4')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};