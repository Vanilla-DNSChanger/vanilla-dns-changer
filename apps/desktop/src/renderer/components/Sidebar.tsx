import { Home, Compass, Settings, Github } from 'lucide-react';
import { URLS } from '@vanilla-dns/shared';
import { useTranslation } from '../hooks';

type Page = 'home' | 'explore' | 'settings';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { t, rtl } = useTranslation();
  
  const navItems = [
    { id: 'home' as const, icon: Home, label: t.nav.home },
    { id: 'explore' as const, icon: Compass, label: t.nav.servers },
    { id: 'settings' as const, icon: Settings, label: t.nav.settings },
  ];

  const openGitHub = () => {
    window.electron.system.openExternal(URLS.GITHUB_REPO);
  };

  return (
    <div className={`w-16 bg-vanilla-dark-100 flex flex-col items-center py-4 ${rtl ? 'border-l border-vanilla-dark-300 order-1' : 'border-r border-vanilla-dark-300 order-none'}`}>
      {/* Navigation Items */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200
              ${
                currentPage === item.id
                  ? 'bg-vanilla-green-400 text-black'
                  : 'text-gray-400 hover:bg-vanilla-dark-200 hover:text-white'
              }`}
            title={item.label}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* GitHub Link */}
      <button
        onClick={openGitHub}
        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-vanilla-dark-200 rounded-lg transition-colors"
        title="GitHub"
      >
        <Github className="w-5 h-5" />
      </button>
    </div>
  );
}
