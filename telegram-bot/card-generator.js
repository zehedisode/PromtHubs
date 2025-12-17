/**
 * SIMPLE CARD GENERATOR MODULE (Sharp-based)
 * Fallback card generator that doesn't require Chrome/Puppeteer
 * Uses Sharp for image manipulation - works on all cloud platforms
 */

const sharp = require('sharp');
const CONFIG = require('./config');

/**
 * Generate a styled card image using Sharp
 * @param {Buffer} imageBuffer - Background image buffer
 * @param {Object} options - Card options
 * @returns {Promise<Buffer>} PNG buffer
 */
async function generateCard(imageBuffer, options) {
    const {
        promptText = '',
        themeColor = '#FFD700',
        model = 'Gemini',
        showBorder = true,
        gradientIntensity = 100
    } = options;

    const width = 1080;
    const height = 1920;

    try {
        // Resize and prepare background image
        const background = await sharp(imageBuffer)
            .resize(width, height, { fit: 'cover', position: 'center' })
            .modulate({ brightness: 0.85 }) // Slightly darken for text visibility
            .toBuffer();

        // Create gradient overlay SVG
        const gradientAlpha = Math.round((gradientIntensity / 100) * 255);
        const gradientOverlay = Buffer.from(`
            <svg width="${width}" height="${height}">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:${gradientIntensity / 100}" />
                        <stop offset="50%" style="stop-color:rgb(0,0,0);stop-opacity:${gradientIntensity / 200}" />
                        <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0" />
                    </linearGradient>
                </defs>
                <rect width="${width}" height="${height}" fill="url(#grad)"/>
            </svg>
        `);

        // Create text overlay SVG
        const escapedText = escapeXml(promptText);
        const borderColor = showBorder ? themeColor : 'transparent';

        const textOverlay = Buffer.from(`
            <svg width="${width}" height="${height}">
                <!-- Border -->
                <rect x="16" y="16" width="${width - 32}" height="${height - 32}" 
                      fill="none" stroke="${borderColor}" stroke-width="2" rx="24"/>
                
                <!-- Top branding -->
                <text x="${width - 60}" y="80" 
                      font-family="Arial, sans-serif" font-size="36" font-weight="bold"
                      fill="white" text-anchor="end">
                    PROMT<tspan fill="${themeColor}">HUBS</tspan>
                </text>
                
                <!-- Model badge -->
                <rect x="60" y="${height - 400}" width="${model.length * 20 + 32}" height="40" 
                      fill="${themeColor}" rx="8"/>
                <text x="76" y="${height - 370}" 
                      font-family="Arial, sans-serif" font-size="22" font-weight="bold"
                      fill="black">
                    ${model.toUpperCase()}
                </text>
                
                <!-- PROMPT label -->
                <text x="60" y="${height - 300}" 
                      font-family="Arial, sans-serif" font-size="64" font-weight="bold"
                      fill="white">
                    PROMPT
                </text>
                
                <!-- Prompt text (wrapped) -->
                ${generateWrappedText(escapedText, 60, height - 230, width - 120, 36)}
            </svg>
        `);

        // Composite all layers
        const result = await sharp(background)
            .composite([
                { input: gradientOverlay, blend: 'over' },
                { input: textOverlay, blend: 'over' }
            ])
            .png({ quality: 100 })
            .toBuffer();

        return result;

    } catch (err) {
        console.error('Card generation error:', err);
        throw err;
    }
}

/**
 * Generate SVG text elements for wrapped text
 */
function generateWrappedText(text, x, startY, maxWidth, fontSize) {
    const charPerLine = Math.floor(maxWidth / (fontSize * 0.55));
    const words = text.split(' ');
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

    // Limit to 8 lines max
    const displayLines = lines.slice(0, 8);

    return displayLines.map((line, i) =>
        `<text x="${x}" y="${startY + (i * fontSize * 1.4)}" 
               font-family="Courier New, monospace" font-size="${fontSize}" 
               fill="white">${line}</text>`
    ).join('\n');
}

/**
 * Escape XML special characters
 */
function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Dummy function for compatibility
 */
async function closeBrowser() {
    // No browser to close in Sharp version
}

module.exports = {
    generateCard,
    closeBrowser
};
