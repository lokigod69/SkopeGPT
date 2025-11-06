/**
 * Offline Fallback Page
 * Shown when user is offline and page is not cached
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-6">
      <Card className="max-w-md border-border bg-card">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <span className="text-4xl">📡</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            You're offline
          </CardTitle>
          <CardDescription className="text-center text-base">
            No internet connection detected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-sm text-muted-foreground">
              Goal App works offline, but this page hasn't been cached yet.
              Connect to the internet and visit this page to cache it for offline use.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">What you can do:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>Check your internet connection</li>
              <li>Try refreshing the page</li>
              <li>Visit the home page (usually cached)</li>
            </ul>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
