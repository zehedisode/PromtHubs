/**
 * EVENTS MODULE - Main Entry Point
 * Handles all event listeners and user interactions
 * PromtHubs Card Creator v5.4
 * 
 * This module re-exports from specialized sub-modules for cleaner organization.
 */

import { DOM, updateUI } from '../ui.js';
import { updateState } from '../state.js';
import { Logger } from '../logger.js';

// Import handlers from sub-modules
import {
    handlePromptInput,
    handleFontSizeChange,
    handleTextPositionChange,
    handleGradientIntensityChange,
    handleSafeZoneScaleChange,
    handleModelChange,
    handleFontChange,
    handleAlignmentChange,
    handleBorderToggle,
    handleTextToggle,
    handleBlurToggle,
    handleSafeZoneToggle,
    handleOriginalOnlyToggle
} from './input-handlers.js';

import {
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleGlobalDragOver,
    handleGlobalDragLeave,
    handleGlobalDrop,
    handleImageInputChange,
    handleImageSelected
} from './drag-drop.js';

import { handleExport } from './export.js';
import { bindApiKeyEvents, handleRemix } from './modal.js';
import { handleImageRemoved } from './gallery.js';
import { bindAccordionEvents, restoreAccordionStates } from './accordion.js';

// Re-export for external use
export { restoreAccordionStates };

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
