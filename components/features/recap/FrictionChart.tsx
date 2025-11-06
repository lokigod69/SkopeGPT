/**
 * Friction Distribution Chart
 * Donut chart showing breakdown of skip reasons
 * Helps identify patterns in what blocks progress
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FrictionChartProps {
  frictionMap: {
    too_hard: number;
    bad_timing: number;
    low_energy: number;
    forgot: number;
  };
  compact?: boolean;
}

const FRICTION_CONFIG = {
  too_hard: {
    label: 'Too Hard',
    icon: '⚡',
    color: '#FF3B53', // crimson-pulse
    description: 'Step felt too challenging',
  },
  bad_timing: {
    label: 'Wrong Time',
    icon: '⏰',
    color: '#FFB84D', // orange
    description: 'Timing wasn\'t right',
  },
  low_energy: {
    label: 'Low Energy',
    icon: '🔋',
    color: '#FFC107', // yellow
    description: 'Not enough energy',
  },
  forgot: {
    label: 'Forgot',
    icon: '💭',
    color: '#8B94A1', // ash
    description: 'Missed the cue',
  },
};

export function FrictionChart({ frictionMap, compact = false }: FrictionChartProps) {
  const total = Object.values(frictionMap).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No skips this week - amazing consistency! 🎉
          </p>
        </CardContent>
      </Card>
    );
  }

  const frictionData = Object.entries(frictionMap)
    .filter(([_, count]) => count > 0)
    .map(([reason, count]) => ({
      reason: reason as keyof typeof FRICTION_CONFIG,
      count,
      percentage: (count / total) * 100,
      ...FRICTION_CONFIG[reason as keyof typeof FRICTION_CONFIG],
    }))
    .sort((a, b) => b.count - a.count);

  if (compact) {
    return <CompactFrictionChart data={frictionData} total={total} />;
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Friction Analysis</CardTitle>
        <CardDescription>
          What got in the way this week
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Donut Chart */}
        <div className="flex justify-center">
          <DonutChart data={frictionData} total={total} />
        </div>

        {/* Legend with bars */}
        <div className="space-y-3">
          {frictionData.map((item) => (
            <div key={item.reason} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {item.count} time{item.count > 1 ? 's' : ''}
                  </span>
                  <span className="font-semibold" style={{ color: item.color }}>
                    {Math.round(item.percentage)}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground pl-7">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Insight */}
        <div className="pt-4 border-t border-border">
          <FrictionInsight data={frictionData} />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * SVG Donut Chart
 */
function DonutChart({
  data,
  total,
}: {
  data: Array<{
    reason: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  total: number;
}) {
  const size = 200;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativePercent = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />

        {/* Segments */}
        {data.map((item, index) => {
          const segmentPercent = item.percentage / 100;
          const strokeDasharray = `${segmentPercent * circumference} ${circumference}`;
          const strokeDashoffset =
            -cumulativePercent * circumference + circumference / 4;

          cumulativePercent += segmentPercent;

          return (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all"
            />
          );
        })}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold">{total}</div>
        <div className="text-xs text-muted-foreground">skips</div>
      </div>
    </div>
  );
}

/**
 * Compact version for inline display
 */
function CompactFrictionChart({
  data,
  total,
}: {
  data: Array<{
    reason: string;
    count: number;
    percentage: number;
    color: string;
    icon: string;
    label: string;
  }>;
  total: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Friction breakdown</span>
        <span>{total} total skips</span>
      </div>

      {/* Horizontal stacked bar */}
      <div className="h-6 bg-muted rounded-full overflow-hidden flex">
        {data.map((item) => (
          <div
            key={item.reason}
            className="h-full flex items-center justify-center text-xs font-medium transition-all hover:opacity-80"
            style={{
              width: `${item.percentage}%`,
              backgroundColor: item.color,
              color: 'white',
            }}
            title={`${item.label}: ${item.count}`}
          >
            {item.percentage > 15 && item.icon}
          </div>
        ))}
      </div>

      {/* Mini legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        {data.map((item) => (
          <div key={item.reason} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">
              {item.label} ({item.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Actionable insight based on top friction
 */
function FrictionInsight({
  data,
}: {
  data: Array<{
    reason: string;
    count: number;
    label: string;
  }>;
}) {
  if (data.length === 0) return null;

  const topFriction = data[0];

  const insights: Record<string, string> = {
    too_hard:
      'Consider breaking down your step into something smaller, or trying an easier version.',
    bad_timing:
      'Your timing window might need adjustment. Try a different time of day.',
    low_energy:
      'Low energy is a pattern. Consider adding a 2-minute energy primer before your step.',
    forgot:
      'Strengthen your cue. Make it more visible or tie it to an existing habit.',
  };

  const insight = insights[topFriction.reason] || 'Keep experimenting with what works.';

  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border">
      <div className="flex items-start gap-2">
        <span className="text-xl">💡</span>
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">Suggestion</p>
          <p className="text-xs text-muted-foreground">{insight}</p>
        </div>
      </div>
    </div>
  );
}
