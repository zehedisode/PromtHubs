/**
 * SERVER ENTRY POINT
 * PromtHubs Card Creator
 */

const app = require('./app');
const config = require('../../config');

// Validate configuration
config.isValid();

// Start server
app.listen(config.port, () => {
    console.log(`\n🚀 SİSTEM HAZIR!`);
    console.log(`Web Sitesi: http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}\n`);
});

// Start interactive Telegram bot (polling mode)
try {
    require('../bot/bot.js');
    console.log('Telegram Bot: Aktif (Polling)\n');
} catch (e) {
    console.error('❌ Could not start interactive bot:', e.message);
}
