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
        const { imageBase64, prompt, type } = req.body;
        const channelId = config.telegram.channelId;

        if (!telegramSender) {
            return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not configured.' });
        }

        if (!channelId) {
            return res.status(400).json({ error: 'TELEGRAM_CHANNEL_ID not configured in .env' });
        }

        // Sadece prompt gönderimi (resim olmadan)
        if (type === 'sendPrompt') {
            if (prompt && prompt.trim()) {
                await telegramSender.sendMessage(channelId, prompt.trim());
            }
            return res.json({ success: true, message: 'Prompt sent to Telegram' });
        }

        // Resim gönderimi
        // Tüm resim formatlarını destekle (png, jpeg, webp, gif vb.)
        const base64Data = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Buffer boş mu kontrol et
        if (!buffer || buffer.length === 0) {
            return res.status(400).json({ error: 'Görsel verisi boş veya geçersiz' });
        }

        // Editli kart mı orijinal mi?
        const isEdited = type === 'edited';
        const caption = isEdited ? '🎨 *Yeni Kart Oluşturuldu*' : (prompt || '📷 Orijinal Fotoğraf');
        const filename = isEdited ? 'promthubs-card.png' : `original-photo-${Date.now()}.png`;

        // Telegram'a Document olarak gönder (kayıpsız)
        await telegramSender.sendDocument(channelId, buffer, {
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
