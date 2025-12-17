/**
 * COLOR ANALYSIS MODULE
 * Handles image color extraction and palette generation
 * PromtHubs Card Creator v5.4
 */

import { CONFIG } from './config.js';

/**
 * Convert RGB values to HEX color string
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} Hex color string (e.g., "#FFFFFF")
 */
export function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

/**
 * Convert HEX color to RGBA string
 * @param {string} hex - Hex color string (e.g., "#FFFFFF")
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} RGBA color string
 */
export function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Extract pixel statistics from image data
 * @param {Uint8ClampedArray} data - Image pixel data
 * @returns {Object} Statistics object with vibrant, average, brightest, darkest colors
 */
function extractPixelStatistics(data) {
    let vibrant = { r: 0, g: 0, b: 0, score: -1 };
    let totalR = 0, totalG = 0, totalB = 0;
    let count = 0;
    let brightest = { r: 0, g: 0, b: 0, val: -1 };
    let darkest = { r: 255, g: 255, b: 255, val: 999 };

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Calculate average
        totalR += r;
        totalG += g;
        totalB += b;
        count++;

        // Track brightness extremes
        const brightness = (r + g + b) / 3;
        if (brightness > brightest.val) {
            brightest = { r, g, b, val: brightness };
        }
        if (brightness < darkest.val) {
            darkest = { r, g, b, val: brightness };
        }

        // Find most vibrant color (ignore extreme blacks/whites)
        if (brightness < 40 || brightness > 220) continue;
        const saturation = Math.max(r, g, b) - Math.min(r, g, b);
        if (saturation > vibrant.score) {
            vibrant = { r, g, b, score: saturation };
        }
    }

    return {
        vibrant,
        average: {
            r: Math.round(totalR / count),
            g: Math.round(totalG / count),
            b: Math.round(totalB / count)
        },
        brightest,
        darkest
    };
}

/**
 * Build color palette from pixel statistics
 * @param {Object} stats - Pixel statistics object
 * @returns {Array<Object>} Array of unique color objects
 */
function buildColorPalette(stats) {
    const palette = [];

    // 1. Vibrant color
    if (stats.vibrant.score > -1) {
        palette.push({
            color: rgbToHex(stats.vibrant.r, stats.vibrant.g, stats.vibrant.b),
            label: 'Canlı'
        });
    }

    // 2. Dominant (Average) color
    palette.push({
        color: rgbToHex(stats.average.r, stats.average.g, stats.average.b),
        label: 'Baskın'
    });

    // 3. Brightest (Light accent)
    palette.push({
        color: rgbToHex(stats.brightest.r, stats.brightest.g, stats.brightest.b),
        label: 'Açık'
    });

    // 4. Darkest (Dark accent)
    palette.push({
        color: rgbToHex(stats.darkest.r, stats.darkest.g, stats.darkest.b),
        label: 'Koyu'
    });

    // 5. Brand color (fallback)
    palette.push({
        color: '#FFD700',
        label: 'Marka'
    });

    // Remove duplicates
    const uniqueColors = [];
    const seen = new Set();
    palette.forEach(p => {
        if (!seen.has(p.color)) {
            seen.add(p.color);
            uniqueColors.push(p);
        }
    });

    return uniqueColors;
}

/**
 * Analyze image and extract color palette
 * @param {HTMLImageElement} imgElement - Image element to analyze
 * @param {HTMLCanvasElement} analysisCanvas - Canvas element for analysis
 * @returns {Array<Object>} Array of color objects with color and label
 */
export function analyzeImageColors(imgElement, analysisCanvas) {
    const ctx = analysisCanvas.getContext('2d');
    const size = CONFIG.ANALYSIS_CANVAS_SIZE;

    ctx.drawImage(imgElement, 0, 0, size, size);
    const imageData = ctx.getImageData(0, 0, size, size);

    const stats = extractPixelStatistics(imageData.data);
    return buildColorPalette(stats);
}
