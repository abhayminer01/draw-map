import { MapIcon, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MapCard({ map }) {
  const date = new Date(map.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  let preview = null;
  if (map.canvas_data) {
    try {
      const parsed = JSON.parse(map.canvas_data);
      if (parsed.preview_image) {
        preview = parsed.preview_image;
      }
    } catch (e) {}
  }

  return (
    <Link 
      to={`/map/${map.id}`}
      className="glass-card block p-6 rounded-2xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden min-h-[200px] flex flex-col"
    >
      {preview ? (
        <div className="absolute inset-0 z-0">
          <img src={preview} alt="Map preview" className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f13] via-[#0f0f13]/80 to-transparent"></div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
      )}
      
      <div className="flex items-start justify-between relative z-10">
        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-primary group-hover:text-white transition-colors duration-300 border border-white/10">
          <img src="/images/icon.png" alt="Map Icon" className="w-10 h-10 opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
        </div>
      </div>
      
      <div className="mt-auto pt-16 relative z-10">
        <h3 className="text-xl font-semibold text-white mb-2">{map.name}</h3>
        <div className="flex items-center text-sm text-gray-300">
          <Calendar size={14} className="mr-1.5" />
          <span>Created on {date}</span>
        </div>
      </div>
    </Link>
  )
}
