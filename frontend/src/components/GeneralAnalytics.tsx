import { useEffect, useState } from 'react';
import { getHabits, getHabitLogs, Habit, HabitLog } from '../services/api';

interface GeneralStats {
  totalHabits: number;
  totalCompletions: number;
  averageCompletionRate: number;
  bestStreak: number;
  totalActiveHabits: number;
  completionsByDay: { [key: string]: number };
  habitPerformance: Array<{
    habit: Habit;
    completionRate: number;
    currentStreak: number;
    totalCompletions: number;
  }>;
}

export default function GeneralAnalytics() {
  const [stats, setStats] = useState<GeneralStats>({
    totalHabits: 0,
    totalCompletions: 0,
    averageCompletionRate: 0,
    bestStreak: 0,
    totalActiveHabits: 0,
    completionsByDay: {},
    habitPerformance: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGeneralAnalytics();
  }, []);

  const loadGeneralAnalytics = async () => {
    try {
      setLoading(true);
      const habits = await getHabits();

      let totalCompletions = 0;
      let bestStreak = 0;
      let activeHabits = 0;
      const completionsByDay: { [key: string]: number } = {};
      const habitPerformance: Array<{
        habit: Habit;
        completionRate: number;
        currentStreak: number;
        totalCompletions: number;
      }> = [];

      const now = new Date();

      for (const habit of habits) {
        try {
          const logs = await getHabitLogs(habit.id);

          // Count completions
          const completions = logs.filter(log => log.value).length;
          totalCompletions += completions;

          // Track completions by day
          logs.forEach(log => {
            if (log.value) {
              const date = new Date(log.date).toISOString().split('T')[0];
              completionsByDay[date] = (completionsByDay[date] || 0) + 1;
            }
          });

          // Calculate streak
          const streak = calculateStreak(logs);
          if (streak.current > 0) activeHabits++;
          bestStreak = Math.max(bestStreak, streak.longest);

          // Calculate completion rate
          const daysSinceCreation = Math.max(
            1,
            Math.ceil((now.getTime() - new Date(habit.created_at).getTime()) / (1000 * 60 * 60 * 24))
          );
          const completionRate = (completions / daysSinceCreation) * 100;

          habitPerformance.push({
            habit,
            completionRate: Math.min(100, completionRate),
            currentStreak: streak.current,
            totalCompletions: completions,
          });
        } catch (err) {
          console.error(`Failed to load logs for habit ${habit.id}:`, err);
        }
      }

      // Sort habit performance by completion rate
      habitPerformance.sort((a, b) => b.completionRate - a.completionRate);

      // Calculate average completion rate
      const averageCompletionRate = habitPerformance.length > 0
        ? habitPerformance.reduce((sum, h) => sum + h.completionRate, 0) / habitPerformance.length
        : 0;

      setStats({
        totalHabits: habits.length,
        totalCompletions,
        averageCompletionRate,
        bestStreak,
        totalActiveHabits: activeHabits,
        completionsByDay,
        habitPerformance,
      });
    } catch (err) {
      console.error('Failed to load general analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (logs: HabitLog[]): { current: number; longest: number } => {
    if (logs.length === 0) return { current: 0, longest: 0 };

    const completedLogs = logs
      .filter(log => log.value)
      .map(log => {
        const date = new Date(log.date);
        date.setHours(0, 0, 0, 0);
        return date;
      })
      .sort((a, b) => b.getTime() - a.getTime());

    if (completedLogs.length === 0) return { current: 0, longest: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    const mostRecentLog = completedLogs[0];
    const daysSinceLastLog = Math.floor((today.getTime() - mostRecentLog.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastLog <= 1) {
      currentStreak = 1;
      for (let i = 1; i < completedLogs.length; i++) {
        const currentDate = completedLogs[i];
        const previousDate = completedLogs[i - 1];
        const daysDiff = Math.floor((previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    let longestStreak = 0;
    let tempStreak = 1;
    for (let i = 1; i < completedLogs.length; i++) {
      const currentDate = completedLogs[i];
      const previousDate = completedLogs[i - 1];
      const daysDiff = Math.floor((previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      current: currentStreak,
      longest: Math.max(longestStreak, currentStreak),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
          style={{ borderColor: 'var(--accent-growth)' }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold gradient-text">📊 General Analytics</h2>
        <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
          Overview of all your habits
        </p>
      </div>

      {/* Main Stats - Simplified */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="rounded-xl p-6 text-center"
          style={{
            background: 'var(--gradient-card)',
            border: '2px solid var(--border)',
          }}
        >
          <div className="text-3xl mb-2">✅</div>
          <p className="text-2xl font-bold gradient-text">{stats.totalHabits}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Total Habits</p>
        </div>

        <div
          className="rounded-xl p-6 text-center"
          style={{
            background: 'var(--gradient-card)',
            border: '2px solid var(--border)',
          }}
        >
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-2xl font-bold" style={{ color: 'var(--accent-neon)' }}>
            {stats.totalCompletions}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Completions</p>
        </div>

        <div
          className="rounded-xl p-6 text-center"
          style={{
            background: 'var(--gradient-card)',
            border: '2px solid var(--border)',
          }}
        >
          <div className="text-3xl mb-2">📈</div>
          <p className="text-2xl font-bold" style={{ color: 'var(--accent-growth)' }}>
            {stats.averageCompletionRate.toFixed(0)}%
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Avg. Rate</p>
        </div>

        <div
          className="rounded-xl p-6 text-center"
          style={{
            background: 'var(--gradient-card)',
            border: '2px solid var(--border)',
          }}
        >
          <div className="text-3xl mb-2">🔥</div>
          <p className="text-2xl font-bold" style={{ color: 'var(--accent-energy)' }}>
            {stats.bestStreak}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Best Streak</p>
        </div>
      </div>

      {/* Habit Performance - Simplified */}
      <div
        className="rounded-xl p-6"
        style={{
          background: 'var(--gradient-card)',
          border: '2px solid var(--border)',
        }}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          🏆 Top Performers
        </h3>
        
        {stats.habitPerformance.length > 0 ? (
          <div className="space-y-3">
            {stats.habitPerformance.slice(0, 5).map((item, index) => (
              <div
                key={item.habit.id}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{
                  background: 'var(--bg-tertiary)',
                }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '•'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {item.habit.name}
                    </h4>
                    <div className="w-full h-1.5 rounded-full mt-2" style={{ background: 'var(--inactive)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.completionRate}%`,
                          background: 'var(--gradient-primary)',
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-lg font-bold" style={{ color: 'var(--accent-neon)' }}>
                    {item.completionRate.toFixed(0)}%
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {item.currentStreak}d streak
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p style={{ color: 'var(--text-muted)' }}>No habits yet. Start tracking!</p>
          </div>
        )}
      </div>
    </div>
  );
}
