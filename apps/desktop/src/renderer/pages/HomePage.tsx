import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Power, RefreshCw, Wifi, WifiOff, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store';
import { ServerCard } from '../components/ServerCard';
import { AddServerModal } from '../components/AddServerModal';
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

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Get pinned servers
  const pinnedServers = [...servers, ...customServers].filter((s) =>
    pinnedServerKeys.includes(s.key)
  );

  // Get recent/popular servers (top 4)
  const quickServers = servers
    .filter((s) => s.tags.includes('popular'))
    .slice(0, 4);

  const handleConnect = async () => {
    if (!selectedServer) {
      toast.error('Please select a server first');
      return;
    }

    const success = await connect(selectedServer);
    if (success) {
      toast.success(`Connected to ${selectedServer.name}`);
    } else {
      toast.error('Failed to connect');
    }
  };

  const handleDisconnect = async () => {
    const success = await disconnect();
    if (success) {
      toast.success('Disconnected');
    } else {
      toast.error('Failed to disconnect');
    }
  };

  const handleFlush = async () => {
    const success = await flushDns();
    if (success) {
      toast.success('DNS cache flushed');
    } else {
      toast.error('Failed to flush DNS cache');
    }
  };

  const handleServerSelect = (server: DnsServer) => {
    setSelectedServer(server);
  };

  const handleAddCustomServer = async (server: CustomDnsServer) => {
    await addCustomServer(server);
    toast.success('Custom server added');
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-vanilla-dark-100 border border-vanilla-dark-300 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          {/* Status */}
          <div className="flex items-center gap-4">
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
            <div>
              <h2 className="text-xl font-semibold text-white">
                {status.isConnected ? 'Connected' : 'Disconnected'}
              </h2>
              <p className="text-gray-400">
                {status.isConnected && status.activeDns.length > 0
                  ? `DNS: ${status.activeDns.join(', ')}`
                  : 'Not using custom DNS'}
              </p>
              {status.serverName && (
                <p className="text-sm text-vanilla-green-400">{status.serverName}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Flush Button */}
            <button
              onClick={handleFlush}
              className="p-3 bg-vanilla-dark-200 hover:bg-vanilla-dark-300 rounded-xl transition-colors"
              title="Flush DNS Cache"
            >
              <RefreshCw className="w-5 h-5 text-gray-400" />
            </button>

            {/* Connect/Disconnect Button */}
            <button
              onClick={status.isConnected ? handleDisconnect : handleConnect}
              disabled={isConnecting || (!status.isConnected && !selectedServer)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                status.isConnected
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-vanilla-green-400 hover:bg-vanilla-green-hover text-black disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : status.isConnected ? (
                <>
                  <Power className="w-5 h-5" />
                  Disconnect
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Connect
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Selected Server */}
      {selectedServer && !status.isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-vanilla-green-400/10 border border-vanilla-green-400/30 rounded-xl p-4"
        >
          <p className="text-sm text-vanilla-green-400 mb-2">Selected Server:</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-vanilla-green-400/20 flex items-center justify-center text-vanilla-green-400 font-bold">
              {selectedServer.name.charAt(0)}
            </div>
            <div>
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Quick Connect</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-sm text-vanilla-green-400 hover:underline"
          >
            + Add Custom
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
          <h3 className="text-lg font-semibold text-white mb-4">Pinned Servers</h3>
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
          <h3 className="text-lg font-semibold text-white mb-4">Custom Servers</h3>
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
