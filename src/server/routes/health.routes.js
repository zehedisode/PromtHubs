/**
 * HEALTH CHECK ROUTES
 * Sistem durumu ve monitoring endpoint'leri
 */

const express = require('express');
const config = require('../../../config');

const router = express.Router();

/**
 * GET /api/health - Basit health check
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv
    });
});

/**
 * GET /api/health/detailed - Detaylı sistem durumu
 */
router.get('/health/detailed', (req, res) => {
    const memUsage = process.memoryUsage();

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
        version: '2.0.0',
        memory: {
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
            rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB'
        },
        services: {
            gemini: config.gemini.apiKey ? 'configured' : 'not configured',
            telegram: config.telegram.botToken ? 'configured' : 'not configured'
        }
    });
});

module.exports = router;
