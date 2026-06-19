const express = require("express");
const axios   = require("axios");
const cors    = require("cors"); 
const CircuitBreaker = require("opossum");

const app            = express();
const GATEWAY_PORT   = process.env.PORT || 8080;
const AUTH_SERVICE   = process.env.AUTH_SERVICE_URL || "http://movie_reservation_microservice.test"; // URL Laravel kamu
const INVENTORY_SERVICE = process.env.INVENTORY_SERVICE_URL || "http://coba_microservices.test"; // URL Inventory Service kamu
const BOOKING_SERVICE   = process.env.BOOKING_SERVICE_URL   || "http://localhost:9000";

app.use(cors());
app.use(express.json());

// const breakerOptions = {
//   timeout: 5000,                // Jika request menggantung > 5 detik, anggap gagal
//   errorThresholdPercentage: 50, // Jika 50% request gagal dalam window waktu tertentu, sirkuit Terbuka (OPEN)
//   resetTimeout: 10000           // Tunggu 10 detik sebelum mencoba kembali ke mode HALF-OPEN
// };

// async function httpRequestTarget(config) {
//   return await axios(config);
// }

// const authBreaker = new CircuitBreaker(httpRequestTarget, breakerOptions);
// const inventoryBreaker = new CircuitBreaker(httpRequestTarget, breakerOptions);
// const bookingBreaker   = new CircuitBreaker(httpRequestTarget, breakerOptions);

// authBreaker.fallback(() => ({ isFallback: true, message: "Auth Service sedang mengalami gangguan. Silakan coba sesaat lagi." }));
// inventoryBreaker.fallback(() => ({ isFallback: true, message: "Inventory Service sedang mengalami gangguan. Silakan coba sesaat lagi." }));
// bookingBreaker.fallback(()   => ({ isFallback: true, message: "Booking Service sedang mengalami gangguan. Silakan coba sesaat lagi." }));

// authBreaker.on('open', () => console.warn('--> [CB AUTH]: OPEN (Mulai memutus aliran)'));
// authBreaker.on('close', () => console.log('--> [CB AUTH]: CLOSED (Kembali normal)'));
// inventoryBreaker.on('open', () => console.warn('--> [CB INVENTORY]: OPEN (Mulai memutus aliran)'));
// inventoryBreaker.on('close', () => console.log('--> [CB INVENTORY]: CLOSED (Kembali normal)'));
// bookingBreaker.on('open',   () => console.warn('--> [CB BOOKING]: OPEN (Mulai memutus aliran)'));  
// bookingBreaker.on('close',  () => console.log('--> [CB BOOKING]: CLOSED (Kembali normal)'));      

// async function forwardWithBreaker(breakerInstance, req, res, targetURL) {
//   console.log(`[Gateway via CB] ${req.method} ${req.path}  →  ${targetURL}`);
  
//   // Susun konfigurasi axios
//   const axiosConfig = {
//     method:  req.method,
//     url:     targetURL,
//     data:    req.body,
//     params:  req.query,
//     headers: {
//       "Content-Type": "application/json",
//       "Accept":       "application/json",
//       ...(req.headers.authorization && {
//         Authorization: req.headers.authorization,
//       }),
//     },
//   };

//   try {
//     // Jalankan request lewat perantara Circuit Breaker (.fire)
//     const response = await breakerInstance.fire(axiosConfig);

//     // Cek jika yang mengembalikan data adalah fungsi fallback
//     if (response && response.isFallback) {
//       return res.status(503).json({ message: response.message });
//     }

//     // Jika sukses dari server target asli
//     res.status(response.status).json(response.data);

//   } catch (err) {
//     // Jika server target merespon dengan error HTTP biasa (401, 422, 404, dll)
//     // Opossum default-nya menganggap ini "error", tapi kita tetap harus teruskan status aslinya ke frontend
//     if (err.response) {
//       return res.status(err.response.status).json(err.response.data);
//     }
    
//     // Jika terjadi error koneksi fatal di luar handle Opossum
//     res.status(500).json({ message: "Terjadi kesalahan internal pada Gateway" });
//   }
// }

// ─────────────────────────────────────────────
//  Setiap request ke /auth/* diteruskan ke Laravel
// ─────────────────────────────────────────────

async function forward(req, res, targetURL) {
  console.log(`[Gateway] ${req.method} ${req.path}  →  ${targetURL}`);
  try {
    const response = await axios({
      method:  req.method,
      url:     targetURL,
      data:    req.body,
      params:  req.query,
      headers: {
        "Content-Type": "application/json",
        "Accept":       "application/json",
        ...(req.headers.authorization && {
          Authorization: req.headers.authorization,
        }),
      },
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    res.status(503).json({ message: "Service tidak bisa dihubungi" });
  }
}

app.all("/auth/*", (req, res) => {
  forward(req, res, AUTH_SERVICE + "/api" + req.path);
});
 
// Inventory Service → Laravel (pakai prefix /api)
app.all("/inventory/*", (req, res) => {
  forward(req, res, INVENTORY_SERVICE + "/api" + req.path);
});
 
// Booking Service → Express (TIDAK pakai prefix /api)
// Penting: gunakan /bookings/* bukan /booking/*
app.all("/bookings/*", (req, res) => {
  forward(req, res, BOOKING_SERVICE + req.path);
});

// app.all("/auth/*", async (req, res) => {
//   const targetURL = AUTH_SERVICE + "/api" + req.path;

//   console.log(`[Gateway] ${req.method} ${req.path}  →  ${targetURL}`);

//   try {
//     const response = await axios({
//       method:  req.method,
//       url:     targetURL,
//       data:    req.body,
//       headers: {
//         "Content-Type":  "application/json",
//         "Accept":        "application/json",
//         // Teruskan token Authorization kalau ada
//         ...(req.headers.authorization && {
//           Authorization: req.headers.authorization,
//         }),
//       },
//     });

//     res.status(response.status).json(response.data);

//   } catch (err) {
//     // Kalau Laravel membalas error (misal 401, 422)
//     if (err.response) {
//       return res.status(err.response.status).json(err.response.data);
//     }
//     // Kalau Laravel tidak bisa dihubungi sama sekali
//     res.status(503).json({ message: "Auth service tidak bisa dihubungi" });
//   }
// });

// app.all("/inventory/*", async (req, res) => {
//   const targetURL = INVENTORY_SERVICE + "/api" + req.path;

//   console.log(`[Gateway] ${req.method} ${req.path}  →  ${targetURL}`);

//   try {
//     const response = await axios({
//       method:  req.method,
//       url:     targetURL,
//       data:    req.body,
//       headers: {
//         "Content-Type":  "application/json",
//         "Accept":        "application/json",
//         // Teruskan token Authorization kalau ada
//         ...(req.headers.authorization && {
//           Authorization: req.headers.authorization,
//         }),
//       },
//     });

//     res.status(response.status).json(response.data);

//   } catch (err) {
//     // Kalau Laravel membalas error (misal 401, 422)
//     if (err.response) {
//       return res.status(err.response.status).json(err.response.data);
//     }
//     // Kalau Laravel tidak bisa dihubungi sama sekali
//     res.status(503).json({ message: "Inventory service tidak bisa dihubungi" });
//   }
// });

// app.all("/booking/*", async (req, res) => {
//   const targetURL = BOOKING_SERVICE + req.path;

//   console.log(`[Gateway] ${req.method} ${req.path}  →  ${targetURL}`);

//   try {
//     const response = await axios({
//       method:  req.method,
//       url:     targetURL,
//       data:    req.body,
//       headers: {
//         "Content-Type":  "application/json",
//         "Accept":        "application/json",
//         // Teruskan token Authorization kalau ada
//         ...(req.headers.authorization && {
//           Authorization: req.headers.authorization,
//         }),
//       },
//     });

//     res.status(response.status).json(response.data);

//   } catch (err) {
//     // Kalau Laravel membalas error (misal 401, 422)
//     if (err.response) {
//       return res.status(err.response.status).json(err.response.data);
//     }
//     // Kalau Laravel tidak bisa dihubungi sama sekali
//     res.status(503).json({ message: "Booking service tidak bisa dihubungi" });
//   }
// });




// app.all("/auth/*", (req, res) => {
//   const targetURL = AUTH_SERVICE + "/api" + req.path;
//   forwardWithBreaker(authBreaker, req, res, targetURL);
// });

// app.all("/inventory/*", (req, res) => {
//   const targetURL = INVENTORY_SERVICE + "/api" + req.path;
//   forwardWithBreaker(inventoryBreaker, req, res, targetURL);
// });

// app.all("/bookings/*", (req, res) => {
//   forwardWithBreaker(bookingBreaker, req, res, BOOKING_SERVICE + req.path); // ← tambah ini
// });





// async function forward(req, res, targetURL) {
//   console.log(`[Gateway] ${req.method} ${req.path}  →  ${targetURL}`);
//   try {
//     const response = await axios({
//       method:  req.method,
//       url:     targetURL,
//       data:    req.body,
//       params:  req.query,
//       headers: {
//         "Content-Type": "application/json",
//         "Accept":       "application/json",
//         ...(req.headers.authorization && {
//           Authorization: req.headers.authorization,
//         }),
//       },
//     });
//     res.status(response.status).json(response.data);
//   } catch (err) {
//     if (err.response) {
//       return res.status(err.response.status).json(err.response.data);
//     }
//     res.status(503).json({ message: "Service tidak bisa dihubungi" });
//   }
// }
 
// app.all("/auth/*", (req, res) => {
//   forward(req, res, AUTH_SERVICE + "/api" + req.path);
// });

 
// app.all("/inventory/*", (req, res) => {
//   forward(req, res, INVENTORY_SERVICE + "/api" + req.path);
// });

// ─────────────────────────────────────────────
//  Jalankan Gateway
// ─────────────────────────────────────────────

app.listen(GATEWAY_PORT, () => {
  console.log(`Gateway jalan di http://localhost:${GATEWAY_PORT}`);
  console.log(`Meneruskan /auth/* ke ${AUTH_SERVICE}/api/auth/*`);
  console.log(`Meneruskan /inventory/* ke ${INVENTORY_SERVICE}/api/inventory/*`);
  console.log(`Booking    : ${BOOKING_SERVICE}`);
});