/**
 * UI UPDATERS
 * Render ve güncelleme fonksiyonları
 * SOLID: SRP - Sadece UI güncelleme işlemlerinden sorumlu
 */

import { DOM } from './dom-manager.js';
import { CONFIG } from '../config.js';
import { hexToRgba } from '../utils.js';

/**
 * Update prompt text and font styles
 * @param {Object} state - current application state
 */
export function updateTextStyles(state) {
    DOM.promptText.textContent = state.promptText || "Metin giriniz...";
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
export function updateSafeZone(state) {
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
export function updateGradientAndBorder(state) {
    DOM.canvasOverlay.style.opacity = state.gradientIntensity / 100;
    DOM.gradControlGroup.style.display = state.showBorder ? 'flex' : 'none';
}

/**
 * Update element visibility (border, text, blur)
 * @param {Object} state - current application state
 */
export function updateVisibility(state) {
    // Original Only mode - hide all overlays
    if (state.showOriginalOnly) {
        DOM.mainBorder.style.opacity = '0';
        DOM.textContainer.style.opacity = '0';
        DOM.canvasOverlay.style.opacity = '0';
        DOM.canvasBlurFill.style.display = 'none';
        DOM.topBranding.style.opacity = '0';
        DOM.exportCanvas.classList.remove('blur-active');
        DOM.exportCanvas.classList.remove('safe-zone-active');
        DOM.exportCanvas.style.setProperty('--sz-top', '0px');
        DOM.exportCanvas.style.setProperty('--sz-right', '0px');
        DOM.exportCanvas.style.setProperty('--sz-bottom', '0px');
        DOM.exportCanvas.style.setProperty('--sz-left', '0px');
        return;
    }

    // Normal mode - restore safe zone if active
    if (state.safeZone) {
        const scale = state.safeZoneScale / 100;
        const size = CONFIG.SAFE_ZONE_BASE * scale;
        DOM.exportCanvas.style.setProperty('--sz-top', `${size}px`);
        DOM.exportCanvas.style.setProperty('--sz-right', `${size}px`);
        DOM.exportCanvas.style.setProperty('--sz-bottom', `${size}px`);
        DOM.exportCanvas.style.setProperty('--sz-left', `${size}px`);
    }

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
export function updateModelBadge(state) {
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
export function updateInputs(state) {
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
 * @param {Object} state - current application state
 */
export function syncButtonStates(state) {
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
 * @param {boolean} showBorder - Whether border is visible
 */
export function applyThemeColor(color, showBorder) {
    DOM.exportCanvas.style.setProperty('--theme-color', color);

    // Update palette selection
    const swatches = DOM.colorPalette.querySelectorAll('.color-swatch');
    swatches.forEach(sw => {
        sw.classList.toggle('active', sw.dataset.color === color);
    });

    // Update border shadow
    if (showBorder) {
        DOM.mainBorder.style.boxShadow = `0 0 15px ${hexToRgba(color, 0.3)}`;
    }
}
