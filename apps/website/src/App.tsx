import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Downloads } from './components/Downloads';
import { Screenshots } from './components/Screenshots';
import { Contributors } from './components/Contributors';
import { Footer } from './components/Footer';
import { I18nProvider, useI18n } from './i18n';

function AppContent() {
  const { isRTL } = useI18n();
  
  return (
    <div className={`min-h-screen bg-vanilla-dark ${isRTL ? 'font-vazir' : ''}`}>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Downloads />
        <Screenshots />
        <Contributors />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

export default App;
