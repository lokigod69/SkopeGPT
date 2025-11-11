# Coach Provider Contract

**Environment flag**: `NEXT_PUBLIC_COACH_PROVIDER` = `mock` | `openai`

## Request

```ts
type CoachRequest = {
  preset: 'drill' | 'socratic' | 'compassionate' | 'engineer';
  seed: {
    description: string;
    minutes: number;
    if_window?: string;
    context?: string;
  };
  history: {
    date: string;
    outcome: 'done' | 'skipped';
    skip_reason?: string;
  }[];
  metrics: {
    success14: number;   // 14-day success rate (0-1)
    auto14: number;      // 14-day automaticity rate (0-1)
    energy: 'tiny' | 'small' | 'medium' | 'big';
  };
}
```

## Reply

```ts
type CoachReply = {
  nudge: string;                        // one sentence coaching message
  tweak?: {
    field: 'time' | 'step' | 'cue' | 'energy';
    value: string;
  };
  reflection?: string;                  // 1-2 lines for recap
}
```

## Rules

1. **First reps stay ≤2 min** regardless of energy budget
2. **Step up 10-15%** only at ≥70% success (14-day window)
3. **Promote to baseline** at ≥80% auto; spawn new discovery seed
4. **Tone matches preset**:
   - `drill`: Direct, military-style
   - `socratic`: Questions that prompt reflection
   - `compassionate`: Gentle, supportive
   - `engineer`: Data-driven, technical

## Mock Provider

Ships by default. Rule-based logic:
- Success ≥70% → suggest step-up
- Energy = tiny → protect streak at 1-2 min
- Recent skips ≥4/7 → fix cue timing
- Default → keep going

## OpenAI Provider (future)

When `NEXT_PUBLIC_COACH_PROVIDER=openai`:
- Use GPT-4 or similar
- System prompt includes philosophy + rules
- Context window: last 14 days of history
- Temperature: 0.7 for consistent tone
