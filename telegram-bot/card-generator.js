/**
 * CARD GENERATOR MODULE
 * Creates styled cards using Puppeteer to render the same HTML/CSS as web version
 * This ensures pixel-perfect matching with the web design
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const CONFIG = require('./config');

// Cache browser instance
let browserInstance = null;

/**
 * Get or create browser instance
 */
async function getBrowser() {
    if (!browserInstance) {
        browserInstance = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu',
                '--disable-extensions',
                '--disable-software-rasterizer',
                '--disable-features=site-per-process',
                '--js-flags=--max-old-space-size=512'
            ],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
        });
    }
    return browserInstance;
}

/**
 * Generate a styled card image - matching the web design exactly
 * @param {Buffer} imageBuffer - Background image buffer
 * @param {Object} options - Card options
 * @returns {Promise<Buffer>} PNG buffer
 */
async function generateCard(imageBuffer, options) {
    const {
        promptText = '',
        themeColor = '#FFD700',
        model = 'Gemini',
        fontFamily = 'mono',
        showBorder = true,
        gradientIntensity = 100,
        safeZone = true,
        safeZoneScale = 25
    } = options;

    const width = CONFIG.CARD_WIDTH;
    const height = CONFIG.CARD_HEIGHT;

    // Convert image buffer to base64 - using PNG for lossless quality
    const imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    // Get font family CSS
    const fontFamilyCSS = getFontFamily(fontFamily);

    // Calculate safe zone margins (percentage based)
    const szMargin = safeZone ? Math.round(height * (safeZoneScale / 100 / 4)) : 0;

    // Generate HTML that matches the web version exactly
    const html = generateHTML({
        imageBase64,
        promptText,
        themeColor,
        model,
        fontFamilyCSS,
        showBorder,
        gradientIntensity,
        safeZone,
        szMargin,
        width,
        height
    });

    try {
        const browser = await getBrowser();
        const page = await browser.newPage();

        // Set viewport to match card dimensions with 4x scale for 4K+ output
        await page.setViewport({ width, height, deviceScaleFactor: 4 });

        // Set content
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Wait for fonts and images to load
        await page.evaluate(() => document.fonts.ready);
        await new Promise(r => setTimeout(r, 500));

        // Capture screenshot
        const screenshotBuffer = await page.screenshot({
            type: 'png',
            fullPage: false,
            clip: { x: 0, y: 0, width, height }
        });

        await page.close();

        return screenshotBuffer;

    } catch (err) {
        console.error('Card generation error:', err);
        throw err;
    }
}

/**
 * Get CSS font family based on selection
 */
function getFontFamily(fontFamily) {
    switch (fontFamily) {
        case 'mono':
            return "'JetBrains Mono', 'Courier New', monospace";
        case 'sans':
            return "'Inter', 'Arial', sans-serif";
        case 'serif':
            return "'Playfair Display', 'Georgia', serif";
        default:
            return "'JetBrains Mono', 'Courier New', monospace";
    }
}

/**
 * Generate HTML matching the web version exactly with Safe Zone support
 */
function generateHTML(options) {
    const {
        imageBase64,
        promptText,
        themeColor,
        model,
        fontFamilyCSS,
        showBorder,
        gradientIntensity,
        safeZone,
        szMargin,
        width,
        height
    } = options;

    const gradientAlpha = gradientIntensity / 100;
    const borderDisplay = showBorder ? 'block' : 'none';
    const modelDisplay = model && model !== 'None' ? 'inline-block' : 'none';
    const blurFillOpacity = safeZone ? 1 : 0;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400&family=Oswald:wght@500;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            width: ${width}px;
            height: ${height}px;
            overflow: hidden;
            font-family: 'Inter', sans-serif;
        }
        
        .export-canvas {
            width: ${width}px;
            height: ${height}px;
            position: relative;
            background-color: #000;
            overflow: hidden;
        }
        
        /* Layer 0: Blur Fill Background (Safe Zone) */
        .canvas-blur-fill {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: url('${imageBase64}');
            background-size: cover;
            background-position: center;
            filter: blur(20px) brightness(0.6) saturate(1.2);
            z-index: 1;
            opacity: ${blurFillOpacity};
        }
        
        /* Layer 1: Main Background Wrapper (with safe zone margin) */
        .canvas-bg-wrapper {
            position: absolute;
            top: ${szMargin}px;
            left: ${szMargin}px;
            right: ${szMargin}px;
            bottom: ${szMargin}px;
            z-index: 5;
            overflow: hidden;
        }
        
        /* Layer 1.1: Background Image */
        .canvas-bg {
            position: absolute;
            top: -${szMargin}px;
            left: -${szMargin}px;
            right: -${szMargin}px;
            bottom: -${szMargin}px;
            background-image: url('${imageBase64}');
            background-size: cover;
            background-position: center;
        }
        
        /* Layer 2: Gradient Overlay */
        .canvas-overlay {
            position: absolute;
            top: ${szMargin}px;
            left: ${szMargin}px;
            right: ${szMargin}px;
            bottom: ${szMargin}px;
            background: linear-gradient(
                to top, 
                rgba(0, 0, 0, ${gradientAlpha}) 0%, 
                rgba(0, 0, 0, ${gradientAlpha * 0.8}) 40%, 
                rgba(0, 0, 0, 0) 100%
            );
            z-index: 10;
        }
        
        /* Layer 3: Content */
        .canvas-content {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 20;
            padding: ${60 + szMargin}px ${60 + szMargin}px ${60 + szMargin}px ${60 + szMargin}px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        
        /* Top Branding */
        .top-branding {
            text-align: right;
            font-family: 'Oswald', sans-serif;
            font-weight: 700;
            font-size: 36px;
            letter-spacing: 2px;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
            color: white;
        }
        
        .top-branding span {
            color: ${themeColor};
        }
        
        /* Text Container */
        .text-container {
            padding-bottom: 0;
        }
        
        /* Model Badge */
        .model-badge {
            display: ${modelDisplay};
            background: ${themeColor};
            color: #000;
            padding: 8px 16px;
            border-radius: 8px;
            font-family: 'Oswald', sans-serif;
            font-weight: 700;
            font-size: 22px;
            text-transform: uppercase;
            margin-bottom: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }
        
        /* Prompt Label */
        .prompt-label {
            font-family: 'Oswald', sans-serif;
            font-size: 64px;
            font-weight: 700;
            color: white;
            text-transform: uppercase;
            margin-bottom: 24px;
            line-height: 1;
            text-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
        }
        
        /* Prompt Text */
        .prompt-text {
            font-family: ${fontFamilyCSS};
            font-size: 36px;
            color: white;
            line-height: 1.5;
            white-space: pre-wrap;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
        }
        
        /* Layer 4: Border - matches web version exactly */
        .main-border {
            display: ${borderDisplay};
            position: absolute;
            top: calc(1rem + ${szMargin}px);
            left: calc(1rem + ${szMargin}px);
            right: calc(1rem + ${szMargin}px);
            bottom: calc(1rem + ${szMargin}px);
            border: 2px solid ${themeColor};
            border-radius: 1.5rem;
            z-index: 30;
            pointer-events: none;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
        }
    </style>
</head>
<body>
    <div class="export-canvas">
        <!-- Layer 0: Blur Fill (Safe Zone background) -->
        <div class="canvas-blur-fill"></div>
        
        <!-- Layer 1: Background Wrapper -->
        <div class="canvas-bg-wrapper">
            <div class="canvas-bg"></div>
        </div>
        
        <!-- Layer 2: Gradient Overlay -->
        <div class="canvas-overlay"></div>
        
        <!-- Layer 3: Content -->
        <div class="canvas-content">
            <div class="top-branding">
                PROMT<span>HUBS</span>
            </div>
            
            <div class="text-container">
                <div class="model-badge">${model.toUpperCase()}</div>
                <div class="prompt-label">PROMPT</div>
                <div class="prompt-text">${escapeHtml(promptText)}</div>
            </div>
        </div>
        
        <!-- Layer 4: Border -->
        <div class="main-border"></div>
    </div>
</body>
</html>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Close browser when done
 */
async function closeBrowser() {
    if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
    }
}

// Cleanup on exit
process.on('exit', closeBrowser);
process.on('SIGINT', async () => {
    await closeBrowser();
    process.exit();
});

module.exports = {
    generateCard,
    closeBrowser
};
