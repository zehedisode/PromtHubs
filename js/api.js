/**
 * API SERVICE MODULE
 * Handles Gemini AI API interactions
 * PromtHubs Card Creator v5.4
 */

import { CONFIG } from './config.js';
import { getBase64FromImage } from './utils.js';
import { Logger } from './logger.js';

/**
 * Analyze image using Backend Proxy
 * @param {string} imageSrc - Image source URL
 * @returns {Promise<string>} Promise resolving to description text
 */
export async function analyzeImageWithAI(imageSrc) {
    Logger.info('API', 'Starting image analysis via Backend...');
    const base64Data = await getBase64FromImage(imageSrc);

    const apiKey = localStorage.getItem('geminiApiKey') || '';
    const response = await fetch(`${CONFIG.BACKEND_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            imageBase64: base64Data,
            prompt: CONFIG.API_IMAGE_PROMPT,
            apiKey
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || `Backend error: ${response.status}`;
        Logger.error('API', errorMsg, { status: response.status });
        throw new Error(errorMsg);
    }

    const json = await response.json();
    return json.description;
}

/**
 * Generate new image using Backend Proxy
 * @param {string} prompt - Text prompt for image generation
 * @returns {Promise<string>} Promise resolving to base64 image data
 */
export async function generateImageWithAI(prompt) {
    Logger.info('API', 'Starting image generation via Backend...', { prompt });

    // Enhance prompt template logic is now handled here before sending or can be sent raw
    // The previous code did replacement here. Let's keep it consistent.
    const enhancedPrompt = CONFIG.API_ENHANCE_PROMPT_TEMPLATE.replace('{prompt}', prompt);

    const apiKey = localStorage.getItem('geminiApiKey') || '';
    const response = await fetch(`${CONFIG.BACKEND_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: enhancedPrompt, apiKey })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || `Backend error: ${response.status}`;
        Logger.error('API', errorMsg, { status: response.status });
        throw new Error(errorMsg);
    }

    const json = await response.json();
    return json.imageBase64;
}

/**
 * Full AI Remix workflow: Analyze current image and generate new one
 * @param {string} currentImageSrc - Current image source
 * @returns {Promise<Object>} Promise resolving to { description, imageData }
 */
export async function remixImageWithAI(currentImageSrc) {
    // Step 1: Analyze image
    const description = await analyzeImageWithAI(currentImageSrc);

    // Step 2: Generate new image based on description
    const imageData = await generateImageWithAI(description);

    return {
        description,
        imageData
    };
}
