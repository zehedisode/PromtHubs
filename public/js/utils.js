/**
 * UTILITY FUNCTIONS MODULE
 * PromtHubs Card Creator v5.4
 */

import { CONFIG } from './config.js';
import { Logger } from './logger.js';

// Re-export color analysis functions from dedicated module
export { rgbToHex, hexToRgba, analyzeImageColors } from './color-analysis.js';

/**
 * Optimize/compress an image before use
 * @param {string} imageSrc - Source image (URL or data URL)
 * @param {Object} options - Optimization options
 * @param {number} options.maxWidth - Maximum width (default: 2048)
 * @param {number} options.maxHeight - Maximum height (default: 2048)
 * @param {number} options.quality - JPEG quality 0-1 (default: 0.85)
 * @returns {Promise<string>} Optimized image as data URL
 */
export function optimizeImage(imageSrc, options = {}) {
    const { maxWidth = 2048, maxHeight = 2048, quality = 0.85 } = options;

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";

        img.onload = () => {
            let w = img.width;
            let h = img.height;

            // Calculate new dimensions maintaining aspect ratio
            if (w > maxWidth || h > maxHeight) {
                const ratio = Math.min(maxWidth / w, maxHeight / h);
                w = Math.floor(w * ratio);
                h = Math.floor(h * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);

            // Use WebP if supported, fallback to JPEG
            const mimeType = canvas.toDataURL('image/webp').startsWith('data:image/webp')
                ? 'image/webp'
                : 'image/jpeg';

            const optimized = canvas.toDataURL(mimeType, quality);

            Logger.info('UTILS', 'Image optimized', {
                original: `${img.width}x${img.height}`,
                optimized: `${w}x${h}`,
                format: mimeType
            });

            resolve(optimized);
        };

        img.onerror = (e) => {
            Logger.error('UTILS', 'Image optimization failed', { error: e });
            resolve(imageSrc); // Fallback to original
        };

        img.src = imageSrc;
    });
}


/**
 * Create a blurred version of an image
 * @param {string} imageSrc - Source image URL
 * @param {number} blurAmount - Blur radius in pixels
 * @returns {Promise<string>} Promise resolving to blurred image data URL
 */
export function createBlurredImage(imageSrc, blurAmount) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageSrc;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxDim = CONFIG.BLUR_IMAGE_MAX_DIM;

            let w = img.width;
            let h = img.height;

            // Resize if needed
            if (w > maxDim || h > maxDim) {
                const ratio = Math.min(maxDim / w, maxDim / h);
                w = Math.floor(w * ratio);
                h = Math.floor(h * ratio);
            }

            canvas.width = w;
            canvas.height = h;

            // Apply blur filter if supported
            if (typeof ctx.filter !== 'undefined') {
                ctx.filter = `blur(${blurAmount}px)`;
                ctx.drawImage(img, 0, 0, w, h);
            } else {
                // Fallback: no blur
                ctx.drawImage(img, 0, 0, w, h);
            }

            resolve(canvas.toDataURL('image/png', 0.9));
        };

        img.onerror = (e) => {
            Logger.error('UTILS', 'Blur image failed to load', { error: e });
            resolve(imageSrc); // Fallback to original
        };
    });
}

/**
 * Convert current image to base64 for API upload
 * @param {string} imageSrc - Image source URL
 * @returns {Promise<string>} Promise resolving to base64 encoded image
 */
export function getBase64FromImage(imageSrc) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageSrc;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.width;
            let h = img.height;
            const maxDim = CONFIG.MAX_IMAGE_DIMENSION;

            // Resize to max dimension
            if (w > maxDim || h > maxDim) {
                if (w > h) {
                    h = (maxDim / w) * h;
                    w = maxDim;
                } else {
                    w = (maxDim / h) * w;
                    h = maxDim;
                }
            }

            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);

            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            resolve(dataUrl.split(',')[1]); // Return only base64 part
        };

        img.onerror = reject;
    });
}

/**
 * Download a data URL as a file
 * @param {string} dataUrl - Data URL to download
 * @param {string} filename - Name of the file
 * @returns {void}
 */
export function downloadDataUrl(dataUrl, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
}

/**
 * Handle file upload from FileList
 * @param {FileList} files - Files to upload
 * @param {Function} callback - Callback function receiving (src, file)
 * @returns {void}
 */
export function handleFileUpload(files, callback) {
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const src = e.target.result;
            callback(src, file);
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Wait for an image element to fully load
 * @param {HTMLImageElement} img - Image element to wait for
 * @returns {Promise<HTMLImageElement>} Promise resolving to the loaded image element
 */
export function waitForImage(img) {
    return new Promise((resolve, reject) => {
        if (img.complete && img.naturalHeight !== 0) {
            resolve(img);
            return;
        }
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Image failed to load'));
    });
}
