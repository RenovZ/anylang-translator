# Anylang Translator

Perhaps the best browser translation assistant in the world.

A powerful browser translation extension supporting 20+ LLM models. Built with WXT + Svelte 5 + Tailwind CSS v4.

If this repo helps you, star it — every ⭐ means a lot.

## Features

- **Adaptive Translation** — Seamlessly translate web pages with smart detection
- **Instant Lookup** — Hover/click to translate words and phrases on the fly
- **20+ LLM Providers** — OpenAI, Anthropic, Google, Groq, DeepSeek, and more
- **Custom Providers** — OpenAI-compatible API support
- **Smart Language Detection** — Automatic source language identification
- **Beautiful UI** — Modern, minimal interface with multiple font options

## Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (Chrome)
pnpm dev:firefox      # Start dev server (Firefox)
```

## Build

```bash
pnpm build            # Production build (Chrome)
pnpm build:firefox    # Production build (Firefox)
pnpm build:edge       # Production build (Edge)
pnpm build:safari     # Production build (Safari)
pnpm zip              # Create Chrome ZIP for store submission
```

## Code Quality

```bash
pnpm check            # Svelte type checking
pnpm lint             # ESLint + Prettier
pnpm format           # Format all files with Prettier
pnpm test             # Run tests
```

## Credits

This project incorporates design ideas from the following open-source projects:

- [read-frog](https://github.com/mengxi-ream/read-frog)
- [Traduzir-paginas-web](https://github.com/FilipePS/Traduzir-paginas-web)
