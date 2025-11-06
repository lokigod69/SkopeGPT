/**
 * Weekly Recap Component
 * Shows progress over the last 7 days with trend sparkline
 * Friction insights and celebration
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { CoachPreset } from '@/lib/schemas';
import { CoachSystem } from '@/domain/coachCopy';

interface WeeklyRecapData {
  completionRate: number;
  totalLogs: number;
  doneCount: number;
  skipCount: number;
  streak: number;
  trendData: Array<{ date: string; count: number }>;
  frictionMap: {
    too_hard: number;
    bad_timing: number;
    low_energy: number;
    forgot: number;
  };
}

interface WeeklyRecapProps {
  data: WeeklyRecapData;
  coachPreset: CoachPreset;
  onClose?: () => void;
}

export function WeeklyRecap({ data, coachPreset, onClose }: WeeklyRecapProps) {
  const coachCopy = CoachSystem.getCoachCopy(coachPreset, 'recap');

  // Calculate trend direction
  const trendSlope = calculateTrendSlope(data.trendData);
  const trendDirection = trendSlope > 0 ? 'up' : trendSlope < 0 ? 'down' : 'flat';

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6">
      <Card className="border-primary/30 bg-gradient-to-b from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-2xl">Your Week</CardTitle>
          <CardDescription className="text-base italic">
            "{coachCopy}"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Completion Rate - Big Number */}
          <div className="text-center py-6">
            <div className="text-6xl font-bold text-primary">
              {Math.round(data.completionRate * 100)}%
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Completion rate this week
            </p>
          </div>

          {/* Trend Sparkline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">7-day trend</span>
              <TrendIndicator direction={trendDirection} />
            </div>
            <Sparkline data={data.trendData} />
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Completed"
              value={data.doneCount}
              icon="✓"
              color="text-green-500"
            />
            <StatCard
              label="Skipped"
              value={data.skipCount}
              icon="⊗"
              color="text-yellow-500"
            />
            <StatCard
              label="Streak"
              value={data.streak}
              icon="🔥"
              color="text-orange-500"
            />
          </div>

          {/* Top Friction Source */}
          {data.skipCount > 0 && (
            <TopFriction frictionMap={data.frictionMap} />
          )}

          {/* Encouragement */}
          <div className="pt-4 border-t border-border">
            <EncouragementMessage
              completionRate={data.completionRate}
              coachPreset={coachPreset}
            />
          </div>

          {onClose && (
            <Button onClick={onClose} className="w-full" size="lg">
              Back to Today
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Sparkline visualization
 */
function Sparkline({ data }: { data: Array<{ date: string; count: number }> }) {
  if (data.length === 0) return null;

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const barWidth = `${100 / data.length}%`;

  return (
    <div className="relative h-24 bg-muted/30 rounded-lg p-2">
      <div className="flex items-end justify-between h-full gap-1">
        {data.map((point, index) => {
          const heightPercent = (point.count / maxCount) * 100;
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className="w-full bg-primary rounded-sm transition-all hover:opacity-80"
                style={{ height: `${heightPercent}%` }}
                title={`${point.date}: ${point.count}`}
              />
              <span className="text-xs text-muted-foreground">
                {new Date(point.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                })[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Trend direction indicator
 */
function TrendIndicator({ direction }: { direction: 'up' | 'down' | 'flat' }) {
  const indicators = {
    up: { icon: '↗', color: 'text-green-500', label: 'Improving' },
    down: { icon: '↘', color: 'text-red-500', label: 'Declining' },
    flat: { icon: '→', color: 'text-muted-foreground', label: 'Steady' },
  };

  const indicator = indicators[direction];

  return (
    <div className={`flex items-center gap-1 ${indicator.color}`}>
      <span className="text-xl">{indicator.icon}</span>
      <span className="text-xs font-medium">{indicator.label}</span>
    </div>
  );
}

/**
 * Stat card for grid
 */
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center p-4 rounded-lg bg-muted/30 border border-border">
      <span className="text-2xl mb-1">{icon}</span>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

/**
 * Top friction source
 */
function TopFriction({
  frictionMap,
}: {
  frictionMap: {
    too_hard: number;
    bad_timing: number;
    low_energy: number;
    forgot: number;
  };
}) {
  const frictions = Object.entries(frictionMap)
    .filter(([_, count]) => count > 0)
    .sort(([_, a], [__, b]) => b - a);

  if (frictions.length === 0) return null;

  const [topReason, topCount] = frictions[0];

  const frictionLabels: Record<string, { label: string; icon: string }> = {
    too_hard: { label: 'Too challenging', icon: '⚡' },
    bad_timing: { label: 'Wrong timing', icon: '⏰' },
    low_energy: { label: 'Low energy', icon: '🔋' },
    forgot: { label: 'Forgot cue', icon: '💭' },
  };

  const friction = frictionLabels[topReason];

  return (
    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{friction.icon}</span>
        <span className="text-sm font-semibold">Top friction point</span>
      </div>
      <p className="text-sm text-muted-foreground">
        {friction.label} came up {topCount} time{topCount > 1 ? 's' : ''} this week
      </p>
    </div>
  );
}

/**
 * Encouragement message based on performance
 */
function EncouragementMessage({
  completionRate,
  coachPreset,
}: {
  completionRate: number;
  coachPreset: CoachPreset;
}) {
  const coach = CoachSystem.getAllCoaches().find(
    (c) => c.preset === coachPreset
  );

  let message = '';

  if (completionRate >= 0.8) {
    message =
      coachPreset === 'drill'
        ? 'Elite consistency. You earned this.'
        : coachPreset === 'socratic'
          ? 'What does it feel like to show up this consistently?'
          : coachPreset === 'compassionate'
            ? "You're doing amazing. Be proud of this progress!"
            : '80%+ success rate. System performing optimally.';
  } else if (completionRate >= 0.6) {
    message =
      coachPreset === 'drill'
        ? 'Solid week. Keep the momentum.'
        : coachPreset === 'socratic'
          ? 'What helped you succeed this week?'
          : coachPreset === 'compassionate'
            ? 'Progress over perfection. You showed up!'
            : '60-80% range. Good baseline, room for optimization.';
  } else if (completionRate >= 0.4) {
    message =
      coachPreset === 'drill'
        ? 'You showed up. Build from here.'
        : coachPreset === 'socratic'
          ? 'What patterns do you notice in the misses?'
          : coachPreset === 'compassionate'
            ? 'Every attempt counts. Be gentle with yourself.'
            : '40-60% range. Friction detected, adaptation recommended.';
  } else {
    message =
      coachPreset === 'drill'
        ? 'Tough week. Reset tomorrow.'
        : coachPreset === 'socratic'
          ? 'What got in the way? What can we learn?'
          : coachPreset === 'compassionate'
            ? "It's okay. Tomorrow is a fresh start."
            : '<40% success. System may need recalibration.';
  }

  return (
    <p className="text-sm text-center text-muted-foreground italic">{message}</p>
  );
}

/**
 * Calculate trend slope (simple linear regression)
 */
function calculateTrendSlope(data: Array<{ date: string; count: number }>): number {
  if (data.length < 2) return 0;

  const n = data.length;
  const xs = data.map((_, i) => i);
  const ys = data.map((d) => d.count);

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((sum, x, i) => sum + x * ys[i], 0);
  const sumX2 = xs.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope;
}
