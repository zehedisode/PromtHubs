/**
 * EXPRESS APP SETUP
 * PromtHubs Card Creator - Backend
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('../../config');
const logger = require('./utils/logger');
const routes = require('./routes');
const healthRoutes = require('./routes/health.routes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
    origin: config.cors.origins,
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
    logger.http(`${req.method} ${req.path}`);
    next();
});

// Rate limiting (tüm API istekleri için)
app.use('/api', apiLimiter);

// Static files - public klasöründen servis et
app.use(express.static(path.join(__dirname, '../../public'), {
    maxAge: config.nodeEnv === 'production' ? '1d' : 0,
    etag: true
}));

// Health check routes (rate limit'siz)
app.use('/api', healthRoutes);

// API Routes
app.use('/api', routes);

// Error Handler (en son olmalı)
app.use(errorHandler);

module.exports = app;
