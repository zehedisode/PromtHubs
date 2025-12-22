/**
 * APP ERROR
 * Standardize edilmiş error handling
 * SOLID: SRP - Hata yönetiminden sorumlu
 */

/**
 * Application Error - Tüm uygulama hataları için base class
 */
export class AppError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR', context = {}) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.context = context;
        this.timestamp = new Date().toISOString();
    }

    /**
     * Create a user-friendly error message
     * @returns {string}
     */
    toUserMessage() {
        const messages = {
            'API_ERROR': 'Sunucu ile iletişim kurulamadı. Lütfen tekrar deneyin.',
            'RATE_LIMIT': 'Çok fazla istek gönderildi. Lütfen biraz bekleyin.',
            'VALIDATION_ERROR': 'Girilen değerler geçersiz.',
            'IMAGE_LOAD_ERROR': 'Görsel yüklenemedi.',
            'EXPORT_ERROR': 'Dışa aktarma başarısız oldu.',
            'UNKNOWN_ERROR': 'Beklenmeyen bir hata oluştu.'
        };
        return messages[this.code] || this.message;
    }

    /**
     * Log error details
     * @param {Object} logger - Logger instance
     */
    log(logger) {
        logger.error(this.name, this.message, {
            code: this.code,
            context: this.context,
            timestamp: this.timestamp
        });
    }
}

/**
 * API-specific error
 */
export class APIError extends AppError {
    constructor(message, statusCode, context = {}) {
        super(message, statusCode === 429 ? 'RATE_LIMIT' : 'API_ERROR', context);
        this.name = 'APIError';
        this.statusCode = statusCode;
    }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
    constructor(message, field, context = {}) {
        super(message, 'VALIDATION_ERROR', { ...context, field });
        this.name = 'ValidationError';
        this.field = field;
    }
}

/**
 * Image processing error
 */
export class ImageError extends AppError {
    constructor(message, context = {}) {
        super(message, 'IMAGE_LOAD_ERROR', context);
        this.name = 'ImageError';
    }
}

/**
 * Global error handler for uncaught errors
 * @param {Error} error - Error to handle
 * @param {Object} logger - Logger instance
 * @param {Function} showToast - Toast notification function
 */
export function handleError(error, logger, showToast) {
    if (error instanceof AppError) {
        error.log(logger);
        showToast?.(error.toUserMessage(), 'error');
    } else {
        logger.error('UNHANDLED', error.message, { stack: error.stack });
        showToast?.('Beklenmeyen bir hata oluştu.', 'error');
    }
}
