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
    console.log('\n🚀 SİSTEM HAZIR!');
    console.log(`Web Sitesi: http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log('Telegram: API üzerinden gönderim aktif\n');
});

