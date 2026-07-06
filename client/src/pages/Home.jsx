import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, X, Loader2, MapIcon, LogOut } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import MapCard from '../components/MapCard'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const [maps, setMaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newMapName, setNewMapName] = useState('')
  const [creating, setCreating] = useState(false)
  
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  useEffect(() => {
    fetchMaps()
  }, [])

  const fetchMaps = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/maps`)
      setMaps(res.data)
    } catch (error) {
      console.error('Error fetching maps:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMap = async (e) => {
    e.preventDefault()
    if (!newMapName.trim()) return

    setCreating(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.post(`${API_URL}/api/maps`, {
        name: newMapName
      })
      navigate(`/map/${res.data.id}`)
    } catch (error) {
      console.error('Error creating map:', error)
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] text-gray-100 font-sans flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <img src="/images/logo-without-bg.png" alt="Draw Map Logo" className="h-8 w-auto object-contain" />
          <span className="text-xl font-bold tracking-tight">Draw Map</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
          <Link to="/support" className="hover:text-white transition-colors">Report Bug</Link>
          <Link to="/support" className="hover:text-white transition-colors">Contact Support</Link>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 hover:text-red-400 transition-colors border-l border-white/10 pl-6 ml-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl relative flex-grow">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <div>
            <h1 className="text-5xl font-bold tracking-tight mb-3">
              Your <span className="gradient-text">Workspaces</span>
            </h1>
            <p className="text-gray-400 text-lg">Create, edit, and manage your maps in one place.</p>
          </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center gap-2 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Create Map
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      ) : maps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {maps.map(map => (
            <MapCard key={map.id} map={map} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-card rounded-3xl border-dashed border-2 border-white/10">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <img src="/images/icon.png" alt="Draw Map" className="w-16 h-16 opacity-30 mx-auto" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">No maps yet</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-8">You haven't created any maps. Click the button below to start your first canvas.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-primary hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <Plus size={18} />
            Create your first map
          </button>
        </div>
      )}

      {/* Create Map Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="glass-card w-full max-w-md rounded-3xl p-8 relative z-10 animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold mb-6">Name your map</h2>
            
            <form onSubmit={handleCreateMap}>
              <div className="mb-6">
                <input 
                  type="text" 
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  placeholder="e.g. Fantasy World, Office Layout..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newMapName.trim() || creating}
                  className="bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-primary text-white px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2"
                >
                  {creating && <Loader2 size={18} className="animate-spin" />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-surface/50 mt-auto py-8">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <img src="/images/logo-without-bg.png" alt="Draw Map Logo" className="h-6 w-auto object-contain opacity-80" />
              <span className="font-medium">Draw Map &copy; 2026</span>
            </div>
            <nav className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/support" className="hover:text-white transition-colors">Support & Bugs</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
              <Link to="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
