import { useState } from 'react';
import { getHabits, getHabitLogs } from '../services/api';

export default function DataExport() {
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<'csv' | 'json' | null>(null);

  const exportToCSV = async () => {
    try {
      setExporting(true);
      setExportType('csv');

      const habits = await getHabits();
      const allData: any[] = [];

      for (const habit of habits) {
        const logs = await getHabitLogs(habit.id);
        logs.forEach(log => {
          allData.push({
            habit_id: habit.id,
            habit_name: habit.name,
            habit_goal: habit.goal,
            habit_category: habit.category || 'other',
            date: log.date,
            completed: log.value,
          });
        });
      }

      // Convert to CSV
      const headers = ['Habit ID', 'Habit Name', 'Goal', 'Category', 'Date', 'Completed'];
      const csvContent = [
        headers.join(','),
        ...allData.map(row => 
          [row.habit_id, `"${row.habit_name}"`, `"${row.habit_goal}"`, row.habit_category, row.date, row.completed].join(',')
        )
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habitflow-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
      setExportType(null);
    }
  };

  const exportToJSON = async () => {
    try {
      setExporting(true);
      setExportType('json');

      const habits = await getHabits();
      const exportData = {
        exported_at: new Date().toISOString(),
        version: '1.0',
        habits: await Promise.all(
          habits.map(async habit => ({
            ...habit,
            logs: await getHabitLogs(habit.id),
          }))
        ),
      };

      // Download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habitflow-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
      setExportType(null);
    }
  };

  return (
    <div
      className="rounded-2xl p-6 animate-fade-in"
      style={{
        background: 'var(--gradient-card)',
        border: '2px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <h3 className="text-2xl font-bold mb-2 gradient-text">
        📥 Export Your Data
      </h3>
      <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
        Download all your habits and progress data
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CSV Export */}
        <button
          onClick={exportToCSV}
          disabled={exporting}
          className="p-6 rounded-xl transition-all duration-200 hover-lift hover-glow text-left"
          style={{
            background: 'var(--bg-tertiary)',
            border: '2px solid var(--border)',
            opacity: exporting && exportType !== 'csv' ? 0.5 : 1,
          }}
        >
          <div className="text-4xl mb-3">📊</div>
          <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Export to CSV
          </h4>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Perfect for Excel, Google Sheets, and data analysis
          </p>
          {exporting && exportType === 'csv' && (
            <div className="mt-3 flex items-center gap-2">
              <div
                className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--accent-neon)' }}
              />
              <span className="text-sm" style={{ color: 'var(--accent-neon)' }}>
                Exporting...
              </span>
            </div>
          )}
        </button>

        {/* JSON Export */}
        <button
          onClick={exportToJSON}
          disabled={exporting}
          className="p-6 rounded-xl transition-all duration-200 hover-lift hover-glow text-left"
          style={{
            background: 'var(--bg-tertiary)',
            border: '2px solid var(--border)',
            opacity: exporting && exportType !== 'json' ? 0.5 : 1,
          }}
        >
          <div className="text-4xl mb-3">💾</div>
          <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Export to JSON
          </h4>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Complete backup with all metadata and structure
          </p>
          {exporting && exportType === 'json' && (
            <div className="mt-3 flex items-center gap-2">
              <div
                className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--accent-neon)' }}
              />
              <span className="text-sm" style={{ color: 'var(--accent-neon)' }}>
                Exporting...
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div
        className="mt-6 p-4 rounded-lg"
        style={{
          background: 'var(--accent-glow)',
          border: '1px solid var(--accent-neon)',
        }}
      >
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
          💡 <strong>Tip:</strong> Your data is yours! Export anytime, no limits. This is a premium feature that's completely free.
        </p>
      </div>
    </div>
  );
}
