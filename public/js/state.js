/**
 * STATE MANAGEMENT MODULE
 * PromtHubs Card Creator v5.4
 * SOLID: OCP - Observable pattern ile genişletmeye açık, değişikliğe kapalı
 */

import { CONFIG, DEFAULT_STATE } from './config.js';
import { Logger } from './logger.js';

/**
 * Observable pattern - State değişikliklerini dinleyicilere bildirir
 * @private
 */
const subscribers = new Map();

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
 * Subscribe to state changes
 * @param {string} key - State property key to watch (or '*' for all changes)
 * @param {Function} callback - Callback function (receives: value, key, oldValue)
 * @returns {Function} Unsubscribe function
 */
export function subscribe(key, callback) {
    if (!subscribers.has(key)) {
        subscribers.set(key, new Set());
    }
    subscribers.get(key).add(callback);

    // Return unsubscribe function
    return () => {
        subscribers.get(key)?.delete(callback);
    };
}

/**
 * Notify subscribers of state change
 * @private
 * @param {string} key - Changed property key
 * @param {*} value - New value
 * @param {*} oldValue - Previous value
 */
function notifySubscribers(key, value, oldValue) {
    // Notify specific key subscribers
    subscribers.get(key)?.forEach(cb => {
        try {
            cb(value, key, oldValue);
        } catch (e) {
            Logger.error('STATE', 'Subscriber callback error', { key, error: e });
        }
    });

    // Notify wildcard subscribers
    subscribers.get('*')?.forEach(cb => {
        try {
            cb(value, key, oldValue);
        } catch (e) {
            Logger.error('STATE', 'Wildcard subscriber callback error', { key, error: e });
        }
    });
}

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
    const oldValue = state[key];

    // Skip if value hasn't changed
    if (oldValue === value) return;

    if (key === 'promptText') {
        Logger.info('STATE', 'Prompt Text Updated', {
            oldValueLength: oldValue ? oldValue.length : 0,
            newValueLength: value ? value.length : 0,
            changeDelta: (value ? value.length : 0) - (oldValue ? oldValue.length : 0),
            timestamp: new Date().toISOString(),
            currentModel: state.model
        });
    }

    state[key] = value;
    saveState();

    // Notify subscribers (Observable pattern)
    notifySubscribers(key, value, oldValue);
}

/**
 * Update multiple state properties at once
 * @param {Object} updates - Object containing key-value pairs to update
 * @returns {void}
 */
export function updateStateMultiple(updates) {
    Object.entries(updates).forEach(([key, value]) => {
        updateState(key, value);
    });
}

/**
 * Add image to gallery
 * @param {string} src - Image source URL or data URL
 * @returns {Object} The added image object
 */
export function addImageToGallery(src) {
    // Remove default image when first user image is added
    const defaultIndex = imageGallery.images.findIndex(img => img.id === 'default');
    if (defaultIndex > -1) {
        imageGallery.images.splice(defaultIndex, 1);
    }

    const newImage = {
        id: 'img-' + Date.now() + Math.random().toString(36).substr(2, 9),
        src: src
    };
    imageGallery.images.push(newImage);

    // Notify gallery subscribers
    notifySubscribers('gallery:add', newImage, null);

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
        const removedImage = imageGallery.images[index];
        const isCurrent = removedImage.src === imageGallery.currentImageSrc;
        imageGallery.images.splice(index, 1);

        // Notify gallery subscribers
        notifySubscribers('gallery:remove', removedImage, null);

        // If removed image was current, switch to last image
        if (isCurrent) {
            const nextImg = imageGallery.images[imageGallery.images.length - 1];
            imageGallery.currentImageSrc = nextImg.src;
            imageGallery.highQualityDownloadSrc = nextImg.src;
            notifySubscribers('gallery:current', nextImg, removedImage);
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
    const oldSrc = imageGallery.currentImageSrc;
    imageGallery.currentImageSrc = src;
    imageGallery.highQualityDownloadSrc = src;

    // Notify gallery subscribers
    notifySubscribers('gallery:current', src, oldSrc);
}
