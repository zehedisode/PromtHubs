/**
 * COLOR ANALYSIS MODULE
 * Extract color palette from images using Sharp
 */

const sharp = require('sharp');

/**
 * Convert RGB to HEX
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} HEX color
 */
function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

/**
 * Analyze image and extract color palette
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Array>} Color palette array
 */
async function analyzeImageColors(imageBuffer) {
    try {
        // Resize image for faster analysis
        const { data, info } = await sharp(imageBuffer)
            .resize(100, 100, { fit: 'cover' })
            .raw()
            .toBuffer({ resolveWithObject: true });

        const pixels = [];
        for (let i = 0; i < data.length; i += info.channels) {
            pixels.push({
                r: data[i],
                g: data[i + 1],
                b: data[i + 2]
            });
        }

        // Extract statistics
        const stats = extractPixelStatistics(pixels);
        return buildColorPalette(stats);

    } catch (err) {
        console.error('Color analysis error:', err);
        // Return default palette on error
        return [
            { color: '#FFD700', label: 'Marka' },
            { color: '#FFFFFF', label: 'Açık' },
            { color: '#333333', label: 'Koyu' }
        ];
    }
}

/**
 * Extract pixel statistics
 * @param {Array} pixels - Array of RGB pixels
 * @returns {Object} Statistics object
 */
function extractPixelStatistics(pixels) {
    let vibrant = { r: 0, g: 0, b: 0, score: -1 };
    let totalR = 0, totalG = 0, totalB = 0;
    let brightest = { r: 0, g: 0, b: 0, val: -1 };
    let darkest = { r: 255, g: 255, b: 255, val: 999 };

    for (const { r, g, b } of pixels) {
        totalR += r;
        totalG += g;
        totalB += b;

        const brightness = (r + g + b) / 3;

        if (brightness > brightest.val) {
            brightest = { r, g, b, val: brightness };
        }
        if (brightness < darkest.val) {
            darkest = { r, g, b, val: brightness };
        }

        // Find vibrant color
        if (brightness < 40 || brightness > 220) continue;
        const saturation = Math.max(r, g, b) - Math.min(r, g, b);
        if (saturation > vibrant.score) {
            vibrant = { r, g, b, score: saturation };
        }
    }

    const count = pixels.length;
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
 * Build color palette from statistics
 * @param {Object} stats - Pixel statistics
 * @returns {Array} Color palette
 */
function buildColorPalette(stats) {
    const palette = [];

    // 1. Vibrant
    if (stats.vibrant.score > -1) {
        palette.push({
            color: rgbToHex(stats.vibrant.r, stats.vibrant.g, stats.vibrant.b),
            label: 'Canlı'
        });
    }

    // 2. Dominant (Average)
    palette.push({
        color: rgbToHex(stats.average.r, stats.average.g, stats.average.b),
        label: 'Baskın'
    });

    // 3. Brightest
    palette.push({
        color: rgbToHex(stats.brightest.r, stats.brightest.g, stats.brightest.b),
        label: 'Açık'
    });

    // 4. Darkest
    palette.push({
        color: rgbToHex(stats.darkest.r, stats.darkest.g, stats.darkest.b),
        label: 'Koyu'
    });

    // 5. Brand
    palette.push({
        color: '#FFD700',
        label: 'Marka'
    });

    // Remove duplicates
    const unique = [];
    const seen = new Set();
    for (const p of palette) {
        if (!seen.has(p.color)) {
            seen.add(p.color);
            unique.push(p);
        }
    }

    return unique.slice(0, 5);
}

module.exports = {
    analyzeImageColors,
    rgbToHex
};
