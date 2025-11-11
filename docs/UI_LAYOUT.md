# UI Layout Rules

## Shell

```tsx
<body className="min-h-dvh bg-slate-950 text-slate-100 antialiased">
  <main className="mx-auto w-full max-w-[720px] px-4 sm:px-6 pb-[env(safe-area-inset-bottom)]">
    {children}
  </main>
</body>
```

## Safe Area

- Bottom padding: `pb-[env(safe-area-inset-bottom)]`
- Handles iOS home indicator and Android navigation

## Cards

```tsx
<section className="rounded-2xl border border-white/5 bg-slate-900/40 shadow-xl">
  <div className="p-6 sm:p-8">{children}</div>
  <div className="sticky bottom-0 border-t border-white/5 bg-slate-900/80 backdrop-blur p-3 sm:p-4">
    {footer}
  </div>
</section>
```

## CTA Pattern

- **Sticky inside card**, never `position: fixed` outside
- Footer stays within card bounds on all breakpoints (320-1440px)
- Backdrop blur for visual separation

## Typography

- h1: `text-2xl sm:text-3xl`
- h2: `text-2xl`
- body: `text-base`
- small: `text-sm`
- Contrast: ≥4.5:1 (WCAG AA)

## Motion

- Respect `prefers-reduced-motion`
- No blocking animations
- Transitions: 150-200ms ease

## Breakpoints

- Mobile: 320-639px
- Tablet: 640-1023px
- Desktop: 1024px+
- Max content width: 720px

## Accessibility

- Focus rings: visible on all interactive elements
- Radio cards: toggle via keyboard
- Skip link: provided at top of page
- ARIA labels: on all icon-only buttons
