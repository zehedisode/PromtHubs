/**
 * EVENTS MODULE
 * Handles all event listeners and user interactions
 * PromtHubs Card Creator v5.4
 */

import { state, updateState, addImageToGallery, removeImageFromGallery, setCurrentImage, imageGallery } from './state.js';
import {
    DOM,
    updateUI,
    renderGallery,
    analyzeCurrentImage,
    setButtonLoading,
    restoreButton
} from './ui.js';
import { updateCanvasBackgrounds, captureCanvas } from './canvas-manager.js';
import { handleFileUpload, downloadDataUrl } from './utils.js';
import { remixImageWithAI } from './api.js';
import { Logger } from './logger.js';
import { Toast } from './toast.js';

/**
 * Set active button in a button group
 * @param {HTMLElement} group - Button group container
 * @param {HTMLElement} activeBtn - Button to set as active
 * @returns {void}
 */
function setActiveBtn(group, activeBtn) {
    group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');
}

/**
 * Bind all event listeners
 * @returns {void}
 */
/**
 * Bind all event listeners
 * @returns {void}
 */
export function bindEvents() {
    // Text Input
    DOM.promptInput.addEventListener('input', handlePromptInput);

    // Sliders
    DOM.fontSizeSlider.addEventListener('input', handleFontSizeChange);
    DOM.posSlider.addEventListener('input', handleTextPositionChange);
    DOM.gradSlider.addEventListener('input', handleGradientIntensityChange);
    DOM.szScaleSlider.addEventListener('input', handleSafeZoneScaleChange);

    // Button Groups
    DOM.modelGroup.addEventListener('click', handleModelChange);
    DOM.fontGroup.addEventListener('click', handleFontChange);
    DOM.alignGroup.addEventListener('click', handleAlignmentChange);

    // Toggles
    DOM.checkBorder.addEventListener('change', handleBorderToggle);
    DOM.checkText.addEventListener('change', handleTextToggle);
    DOM.checkBlur.addEventListener('change', handleBlurToggle);
    DOM.checkSafeZone.addEventListener('change', handleSafeZoneToggle);
    if (DOM.checkOriginalOnly) {
        DOM.checkOriginalOnly.addEventListener('change', handleOriginalOnlyToggle);
    }

    // Image Upload - Click
    DOM.dropZone.addEventListener('click', () => {
        Logger.debug('EVENTS', 'DropZone clicked');
        DOM.imageInput.click();
    });

    // Image Upload - Drag & Drop (Local dropzone)
    DOM.dropZone.addEventListener('dragover', handleDragOver);
    DOM.dropZone.addEventListener('dragleave', handleDragLeave);
    DOM.dropZone.addEventListener('drop', handleDrop);

    // Global Drag & Drop - Entire page
    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('dragleave', handleGlobalDragLeave);
    document.addEventListener('drop', handleGlobalDrop);

    DOM.imageInput.addEventListener('change', handleImageInputChange);

    // Export & Remix
    DOM.btnExport.addEventListener('click', handleExport);
    DOM.btnRemix.addEventListener('click', handleRemix);

    // Custom Events
    document.addEventListener('gallery-image-selected', (e) => {
        handleImageSelected(e.detail.src);
    });

    document.addEventListener('gallery-image-removed', (e) => {
        handleImageRemoved(e.detail.id);
    });

    document.addEventListener('color-selected', (e) => {
        updateState('themeColor', e.detail.color);
        updateUI();
    });

    // API Key Modal Handlers
    bindApiKeyEvents();

    // Accordion Events
    bindAccordionEvents();
}

/**
 * Bind API Key modal related events
 */
function bindApiKeyEvents() {
    const apiKeyBtn = document.getElementById('btnApiKey');
    const apiKeyModal = document.getElementById('apiKeyModal');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const apiKeySave = document.getElementById('apiKeySave');
    const apiKeyCancel = document.getElementById('apiKeyCancel');

    if (apiKeyBtn && apiKeyModal) {
        apiKeyBtn.addEventListener('click', () => {
            apiKeyModal.style.display = 'flex';
            // Pre-fill if already saved
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
 * Handle prompt text input
 * @param {Event} e 
 */
function handlePromptInput(e) {
    Logger.debug('UI', 'Input event fired', { type: 'input' });
    updateState('promptText', e.target.value);
    updateUI();
}

/**
 * Handle font size slider change
 * @param {Event} e 
 */
function handleFontSizeChange(e) {
    updateState('fontSize', parseInt(e.target.value));
    updateUI();
}

/**
 * Handle text position slider change
 * @param {Event} e 
 */
function handleTextPositionChange(e) {
    updateState('textPosition', parseInt(e.target.value));
    updateUI();
}

/**
 * Handle gradient intensity slider change
 * @param {Event} e 
 */
function handleGradientIntensityChange(e) {
    updateState('gradientIntensity', parseInt(e.target.value));
    updateUI();
}

/**
 * Handle safe zone scale slider change
 * @param {Event} e 
 */
function handleSafeZoneScaleChange(e) {
    updateState('safeZoneScale', parseInt(e.target.value));
    updateUI();
}

/**
 * Handle model selection
 * @param {Event} e 
 */
function handleModelChange(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    setActiveBtn(DOM.modelGroup, btn);
    updateState('model', btn.dataset.value);
    updateUI();
}

/**
 * Handle font selection
 * @param {Event} e 
 */
function handleFontChange(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    setActiveBtn(DOM.fontGroup, btn);
    updateState('fontFamily', btn.dataset.family);
    updateUI();
}

/**
 * Handle alignment selection
 * @param {Event} e 
 */
function handleAlignmentChange(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    setActiveBtn(DOM.alignGroup, btn);
    updateState('alignment', btn.dataset.align);
    updateUI();
}

/**
 * Handle border toggle
 * @param {Event} e 
 */
function handleBorderToggle(e) {
    updateState('showBorder', e.target.checked);
    updateUI();
}

/**
 * Handle text visibility toggle
 * @param {Event} e 
 */
function handleTextToggle(e) {
    updateState('showText', e.target.checked);
    updateUI();
}

/**
 * Handle blur toggle
 * @param {Event} e 
 */
function handleBlurToggle(e) {
    updateState('blurBackground', e.target.checked);
    updateUI();
}

/**
 * Handle safe zone toggle
 * @param {Event} e 
 */
function handleSafeZoneToggle(e) {
    updateState('safeZone', e.target.checked);
    updateUI();
}

/**
 * Handle original only toggle
 * @param {Event} e 
 */
function handleOriginalOnlyToggle(e) {
    updateState('showOriginalOnly', e.target.checked);
    updateUI();
}

/**
 * Handle drag over event for dropzone
 * @param {Event} e 
 */
function handleDragOver(e) {
    e.preventDefault();
    DOM.dropZone.style.borderColor = "var(--brand-yellow)";
}

/**
 * Handle drag leave event for dropzone
 * @param {Event} e 
 */
function handleDragLeave(e) {
    e.preventDefault();
    DOM.dropZone.style.borderColor = "var(--brand-border)";
}

/**
 * Handle file drop event
 * @param {Event} e 
 */
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    DOM.dropZone.style.borderColor = "var(--brand-border)";
    document.body.classList.remove('global-drag-active');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleImageFiles(e.dataTransfer.files);
    }
}

/**
 * Handle global drag over event (entire page)
 * @param {Event} e 
 */
function handleGlobalDragOver(e) {
    e.preventDefault();
    // Only show visual feedback for file drags
    if (e.dataTransfer.types.includes('Files')) {
        document.body.classList.add('global-drag-active');
    }
}

/**
 * Handle global drag leave event
 * @param {Event} e 
 */
function handleGlobalDragLeave(e) {
    e.preventDefault();
    // Only remove class if leaving the document entirely
    if (e.target === document.documentElement || !e.relatedTarget) {
        document.body.classList.remove('global-drag-active');
    }
}

/**
 * Handle global file drop event
 * @param {Event} e 
 */
function handleGlobalDrop(e) {
    e.preventDefault();
    document.body.classList.remove('global-drag-active');

    // Only process image files
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const imageFiles = Array.from(e.dataTransfer.files).filter(
            file => file.type.startsWith('image/')
        );
        if (imageFiles.length > 0) {
            handleImageFiles(imageFiles);
        }
    }
}

/**
 * Handle image input change
 * @param {Event} e 
 */
function handleImageInputChange(e) {
    if (e.target.files && e.target.files.length > 0) {
        handleImageFiles(e.target.files);
    }
}

/**
 * Bind accordion section toggle events
 * @returns {void}
 */
function bindAccordionEvents() {
    document.querySelectorAll('.section-header').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.closest('.accordion-section');
            const content = section.querySelector('.section-content');
            const isExpanded = content.classList.contains('expanded');

            // Toggle
            content.classList.toggle('expanded');
            header.classList.toggle('active');

            // Save state
            const sectionId = section.dataset.section;
            localStorage.setItem(`accordion-${sectionId}`, !isExpanded);
        });
    });
}

/**
 * Restore accordion states from localStorage
 * @returns {void}
 */
export function restoreAccordionStates() {
    document.querySelectorAll('.accordion-section').forEach(section => {
        const sectionId = section.dataset.section;
        const savedState = localStorage.getItem(`accordion-${sectionId}`);

        // Default: media and style open, effects and layout closed
        const defaultOpen = (sectionId === 'media' || sectionId === 'style');
        const shouldBeOpen = savedState !== null ? savedState === 'true' : defaultOpen;

        if (shouldBeOpen) {
            const header = section.querySelector('.section-header');
            const content = section.querySelector('.section-content');
            header.classList.add('active');
            content.classList.add('expanded');
        }
    });
}

/**
 * Handle image file uploads
 * @param {FileList} files - Files to upload
 * @returns {void}
 */
function handleImageFiles(files) {
    handleFileUpload(files, (src) => {
        Logger.info('EVENTS', 'Image uploaded');
        addImageToGallery(src);
        handleImageSelected(src);
        Toast.success('Görsel başarıyla yüklendi');
    });
}

/**
 * Handle image selection from gallery
 * @param {string} src - Image source URL
 * @returns {void}
 */
function handleImageSelected(src) {
    setCurrentImage(src);
    updateCanvasBackgrounds(src);
    analyzeCurrentImage();
    updateUI();
}

/**
 * Handle image removal from gallery
 * @param {string} id - Image ID to remove
 * @returns {void}
 */
function handleImageRemoved(id) {
    const currentChanged = removeImageFromGallery(id);

    if (currentChanged) {
        // Current image was removed, update to new current
        updateCanvasBackgrounds(imageGallery.currentImageSrc);
        analyzeCurrentImage();
    }

    updateUI();
}

/**
 * Handle PNG export
 * @returns {Promise<void>}
 */
async function handleExport() {
    Logger.info('EVENTS', 'Export started');
    const originalText = setButtonLoading(
        DOM.btnExport,
        true,
        '<div class="spinner"></div> İşleniyor...'
    );

    try {
        // 1. Capture edited card
        const dataUrl = await captureCanvas(state);

        // 2. Download edited card locally
        const filename = `promthubs-styled-card-${Date.now()}.png`;
        downloadDataUrl(dataUrl, filename);
        Toast.success('Kart indirildi!');

        // 3. Send edited card to Telegram
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

            const result = await response.json();

            if (!response.ok) {
                if (result.error && result.error.includes('TELEGRAM_CHANNEL_ID')) {
                    Toast.error('Telegram Hatası: Kanal ID eksik (.env)');
                } else {
                    throw new Error(result.error || 'Server Error');
                }
            } else {
                Toast.success('Editli kart Telegram\'a gönderildi! 🎨');
            }

            // 4. Send all original photos to Telegram (excluding default)
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

        } catch (tgError) {
            console.error('Telegram Upload Error:', tgError);
            Logger.error('EVENTS', 'Telegram upload failed', tgError);

            if (tgError.name === 'AbortError') {
                Toast.error('Telegram gönderimi zaman aşımına uğradı');
            } else if (tgError.message && tgError.message.includes('Failed to fetch')) {
                Toast.error('Backend sunucusu çalışmıyor olabilir');
                Logger.warn('EVENTS', 'Backend likely not running');
            } else {
                Toast.error('Telegram hatası: ' + (tgError.message || 'Bilinmeyen hata'));
            }
        }

        Logger.info('EVENTS', 'Export successful', { filename });

    } catch (err) {
        Logger.error('EVENTS', 'Export Failed', { box: err.message });
        Toast.error('Bir hata oluştu: ' + err.message);
    } finally {
        restoreButton(DOM.btnExport, originalText);
    }
}

/**
 * Handle AI Remix - Shows manual instructions modal (temporarily disabled auto-remix)
 * @returns {void}
 */
function handleRemix() {
    Logger.info('EVENTS', 'Manual Remix instructions opened');
    showManualRemixModal();
}

/**
 * Show manual remix instructions modal
 * @returns {void}
 */
function showManualRemixModal() {
    // Check if modal already exists
    let modal = document.getElementById('remixInstructionsModal');

    if (!modal) {
        // Create modal HTML
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
