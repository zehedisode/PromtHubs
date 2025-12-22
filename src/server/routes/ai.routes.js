/**
 * AI ROUTES
 * /api/analyze ve /api/generate endpoint'leri
 * SOLID: SRP - Sadece HTTP işlemlerinden sorumlu, iş mantığı servise devredildi
 */

const express = require('express');
const { validate, analyzeSchema, generateSchema } = require('../middleware/validation');
const { getAIService } = require('../services/container');
const { APIError } = require('../infrastructure/gemini-client');

const router = express.Router();

/**
 * POST /api/analyze - Görsel analizi (Gemini Vision)
 */
router.post('/analyze', validate(analyzeSchema), async (req, res, next) => {
    try {
        const aiService = getAIService();
        const result = await aiService.analyzeImage(req.body);
        res.json(result);
    } catch (error) {
        if (error instanceof APIError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        next(error);
    }
});

/**
 * POST /api/generate - Görsel oluşturma (Imagen)
 */
router.post('/generate', validate(generateSchema), async (req, res, next) => {
    try {
        const aiService = getAIService();
        const result = await aiService.generateImage(req.body);
        res.json(result);
    } catch (error) {
        if (error instanceof APIError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        next(error);
    }
});

module.exports = router;
