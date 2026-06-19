const express  = require("express");
const axios    = require("axios");
const cors     = require("cors");
const { v4: uuidv4 } = require("uuid");
const { query, initDB } = require("./db");

const app               = express();
const PORT              = process.env.PORT || 9000;
const INVENTORY_SERVICE = process.env.INVENTORY_SERVICE_URL || "http://coba_microservices.test";

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────
//  Helper: Hubungi Inventory Service
// ─────────────────────────────────────────────────────

async function callInventory(method, path, data = null) {
  const response = await axios({
    method,
    url:     `${INVENTORY_SERVICE}/api/inventory${path}`,
    data,
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    timeout: 5000,
  });
  return response.data;
}

function generateQRCode(bookingId) {
  return `CINERESERVE-${bookingId.toUpperCase()}`;
}

function getExpiredAt() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 10);
  // Format untuk MySQL: "YYYY-MM-DD HH:MM:SS"
  return d.toISOString().slice(0, 19).replace("T", " ");
}

// ═════════════════════════════════════════════════════
//  POST /bookings/create
//  Buat booking baru — kunci kursi di Inventory
// ═════════════════════════════════════════════════════

app.post("/bookings/create", async (req, res) => {
  const { showtime_id, seat_id, user_id, user_name } = req.body;

  if (!showtime_id || !seat_id || !user_id || !user_name) {
    return res.status(422).json({
      message: "showtime_id, seat_id, user_id, dan user_name wajib diisi",
    });
  }

  console.log(`[Booking] Membuat booking — user: ${user_name}, showtime: ${showtime_id}, kursi: ${seat_id}`);

  try {
    // ── Step 1: Kunci kursi di Inventory ──
    await callInventory("POST", "/seats/lock", { showtime_id, seat_id });

    // ── Step 2: Ambil detail jadwal dari Inventory ──
    const showtimeData = await callInventory("GET", `/showtimes/${showtime_id}/seats`);
    const showtime     = showtimeData.showtime;
    const seat         = showtimeData.seats.find(s => s.seat_id === seat_id);

    // ── Step 3: Simpan booking ke MySQL ──
    const bookingId  = uuidv4().substring(0, 8).toUpperCase();
    const expiredAt  = getExpiredAt();
    const seatLabel  = seat ? seat.label : `#${seat_id}`;

    await query(
      `INSERT INTO bookings
        (booking_id, user_id, user_name, showtime_id, seat_id, seat_label,
         movie_title, studio_name, show_date, show_time, price, status, expired_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
      [
        bookingId, user_id, user_name, showtime_id, seat_id, seatLabel,
        showtime.movie_title, showtime.studio_name,
        showtime.show_date, showtime.show_time,
        Number(showtime.price), expiredAt,
      ]
    );

    // Ambil data yang baru disimpan
    const [booking] = await query(
      "SELECT * FROM bookings WHERE booking_id = ?", [bookingId]
    );

    console.log(`[Booking] Booking dibuat: ${bookingId}`);

    return res.status(201).json({
      message: "Booking berhasil dibuat. Selesaikan pembayaran dalam 10 menit.",
      booking,
    });

  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json({
        message: err.response.data.message || "Gagal mengunci kursi",
      });
    }
    console.error("[Booking] Error:", err.message);
    return res.status(503).json({ message: "Gagal membuat booking: " + err.message });
  }
});

// ═════════════════════════════════════════════════════
//  POST /bookings/:bookingId/pay
//  Konfirmasi pembayaran → status SUCCESS + e-ticket
// ═════════════════════════════════════════════════════

app.post("/bookings/:bookingId/pay", async (req, res) => {
  const { bookingId } = req.params;

  const [booking] = await query(
    "SELECT * FROM bookings WHERE booking_id = ?", [bookingId]
  );

  if (!booking) {
    return res.status(404).json({ message: "Booking tidak ditemukan" });
  }
  if (booking.status === "SUCCESS") {
    return res.status(409).json({ message: "Booking ini sudah dibayar" });
  }
  if (booking.status === "EXPIRED" || new Date() > new Date(booking.expired_at)) {
    await query("UPDATE bookings SET status = 'EXPIRED' WHERE booking_id = ?", [bookingId]);
    await callInventory("POST", "/seats/release", {
      showtime_id: booking.showtime_id,
      seat_id:     booking.seat_id,
    }).catch(() => {});
    return res.status(409).json({ message: "Booking sudah expired" });
  }

  console.log(`[Booking] Memproses pembayaran: ${bookingId}`);

  try {
    // Booking permanen di Inventory
    await callInventory("POST", "/seats/book", {
      showtime_id: booking.showtime_id,
      seat_id:     booking.seat_id,
    });

    const paidAt  = new Date().toISOString().slice(0, 19).replace("T", " ");
    const qrCode  = generateQRCode(bookingId);

    await query(
      "UPDATE bookings SET status = 'SUCCESS', paid_at = ?, qr_code = ? WHERE booking_id = ?",
      [paidAt, qrCode, bookingId]
    );

    const [updated] = await query(
      "SELECT * FROM bookings WHERE booking_id = ?", [bookingId]
    );

    console.log(`[Booking] Pembayaran sukses: ${bookingId}`);

    return res.status(200).json({
      message: "Pembayaran berhasil! E-Ticket siap.",
      ticket: {
        booking_id:  updated.booking_id,
        qr_code:     updated.qr_code,
        user_name:   updated.user_name,
        movie_title: updated.movie_title,
        studio_name: updated.studio_name,
        show_date:   updated.show_date,
        show_time:   updated.show_time,
        seat_label:  updated.seat_label,
        price:       updated.price,
        paid_at:     updated.paid_at,
        status:      updated.status,
      },
    });

  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json({
        message: err.response.data.message,
      });
    }
    return res.status(503).json({ message: "Gagal konfirmasi ke Inventory" });
  }
});

// ═════════════════════════════════════════════════════
//  POST /bookings/:bookingId/cancel
//  Batalkan booking — lepas lock kursi
// ═════════════════════════════════════════════════════

app.post("/bookings/:bookingId/cancel", async (req, res) => {
  const { bookingId } = req.params;

  const [booking] = await query(
    "SELECT * FROM bookings WHERE booking_id = ?", [bookingId]
  );

  if (!booking) {
    return res.status(404).json({ message: "Booking tidak ditemukan" });
  }
  if (booking.status === "SUCCESS") {
    return res.status(409).json({ message: "Booking yang sudah dibayar tidak bisa dibatalkan" });
  }

  await callInventory("POST", "/seats/release", {
    showtime_id: booking.showtime_id,
    seat_id:     booking.seat_id,
  }).catch(() => {});

  await query(
    "UPDATE bookings SET status = 'EXPIRED' WHERE booking_id = ?", [bookingId]
  );

  console.log(`[Booking] Booking dibatalkan: ${bookingId}`);

  return res.status(200).json({ message: "Booking berhasil dibatalkan" });
});

// ═════════════════════════════════════════════════════
//  GET /bookings/:bookingId
//  Ambil detail satu booking
// ═════════════════════════════════════════════════════

app.get("/bookings/:bookingId", async (req, res) => {
  const { bookingId } = req.params;

  const [booking] = await query(
    "SELECT * FROM bookings WHERE booking_id = ?", [bookingId]
  );

  if (!booking) {
    return res.status(404).json({ message: "Booking tidak ditemukan" });
  }

  return res.status(200).json(booking);
});

// ═════════════════════════════════════════════════════
//  GET /bookings/user/:userId
//  Ambil semua booking milik satu user
// ═════════════════════════════════════════════════════

app.get("/bookings/user/:userId", async (req, res) => {
  const bookingList = await query(
    "SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC",
    [req.params.userId]
  );

  return res.status(200).json(bookingList);
});

// ─────────────────────────────────────────────────────
//  Start server — init DB dulu baru listen
// ─────────────────────────────────────────────────────

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Booking Service jalan di http://localhost:${PORT}`);
    console.log(`Inventory  : ${INVENTORY_SERVICE}`);
  });
}).catch(err => {
  console.error("[FATAL] Gagal inisialisasi database:", err.message);
  process.exit(1);
});