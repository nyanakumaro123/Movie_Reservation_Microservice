const express = require("express");
const axios   = require("axios");
const cors    = require("cors"); 

const app            = express();
const GATEWAY_PORT   = 3000;
const AUTH_SERVICE   = "http://movie_reservation_microservice.test"; // URL Laravel kamu
const INVENTORY_SERVICE = "http://coba_microservices.test"; // URL Inventory Service kamu

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
//  Setiap request ke /auth/* diteruskan ke Laravel
// ─────────────────────────────────────────────

app.all("/auth/*", async (req, res) => {
  const targetURL = AUTH_SERVICE + "/api" + req.path;

  console.log(`[Gateway] ${req.method} ${req.path}  →  ${targetURL}`);

  try {
    const response = await axios({
      method:  req.method,
      url:     targetURL,
      data:    req.body,
      headers: {
        "Content-Type":  "application/json",
        "Accept":        "application/json",
        // Teruskan token Authorization kalau ada
        ...(req.headers.authorization && {
          Authorization: req.headers.authorization,
        }),
      },
    });

    res.status(response.status).json(response.data);

  } catch (err) {
    // Kalau Laravel membalas error (misal 401, 422)
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    // Kalau Laravel tidak bisa dihubungi sama sekali
    res.status(503).json({ message: "Auth service tidak bisa dihubungi" });
  }
});

app.all("/inventory/*", async (req, res) => {
  const targetURL = INVENTORY_SERVICE + "/api" + req.path;

  console.log(`[Gateway] ${req.method} ${req.path}  →  ${targetURL}`);

  try {
    const response = await axios({
      method:  req.method,
      url:     targetURL,
      data:    req.body,
      headers: {
        "Content-Type":  "application/json",
        "Accept":        "application/json",
        // Teruskan token Authorization kalau ada
        ...(req.headers.authorization && {
          Authorization: req.headers.authorization,
        }),
      },
    });

    res.status(response.status).json(response.data);

  } catch (err) {
    // Kalau Laravel membalas error (misal 401, 422)
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    // Kalau Laravel tidak bisa dihubungi sama sekali
    res.status(503).json({ message: "Inventory service tidak bisa dihubungi" });
  }
});

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
});