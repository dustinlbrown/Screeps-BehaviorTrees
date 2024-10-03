// /utils/Logger.js

class Logger {
    static info(message) {
        console.log(`[INFO] ${message}`);
    }

    static error(message) {
        console.log(`[ERROR] ${message}`);
    }

    static warn(message) {
        console.log(`[WARN] ${message}`);
    }

    static debug(message) {
        // Uncomment the next line to enable debug logs
        // console.log(`[DEBUG] ${message}`);
    }
}

module.exports = Logger;
