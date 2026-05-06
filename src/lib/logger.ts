/**
 * 智能日志系统 - 自动捕获模块路径并缩写
 * 支持浏览器和 Node 环境
 * 例如: background/foo/a.ts → [b/f/a], options/api-providers/Index → [o/a/Index]
 */

const isDev = import.meta.env?.DEV ?? true;

const LEVELS = { trace: 0, debug: 1, info: 3, warn: 4, error: 5 } as const;
type Level = keyof typeof LEVELS;

type Fields = Record<string, unknown>;

// 检测环境
const isNode = typeof window === 'undefined' && typeof process !== 'undefined';

// ANSI 颜色码（Node 终端）
const ansi: Record<Level, string> = {
  trace: '\x1B[90m', // gray
  debug: '\x1B[36m', // cyan
  info: '\x1B[34m', // blue
  warn: '\x1B[33m', // yellow
  error: '\x1B[31m' // red
};
const ansiReset = '\x1B[0m';

// CSS 样式（浏览器环境）
const css: Record<Level, string> = {
  trace: 'color:#9ca3af;font-size:11px',
  debug: 'color:#6b7280;font-size:11px',
  info: 'color:#3b82f6',
  warn: 'color:#f59e0b',
  error: 'color:#ef4444;font-weight:bold'
};

// 从 stack 提取文件名
function getFilenameFromStack(): string {
  const stack = new Error().stack;
  if (!stack) return 'unknown';

  const lines = stack.split('\n');
  // 第 4 行是实际调用处
  const callerLine = lines[4] || lines[3];
  if (!callerLine) return 'unknown';

  // 匹配 (path/to/file.ts:12:34) 或 path/to/file.ts:12:34
  const match = callerLine.match(/\s+at\s+(?:.*?\s+\()?([^)]+)\)?$/);
  if (!match) return 'unknown';

  const fullPath = match[1];
  // 提取路径部分（去掉行号）
  const pathPart = fullPath.split(':')[0];
  // 取最后几段路径
  const parts = pathPart.split('/');
  return parts.slice(-3).join('/'); // 最多取最后3段
}

// 缩写模块名
// background/foo/a.ts → b/f/a
// options/api-providers/Index → o/a/Index
function abbreviateModuleName(filename: string): string {
  // 移除后缀和 chunk hash
  const clean = filename.replace(/\.(js|ts|svelte)$/, '').replace(/-[a-zA-Z0-9]{8,}$/, '');

  const parts = clean.split('/');

  // 跳过 entrypoints 前缀
  if (parts[0] === 'entrypoints') {
    parts.shift();
  }

  if (parts.length === 0) return 'app';
  if (parts.length === 1) return parts[0];

  // 前面各段取首字母，最后一段保留完整名
  const abbreviated = parts
    .slice(0, -1)
    .map((p) => p[0])
    .join('/');
  const last = parts[parts.length - 1];

  return `${abbreviated}/${last}`;
}

class Logger {
  private minLevel: Level = 'trace';

  setLevel(level: Level): void {
    this.minLevel = level;
  }

  private isEnabled(level: Level): boolean {
    return isDev && LEVELS[level] >= LEVELS[this.minLevel];
  }

  private output(level: Level, message: string, fields?: Fields): void {
    if (!this.isEnabled(level)) return;

    const filename = getFilenameFromStack();
    const moduleName = abbreviateModuleName(filename);
    const levelStr = level.toUpperCase();

    if (isNode) {
      // Node 环境: ANSI 颜色
      const color = ansi[level];
      const prefix = `${color}[${levelStr}]${ansiReset} [${moduleName}]`;
      if (fields && Object.keys(fields).length > 0) {
        console[level](prefix, message, JSON.stringify(fields));
      } else {
        console[level](prefix, message);
      }
    } else {
      // 浏览器环境: CSS 样式
      const style = css[level];
      const prefix = `[${levelStr}] [${moduleName}]`;
      if (fields && Object.keys(fields).length > 0) {
        console[level](`%c${prefix}`, style, message, fields);
      } else {
        console[level](`%c${prefix}`, style, message);
      }
    }
  }

  trace(message: string, fields?: Fields): void {
    this.output('trace', message, fields);
  }

  debug(message: string, fields?: Fields): void {
    this.output('debug', message, fields);
  }

  info(message: string, fields?: Fields): void {
    this.output('info', message, fields);
  }

  warn(message: string, fields?: Fields): void {
    this.output('warn', message, fields);
  }

  error(message: string, fields?: Fields): void {
    this.output('error', message, fields);
  }
}

export default new Logger();
export type { Fields, Level };
