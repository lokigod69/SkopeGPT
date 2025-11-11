# Tests (Playwright)

## Setup

```bash
pnpm install -D @playwright/test
pnpm exec playwright install
```

## Test Files

### `tests/onboarding.cta-bounds.spec.ts`

Verifies CTA stays inside card on all breakpoints.

```ts
test('CTA stays within card bounds on mobile', async ({ page }) => {
  await page.goto('/onboarding');
  await page.setViewportSize({ width: 320, height: 568 });
  // ... assertions
});

test('CTA stays within card bounds on desktop', async ({ page }) => {
  await page.goto('/onboarding');
  await page.setViewportSize({ width: 1440, height: 900 });
  // ... assertions
});
```

### `tests/onboarding.energy-summary.spec.ts`

Verifies changing energy in Step 2 updates text in Step 4 without reload.

```ts
test('energy change reflects in summary', async ({ page }) => {
  await page.goto('/onboarding');

  // Step 1: Select horizon
  await page.click('text=Sleep');
  await page.click('text=Continue');

  // Step 2: Select energy
  await page.click('text=tiny');
  await page.click('text=Continue');

  // Step 3: Select coach
  await page.click('[data-coach="compassionate"]');
  await page.click('text=Continue');

  // Step 4: Verify energy copy
  await expect(page.locator('text=/Energy budget: tiny/')).toBeVisible();
});
```

### `tests/today.skip-adapts.spec.ts`

Verifies skip flow triggers friction triage and coach suggestion.

```ts
test('skip triggers triage and coaching', async ({ page }) => {
  // ... test implementation
});
```

### `tests/offline.queue-sync.spec.ts`

Verifies offline queue persists and syncs when connection restored.

```ts
test('offline queue syncs on reconnect', async ({ page, context }) => {
  // Go offline
  await context.setOffline(true);

  // Log action
  await page.click('text=Done');

  // Verify queued
  // ...

  // Go online
  await context.setOffline(false);

  // Verify sync
  // ...
});
```

## Run Tests

```bash
# All tests
pnpm test:e2e

# Specific file
pnpm test:e2e tests/onboarding.cta-bounds.spec.ts

# Headed mode (visible browser)
pnpm test:e2e --headed

# Debug mode
pnpm test:e2e --debug
```

## CI Integration

Add to `.github/workflows/ci.yml`:

```yaml
- name: Install Playwright
  run: pnpm exec playwright install --with-deps

- name: Run E2E tests
  run: pnpm test:e2e
```
