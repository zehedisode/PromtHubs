/**
 * AI ROUTES
 * /api/analyze ve /api/generate endpoint'leri
 */

const express = require('express');
const fetch = require('node-fetch');
const config = require('../../../config');
const logger = require('../utils/logger');
const { validate, analyzeSchema, generateSchema } = require('../middleware/validation');

const router = express.Router();

/**
 * POST /api/analyze - Görsel analizi (Gemini Vision)
 */
router.post('/analyze', validate(analyzeSchema), async (req, res, next) => {
    try {
        const { imageBase64, prompt, apiKey } = req.body;
        const effectiveKey = apiKey || config.gemini.apiKey;

        if (!effectiveKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        logger.info('Analyzing image via Gemini Vision');

        const url = `${config.gemini.baseUrl}/${config.gemini.visionModel}:generateContent?key=${effectiveKey}`;
        const payload = {
            contents: [{
                parts: [
                    { text: prompt || 'Describe this image.' },
                    { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
                ]
            }]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 429) {
                return res.status(429).json({ error: 'API rate limit aşıldı. Lütfen biraz bekleyin.' });
            }
            throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const description = data.candidates?.[0]?.content?.parts?.[0]?.text;
        res.json({ description });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/generate - Görsel oluşturma (Imagen)
 */
router.post('/generate', validate(generateSchema), async (req, res, next) => {
    try {
        const { prompt, apiKey } = req.body;
        const effectiveKey = apiKey || config.gemini.apiKey;

        if (!effectiveKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        logger.info('Generating image via Imagen', { promptLength: prompt.length });

        const url = `${config.gemini.baseUrl}/${config.gemini.imagenModel}:predict?key=${effectiveKey}`;
        const payload = {
            instances: [{ prompt }],
            parameters: { sampleCount: 1, aspectRatio: '9:16' }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 429) {
                return res.status(429).json({ error: 'API rate limit aşıldı. Lütfen biraz bekleyin.' });
            }
            throw new Error(`Imagen API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const b64Result = data.predictions?.[0]?.bytesBase64Encoded;

        if (!b64Result) {
            throw new Error('No image data returned from API');
        }

        res.json({ imageBase64: b64Result });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
