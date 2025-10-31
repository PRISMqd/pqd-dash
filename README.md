# PRISMqd Dashboard Frontend

## Overview

This is the frontend for the PRISMqd Dashboard.

### Stack

- [Node.js](https://nodejs.org/) 22.x (for Vercel/Next.js compatibility)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- [SciChart](https://www.scichart.com/)

### Tooling

This includes code quality, static analysis, linting, formatting,
testing, development environment management, and deployment.

- [Bun](https://bun.sh/)
- [Vercel](https://vercel.com/)
- [Mise](https://mise.jdx.dev/)

## Quickstart

```shell
# with just Bun
# (or your preferred runtime/package manager, but bun is recommended)
bun install
bun run dev
```

However, to help facilitate development environment parity and improve
DX, it's highly recommended to use `mise` as we have all the necessary
tools and tool versions, project tasks, and development environment
configuration already configured in `mise.toml`.

You can install `mise` with brew or by following the instructions
[on the mise website](https://mise.jdx.dev/getting-started.html).

```shell
mise install
mise run dev
# mise run help for a list of project-specific tasks available
```
