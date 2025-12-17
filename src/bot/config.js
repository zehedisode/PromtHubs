/**
 * BOT CONFIG MODULE
 * Extends main config with bot-specific settings
 */

const mainConfig = require('../../config');

module.exports = {
    // Telegram settings from main config
    BOT_TOKEN: mainConfig.telegram.botToken,

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
