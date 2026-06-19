const { query, initDB } = require("./db");

// ── Data awal bookings ────────────────────────────────

const bookings = [
  {
    booking_id:  "BOOK0001",
    user_id:     "user-001",
    user_name:   "Budi Santoso",
    showtime_id: 1,
    seat_id:     1,
    seat_label:  "A1",
    movie_title: "Avatar: The Way of Water",
    studio_name: "Studio 1",
    show_date:   "2025-07-01",
    show_time:   "13:00:00",
    price:       45000,
    status:      "SUCCESS",
    qr_code:     "CINERESERVE-BOOK0001",
    expired_at:  "2025-07-01 13:10:00",
    paid_at:     "2025-07-01 13:05:00",
  },
  {
    booking_id:  "BOOK0002",
    user_id:     "user-002",
    user_name:   "Ani Wijaya",
    showtime_id: 1,
    seat_id:     2,
    seat_label:  "A2",
    movie_title: "Avatar: The Way of Water",
    studio_name: "Studio 1",
    show_date:   "2025-07-01",
    show_time:   "13:00:00",
    price:       45000,
    status:      "PENDING",
    qr_code:     null,
    expired_at:  "2025-07-01 13:10:00",
    paid_at:     null,
  },
  {
    booking_id:  "BOOK0003",
    user_id:     "user-001",
    user_name:   "Budi Santoso",
    showtime_id: 4,
    seat_id:     51,
    seat_label:  "A1",
    movie_title: "Inception",
    studio_name: "Studio 2",
    show_date:   "2025-07-01",
    show_time:   "14:00:00",
    price:       85000,
    status:      "SUCCESS",
    qr_code:     "CINERESERVE-BOOK0003",
    expired_at:  "2025-07-01 14:10:00",
    paid_at:     "2025-07-01 14:03:00",
  },
  {
    booking_id:  "BOOK0004",
    user_id:     "user-003",
    user_name:   "Dika Pratama",
    showtime_id: 2,
    seat_id:     5,
    seat_label:  "A5",
    movie_title: "Avatar: The Way of Water",
    studio_name: "Studio 1",
    show_date:   "2025-07-01",
    show_time:   "16:00:00",
    price:       45000,
    status:      "EXPIRED",
    qr_code:     null,
    expired_at:  "2025-07-01 16:10:00",
    paid_at:     null,
  },
];

// ── Jalankan seeder ───────────────────────────────────

async function seed() {
  console.log("🌱 Menjalankan seeder...");

  // Init database dulu (buat tabel jika belum ada)
  await initDB();

  // Kosongkan tabel dulu agar tidak duplikat
  await query("DELETE FROM bookings");
  console.log("🗑️  Tabel bookings dikosongkan");

  // Insert semua data
  for (const booking of bookings) {
    await query(
      `INSERT INTO bookings
        (booking_id, user_id, user_name, showtime_id, seat_id, seat_label,
         movie_title, studio_name, show_date, show_time, price,
         status, qr_code, expired_at, paid_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        booking.booking_id,
        booking.user_id,
        booking.user_name,
        booking.showtime_id,
        booking.seat_id,
        booking.seat_label,
        booking.movie_title,
        booking.studio_name,
        booking.show_date,
        booking.show_time,
        booking.price,
        booking.status,
        booking.qr_code,
        booking.expired_at,
        booking.paid_at,
      ]
    );
    console.log(`✅ Inserted: ${booking.booking_id} — ${booking.user_name} (${booking.status})`);
  }

  console.log("\n📊 Seeder selesai!");
  console.log(`   Total booking: ${bookings.length}`);
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seeder gagal:", err.message);
  process.exit(1);
});