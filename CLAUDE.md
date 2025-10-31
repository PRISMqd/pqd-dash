# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PRISM Quality Dashboard (PQD)** - Real-time medical telemetry monitoring dashboard for critical care environments. This is a high-fidelity prototype/demo displaying live vital signs waveforms (ECG, blood pressure, blood volume, SpO2), patient/clinician information, AI-powered clinical insights, and event timelines for acute coronary syndrome (ACS) protocols.

**Key Tech Stack:**

- Next.js 16.0.0 (App Router) with React 19.2.0
- Bun package manager
- Tailwind CSS 4.1.16 (v4 with CSS-first config)
- SciChart 4.0.897 (WebAssembly-based high-performance medical waveform rendering)
- Biome 2.3.1 (linter/formatter replacing ESLint + Prettier)
- Storybook 10.0.0 with Vitest integration for component testing
- TypeScript 5.9.3 with strict type safety

## Development Commands

### Essential Commands

```bash
bun install                    # install dependencies (after v0 syncs)
bun run dev                    # start Next.js dev server (http://localhost:3000)
bun run lint                   # run Biome linter (MUST pass before commits)
bun run format                 # auto-format with Biome
bun run build                  # production build (must pass with lint)
bun run storybook              # launch Storybook (http://localhost:6006)
```

### Data Management Commands

```bash
bun run update:waveforms       # fetch fresh ECG/PPG data from ThingSpeak channel 1283400
bun run vectorize:body         # vectorize body diagram SVG
```

### Testing

```bash
vitest                         # run Vitest tests (Storybook stories as tests via Playwright)
```

**Current testing status:**

- Linting enforced via `bun run lint` before commits
- Manual smoke testing at `http://localhost:3000` after syncing
- Storybook stories document all components with visual regression capability
- Future automated tests should go in `/tests` or `__tests__` directories

## Architecture & Code Patterns

### Server → Client Data Flow Pattern

This project uses the **promise-based data fetching pattern** with React 19's `use()` hook:

```typescript
// Server Component (app/page.tsx)
export default async function Page() {
  const data = await getMedicalDashboardData();  // server action
  return <MedicalDashboard data={data} />;       // pass as prop
}

// Server Action (app/actions/get-medical-dashboard-data.ts)
export async function getMedicalDashboardData(): Promise<MedicalDashboardData> {
  return createMockMedicalDashboardData();  // from DAL (lib/dal/)
}

// Client Component receives data directly
function MedicalDashboard({ data }: { data: MedicalDashboardData }) {
  // render cards with data props
}
```

**Note:** Currently using mock data from `lib/dal/mock-medical-dashboard.ts`. Future versions will integrate real EHR/telemetry APIs.

### Real-time Waveform Streaming Architecture

#### Critical Pattern: Singleton Timer with Pub/Sub Subscribers

```typescript
// Publisher (single global timer in data/vital-signs-stream.ts)
Timer (20ms) → tick() → subscribers.forEach() → dataSeries.appendRange()

// Subscribers (multiple waveform components)
useEffect(() => {
  const unsubscribe = subscribeToWaveformStream(
    config.seriesId,      // "ecg", "abp", "bloodVolume", "spo2"
    dataSeries,           // SciChart XyDataSeries
    onSample              // callback for each data point
  );
  return unsubscribe;     // cleanup on unmount
}, []);
```

**Performance optimizations:**

- **Single global timer** - one 20ms interval for ALL waveform charts (CPU efficient)
- **FIFO sweeping mode** - memory-efficient scrolling waveforms like real ECG monitors
- **Pre-warmed series** - 291KB of real ECG/PPG data loaded from `data/scichart-vital-signs-data.ts`
- **Ref-based buffering** - vital signs sampled every 20ms, aggregated every 2s without state updates
- **WebAssembly rendering** - SciChart uses native-speed WASM for smooth 60fps charts

### SciChart Integration Details

**WASM files location:** `/public/_wasm/scichart2d.wasm` + `scichart2d.js`

**License:** Community license (watermark removed via CSS in component styles)

**Key chart configuration:**

- `XyDataSeries` - time series data with x/y values
- `FastLineRenderableSeries` - high-performance line rendering
- `NumericAxis` - auto-ranging axes with label formatters
- `RolloverModifier` - crosshair tooltip on hover
- `MouseWheelZoomModifier` - zoom with mouse wheel

**Waveform color coding (matches hospital monitors):**

- ECG: `#00ff00` (green)
- Blood Pressure: `#ff0000` (red)
- Blood Volume: `#ffff00` (yellow)
- SpO2: `#00ffff` (cyan)

### Component Organization

**Modular card-based architecture:**

- `components/medical-dashboard.tsx` - main orchestrator (client component with grid layout)
- `components/medical-dashboard/` - individual dashboard cards:
  - `patient-info-card.tsx` - patient demographics
  - `clinician-card.tsx` - assigned clinician info
  - `body-diagram-card.tsx` - interactive body diagram with alert hotspots
  - `alert-notes-card.tsx` - clinical notes and alerts
  - `ai-information-card.tsx` - AI-generated insights and recommendations
  - `policy-info-card.tsx` - ACS protocol guidance
  - `status-info-card.tsx` - vital signs numeric display
  - `timeline-track.tsx` - event timeline with modal details
  - `types.ts` - shared TypeScript interfaces
- `components/ui/` - shadcn/ui primitives (button, card, dialog, etc.)
- `components/alert-level-bar.tsx` - vertical gradient alert indicator
- `components/vital-signs-waveform-card.tsx` - SciChart waveform wrapper
- `components/alert-state-context.tsx` - global alert state provider

**Grid layout pattern (CSS Grid):**

```css
grid-template-columns: 240px 1fr 280px;  /* left | center | right */
grid-template-rows: 2rem auto repeat(6, 1fr) auto 2rem;
```

### State Management

- **React Context:** `AlertStateProvider` for global alert state (`isAlert`, `setIsAlert`)
- **Local state:** `useState`, `useRef`, `useMemo`, `useCallback` for component-level state
- **Server state:** Fetched via server actions, passed as props
- **Real-time streaming:** Pub/sub pattern for waveform data (isolated from React state)

### Import Standards

**ALWAYS use absolute imports with `@/` prefix:**

```typescript
import { Button } from "@/components/ui/button"
import { getMedicalDashboardData } from "@/app/actions/get-medical-dashboard-data"
import { createMockMedicalDashboardData } from "@/lib/dal/mock-medical-dashboard"
```

**NEVER use relative imports** (`./` or `../`).

## Code Quality Standards

### Biome Configuration

**Enforced settings (biome.json):**

- Line width: 80 characters
- Indent: 2 spaces
- Quote style: double quotes
- Auto-organize imports on save
- Tailwind CSS directive support in CSS parser

**Run before every commit:**

```bash
bun run lint        # must pass
bun run format      # optional cleanup
```

### Design System & Styling

**PRISM Design System:**

The color palette is defined in `app/globals.css` using `oklch` color space for perceptually uniform colors.

**Main Theme Colors:**

- Teal shades: `--prism-teal-100` (#AFD4CF), `--prism-teal-200` (#A7E0E5), `--prism-teal-300` (#5E8E88)
- Gray shades: `--prism-gray-50` through `--prism-gray-900` (light to dark)

**Interactions & Accent:**

- Interactive teals: `--prism-interactive-teal-100/200/300` (#7BB8A9, #5C9D8D, #3F6E67)
- Interactive gray: `--prism-interactive-gray` (#C2CCC9)

**Data Display:**

- Dark backgrounds: `--prism-data-dark-900/700/600` (#1C2625, #2D5550, #3A5F7B)
- Data colors: `--prism-data-green` (#5B7E5F), `--prism-data-brown` (#7B6645)

**Alarms (Critical UI States):**

- Green (normal): `--prism-alarm-green` (#218F67)
- Yellow (warning): `--prism-alarm-yellow` (#D1C247)
- Red (critical): `--prism-alarm-red` (#C22D4D)
- Blue (info): `--prism-alarm-blue` (#4B90A6)

**Typography:**

- Font family: **Inter** (specified in PDF design spec)
- Loaded via Next.js Google Fonts in `app/layout.tsx`
- Fallbacks: ui-sans-serif, system-ui, sans-serif

**Tailwind class organization:**

- Group by utility type: layout → spacing → color → typography
- Use `cn()` utility from `lib/utils.ts` for conditional classes
- Leverage Tailwind v4's CSS-first configuration
- Dark mode support via `next-themes`

**Medical-specific semantic tokens:**

- `--medical-teal`, `--medical-red`, `--medical-warning` for dashboard alerts
- `--medical-dark`, `--medical-darker` for card backgrounds
- Use these tokens for components that need to change based on alert state

### TypeScript Best Practices

**This project uses strict TypeScript with no `any` types.**

- Define proper interfaces in `components/medical-dashboard/types.ts`
- Use type guards for runtime validation
- Export shared types for reuse across components
- Path alias `@/*` maps to project root (configured in `tsconfig.json`)

### Known Technical Debt

**Documented issues to address:**

1. **`ignoreBuildErrors: true` in next.config.mjs** - TypeScript errors are currently ignored during builds. This should be fixed by resolving all type errors.

2. **Hardcoded waveform data** - 291KB embedded in bundle (`data/scichart-vital-signs-data.ts`). Consider lazy loading or chunking this data.

3. **Mock data only** - No real API integration yet. Future work: integrate EHR/telemetry APIs.

4. **Missing error boundaries** - No fallback UI for errors. Add error boundaries for critical sections.

5. **Unoptimized images** - `unoptimized: true` in next.config.mjs disables Next.js image optimization. Re-enable for production.

## Deployment & Versioning

**Auto-synced from v0.app:**

- Changes deployed from v0.app automatically push to this repository
- Vercel deploys the latest version from `main` branch
- Continue building at: <https://v0.app/chat/projects/fIEn9OZuiBN>
- Live deployment: <https://vercel.com/david-gidwanis-projects/v0-PQD>

**Pre-deployment checklist:**

- ✅ `bun run lint` passes
- ✅ `bun run build` succeeds
- ✅ Manual smoke test at `http://localhost:3000`
- ✅ Verify waveforms render smoothly
- ✅ Check console for errors

## Commit Standards

**Use Conventional Commits format:**

```bash
feat(dashboard): add real-time ECG waveform streaming
fix(waveforms): resolve FIFO buffer overflow issue
refactor(ui): extract timeline event modal to separate component
docs(readme): update deployment instructions
chore(deps): upgrade SciChart to 4.0.897
```

**Subject line:**

- Under 72 characters
- Imperative mood ("add" not "added")
- No period at end

**Body (when needed):**

- Use bullet points for details
- Explain WHY, not WHAT (code shows what)
- Include verification steps if relevant

## Storybook Component Development

**All components should have Storybook stories:**

```typescript
// Example: components/ui/button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "default",
    children: "Click me",
  },
};
```

**Run Storybook:**

```bash
bun run storybook       # dev mode on port 6006
bun run build-storybook # production build
```

**Storybook addons configured:**

- `@storybook/addon-a11y` - accessibility testing
- `@storybook/addon-docs` - auto-generated documentation
- `@storybook/addon-vitest` - run stories as Vitest tests

## Security & Configuration

**Environment variables:**

- Configure via Vercel dashboard (NEVER commit `.env`)
- Gate analytics/integrations behind runtime env checks in `app/layout.tsx`
- Keep credentials in workspace secrets, not in `public/` or versioned files

**WASM security:**

- SciChart WASM files served from `/public/_wasm/` (trusted source)
- Verify integrity after updates to SciChart dependency
