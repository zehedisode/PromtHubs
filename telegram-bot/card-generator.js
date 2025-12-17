/**
 * ADVANCED CARD GENERATOR MODULE (Sharp-based)
 * Pixel-perfect match with Web UI using Sharp image processing
 */

const sharp = require('sharp');
const CONFIG = require('./config');

/**
 * Generate a styled card image using Sharp - Multi-layer composition
 * @param {Buffer} imageBuffer - Background image buffer
 * @param {Object} options - Card options
 * @returns {Promise<Buffer>} PNG buffer
 */
async function generateCard(imageBuffer, options) {
    const {
        promptText = '',
        themeColor = '#FFD700',
        model = 'Gemini',
        fontSize = 36,
        showBorder = true,
        safeZone = true,
        safeZoneScale = 25,
        gradientIntensity = 100
    } = options;

    console.log('Generating high-fidelity card with Sharp...', { themeColor, model, safeZone });

    const width = 1080;
    const height = 1920;

    try {
        if (!imageBuffer || imageBuffer.length === 0) {
            throw new Error('Image buffer is empty');
        }

        // --- LAYER 0: Blurred Background (Safe Zone) ---
        let baseLayer;
        if (safeZone) {
            baseLayer = await sharp(imageBuffer)
                .resize(width, height, { fit: 'cover' })
                .blur(40) // Web version uses 20px but SVG/Sharp scale differs
                .modulate({ brightness: 0.6, saturation: 1.2 })
                .toBuffer();
        } else {
            baseLayer = await sharp({
                create: { width, height, channels: 4, background: '#000000' }
            }).png().toBuffer();
        }

        // --- LAYER 1: Main Image ---
        const szMargin = safeZone ? Math.round(width * (safeZoneScale / 400)) : 0;
        const mainImage = await sharp(imageBuffer)
            .resize(width - (szMargin * 2), height - (szMargin * 2), { fit: 'cover' })
            .toBuffer();

        // --- LAYER 2: Gradient Overlay ---
        const gradientIntensityLocal = gradientIntensity / 100;
        const gradientOverlay = Buffer.from(`
            <svg width="${width}" height="${height}">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" style="stop-color:black;stop-opacity:${gradientIntensityLocal}" />
                        <stop offset="40%" style="stop-color:black;stop-opacity:${gradientIntensityLocal * 0.8}" />
                        <stop offset="100%" style="stop-color:black;stop-opacity:0" />
                    </linearGradient>
                </defs>
                <rect x="${szMargin}" y="${szMargin}" width="${width - (szMargin * 2)}" height="${height - (szMargin * 2)}" 
                      fill="url(#grad)"/>
            </svg>
        `);

        // --- LAYER 3: Text & UI Overlay ---
        const escapedText = escapeXml(promptText);
        const borderColor = showBorder ? themeColor : 'transparent';
        const modelLabel = (model || 'Gemini').toUpperCase();

        // Exact paddings and margins from Web UI
        const padding = 60 + szMargin;

        const textOverlay = Buffer.from(`
            <svg width="${width}" height="${height}">
                <!-- Main Border (Layer 4) -->
                <rect x="${szMargin + 20}" y="${szMargin + 20}" 
                      width="${width - (szMargin * 2) - 40}" height="${height - (szMargin * 2) - 40}" 
                      fill="none" stroke="${borderColor}" stroke-width="2" rx="24"/>
                
                <!-- Top Branding -->
                <text x="${width - padding}" y="${padding + 40}" 
                      font-family="Arial, sans-serif" font-size="32" font-weight="bold"
                      fill="white" text-anchor="end" style="letter-spacing: 2px;">
                    PROMT<tspan fill="${themeColor}">HUBS</tspan>
                </text>
                
                <!-- Model Badge -->
                <rect x="${padding}" y="${height - padding - 340}" width="${modelLabel.length * 18 + 32}" height="42" 
                      fill="${themeColor}" rx="8"/>
                <text x="${padding + 16}" y="${height - padding - 310}" 
                      font-family="Arial, sans-serif" font-size="22" font-weight="bold"
                      fill="black">
                    ${modelLabel}
                </text>
                
                <!-- PROMPT Label -->
                <text x="${padding}" y="${height - padding - 230}" 
                      font-family="Arial, sans-serif" font-size="56" font-weight="bold"
                      fill="white">
                    PROMPT
                </text>
                
                <!-- Prompt Text -->
                ${generateWrappedText(escapedText, padding, height - padding - 170, width - (padding * 2), fontSize)}
            </svg>
        `);

        // --- COMPOSITION ---
        const result = await sharp(baseLayer)
            .composite([
                { input: mainImage, top: szMargin, left: szMargin },
                { input: gradientOverlay, blend: 'over' },
                { input: textOverlay, blend: 'over' }
            ])
            .png({ quality: 100 })
            .toBuffer();

        console.log('Advanced card generation successful!');
        return result;

    } catch (err) {
        console.error('Advanced Card generation failed:', err);
        throw err;
    }
}

/**
 * Generate wrapped text for SVG with correct spacing
 */
function generateWrappedText(text, x, startY, maxWidth, fontSize) {
    const charPerLine = Math.floor(maxWidth / (fontSize * 0.52));
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        if ((currentLine + ' ' + word).length <= charPerLine) {
            currentLine = currentLine ? currentLine + ' ' + word : word;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    });
    if (currentLine) lines.push(currentLine);

    // Limit to prevent overflow
    const displayLines = lines.slice(0, 10);

    return displayLines.map((line, i) =>
        `<text x="${x}" y="${startY + (i * fontSize * 1.4)}" 
               font-family="Courier New, monospace" font-size="${fontSize}" 
               fill="white" style="text-shadow: 0 2px 8px rgba(0,0,0,0.9);">${line}</text>`
    ).join('\n');
}

function escapeXml(text) {
    return text.replace(/[<>&"']/g, c => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
    }[c]));
}

async function closeBrowser() { }

module.exports = { generateCard, closeBrowser };
