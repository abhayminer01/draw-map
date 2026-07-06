import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';
import Login from './pages/Login';
import Home from './pages/Home';
import Canvas from './pages/Canvas';
import About from './pages/About';
import Support from './pages/Support';
import Terms from './pages/Terms';
import CookiePolicy from './pages/CookiePolicy';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={48} /></div>;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={48} /></div>;
  }

  return (
    <div className="min-h-screen bg-background text-gray-100 flex flex-col font-sans">
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/map/:id" element={<ProtectedRoute><Canvas /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
          <Route path="/terms" element={<ProtectedRoute><Terms /></ProtectedRoute>} />
          <Route path="/cookie-policy" element={<ProtectedRoute><CookiePolicy /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
