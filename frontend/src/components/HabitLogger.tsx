import { useState, useEffect } from 'react';
import {
  createHabitLog,
  getHabitLogs,
  HabitLog,
  Habit,
} from '../services/api';

interface HabitLoggerProps {
  habit: Habit;
  onLogCreated: () => void;
}

export default function HabitLogger({ habit, onLogCreated }: HabitLoggerProps) {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [habit.id]);

  const loadLogs = async () => {
    try {
      const data = await getHabitLogs(habit.id);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  const handleToggleToday = async () => {
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if already logged today
      const todayLog = logs.find(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
      });

      await createHabitLog(habit.id, {
        date: today.toISOString(),
        value: !todayLog?.value || false,
      });

      await loadLogs();
      onLogCreated();
    } catch (err) {
      console.error('Failed to log habit:', err);
    } finally {
      setLoading(false);
    }
  };

  const isTodayLogged = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLog = logs.find(log => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });

    return todayLog?.value || false;
  };

  const isDone = isTodayLogged();

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-semibold text-white">Quick Log</h3>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300">Did you complete this habit today?</p>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <button
          onClick={handleToggleToday}
          disabled={loading}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            isDone
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          } disabled:opacity-50`}
        >
          {loading ? 'Saving...' : isDone ? '✓ Done' : 'Mark as Done'}
        </button>
      </div>

      {isDone && (
        <div className="bg-green-900 bg-opacity-30 border border-green-700 rounded-lg p-4">
          <p className="text-green-300 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Great job! You completed this habit today.
          </p>
        </div>
      )}
    </div>
  );
}
