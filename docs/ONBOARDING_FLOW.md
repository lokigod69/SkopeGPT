# Onboarding Flow

## Steps

### 1. Horizon
- **Input**: Single text field
- **Suggestions**: Sleep, Strength, Writing, Finances, Learning, Creativity, Relationships, Mindfulness
- **Rules**: Title only; no giant essays

### 2. Energy Budget
- **Options**: tiny | small | medium | big
- **Copy**: Explains philosophy per level
  - tiny: "we'll anchor at 1-2 minutes and protect consistency"
  - small: "we'll start small and build from there"
  - medium: "we'll set 5-10 minutes as your default loop"
  - big: "longer reps, but we'll still keep the first step tiny"

### 3. Coach Preset
- **Options**: drill | socratic | compassionate | engineer
- **Preview**: Shows sample coaching line for each
- **Rules**: Can switch anytime - this just sets initial tone

### 4. Soil/Seed Snapshot
- **Feeling scale**: 1-5 (influences micro-step proposals)
- **Micro-steps**: 3 dynamic options based on energy + feeling
  - Base: all start ≤2 min
  - Nudge: only if energy=medium/big AND feeling≥4, option 3 → 3 min
- **Summary**: Shows energy copy + philosophy reminder
- **CTA**: "Start Journey"

## State Management

Lives in `domain/onboarding.store.ts` (Zustand)

## On Complete

1. Create `goal(title, coach_preset)`
2. Create `seed(description, minutes, if_window, active=true)`
3. Set `localStorage('onboarding_done', '1')`
4. Redirect to `/today`

## Validation

- Step 1: horizon must be non-empty
- Step 2: energy must be selected (default: small)
- Step 3: coach must be selected (default: compassionate)
- Step 4: seed must be selected

## Reactive UI

Changing energy in Step 2 updates:
- Energy copy text in Step 4
- Micro-step proposals in Step 4

No reload required - pure Zustand reactivity.
