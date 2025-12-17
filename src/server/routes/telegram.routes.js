/**
 * TELEGRAM ROUTES
 * /api/send-telegram endpoint'i
 */

const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const config = require('../../../config');

const router = express.Router();

// Telegram bot instance (sadece gönderim için, polling yok)
const telegramSender = config.telegram.botToken
    ? new TelegramBot(config.telegram.botToken, { polling: false })
    : null;

/**
 * POST /api/send-telegram - Kartı Telegram'a gönder
 */
router.post('/send-telegram', async (req, res, next) => {
    try {
        const { imageBase64, prompt } = req.body;
        const channelId = config.telegram.channelId;

        if (!telegramSender) {
            return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not configured.' });
        }

        if (!channelId) {
            return res.status(400).json({ error: 'TELEGRAM_CHANNEL_ID not configured in .env' });
        }

        const base64Data = imageBase64.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Telegram'a Document olarak gönder (kayıpsız)
        await telegramSender.sendDocument(channelId, buffer, {
            caption: `🎨 *Yeni Kart Oluşturuldu*\n\n📝 _${prompt ? prompt.substring(0, 100) + (prompt.length > 100 ? '...' : '') : 'No prompt'}_`,
            parse_mode: 'Markdown'
        }, {
            filename: 'promthubs-card.png',
            contentType: 'image/png'
        });

        res.json({ success: true, message: 'Sent to Telegram' });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
