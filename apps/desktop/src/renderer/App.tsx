import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { SettingsPage } from './pages/SettingsPage';
import { useStore } from './store';
import { useTranslation, useTheme } from './hooks';

type Page = 'home' | 'explore' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { loadConfig, loadServers, config } = useStore();
  const { rtl, dir } = useTranslation();
  const { isDark } = useTheme();

  useEffect(() => {
    // Load config and servers on mount
    loadConfig();
    loadServers();
  }, []);

  // Apply theme and direction to document
  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [dir, isDark]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'explore':
        return <ExplorePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${isDark ? 'bg-vanilla-dark' : 'bg-gray-100'} ${rtl ? 'font-vazir' : ''}`} dir={dir}>
      {/* Title Bar */}
      <TitleBar />

      {/* Main Content */}
      <div className={`flex flex-1 overflow-hidden ${rtl ? 'flex-row-reverse' : ''}`}>
        {/* Sidebar */}
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster
        position={rtl ? 'bottom-left' : 'bottom-right'}
        toastOptions={{
          style: {
            background: isDark ? '#1a1a1a' : '#ffffff',
            color: isDark ? '#fff' : '#000',
            border: `1px solid ${isDark ? '#2a2a2a' : '#e5e5e5'}`,
          },
          success: {
            iconTheme: {
              primary: '#53FC18',
              secondary: isDark ? '#000' : '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
