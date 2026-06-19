const mysql = require("mysql2/promise");

// Konfigurasi koneksi — dibaca dari environment variable
const dbConfig = {
  host:     process.env.DB_HOST     || "localhost",
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "booking_db",
};

let pool = null;

// Buat koneksi pool
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit:    10,
    });
  }
  return pool;
}

// Jalankan query
async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

// Buat tabel jika belum ada — dijalankan saat server start
async function initDB() {
  console.log("[DB] Menghubungkan ke MySQL...");

  // Retry sampai MySQL siap (penting untuk Docker)
  for (let i = 0; i < 10; i++) {
    try {
      await getPool().execute("SELECT 1");
      console.log("[DB] Koneksi MySQL berhasil");
      break;
    } catch (err) {
      console.log(`[DB] MySQL belum siap, mencoba lagi... (${i + 1}/10)`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  // Buat tabel bookings
  await query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      booking_id   VARCHAR(20)    NOT NULL UNIQUE,
      user_id      VARCHAR(100)   NOT NULL,
      user_name    VARCHAR(255)   NOT NULL,
      showtime_id  INT            NOT NULL,
      seat_id      INT            NOT NULL,
      seat_label   VARCHAR(10)    NOT NULL,
      movie_title  VARCHAR(255)   NOT NULL,
      studio_name  VARCHAR(100)   NOT NULL,
      show_date    DATE           NOT NULL,
      show_time    TIME           NOT NULL,
      price        DECIMAL(10,2)  NOT NULL,
      status       ENUM('PENDING','SUCCESS','EXPIRED') DEFAULT 'PENDING',
      qr_code      VARCHAR(255)   NULL,
      expired_at   DATETIME       NOT NULL,
      paid_at      DATETIME       NULL,
      created_at   DATETIME       DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("[DB] Tabel bookings siap");
}

module.exports = { query, initDB };