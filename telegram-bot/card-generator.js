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

    // Clean emojis from prompt text for SVG compatibility
    const cleanPrompt = promptText.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

    console.log('Generating high-fidelity card with Sharp...', { themeColor, safeZone });

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
                .rotate() // Auto-rotate based on EXIF
                .resize(width, height, { fit: 'cover' })
                .blur(30)
                .modulate({ brightness: 0.5, saturation: 1.1 })
                .toBuffer();
        } else {
            baseLayer = await sharp({
                create: { width, height, channels: 4, background: '#000000' }
            }).png().toBuffer();
        }

        // --- LAYER 1: Main Image ---
        const szPercent = safeZoneScale / 400; // 25 / 400 = 0.0625
        const szMargin = safeZone ? Math.round(width * szPercent) : 0;
        const mainInnerWidth = width - (szMargin * 2);
        const mainInnerHeight = height - (szMargin * 2);

        const mainImage = await sharp(imageBuffer)
            .rotate()
            .resize(mainInnerWidth, mainInnerHeight, {
                fit: 'cover',
                position: 'center'
            })
            .toBuffer();

        // --- LAYER 2: Gradient Overlay ---
        const gradientIntensityLocal = gradientIntensity / 100;
        const gradientOverlay = Buffer.from(`
            <svg width="${width}" height="${height}">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" style="stop-color:black;stop-opacity:${gradientIntensityLocal}" />
                        <stop offset="35%" style="stop-color:black;stop-opacity:${gradientIntensityLocal * 0.7}" />
                        <stop offset="100%" style="stop-color:black;stop-opacity:0" />
                    </linearGradient>
                </defs>
                <rect x="${szMargin}" y="${szMargin}" width="${mainInnerWidth}" height="${mainInnerHeight}" 
                      fill="url(#grad)"/>
            </svg>
        `);

        // --- LAYER 3: Text & UI Overlay ---
        const escapedText = escapeXml(cleanPrompt);
        const borderColor = showBorder ? themeColor : 'transparent';
        const modelLabel = (model || 'Gemini').toUpperCase();
        const padding = 60 + szMargin;

        // Calculate dynamic text height to avoid overlap
        const wrappedTextLines = wrapText(escapedText, Math.floor(mainInnerWidth * 0.8 / (fontSize * 0.55)));
        const totalTextHeight = wrappedTextLines.length * (fontSize * 1.4);
        const promptStartY = height - padding - totalTextHeight - 120; // 120px for labels/paddings

        const textOverlay = Buffer.from(`
            <svg width="${width}" height="${height}">
                <!-- Main Border -->
                <rect x="${szMargin + 20}" y="${szMargin + 20}" 
                      width="${mainInnerWidth - 40}" height="${mainInnerHeight - 40}" 
                      fill="none" stroke="${borderColor}" stroke-width="2" rx="24"/>
                
                <!-- Top Branding -->
                <text x="${width - padding}" y="${padding + 40}" 
                      font-family="Arial, sans-serif" font-size="32" font-weight="bold"
                      fill="white" text-anchor="end" style="letter-spacing: 2px;">
                    PROMT<tspan fill="${themeColor}">HUBS</tspan>
                </text>
                
                <!-- Model Badge & Labels (Positioned dynamically) -->
                <g transform="translate(0, ${promptStartY})">
                    <rect x="${padding}" y="-130" width="${modelLabel.length * 18 + 32}" height="42" 
                          fill="${themeColor}" rx="8"/>
                    <text x="${padding + 16}" y="-100" 
                          font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="black">
                        ${modelLabel}
                    </text>
                    
                    <text x="${padding}" y="-30" 
                          font-family="Arial, sans-serif" font-size="56" font-weight="bold" fill="white">
                        PROMPT
                    </text>
                    
                    <!-- Prompt Text Lines -->
                    ${wrappedTextLines.map((line, i) =>
            `<text x="${padding}" y="${i * fontSize * 1.4 + 30}" 
                               font-family="monospace" font-size="${fontSize}" 
                               fill="white" style="text-shadow: 0 2px 8px rgba(0,0,0,0.9);">${line}</text>`
        ).join('\n')}
                </g>
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

        return result;

    } catch (err) {
        console.error('Advanced Card generation failed:', err);
        throw err;
    }
}

/**
 * Helper to wrap text into lines
 */
function wrapText(text, maxChars) {
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        if ((currentLine + ' ' + word).length <= maxChars) {
            currentLine = currentLine ? currentLine + ' ' + word : word;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    });
    if (currentLine) lines.push(currentLine);
    return lines.slice(0, 15); // Max 15 lines
}

function escapeXml(text) {
    return text.replace(/[<>&"']/g, c => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
    }[c]));
}

async function closeBrowser() { }

module.exports = { generateCard, closeBrowser };
