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
const helmet = require('helmet');
const compression = require('compression');

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security & Performance Middleware
app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: false,
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "data:"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https:", "http:"],
            frameSrc: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
        }
    },
    // Disable HSTS since we don't have HTTPS
    hsts: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

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
