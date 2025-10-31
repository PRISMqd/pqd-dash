# Repository Guidelines

This Next.js/Bun project mirrors the live Vercel deployment, so follow these
guardrails to keep automated syncs and releases stable.

## Project Structure & Module Organization

- `app/` contains the App Router entry points, route segments, and server actions synced from v0.
- `components/` houses reusable client/server components; co-locate feature-specific helpers in `lib/`.
- Place Tailwind extensions in `styles/`, static assets in `public/`, and create
  supporting docs under `docs/` before publishing.

## Build, Test, and Development Commands

- `bun install` installs dependencies; rerun after v0 pushes to refresh generated code.
- `bun run dev` starts Next.js locally with hot reload; use `bun run start` only
  for verifying production output.
- `bun run lint` runs the Biome linter; run `bun run format` if you need to
  apply formatting fixes.
- `bun run update:waveforms` refreshes the ECG/PPG templates from ThingSpeak
  channel 1283400 before formatting.
- `bun run build` must stay green alongside linting before promoting to Vercel.

## Coding Style & Naming Conventions

- Prefer TypeScript across `app/` and `components/`; keep modules small and export named functions.
- Follow React PascalCase for component files, camelCase for hooks/utilities,
  and meaningful segment folder names (e.g. `app/dashboard/[id]`).
- Tailwind classes should stay grouped by utility type (layout → spacing →
  color) and match tokens defined in `styles/`, and rely on Biome to enforce
  quotes/indentation.

## Testing Guidelines

- Linting is the current automated guardrail; run `bun run lint` before committing to catch common regressions.
- Manual smoke-test generated flows at `http://localhost:3000` after syncing;
  confirm forms, dialogs, and data visualizations render without console errors.
- Add future automated tests under `tests/` or colocated `__tests__`
  directories; mirror route names for clarity.

## Commit & Pull Request Guidelines

- Use Conventional Commits (`feat(ui): ...`, `fix(app): ...`) with subjects
  under 72 chars to match repo history.
- Summaries should note user-facing changes plus verification steps (`- run bun
  run lint`, `- check dashboard flow`).
- Pull requests must link any v0 task, describe local testing, and attach
  screenshots for UI regressions or layout changes.

## Security & Configuration Tips

- Configure secrets and environment variables through the Vercel dashboard;
  never commit `.env`.
- Keep generated credentials in workspace secrets, not in `public/` or
  versioned JSON.
- When adding analytics or integrations, gate them behind runtime env checks in
  `app/layout.tsx` to avoid leaking tokens.
