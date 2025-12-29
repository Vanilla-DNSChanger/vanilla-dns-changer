import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Sparkles, ExternalLink } from 'lucide-react';
import { useTranslation } from '../hooks';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: string;
  changelog: string;
  downloadUrl: string;
  currentVersion: string;
}

export function UpdateModal({ 
  isOpen, 
  onClose, 
  version, 
  changelog, 
  downloadUrl,
  currentVersion 
}: UpdateModalProps) {
  const { t, rtl } = useTranslation();

  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };

  const handleViewOnGitHub = () => {
    window.open('https://github.com/Vanilla-DNSChanger/vanilla-dns-changer/releases/latest', '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`bg-vanilla-dark-100 border border-vanilla-dark-300 rounded-2xl max-w-lg w-full overflow-hidden ${rtl ? 'text-right' : 'text-left'}`}
            dir={rtl ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-vanilla-green/20 to-transparent p-6 border-b border-vanilla-dark-300">
              <div className={`flex items-start justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
                  <div className="w-12 h-12 bg-vanilla-green/20 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-vanilla-green" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {t.update.newVersion}
                    </h2>
                    <p className="text-vanilla-green font-mono">
                      v{currentVersion} → v{version}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-vanilla-dark-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Changelog */}
            <div className="p-6 max-h-64 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                {t.update.changelog}
              </h3>
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-300 bg-vanilla-dark-200 rounded-lg p-4 overflow-x-auto">
                  {changelog}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className={`p-6 bg-vanilla-dark-200/50 border-t border-vanilla-dark-300 flex gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={handleDownload}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-vanilla-green text-black font-semibold rounded-xl hover:bg-vanilla-green/90 transition-colors ${rtl ? 'flex-row-reverse' : ''}`}
              >
                <Download className="w-5 h-5" />
                {t.update.download}
              </button>
              <button
                onClick={handleViewOnGitHub}
                className={`flex items-center justify-center gap-2 px-4 py-3 bg-vanilla-dark-300 text-white rounded-xl hover:bg-vanilla-dark-400 transition-colors ${rtl ? 'flex-row-reverse' : ''}`}
              >
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>

            {/* Warning */}
            <div className={`px-6 pb-6 ${rtl ? 'text-right' : 'text-left'}`}>
              <p className="text-xs text-yellow-500/80">
                ⚠️ {t.update.warning}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
