import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Signal } from 'lucide-react';
import { useStore } from '../store';
import { ServerCard } from '../components/ServerCard';
import { useTranslation } from '../hooks';
import { DNS_CATEGORIES } from '@vanilla-dns/shared';
import type { DnsServer } from '@vanilla-dns/shared';

export function ExplorePage() {
  const {
    servers,
    customServers,
    pinnedServerKeys,
    selectedServer,
    setSelectedServer,
    pinServer,
    unpinServer,
    removeCustomServer,
    config,
  } = useStore();

  const { t, rtl } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'ping' | 'rating' | 'name'>('recommended');

  const { serverLatencies, pingAllServers, isPingingAll } = useStore();

  // Filter servers - put Vanilla DNS first
  const filteredServers = useMemo(() => {
    let result = [...servers, ...customServers];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (server) =>
          server.name.toLowerCase().includes(query) ||
          server.servers.some((s) => s?.includes(query)) ||
          server.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((server) => server.tags.includes(selectedCategory));
    }

    // Sort servers Vanilla DNS first
    result.sort((a, b) => {
      if (a.key === 'vanilla') return -1;
      if (b.key === 'vanilla') return 1;

      if (sortBy === 'recommended') {
        return (b.rating || 0) - (a.rating || 0);
      }

      if (sortBy === 'ping') {
        const latencyA = serverLatencies[a.key] ?? 9999;
        const latencyB = serverLatencies[b.key] ?? 9999;
        // Handle error pings (-1)
        const effectiveA = latencyA < 0 ? 10000 : latencyA;
        const effectiveB = latencyB < 0 ? 10000 : latencyB;
        return effectiveA - effectiveB;
      }

      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }

      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }

      return 0;
    });

    return result;
  }, [servers, customServers, searchQuery, selectedCategory, sortBy, serverLatencies]);

  const handleServerSelect = (server: DnsServer) => {
    setSelectedServer(server);
  };

  // Get category name based on language
  const getCategoryName = (category: typeof DNS_CATEGORIES[0]) => {
    return config.language === 'fa' ? category.nameFA : category.name;
  };

  return (
    <div className="space-y-6" dir={rtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t.servers.title}</h1>
        <p className="text-gray-400 mt-1">
          {servers.length}+ {t.servers.all}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className={`absolute ${rtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.servers.search}
            className={`w-full ${rtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-vanilla-dark-100 border border-vanilla-dark-300 rounded-xl text-white placeholder-gray-500 focus:border-vanilla-green-400 transition-colors`}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {DNS_CATEGORIES.map((category) => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedCategory === category.key
                ? 'bg-vanilla-green-400 text-black'
                : 'bg-vanilla-dark-100 text-gray-400 hover:bg-vanilla-dark-200 hover:text-white'
            }`}
          >
            <span>{category.icon}</span>
            <span>{getCategoryName(category)}</span>
          </button>
        ))}
      </div>

      {/* Results Count and Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {filteredServers.length} {t.servers.all}
        </p>

        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-vanilla-dark-100 border border-vanilla-dark-300 text-gray-400 text-sm rounded-lg focus:ring-vanilla-green-400 focus:border-vanilla-green-400 block px-3 py-1.5 transition-colors outline-none cursor-pointer hover:text-white"
          >
            <option value="recommended">{t.home.recommendedServer}</option>
            <option value="ping">Ping (Low to High)</option>
            <option value="rating">Rating (High to Low)</option>
            <option value="name">Name (A-Z)</option>
          </select>

          {/* Ping All Button */}
          <button
            onClick={() => pingAllServers(filteredServers)}
            disabled={isPingingAll || filteredServers.length === 0}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isPingingAll
                ? 'bg-vanilla-dark-200 text-gray-500 cursor-not-allowed'
                : 'bg-vanilla-dark-100 text-gray-400 hover:bg-vanilla-dark-200 hover:text-white'
            }`}
          >
            <Signal className={`w-4 h-4 ${isPingingAll ? 'animate-pulse text-vanilla-green-400' : ''}`} />
            {isPingingAll ? 'Pinging...' : 'Ping All'}
          </button>
        </div>
      </div>

      {/* Servers Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 gap-4"
      >
        {filteredServers.map((server, index) => (
          <motion.div
            key={server.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative"
          >
            {server.key === 'vanilla' && (
              <div className={`absolute -top-2 ${rtl ? 'left-2' : 'right-2'} z-10 flex items-center gap-1 px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded-full`} dir="ltr">
                <Star className="w-3 h-3" />
                {t.home.recommendedServer}
              </div>
            )}
            <ServerCard
              server={server}
              isSelected={selectedServer?.key === server.key}
              isPinned={pinnedServerKeys.includes(server.key)}
              onSelect={handleServerSelect}
              onPin={pinServer}
              onUnpin={unpinServer}
              onDelete={server.isCustom ? removeCustomServer : undefined}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredServers.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">{t.servers.noServers}</h3>
          <p className="text-gray-400">{t.servers.search}</p>
        </div>
      )}
    </div>
  );
}
