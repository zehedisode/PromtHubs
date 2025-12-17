require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

// --- APP CONFIG ---
const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.', {
    maxAge: '1d',
    etag: true
}));

// AI Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_VISION_MODEL = 'gemini-2.5-flash-preview-09-2025';
const IMAGEN_MODEL = 'imagen-4.0-generate-001';
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

if (!GEMINI_API_KEY) {
    console.warn('⚠️ WARNING: GEMINI_API_KEY is not set in .env file!');
}

// --- API ENDPOINTS ---

/**
 * /api/analyze - Analyze image using Gemini Vision
 */
app.post('/api/analyze', async (req, res) => {
    try {
        const { imageBase64, prompt, apiKey } = req.body;
        const effectiveKey = apiKey || GEMINI_API_KEY;

        if (!effectiveKey) return res.status(400).json({ error: 'API key is required' });

        const url = `${API_BASE_URL}/${GEMINI_VISION_MODEL}:generateContent?key=${effectiveKey}`;
        const payload = {
            contents: [{
                parts: [
                    { text: prompt || 'Describe this image.' },
                    { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
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
        console.error('❌ /api/analyze error:', error.message);
        res.status(error.status || 500).json({ error: error.message });
    }
});

/**
 * /api/generate - Generate image using Imagen
 */
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, apiKey } = req.body;
        const effectiveKey = apiKey || GEMINI_API_KEY;

        if (!effectiveKey) return res.status(400).json({ error: 'API key is required' });

        const url = `${API_BASE_URL}/${IMAGEN_MODEL}:predict?key=${effectiveKey}`;
        const payload = {
            instances: [{ prompt }],
            parameters: { sampleCount: 1, aspectRatio: "9:16" }
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

        if (!b64Result) throw new Error('No image data returned from API');

        res.json({ imageBase64: b64Result });

    } catch (error) {
        console.error('❌ /api/generate error:', error.message);
        res.status(error.status || 500).json({ error: error.message });
    }
});

/**
 * /api/send-telegram - Send to Channel
 */
const telegramSender = process.env.TELEGRAM_BOT_TOKEN
    ? new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false })
    : null;

app.post('/api/send-telegram', async (req, res) => {
    try {
        const { imageBase64, prompt } = req.body;
        const channelId = process.env.TELEGRAM_CHANNEL_ID;

        if (!telegramSender) return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not configured.' });
        if (!channelId) return res.status(400).json({ error: 'TELEGRAM_CHANNEL_ID not configured in .env' });

        const base64Data = imageBase64.replace(/^data:image\/png;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // Send to Telegram as Document (Lossless)
        await telegramSender.sendDocument(channelId, buffer, {
            caption: `🎨 *Yeni Kart Oluşturuldu*\n\n📝 _${prompt ? prompt.substring(0, 100) + (prompt.length > 100 ? '...' : '') : 'No prompt'}_`,
            parse_mode: 'Markdown'
        }, {
            filename: 'promthubs-card.png',
            contentType: 'image/png'
        });

        res.json({ success: true, message: 'Sent to Telegram' });

    } catch (error) {
        console.error('❌ /api/send-telegram error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`\n🚀 SİSTEM HAZIR!`);
    console.log(`Web Sitesi: http://localhost:${PORT}`);
    console.log(`Telegram Bot: Aktif (Polling)\n`);
});

// --- START INTERACTIVE BOT (Polling) ---
try {
    // Requires the bot logic from the subdirectory
    // This script (bot.js) starts its own TelegramBot instance with polling:true
    require('./telegram-bot/bot.js');
} catch (e) {
    console.error('❌ Could not start interactive bot:', e);
}
