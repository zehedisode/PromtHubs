/**
 * MAIN ENTRY POINT
 * PromtHubs Card Creator v5.4
 * 
 * Modern, modular architecture for professional card creation
 */

import { CONFIG } from './config.js';
import { loadState, imageGallery } from './state.js';
import { initDOM, syncUIWithState, analyzeCurrentImage, DOM } from './ui.js';
import { initCanvas } from './canvas-manager.js';
import { bindEvents, restoreAccordionStates } from './events.js';
import { initGlobalErrorHandlers } from './error-handler.js';
import { Logger } from './logger.js';

/**
 * Initialize the application
 * @returns {void}
 */
function init() {
    try {
        // 0. Initialize Error Handling
        initGlobalErrorHandlers();

        Logger.info('APP', `Starting PromtHubs Card Creator v${CONFIG.APP_VERSION}`);

        // 1. Initialize DOM references
        initDOM();
        initCanvas(DOM);

        // 2. Load saved state from localStorage
        loadState();

        // 3. Bind all event listeners
        bindEvents();

        // 4. Sync UI with loaded state
        syncUIWithState();

        // 5. Restore accordion sections state
        restoreAccordionStates();

        // 6. Analyze default image for color palette
        analyzeCurrentImage();

        Logger.info('APP', 'Application initialized successfully');
    } catch (criticalError) {
        console.error("CRITICAL INIT ERROR:", criticalError);
        alert("Uygulama başlatılırken kritik bir hata oluştu: " + criticalError.message);
    }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
