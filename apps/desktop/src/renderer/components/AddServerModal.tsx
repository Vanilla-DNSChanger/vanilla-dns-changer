import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { isValidDnsAddress } from '@vanilla-dns/shared';
import type { CustomDnsServer } from '@vanilla-dns/shared';
import { useTranslation } from '../hooks';

interface AddServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (server: CustomDnsServer) => void;
}

export function AddServerModal({ isOpen, onClose, onAdd }: AddServerModalProps) {
  const [name, setName] = useState('');
  const [primary, setPrimary] = useState('');
  const [secondary, setSecondary] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const { rtl, t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    if (!name.trim()) {
      newErrors.push('Server name is required');
    }

    if (!primary.trim()) {
      newErrors.push('Primary DNS is required');
    } else if (!isValidDnsAddress(primary)) {
      newErrors.push('Invalid primary DNS address');
    }

    if (secondary && !isValidDnsAddress(secondary)) {
      newErrors.push('Invalid secondary DNS address');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const server: CustomDnsServer = {
      key: `custom-${uuidv4()}`,
      name: name.trim(),
      servers: secondary ? [primary.trim(), secondary.trim()] : [primary.trim()],
      rating: 0,
      tags: ['custom'],
      isCustom: true,
      createdAt: Date.now(),
    };

    onAdd(server);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setPrimary('');
    setSecondary('');
    setErrors([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-vanilla-dark-100 border border-vanilla-dark-300 rounded-2xl w-full max-w-md p-6 shadow-2xl" dir={rtl ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">{t.servers.addCustom || 'Add Custom DNS'}</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-vanilla-dark-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            {errors.map((error, i) => (
              <p key={i} className="text-sm text-red-400">
                {error}
              </p>
            ))}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {t.servers.serverName || 'Server Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Custom DNS"
                className="w-full px-4 py-2 bg-vanilla-dark-200 border border-vanilla-dark-300 rounded-lg text-white placeholder-gray-500 focus:border-vanilla-green-400 transition-colors"
              />
            </div>

            {/* Primary DNS */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {t.servers.primaryDns || 'Primary DNS'}
              </label>
              <input
                type="text"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                placeholder="8.8.8.8"
                className="w-full px-4 py-2 bg-vanilla-dark-200 border border-vanilla-dark-300 rounded-lg text-white placeholder-gray-500 focus:border-vanilla-green-400 transition-colors font-mono"
                dir="ltr"
              />
            </div>

            {/* Secondary DNS */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {t.servers.secondaryDns || 'Secondary DNS'}
              </label>
              <input
                type="text"
                value={secondary}
                onChange={(e) => setSecondary(e.target.value)}
                placeholder="8.8.4.4"
                className="w-full px-4 py-2 bg-vanilla-dark-200 border border-vanilla-dark-300 rounded-lg text-white placeholder-gray-500 focus:border-vanilla-green-400 transition-colors font-mono"
                dir="ltr"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-vanilla-dark-200 text-white rounded-lg hover:bg-vanilla-dark-300 transition-colors"
            >
              {t.servers.cancel || 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-vanilla-green-400 text-black font-medium rounded-lg hover:bg-vanilla-green-hover transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t.servers.add || 'Add Server'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
