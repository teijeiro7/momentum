import { useState } from 'react';

interface CalendarViewProps {
  habitName: string;
  logs: Array<{ date: string; value: boolean }>;
}

export default function CalendarView({ habitName, logs }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create array of days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  // Check if a day has a log
  const getDayStatus = (day: number): 'completed' | 'incomplete' | 'none' => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const log = logs.find(l => l.date.startsWith(dateStr));
    
    if (!log) return 'none';
    return log.value ? 'completed' : 'incomplete';
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isToday = (day: number) => {
    const today = new Date();
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold gradient-text">
          📅 {habitName}
        </h3>
        <button
          onClick={goToToday}
          className="px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 hover-lift"
          style={{
            background: 'var(--accent-glow)',
            color: 'var(--accent-neon)',
            border: '1px solid var(--accent-neon)',
          }}
        >
          Today
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg transition-all duration-200 hover-lift"
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h4 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {monthNames[month]} {year}
        </h4>

        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg transition-all duration-200 hover-lift"
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day names */}
        {dayNames.map(day => (
          <div
            key={day}
            className="text-center text-sm font-semibold py-2"
            style={{ color: 'var(--text-muted)' }}
          >
            {day}
          </div>
        ))}

        {/* Blank spaces */}
        {blanks.map(blank => (
          <div key={`blank-${blank}`} />
        ))}

        {/* Days */}
        {days.map(day => {
          const status = getDayStatus(day);
          const today = isToday(day);

          return (
            <div
              key={day}
              className="aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 hover-scale cursor-pointer"
              style={{
                background: status === 'completed' 
                  ? 'var(--accent-neon)' 
                  : status === 'incomplete'
                  ? 'var(--warning)'
                  : 'var(--bg-tertiary)',
                color: status === 'completed' || status === 'incomplete'
                  ? 'var(--bg-primary)'
                  : 'var(--text-secondary)',
                border: today ? '2px solid var(--accent-growth)' : '1px solid var(--border)',
                boxShadow: status === 'completed' ? 'var(--shadow-glow)' : 'none',
              }}
              title={
                status === 'completed' 
                  ? 'Completed ✓' 
                  : status === 'incomplete'
                  ? 'Logged but not completed'
                  : 'No data'
              }
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ background: 'var(--accent-neon)', boxShadow: 'var(--shadow-glow)' }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ background: 'var(--warning)' }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>Incomplete</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>No data</span>
        </div>
      </div>
    </div>
  );
}
