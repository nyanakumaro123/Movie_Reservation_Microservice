const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 8080;

// 1. Proxy API requests to Laravel (Passes the FULL path: /api/payments/charge)
app.use(createProxyMiddleware({
    pathFilter: '/api', // Only catches URLs that start with /api
    target: 'http://payment-nginx:80',
    changeOrigin: true,
    logger: console
}));

// 2. Proxy everything else to the Frontend (HTML, CSS, JS)
app.use(createProxyMiddleware({
    pathFilter: (path) => !path.startsWith('/api'), // Catches everything NOT starting with /api
    target: 'http://frontend:80',
    changeOrigin: true,
    logger: console
}));

app.listen(PORT, () => {
    console.log(`🚀 Express API Gateway running securely on port ${PORT}`);
});