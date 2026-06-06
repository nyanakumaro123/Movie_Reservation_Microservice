<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('payments', function (Blueprint $table) {
        $table->id();
        $table->string('order_id')->unique();
        $table->decimal('amount', 10, 2);
        $table->string('status')->default('pending'); // pending, success, failed, expired
        $table->string('snap_token')->nullable();
        // Add any other fields you need, like user_id or booking_id
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
