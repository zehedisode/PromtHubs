/**
 * MODAL MODULE
 * Handles API Key modal and Remix instructions modal
 * PromtHubs Card Creator v5.4
 */

import { Logger } from '../logger.js';
import { Toast } from '../toast.js';

/**
 * Bind API Key modal related events
 */
export function bindApiKeyEvents() {
    const apiKeyBtn = document.getElementById('btnApiKey');
    const apiKeyModal = document.getElementById('apiKeyModal');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const apiKeySave = document.getElementById('apiKeySave');
    const apiKeyCancel = document.getElementById('apiKeyCancel');

    if (apiKeyBtn && apiKeyModal) {
        apiKeyBtn.addEventListener('click', () => {
            apiKeyModal.style.display = 'flex';
            const saved = localStorage.getItem('geminiApiKey') || '';
            apiKeyInput.value = saved;
        });
    }

    if (apiKeySave) {
        apiKeySave.addEventListener('click', () => {
            const key = apiKeyInput.value.trim();
            if (key) {
                localStorage.setItem('geminiApiKey', key);
                Logger.info('UI', 'API Key saved by user');
            } else {
                localStorage.removeItem('geminiApiKey');
                Logger.info('UI', 'API Key cleared by user');
            }
            apiKeyModal.style.display = 'none';
        });
    }

    if (apiKeyCancel) {
        apiKeyCancel.addEventListener('click', () => {
            apiKeyModal.style.display = 'none';
        });
    }

    // Close modal on backdrop click
    const apiKeyBackdrop = document.querySelector('.api-key-modal-backdrop');
    if (apiKeyBackdrop) {
        apiKeyBackdrop.addEventListener('click', () => {
            apiKeyModal.style.display = 'none';
        });
    }

    // Toggle password visibility
    const toggleVisBtn = document.querySelector('.api-key-toggle-visibility');
    if (toggleVisBtn && apiKeyInput) {
        toggleVisBtn.addEventListener('click', () => {
            const isPassword = apiKeyInput.type === 'password';
            apiKeyInput.type = isPassword ? 'text' : 'password';
            const icon = toggleVisBtn.querySelector('i');
            if (icon) {
                icon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
            }
        });
    }
}

/**
 * Handle AI Remix - Shows manual instructions modal
 */
export function handleRemix() {
    Logger.info('EVENTS', 'Manual Remix instructions opened');
    showManualRemixModal();
}

/**
 * Show manual remix instructions modal
 */
function showManualRemixModal() {
    let modal = document.getElementById('remixInstructionsModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'remixInstructionsModal';
        modal.className = 'remix-modal';
        modal.innerHTML = `
            <div class="remix-modal-backdrop"></div>
            <div class="remix-modal-content">
                <div class="remix-modal-header">
                    <div class="remix-modal-icon">
                        <i class="fa-solid fa-wand-magic-sparkles"></i>
                    </div>
                    <h3>Manuel AI Remix Talimatları</h3>
                    <p>Remix özelliği geçici olarak devre dışıdır. Aşağıdaki adımları takip edin:</p>
                </div>
                <div class="remix-modal-body">
                    <div class="instruction-step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h4>Görseli Gemini'ye Yükleyin</h4>
                            <p>Mevcut görseli <a href="https://gemini.google.com" target="_blank" rel="noopener">gemini.google.com</a> adresine gidin ve görseli yükleyin.</p>
                        </div>
                    </div>
                    <div class="instruction-step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h4>İlk Komutu Yazın</h4>
                            <div class="prompt-box">
                                <code>Create a new vertical image (9:16 aspect ratio) inspired by the image I added, with a similar aesthetic but different and unique.</code>
                                <button class="copy-btn" data-text="Create a new vertical image (9:16 aspect ratio) inspired by the image I added, with a similar aesthetic but different and unique.">
                                    <i class="fa-solid fa-copy"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="instruction-step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h4>Prompt'u İsteyin</h4>
                            <div class="prompt-box">
                                <code>Please also provide me with the complete and detailed English prompt text you used to create this new image.</code>
                                <button class="copy-btn" data-text="Please also provide me with the complete and detailed English prompt text you used to create this new image.">
                                    <i class="fa-solid fa-copy"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="instruction-note">
                        <i class="fa-solid fa-lightbulb"></i>
                        <span>Bu adımları sırayla uygulayarak Gemini'den hem yeni bir görsel hem de kullandığı prompt'u alabilirsiniz.</span>
                    </div>
                </div>
                <div class="remix-modal-footer">
                    <button id="remixModalClose" class="btn-modal btn-modal-save">
                        <i class="fa-solid fa-check"></i> Anladım
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add event listeners
        const backdrop = modal.querySelector('.remix-modal-backdrop');
        const closeBtn = modal.querySelector('#remixModalClose');
        const copyBtns = modal.querySelectorAll('.copy-btn');

        backdrop.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        copyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.dataset.text;
                navigator.clipboard.writeText(text).then(() => {
                    const icon = btn.querySelector('i');
                    icon.className = 'fa-solid fa-check';
                    btn.classList.add('copied');
                    Toast.success('Kopyalandı!');
                    setTimeout(() => {
                        icon.className = 'fa-solid fa-copy';
                        btn.classList.remove('copied');
                    }, 2000);
                }).catch(() => {
                    Toast.error('Kopyalama başarısız!');
                });
            });
        });
    }

    modal.style.display = 'flex';
}
