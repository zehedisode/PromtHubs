/**
 * UI MODULE
 * Handles all DOM manipulations and UI updates
 * PromtHubs Card Creator v5.4
 */

import { state, imageGallery } from './state.js';
import { CONFIG } from './config.js';
import { hexToRgba, analyzeImageColors } from './utils.js';
import { updateCanvasBackgrounds } from './canvas-manager.js';

/**
 * DOM elements cache
 */
export const DOM = {
    // Inputs
    imageInput: null,
    dropZone: null,
    imageGallery: null,
    colorPalette: null,
    promptInput: null,
    fontSizeSlider: null,
    fontSizeVal: null,
    posSlider: null,
    posVal: null,

    // Gradient Controls
    gradControlGroup: null,
    gradSlider: null,
    gradVal: null,

    // Safe Zone Inputs
    safeZoneControls: null,
    szScaleSlider: null,
    szScaleVal: null,

    // Button groups
    modelGroup: null,
    fontGroup: null,
    alignGroup: null,

    // Toggles
    checkBorder: null,
    checkText: null,
    checkBlur: null,
    checkSafeZone: null,
    checkOriginalOnly: null,

    // Buttons
    btnExport: null,
    btnRemix: null,

    // Canvas Elements
    exportCanvas: null,
    canvasBlurFill: null,
    canvasBg: null,
    canvasOverlay: null,
    textContainer: null,
    modelBadge: null,
    promptText: null,
    promptLabel: null,
    topBranding: null,
    topBrandingSpan: null,
    mainBorder: null,

    // Hidden Analysis
    analysisCanvas: null
};

/**
 * Initialize DOM element references
 * @returns {void}
 */
export function initDOM() {
    // Inputs
    DOM.imageInput = document.getElementById('imageInput');
    DOM.dropZone = document.getElementById('dropZone');
    DOM.imageGallery = document.getElementById('imageGallery');
    DOM.colorPalette = document.getElementById('colorPalette');
    DOM.promptInput = document.getElementById('promptInput');
    DOM.fontSizeSlider = document.getElementById('fontSizeSlider');
    DOM.fontSizeVal = document.getElementById('fontSizeVal');
    DOM.posSlider = document.getElementById('posSlider');
    DOM.posVal = document.getElementById('posVal');

    // Gradient Controls
    DOM.gradControlGroup = document.getElementById('gradControlGroup');
    DOM.gradSlider = document.getElementById('gradSlider');
    DOM.gradVal = document.getElementById('gradVal');

    // Safe Zone Inputs
    DOM.safeZoneControls = document.getElementById('safeZoneControls');
    DOM.szScaleSlider = document.getElementById('szScaleSlider');
    DOM.szScaleVal = document.getElementById('szScaleVal');

    // Button groups
    DOM.modelGroup = document.getElementById('modelGroup');
    DOM.fontGroup = document.getElementById('fontGroup');
    DOM.alignGroup = document.getElementById('alignGroup');

    // Toggles
    DOM.checkBorder = document.getElementById('checkBorder');
    DOM.checkText = document.getElementById('checkText');
    DOM.checkBlur = document.getElementById('checkBlur');
    DOM.checkSafeZone = document.getElementById('checkSafeZone');
    DOM.checkOriginalOnly = document.getElementById('checkOriginalOnly');

    // Buttons
    DOM.btnExport = document.getElementById('btnExport');
    DOM.btnRemix = document.getElementById('btnRemix');

    // Canvas Elements
    DOM.exportCanvas = document.getElementById('exportCanvas');
    DOM.canvasBlurFill = document.getElementById('canvasBlurFill');
    DOM.canvasBg = document.getElementById('canvasBg');
    DOM.canvasOverlay = document.getElementById('canvasOverlay');
    DOM.textContainer = document.getElementById('textContainer');
    DOM.modelBadge = document.getElementById('modelBadge');
    DOM.promptText = document.getElementById('promptText');
    DOM.promptLabel = document.getElementById('promptLabel');
    DOM.topBranding = document.querySelector('.top-branding');
    DOM.topBrandingSpan = document.querySelector('.top-branding span');
    DOM.mainBorder = document.getElementById('mainBorder');

    // Hidden Analysis
    DOM.analysisCanvas = document.getElementById('analysisCanvas');
}

/**
 * Update all UI elements based on current state
 * @returns {void}
 */
/**
 * Update all UI elements based on current state
 * @returns {void}
 */
export function updateUI() {
    updateTextStyles(state);
    updateSafeZone(state);
    updateGradientAndBorder(state);
    updateVisibility(state);
    updateModelBadge(state);
    applyThemeColor(state.themeColor);
    updateInputs(state);

    syncButtonStates();
    renderGallery();
}

/**
 * Update prompt text and font styles
 * @param {Object} state - current application state
 */
function updateTextStyles(state) {
    // Text Content
    DOM.promptText.textContent = state.promptText || "Metin giriniz...";

    // Font Settings
    DOM.promptText.style.fontFamily = state.fontFamily;
    DOM.promptText.style.fontSize = `${state.fontSize}px`;

    // Alignment
    DOM.textContainer.style.textAlign = state.alignment;
    if (state.alignment === 'center') {
        DOM.textContainer.style.display = 'flex';
        DOM.textContainer.style.flexDirection = 'column';
        DOM.textContainer.style.alignItems = 'center';
    } else if (state.alignment === 'right') {
        DOM.textContainer.style.display = 'flex';
        DOM.textContainer.style.flexDirection = 'column';
        DOM.textContainer.style.alignItems = 'flex-end';
    } else {
        DOM.textContainer.style.display = 'block';
    }

    // Position
    DOM.exportCanvas.style.setProperty('--pos-padding', `${state.textPosition}px`);
}

/**
 * Update safe zone visualisation
 * @param {Object} state - current application state
 */
function updateSafeZone(state) {
    const scale = state.safeZoneScale / 100;
    const SYMMETRICAL_BASE = CONFIG.SAFE_ZONE_BASE;
    let size = 0;

    if (state.safeZone) {
        DOM.exportCanvas.classList.add('safe-zone-active');
        DOM.safeZoneControls.style.display = 'flex';
        size = SYMMETRICAL_BASE * scale;
    } else {
        DOM.exportCanvas.classList.remove('safe-zone-active');
        DOM.safeZoneControls.style.display = 'none';
    }

    DOM.exportCanvas.style.setProperty('--sz-top', `${size}px`);
    DOM.exportCanvas.style.setProperty('--sz-right', `${size}px`);
    DOM.exportCanvas.style.setProperty('--sz-bottom', `${size}px`);
    DOM.exportCanvas.style.setProperty('--sz-left', `${size}px`);
}

/**
 * Update gradient overlay and border settings
 * @param {Object} state - current application state
 */
function updateGradientAndBorder(state) {
    // Gradient & Border
    DOM.canvasOverlay.style.opacity = state.gradientIntensity / 100;
    if (state.showBorder) {
        DOM.gradControlGroup.style.display = 'flex';
    } else {
        DOM.gradControlGroup.style.display = 'none';
    }
}

/**
 * Update element visibility (border, text, blur)
 * @param {Object} state - current application state
 */
function updateVisibility(state) {
    // Original Only mode - hide all overlays
    if (state.showOriginalOnly) {
        DOM.mainBorder.style.opacity = '0';
        DOM.textContainer.style.opacity = '0';
        DOM.canvasOverlay.style.opacity = '0';
        DOM.canvasBlurFill.style.display = 'none';
        DOM.topBranding.style.opacity = '0';
        DOM.exportCanvas.classList.remove('blur-active');
        DOM.exportCanvas.classList.remove('safe-zone-active');
        return;
    }

    // Normal mode
    DOM.canvasOverlay.style.opacity = state.gradientIntensity / 100;
    DOM.canvasBlurFill.style.display = '';
    DOM.topBranding.style.opacity = '1';
    DOM.mainBorder.style.opacity = state.showBorder ? '1' : '0';
    DOM.textContainer.style.opacity = state.showText ? '1' : '0';

    // Blur
    if (state.blurBackground) {
        DOM.exportCanvas.classList.add('blur-active');
    } else {
        DOM.exportCanvas.classList.remove('blur-active');
    }
}

/**
 * Update AI model badge
 * @param {Object} state - current application state
 */
function updateModelBadge(state) {
    if (state.model === 'None') {
        DOM.modelBadge.style.display = 'none';
    } else {
        DOM.modelBadge.style.display = 'inline-block';
        DOM.modelBadge.textContent = state.model;
    }
}

/**
 * Sync input values with state
 * @param {Object} state - current application state
 */
function updateInputs(state) {
    DOM.fontSizeVal.textContent = `${state.fontSize}px`;
    DOM.posVal.textContent = `${state.textPosition}px`;
    DOM.gradVal.textContent = `${state.gradientIntensity}%`;
    DOM.fontSizeSlider.value = state.fontSize;
    DOM.posSlider.value = state.textPosition;
    DOM.gradSlider.value = state.gradientIntensity;
    DOM.szScaleVal.textContent = `${state.safeZoneScale}%`;
    DOM.szScaleSlider.value = state.safeZoneScale;

    // Toggles Sync
    DOM.checkBorder.checked = state.showBorder;
    DOM.checkText.checked = state.showText;
    DOM.checkBlur.checked = state.blurBackground;
    DOM.checkSafeZone.checked = state.safeZone;
    if (DOM.checkOriginalOnly) DOM.checkOriginalOnly.checked = state.showOriginalOnly;
}

/**
 * Sync button group active states
 * @returns {void}
 */
function syncButtonStates() {
    [...DOM.modelGroup.children].forEach(b =>
        b.classList.toggle('active', b.dataset.value === state.model)
    );
    [...DOM.fontGroup.children].forEach(b =>
        b.classList.toggle('active', b.dataset.family === state.fontFamily)
    );
    [...DOM.alignGroup.children].forEach(b =>
        b.classList.toggle('active', b.dataset.align === state.alignment)
    );
}

/**
 * Apply theme color to UI elements
 * @param {string} color - Hex color string
 * @returns {void}
 */
function applyThemeColor(color) {
    DOM.exportCanvas.style.setProperty('--theme-color', color);

    // Update palette selection
    const swatches = DOM.colorPalette.querySelectorAll('.color-swatch');
    swatches.forEach(sw => {
        if (sw.dataset.color === color) {
            sw.classList.add('active');
        } else {
            sw.classList.remove('active');
        }
    });

    // Update border shadow
    if (state.showBorder) {
        DOM.mainBorder.style.boxShadow = `0 0 15px ${hexToRgba(color, 0.3)}`;
    }
}

/**
 * Render image gallery
 * @returns {void}
 */
export function renderGallery() {
    DOM.imageGallery.innerHTML = '';

    imageGallery.images.forEach(imgData => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        if (imgData.src === imageGallery.currentImageSrc) {
            item.classList.add('active');
        }

        const img = document.createElement('img');
        img.src = imgData.src;
        item.appendChild(img);

        // Click to select
        item.addEventListener('click', () => {
            const event = new CustomEvent('gallery-image-selected', {
                detail: { src: imgData.src }
            });
            document.dispatchEvent(event);
        });

        // Remove button
        const removeBtn = document.createElement('div');
        removeBtn.className = 'gallery-remove';
        removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const event = new CustomEvent('gallery-image-removed', {
                detail: { id: imgData.id }
            });
            document.dispatchEvent(event);
        });
        item.appendChild(removeBtn);

        DOM.imageGallery.appendChild(item);
    });
}

/**
 * Render color palette UI
 * @param {Array<Object>} paletteColors - Array of color objects
 * @returns {void}
 */
export function renderColorPalette(paletteColors) {
    DOM.colorPalette.innerHTML = '';

    paletteColors.forEach(p => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = p.color;
        swatch.dataset.color = p.color;

        // Tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'color-tooltip';
        tooltip.innerText = p.label;
        swatch.appendChild(tooltip);

        // Click handler
        swatch.onclick = () => {
            const event = new CustomEvent('color-selected', {
                detail: { color: p.color }
            });
            document.dispatchEvent(event);
        };

        DOM.colorPalette.appendChild(swatch);
    });
}

/**
 * Analyze current image and update color palette
 * @returns {void}
 */
export function analyzeCurrentImage() {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageGallery.currentImageSrc;

    img.onload = () => {
        const palette = analyzeImageColors(img, DOM.analysisCanvas);
        renderColorPalette(palette);

        // Auto-select first color (vibrant)
        if (palette.length > 0) {
            state.themeColor = palette[0].color;
            updateUI();
        }
    };
}


/**
 * Set button loading state
 * @param {HTMLButtonElement} button - Button element
 * @param {boolean} isLoading - Loading state
 * @param {string} loadingText - Text to show when loading
 * @returns {string} Original button text
 */
export function setButtonLoading(button, isLoading, loadingText = 'Loading...') {
    if (isLoading) {
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = loadingText;
        return originalText;
    } else {
        button.disabled = false;
        return '';
    }
}

/**
 * Restore button to original state
 * @param {HTMLButtonElement} button - Button element
 * @param {string} originalText - Original button text
 * @returns {void}
 */
export function restoreButton(button, originalText) {
    button.disabled = false;
    button.innerHTML = originalText;
}

/**
 * Sync UI inputs with loaded state
 * @returns {void}
 */
export function syncUIWithState() {
    DOM.promptInput.value = state.promptText;
    DOM.checkSafeZone.checked = state.safeZone;
    DOM.checkBlur.checked = state.blurBackground;
    updateUI();
}
