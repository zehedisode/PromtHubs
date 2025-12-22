/**
 * UI MODULE INDEX
 * Facade pattern - Tüm UI fonksiyonlarını tek noktadan export eder
 * SOLID: ISP - Sadece ihtiyaç duyulan fonksiyonlar export edilir
 */

// Re-export from sub-modules
export { DOM, initDOM, getElement } from './dom-manager.js';
export {
    updateTextStyles,
    updateSafeZone,
    updateGradientAndBorder,
    updateVisibility,
    updateModelBadge,
    updateInputs,
    syncButtonStates,
    applyThemeColor
} from './updaters.js';
export { renderGallery, renderColorPalette, analyzeCurrentImage } from './renderers.js';
export { setButtonLoading, restoreButton, syncUIWithState } from './helpers.js';

// Import for internal use
import { state } from '../state.js';
import * as updaters from './updaters.js';
import { renderGallery } from './renderers.js';

/**
 * Update all UI elements based on current state
 * Facade function - orchestrates all sub-modules
 * @returns {void}
 */
export function updateUI() {
    updaters.updateTextStyles(state);
    updaters.updateSafeZone(state);
    updaters.updateGradientAndBorder(state);
    updaters.updateVisibility(state);
    updaters.updateModelBadge(state);
    updaters.applyThemeColor(state.themeColor, state.showBorder);
    updaters.updateInputs(state);
    updaters.syncButtonStates(state);
    renderGallery();
}
