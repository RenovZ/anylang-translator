const isDev = import.meta.env?.DEV ?? true;

const LEVELS = { trace: 0, debug: 1, info: 3, warn: 4, error: 5 } as const;
type Level = keyof typeof LEVELS;

type Fields = Record<string, unknown>;

interface CallerInfo {
  file: string;
  line: number;
  module: string;
  fn: string;
}

/**
 * Format unknown error to string message
 */
export function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

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

  private isCallerInfo(x: unknown): x is CallerInfo {
    return typeof x === 'object' && x !== null && 'file' in x && 'line' in x;
  }

  private normalizeArgs(
    arg1?: string | Fields | CallerInfo,
    arg2?: Fields | CallerInfo,
    arg3?: CallerInfo
  ): { message?: string; fields?: Fields; caller?: CallerInfo } {
    let message: string | undefined;
    let fields: Fields | undefined;
    let caller: CallerInfo | undefined;

    if (arg1 === undefined) {
      // no args — keep defaults
    } else if (typeof arg1 === 'string') {
      message = arg1;
      if (arg2 !== undefined) {
        if (this.isCallerInfo(arg2)) {
          caller = arg2;
        } else {
          fields = arg2;
          caller = arg3;
        }
      }
    } else if (this.isCallerInfo(arg1)) {
      caller = arg1;
    } else {
      fields = arg1;
      if (arg2 !== undefined && this.isCallerInfo(arg2)) {
        caller = arg2;
      }
    }

    return { message, fields, caller };
  }

  private output(level: Level, message?: string, fields?: Fields, caller?: CallerInfo): void {
    if (!this.isEnabled(level)) return;

    const filename = caller?.file ?? getFilenameFromStack();
    const moduleName = caller?.module ?? abbreviateModuleName(filename);
    const levelStr = level.toUpperCase();
    const callerTag = caller ? `${caller.fn}:${caller.line}` : '';

    if (isNode) {
      const color = ansi[level];
      const prefix = callerTag
        ? `${color}[${levelStr}]${ansiReset} [${moduleName}] [${callerTag}]`
        : `${color}[${levelStr}]${ansiReset} [${moduleName}]`;
      if (fields && Object.keys(fields).length > 0) {
        console[level](prefix, message, JSON.stringify(fields));
      } else {
        console[level](prefix, message);
      }
    } else {
      const style = css[level];
      const prefix = callerTag
        ? `[${levelStr}] [${moduleName}] [${callerTag}]`
        : `[${levelStr}] [${moduleName}]`;
      if (fields && Object.keys(fields).length > 0) {
        console[level](`%c${prefix}`, style, message, fields);
      } else {
        console[level](`%c${prefix}`, style, message);
      }
    }
  }

  trace(): void;
  trace(caller: CallerInfo): void;
  trace(message: string, caller?: CallerInfo): void;
  trace(message: string, fields: Fields, caller?: CallerInfo): void;
  trace(fields: Fields, caller?: CallerInfo): void;
  trace(arg1?: string | Fields | CallerInfo, arg2?: Fields | CallerInfo, arg3?: CallerInfo): void {
    const { message, fields, caller } = this.normalizeArgs(arg1, arg2, arg3);
    this.output('trace', message, fields, caller);
  }

  debug(): void;
  debug(caller: CallerInfo): void;
  debug(message: string, caller?: CallerInfo): void;
  debug(message: string, fields: Fields, caller?: CallerInfo): void;
  debug(fields: Fields, caller?: CallerInfo): void;
  debug(arg1?: string | Fields | CallerInfo, arg2?: Fields | CallerInfo, arg3?: CallerInfo): void {
    const { message, fields, caller } = this.normalizeArgs(arg1, arg2, arg3);
    this.output('debug', message, fields, caller);
  }

  info(): void;
  info(caller: CallerInfo): void;
  info(message: string, caller?: CallerInfo): void;
  info(message: string, fields: Fields, caller?: CallerInfo): void;
  info(fields: Fields, caller?: CallerInfo): void;
  info(arg1?: string | Fields | CallerInfo, arg2?: Fields | CallerInfo, arg3?: CallerInfo): void {
    const { message, fields, caller } = this.normalizeArgs(arg1, arg2, arg3);
    this.output('info', message, fields, caller);
  }

  warn(): void;
  warn(caller: CallerInfo): void;
  warn(message: string, caller?: CallerInfo): void;
  warn(message: string, fields: Fields, caller?: CallerInfo): void;
  warn(fields: Fields, caller?: CallerInfo): void;
  warn(arg1?: string | Fields | CallerInfo, arg2?: Fields | CallerInfo, arg3?: CallerInfo): void {
    const { message, fields, caller } = this.normalizeArgs(arg1, arg2, arg3);
    this.output('warn', message, fields, caller);
  }

  error(): void;
  error(caller: CallerInfo): void;
  error(message: string, caller?: CallerInfo): void;
  error(message: string, fields: Fields, caller?: CallerInfo): void;
  error(fields: Fields, caller?: CallerInfo): void;
  error(arg1?: string | Fields | CallerInfo, arg2?: Fields | CallerInfo, arg3?: CallerInfo): void {
    const { message, fields, caller } = this.normalizeArgs(arg1, arg2, arg3);
    this.output('error', message, fields, caller);
  }
}

export default new Logger();
export type { Fields, Level };
