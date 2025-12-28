import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Moon,
  Sun,
  Monitor,
  Wifi,
  Bell,
  Play,
  Minimize2,
  RefreshCw,
  ExternalLink,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store';
import { URLS, APP_INFO } from '@vanilla-dns/shared';
import type { AppConfig, NetworkInterface } from '@vanilla-dns/shared';

export function SettingsPage() {
  const { config, setConfig } = useStore();
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  const [selectedInterface, setSelectedInterface] = useState<string>('');

  useEffect(() => {
    loadInterfaces();
  }, []);

  const loadInterfaces = async () => {
    try {
      const result = await window.electron.network.getInterfaces();
      setInterfaces(result);
      if (result.length > 0 && !selectedInterface) {
        const active = result.find((i: NetworkInterface) => i.isActive);
        setSelectedInterface(active?.name || result[0].name);
      }
    } catch (error) {
      console.error('Failed to load interfaces:', error);
    }
  };

  const handleConfigChange = async (key: keyof AppConfig, value: any) => {
    try {
      await window.electron.config.set({ [key]: value });
      setConfig({ [key]: value });
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const openExternal = (url: string) => {
    window.electron.system.openExternal(url);
  };

  const SettingItem = ({
    icon: Icon,
    title,
    description,
    children,
  }: {
    icon: any;
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between p-4 bg-vanilla-dark-100 border border-vanilla-dark-300 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-vanilla-dark-200 flex items-center justify-center">
          <Icon className="w-5 h-5 text-vanilla-green-400" />
        </div>
        <div>
          <h3 className="font-medium text-white">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );

  const Toggle = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
        checked ? 'bg-vanilla-green-400' : 'bg-vanilla-dark-300'
      }`}
    >
      <div
        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
          checked ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Customize your experience</p>
      </div>

      {/* General Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <h2 className="text-lg font-semibold text-white mb-4">General</h2>

        {/* Language */}
        <SettingItem
          icon={Globe}
          title="Language"
          description="Choose your preferred language"
        >
          <select
            value={config.language}
            onChange={(e) => handleConfigChange('language', e.target.value)}
            className="px-4 py-2 bg-vanilla-dark-200 border border-vanilla-dark-300 rounded-lg text-white focus:border-vanilla-green-400 transition-colors"
          >
            <option value="en">English</option>
            <option value="fa">فارسی</option>
          </select>
        </SettingItem>

        {/* Theme */}
        <SettingItem
          icon={config.theme === 'dark' ? Moon : config.theme === 'light' ? Sun : Monitor}
          title="Theme"
          description="Choose your preferred theme"
        >
          <select
            value={config.theme}
            onChange={(e) => handleConfigChange('theme', e.target.value)}
            className="px-4 py-2 bg-vanilla-dark-200 border border-vanilla-dark-300 rounded-lg text-white focus:border-vanilla-green-400 transition-colors"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </SettingItem>
      </motion.div>

      {/* Network Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Network</h2>

        {/* Network Interface */}
        <SettingItem
          icon={Wifi}
          title="Network Interface"
          description="Select the network interface to configure"
        >
          <select
            value={selectedInterface}
            onChange={(e) => {
              setSelectedInterface(e.target.value);
              handleConfigChange('selectedInterface', e.target.value);
            }}
            className="px-4 py-2 bg-vanilla-dark-200 border border-vanilla-dark-300 rounded-lg text-white focus:border-vanilla-green-400 transition-colors"
          >
            {interfaces.map((iface) => (
              <option key={iface.name} value={iface.name}>
                {iface.displayName} {iface.isActive ? '(Active)' : ''}
              </option>
            ))}
          </select>
        </SettingItem>

        {/* Auto Sync */}
        <SettingItem
          icon={RefreshCw}
          title="Auto Sync Servers"
          description="Automatically sync DNS servers from GitHub"
        >
          <Toggle
            checked={config.autoSyncServers}
            onChange={(checked) => handleConfigChange('autoSyncServers', checked)}
          />
        </SettingItem>
      </motion.div>

      {/* Behavior Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Behavior</h2>

        {/* Auto Start */}
        <SettingItem
          icon={Play}
          title="Start on Boot"
          description="Launch Vanilla DNS when your computer starts"
        >
          <Toggle
            checked={config.autoStart}
            onChange={(checked) => handleConfigChange('autoStart', checked)}
          />
        </SettingItem>

        {/* Start Minimized */}
        <SettingItem
          icon={Minimize2}
          title="Start Minimized"
          description="Start the app minimized to system tray"
        >
          <Toggle
            checked={config.startMinimized}
            onChange={(checked) => handleConfigChange('startMinimized', checked)}
          />
        </SettingItem>

        {/* Minimize to Tray */}
        <SettingItem
          icon={Minimize2}
          title="Minimize to Tray"
          description="Minimize to system tray instead of closing"
        >
          <Toggle
            checked={config.minimizeToTray}
            onChange={(checked) => handleConfigChange('minimizeToTray', checked)}
          />
        </SettingItem>

        {/* Notifications */}
        <SettingItem
          icon={Bell}
          title="Notifications"
          description="Show desktop notifications"
        >
          <Toggle
            checked={config.showNotifications}
            onChange={(checked) => handleConfigChange('showNotifications', checked)}
          />
        </SettingItem>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h2 className="text-lg font-semibold text-white mb-4">About</h2>

        <div className="p-6 bg-vanilla-dark-100 border border-vanilla-dark-300 rounded-xl">
          <div className="flex items-center gap-4 mb-4">
            <img src="/logo.svg" alt="Logo" className="w-12 h-12" />
            <div>
              <h3 className="text-xl font-bold text-white">{APP_INFO.name}</h3>
              <p className="text-gray-400">Version {APP_INFO.version}</p>
            </div>
          </div>

          <p className="text-gray-400 mb-4">{APP_INFO.description}</p>

          <div className="flex gap-3">
            <button
              onClick={() => openExternal(URLS.GITHUB_REPO)}
              className="flex items-center gap-2 px-4 py-2 bg-vanilla-dark-200 hover:bg-vanilla-dark-300 rounded-lg text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              GitHub
            </button>
            <button
              onClick={() => openExternal(URLS.AUTHOR_TWITTER)}
              className="flex items-center gap-2 px-4 py-2 bg-vanilla-dark-200 hover:bg-vanilla-dark-300 rounded-lg text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              @sudolite
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
