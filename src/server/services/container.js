/**
 * SERVICE CONTAINER
 * Dependency Injection container
 * SOLID: DIP - Bağımlılıkları merkezi olarak yönetir
 */

const config = require('../../../config');
const { GeminiAPIClient } = require('../infrastructure/gemini-client');
const { AIService } = require('./ai.service');

/**
 * Lazy-loaded singleton instances
 */
let geminiClient = null;
let aiService = null;

/**
 * Get or create GeminiAPIClient instance
 * @returns {GeminiAPIClient}
 */
function getGeminiClient() {
    if (!geminiClient) {
        geminiClient = new GeminiAPIClient(config.gemini);
    }
    return geminiClient;
}

/**
 * Get or create AIService instance
 * @returns {AIService}
 */
function getAIService() {
    if (!aiService) {
        aiService = new AIService(getGeminiClient());
    }
    return aiService;
}

module.exports = {
    getGeminiClient,
    getAIService
};
