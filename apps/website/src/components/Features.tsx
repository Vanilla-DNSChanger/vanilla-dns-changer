import { motion } from 'framer-motion';
import {
  Zap,
  Shield,
  Globe,
  Palette,
  Layers,
  RefreshCw,
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'One-Click Connection',
    description: 'Connect to any DNS server instantly with just one click. No complicated settings required.',
  },
  {
    icon: Globe,
    title: '3000+ DNS Servers',
    description: 'Access a huge database of public DNS servers from around the world, including Iranian servers.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Open-source and transparent. Your privacy is protected with no tracking or data collection.',
  },
  {
    icon: Palette,
    title: 'Beautiful Dark UI',
    description: 'Modern and sleek dark theme inspired by Kick.com. Easy on the eyes, day or night.',
  },
  {
    icon: Layers,
    title: 'Cross-Platform',
    description: 'Works on Windows, macOS, and Linux. Use the desktop app or the command-line interface.',
  },
  {
    icon: RefreshCw,
    title: 'Auto Updates',
    description: 'Automatic server list updates from GitHub. Always have access to the latest DNS servers.',
  },
];

export function Features() {
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
            Why Choose <span className="text-gradient">Vanilla DNS</span>?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Built with modern technologies and designed for the best user experience.
            Everything you need to manage your DNS connections.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-vanilla-dark-100 border border-vanilla-dark-300 rounded-2xl card-hover"
            >
              <div className="w-12 h-12 bg-vanilla-green/10 rounded-xl flex items-center justify-center mb-4">
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
