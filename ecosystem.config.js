module.exports = {
    apps: [
        {
            name: 'promthubs-backend',
            script: 'server/server.js',
            cwd: '/var/www/promthubs',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        },
        {
            name: 'promthubs-telegram',
            script: 'bot.js',
            cwd: '/var/www/promthubs/telegram-bot',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '300M',
            env: {
                NODE_ENV: 'production'
            }
        }
    ]
};
