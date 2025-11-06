/**
 * Notification Settings Component
 * Configure push notifications, quiet hours, and delivery windows
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from '@/lib/pwa/register-sw';

interface NotificationPreferences {
  enabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  windowStart: string;
  windowEnd: string;
  frequency: 'once' | 'twice' | 'thrice';
}

interface NotificationSettingsProps {
  preferences: NotificationPreferences;
  onSave: (prefs: NotificationPreferences) => void;
}

export function NotificationSettings({
  preferences: initialPreferences,
  onSave,
}: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleEnableNotifications = async () => {
    setIsProcessing(true);
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        setPermission('granted');
        // Would get VAPID key from env/config
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
        const subscription = await subscribeToPushNotifications(vapidKey);
        if (subscription) {
          setIsSubscribed(true);
          setPreferences({ ...preferences, enabled: true });
          // Would save subscription to backend here
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsProcessing(true);
    try {
      await unsubscribeFromPushNotifications();
      setIsSubscribed(false);
      setPreferences({ ...preferences, enabled: false });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    onSave(preferences);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Get reminded to do your daily micro-step
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Permission status */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium">Notification Status</p>
              <p className="text-xs text-muted-foreground">
                {permission === 'granted'
                  ? 'Enabled'
                  : permission === 'denied'
                    ? 'Blocked'
                    : 'Not enabled'}
              </p>
            </div>
            {permission === 'default' && (
              <Button
                onClick={handleEnableNotifications}
                disabled={isProcessing}
              >
                Enable
              </Button>
            )}
            {permission === 'granted' && isSubscribed && (
              <Button
                onClick={handleDisableNotifications}
                disabled={isProcessing}
                variant="outline"
              >
                Disable
              </Button>
            )}
            {permission === 'denied' && (
              <p className="text-xs text-muted-foreground">
                Enable in browser settings
              </p>
            )}
          </div>

          {permission === 'granted' && (
            <>
              {/* Delivery Window */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Delivery Window</Label>
                <p className="text-xs text-muted-foreground">
                  Only receive notifications during these hours
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="window-start" className="text-xs">
                      Start time
                    </Label>
                    <Input
                      id="window-start"
                      type="time"
                      value={preferences.windowStart}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          windowStart: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="window-end" className="text-xs">
                      End time
                    </Label>
                    <Input
                      id="window-end"
                      type="time"
                      value={preferences.windowEnd}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          windowEnd: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Quiet Hours</Label>
                <p className="text-xs text-muted-foreground">
                  Never send notifications during these hours
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quiet-start" className="text-xs">
                      Start time
                    </Label>
                    <Input
                      id="quiet-start"
                      type="time"
                      value={preferences.quietHoursStart}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          quietHoursStart: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quiet-end" className="text-xs">
                      End time
                    </Label>
                    <Input
                      id="quiet-end"
                      type="time"
                      value={preferences.quietHoursEnd}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          quietHoursEnd: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Daily Frequency</Label>
                <p className="text-xs text-muted-foreground">
                  How many reminders per day
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(['once', 'twice', 'thrice'] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() =>
                        setPreferences({ ...preferences, frequency: freq })
                      }
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        preferences.frequency === freq
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      {freq === 'once' ? '1x' : freq === 'twice' ? '2x' : '3x'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save button */}
              <Button onClick={handleSave} className="w-full" size="lg">
                Save Preferences
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Test Notification */}
      {permission === 'granted' && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Test Notification</CardTitle>
            <CardDescription>
              Send a test notification to see how it looks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                new Notification('Goal App Test', {
                  body: 'Time for your micro-step! Just 90 seconds.',
                  icon: '/icons/icon-192x192.png',
                });
              }}
              variant="outline"
              className="w-full"
            >
              Send Test Notification
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
