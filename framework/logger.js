
import { Config } from './config.js';

const Logger = {
  debug(...args) {
    if (Config.debug) {
      console.debug('[DEBUG]', ...args);
    }
  },
  info(...args) {
    console.info('[INFO]', ...args);
  },
  warn(...args) {
    console.warn('[WARN]', ...args);
  },
  error(...args) {
    console.error('[ERROR]', ...args);
  }
};

export default Logger;
