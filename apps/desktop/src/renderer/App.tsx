import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { SettingsPage } from './pages/SettingsPage';
import { UpdateModal } from './components/UpdateModal';
import { useStore } from './store';
import { useTranslation, useTheme } from './hooks';

type Page = 'home' | 'explore' | 'settings';

interface UpdateInfo {
  version: string;
  changelog: string;
  downloadUrl: string;
}

const CURRENT_VERSION = '1.0.0';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { loadConfig, loadServers, config } = useStore();
  const { rtl, dir } = useTranslation();
  const { isDark } = useTheme();

  useEffect(() => {
    // Load config and servers on mount
    loadConfig();
    loadServers();
    
    // Check for updates
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      const response = await fetch('https://api.github.com/repos/Vanilla-DNSChanger/vanilla-dns-changer/releases/latest', {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      if (!response.ok) return;
      
      const release = await response.json();
      const latestVersion = release.tag_name.replace(/^v/, '');
      
      // Compare versions
      if (compareVersions(latestVersion, CURRENT_VERSION) > 0) {
        const platform = navigator.platform.toLowerCase();
        let downloadUrl = release.html_url;
        
        // Find appropriate asset for current platform
        for (const asset of release.assets) {
          if (platform.includes('win') && asset.name.includes('Setup') && asset.name.endsWith('.exe')) {
            downloadUrl = asset.browser_download_url;
            break;
          } else if (platform.includes('mac') && asset.name.endsWith('.dmg')) {
            downloadUrl = asset.browser_download_url;
            break;
          } else if (platform.includes('linux') && asset.name.endsWith('.AppImage')) {
            downloadUrl = asset.browser_download_url;
            break;
          }
        }
        
        setUpdateInfo({
          version: latestVersion,
          changelog: release.body || 'No changelog available',
          downloadUrl,
        });
        setShowUpdateModal(true);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  const compareVersions = (v1: string, v2: string): number => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  };

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

      {/* Update Modal */}
      {updateInfo && (
        <UpdateModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          version={updateInfo.version}
          changelog={updateInfo.changelog}
          downloadUrl={updateInfo.downloadUrl}
          currentVersion={CURRENT_VERSION}
        />
      )}
    </div>
  );
}

export default App;
