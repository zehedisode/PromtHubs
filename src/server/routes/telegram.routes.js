/**
 * TELEGRAM ROUTES
 * /api/send-telegram endpoint'i
 */

const express = require('express');
const config = require('../../../config');
const telegramService = require('../services/telegramService');

const router = express.Router();

// Initialize service
telegramService.initialize();

/**
 * POST /api/send-telegram - Send card to Telegram
 */
router.post('/send-telegram', async (req, res, next) => {
    try {
        const { imageBase64, prompt, type } = req.body;
        const channelId = config.telegram.channelId;

        if (!config.telegram.botToken) {
            return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not configured.' });
        }

        if (!channelId) {
            return res.status(400).json({ error: 'TELEGRAM_CHANNEL_ID not configured in .env' });
        }

        // Send only prompt
        if (type === 'sendPrompt') {
            if (prompt && prompt.trim()) {
                await telegramService.sendMessage(channelId, prompt.trim());
            }
            return res.json({ success: true, message: 'Prompt sent to Telegram' });
        }

        // Send image
        const base64Data = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        if (!buffer || buffer.length === 0) {
            return res.status(400).json({ error: 'Image data empty' });
        }

        const isEdited = type === 'edited';
        const caption = isEdited ? '🎨 *Yeni Kart Oluşturuldu*' : (prompt || '📷 Orijinal Fotoğraf');
        const filename = isEdited ? 'promthubs-card.png' : `original-photo-${Date.now()}.png`;

        await telegramService.sendDocument(channelId, buffer, {
            caption: caption,
            parse_mode: 'Markdown'
        }, {
            filename: filename,
            contentType: 'image/png'
        });

        res.json({ success: true, message: 'Sent to Telegram' });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
