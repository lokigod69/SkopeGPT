/**
 * Onboarding Card Wrapper
 * Keeps CTA footer inside the card bounds on all screen sizes
 */

'use client';

interface OnboardingCardProps {
  title?: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function OnboardingCard({ title, description, children, footer }: OnboardingCardProps) {
  return (
    <section className="relative rounded-2xl border border-white/5 bg-slate-900/40 shadow-xl">
      <div className="p-6 sm:p-8">
        {(title || description) && (
          <header className="mb-4 sm:mb-6">
            {title && <h1 className="text-2xl sm:text-3xl font-semibold">{title}</h1>}
            {description && (
              <p className="mt-2 text-sm text-slate-400">
                {description}
              </p>
            )}
          </header>
        )}
        {children}
      </div>

      {footer && (
        <div className="sticky bottom-0 z-10">
          <div className="border-t border-white/5 bg-slate-900/80 backdrop-blur p-3 sm:p-4">
            {footer}
          </div>
        </div>
      )}
    </section>
  );
}
