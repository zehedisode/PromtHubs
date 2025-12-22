/**
 * GEMINI API CLIENT
 * Infrastructure katmanı - Dış API çağrılarını soyutlar
 * SOLID: Single Responsibility - Sadece API iletişiminden sorumlu
 */

const fetch = require('node-fetch');
const logger = require('../utils/logger');

/**
 * Rate limit ve genel API hatalarını işleyen custom error
 */
class APIError extends Error {
    constructor(message, statusCode, isRateLimit = false) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.isRateLimit = isRateLimit;
    }
}

/**
 * Gemini API Client
 * DRY: Tüm Gemini API çağrıları tek yerden yapılır
 */
class GeminiAPIClient {
    constructor(config) {
        this.baseUrl = config.baseUrl;
        this.visionModel = config.visionModel;
        this.imagenModel = config.imagenModel;
        this.defaultApiKey = config.apiKey;
    }

    /**
     * API çağrısı yap - ortak fetch mantığı
     * @private
     */
    async _request(url, payload) {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 429) {
                throw new APIError('API rate limit aşıldı. Lütfen biraz bekleyin.', 429, true);
            }
            throw new APIError(`API Error: ${response.status} - ${errorText}`, response.status);
        }

        return response.json();
    }

    /**
     * Görsel analizi - Gemini Vision
     * @param {Object} params - { imageBase64, prompt, apiKey }
     * @returns {Promise<string>} Açıklama metni
     */
    async analyzeImage({ imageBase64, prompt, apiKey }) {
        const effectiveKey = apiKey || this.defaultApiKey;

        if (!effectiveKey) {
            throw new APIError('API key is required', 400);
        }

        logger.info('GEMINI_CLIENT', 'Analyzing image via Vision API');

        const url = `${this.baseUrl}/${this.visionModel}:generateContent?key=${effectiveKey}`;
        const payload = {
            contents: [{
                parts: [
                    { text: prompt || 'Describe this image.' },
                    { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
                ]
            }]
        };

        const data = await this._request(url, payload);
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    /**
     * Görsel oluşturma - Imagen
     * @param {Object} params - { prompt, apiKey }
     * @returns {Promise<string>} Base64 encoded image data
     */
    async generateImage({ prompt, apiKey }) {
        const effectiveKey = apiKey || this.defaultApiKey;

        if (!effectiveKey) {
            throw new APIError('API key is required', 400);
        }

        logger.info('GEMINI_CLIENT', 'Generating image via Imagen API', { promptLength: prompt.length });

        const url = `${this.baseUrl}/${this.imagenModel}:predict?key=${effectiveKey}`;
        const payload = {
            instances: [{ prompt }],
            parameters: { sampleCount: 1, aspectRatio: '9:16' }
        };

        const data = await this._request(url, payload);
        const b64Result = data.predictions?.[0]?.bytesBase64Encoded;

        if (!b64Result) {
            throw new APIError('No image data returned from API', 500);
        }

        return b64Result;
    }
}

module.exports = { GeminiAPIClient, APIError };
