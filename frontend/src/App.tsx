import Dashboard from './components/Dashboard';
import HabitList from './components/HabitList';
import HabitChart from './components/HabitChart';
import HabitLogger from './components/HabitLogger';
import ThemeToggle from './components/ThemeToggle';
import FocusMode from './components/FocusMode';
import DataExport from './components/DataExport';
import CalendarView from './components/CalendarView';
import { Habit, getHabitLogs } from './services/api';
import { useState } from 'react';

type View = 'dashboard' | 'habits' | 'analytics' | 'focus' | 'export';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [habitLogs, setHabitLogs] = useState<Array<{ date: string; value: boolean }>>([]);

  const handleSelectHabit = async (habit: Habit) => {
    setSelectedHabit(habit);
    setCurrentView('analytics');
    // Load logs for calendar view
    try {
      const logs = await getHabitLogs(habit.id);
      setHabitLogs(logs);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  const handleLogCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: '📊' },
    { id: 'habits' as View, label: 'Habits', icon: '✅' },
    { id: 'analytics' as View, label: 'Analytics', icon: '📈' },
    { id: 'focus' as View, label: 'Focus', icon: '🎯' },
    { id: 'export' as View, label: 'Export', icon: '📥' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-lg"
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src="../images/icons/logo.png" 
                alt="Logo" 
                className="h-10 w-auto"
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  style={{
                    background: currentView === item.id ? 'var(--accent-glow)' : 'transparent',
                    color: currentView === item.id ? 'var(--accent-neon)' : 'var(--text-secondary)',
                    border: currentView === item.id ? '1px solid var(--accent-neon)' : '1px solid transparent',
                  }}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Theme Toggle */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden border-t animate-slide-in-down"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
          >
            <div className="px-4 py-3 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 text-left"
                  style={{
                    background: currentView === item.id ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                    color: currentView === item.id ? 'var(--accent-neon)' : 'var(--text-secondary)',
                    border: currentView === item.id ? '1px solid var(--accent-neon)' : '1px solid transparent',
                  }}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {currentView === 'dashboard' && <Dashboard />}

        {currentView === 'habits' && (
          <div className="animate-fade-in">
            <HabitList
              onSelectHabit={handleSelectHabit}
              selectedHabitId={selectedHabit?.id || null}
            />
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="animate-fade-in">
            {selectedHabit ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold gradient-text">
                    {selectedHabit.name}
                  </h2>
                  <button
                    onClick={() => setCurrentView('habits')}
                    className="px-4 py-2 rounded-lg transition-all duration-200 hover-lift"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    ← Back to Habits
                  </button>
                </div>
                <HabitLogger habit={selectedHabit} onLogCreated={handleLogCreated} />
                <HabitChart key={refreshKey} habitId={selectedHabit.id} />
                <CalendarView 
                  habitName={selectedHabit.name}
                  logs={habitLogs}
                />
              </div>
            ) : (
              <div
                className="rounded-2xl p-12 text-center"
                style={{
                  background: 'var(--bg-card)',
                  border: '2px solid var(--border)',
                }}
              >
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  No Habit Selected
                </h3>
                <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
                  Select a habit from the Habits tab to view detailed analytics
                </p>
                <button
                  onClick={() => setCurrentView('habits')}
                  className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover-lift hover-glow"
                  style={{
                    background: 'var(--gradient-primary)',
                    color: 'var(--bg-primary)',
                  }}
                >
                  Go to Habits
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === 'focus' && <FocusMode />}

        {currentView === 'export' && <DataExport />}
      </main>

      {/* Footer */}
      <footer
        className="mt-auto border-t"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Built with 💚 • All Premium Features Free Forever
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
