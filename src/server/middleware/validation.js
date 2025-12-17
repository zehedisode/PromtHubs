/**
 * INPUT VALIDATION SCHEMAS
 * Zod ile request body doğrulama
 */

const { z } = require('zod');

// /api/analyze için schema
const analyzeSchema = z.object({
    imageBase64: z.string()
        .min(100, 'Görsel verisi çok kısa')
        .max(10000000, 'Görsel boyutu çok büyük (max 10MB)'),
    prompt: z.string()
        .max(1000, 'Prompt çok uzun (max 1000 karakter)')
        .optional(),
    apiKey: z.string()
        .min(20, 'Geçersiz API key formatı')
        .optional()
});

// /api/generate için schema
const generateSchema = z.object({
    prompt: z.string()
        .min(3, 'Prompt en az 3 karakter olmalı')
        .max(2000, 'Prompt çok uzun (max 2000 karakter)'),
    apiKey: z.string()
        .min(20, 'Geçersiz API key formatı')
        .optional()
});

// /api/send-telegram için schema
const telegramSchema = z.object({
    imageBase64: z.string()
        .min(100, 'Görsel verisi çok kısa')
        .max(20000000, 'Görsel boyutu çok büyük (max 20MB)'),
    prompt: z.string()
        .max(500, 'Caption çok uzun')
        .optional()
});

/**
 * Validation middleware factory
 */
function validate(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            const errors = error.errors?.map(e => e.message) || ['Geçersiz veri'];
            res.status(400).json({
                error: 'Validation hatası',
                details: errors
            });
        }
    };
}

module.exports = {
    analyzeSchema,
    generateSchema,
    telegramSchema,
    validate
};
