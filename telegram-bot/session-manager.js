/**
 * SESSION MANAGER MODULE (File-based for persistence)
 * Manages user sessions and saves them to disk to survive restarts
 */

const fs = require('fs');
const path = require('path');

const SESSIONS_DIR = path.join(__dirname, 'sessions');
const IMAGES_DIR = path.join(__dirname, 'temp');

// Ensure directories exist
if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

// Memory cache for active sessions
const memoryCache = new Map();

/**
 * Get or create user session
 * @param {number} chatId - Telegram chat ID
 * @returns {Object} User session
 */
function getSession(chatId) {
    // Check memory cache first
    if (memoryCache.has(chatId)) {
        const session = memoryCache.get(chatId);
        session.lastActivity = Date.now();
        return session;
    }

    // Try to load from disk
    const sessionPath = path.join(SESSIONS_DIR, `${chatId}.json`);
    if (fs.existsSync(sessionPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));

            // Re-load image buffer from disk if it exists
            const imagePath = path.join(IMAGES_DIR, `${chatId}.img`);
            if (fs.existsSync(imagePath)) {
                data.imageBuffer = fs.readFileSync(imagePath);
            }

            data.lastActivity = Date.now();
            memoryCache.set(chatId, data);
            return data;
        } catch (err) {
            console.error('Error loading session from disk:', err);
        }
    }

    // Create new if not found
    const session = createNewSession();
    memoryCache.set(chatId, session);
    saveToDisk(chatId, session);
    return session;
}

/**
 * Create new session with default values
 * @returns {Object} New session object
 */
function createNewSession() {
    return {
        step: 'idle',
        imageBuffer: null,
        promptText: '',
        colorPalette: [],
        settings: {
            themeColor: '#FFD700',
            model: 'Gemini',
            fontFamily: 'mono',
            showBorder: true,
            gradientIntensity: 100
        },
        lastActivity: Date.now()
    };
}

/**
 * Reset user session
 * @param {number} chatId - Telegram chat ID
 */
function resetSession(chatId) {
    const session = createNewSession();
    memoryCache.set(chatId, session);

    // Clean up disk
    const sessionPath = path.join(SESSIONS_DIR, `${chatId}.json`);
    const imagePath = path.join(IMAGES_DIR, `${chatId}.img`);
    if (fs.existsSync(sessionPath)) fs.unlinkSync(sessionPath);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
}

/**
 * Update session property
 * @param {number} chatId - Telegram chat ID
 * @param {string} key - Property key
 * @param {*} value - Property value
 */
function updateSession(chatId, key, value) {
    const session = getSession(chatId);

    if (key.includes('.')) {
        const [parent, child] = key.split('.');
        session[parent][child] = value;
    } else {
        session[key] = value;
    }

    saveToDisk(chatId, session);
}

/**
 * Save session to disk
 */
function saveToDisk(chatId, session) {
    try {
        // Clone session to avoid side effects
        const dataToSave = { ...session };

        // Save image buffer separately and remove from JSON
        if (session.imageBuffer) {
            fs.writeFileSync(path.join(IMAGES_DIR, `${chatId}.img`), session.imageBuffer);
            delete dataToSave.imageBuffer;
        }

        fs.writeFileSync(path.join(SESSIONS_DIR, `${chatId}.json`), JSON.stringify(dataToSave, null, 2));
    } catch (err) {
        console.error('Error saving session to disk:', err);
    }
}

module.exports = {
    getSession,
    resetSession,
    updateSession
};
