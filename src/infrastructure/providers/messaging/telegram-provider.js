/**
 * TELEGRAM MESSAGING PROVIDER
 * Infrastructure Katmanı - Telegram Bot API implementasyonu
 * 
 * IMessagingProvider contract'ını implemente eder
 * Dependency Injection ile test edilebilir
 * 
 * @module infrastructure/providers/messaging/telegram-provider
 */

const TelegramBot = require('node-telegram-bot-api');
const { IMessagingProvider } = require('../../../domain/contracts');
const { createModuleLogger } = require('../../../shared/logger');
const { ProviderError, ConfigurationError, ServiceNotReadyError, ValidationError } = require('../../../shared/errors');

// Default dependencies
const defaultLogger = createModuleLogger('TELEGRAM');

/**
 * Default bot factory - gerçek TelegramBot oluşturur
 * @param {string} token
 * @returns {TelegramBot}
 */
const defaultBotFactory = (token) => new TelegramBot(token);

/**
 * Telegram Messaging Provider
 * Telegram Bot API ile mesaj ve dosya gönderimi
 * 
 * @extends IMessagingProvider
 */
class TelegramProvider extends IMessagingProvider {
    /**
     * @param {Object} config
     * @param {string} config.botToken - Telegram Bot Token
     * @param {string} [config.channelId] - Default channel ID
     * @param {Object} [dependencies] - Injectable dependencies (test için)
     * @param {Function} [dependencies.botFactory] - Bot factory function
     * @param {Object} [dependencies.logger] - Logger instance
     * @param {import('../../../domain/contracts').IBotAdapter} [dependencies.botAdapter] - Pre-configured bot adapter
     */
    constructor(config, dependencies = {}) {
        super();

        // Fail-fast: config validation
        if (!config) {
            throw new ValidationError('TelegramProvider config gerekli');
        }

        this.botToken = config.botToken;
        this.defaultChannelId = config.channelId;

        // Dependency Injection - test için mock'lanabilir
        this.botFactory = dependencies.botFactory || defaultBotFactory;
        this.logger = dependencies.logger || defaultLogger;

        // Pre-configured bot adapter (test için)
        this._botAdapter = dependencies.botAdapter || null;

        /** @type {TelegramBot|null} */
        this.bot = null;
        this._ready = false;
    }

    get name() {
        return 'telegram';
    }

    isReady() {
        return this._ready && (this.bot !== null || this._botAdapter !== null);
    }

    /**
     * @override
     * Bot'u başlat
     */
    async initialize() {
        // Eğer bot adapter inject edildiyse, direkt hazır
        if (this._botAdapter) {
            this.bot = this._botAdapter;
            this._ready = true;
            this.logger.info('Telegram Provider initialized with injected adapter');
            return;
        }

        if (!this.botToken) {
            this.logger.warn('Bot token not set. Telegram service disabled.');
            return;
        }

        // Fail-fast: Invalid token check
        if (this.botToken.startsWith('your_') || this.botToken.length < 20) {
            this.logger.warn('Invalid Bot Token. Telegram service disabled.');
            return;
        }

        try {
            // Setup bot using factory (mockable)
            this.bot = this.botFactory(this.botToken);
            this._ready = true;

            this.logger.info('Telegram Bot initialized for sending');
        } catch (error) {
            this.logger.error('Failed to initialize bot', { error: error.message });
            throw new ProviderError('telegram', 'Bot başlatılamadı', { originalError: error.message });
        }
    }

    /**
     * @override
     * @param {string} channelId
     * @param {string} message
     * @param {Object} [options]
     */
    async sendMessage(channelId, message, options = {}) {
        this._ensureReady();

        // Fail-fast: message validation
        if (!message || typeof message !== 'string') {
            throw new ValidationError('message gerekli ve string olmalı');
        }

        const targetChannel = channelId || this.defaultChannelId;
        if (!targetChannel) {
            throw new ConfigurationError('TELEGRAM_CHANNEL_ID');
        }

        try {
            await this.bot.sendMessage(targetChannel, message, {
                parse_mode: options.parseMode || 'Markdown',
                ...options
            });

            this.logger.info('Message sent', { channelId: targetChannel });
        } catch (error) {
            throw new ProviderError('telegram', 'Mesaj gönderilemedi', {
                originalError: error.message
            });
        }
    }

    /**
     * @override
     * @param {Object} params
     * @param {string} params.channelId
     * @param {Buffer} params.fileBuffer
     * @param {Object} params.options
     */
    async sendFile({ channelId, fileBuffer, options = {} }) {
        this._ensureReady();

        // Fail-fast: fileBuffer validation
        if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
            throw new ValidationError('fileBuffer gerekli ve Buffer olmalı');
        }

        // Fail-fast: options validation
        if (!options.filename) {
            throw new ValidationError('options.filename gerekli');
        }

        const targetChannel = channelId || this.defaultChannelId;
        if (!targetChannel) {
            throw new ConfigurationError('TELEGRAM_CHANNEL_ID');
        }

        try {
            await this.bot.sendDocument(
                targetChannel,
                fileBuffer,
                {
                    caption: options.caption,
                    parse_mode: options.parseMode || 'Markdown'
                },
                {
                    filename: options.filename,
                    contentType: options.contentType || 'image/png'
                }
            );

            this.logger.info('File sent', {
                channelId: targetChannel,
                filename: options.filename
            });
        } catch (error) {
            throw new ProviderError('telegram', 'Dosya gönderilemedi', {
                originalError: error.message
            });
        }
    }

    /**
     * Bot'un hazır olduğundan emin ol
     * @private
     */
    _ensureReady() {
        if (!this.isReady()) {
            if (!this.botToken || this.botToken.startsWith('your_')) {
                throw new ConfigurationError('TELEGRAM_BOT_TOKEN');
            }
            if (!this.defaultChannelId || this.defaultChannelId.startsWith('your_')) {
                throw new ConfigurationError('TELEGRAM_CHANNEL_ID');
            }
            throw new ServiceNotReadyError('Telegram');
        }
    }

    /**
     * Static factory method (auto-loader uyumluluğu için)
     * @param {Object} config
     * @param {Object} [dependencies]
     * @returns {TelegramProvider}
     */
    static create(config, dependencies) {
        return new TelegramProvider(config, dependencies);
    }
}

module.exports = { TelegramProvider };
