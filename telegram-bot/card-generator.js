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

    // Stronger emoji cleaning: Removes everything higher than Latin-1 & Latin Extended-A 
    // but keeps Turkish characters (ç, ş, ğ, ı, ö, ü, Ç, Ş, Ğ, İ, Ö, Ü)
    const cleanPrompt = promptText.replace(/[^\u0000-\u017F\s.,!?:;'"()-]/g, '');

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
                .blur(50) // Increased blur for better aesthetic
                .modulate({ brightness: 0.45, saturation: 1.2 })
                .toBuffer();
        } else {
            baseLayer = await sharp({
                create: { width, height, channels: 4, background: '#000000' }
            }).png().toBuffer();
        }

        // --- LAYER 1: Main Image (Centered and Cropped) ---
        const szMargin = safeZone ? Math.round(width * (safeZoneScale / 400)) : 0;
        const mainInnerWidth = width - (szMargin * 2);
        const mainInnerHeight = height - (szMargin * 2);

        const mainImage = await sharp(imageBuffer)
            .rotate()
            .resize(mainInnerWidth, mainInnerHeight, {
                fit: 'cover',
                position: 'center'
            })
            .toBuffer();

        // --- LAYER 2: Gradient Overlay (Matching Web UI intensity) ---
        const gIntensity = gradientIntensity / 100;
        const gradientOverlay = Buffer.from(`
            <svg width="${width}" height="${height}">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" style="stop-color:black;stop-opacity:${gIntensity}" />
                        <stop offset="45%" style="stop-color:black;stop-opacity:${gIntensity * 0.6}" />
                        <stop offset="100%" style="stop-color:black;stop-opacity:0" />
                    </linearGradient>
                </defs>
                <rect x="${szMargin}" y="${szMargin}" width="${mainInnerWidth}" height="${mainInnerHeight}" 
                      fill="url(#grad)"/>
            </svg>
        `);

        // --- LAYER 3: Text & UI Overlay (Pixel Perfect Layout) ---
        const escapedText = escapeXml(cleanPrompt);
        const borderColor = showBorder ? themeColor : 'transparent';
        const modelLabel = (model || 'Gemini').toUpperCase();
        const padding = 70 + szMargin; // Matching Web UI margins

        const wrappedTextLines = wrapText(escapedText, Math.floor(mainInnerWidth * 0.8 / (fontSize * 0.52)));
        const totalTextHeight = wrappedTextLines.length * (fontSize * 1.5);
        const promptStartY = height - padding - totalTextHeight - 140;

        const textOverlay = Buffer.from(`
            <svg width="${width}" height="${height}">
                <!-- Branding -->
                <text x="${width - padding}" y="${padding + 40}" 
                      font-family="sans-serif" font-size="34" font-weight="900"
                      fill="white" text-anchor="end" style="letter-spacing: 2px;">
                    PROMT<tspan fill="${themeColor}">HUBS</tspan>
                </text>
                
                <!-- Border -->
                <rect x="${szMargin + 25}" y="${szMargin + 25}" 
                      width="${mainInnerWidth - 50}" height="${mainInnerHeight - 50}" 
                      fill="none" stroke="${borderColor}" stroke-width="2.5" rx="30"/>
                
                <!-- Content Group -->
                <g transform="translate(0, ${promptStartY})">
                    <!-- Model Badge -->
                    <rect x="${padding}" y="-135" width="${modelLabel.length * 19 + 40}" height="46" 
                          fill="${themeColor}" rx="8"/>
                    <text x="${padding + 20}" y="-103" 
                          font-family="sans-serif" font-size="24" font-weight="900" fill="black">
                        ${modelLabel}
                    </text>
                    
                    <!-- PROMPT Label -->
                    <text x="${padding}" y="-35" 
                          font-family="sans-serif" font-size="62" font-weight="900" fill="white">
                        PROMPT
                    </text>
                    
                    <!-- Prompt Text -->
                    ${wrappedTextLines.map((line, i) =>
            `<text x="${padding}" y="${i * fontSize * 1.5 + 40}" 
                               font-family="monospace" font-size="${fontSize}" 
                               fill="white" style="text-shadow: 0 4px 12px rgba(0,0,0,0.8);">${line}</text>`
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
