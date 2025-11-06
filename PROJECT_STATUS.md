# Goal App - Project Status

## Overview
A mobile-first web app for building micro-habits using behavioral science. Energy-first, fail-forward design with no shame mechanics.

**Core Philosophy:** Discovery → Integration in 90 seconds/day

---

## Progress Summary

### ✅ Phase 0: Foundation (100% Complete)
- [x] Next.js 14 with TypeScript, App Router
- [x] Tailwind CSS with custom design tokens (Obsidian palette)
- [x] Zod schemas for type-safe domain entities
- [x] tRPC API with React Query integration
- [x] IndexedDB (Dexie) for local-first storage
- [x] Supabase schema SQL (ready to deploy)
- [ ] **MANUAL**: Set up Supabase project and run schema
- [ ] **MANUAL**: Configure Supabase Auth

### ✅ Phase 1: Domain Logic (100% Complete)
- [x] State machine for seed lifecycle (Idle → Prompted → Done/Triage → Adapt)
- [x] Adaptation engine (4 skip reasons: too_hard, bad_timing, low_energy, forgot)
- [x] Coach system (4 personas: Drill, Socratic, Compassionate, Engineer)
- [x] Onboarding flow (4 steps: Horizon, Energy Budget, Coach, Soil/Seed)

### ✅ Phase 2: Daily Loop (100% Complete)
- [x] TodayCard component with Do/Log/Skip CTAs
- [x] FrictionTriage modal (one-tap skip reason selection)
- [x] IntegrationCheck component (Not yet / Almost / Yes)
- [x] If-Then composer (implementation intention builder)
- [x] Rolling success calculation (14-day window)
- [x] Step-up logic (10-15% increase at 70% success)
- [x] Baseline promotion (auto-promote at 80% success)
- [x] Energy Meter widget (4-level visual indicator)
- [x] Quick Notes capture (swipe-up drawer)

### ✅ Phase 3: Analytics & Insights (100% Complete)
- [x] Weekly Recap screen with trend sparkline
- [x] Friction distribution donut chart
- [x] Tweak suggestion system (timing, step_size, cue, energy)
- [x] Tweak application UI (one-tap accept/decline)

### ✅ Phase 4: PWA & Offline (100% Complete)
- [x] PWA manifest with app shortcuts
- [x] Service worker for offline support
- [x] Offline fallback page
- [x] Push notification system with VAPID
- [x] Notification preferences UI (quiet hours, delivery window)
- [x] Offline queue and sync engine

### 🚧 Phase 5: Polish & Deployment (0% Complete)
- [ ] Settings screen (account, privacy, accessibility)
- [ ] Data export functionality (CSV/JSON)
- [ ] Clear-all data with confirmation
- [ ] LLM integration for coach copy (optional)
- [ ] Accessibility features (WCAG AA, keyboard nav)
- [ ] Testing suite (Vitest unit tests, Playwright e2e)
- [ ] Performance optimization (Lighthouse, code splitting)
- [ ] CI/CD pipeline with Vercel

---

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **API**: tRPC with superjson transformer
- **Database**: Supabase (Postgres + Row Level Security)
- **Local Storage**: IndexedDB via Dexie
- **State Management**: React Query (via tRPC)
- **Validation**: Zod schemas

### Key Design Patterns
- **Local-First**: IndexedDB as source of truth, Supabase for sync
- **Offline Queue**: Operations queued when offline, synced when online
- **Domain-Driven Design**: Pure domain logic separated from React
- **Type Safety**: End-to-end types from database to UI
- **Progressive Enhancement**: Works offline, enhances with notifications

---

## File Structure

```
goal-app/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with PWA config
│   ├── page.tsx                 # Home page
│   ├── onboarding/page.tsx      # 4-step onboarding
│   └── offline/page.tsx         # Offline fallback
├── components/
│   ├── ui/                      # shadcn/ui primitives
│   └── features/
│       ├── onboarding/          # Onboarding steps
│       │   ├── HorizonStep.tsx
│       │   ├── EnergyStep.tsx
│       │   ├── CoachStep.tsx
│       │   └── SoilSeedStep.tsx
│       ├── today/               # Daily loop components
│       │   ├── TodayCard.tsx
│       │   ├── FrictionTriage.tsx
│       │   ├── IntegrationCheck.tsx
│       │   ├── IfThenComposer.tsx
│       │   ├── EnergyMeter.tsx
│       │   └── QuickNotes.tsx
│       ├── recap/               # Analytics components
│       │   ├── WeeklyRecap.tsx
│       │   ├── FrictionChart.tsx
│       │   └── TweakSuggestion.tsx
│       └── settings/
│           └── NotificationSettings.tsx
├── domain/                      # Pure domain logic (no React)
│   ├── stateMachine.ts         # Seed lifecycle FSM
│   ├── adapt.ts                # Adaptation strategies
│   ├── coachCopy.ts            # Coach persona system
│   ├── stepUp.ts               # Progressive overload logic
│   ├── baseline.ts             # Baseline promotion logic
│   └── tweaks.ts               # Tweak suggestion engine
├── lib/
│   ├── schemas.ts              # Zod schemas (single source of truth)
│   ├── db/
│   │   ├── schema.sql          # Supabase schema
│   │   ├── supabase.ts         # Supabase client
│   │   └── dexie.ts            # IndexedDB setup
│   ├── api/
│   │   ├── trpc.ts             # tRPC context & procedures
│   │   ├── helpers.ts          # Ownership verification
│   │   ├── provider.tsx        # React Query provider
│   │   └── routers/
│   │       ├── goals.ts
│   │       ├── seeds.ts
│   │       └── daily.ts
│   ├── pwa/
│   │   └── register-sw.ts      # Service worker registration
│   └── sync/
│       └── offline-queue.ts    # Offline sync engine
└── public/
    ├── manifest.json           # PWA manifest
    └── sw.js                   # Service worker
```

---

## Domain Model

### Core Entities

**Goal** (Horizon)
- `horizon`: String (e.g., "Sleep", "Strength", "Writing")
- `energy_budget`: "tiny" | "small" | "medium" | "big"
- `coach_preset`: "drill" | "socratic" | "compassionate" | "engineer"
- `status`: "active" | "paused" | "archived"

**Seed** (Micro-Step)
- `step_description`: String (1-2 minute action)
- `if_then_cue`: Optional trigger/cue
- `window_start`, `window_end`: Time window
- `rolling_success`: 14-day success rate
- `status`: "active" | "baseline" | "archived"

**DailyLog**
- `outcome`: "done" | "skipped"
- `skip_reason`: "too_hard" | "bad_timing" | "low_energy" | "forgot"
- `energy_after`: 1-5 rating
- `notes`: Optional reflection

**IntegrationState**
- `status`: "not_yet" | "almost" | "yes"
- `rolling_success`: 0.0 - 1.0
- Tracks path to automaticity

---

## Key Behaviors

### Adaptation Engine
When a seed is skipped, the system adapts based on reason:
- **too_hard**: Reduce step size by 30%
- **bad_timing**: Suggest alternative time windows
- **low_energy**: Add 2-minute energy primer
- **forgot**: Strengthen cue/reminder

### Progressive Overload
- At 70% rolling success → Suggest 10-15% increase
- At 80% rolling success → Promote to baseline
- User can manually confirm integration anytime

### Coach Personas
Same underlying logic, different tone:
- **Drill Sergeant**: Direct, no-nonsense ("90 seconds. Go.")
- **Socratic**: Question-based ("What's possible in 2 minutes?")
- **Compassionate**: Gentle, supportive ("One small step. You've got this.")
- **Engineer**: Systems-focused ("Timer primed. Auto-save enabled.")

### Offline-First
- All writes go to IndexedDB first
- Operations queued when offline
- Sync to Supabase when online
- Conflicts resolved via timestamps

---

## Next Steps

### Phase 5: Remaining Work
1. **Settings Screen**: Account management, privacy controls
2. **Data Export**: Allow users to export their logs (CSV/JSON)
3. **Accessibility**: WCAG AA compliance, keyboard navigation
4. **Testing**: Unit tests (Vitest) and E2E tests (Playwright)
5. **Performance**: Lighthouse audit, code splitting, lazy loading
6. **Deployment**: Vercel setup, CI/CD pipeline

### Manual Setup Required
1. Create Supabase project
2. Run `lib/db/schema.sql` in Supabase SQL editor
3. Configure environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   NEXT_PUBLIC_APP_URL=
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=
   ```
4. Enable Supabase Auth (Email/Magic Link)

---

## Component Locations

### Onboarding Flow
- [HorizonStep.tsx](components/features/onboarding/HorizonStep.tsx) - Goal selection
- [EnergyStep.tsx](components/features/onboarding/EnergyStep.tsx) - Energy budget picker
- [CoachStep.tsx](components/features/onboarding/CoachStep.tsx) - Coach persona selection
- [SoilSeedStep.tsx](components/features/onboarding/SoilSeedStep.tsx) - Current state + first micro-step

### Daily Loop
- [TodayCard.tsx](components/features/today/TodayCard.tsx) - Main daily interaction (Do/Log/Skip)
- [FrictionTriage.tsx](components/features/today/FrictionTriage.tsx) - Skip reason modal
- [IntegrationCheck.tsx](components/features/today/IntegrationCheck.tsx) - Automaticity check
- [IfThenComposer.tsx](components/features/today/IfThenComposer.tsx) - Cue builder
- [EnergyMeter.tsx](components/features/today/EnergyMeter.tsx) - Energy level widget
- [QuickNotes.tsx](components/features/today/QuickNotes.tsx) - Swipe-up notes

### Analytics
- [WeeklyRecap.tsx](components/features/recap/WeeklyRecap.tsx) - 7-day trend + sparkline
- [FrictionChart.tsx](components/features/recap/FrictionChart.tsx) - Donut chart of skip reasons
- [TweakSuggestion.tsx](components/features/recap/TweakSuggestion.tsx) - Suggested adjustments

### Domain Logic
- [stateMachine.ts](domain/stateMachine.ts) - Seed lifecycle FSM
- [adapt.ts](domain/adapt.ts) - Adaptation strategies
- [coachCopy.ts](domain/coachCopy.ts) - Coach templates
- [stepUp.ts](domain/stepUp.ts) - Progressive overload
- [baseline.ts](domain/baseline.ts) - Baseline promotion
- [tweaks.ts](domain/tweaks.ts) - Tweak suggestions

---

## Design Tokens (Obsidian Palette)

```css
--obsidian: #0B0D10;        /* Background */
--graphite: #1A1F27;        /* Surface */
--ash: #8B94A1;             /* Muted text */
--electric-teal: #19E3CF;   /* Primary accent */
--crimson-pulse: #FF3B53;   /* Error/urgent */
```

**Animation Timing:**
- Prompts: 120ms (hints at haptic feedback)
- Completions: 240ms (satisfying micro-reward)

---

## Data Flow

1. **User Action** → Component Event
2. **Component** → tRPC Mutation
3. **tRPC** → IndexedDB (local write)
4. **Queue** → Offline queue (if offline)
5. **Sync** → Supabase (when online)
6. **Update** → React Query cache invalidation
7. **Re-render** → UI updates

---

## Success Metrics

### Behavioral
- Rolling success ≥ 70% → Ready for step-up
- Rolling success ≥ 80% → Baseline promotion
- Integration status = "yes" → Habit automated

### Technical
- Lighthouse Performance ≥ 90
- Lighthouse Accessibility = 100
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s

---

## Known Limitations

1. **No Authentication Yet**: Supabase Auth not connected to UI
2. **No Image Icons**: PWA icons are placeholders
3. **Service Worker**: Needs testing in production
4. **Push Notifications**: Requires VAPID key setup
5. **E2E Tests**: Not yet implemented

---

## License

MIT (or as specified by project owner)
