/**
 * ROUTE INDEX
 * Tüm route'ları birleştirir
 */

const express = require('express');
const aiRoutes = require('./ai.routes');
const telegramRoutes = require('./telegram.routes');

const router = express.Router();

// Mount routes
router.use('/', aiRoutes);
router.use('/', telegramRoutes);

module.exports = router;
