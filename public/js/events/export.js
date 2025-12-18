/**
 * EXPORT MODULE
 * Handles PNG export and Telegram sending
 * PromtHubs Card Creator v5.4
 */

import { state, imageGallery } from '../state.js';
import { DOM, setButtonLoading, restoreButton } from '../ui.js';
import { captureCanvas } from '../canvas-manager.js';
import { Logger } from '../logger.js';
import { Toast } from '../toast.js';

/**
 * Handle PNG export and Telegram send
 * @returns {Promise<void>}
 */
export async function handleExport() {
    Logger.info('EVENTS', 'Telegram export started');
    const originalText = setButtonLoading(
        DOM.btnExport,
        true,
        '<div class="spinner"></div> Gönderiliyor...'
    );

    try {
        // 1. Capture edited card (full quality PNG)
        const dataUrl = await captureCanvas(state);

        // 2. Send edited card to Telegram
        try {
            Logger.info('EVENTS', 'Sending edited card to Telegram...');

            const response = await fetch('/api/send-telegram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: dataUrl,
                    prompt: state.promptText,
                    type: 'edited'
                })
            });

            // Safe JSON parsing
            let result = {};
            try {
                const text = await response.text();
                if (text) {
                    result = JSON.parse(text);
                }
            } catch (parseErr) {
                Logger.warn('EVENTS', 'Failed to parse response JSON', parseErr);
            }

            if (!response.ok) {
                if (result.error && result.error.includes('TELEGRAM_CHANNEL_ID')) {
                    Toast.error('Telegram Hatası: Kanal ID eksik (.env)');
                } else {
                    throw new Error(result.error || `Server Error: ${response.status}`);
                }
            } else {
                Toast.success('Kart Telegram\'a gönderildi! 🎨');

                // 3. Send all original photos to Telegram (excluding default)
                const originalImages = imageGallery.images.filter(img => img.id !== 'default');

                if (originalImages.length > 0) {
                    Logger.info('EVENTS', `Sending ${originalImages.length} original photos to Telegram...`);

                    for (let i = 0; i < originalImages.length; i++) {
                        const img = originalImages[i];
                        try {
                            const originalResponse = await fetch('/api/send-telegram', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    imageBase64: img.src,
                                    prompt: `📷 Orijinal Fotoğraf ${i + 1}/${originalImages.length}`,
                                    type: 'original'
                                })
                            });

                            if (originalResponse.ok) {
                                Logger.info('EVENTS', `Original photo ${i + 1} sent`);
                            }
                        } catch (origErr) {
                            Logger.error('EVENTS', `Failed to send original photo ${i + 1}`, origErr);
                        }
                    }

                    Toast.success(`${originalImages.length} orijinal fotoğraf da gönderildi! 📷`);
                }

                // 4. Send prompt as the final message (after all images)
                if (state.promptText && state.promptText.trim()) {
                    try {
                        Logger.info('EVENTS', 'Sending prompt as final message...');
                        await fetch('/api/send-telegram', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                prompt: state.promptText,
                                type: 'sendPrompt'
                            })
                        });
                        Logger.info('EVENTS', 'Prompt sent as final message');
                    } catch (promptErr) {
                        Logger.error('EVENTS', 'Failed to send prompt message', promptErr);
                    }
                }
            }

        } catch (tgError) {
            Logger.error('EVENTS', 'Telegram upload failed', tgError);

            if (tgError.name === 'AbortError') {
                Toast.error('Telegram gönderimi zaman aşımına uğradı');
            } else if (tgError.message && tgError.message.includes('Failed to fetch')) {
                Toast.error('Backend sunucusu çalışmıyor olabilir');
            } else {
                Toast.error('Telegram hatası: ' + (tgError.message || 'Bilinmeyen hata'));
            }
        }

        Logger.info('EVENTS', 'Telegram export completed');

    } catch (err) {
        Logger.error('EVENTS', 'Export Failed', { box: err.message });
        Toast.error('Bir hata oluştu: ' + err.message);
    } finally {
        restoreButton(DOM.btnExport, originalText);
    }
}
