import { ArrowLeft, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CookiePolicy() {
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
          <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-yellow-500">
            <Cookie size={32} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Cookie Policy</h1>
        </div>

        <div className="glass-card p-8 md:p-12 rounded-3xl border border-white/10 space-y-8 text-gray-300 leading-relaxed text-lg">
          <p>
            This Cookie Policy explains how Draw Map uses cookies and similar technologies to recognize you when you visit our application.
          </p>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">What are cookies?</h2>
            <p>
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide reporting information.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">How do we use cookies?</h2>
            <p>
              We use first-party cookies and local storage primarily for essential reasons:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>Authentication:</strong> To keep you logged in and secure your sessions using JWT tokens.</li>
              <li><strong>Preferences:</strong> To remember your specific canvas settings, such as global house sizes, boundary colors, and tool selections, ensuring a seamless experience across reloads.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">Do we use tracking or advertising cookies?</h2>
            <p>
              No. We respect your privacy. Draw Map does not use any third-party tracking, analytics, or advertising cookies. All stored data is strictly functional and necessary for the app to operate as intended.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">Managing Local Storage</h2>
            <p>
              Because we rely heavily on your browser's Local Storage for saving preferences, clearing your browser data will reset your tool configurations (e.g., house size) to their defaults.
            </p>
          </div>
          
          <div className="pt-8 mt-8 border-t border-white/10 text-sm text-gray-500 text-center">
            Last updated: July 2026
          </div>
        </div>
      </main>
    </div>
  );
}
