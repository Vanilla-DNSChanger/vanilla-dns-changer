import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface Contributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

const CONTRIBUTORS_API = 'https://api.github.com/repos/Vanilla-DNSChanger/vanilla-dns-changer/contributors';

export function Contributors() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContributors() {
      try {
        const response = await axios.get<Contributor[]>(CONTRIBUTORS_API);
        setContributors(response.data);
      } catch (error) {
        // Fallback to showing the main author
        setContributors([
          {
            id: 1,
            login: 'sudolite',
            avatar_url: 'https://github.com/sudolite.png',
            html_url: 'https://github.com/sudolite',
            contributions: 0,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchContributors();
  }, []);

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-radial opacity-30" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Meet Our <span className="text-gradient">Contributors</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Vanilla DNS is built by passionate developers. Want to contribute? Check out our GitHub!
          </p>
        </motion.div>

        {/* Contributors Grid */}
        {loading ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-vanilla-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-6"
          >
            {contributors.map((contributor, index) => (
              <motion.a
                key={contributor.id}
                href={contributor.html_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center gap-2 p-4 bg-vanilla-dark-100 border border-vanilla-dark-300 rounded-2xl hover:border-vanilla-green/50 transition-colors"
              >
                <img
                  src={contributor.avatar_url}
                  alt={contributor.login}
                  className="w-16 h-16 rounded-full ring-2 ring-vanilla-dark-300"
                />
                <span className="text-white font-medium">@{contributor.login}</span>
                {contributor.contributions > 0 && (
                  <span className="text-xs text-gray-500">
                    {contributor.contributions} commits
                  </span>
                )}
              </motion.a>
            ))}
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <a
            href="https://github.com/Vanilla-DNSChanger/vanilla-dns-changer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-vanilla-dark-200 border border-vanilla-dark-300 rounded-xl hover:bg-vanilla-dark-300 transition-colors"
          >
            <span>Become a Contributor</span>
            <span className="text-vanilla-green">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
