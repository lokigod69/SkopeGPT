/**
 * Data Export Component
 * Export all user data as JSON or CSV
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db/dexie';

type ExportFormat = 'json' | 'csv';

export function DataExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<Date | null>(null);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);

    try {
      // Gather all local data
      const [goals, seeds, logs] = await Promise.all([
        db.goals.toArray(),
        db.seeds.toArray(),
        db.daily_logs.toArray(),
      ]);

      const data = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        goals,
        seeds,
        dailyLogs: logs,
      };

      let content: string;
      let mimeType: string;
      let filename: string;

      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        filename = `goal-app-export-${Date.now()}.json`;
      } else {
        // CSV format - flatten to logs with joined data
        const rows = logs.map((log) => {
          const seed = seeds.find((s) => s.id === log.seed_id);
          const goal = seed ? goals.find((g) => g.id === seed.goal_id) : null;

          return {
            date: log.date,
            horizon: goal?.horizon || '',
            step: seed?.step_description || '',
            outcome: log.outcome,
            skip_reason: log.skip_reason || '',
            energy_after: log.energy_after || '',
            notes: log.notes || '',
          };
        });

        const headers = 'Date,Horizon,Step,Outcome,Skip Reason,Energy After,Notes\n';
        const csvRows = rows
          .map((row) =>
            [
              row.date,
              escapeCSV(row.horizon),
              escapeCSV(row.step),
              row.outcome,
              row.skip_reason,
              row.energy_after,
              escapeCSV(row.notes),
            ].join(',')
          )
          .join('\n');

        content = headers + csvRows;
        mimeType = 'text/csv';
        filename = `goal-app-export-${Date.now()}.csv`;
      }

      // Download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      setLastExport(new Date());
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>
            Download all your goals, steps, and logs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {lastExport && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-sm text-green-200">
                Last exported: {lastExport.toLocaleString()}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Choose your preferred format:
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleExport('json')}
                disabled={isExporting}
                className="p-4 rounded-lg border-2 border-border bg-card hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">📄</div>
                  <p className="font-semibold text-sm">JSON</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete data structure
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="p-4 rounded-lg border-2 border-border bg-card hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="font-semibold text-sm">CSV</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Spreadsheet compatible
                  </p>
                </div>
              </button>
            </div>

            {isExporting && (
              <p className="text-sm text-center text-muted-foreground">
                Preparing export...
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">What's included:</span> All goals, micro-steps, daily logs, integration states, and metadata. Personal notes and skip reasons are included.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Import Data</CardTitle>
          <CardDescription>Coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Import functionality will be added in a future update. For now, you can export your data for backup.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Escape CSV field
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
