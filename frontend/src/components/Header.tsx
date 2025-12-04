import ThemeToggle from './ThemeToggle';

type View = 'dashboard' | 'habits' | 'analytics' | 'focus' | 'export';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  logout: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function Header({
  currentView,
  setCurrentView,
  logout,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: HeaderProps) {
  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: '📊' },
    { id: 'habits' as View, label: 'Habits', icon: '✅' },
    { id: 'analytics' as View, label: 'Analytics', icon: '📈' },
    { id: 'focus' as View, label: 'Focus', icon: '🎯' },
    { id: 'export' as View, label: 'Export', icon: '📥' },
  ];

  return (
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

          {/* Theme Toggle & Logout */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover-lift"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              Logout
            </button>
            
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
  );
}
