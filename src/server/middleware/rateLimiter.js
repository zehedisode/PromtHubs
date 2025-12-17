/**
 * RATE LIMITER MIDDLEWARE
 * API rate limiting - brute-force koruması
 */

const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Genel API limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // 15 dakikada max 100 istek
    message: {
        error: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika bekleyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logger.warn(`Rate limit exceeded: ${req.ip}`);
        res.status(options.statusCode).json(options.message);
    }
});

// AI endpoint'leri için daha sıkı limit
const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 dakika
    max: 10, // Dakikada max 10 AI isteği
    message: {
        error: 'AI servisine çok fazla istek gönderdiniz. Lütfen 1 dakika bekleyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logger.warn(`AI rate limit exceeded: ${req.ip}`);
        res.status(options.statusCode).json(options.message);
    }
});

module.exports = { apiLimiter, aiLimiter };
