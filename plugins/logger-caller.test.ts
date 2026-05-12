import assert from 'node:assert';

import { describe, it } from 'vitest';

import { loggerCallerPlugin } from './logger-caller.ts';

const MOCK_ID = '/Users/cgxxv/anylang/web/src/lib/content.ts';

type TransformResult = { code: string; map: string } | null;

function transform(code: string, id = MOCK_ID): TransformResult {
  const plugin = loggerCallerPlugin();
  const hook = plugin.transform;
  const fn = typeof hook === 'function' ? hook : hook?.handler;
  if (!fn) return null;
  return fn.call({} as never, code, id, undefined) as TransformResult;
}

// node --test plugins/logger-caller.test.ts
describe('logger-caller plugin', () => {
  it('should skip non-target files', () => {
    const result = transform('logger.info("test")', '/Users/cgxxv/anylang/web/node_modules/foo.ts');
    assert.strictEqual(result, null);
  });

  it('should skip files without logger calls', () => {
    const result = transform('console.log("hello")');
    assert.strictEqual(result, null);
  });

  it('should handle TypeScript syntax', () => {
    const code =
      'declare global { interface Window { x: boolean; } } function test() { logger.info("ok"); }';
    const result = transform(code);
    assert.ok(result);
    assert.match(result!.code!, /fn:"test"/);
  });

  it('should skip .svelte files', () => {
    const result = transform('logger.info("test")', '/Users/cgxxv/anylang/web/src/App.svelte');
    assert.strictEqual(result, null);
  });

  describe('argument injection', () => {
    it('0 args: logger.info() → logger.info({caller})', () => {
      const result = transform('function test() { logger.info(); }');
      assert.ok(result);
      assert.match(result!.code!, /logger\.info\(\{file:"/);
    });

    it('1 arg (string): logger.info("msg") → logger.info("msg", undefined, {caller})', () => {
      const result = transform('function test() { logger.info("msg"); }');
      assert.ok(result);
      assert.match(result!.code!, /logger\.info\("msg",undefined,\{file:"/);
    });

    it('1 arg (object): logger.info({fields}) → logger.info({fields}, {caller})', () => {
      const result = transform('function test() { logger.info({ key: 1 }); }');
      assert.ok(result);
      assert.match(result!.code!, /logger\.info\(\{ key: 1 \},\{file:"/);
    });

    it('2 args: logger.info("msg", {fields}) → logger.info("msg", {fields}, {caller})', () => {
      const result = transform('function test() { logger.info("msg", { key: 1 }); }');
      assert.ok(result);
      assert.match(result!.code!, /logger\.info\("msg", \{ key: 1 \},\{file:"/);
    });
  });

  describe('function name detection', () => {
    it('detects FunctionDeclaration', () => {
      const result = transform('function generateSummary() { logger.info("ok"); }');
      assert.ok(result);
      assert.match(result!.code!, /fn:"generateSummary"/);
    });

    it('detects ArrowFunction (variable)', () => {
      const result = transform('const handleClick = () => { logger.info("ok"); }');
      assert.ok(result);
      assert.match(result!.code!, /fn:"handleClick"/);
    });

    it('detects ClassMethod', () => {
      const result = transform('class Foo { bar() { logger.info("ok"); } }');
      assert.ok(result);
      assert.match(result!.code!, /fn:"bar"/);
    });

    it('detects ObjectMethod', () => {
      const result = transform('const obj = { method() { logger.info("ok"); } }');
      assert.ok(result);
      assert.match(result!.code!, /fn:"method"/);
    });

    it('uses <module> for top-level calls', () => {
      const result = transform('logger.info("ok");');
      assert.ok(result);
      assert.match(result!.code!, /fn:"<module>"/);
    });

    it('detects nested function scope', () => {
      const code = 'function outer() { function inner() { logger.info("ok"); } }';
      const result = transform(code);
      assert.ok(result);
      assert.match(result!.code!, /fn:"inner"/);
    });
  });

  describe('caller info content', () => {
    it('includes file path', () => {
      const result = transform('function test() { logger.info("ok"); }');
      assert.ok(result);
      assert.match(result!.code!, /file:"src\/lib\/content\.ts"/);
    });

    it('includes line number', () => {
      const result = transform('function test() {\n  logger.info("ok");\n}');
      assert.ok(result);
      assert.match(result!.code!, /line:2/);
    });

    it('includes module name', () => {
      const result = transform('function test() { logger.info("ok"); }');
      assert.ok(result);
      assert.match(result!.code!, /module:"lib\/content"/);
    });
  });

  describe('edge cases', () => {
    it('does not transform non-logger calls', () => {
      const result = transform('function test() { console.log("ok"); }');
      assert.strictEqual(result, null);
    });

    it('does not transform other method names on logger', () => {
      const result = transform('function test() { logger.setLevel("debug"); }');
      assert.strictEqual(result, null);
    });

    it('handles all log levels', () => {
      const levels = ['trace', 'debug', 'info', 'warn', 'error'];
      for (const level of levels) {
        const result = transform(`function test() { logger.${level}("ok"); }`);
        assert.ok(result, `should transform logger.${level}`);
        assert.match(result!.code!, new RegExp(`logger\\.${level}\\("ok"`));
      }
    });

    it('preserves original formatting', () => {
      const code = 'function test() {\n  logger.info(\n    "multi-line",\n    { key: 1 }\n  );\n}';
      const result = transform(code);
      assert.ok(result);
      assert.ok(result!.code!.includes('multi-line'));
      assert.ok(result!.code!.includes('key: 1'));
    });
  });
});
