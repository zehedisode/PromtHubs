/**
 * IMAGE LOADER
 * DRY: Tekrarlanan image loading pattern'ları tek yerde
 * SOLID: SRP - Sadece imaj yükleme işlemlerinden sorumlu
 */

import { Logger } from '../logger.js';

/**
 * Unified image loading utility
 * DRY: utils.js'deki tekrarlanan Image loading kodlarını standardize eder
 */
export class ImageLoader {
    /**
     * Load an image with Promise-based API
     * @param {string} src - Image source URL
     * @param {Object} options - Loading options
     * @param {boolean} options.crossOrigin - Enable CORS (default: true)
     * @param {number} options.timeout - Timeout in ms (default: 15000)
     * @returns {Promise<HTMLImageElement>} Loaded image element
     */
    static load(src, options = {}) {
        const { crossOrigin = true, timeout = 15000 } = options;

        return new Promise((resolve, reject) => {
            const img = new Image();

            if (crossOrigin) {
                img.crossOrigin = "Anonymous";
            }

            // Timeout handling
            const timeoutId = setTimeout(() => {
                reject(new Error(`Image load timeout: ${src}`));
            }, timeout);

            img.onload = () => {
                clearTimeout(timeoutId);
                resolve(img);
            };

            img.onerror = (e) => {
                clearTimeout(timeoutId);
                Logger.error('IMAGE_LOADER', 'Failed to load image', { src, error: e });
                reject(new Error(`Failed to load image: ${src}`));
            };

            img.src = src;
        });
    }

    /**
     * Load image and return with dimensions info
     * @param {string} src - Image source URL
     * @param {Object} options - Loading options
     * @returns {Promise<{img: HTMLImageElement, width: number, height: number}>}
     */
    static async loadWithDimensions(src, options = {}) {
        const img = await this.load(src, options);
        return {
            img,
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height
        };
    }

    /**
     * Check if an image element is already loaded
     * @param {HTMLImageElement} img - Image element to check
     * @returns {boolean}
     */
    static isLoaded(img) {
        return img.complete && img.naturalHeight !== 0;
    }

    /**
     * Wait for an existing image element to load
     * @param {HTMLImageElement} img - Image element to wait for
     * @returns {Promise<HTMLImageElement>}
     */
    static waitFor(img) {
        return new Promise((resolve, reject) => {
            if (this.isLoaded(img)) {
                resolve(img);
                return;
            }
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Image failed to load'));
        });
    }

    /**
     * Load image and resize to fit within max dimensions
     * @param {string} src - Image source URL
     * @param {number} maxWidth - Maximum width
     * @param {number} maxHeight - Maximum height
     * @returns {Promise<{img: HTMLImageElement, width: number, height: number, scaled: boolean}>}
     */
    static async loadAndResize(src, maxWidth, maxHeight) {
        const { img, width, height } = await this.loadWithDimensions(src);

        let newWidth = width;
        let newHeight = height;
        let scaled = false;

        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            newWidth = Math.floor(width * ratio);
            newHeight = Math.floor(height * ratio);
            scaled = true;
        }

        return { img, width: newWidth, height: newHeight, originalWidth: width, originalHeight: height, scaled };
    }
}
