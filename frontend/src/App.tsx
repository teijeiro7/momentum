import Dashboard from './components/Dashboard';
import HabitList from './components/HabitList';
import HabitChart from './components/HabitChart';
import HabitLogger from './components/HabitLogger';
import FocusMode from './components/FocusMode';
import DataExport from './components/DataExport';
import CalendarView from './components/CalendarView';
import Login from './components/Login';
import Register from './components/Register';
import Header from './components/Header';
import Footer from './components/Footer';
import { Habit, getHabitLogs } from './services/api';
import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

type View = 'dashboard' | 'habits' | 'analytics' | 'focus' | 'export';
type AuthView = 'login' | 'register';

function AppContent() {
  const { isAuthenticated, loading, logout} = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [authView, setAuthView] = useState<AuthView>('login');
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

  // Show loading state
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mx-auto mb-4" 
            style={{ borderColor: 'var(--accent-neon)' }}
          />
          <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    if (authView === 'login') {
      return <Login onSwitchToRegister={() => setAuthView('register')} />;
    } else {
      return <Register onSwitchToLogin={() => setAuthView('login')} />;
    }
  }

  // Main app (authenticated)
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        logout={logout}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

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

      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
