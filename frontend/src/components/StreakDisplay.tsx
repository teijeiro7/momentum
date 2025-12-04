import { useEffect, useState } from 'react';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  habitName?: string;
}

export default function StreakDisplay({ currentStreak, longestStreak, habitName }: StreakDisplayProps) {
  const [displayStreak, setDisplayStreak] = useState(0);

  // Animated counter effect
  useEffect(() => {
    let start = 0;
    const end = currentStreak;
    const duration = 1000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayStreak(end);
        clearInterval(timer);
      } else {
        setDisplayStreak(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [currentStreak]);

  const isOnFire = currentStreak >= 7;
  const isLongestStreak = currentStreak === longestStreak && currentStreak > 0;

  return (
    <div className="relative">
      <div
        className="rounded-2xl p-6 transition-all duration-300"
        style={{
          background: 'var(--gradient-card)',
          border: `2px solid ${isOnFire ? 'var(--accent-neon)' : 'var(--border)'}`,
          boxShadow: isOnFire ? 'var(--shadow-glow)' : 'var(--shadow-md)',
        }}
      >
        {/* Streak Number */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <span
              className="text-6xl font-bold gradient-text"
              style={{
                fontSize: '4rem',
                lineHeight: 1,
              }}
            >
              {displayStreak}
            </span>
            {isOnFire && (
              <span className="absolute -top-2 -right-8 text-4xl animate-fire">
                🔥
              </span>
            )}
          </div>
        </div>

        {/* Label */}
        <div className="text-center">
          <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Day Streak
          </p>
          {habitName && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {habitName}
            </p>
          )}
        </div>

        {/* Longest Streak Badge */}
        {isLongestStreak && longestStreak > 0 && (
          <div className="mt-4 flex items-center justify-center">
            <div
              className="px-3 py-1 rounded-full text-xs font-semibold animate-pulse-glow"
              style={{
                background: 'var(--gradient-primary)',
                color: 'var(--bg-primary)',
              }}
            >
              🏆 Personal Best!
            </div>
          </div>
        )}

        {/* Longest Streak Info */}
        {longestStreak > currentStreak && (
          <div className="mt-4 text-center">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Longest: {longestStreak} days
            </p>
          </div>
        )}

        {/* Motivational Messages */}
        {currentStreak === 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Start your streak today! 💪
            </p>
          </div>
        )}
        {currentStreak >= 30 && (
          <div className="mt-4 text-center">
            <p className="text-sm font-semibold" style={{ color: 'var(--accent-neon)' }}>
              Amazing! You're on a roll! 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
