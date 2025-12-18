/**
 * Config Module Unit Tests
 */

const config = require('../../config');

describe('Config Module', () => {
    test('should have required properties', () => {
        expect(config).toHaveProperty('port');
        expect(config).toHaveProperty('gemini');
        expect(config).toHaveProperty('telegram');
        expect(config).toHaveProperty('cors');
    });

    test('port should default to 3000', () => {
        // Port comes as string from .env, this is expected
        expect(Number(config.port)).toBe(3000);
    });

    test('gemini config should have required properties', () => {
        expect(config.gemini).toHaveProperty('visionModel');
        expect(config.gemini).toHaveProperty('imagenModel');
        expect(config.gemini).toHaveProperty('baseUrl');
    });

    test('isValid should return true', () => {
        expect(config.isValid()).toBe(true);
    });
});
