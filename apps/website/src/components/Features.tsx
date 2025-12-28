import { motion } from 'framer-motion';
import {
  Zap,
  Shield,
  Globe,
  Palette,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { useI18n } from '../i18n';

const featureIcons = [Zap, Globe, Shield, Palette, Layers, RefreshCw];
const featureKeys = ['oneClick', 'servers', 'secure', 'darkUi', 'crossPlatform', 'autoUpdates'];

export function Features() {
  const { t, isRTL } = useI18n();

  const features = featureKeys.map((key, index) => ({
    icon: featureIcons[index],
    title: t(`features.${key}.title`),
    description: t(`features.${key}.description`),
  }));
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-grid opacity-30" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            {t('features.title')} <span className="text-gradient">{t('features.titleHighlight')}</span>?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 bg-vanilla-dark-100 border border-vanilla-dark-300 rounded-2xl card-hover ${isRTL ? 'text-right' : ''}`}
            >
              <div className={`w-12 h-12 bg-vanilla-green/10 rounded-xl flex items-center justify-center mb-4 ${isRTL ? 'mr-0 ml-auto' : ''}`}>
                <feature.icon className="w-6 h-6 text-vanilla-green" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
