/**
 * CANVAS MANAGER MODULE
 * Handles all canvas-related operations and export functionality
 * PromtHubs Card Creator v5.4
 */

import { CONFIG } from './config.js';
import { createBlurredImage, waitForImage } from './utils.js';

/**
 * Canvas DOM references
 */
let canvasDOM = {
    exportCanvas: null,
    canvasBlurFill: null,
    canvasBg: null,
    canvasOverlay: null
};

let currentImageSrc = '';

/**
 * Initialize Canvas Manager
 * @param {Object} domElements - Object containing DOM references
 */
export function initCanvas(domElements) {
    canvasDOM = {
        exportCanvas: domElements.exportCanvas,
        canvasBlurFill: domElements.canvasBlurFill,
        canvasBg: domElements.canvasBg,
        canvasOverlay: domElements.canvasOverlay
    };
}

/**
 * Update background images for canvas
 * @param {string} src - Image source URL
 */
export function updateCanvasBackgrounds(src) {
    if (!canvasDOM.canvasBg || !canvasDOM.canvasBlurFill) return;

    currentImageSrc = src;
    canvasDOM.canvasBg.style.backgroundImage = `url('${src}')`;
    canvasDOM.canvasBlurFill.style.backgroundImage = `url('${src}')`;
}

/**
 * Prepare canvas for export by baking effects
 * @param {Object} state - Current application state
 * @returns {Promise<Object>} Original states for restoration
 */
async function prepareForExport(state) {
    const originals = {
        bgUrl: canvasDOM.canvasBg.style.backgroundImage,
        fillUrl: canvasDOM.canvasBlurFill.style.backgroundImage
    };

    if (state.blurBackground) {
        const bakedBlurUrl = await createBlurredImage(
            currentImageSrc,
            CONFIG.BLUR_AMOUNT
        );
        canvasDOM.canvasBg.style.backgroundImage = `url('${bakedBlurUrl}')`;
        canvasDOM.exportCanvas.classList.remove('blur-active');
        canvasDOM.canvasBg.style.transform = 'scale(1.1)';
    }

    if (state.safeZone) {
        const bakedFillUrl = await createBlurredImage(
            currentImageSrc,
            CONFIG.FILL_BLUR_AMOUNT
        );
        canvasDOM.canvasBlurFill.style.backgroundImage = `url('${bakedFillUrl}')`;
        canvasDOM.canvasBlurFill.style.filter = 'none';
        canvasDOM.canvasBlurFill.style.webkitFilter = 'none';
        canvasDOM.canvasBlurFill.style.opacity = '1';
    }

    return originals;
}

/**
 * Restore canvas after export
 * @param {Object} state - Current application state
 * @param {Object} originals - Original states to restore
 */
function restoreAfterExport(state, originals) {
    if (state.blurBackground) {
        canvasDOM.exportCanvas.classList.add('blur-active');
    }

    canvasDOM.canvasBg.style.backgroundImage = originals.bgUrl;
    canvasDOM.canvasBg.style.transform = '';

    if (state.safeZone) {
        canvasDOM.canvasBlurFill.style.backgroundImage = originals.fillUrl;
        canvasDOM.canvasBlurFill.style.filter = '';
        canvasDOM.canvasBlurFill.style.webkitFilter = '';
        canvasDOM.canvasBlurFill.style.opacity = '';
    }
}

/**
 * Capture canvas as high-quality image for export
 * @param {Object} state - Current application state
 * @returns {Promise<string>} Promise resolving to data URL
 */
export async function captureCanvas(state) {
    const originals = await prepareForExport(state);

    try {
        // Wait for styles to settle
        await new Promise(r => setTimeout(r, CONFIG.EXPORT_DELAY_MS));

        // Capture with html2canvas
        const canvas = await html2canvas(canvasDOM.exportCanvas, {
            scale: CONFIG.EXPORT_SCALE,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#000000',
            logging: false,
            imageTimeout: 15000,
            onclone: (clonedDoc) => {
                const clonedCanvas = clonedDoc.getElementById('exportCanvas');
                if (clonedCanvas) {
                    clonedCanvas.style.transform = 'none';
                }
            }
        });

        return canvas.toDataURL('image/png', 1.0);

    } finally {
        restoreAfterExport(state, originals);
    }
}
