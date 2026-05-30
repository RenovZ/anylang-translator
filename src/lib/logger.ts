import { APP_NAME } from './app';

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

const isNode = typeof window === 'undefined' && typeof process !== 'undefined';

// ANSI color codes (Node terminal)
const ansi: Record<Level, string> = {
  trace: '\x1B[90m', // gray
  debug: '\x1B[36m', // cyan
  info: '\x1B[34m', // blue
  warn: '\x1B[33m', // yellow
  error: '\x1B[31m' // red
};
const ansiReset = '\x1B[0m';

// CSS styles (browser environment)
const css: Record<Level, string> = {
  trace: 'color:#9ca3af;font-size:11px',
  debug: 'color:#6b7280;font-size:11px',
  info: 'color:#3b82f6',
  warn: 'color:#f59e0b',
  error: 'color:#ef4444;font-weight:bold'
};

// Extract filename from stack trace
function getFilenameFromStack(): string {
  const stack = new Error().stack;
  if (!stack) return 'unknown';

  const lines = stack.split('\n');
  // Line 4 is the actual call site
  const callerLine = lines[4] || lines[3];
  if (!callerLine) return 'unknown';

  // Match (path/to/file.ts:12:34) or path/to/file.ts:12:34
  const match = callerLine.match(/\s+at\s+(?:.*?\s+\()?([^)]+)\)?$/);
  if (!match) return 'unknown';

  const fullPath = match[1];
  // Extract path portion (remove line number)
  const pathPart = fullPath.split(':')[0];
  // Take last segments of path
  const parts = pathPart.split('/');
  return parts.slice(-3).join('/'); // Keep at most last 3 segments
}

// Abbreviate module name
// background/foo/a.ts → b/f/a
// options/api-providers/Index → o/a/Index
function abbreviateModuleName(filename: string): string {
  // Remove suffix and chunk hash
  const clean = filename.replace(/\.(js|ts|svelte)$/, '').replace(/-[a-zA-Z0-9_-]{8}$/i, '');

  const parts = clean.split('/');

  if (parts.length === 0) return 'app';
  if (parts.length === 1) return parts[0];

  // Take first letter of each leading segment, keep last segment complete
  const abbreviated = parts
    .slice(0, -1)
    .map((p) => p[0])
    .join('/');
  const last = parts[parts.length - 1];

  return `${abbreviated}/${last}`;
}

class Logger {
  private minLevel: Level = isDev ? 'trace' : 'debug';
  private _devMode: boolean = isDev;

  setLevel(level: Level): void {
    this.minLevel = level;
  }

  set devMode(devMode: boolean) {
    this._devMode = devMode;
  }

  private isEnabled(level: Level): boolean {
    return this._devMode && LEVELS[level] >= LEVELS[this.minLevel];
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
    const moduleName = caller?.module
      ? abbreviateModuleName(caller.module)
      : abbreviateModuleName(filename);
    const levelStr = level.toUpperCase();
    const callerTag = caller ? `${caller.fn}:${caller.line}` : '';

    if (isNode) {
      const color = ansi[level];
      const prefix = callerTag
        ? `${color}[${levelStr}]${ansiReset} [${moduleName}] [${callerTag}]`
        : `${color}[${levelStr}]${ansiReset} [${moduleName}]`;
      const args = [`[${APP_NAME}]`, prefix];
      if (message) args.push(message);
      if (fields && Object.keys(fields).length > 0) {
        args.push(JSON.stringify(fields));
      }
      console[level](...args);
    } else {
      const style = css[level];
      const prefix = callerTag
        ? `[${levelStr}] [${moduleName}] [${callerTag}]`
        : `[${levelStr}] [${moduleName}]`;
      const args: unknown[] = [`[${APP_NAME}] %c${prefix}`, style];
      if (message) args.push(message);
      if (fields && Object.keys(fields).length > 0) {
        args.push(fields);
      }
      console[level](...args);
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
