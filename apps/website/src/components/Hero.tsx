import { motion } from 'framer-motion';
import { ArrowDown, Zap, Shield, Globe } from 'lucide-react';
import { useI18n } from '../i18n';

export function Hero() {
  const { t, isRTL } = useI18n();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute inset-0 bg-radial" />
      
      {/* Animated circles */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-vanilla-green/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-vanilla-green/10 rounded-full blur-3xl"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`inline-flex items-center gap-2 px-4 py-2 bg-vanilla-green/10 border border-vanilla-green/30 rounded-full mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <span className="w-2 h-2 bg-vanilla-green rounded-full animate-pulse" />
          <span className="text-vanilla-green text-sm font-medium">{t('hero.badge')}</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl font-bold mb-6"
        >
          <span className="text-white">{t('hero.title')}</span>
          <br />
          <span className="text-gradient">{t('hero.titleHighlight')}</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-400 max-w-2xl mx-auto mb-12"
        >
          {t('hero.description')}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 ${isRTL ? 'sm:flex-row-reverse' : ''}`}
        >
          <a
            href="#download"
            className={`px-8 py-4 bg-vanilla-green text-black font-semibold rounded-xl btn-glow flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Zap className="w-5 h-5" />
            {t('hero.downloadNow')}
          </a>
          <a
            href="https://github.com/Vanilla-DNSChanger/vanilla-dns-changer"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-vanilla-dark-200 border border-vanilla-dark-300 text-white font-semibold rounded-xl hover:bg-vanilla-dark-300 transition-colors"
          >
            {t('hero.viewOnGithub')}
          </a>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`flex flex-wrap items-center justify-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <div className={`flex items-center gap-2 px-4 py-2 bg-vanilla-dark-100 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Shield className="w-4 h-4 text-vanilla-green" />
            <span className="text-sm text-gray-300">{t('hero.securePrivate')}</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 bg-vanilla-dark-100 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Globe className="w-4 h-4 text-vanilla-green" />
            <span className="text-sm text-gray-300">{t('hero.dnsServers')}</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 bg-vanilla-dark-100 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Zap className="w-4 h-4 text-vanilla-green" />
            <span className="text-sm text-gray-300">{t('hero.lightningFast')}</span>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-500"
          >
            <ArrowDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
