require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Rate Limiting - Basit in-memory limiter
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 dakika
const RATE_LIMIT_MAX_REQUESTS = 20; // Dakikada maksimum 20 istek

function rateLimiter(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 1, startTime: now });
        return next();
    }

    const record = rateLimitMap.get(ip);

    if (now - record.startTime > RATE_LIMIT_WINDOW_MS) {
        // Pencere süresi doldu, sıfırla
        rateLimitMap.set(ip, { count: 1, startTime: now });
        return next();
    }

    if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
        return res.status(429).json({
            error: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil((RATE_LIMIT_WINDOW_MS - (now - record.startTime)) / 1000)
        });
    }

    record.count++;
    next();
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow large image payloads
app.use('/api', rateLimiter); // Rate limit API endpoints

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_VISION_MODEL = 'gemini-2.5-flash-preview-09-2025';
const IMAGEN_MODEL = 'imagen-4.0-generate-001';

// Constants
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

if (!GEMINI_API_KEY) {
    console.warn('⚠️ WARNING: GEMINI_API_KEY is not set in .env file!');
}

/**
 * Endpoint: /api/analyze
 * Desc: Analyze image using Gemini Vision
 */
app.post('/api/analyze', async (req, res) => {
    try {
        const { imageBase64, prompt, apiKey } = req.body;

        const effectiveKey = apiKey || GEMINI_API_KEY;
        if (!effectiveKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        const url = `${API_BASE_URL}/${GEMINI_VISION_MODEL}:generateContent?key=${effectiveKey}`;

        const payload = {
            contents: [{
                parts: [
                    { text: prompt || 'Describe this image.' },
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: imageBase64
                        }
                    }
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
            throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const description = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!description) {
            throw new Error('No description returned from API');
        }

        res.json({ description });

    } catch (error) {
        console.error('❌ /api/analyze error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Endpoint: /api/generate
 * Desc: Generate image using Imagen
 */
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, apiKey } = req.body;

        const effectiveKey = apiKey || GEMINI_API_KEY;
        if (!effectiveKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        const url = `${API_BASE_URL}/${IMAGEN_MODEL}:predict?key=${effectiveKey}`;

        const payload = {
            instances: [{ prompt }],
            parameters: {
                sampleCount: 1,
                aspectRatio: "9:16"
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Imagen API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const b64Result = data.predictions?.[0]?.bytesBase64Encoded;

        if (!b64Result) {
            throw new Error('No image data returned from API');
        }

        res.json({ imageBase64: b64Result });

    } catch (error) {
        console.error('❌ /api/generate error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Endpoint: /api/send-telegram
 * Desc: Send generated card to Telegram Channel
 */
const TelegramBot = require('node-telegram-bot-api');
const telegramBot = process.env.TELEGRAM_BOT_TOKEN ? new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false }) : null;

app.post('/api/send-telegram', async (req, res) => {
    try {
        const { imageBase64, prompt } = req.body;
        const channelId = process.env.TELEGRAM_CHANNEL_ID;

        if (!telegramBot) {
            return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not configured.' });
        }

        if (!channelId) {
            return res.status(400).json({ error: 'TELEGRAM_CHANNEL_ID not configured in .env' });
        }

        // Remove header if present
        const base64Data = imageBase64.replace(/^data:image\/png;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // Send to Telegram
        await telegramBot.sendPhoto(channelId, buffer, {
            caption: `🎨 *Yeni Kart Oluşturuldu*\n\n📝 _${prompt ? prompt.substring(0, 100) + (prompt.length > 100 ? '...' : '') : 'No prompt'}_`,
            parse_mode: 'Markdown'
        });

        res.json({ success: true, message: 'Sent to Telegram' });

    } catch (error) {
        console.error('❌ /api/send-telegram error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Backend Proxy running at http://localhost:${PORT}`);
    if (!GEMINI_API_KEY) console.log('PLEASE SET GEMINI_API_KEY in .env file');
});
