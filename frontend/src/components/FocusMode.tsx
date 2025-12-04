import { useState, useEffect } from 'react';
import { getHabits, getHabitLogs, createHabitLog, Habit } from '../services/api';
import { getCategoryEmoji } from '../utils/categories';

export default function FocusMode() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedToday, setCompletedToday] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayHabits();
  }, []);

  const loadTodayHabits = async () => {
    try {
      setLoading(true);
      const habitsData = await getHabits();
      setHabits(habitsData);

      // Check which habits are completed today
      const today = new Date().toISOString().split('T')[0];
      const completed = new Set<number>();

      for (const habit of habitsData) {
        const logs = await getHabitLogs(habit.id);
        const todayLog = logs.find(log => log.date.startsWith(today));
        if (todayLog?.value) {
          completed.add(habit.id);
        }
      }

      setCompletedToday(completed);
    } catch (err) {
      console.error('Failed to load habits:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = async (habitId: number) => {
    try {
      const isCompleted = completedToday.has(habitId);
      const today = new Date().toISOString();

      await createHabitLog(habitId, {
        date: today,
        value: !isCompleted,
      });

      setCompletedToday(prev => {
        const next = new Set(prev);
        if (isCompleted) {
          next.delete(habitId);
        } else {
          next.add(habitId);
        }
        return next;
      });
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    }
  };

  const completionPercentage = habits.length > 0 
    ? Math.round((completedToday.size / habits.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--accent-growth)' }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-3 gradient-text">
          🎯 Focus Mode
        </h1>
        <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Progress Circle */}
      <div className="flex justify-center mb-8">
        <div className="relative w-48 h-48">
          <svg className="transform -rotate-90 w-48 h-48">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="var(--inactive)"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="var(--accent-neon)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - completionPercentage / 100)}`}
              className="transition-all duration-1000"
              style={{ filter: 'drop-shadow(0 0 12px var(--accent-neon))' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold gradient-text">
              {completionPercentage}%
            </span>
            <span className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {completedToday.size} / {habits.length}
            </span>
          </div>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div
            className="text-center py-12 rounded-2xl"
            style={{
              background: 'var(--bg-card)',
              border: '2px solid var(--border)',
            }}
          >
            <div className="text-6xl mb-4">✨</div>
            <p className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No habits yet
            </p>
            <p style={{ color: 'var(--text-muted)' }}>
              Create your first habit to get started
            </p>
          </div>
        ) : (
          habits.map((habit, index) => {
            const isCompleted = completedToday.has(habit.id);
            const emoji = habit.category ? getCategoryEmoji(habit.category) : '📌';

            return (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`w-full p-6 rounded-2xl transition-all duration-300 hover-lift text-left animate-slide-in-up stagger-${Math.min(index + 1, 5)}`}
                style={{
                  background: isCompleted ? 'var(--accent-glow)' : 'var(--bg-card)',
                  border: isCompleted ? '2px solid var(--accent-neon)' : '2px solid var(--border)',
                  boxShadow: isCompleted ? 'var(--shadow-glow)' : 'var(--shadow-md)',
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      background: isCompleted ? 'var(--accent-neon)' : 'var(--bg-tertiary)',
                      border: `2px solid ${isCompleted ? 'var(--accent-neon)' : 'var(--border)'}`,
                    }}
                  >
                    {isCompleted && (
                      <svg className="w-5 h-5" fill="none" stroke="var(--bg-primary)" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{emoji}</span>
                      <h3
                        className="text-xl font-semibold"
                        style={{
                          color: isCompleted ? 'var(--accent-neon)' : 'var(--text-primary)',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                        }}
                      >
                        {habit.name}
                      </h3>
                    </div>
                    <p
                      className="text-sm"
                      style={{
                        color: isCompleted ? 'var(--text-muted)' : 'var(--text-secondary)',
                      }}
                    >
                      {habit.goal}
                    </p>
                  </div>

                  {/* Completion Badge */}
                  {isCompleted && (
                    <div
                      className="px-3 py-1 rounded-full text-xs font-semibold animate-scale-in"
                      style={{
                        background: 'var(--accent-neon)',
                        color: 'var(--bg-primary)',
                      }}
                    >
                      ✓ Done
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Motivational Message */}
      {habits.length > 0 && (
        <div className="mt-8 text-center">
          {completionPercentage === 100 ? (
            <p className="text-2xl font-bold gradient-text animate-pulse-glow">
              🎉 Perfect day! All habits completed!
            </p>
          ) : completionPercentage >= 50 ? (
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              💪 Great progress! Keep going!
            </p>
          ) : (
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              ✨ You've got this! One habit at a time.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
