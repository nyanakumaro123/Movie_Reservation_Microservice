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
        Schema::create('studios', function (Blueprint $table) {
            $table->id();
            $table->string('name');           // "Studio 1", "Studio 2"
            $table->string('seat_type');      // "Regular", "Velvet", "VIP"
            $table->integer('capacity');      // total kursi
            $table->timestamps();
        });


        Schema::create('seats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('studio_id')->constrained()->cascadeOnDelete();
            $table->string('row');            // "A", "B", "C"
            $table->integer('number');        // 1, 2, 3
            $table->string('label');          // "A1", "A2" — untuk tampilan
            $table->timestamps();
        });


        Schema::create('showtimes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('studio_id')->constrained()->cascadeOnDelete();
            $table->string('movie_title');    // simpel: langsung simpan judul film
            $table->date('show_date');
            $table->time('show_time');        // "13:00", "16:00", "19:00"
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });


        Schema::create('seat_availability', function (Blueprint $table) {
            $table->id();
            $table->foreignId('showtime_id')->constrained()->cascadeOnDelete();
            $table->foreignId('seat_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['available', 'locked', 'booked'])->default('available');
            $table->timestamp('locked_until')->nullable(); // waktu expired lock
            $table->timestamps();

            // Satu kursi hanya boleh punya satu status per jadwal
            $table->unique(['showtime_id', 'seat_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seat_availability');
        Schema::dropIfExists('showtimes');
        Schema::dropIfExists('seats');
        Schema::dropIfExists('studios');
    }
};
