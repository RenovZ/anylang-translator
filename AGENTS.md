# Browser Extension (WXT + Svelte)

## Commit Style

Refer to `~/commit.md`

## Dev Commands

```bash
pnpm run dev          # Start dev server
pnpm run build        # Production build (runs i18n extraction first)
pnpm run format       # Format all files (prettier, not dprint)
pnpm run check        # svelte-check for types
pnpm run lint         # eslint + prettier --check
pnpm run test         # Run tests
```

## Format & Lint

- **Formatter**: `prettier` (configured in `.prettierrc`)
- Single quotes, 4-space indent (per `.prettierrc` config)
- Excludes: `src/api`, `swagger.yaml`, `node_modules`

## i18n

- `scripts/extract-i18n.mjs` extracts strings to `public/_locales/en/messages.json`
- Runs automatically on `build:before` hook and during dev server file changes
- Run manually: `npm run i18n:extract`

## Entrypoints

| Entrypoint | Path                                  |
| ---------- | ------------------------------------- |
| Popup      | `src/entrypoints/popup/main.ts`       |
| Options    | `src/entrypoints/options/main.ts`     |
| Content    | `src/entrypoints/content/index.ts`    |
| Background | `src/entrypoints/background/index.ts` |

## Build Output

- `.output/` contains the built extension (not committed)
- `wxt.config.ts` configures the build; `srcDir: 'src'`

## Ignore

- `legacy/` — not part of the current project
- `src/lib/lang.ts` — auto-generated language name mappings (do not edit manually)

## Tech Stack

- **Framework**: WXT v0.20 + Svelte 5
- **Styling**: Tailwind CSS v4 + Flowbite-Svelte
- **Build**: Vite (via WXT)
- **Types**: TypeScript, extends `.wxt/tsconfig.json`
