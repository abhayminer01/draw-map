import { ArrowLeft, MessageSquare, Bug, Mail, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Support() {
  const [submitted, setSubmitted] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] text-gray-100 font-sans">
      <header className="h-16 border-b border-white/10 bg-surface/80 backdrop-blur-md flex items-center px-6 sticky top-0 z-20">
        <Link to="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all flex items-center gap-2">
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
            <MessageSquare size={32} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Support & Report Bug</h1>
        </div>

        <section className="glass-card p-8 rounded-3xl border border-white/10 relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
            <div className="flex-shrink-0">
              <img src="/images/Abhay%20Vijayan.png" alt="Abhay Vijayan" className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-primary/20 shadow-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Support the Creator</h2>
              <p className="text-gray-300 leading-relaxed mb-4 text-lg">
                Draw Map is a passion project born from a vision to simplify mapping for enumerators. Building and maintaining this tool requires significant time, effort, and personal funding to ensure it remains freely available to everyone. The platform is 100% free to use, and I am actively committed to providing ongoing support and bug fixes.
              </p>
              <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                If you find Draw Map valuable and would like to support my work, you can contribute financially using the details below. Your generosity helps cover running costs and fuels the development of future projects!
              </p>
              <p>Sincerely Abhay Vijayan </p>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="bg-[#1c1c1f] border border-white/10 px-4 py-3 rounded-xl flex items-center gap-3">
                    <span className="text-gray-400">UPI ID:</span>
                    <span className="font-mono text-primary font-bold">abhayvijayan@upi</span>
                  </div>
                  <button 
                    onClick={() => setShowQR(!showQR)}
                    className="bg-primary/20 text-primary hover:bg-primary/30 px-4 py-3 rounded-xl font-medium transition-colors"
                  >
                    {showQR ? 'Hide QR Code' : 'Show QR Code'}
                  </button>
                  <div className="bg-[#1c1c1f] border border-white/10 px-4 py-3 rounded-xl flex items-center gap-3">
                    <span className="text-gray-400">PayPal:</span>
                    <span className="font-mono text-primary font-bold">paypal.me/abhayvijayan</span>
                  </div>
                </div>
                {showQR && (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 self-start animate-in fade-in zoom-in duration-200">
                    <img src="/images/upi-qr.png" alt="UPI QR Code" className="w-48 h-48 rounded-lg object-contain bg-white p-2" />
                    <p className="text-center text-sm text-gray-400 mt-3">Scan to pay via any UPI app</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <section className="glass-card p-8 rounded-3xl border border-white/10">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-white">
                <Mail className="text-blue-400" /> Contact Us
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                Have a question or need assistance with your mapping workflow? We're here to help you get the most out of Draw Map.
              </p>
              <div className="flex items-center gap-3 text-gray-200 bg-white/5 p-4 rounded-xl">
                <Mail size={20} className="text-gray-400" />
                <a href="mailto:support@drawmap.local" className="hover:text-white transition-colors">support@drawmap.local</a>
              </div>
            </section>

            <section className="glass-card p-8 rounded-3xl border border-white/10">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-white">
                <Bug className="text-red-400" /> Found a Bug?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                If you encounter any issues while drawing paths, placing icons, or exporting your PDFs, please let us know so we can fix it immediately. Use the form to submit a detailed report.
              </p>
            </section>
          </div>

          <section className="glass-card p-8 rounded-3xl border border-white/10 relative overflow-hidden">
            <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Issue Type</label>
                <select className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none">
                  <option>General Support</option>
                  <option>Report a Bug</option>
                  <option>Feature Request</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  required
                  rows="4"
                  className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="Please describe your issue in detail..."
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={submitted}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-green-600 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {submitted ? 'Message Sent!' : (
                  <>
                    <Send size={18} /> Submit
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
