import { useState } from 'react';
import { Pin, PinOff, Signal, Star, Trash2 } from 'lucide-react';
import type { DnsServer } from '@vanilla-dns/shared';
import { useStore } from '../store';
import { useTranslation } from '../hooks';

interface ServerCardProps {
  server: DnsServer;
  isSelected?: boolean;
  isPinned?: boolean;
  onSelect: (server: DnsServer) => void;
  onPin?: (key: string) => void;
  onUnpin?: (key: string) => void;
  onDelete?: (key: string) => void;
}

export function ServerCard({
  server,
  isSelected = false,
  isPinned = false,
  onSelect,
  onPin,
  onUnpin,
  onDelete,
}: ServerCardProps) {
  const [latency, setLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const { pingServer } = useStore();
  const { rtl } = useTranslation();

  const handlePing = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPinging(true);
    const result = await pingServer(server.servers[0]);
    setLatency(result);
    setIsPinging(false);
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPinned) {
      onUnpin?.(server.key);
    } else {
      onPin?.(server.key);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(server.key);
  };

  const getLatencyColor = () => {
    if (latency === null) return 'text-gray-500';
    if (latency < 0) return 'text-red-500';
    if (latency < 100) return 'text-vanilla-green-400';
    if (latency < 200) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div
      onClick={() => onSelect(server)}
      className={`server-card ${isSelected ? 'selected' : ''} card-hover`}
      dir={rtl ? 'rtl' : 'ltr'}
    >
      <div className="flex items-start justify-between">
        {/* Server Info */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-lg bg-vanilla-dark-200 flex items-center justify-center text-lg flex-shrink-0">
            <span>{server.name.charAt(0).toUpperCase()}</span>
          </div>

          {/* Name and Servers */}
          <div>
            <h3 className="font-medium text-white flex items-center gap-2 flex-wrap">
              {server.name}
              {server.country && (
                <span className="text-xs text-gray-500">{server.country}</span>
              )}
            </h3>
            <p className="text-xs text-gray-500 font-mono" dir="ltr">
              {server.servers.filter(Boolean).join(' / ')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0" dir="ltr">
          {/* Latency */}
          <button
            onClick={handlePing}
            disabled={isPinging}
            className={`p-2 rounded-lg hover:bg-vanilla-dark-200 transition-colors ${getLatencyColor()}`}
            title="Ping server"
          >
            {isPinging ? (
              <Signal className="w-4 h-4 animate-pulse" />
            ) : latency !== null ? (
              <span className="text-xs font-mono">
                {latency < 0 ? 'ERR' : `${latency}ms`}
              </span>
            ) : (
              <Signal className="w-4 h-4" />
            )}
          </button>

          {/* Pin/Unpin */}
          <button
            onClick={handlePin}
            className={`p-2 rounded-lg hover:bg-vanilla-dark-200 transition-colors ${
              isPinned ? 'text-vanilla-green-400' : 'text-gray-500'
            }`}
            title={isPinned ? 'Unpin' : 'Pin'}
          >
            {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
          </button>

          {/* Delete (only for custom servers) */}
          {server.isCustom && onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tags */}
      {server.tags && server.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {server.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-full bg-vanilla-dark-200 text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Rating */}
      {server.rating > 0 && (
        <div className="flex items-center gap-1 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < server.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
