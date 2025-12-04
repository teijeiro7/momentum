import { useState } from 'react';
import { Habit, createHabitLog } from '../services/api';

interface HabitQuickToggleProps {
  habits: Habit[];
  completedHabits: Set<number>;
  onToggle: () => void;
}

export default function HabitQuickToggle({ habits, completedHabits, onToggle }: HabitQuickToggleProps) {
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async (habit: Habit, isCompleted: boolean) => {
    setLoading(habit.id);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      await createHabitLog(habit.id, {
        date: today,
        value: !isCompleted,
      });
      onToggle();
    } catch (err) {
      console.error('Failed to toggle habit:', err);
      setError('Failed to update habit. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  if (habits.length === 0) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--border)',
        }}
      >
        <div className="text-4xl mb-3">📝</div>
        <p style={{ color: 'var(--text-muted)' }}>
          No habits yet. Create your first habit to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div
          className="p-3 rounded-lg text-sm"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
          }}
        >
          {error}
        </div>
      )}

      {habits.map((habit) => {
        const isCompleted = completedHabits.has(habit.id);
        const isLoading = loading === habit.id;

        return (
          <button
            key={habit.id}
            onClick={() => handleToggle(habit, isCompleted)}
            disabled={isLoading}
            className="w-full p-4 rounded-xl transition-all duration-200 hover-lift text-left"
            style={{
              background: isCompleted ? 'var(--accent-glow)' : 'var(--bg-card)',
              border: isCompleted ? '2px solid var(--accent-neon)' : '2px solid var(--border)',
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'wait' : 'pointer',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                {/* Checkbox */}
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200"
                  style={{
                    background: isCompleted ? 'var(--accent-neon)' : 'transparent',
                    border: `2px solid ${isCompleted ? 'var(--accent-neon)' : 'var(--border)'}`,
                    boxShadow: isCompleted ? '0 0 12px var(--accent-neon)' : 'none',
                  }}
                >
                  {isCompleted && (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="var(--bg-primary)"
                      viewBox="0 0 24 24"
                      strokeWidth="3"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Habit Info */}
                <div className="flex-1 min-w-0">
                  <h4
                    className="font-semibold truncate"
                    style={{
                      color: isCompleted ? 'var(--accent-neon)' : 'var(--text-primary)',
                    }}
                  >
                    {habit.name}
                  </h4>
                  <p
                    className="text-sm truncate"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {habit.goal}
                  </p>
                </div>
              </div>

              {/* Loading Spinner */}
              {isLoading && (
                <div
                  className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent ml-3"
                  style={{ borderColor: 'var(--accent-neon)' }}
                />
              )}

              {/* Status Icon */}
              {!isLoading && (
                <div className="text-xl ml-3">
                  {isCompleted ? '✅' : '⭕'}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
