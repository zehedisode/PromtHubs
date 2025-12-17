/**
 * GLOBAL ERROR HANDLER
 * Catches unhandled errors and rejections
 * PromtHubs Card Creator v5.4
 */

import { Logger } from './logger.js';
import { Toast } from './toast.js';

export function initGlobalErrorHandlers() {

    // Global Exception Handler
    window.onerror = function (message, source, lineno, colno, error) {
        Logger.error('GLOBAL', `Unhandled Exception: ${message}`, {
            source,
            line: lineno,
            col: colno,
            stack: error ? error.stack : 'No stack trace'
        });

        Toast.error('Beklenmeyen bir hata oluştu. Lütfen konsolu kontrol edin.');

        return false; // Let default handler run too (logging to console)
    };

    // Unhandled Promise Rejection Handler
    window.addEventListener('unhandledrejection', function (event) {
        Logger.error('GLOBAL', `Unhandled Promise Rejection`, {
            reason: event.reason
        });

        // Extract meaningful message if possible
        let msg = 'İşlem sırasında bir hata oluştu.';
        if (event.reason && event.reason.message) {
            msg = event.reason.message;
        }

        Toast.error(msg);
    });

    Logger.info('SYSTEM', 'Global error handlers initialized');
}
