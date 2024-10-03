// utils/Logger.js

const colors = {
    INFO: 'green',
    WARN: 'yellow',
    ERROR: 'red',
    DEBUG: 'blue'
};

const Logger = {
    /**
     * Logs an informational message.
     * @param {string} message - The message to log.
     * @param {...any} args - Additional arguments.
     */
    info: function (message, ...args) {
        console.log(`<span style="color:${colors.INFO}">INFO: ${message}</span>`, ...args);
    },

    /**
     * Logs a warning message.
     * @param {string} message - The message to log.
     * @param {...any} args - Additional arguments.
     */
    warn: function (message, ...args) {
        console.log(`<span style="color:${colors.WARN}">WARN: ${message}</span>`, ...args);
    },

    /**
     * Logs an error message.
     * @param {string} message - The message to log.
     * @param {...any} args - Additional arguments.
     */
    error: function (message, ...args) {
        console.log(`<span style="color:${colors.ERROR}">ERROR: ${message}</span>`, ...args);
    },

    /**
     * Logs a debug message.
     * @param {string} message - The message to log.
     * @param {...any} args - Additional arguments.
     */
    debug: function (message, ...args) {
        console.log(`<span style="color:${colors.DEBUG}">DEBUG: ${message}</span>`, ...args);
    }
};

module.exports = Logger;
