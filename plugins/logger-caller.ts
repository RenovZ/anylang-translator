import path from 'node:path';

import { babelParse, getLang, walkAST } from 'ast-kit';
import MagicString from 'magic-string';
import type { Plugin } from 'vite';
import * as t from '@babel/types';

const LOG_METHODS = new Set(['trace', 'debug', 'info', 'warn', 'error']);

function getFunctionName(node: t.Node, parent?: t.Node | null): string | null {
  if (node.type === 'FunctionDeclaration' && node.id) {
    return node.id.name;
  }
  if (node.type === 'FunctionExpression' && node.id) {
    return node.id.name;
  }
  if (node.type === 'ArrowFunctionExpression') {
    if (parent?.type === 'VariableDeclarator' && parent.id?.type === 'Identifier') {
      return parent.id.name;
    }
    if (parent?.type === 'Property' && parent.key?.type === 'Identifier') {
      return parent.key.name;
    }
    if (parent?.type === 'AssignmentExpression' && parent.left?.type === 'MemberExpression') {
      const prop = parent.left.property;
      if (prop.type === 'Identifier') return prop.name;
      if (prop.type === 'StringLiteral') return prop.value;
    }
  }
  if (node.type === 'ClassMethod' && node.key?.type === 'Identifier') {
    return node.key.name;
  }
  if (node.type === 'ObjectMethod' && node.key?.type === 'Identifier') {
    return node.key.name;
  }
  return null;
}

export function loggerCallerPlugin(): Plugin {
  return {
    name: 'logger-caller',
    enforce: 'pre',
    transform(code, id) {
      // if (!/\.([jt]sx?|svelte)$/.test(id) || /node_modules|\.wxt\/|scripts\//.test(id)) {
      if (!/\.[jt]sx?$/.test(id) || /node_modules|\.wxt\/|scripts\//.test(id)) {
        return null;
      }

      const ast = babelParse(code, getLang(id));
      const s = new MagicString(code);
      let modified = false;

      // First pass: collect enclosing function names for each CallExpression
      const fnNameMap = new Map<number, string>();
      const scopeStack: { name: string; start: number; end: number }[] = [];

      walkAST(ast, {
        enter(node, parent) {
          const fnName = getFunctionName(node, parent);
          if (fnName) {
            scopeStack.push({ name: fnName, start: node.start!, end: node.end! });
          }

          if (
            node.type === 'CallExpression' &&
            node.callee.type === 'MemberExpression' &&
            node.callee.object.type === 'Identifier' &&
            node.callee.object.name === 'logger' &&
            node.callee.property.type === 'Identifier' &&
            LOG_METHODS.has(node.callee.property.name)
          ) {
            // Find enclosing function
            const enclosing = scopeStack.length > 0 ? scopeStack[scopeStack.length - 1] : null;
            fnNameMap.set(node.start!, enclosing?.name ?? '<module>');
          }
        },
        leave(node) {
          const fnName = getFunctionName(node, null);
          if (fnName && scopeStack.length > 0) {
            const top = scopeStack[scopeStack.length - 1];
            if (node.start === top.start) {
              scopeStack.pop();
            }
          }
        }
      });

      // Second pass: transform logger calls
      walkAST(ast, {
        enter(node) {
          if (
            node.type === 'CallExpression' &&
            node.callee.type === 'MemberExpression' &&
            node.callee.object.type === 'Identifier' &&
            node.callee.object.name === 'logger' &&
            node.callee.property.type === 'Identifier' &&
            LOG_METHODS.has(node.callee.property.name)
          ) {
            const line = node.loc?.start?.line ?? 0;
            const file = path.relative(process.cwd(), id);
            const module = file.replace(/^src\//, '').replace(/\.[jt]sx?$/, '');
            const fnName = fnNameMap.get(node.start!) ?? '<module>';

            const callerInfo = `{file:${JSON.stringify(file)},line:${line},module:${JSON.stringify(module)},fn:${JSON.stringify(fnName)}}`;

            const argCount = node.arguments?.length ?? 0;
            const firstArg = node.arguments?.[0];
            if (argCount === 0) {
              s.appendLeft(node.end! - 1, `${callerInfo}`);
            } else if (argCount === 1) {
              if (firstArg?.type === 'ObjectExpression') {
                s.appendLeft(node.end! - 1, `,${callerInfo}`);
              } else {
                s.appendLeft(node.end! - 1, `,undefined,${callerInfo}`);
              }
            } else {
              s.appendLeft(node.end! - 1, `,${callerInfo}`);
            }

            modified = true;
          }
        }
      });

      if (!modified) return null;

      return {
        code: s.toString(),
        map: s.generateMap({ hires: true })
      };
    }
  };
}
