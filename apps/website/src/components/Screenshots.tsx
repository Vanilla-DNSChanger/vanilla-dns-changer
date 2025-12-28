import { motion } from 'framer-motion';

// Placeholder screenshots - these would be actual app screenshots
const screenshots = [
  {
    id: 1,
    title: 'Home Screen',
    description: 'Quick connect to your favorite DNS servers',
  },
  {
    id: 2,
    title: 'Explore Servers',
    description: 'Browse 3000+ DNS servers by category',
  },
  {
    id: 3,
    title: 'Settings',
    description: 'Customize your experience',
  },
];

export function Screenshots() {
  return (
    <section id="screenshots" className="py-24 relative overflow-hidden">
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
            Beautiful <span className="text-gradient">Dark Theme</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Designed with a modern Kick-style dark theme. Easy on the eyes and packed with features.
          </p>
        </motion.div>

        {/* Screenshots Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {screenshots.map((screenshot, index) => (
            <motion.div
              key={screenshot.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              {/* Screenshot Placeholder */}
              <div className="aspect-[4/3] bg-vanilla-dark-100 border border-vanilla-dark-300 rounded-2xl overflow-hidden mb-4 relative">
                {/* Simulated App UI */}
                <div className="absolute inset-0 p-4">
                  {/* Title bar */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  
                  {/* Content placeholder */}
                  <div className="space-y-3">
                    <div className="h-8 bg-vanilla-dark-200 rounded-lg w-3/4" />
                    <div className="h-20 bg-vanilla-dark-200 rounded-lg" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-16 bg-vanilla-dark-200 rounded-lg" />
                      <div className="h-16 bg-vanilla-dark-200 rounded-lg" />
                    </div>
                    <div className="h-10 bg-vanilla-green/20 rounded-lg flex items-center justify-center">
                      <div className="w-1/2 h-4 bg-vanilla-green rounded" />
                    </div>
                  </div>
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-vanilla-green/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <h3 className="text-lg font-semibold text-white">{screenshot.title}</h3>
              <p className="text-sm text-gray-400">{screenshot.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
