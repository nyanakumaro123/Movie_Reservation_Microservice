const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 8080; // API Gateway berjalan di port 8080

// 1. Mengaktifkan CORS agar React bisa mengakses Gateway ini
app.use(cors({
    origin: '*', // Di tahap development, izinkan semua origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging Middleware sederhana untuk melihat request yang masuk
app.use((req, res, next) => {
    console.log(`[Gateway] ${req.method} ${req.url} -> Forwarding...`);
    next();
});

const checkRole = (allowedRole) => {
    return (req, res, next) => {
        const token = req.headers['authorization']; // Membaca token dari React

        if (!token) {
            return res.status(401).json({ status: 'error', message: 'Akses ditolak. Token tidak ditemukan.' });
        }

        // Validasi Token Admin
        if (allowedRole === 'admin' && token === 'Bearer mock-token-admin-xyz') {
            return next(); // Lolos ke Movie Service
        }
        
        // Validasi Token User
        if (allowedRole === 'user' && token === 'Bearer mock-token-user-abc') {
            return next(); // Lolos ke Booking Service
        }

        // Jika token tidak cocok dengan role yang diminta
        return res.status(403).json({ status: 'error', message: 'Anda tidak memiliki akses ke halaman ini!' });
    };
};

// =========================================================================
// ROUTING PROXY KE BACKEND SERVICE (Menggunakan Domain Laravel Herd / Port Local)
// =========================================================================

// A. Mengarahkan rute /auth ke Laravel Auth Service (Port 8001 / auth-service.test)
app.use('/auth', createProxyMiddleware({
    target: 'http://auth-service.test', // sesuaikan dengan domain Herd Anda
    changeOrigin: true,
    pathRewrite: {
        '^/auth': '/api', // Mengubah /auth/login di Gateway menjadi /api/login di Laravel
    },
}));

// B. Mengarahkan rute /movies ke Laravel Movie Service (Port 8004 / movie-service.test)
app.use('/movies', createProxyMiddleware({
    target: 'http://movie-service.test',
    changeOrigin: true,
    pathRewrite: {
        '^/movies': '/api/movies', // Mengubah /movies di Gateway menjadi /api/movies di Laravel
    },
}));

// C. Mengarahkan rute /payments ke Laravel Payment Service (Port 8002 / payment-service.test)
app.use('/payments', createProxyMiddleware({
    target: 'http://payment-service.test',
    changeOrigin: true,
    pathRewrite: {
        '^/payments': '/api', // Mengubah /payments/charge menjadi /api/charge di Laravel
    },
}));

// D. Mengarahkan rute /bookings ke Express Booking Service (Port 8003)
app.use('/bookings', createProxyMiddleware({
    target: 'http://localhost:8003', // Karena sama-sama Node.js, tembak langsung port-nya
    changeOrigin: true,
    pathRewrite: {
        '^/bookings': '/api/booking', // Mengubah /bookings di Gateway menjadi /api/booking di Express
    },
}));

// =========================================================================

app.listen(PORT, () => {
    console.log(`🚀 Cine Reserve API Gateway running successfully on http://localhost:${PORT}`);
});