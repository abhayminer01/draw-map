import { ArrowLeft, MapIcon, Info, User, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-[#0f0f13] text-gray-100 font-sans">
      <header className="h-16 border-b border-white/10 bg-surface/80 backdrop-blur-md flex items-center px-6 sticky top-0 z-20">
        <Link to="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all flex items-center gap-2">
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
            <Info size={32} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">About Draw Map</h1>
        </div>

        <div className="space-y-8">
          <section className="glass-card p-8 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="flex-shrink-0">
                <img src="/images/Abhay%20Vijayan.png" alt="Abhay Vijayan" className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-primary/20 shadow-xl" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  Abhay Vijayan
                </h2>
                <p className="text-primary font-medium mb-4">Creator & Developer</p>
                <p className="text-gray-300 leading-relaxed mb-4 text-lg">
                  This mapping tool was created out of a passion for simplifying the complex process of enumeration mapping. As a developer, I wanted to provide a seamless, robust, and completely free digital alternative to traditional pen-and-paper mapping.
                </p>
                <p className="text-gray-300 leading-relaxed text-lg">
                  The goal is to empower users with specialized tools—like varied building icons, road types, and customizable numbering—all packed into a modern, lightning-fast web interface.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-orange-500/10 border border-orange-500/20 p-8 rounded-3xl relative overflow-hidden">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-orange-400">
              <AlertTriangle /> Important Disclaimer
            </h2>
            <p className="text-gray-200 leading-relaxed text-lg font-medium">
              This is <span className="text-white font-bold underline">not an official app from Census India 2026</span> or any government body. 
            </p>
            <p className="text-gray-300 leading-relaxed mt-2 text-lg">
              It is purely an independent utility created for helping enumerators draft and create layout maps efficiently using standard icons and objects. No official affiliation is claimed or implied.
            </p>
          </section>

          <section className="glass-card p-8 rounded-3xl border border-white/10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <MapIcon className="text-primary" /> Core Features
            </h2>
            <ul className="space-y-4 text-gray-300 text-lg">
              <li className="flex items-start gap-3">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                <p><strong>Custom Icons:</strong> Place specific structures like Houses, Temples, Mosques, Churches, and Gurudwaras effortlessly.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                <p><strong>Advanced Paths:</strong> Draw proper roads, unpaved paths, dotted boundaries, and railway lines.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                <p><strong>A3 PDF Export:</strong> Export your completed maps flawlessly into high-resolution A3 PDFs for immediate printing and submission.</p>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
