import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Downloads } from './components/Downloads';
import { Screenshots } from './components/Screenshots';
import { Contributors } from './components/Contributors';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-vanilla-dark">
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

export default App;
