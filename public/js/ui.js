/**
 * UI MODULE
 * Handles all DOM manipulations and UI updates
 * PromtHubs Card Creator v5.4
 * 
 * REFACTORED: Bu dosya artık alt modüllerden re-export yapan bir facade
 * Alt modüller: ui/dom-manager.js, ui/updaters.js, ui/renderers.js, ui/helpers.js
 */

// Re-export everything from the modular UI system
export {
    // DOM Management
    DOM,
    initDOM,
    getElement,

    // UI Updates
    updateUI,
    updateTextStyles,
    updateSafeZone,
    updateGradientAndBorder,
    updateVisibility,
    updateModelBadge,
    updateInputs,
    syncButtonStates,
    applyThemeColor,

    // Renderers
    renderGallery,
    renderColorPalette,
    analyzeCurrentImage,

    // Helpers
    setButtonLoading,
    restoreButton,
    syncUIWithState
} from './ui/index.js';
