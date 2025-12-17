/**
 * CONFIG MODULE
 * Bot configuration and constants
 */

require('dotenv').config();

module.exports = {
    // Bot Token - .env dosyasından okunuyor
    BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,

    // Card dimensions (9:16 aspect ratio)
    CARD_WIDTH: 1080,
    CARD_HEIGHT: 1920,

    // Export quality
    EXPORT_SCALE: 4, // 4x scale = 4320x7680 output (4K+)

    // Font settings
    FONTS: {
        mono: 'JetBrains Mono',
        sans: 'Inter',
        serif: 'Playfair Display',
        display: 'Oswald'
    },

    // Default styles
    DEFAULT_STATE: {
        themeColor: '#FFD700',
        model: 'Gemini',
        fontFamily: 'mono',
        fontSize: 36,
        showBorder: true,
        gradientIntensity: 100
    },

    // Brand color
    BRAND_YELLOW: '#FFD700'
};
