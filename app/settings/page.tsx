/**
 * Settings Page
 * Account, Privacy, Accessibility, Notifications, Data Export
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { NotificationSettings } from '@/components/features/settings/NotificationSettings';
import { DataExport } from '@/components/features/settings/DataExport';
import { ClearDataDialog } from '@/components/features/settings/ClearDataDialog';
import { isStandalone } from '@/lib/pwa/register-sw';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'privacy' | 'accessibility' | 'notifications' | 'export'>('account');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const tabs = [
    { id: 'account' as const, label: 'Account', icon: '👤' },
    { id: 'privacy' as const, label: 'Privacy', icon: '🔒' },
    { id: 'accessibility' as const, label: 'A11y', icon: '♿' },
    { id: 'notifications' as const, label: 'Notify', icon: '🔔' },
    { id: 'export' as const, label: 'Export', icon: '📥' },
  ];

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Header */}
      <header className="border-b border-border bg-graphite/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border hover:border-primary/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-muted-foreground">
                    Authentication is not yet connected. Once Supabase Auth is configured, you'll see your email and account controls here.
                  </p>
                </div>

                <Button variant="outline" className="w-full" disabled>
                  Sign Out (Coming Soon)
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>App Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">1.0.0-beta</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mode</span>
                  <span className="font-medium">{isStandalone() ? 'Installed PWA' : 'Browser'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Build</span>
                  <span className="font-medium">{process.env.NODE_ENV}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Privacy & Data</CardTitle>
                <CardDescription>Control your data and privacy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Local Data</Label>
                  <p className="text-xs text-muted-foreground">
                    Your data is stored locally on your device and synced to Supabase when online.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <p className="text-sm text-yellow-200">
                    <span className="font-semibold">Warning:</span> Clearing all data is permanent and cannot be undone.
                  </p>
                </div>

                <Button
                  onClick={() => setShowClearDialog(true)}
                  variant="destructive"
                  className="w-full"
                >
                  Clear All Data
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>We don't track you</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This app doesn't use analytics or tracking. All your data stays on your device and your Supabase account.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Accessibility Tab */}
        {activeTab === 'accessibility' && (
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Accessibility</CardTitle>
                <CardDescription>Customize for your needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Font Size */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Font Size</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          fontSize === size
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-card hover:border-primary/50'
                        }`}
                      >
                        <span className={`font-medium ${
                          size === 'small' ? 'text-xs' : size === 'large' ? 'text-base' : 'text-sm'
                        }`}>
                          {size === 'small' ? 'A' : size === 'large' ? 'A' : 'A'}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current: {fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}
                  </p>
                </div>

                {/* Reduced Motion */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Animations</Label>
                  <button
                    onClick={() => setReducedMotion(!reducedMotion)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      reducedMotion
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Reduce Motion</p>
                        <p className="text-xs text-muted-foreground">
                          Minimize animations and transitions
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          reducedMotion ? 'border-primary' : 'border-muted-foreground/30'
                        }`}
                      >
                        {reducedMotion && (
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Keyboard Navigation */}
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm font-semibold mb-2">Keyboard Navigation</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Tab / Shift+Tab: Navigate between controls</li>
                    <li>• Enter / Space: Activate buttons</li>
                    <li>• Escape: Close modals</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <NotificationSettings
            preferences={{
              enabled: false,
              quietHoursStart: '22:00',
              quietHoursEnd: '08:00',
              windowStart: '09:00',
              windowEnd: '21:00',
              frequency: 'once',
            }}
            onSave={(prefs) => {
              console.log('Saving notification preferences:', prefs);
              // Would save to backend here
            }}
          />
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <DataExport />
        )}

        {/* Back to Home */}
        <Button
          onClick={() => window.history.back()}
          variant="outline"
          className="w-full"
        >
          ← Back
        </Button>
      </div>

      {/* Clear Data Dialog */}
      <ClearDataDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={async () => {
          // Would clear data here
          console.log('Clearing all data...');
          setShowClearDialog(false);
        }}
      />
    </div>
  );
}
