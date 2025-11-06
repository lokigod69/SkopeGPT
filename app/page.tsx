/**
 * Landing page / Today Card screen
 * This is the main entry point for the Goal App
 */

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 texture-grain">
      <div className="max-w-md w-full space-y-8 animate-prompt">
        {/* Logo / Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Goal App
          </h1>
          <p className="text-muted-foreground">
            Discovery → Integration
          </p>
        </div>

        {/* Today Card Placeholder */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4 shadow-xl">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-card-foreground">
              Phase 0: Complete ✓
            </h2>
            <p className="text-sm text-muted-foreground">
              Foundation is ready. Next: Building the domain state machine.
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Stack ready:
              </span>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ Next.js 14 + TypeScript</li>
              <li>✓ Tailwind + Obsidian theme</li>
              <li>✓ tRPC + Zod schemas</li>
              <li>✓ Dexie (IndexedDB)</li>
              <li>✓ Supabase (schema ready)</li>
            </ul>
          </div>

          <div className="pt-4">
            <button
              className="w-full bg-primary text-primary-foreground font-medium py-3 px-4 rounded-md hover:opacity-90 transition-opacity"
              disabled
            >
              Ready for Phase 1
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            Phase 0 of 5 complete
          </p>
        </div>
      </div>
    </main>
  );
}
