import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Map as MapIcon } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin) {
      if (password !== confirmPassword) {
        return setError('Passwords do not match');
      }
      if (password.length < 8) {
        return setError('Password must be at least 8 characters long');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return setError('Invalid email format');
      }
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`${API_URL}${endpoint}`, { email, password });
      
      login(res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-secondary/20 rounded-full blur-[100px]"></div>

      <div className="glass-card w-full max-w-md p-8 rounded-3xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-center mb-8">
          <div className="flex items-center justify-center">
              <img src="/images/logo-without-bg.png" alt="Draw Map Logo" className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
            </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center mb-2">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h2>
        <p className="text-gray-400 text-center mb-8">
          {isLogin ? 'Enter your details to access your maps' : 'Sign up to start creating your maps'}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          
          {!isLogin && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <input 
                type="password" 
                required={!isLogin}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-blue-600 disabled:opacity-50 text-white py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-primary hover:text-white font-medium transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
