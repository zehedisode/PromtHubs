/**
 * LOGGER UTILITY
 * Centralized logging and error tracking
 * PromtHubs Card Creator v5.4
 */

export const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

class LoggerService {
    constructor() {
        this.minLevel = LogLevel.DEBUG; // Default level
        this.logs = []; // Circular buffer for logs
        this.maxLogs = 1000;

        // Expose internally for debugging
        window.__LOGGER__ = this;
    }

    /**
     * Format the current timestamp
     */
    getTimestamp() {
        return new Date().toISOString();
    }

    /**
     * Internal log handler
     */
    _log(level, module, message, data = null) {
        if (level < this.minLevel) return;

        const timestamp = this.getTimestamp();
        const start = `[${timestamp}] [${module}]`;

        // Store log
        const logEntry = { timestamp, level, module, message, data };
        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Console Output
        let css = '';
        switch (level) {
            case LogLevel.DEBUG:
                css = 'color: #888;';
                console.debug(`%c${start} ${message}`, css, data || '');
                break;
            case LogLevel.INFO:
                css = 'color: #00b894; font-weight: bold;';
                console.log(`%c${start} ${message}`, css, data || '');
                break;
            case LogLevel.WARN:
                css = 'color: #fdcb6e; font-weight: bold;';
                console.warn(`%c${start} ${message}`, css, data || '');
                break;
            case LogLevel.ERROR:
                css = 'color: #ff7675; font-weight: bold; font-size: 1.1em;';
                console.error(`%c${start} ${message}`, css, data || '');
                break;
        }
    }

    debug(module, message, data) {
        this._log(LogLevel.DEBUG, module, message, data);
    }

    info(module, message, data) {
        this._log(LogLevel.INFO, module, message, data);
    }

    warn(module, message, data) {
        this._log(LogLevel.WARN, module, message, data);
    }

    error(module, message, data) {
        this._log(LogLevel.ERROR, module, message, data);
    }

    /**
     * Export logs as JSON file
     */
    exportLogs() {
        const json = JSON.stringify(this.logs, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `debug-logs-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

export const Logger = new LoggerService();
