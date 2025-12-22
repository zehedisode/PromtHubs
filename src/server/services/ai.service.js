/**
 * AI SERVICE
 * Application katmanı - İş mantığını yönetir
 * SOLID: SRP - Sadece AI iş mantığından sorumlu
 * SOLID: DIP - GeminiAPIClient interface'i üzerinden çalışır
 */

const logger = require('../utils/logger');

/**
 * AI Servisi
 * Route'lardan bağımsız iş mantığı katmanı
 */
class AIService {
    /**
     * @param {Object} apiClient - Gemini API Client instance (DIP)
     */
    constructor(apiClient) {
        this.apiClient = apiClient;
    }

    /**
     * Görsel analizi yap
     * @param {Object} params - { imageBase64, prompt, apiKey }
     * @returns {Promise<{ description: string }>}
     */
    async analyzeImage({ imageBase64, prompt, apiKey }) {
        logger.info('AI_SERVICE', 'Starting image analysis');

        const description = await this.apiClient.analyzeImage({
            imageBase64,
            prompt,
            apiKey
        });

        logger.info('AI_SERVICE', 'Image analysis completed', {
            descriptionLength: description?.length || 0
        });

        return { description };
    }

    /**
     * Görsel oluştur
     * @param {Object} params - { prompt, apiKey }
     * @returns {Promise<{ imageBase64: string }>}
     */
    async generateImage({ prompt, apiKey }) {
        logger.info('AI_SERVICE', 'Starting image generation');

        const imageBase64 = await this.apiClient.generateImage({
            prompt,
            apiKey
        });

        logger.info('AI_SERVICE', 'Image generation completed');

        return { imageBase64 };
    }
}

module.exports = { AIService };
