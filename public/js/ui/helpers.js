/**
 * UI HELPERS
 * Button loading ve diğer yardımcı fonksiyonlar
 * SOLID: SRP - Yardımcı UI fonksiyonları
 */

import { DOM } from './dom-manager.js';
import { state } from '../state.js';

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
}
