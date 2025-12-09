import { useEffect, useState } from 'react';
import { getHabits, getHabitLogs, Habit, HabitLog } from '../services/api';
import StreakDisplay from './StreakDisplay';
import HabitQuickToggle from './HabitQuickToggle';

interface DashboardStats {
  totalHabits: number;
  completedToday: number;
  completedThisWeek: number;
  currentStreak: number;
  longestStreak: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalHabits: 0,
    completedToday: 0,
    completedThisWeek: 0,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabitsToday, setCompletedHabitsToday] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const habitsData = await getHabits();
      setHabits(habitsData);

      // Calculate stats
      let completedThisWeek = 0;
      let maxStreak = 0;
      let currentStreakMax = 0;

      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const completedToday = new Set<number>();

      for (const habit of habitsData) {
        try {
          const logs = await getHabitLogs(habit.id);
          
          // Check today
          const todayLog = logs.find(log => log.date.split('T')[0] === today);
          if (todayLog?.value) {
            completedToday.add(habit.id);
          }

          // Check this week
          const weekLogs = logs.filter(log => log.date.split('T')[0] >= weekAgo);
          if (weekLogs.some(log => log.value)) completedThisWeek++;

          // Calculate streak
          const streak = calculateStreak(logs);
          currentStreakMax = Math.max(currentStreakMax, streak.current);
          maxStreak = Math.max(maxStreak, streak.longest);
        } catch (err) {
          console.error(`Failed to load logs for habit ${habit.id}:`, err);
        }
      }

      setStats({
        totalHabits: habitsData.length,
        completedToday: completedToday.size,
        completedThisWeek,
        currentStreak: currentStreakMax,
        longestStreak: maxStreak,
      });
      setCompletedHabitsToday(completedToday);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (logs: HabitLog[]): { current: number; longest: number } => {
    if (logs.length === 0) return { current: 0, longest: 0 };

    // Filter only completed logs and sort by date (newest first)
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
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Calculate current streak
    let currentStreak = 0;
    const mostRecentLog = completedLogs[0];
    
    // Check if the streak is still active (completed today or yesterday)
    const daysSinceLastLog = Math.floor((today.getTime() - mostRecentLog.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastLog <= 1) {
      // Streak is active, count consecutive days from most recent
      currentStreak = 1;
      
      for (let i = 1; i < completedLogs.length; i++) {
        const currentDate = completedLogs[i];
        const previousDate = completedLogs[i - 1];
        const daysDiff = Math.floor((previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          currentStreak++;
        } else {
          break; // Streak broken
        }
      }
    }

    // Calculate longest streak
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
      longest: Math.max(longestStreak, currentStreak) 
    };
  };

  const completionPercentage = stats.totalHabits > 0 
    ? Math.round((stats.completedToday / stats.totalHabits) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" 
             style={{ borderColor: 'var(--accent-growth)' }}>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 gradient-text">
          Welcome Back! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Today's Habits - Quick Toggle */}
      <div className="animate-slide-in-up">
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'var(--gradient-card)',
            border: '2px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h2 className="text-2xl font-bold mb-4 gradient-text">
            Today's Habits
          </h2>
          <HabitQuickToggle
            habits={habits}
            completedHabits={completedHabitsToday}
            onToggle={loadDashboardData}
          />
        </div>
      </div>


      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Streak Display */}
        <div className="lg:col-span-1 animate-slide-in-up">
          <StreakDisplay
            currentStreak={stats.currentStreak}
            longestStreak={stats.longestStreak}
          />
        </div>

        {/* Today's Progress */}
        <div className="animate-slide-in-up stagger-1">
          <div
            className="rounded-2xl p-6 h-full"
            style={{
              background: 'var(--gradient-card)',
              border: '2px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Today's Progress
            </h3>
            
            {/* Circular Progress */}
            <div className="flex items-center justify-center mb-4" style={{ padding: '1rem' }}>
              <div className="relative" style={{ width: '128px', height: '128px' }}>
                <svg 
                  className="transform -rotate-90" 
                  width="128" 
                  height="128"
                  style={{ overflow: 'visible' }}
                >
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="var(--inactive)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="var(--accent-neon)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - completionPercentage / 100)}`}
                    className="transition-all duration-1000"
                    style={{ filter: 'drop-shadow(0 0 12px var(--accent-neon))' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold gradient-text">
                    {completionPercentage}%
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.completedToday} / {stats.totalHabits}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Habits Completed
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="animate-slide-in-up stagger-2">
          <div
            className="rounded-2xl p-6 h-full"
            style={{
              background: 'var(--gradient-card)',
              border: '2px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              This Week
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span style={{ color: 'var(--text-secondary)' }}>Active Habits</span>
                  <span className="font-bold" style={{ color: 'var(--accent-neon)' }}>
                    {stats.completedThisWeek}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: 'var(--inactive)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${stats.totalHabits > 0 ? (stats.completedThisWeek / stats.totalHabits) * 100 : 0}%`,
                      background: 'var(--gradient-primary)',
                    }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Total Habits</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {stats.totalHabits}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-in-up stagger-3">
        <button
          className="p-4 rounded-xl font-semibold transition-all duration-200 hover-lift hover-glow"
          style={{
            background: 'var(--gradient-primary)',
            color: 'var(--bg-primary)',
          }}
        >
          ➕ Add New Habit
        </button>
        <button
          className="p-4 rounded-xl font-semibold transition-all duration-200 hover-lift"
          style={{
            background: 'var(--bg-card)',
            border: '2px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          📊 View Analytics
        </button>
        <button
          className="p-4 rounded-xl font-semibold transition-all duration-200 hover-lift"
          style={{
            background: 'var(--bg-card)',
            border: '2px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          🎯 Focus Mode
        </button>
      </div>
    </div>
  );
}
