/**
 * SESSION MANAGER MODULE
 * Manages user sessions and state
 */

const sessions = new Map();

// Session timeout (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

/**
 * Get or create user session
 * @param {number} chatId - Telegram chat ID
 * @returns {Object} User session
 */
function getSession(chatId) {
    if (!sessions.has(chatId)) {
        sessions.set(chatId, createNewSession());
    }

    const session = sessions.get(chatId);
    session.lastActivity = Date.now();
    return session;
}

/**
 * Create new session with default values
 * @returns {Object} New session object
 */
function createNewSession() {
    return {
        step: 'idle', // idle, waiting_image, waiting_prompt, configuring
        imageBuffer: null,
        imagePath: null,
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
    sessions.set(chatId, createNewSession());
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
}

/**
 * Cleanup expired sessions
 */
function cleanupSessions() {
    const now = Date.now();
    for (const [chatId, session] of sessions) {
        if (now - session.lastActivity > SESSION_TIMEOUT) {
            sessions.delete(chatId);
        }
    }
}

// Run cleanup every 10 minutes
setInterval(cleanupSessions, 10 * 60 * 1000);

module.exports = {
    getSession,
    resetSession,
    updateSession
};
