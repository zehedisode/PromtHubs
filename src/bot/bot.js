/**
 * PROMTHUBS TELEGRAM BOT
 * Main bot file with command handlers and user interaction
 */

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const CONFIG = require('./config');
const { getSession, resetSession, updateSession } = require('./session-manager');
const { analyzeImageColors } = require('./color-analysis');
const { generateCard } = require('./card-generator');

// Create bot instance
const bot = new TelegramBot(CONFIG.BOT_TOKEN, { polling: true });

console.log('🤖 PromtHubs Bot başlatıldı!');

// ============================================
// COMMAND HANDLERS
// ============================================

/**
 * /start command
 */
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    resetSession(chatId);

    const welcomeMessage = `
🎨 *PromtHubs Card Creator*'a hoş geldiniz!

Bu bot ile görsellerinizden profesyonel prompt kartları oluşturabilirsiniz.

*Nasıl Kullanılır:*
1️⃣ Bana bir görsel gönderin
2️⃣ Prompt metninizi yazın
3️⃣ Stilleri ayarlayın
4️⃣ Kartınızı indirin!

📷 *Hemen bir görsel göndererek başlayın!*
`;

    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

/**
 * /help command
 */
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;

    const helpMessage = `
📖 *Yardım Menüsü*

*Komutlar:*
/start - Botu başlat
/yeni - Yeni kart oluştur
/help - Bu menü

*Kullanım:*
• Görsel gönderin (fotoğraf olarak)
• Prompt metninizi yazın
• Renk, font ve model seçin
• "✨ Kartı Oluştur" butonuna basın

*Stiller:*
• 🎨 Renk: Görselinizden çıkarılan 5 renk
• 🔤 Font: Mono, Sans, Serif
• 🤖 Model: Gemini, GPT-4, Yok
• 🖼 Çerçeve: Açık/Kapalı
`;

    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

/**
 * /yeni command - Start fresh
 */
bot.onText(/\/yeni/, (msg) => {
    const chatId = msg.chat.id;
    resetSession(chatId);
    bot.sendMessage(chatId, '🆕 Yeni kart için hazırım!\n\n📷 Lütfen bir görsel gönderin.');
});

// ============================================
// PHOTO HANDLER
// ============================================

bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    const _session = getSession(chatId);

    try {
        // Get largest photo
        const photo = msg.photo[msg.photo.length - 1];
        const fileId = photo.file_id;

        bot.sendMessage(chatId, '⏳ Görsel işleniyor...');

        // Download photo
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${CONFIG.BOT_TOKEN}/${file.file_path}`;

        const imageBuffer = await downloadFile(fileUrl);

        // Analyze colors
        const colorPalette = await analyzeImageColors(imageBuffer);

        // Update session
        updateSession(chatId, 'imageBuffer', imageBuffer);
        updateSession(chatId, 'colorPalette', colorPalette);
        updateSession(chatId, 'step', 'waiting_prompt');

        // Show color palette info
        const colorInfo = colorPalette.map((c, i) => `${i + 1}. ${c.label}: ${c.color}`).join('\n');

        bot.sendMessage(chatId,
            `✅ Görsel kaydedildi!\n\n🎨 *Bulunan Renkler:*\n${colorInfo}\n\n📝 Şimdi *prompt metnini* yazın:`,
            { parse_mode: 'Markdown' }
        );

    } catch (err) {
        console.error('Photo processing error:', err);
        bot.sendMessage(chatId, '❌ Görsel işlenirken hata oluştu. Lütfen tekrar deneyin.');
    }
});

// ============================================
// TEXT HANDLER (for prompt)
// ============================================

bot.on('text', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Check for forwarded channel messages
    if (msg.forward_from_chat && msg.forward_from_chat.type === 'channel') {
        console.log('📢 CHANNEL DETECTED (Forwarded):', {
            id: msg.forward_from_chat.id,
            title: msg.forward_from_chat.title
        });
        bot.sendMessage(chatId, `✅ Kanal Algılandı: ${msg.forward_from_chat.title} (ID: ${msg.forward_from_chat.id})`);
        return;
    }

    // Ignore commands
    if (text && text.startsWith('/')) return;

    const session = getSession(chatId);

    if (session.step === 'waiting_prompt') {
        updateSession(chatId, 'promptText', text);
        updateSession(chatId, 'step', 'configuring');

        // Show configuration menu
        showConfigMenu(chatId, session);

    } else if (session.step === 'idle') {
        bot.sendMessage(chatId, '📷 Lütfen önce bir görsel gönderin!');
    }
});

// ============================================
// CALLBACK QUERY HANDLER (inline buttons)
// ============================================

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;
    const session = getSession(chatId);

    // Parse callback data
    const [action, value] = data.split(':');

    try {
        switch (action) {
            case 'color':
                updateSession(chatId, 'settings.themeColor', value);
                await bot.answerCallbackQuery(query.id, { text: `🎨 Renk: ${value}` });
                showConfigMenu(chatId, session, messageId);
                break;

            case 'font':
                updateSession(chatId, 'settings.fontFamily', value);
                await bot.answerCallbackQuery(query.id, { text: `🔤 Font: ${value}` });
                showConfigMenu(chatId, session, messageId);
                break;

            case 'model':
                updateSession(chatId, 'settings.model', value);
                await bot.answerCallbackQuery(query.id, { text: `🤖 Model: ${value}` });
                showConfigMenu(chatId, session, messageId);
                break;

            case 'border': {
                const newBorder = value === 'on';
                updateSession(chatId, 'settings.showBorder', newBorder);
                await bot.answerCallbackQuery(query.id, { text: `🖼 Çerçeve: ${newBorder ? 'Açık' : 'Kapalı'}` });
                showConfigMenu(chatId, session, messageId);
                break;
            }

            case 'generate':
                await bot.answerCallbackQuery(query.id, { text: '⏳ Kart oluşturuluyor...' });
                await generateAndSendCard(chatId, messageId);
                break;

            case 'cancel':
                resetSession(chatId);
                await bot.answerCallbackQuery(query.id, { text: '❌ İptal edildi' });
                bot.deleteMessage(chatId, messageId);
                bot.sendMessage(chatId, '❌ İptal edildi. /yeni ile tekrar başlayabilirsiniz.');
                break;
        }
    } catch (err) {
        console.error('Callback error:', err);
        bot.answerCallbackQuery(query.id, { text: '❌ Hata oluştu' });
    }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Show configuration menu with inline keyboard
 */
function showConfigMenu(chatId, session, messageId = null) {
    const settings = session.settings;
    const colorPalette = session.colorPalette;

    // Build color buttons
    const colorButtons = colorPalette.slice(0, 5).map(c => ({
        text: settings.themeColor === c.color ? `✓ ${c.label}` : c.label,
        callback_data: `color:${c.color}`
    }));

    // Split colors into rows of 3
    const colorRow1 = colorButtons.slice(0, 3);
    const colorRow2 = colorButtons.slice(3, 5);

    const keyboard = {
        inline_keyboard: [
            // Color selection
            colorRow1,
            colorRow2.length > 0 ? colorRow2 : undefined,
            // Font selection
            [
                { text: settings.fontFamily === 'mono' ? '✓ Mono' : 'Mono', callback_data: 'font:mono' },
                { text: settings.fontFamily === 'sans' ? '✓ Sans' : 'Sans', callback_data: 'font:sans' },
                { text: settings.fontFamily === 'serif' ? '✓ Serif' : 'Serif', callback_data: 'font:serif' }
            ],
            // Model selection
            [
                { text: settings.model === 'Gemini' ? '✓ Gemini' : 'Gemini', callback_data: 'model:Gemini' },
                { text: settings.model === 'GPT-4' ? '✓ GPT-4' : 'GPT-4', callback_data: 'model:GPT-4' },
                { text: settings.model === 'None' ? '✓ Yok' : 'Yok', callback_data: 'model:None' }
            ],
            // Border toggle
            [
                { text: settings.showBorder ? '✓ Çerçeve Açık' : 'Çerçeve Açık', callback_data: 'border:on' },
                { text: !settings.showBorder ? '✓ Çerçeve Kapalı' : 'Çerçeve Kapalı', callback_data: 'border:off' }
            ],
            // Action buttons
            [
                { text: '❌ İptal', callback_data: 'cancel' },
                { text: '✨ Kartı Oluştur', callback_data: 'generate' }
            ]
        ].filter(Boolean)
    };

    const menuText = `
⚙️ *Kart Ayarları*

📝 *Prompt:* ${session.promptText.substring(0, 50)}${session.promptText.length > 50 ? '...' : ''}

🎨 *Renk:* ${settings.themeColor}
🔤 *Font:* ${settings.fontFamily}
🤖 *Model:* ${settings.model}
🖼 *Çerçeve:* ${settings.showBorder ? 'Açık' : 'Kapalı'}

Ayarları değiştirmek için aşağıdaki butonları kullanın:
`;

    if (messageId) {
        bot.editMessageText(menuText, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    } else {
        bot.sendMessage(chatId, menuText, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }
}

/**
 * Generate card and send to user
 */
async function generateAndSendCard(chatId, messageId) {
    const session = getSession(chatId);

    try {
        // Update message to show progress
        try {
            await bot.editMessageText('⏳ Kartınız oluşturuluyor...', {
                chat_id: chatId,
                message_id: messageId
            });
        } catch (e) {
            // Ignore edit errors
        }

        // Generate card
        const cardBuffer = await generateCard(session.imageBuffer, {
            promptText: session.promptText,
            themeColor: session.settings.themeColor,
            model: session.settings.model,
            fontFamily: session.settings.fontFamily,
            fontSize: session.settings.fontSize,
            showBorder: session.settings.showBorder,
            safeZone: session.settings.safeZone,
            safeZoneScale: session.settings.safeZoneScale,
            gradientIntensity: session.settings.gradientIntensity
        });

        // Save to temp file
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        const tempFile = path.join(tempDir, `card-${chatId}-${Date.now()}.png`);
        fs.writeFileSync(tempFile, cardBuffer);

        // Delete config message
        try {
            await bot.deleteMessage(chatId, messageId);
        } catch (e) {
            // Ignore delete errors
        }

        // Send card as document (high quality PNG)
        await bot.sendDocument(chatId, tempFile, {
            caption: '✨ *Kartınız hazır!* (4K Kalite)\n\n📐 Boyut: 4320x7680 piksel\n/yeni ile başka bir kart oluşturabilirsiniz.',
            parse_mode: 'Markdown'
        });

        // Note: Not sending as photo because Telegram has dimension limits for photos
        // The document is the full 4K quality version

        // Cleanup temp file
        try {
            fs.unlinkSync(tempFile);
        } catch (e) {
            // Ignore cleanup errors
        }

        // Reset session
        resetSession(chatId);

    } catch (err) {
        console.error('CRITICAL Card generation error:', err);
        try {
            const errorMsg = `❌ Kart oluşturulurken hata oluştu: ${err.message || 'Bilinmeyen hata'}\n\n/yeni ile tekrar deneyin.`;
            await bot.sendMessage(chatId, errorMsg);
        } catch (e) {
            console.error('Failed to send error message:', e);
        }
        resetSession(chatId);
    }
}

/**
 * Download file from URL
 */
function downloadFile(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;

        protocol.get(url, (response) => {
            const chunks = [];
            response.on('data', chunk => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
            response.on('error', reject);
        }).on('error', reject);
    });
}

// Error handling
bot.on('polling_error', (error) => {
    console.error('Polling error:', error.message);
});

// Helper to find channel ID
bot.on('channel_post', (msg) => {
    console.log('📢 CHANNEL DETECTED:', {
        id: msg.chat.id,
        title: msg.chat.title,
        type: msg.chat.type
    });
});

console.log('✅ Bot hazır ve dinliyor...');
