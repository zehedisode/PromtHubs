/**
 * STATE MANAGEMENT MODULE
 * PromtHubs Card Creator v5.4
 */

import { CONFIG, DEFAULT_STATE } from './config.js';
import { Logger } from './logger.js';

/**
 * Application state
 */
export let state = { ...DEFAULT_STATE };

/**
 * Image gallery state
 */
export const imageGallery = {
    images: [
        { id: 'default', src: CONFIG.DEFAULT_IMAGE }
    ],
    currentImageSrc: CONFIG.DEFAULT_IMAGE,
    highQualityDownloadSrc: CONFIG.DEFAULT_IMAGE
};

/**
 * Load state from localStorage
 * @returns {void}
 */
export function loadState() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state = { ...DEFAULT_STATE, ...parsed };

            // Ensure new properties exist (for version migration)
            if (state.safeZoneScale === undefined) state.safeZoneScale = DEFAULT_STATE.safeZoneScale;
            if (state.gradientIntensity === undefined) state.gradientIntensity = DEFAULT_STATE.gradientIntensity;
            if (state.showOriginalOnly === undefined) state.showOriginalOnly = DEFAULT_STATE.showOriginalOnly;
        } catch (e) {
            Logger.error('STATE', 'Failed to load state', { error: e });
            state = { ...DEFAULT_STATE };
        }
    }
}

/**
 * Save current state to localStorage
 * @returns {void}
 */
export function saveState() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        Logger.error('STATE', 'Failed to save state', { error: e });
    }
}

/**
 * Update a single state property
 * @param {string} key - State property key
 * @param {*} value - New value
 * @returns {void}
 */
export function updateState(key, value) {
    if (key === 'promptText') {
        Logger.info('STATE', 'Prompt Text Updated', {
            oldValueLength: state.promptText ? state.promptText.length : 0,
            newValueLength: value ? value.length : 0,
            changeDelta: (value ? value.length : 0) - (state.promptText ? state.promptText.length : 0),
            timestamp: new Date().toISOString(),
            // We can add more context here if needed, like current Model selected
            currentModel: state.model
        });
    }

    state[key] = value;
    saveState();
}

/**
 * Add image to gallery
 * @param {string} src - Image source URL or data URL
 * @returns {Object} The added image object
 */
export function addImageToGallery(src) {
    const newImage = {
        id: 'img-' + Date.now() + Math.random().toString(36).substr(2, 9),
        src: src
    };
    imageGallery.images.push(newImage);
    return newImage;
}

/**
 * Remove image from gallery by ID
 * @param {string} id - Image ID to remove
 * @returns {boolean} Success status
 */
export function removeImageFromGallery(id) {
    if (imageGallery.images.length <= 1) {
        return false; // Must keep at least one image
    }

    const index = imageGallery.images.findIndex(img => img.id === id);
    if (index > -1) {
        const isCurrent = imageGallery.images[index].src === imageGallery.currentImageSrc;
        imageGallery.images.splice(index, 1);

        // If removed image was current, switch to last image
        if (isCurrent) {
            const nextImg = imageGallery.images[imageGallery.images.length - 1];
            imageGallery.currentImageSrc = nextImg.src;
            imageGallery.highQualityDownloadSrc = nextImg.src;
            return true; // Signal that current image changed
        }
    }
    return false;
}

/**
 * Set current active image
 * @param {string} src - Image source to set as current
 * @returns {void}
 */
export function setCurrentImage(src) {
    imageGallery.currentImageSrc = src;
    imageGallery.highQualityDownloadSrc = src;
}
