import { ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Terms() {
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
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
            <FileText size={32} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Terms and Conditions</h1>
        </div>

        <div className="glass-card p-8 md:p-12 rounded-3xl border border-white/10 space-y-8 text-gray-300 leading-relaxed text-lg">
          <p>
            Welcome to Draw Map. By accessing or using our application, you agree to be bound by these Terms and Conditions. Please read them carefully.
          </p>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">1. Use of the Application</h2>
            <p>
              Draw Map is a utility tool designed to assist users in creating layout maps and diagrams. You are granted a limited, non-exclusive, non-transferable license to use the app strictly in accordance with these Terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">2. No Official Affiliation</h2>
            <p className="text-orange-300 bg-orange-500/10 p-4 rounded-xl border border-orange-500/20 my-4 font-medium">
              This application is completely independent and is NOT officially associated, endorsed, or affiliated with Census India 2026 or any government entity. The tool is provided for individual utility and mapping assistance.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">3. User Data and Content</h2>
            <p>
              Any maps, layouts, or data you create using Draw Map remain your property. However, by saving data on our servers, you grant us the necessary permissions to store, process, and render that data for your continued use of the service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">4. Limitation of Liability</h2>
            <p>
              The creators of Draw Map shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the application. The tool is provided "as is" without warranties of any kind.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">5. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Your continued use of the application following any changes indicates your acceptance of the new Terms.
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
