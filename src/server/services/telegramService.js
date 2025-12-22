const TelegramBot = require('node-telegram-bot-api');
const config = require('../../../config');
const logger = require('../utils/logger');

class TelegramService {
    constructor() {
        this.bot = null;
    }

    initialize() {
        if (!config.telegram.botToken) {
            logger.warn('TELEGRAM', 'Bot token not set. Telegram service disabled.');
            return;
        }

        try {
            // Check if token is placeholder
            if (config.telegram.botToken.startsWith('your_') || config.telegram.botToken.length < 20) {
                logger.warn('TELEGRAM', 'Invalid Bot Token. Telegram service disabled.');
                return;
            }

            // Setup bot (no polling needed, just for sending)
            this.bot = new TelegramBot(config.telegram.botToken);

            logger.info('TELEGRAM', 'Bot initialized for sending.');

        } catch (error) {
            logger.error('TELEGRAM', 'Failed to initialize bot', error);
        }
    }

    // For sending documents
    async sendDocument(chatId, buffer, options, fileOptions) {
        if (!this.bot) throw new Error('Bot not initialized');
        return this.bot.sendDocument(chatId, buffer, options, fileOptions);
    }

    // For sending messages
    async sendMessage(chatId, text) {
        if (!this.bot) throw new Error('Bot not initialized');
        return this.bot.sendMessage(chatId, text);
    }
}

// Singleton instance
const telegramService = new TelegramService();
module.exports = telegramService;
