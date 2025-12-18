/**
 * APPLICATION CONFIGURATION
 * PromtHubs Card Creator v5.4
 */

/**
 * Main application configuration constants
 * @constant {Object} CONFIG
 */
export const CONFIG = {
    // Application versioning
    APP_VERSION: '5.4',
    STATE_VERSION: '5.4',

    // LocalStorage keys
    STORAGE_KEY: 'promthubs-state-v5.4',

    // Image processing
    MAX_IMAGE_DIMENSION: 2048,
    EXPORT_SCALE: 4,
    BLUR_AMOUNT: 12,
    FILL_BLUR_AMOUNT: 25,
    BLUR_IMAGE_MAX_DIM: 1200,
    EXPORT_DELAY_MS: 400,

    // Safe zone
    SAFE_ZONE_BASE: 150,

    // Color analysis
    ANALYSIS_CANVAS_SIZE: 100,

    // Backend API
    BACKEND_URL: 'http://localhost:3000/api',

    // API Prompts

    // API Prompts
    API_IMAGE_PROMPT: 'Describe this image in extreme detail to be used as a prompt for a high-end image generator. Focus on lighting, style, composition, colors, and mood. Keep it under 100 words.',
    API_ENHANCE_PROMPT_TEMPLATE: 'A stunning, 4k resolution, hyper-realistic, masterpiece version of: {prompt}. Cinematic lighting, high fidelity, detailed texture. Vertical portrait format, 9:16 aspect ratio.',

    // Default values
    DEFAULT_IMAGE: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1080&auto=format&fit=crop',
    DEFAULT_PROMPT: 'Yapay zeka, insan zekasını taklit eden ve sürekli öğrenen sistemlerin genel adıdır. Geleceği şekillendiren en büyük güçlerden biridir.'
};

/**
 * Default application state
 * @constant {Object} DEFAULT_STATE
 */
export const DEFAULT_STATE = {
    promptText: CONFIG.DEFAULT_PROMPT,
    model: 'Gemini',
    fontFamily: 'var(--font-mono)',
    fontSize: 15,
    alignment: 'left',
    textPosition: 25,
    gradientIntensity: 100,
    showBorder: true,
    showText: true,
    blurBackground: false,
    safeZone: true,
    safeZoneScale: 25,
    themeColor: '#FFD700',
    showOriginalOnly: false
};
