/**
 * EXPRESS APP SETUP
 * PromtHubs Card Creator - Backend
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('../../config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
    origin: config.cors.origins,
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Static files - public klasöründen servis et
app.use(express.static(path.join(__dirname, '../../public'), {
    maxAge: config.nodeEnv === 'production' ? '1d' : 0,
    etag: true
}));

// API Routes
app.use('/api', routes);

// Error Handler (en son olmalı)
app.use(errorHandler);

module.exports = app;
