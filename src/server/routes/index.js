/**
 * ROUTE INDEX
 * Tüm route'ları birleştirir
 */

const express = require('express');
const aiRoutes = require('./ai.routes');
const telegramRoutes = require('./telegram.routes');
const { aiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// AI routes (daha sıkı rate limit)
router.use('/analyze', aiLimiter);
router.use('/generate', aiLimiter);

// Mount routes
router.use('/', aiRoutes);
router.use('/', telegramRoutes);

module.exports = router;
