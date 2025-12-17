/**
 * ERROR HANDLER MIDDLEWARE
 * Merkezi hata yakalama
 */

function errorHandler(err, req, res, next) {
    console.error('❌ Error:', err.message);

    // Zaten yanıt gönderilmişse, Express'in varsayılan hata handler'ına bırak
    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}

module.exports = errorHandler;
