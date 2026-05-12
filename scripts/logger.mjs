/** ANSI 颜色码 */
const ansi = {
  reset: '\x1B[0m',
  gray: '\x1B[90m',
  blue: '\x1B[34m',
  yellow: '\x1B[33m',
  red: '\x1B[31m',
  green: '\x1B[32m'
};

const prefix = '[build]';

function createLogger(color) {
  return (...args) => {
    console.log(`${color}${prefix}${ansi.reset}`, ...args);
  };
}

export default {
  log: createLogger(ansi.gray),
  info: createLogger(ansi.blue),
  warn: createLogger(ansi.yellow),
  error: createLogger(ansi.red),
  success: createLogger(ansi.green)
};
