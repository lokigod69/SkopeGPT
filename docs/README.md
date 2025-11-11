# Goal App Documentation

Single source of truth for the Goal App development and philosophy.

## Quick Links

- [**ROADMAP.md**](./ROADMAP.md) - Shipping phases and current status
- [**LLM_CONTRACT.md**](./LLM_CONTRACT.md) - Coach provider interface and rules
- [**ONBOARDING_FLOW.md**](./ONBOARDING_FLOW.md) - Step-by-step onboarding logic
- [**UI_LAYOUT.md**](./UI_LAYOUT.md) - Layout patterns and accessibility rules
- [**TESTS.md**](./TESTS.md) - E2E test specifications

## Philosophy

The Goal App helps people build habits that stick by following these principles:

### 1. First reps are always tiny
- New seeds start at ≤2 minutes, regardless of energy budget
- Builds automaticity before increasing volume
- "Touch it then stop" > "be epic"

### 2. Step-ups are earned
- Require ≥70% success rate over 14 days
- Increment by 10-15% only
- Never pressure, always suggest

### 3. Integration beats heroics
- Track "felt automatic" as key metric
- Promote to baseline at ≥80% automaticity
- Spawn new discovery seed when previous becomes baseline

### 4. Adaptation is continuous
- Coach observes patterns (skip reasons, timing, energy)
- Suggests tweaks (cue, step, time, energy)
- User accepts/rejects with one tap

### 5. Offline-first, sync-when-ready
- All actions queue locally (IndexedDB)
- Sync to Supabase when connected
- PWA works in airplane mode

## Coach Presets

Four coaching styles, user-switchable:

- **Drill Sergeant**: Direct, military-style ("One more rep. Build the loop.")
- **Socratic**: Reflective questions ("What is working? What needs adjusting?")
- **Compassionate**: Gentle, supportive ("You are showing up. That matters.")
- **Engineer**: Data-driven, technical ("Success rate: strong. Suggest: increment by 10-15%.")

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **Zustand** (client state)
- **tRPC** (type-safe API)
- **Dexie** (IndexedDB wrapper)
- **Supabase** (Postgres + RLS)
- **Tailwind CSS** (styling)
- **Playwright** (E2E tests)

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Optional
NEXT_PUBLIC_COACH_PROVIDER=mock    # or 'openai'
OPENAI_API_KEY=sk-...              # if using openai provider
```

## Development

```bash
# Install
pnpm install

# Dev server
pnpm dev

# Type check
pnpm typecheck

# Lint
pnpm lint

# Build
pnpm build:ci

# Tests
pnpm test:e2e
```

## Contributing

When adding features:
1. Check ROADMAP.md for current phase
2. Follow patterns in UI_LAYOUT.md
3. Update tests in TESTS.md
4. Respect the philosophy (tiny → earned → integrated)

## Support

File issues at: [github.com/your-repo/issues](https://github.com)
