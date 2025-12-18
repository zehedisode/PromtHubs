/**
 * GALLERY MODULE
 * Handles image gallery events and image removal
 * PromtHubs Card Creator v5.4
 */

import { removeImageFromGallery, imageGallery } from '../state.js';
import { updateCanvasBackgrounds } from '../canvas-manager.js';
import { analyzeCurrentImage, updateUI } from '../ui.js';

/**
 * Handle image removal from gallery
 * @param {string} id - Image ID to remove
 */
export function handleImageRemoved(id) {
    const currentChanged = removeImageFromGallery(id);

    if (currentChanged) {
        // Current image was removed, update to new current
        updateCanvasBackgrounds(imageGallery.currentImageSrc);
        analyzeCurrentImage();
    }

    updateUI();
}
