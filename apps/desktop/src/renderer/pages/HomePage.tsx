import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Power, RefreshCw, Wifi, WifiOff, Zap, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store';
import { ServerCard } from '../components/ServerCard';
import { AddServerModal } from '../components/AddServerModal';
import { useTranslation } from '../hooks';
import type { DnsServer, CustomDnsServer } from '@vanilla-dns/shared';

export function HomePage() {
  const {
    status,
    isConnecting,
    selectedServer,
    servers,
    customServers,
    pinnedServerKeys,
    loadStatus,
    connect,
    disconnect,
    flushDns,
    addCustomServer,
    removeCustomServer,
    pinServer,
    unpinServer,
    setSelectedServer,
  } = useStore();

  const { t, rtl } = useTranslation();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Get Vanilla DNS server (recommended)
  const vanillaServer = servers.find(s => s.key === 'vanilla');

  // Get pinned servers
  const pinnedServers = [...servers, ...customServers].filter((s) =>
    pinnedServerKeys.includes(s.key)
  );

  // Get recent/popular servers (top 4, excluding vanilla which is shown separately)
  const quickServers = servers
    .filter((s) => s.tags.includes('popular') && s.key !== 'vanilla')
    .slice(0, 3);

  const handleConnect = async () => {
    if (!selectedServer) {
      toast.error(t.home.selectServer);
      return;
    }

    const success = await connect(selectedServer);
    if (success) {
      toast.success(`${t.status.connected} - ${selectedServer.name}`);
    } else {
      toast.error(t.errors.connectionFailed);
    }
  };

  const handleDisconnect = async () => {
    const success = await disconnect();
    if (success) {
      toast.success(t.status.disconnected);
    } else {
      toast.error(t.errors.disconnectionFailed);
    }
  };

  const handleFlush = async () => {
    const success = await flushDns();
    if (success) {
      toast.success(t.status.flushed);
    } else {
      toast.error(t.errors.flushFailed);
    }
  };

  const handleServerSelect = (server: DnsServer) => {
    setSelectedServer(server);
  };

  const handleAddCustomServer = async (server: CustomDnsServer) => {
    await addCustomServer(server);
    toast.success(t.servers.add);
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-vanilla-dark-100 border border-vanilla-dark-300 rounded-2xl p-6"
      >
        <div className={`flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
          {/* Status */}
          <div className={`flex items-center gap-4 ${rtl ? 'flex-row-reverse' : ''}`}>
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                status.isConnected
                  ? 'bg-vanilla-green-400/20 text-vanilla-green-400'
                  : 'bg-gray-500/20 text-gray-500'
              }`}
            >
              {status.isConnected ? (
                <Wifi className="w-8 h-8" />
              ) : (
                <WifiOff className="w-8 h-8" />
              )}
            </div>
            <div className={rtl ? 'text-right' : ''}>
              <h2 className="text-xl font-semibold text-white">
                {status.isConnected ? t.home.connected : t.home.disconnected}
              </h2>
              <p className="text-gray-400">
                {status.isConnected && status.activeDns.length > 0
                  ? `${t.home.currentDns}: ${status.activeDns.join(', ')}`
                  : t.home.noDns}
              </p>
              {status.serverName && (
                <p className="text-sm text-vanilla-green-400">{status.serverName}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className={`flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
            {/* Flush Button */}
            <button
              onClick={handleFlush}
              className="p-3 bg-vanilla-dark-200 hover:bg-vanilla-dark-300 rounded-xl transition-colors"
              title={t.settings.flushDns}
            >
              <RefreshCw className="w-5 h-5 text-gray-400" />
            </button>

            {/* Connect/Disconnect Button */}
            <button
              onClick={status.isConnected ? handleDisconnect : handleConnect}
              disabled={isConnecting || (!status.isConnected && !selectedServer)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${rtl ? 'flex-row-reverse' : ''} ${
                status.isConnected
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-vanilla-green-400 hover:bg-vanilla-green-hover text-black disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  {t.status.connecting}
                </>
              ) : status.isConnected ? (
                <>
                  <Power className="w-5 h-5" />
                  {t.home.disconnect}
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  {t.home.connect}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Recommended Server - Vanilla DNS */}
      {vanillaServer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={`flex items-center gap-2 mb-3 ${rtl ? 'flex-row-reverse' : ''}`}>
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <h3 className="text-lg font-semibold text-white">{t.home.recommendedServer}</h3>
          </div>
          <div
            onClick={() => handleServerSelect(vanillaServer)}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
              selectedServer?.key === vanillaServer.key
                ? 'border-vanilla-green-400 bg-vanilla-green-400/10'
                : 'border-vanilla-dark-300 bg-vanilla-dark-100 hover:border-vanilla-green-400/50'
            }`}
          >
            <div className={`flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-4 ${rtl ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 rounded-xl bg-vanilla-green-400/20 flex items-center justify-center">
                  <span className="text-vanilla-green-400 text-xl font-bold">V</span>
                </div>
                <div className={rtl ? 'text-right' : ''}>
                  <div className={`flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                    <p className="font-semibold text-white">{vanillaServer.name}</p>
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs rounded-full">
                      {t.home.recommendedServer}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{vanillaServer.description}</p>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    {vanillaServer.servers.join(' / ')}
                  </p>
                </div>
              </div>
              {selectedServer?.key === vanillaServer.key && (
                <div className="w-3 h-3 bg-vanilla-green-400 rounded-full" />
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Selected Server */}
      {selectedServer && selectedServer.key !== 'vanilla' && !status.isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-vanilla-green-400/10 border border-vanilla-green-400/30 rounded-xl p-4"
        >
          <p className={`text-sm text-vanilla-green-400 mb-2 ${rtl ? 'text-right' : ''}`}>
            {t.home.selectServer}:
          </p>
          <div className={`flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-vanilla-green-400/20 flex items-center justify-center text-vanilla-green-400 font-bold">
              {selectedServer.name.charAt(0)}
            </div>
            <div className={rtl ? 'text-right' : ''}>
              <p className="font-medium text-white">{selectedServer.name}</p>
              <p className="text-xs text-gray-400 font-mono">
                {selectedServer.servers.filter(Boolean).join(' / ')}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Connect */}
      <div>
        <div className={`flex items-center justify-between mb-4 ${rtl ? 'flex-row-reverse' : ''}`}>
          <h3 className="text-lg font-semibold text-white">{t.home.quickConnect}</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-sm text-vanilla-green-400 hover:underline"
          >
            + {t.servers.addCustom}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {quickServers.map((server) => (
            <ServerCard
              key={server.key}
              server={server}
              isSelected={selectedServer?.key === server.key}
              isPinned={pinnedServerKeys.includes(server.key)}
              onSelect={handleServerSelect}
              onPin={pinServer}
              onUnpin={unpinServer}
            />
          ))}
        </div>
      </div>

      {/* Pinned Servers */}
      {pinnedServers.length > 0 && (
        <div>
          <h3 className={`text-lg font-semibold text-white mb-4 ${rtl ? 'text-right' : ''}`}>
            {t.servers.pinned}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {pinnedServers.map((server) => (
              <ServerCard
                key={server.key}
                server={server}
                isSelected={selectedServer?.key === server.key}
                isPinned={true}
                onSelect={handleServerSelect}
                onPin={pinServer}
                onUnpin={unpinServer}
                onDelete={server.isCustom ? removeCustomServer : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom Servers */}
      {customServers.length > 0 && (
        <div>
          <h3 className={`text-lg font-semibold text-white mb-4 ${rtl ? 'text-right' : ''}`}>
            {t.servers.custom}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {customServers.map((server) => (
              <ServerCard
                key={server.key}
                server={server}
                isSelected={selectedServer?.key === server.key}
                isPinned={pinnedServerKeys.includes(server.key)}
                onSelect={handleServerSelect}
                onPin={pinServer}
                onUnpin={unpinServer}
                onDelete={removeCustomServer}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add Server Modal */}
      <AddServerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCustomServer}
      />
    </div>
  );
}
