/**
 * MERKEZI KONFİGÜRASYON
 * Tüm uygulama ayarları tek yerden yönetilir
 */

require('dotenv').config();

const config = {
    // Server
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // AI APIs
    gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        visionModel: 'gemini-2.5-flash-preview-09-2025',
        imagenModel: 'imagen-4.0-generate-001',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models'
    },

    // Telegram
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        channelId: process.env.TELEGRAM_CHANNEL_ID
    },

    // CORS
    cors: {
        origins: process.env.CORS_ORIGINS
            ? process.env.CORS_ORIGINS.split(',')
            : ['http://localhost:3000', 'http://127.0.0.1:3000']
    },

    // Validation
    isValid() {
        if (!this.gemini.apiKey) {
            console.warn('⚠️ WARNING: GEMINI_API_KEY is not set in .env file!');
        }
        if (!this.telegram.botToken) {
            console.warn('⚠️ WARNING: TELEGRAM_BOT_TOKEN is not set!');
        }
        return true;
    }
};

module.exports = config;
