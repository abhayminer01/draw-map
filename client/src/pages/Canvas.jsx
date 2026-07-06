import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2, Save, Download, MousePointer2, Move, Route, Compass, SquareDashed, Eraser, Undo, Redo, Home, X, Settings, Triangle, Cone, Footprints, Train, Landmark, MoonStar, Church, BookOpen, Droplets, Type, Upload, Eye, EyeOff, Check, Image as ImageIcon, ChevronDown, ChevronUp , Waves, Equal, Target, Cylinder, Droplet , TrainTrack, AlignJustify, CircleDot, ShowerHead, Factory, Menu } from 'lucide-react';
import { Stage, Layer, Rect, Line, Circle, Group, Text, RegularPolygon, Arc, Image, Transformer } from 'react-konva';
import jsPDF from 'jspdf';

const CANVAS_WIDTH = 2480; // Landscape A3 width
const CANVAS_HEIGHT = 1754; // Landscape A3 height

const getTaperPoints = (pA, pB, width, length) => {
  const dx = pA.x - pB.x;
  const dy = pA.y - pB.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return [];
  const vx = dx / dist;
  const vy = dy / dist;
  
  const nx = -vy;
  const ny = vx;
  
  const pLeft = { x: pA.x + nx * (width / 2), y: pA.y + ny * (width / 2) };
  const pRight = { x: pA.x - nx * (width / 2), y: pA.y - ny * (width / 2) };
  const pTip = { x: pA.x + vx * length, y: pA.y + vy * length };
  
  return [pLeft.x, pLeft.y, pTip.x, pTip.y, pRight.x, pRight.y];
};

export default function Canvas() {
  const { id } = useParams();
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSummaryVisible, setIsSummaryVisible] = useState(true);
  // Canvas State
  const initialScale = 0.4;
  const [stageScale, setStageScale] = useState(initialScale);
  const [stageX, setStageX] = useState(0);
  const [stageY, setStageY] = useState(0);
  const [waterPattern, setWaterPattern] = useState(null);
  const [hatchPattern, setHatchPattern] = useState(null);

  // Reference Image State
  const [refImageStr, setRefImageStr] = useState(null);
  const [refImageObj, setRefImageObj] = useState(null);
  const [isRefVisible, setIsRefVisible] = useState(true);
  const [isRefEditing, setIsRefEditing] = useState(false);
  const [refOpacity, setRefOpacity] = useState(() => parseInt(localStorage.getItem('refOpacity')) || 55);
  const [refConfig, setRefConfig] = useState({ x: 50, y: 50, width: 800, height: 600, rotation: 0, scaleX: 1, scaleY: 1 });
  const refImageNode = useRef(null);
  const trRef = useRef(null);
  const trTextRef = useRef(null);
  const shapeRefs = useRef({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (refImageStr) {
      const img = new window.Image();
      img.src = refImageStr;
      img.onload = () => {
        setRefImageObj(img);
      };
    } else {
      setRefImageObj(null);
    }
  }, [refImageStr]);

  useEffect(() => {
    if (isRefEditing && trRef.current && refImageNode.current) {
      trRef.current.nodes([refImageNode.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isRefEditing, refImageObj, isRefVisible]);



  useEffect(() => {
    // Generate dotted water pattern
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#e0f2fe'; // light blue
    ctx.fillRect(0, 0, 40, 40);
    
    ctx.strokeStyle = '#38bdf8'; // slightly darker blue
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(0, 10); ctx.lineTo(40, 10);
    ctx.moveTo(0, 30); ctx.lineTo(40, 30);
    ctx.stroke();

    const img = new window.Image();
    img.src = canvas.toDataURL();
    img.onload = () => {
      setWaterPattern(img);
    };
  }, []);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#d1d5db';
    ctx.fillRect(0, 0, 10, 10);
    
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(10, 0);
    // Draw corners to tile seamlessly
    ctx.moveTo(-2, 2);
    ctx.lineTo(2, -2);
    ctx.moveTo(8, 12);
    ctx.lineTo(12, 8);
    ctx.stroke();

    const img = new window.Image();
    img.src = canvas.toDataURL();
    img.onload = () => {
      setHatchPattern(img);
    };
  }, []);


  useEffect(() => {
    // Center the canvas on initial load
    const screenW = window.innerWidth - 64;
    const screenH = window.innerHeight - 64;
    setStageX((screenW - CANVAS_WIDTH * initialScale) / 2);
    setStageY((screenH - CANVAS_HEIGHT * initialScale) / 2);
  }, []);
  
  // Tools and Elements
  const [activeTool, setActiveTool] = useState('select'); // 'select', 'pan', 'road'
  const [roads, setRoads] = useState([]);
  const [pendingRoad, setPendingRoad] = useState(null);
  const [selectedRoadId, setSelectedRoadId] = useState(null);
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const effectiveTool = isSpaceDown ? 'pan' : activeTool;

  useEffect(() => {
    if (selectedRoadId && trTextRef.current) {
      const selectedNode = shapeRefs.current[selectedRoadId];
      if (selectedNode) {
        trTextRef.current.nodes([selectedNode]);
        trTextRef.current.getLayer().batchDraw();
      }
    } else if (trTextRef.current) {
      trTextRef.current.nodes([]);
    }
  }, [selectedRoadId, roads]);
  
  // House Modal State
  const [houseModal, setHouseModal] = useState({ isOpen: false, x: 0, y: 0 });
  const [houseData, setHouseData] = useState({ number: '', isNonResidential: false, textSize: 12, purposeNumber: '', isMultipleNumbers: false, endingNumber: '' });
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [houseSize, setHouseSize] = useState(() => parseInt(localStorage.getItem('houseSize')) || 50);
  const [houseTextScale, setHouseTextScale] = useState(() => parseInt(localStorage.getItem('houseTextScale')) || 32);
  const [purposeTextScale, setPurposeTextScale] = useState(() => parseInt(localStorage.getItem('purposeTextScale')) || 32);
  const [boundaryColor, setBoundaryColor] = useState(() => localStorage.getItem('boundaryColor') || '#22c55e');
  const [shadowsEnabled, setShadowsEnabled] = useState(() => localStorage.getItem('shadowsEnabled') !== 'false');
  const [autosaveInterval, setAutosaveInterval] = useState(() => {
    const val = localStorage.getItem('autosaveInterval');
    return val !== null ? parseInt(val) : 5;
  });
  const [isAutosavingIndicator, setIsAutosavingIndicator] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // History State
  const [historyStep, setHistoryStep] = useState(0);
  const historyRef = useRef([[]]);

  const pushToHistory = (newRoads) => {
    const newHistory = historyRef.current.slice(0, historyStep + 1);
    newHistory.push(newRoads);
    historyRef.current = newHistory;
    setHistoryStep(newHistory.length - 1);
  };

  const handleUpdateRoads = (newRoads) => {
    pushToHistory(newRoads);
    setRoads(newRoads);
  };

  
  const handleToolSelect = (tool) => {
    setActiveTool(tool);
    setSelectedRoadId(null);
    setPendingRoad(null);
    setIsMobileMenuOpen(false);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      setHistoryStep(prev => {
        const next = prev - 1;
        setRoads(historyRef.current[next]);
        return next;
      });
    }
  };

  const handleRedo = () => {
    if (historyStep < historyRef.current.length - 1) {
      setHistoryStep(prev => {
        const next = prev + 1;
        setRoads(historyRef.current[next]);
        return next;
      });
    }
  };
  
  const stageRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat && e.target?.tagName !== 'INPUT') {
        setIsSpaceDown(true);
      }
      if (e.code === 'Escape') {
        setSelectedRoadId(null);
        setPendingRoad(null);
      }
      if (e.ctrlKey && e.code === 'KeyZ') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (e.ctrlKey && e.code === 'KeyY') {
        handleRedo();
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpaceDown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [historyStep]);

  useEffect(() => {
    const fetchMap = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await axios.get(`${API_URL}/api/maps/${id}`);
        setMapData(res.data);
        if (res.data.canvas_data) {
          const parsed = JSON.parse(res.data.canvas_data);
          if (parsed.roads) {
            setRoads(parsed.roads);
            historyRef.current = [parsed.roads];
            setHistoryStep(0);
          }
          if (parsed.refImageStr) {
            setRefImageStr(parsed.refImageStr);
          }
          if (parsed.refConfig) {
            setRefConfig(parsed.refConfig);
          }
        } else {
          historyRef.current = [[]];
          setHistoryStep(0);
        }
      } catch (error) {
        console.error('Error fetching map:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMap();
  }, [id]);

  const handleUploadRef = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setRefImageStr(ev.target.result);
        setIsRefEditing(true);
        setIsRefVisible(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let preview_image = null;
      if (stageRef.current) {
        const stage = stageRef.current;
        const oldScale = stage.scaleX();
        const oldX = stage.x();
        const oldY = stage.y();
        
        // Temporarily scale down to capture a small thumbnail
        const thumbnailScale = 0.2;
        stage.scaleX(thumbnailScale);
        stage.scaleY(thumbnailScale);
        stage.x(0);
        stage.y(0);
        
        preview_image = stage.toDataURL({
          x: 0,
          y: 0,
          width: CANVAS_WIDTH * thumbnailScale,
          height: CANVAS_HEIGHT * thumbnailScale,
          pixelRatio: 1
        });
        
        // Restore
        stage.scaleX(oldScale);
        stage.scaleY(oldScale);
        stage.x(oldX);
        stage.y(oldY);
      }

      const canvas_data = JSON.stringify({ 
        roads, 
        preview_image,
        refImageStr,
        refConfig
      });
      const API_URL = import.meta.env.VITE_API_URL || '';
      await axios.put(`${API_URL}/api/maps/${id}`, { canvas_data });
    } catch (error) {
      console.error('Error saving map:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRef = useRef(handleSave);
  useEffect(() => {
    handleSaveRef.current = handleSave;
  });

  useEffect(() => {
    if (autosaveInterval <= 0) return;
    const intervalId = setInterval(() => {
      setIsAutosavingIndicator(true);
      handleSaveRef.current().finally(() => {
        setTimeout(() => setIsAutosavingIndicator(false), 2000); // Show for 2 seconds
      });
    }, autosaveInterval * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [autosaveInterval]);

  const handleDownloadPDF = () => {
    const stage = stageRef.current;
    if (!stage) return;
    setIsDownloading(true);
    
    setTimeout(() => {
    
    // Save current scale/position
    const oldScale = stage.scaleX();
    const oldX = stage.x();
    const oldY = stage.y();
    
    // Reset to full view for export
    stage.scaleX(1);
    stage.scaleY(1);
    stage.x(0);
    stage.y(0);
    
    // Hide reference image and transformers before export
    const wasRefVisible = refImageNode.current ? refImageNode.current.visible() : false;
    const wasTrVisible = trRef.current ? trRef.current.visible() : false;
    const wasTrTextVisible = trTextRef.current ? trTextRef.current.visible() : false;
    
    if (refImageNode.current) refImageNode.current.hide();
    if (trRef.current) trRef.current.hide();
    if (trTextRef.current) trTextRef.current.hide();

    // Generate image from canvas (pixelRatio 2 for high quality)
    // Export exactly the logical A3 dimensions, ignoring viewport size
    const dataURL = stage.toDataURL({ 
      x: 0, 
      y: 0, 
      width: CANVAS_WIDTH, 
      height: CANVAS_HEIGHT, 
      pixelRatio: 2 
    });
    
    // Restore stage position
    stage.scaleX(oldScale);
    stage.scaleY(oldScale);
    stage.x(oldX);
    stage.y(oldY);
    
    // Restore visibility
    if (refImageNode.current && wasRefVisible) refImageNode.current.show();
    if (trRef.current && wasTrVisible) trRef.current.show();
    if (trTextRef.current && wasTrTextVisible) trTextRef.current.show();
    
    // Create A3 Landscape PDF (420 x 297 mm)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a3'
    });
    
    pdf.addImage(dataURL, 'PNG', 0, 0, 420, 297);
    pdf.save(`${mapData?.name || 'Map'}.pdf`);
      setIsDownloading(false);
    }, 50);
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    // Allow zooming with scroll wheel directly

    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    let direction = e.evt.deltaY > 0 ? -1 : 1;
    const scaleBy = 1.1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setStageScale(newScale);
    setStageX(pointer.x - mousePointTo.x * newScale);
    setStageY(pointer.y - mousePointTo.y * newScale);
  };

  const getRelativePointerPosition = (node) => {
    const transform = node.getAbsoluteTransform().copy();
    transform.invert();
    const pos = node.getStage().getPointerPosition();
    return transform.point(pos);
  };

  const handleStageClick = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'background';
    
    if (effectiveTool === 'select' && clickedOnEmpty) {
      setSelectedRoadId(null);
    }

    if (effectiveTool === 'house' || effectiveTool === 'bad_house' || effectiveTool === 'temple' || effectiveTool === 'mosque' || effectiveTool === 'church' || effectiveTool === 'gurudwara' || effectiveTool === 'text') {
      const pos = getRelativePointerPosition(stageRef.current);
      setHouseModal({ isOpen: true, x: pos.x, y: pos.y, tool: effectiveTool });
      return;
    }

    if (effectiveTool === 'well' || effectiveTool === 'pipe' || effectiveTool === 'hand_pump') {
      const pos = getRelativePointerPosition(stageRef.current);
      const newElement = {
        id: `${effectiveTool}_${Date.now()}`,
        type: effectiveTool,
        x: pos.x,
        y: pos.y,
        rotation: 0,
        scaleX: 1,
        scaleY: 1
      };
      handleUpdateRoads([...roads, newElement]);
      setSelectedRoadId(newElement.id);
      return;
    }

    if (effectiveTool === 'road' || effectiveTool === 'boundary' || effectiveTool === 'bad_road' || effectiveTool === 'path' || effectiveTool === 'railway' || effectiveTool === 'pond' || effectiveTool === 'river' || effectiveTool === 'canal') {
      const pos = getRelativePointerPosition(stageRef.current);
      
      const selectedRoad = roads.find(r => r.id === selectedRoadId);
      if (selectedRoad && selectedRoad.type === effectiveTool && !selectedRoad.isClosed) {
        // Extend existing road
        const pts = selectedRoad.points;
        const distToStart = Math.hypot(pts[0] - pos.x, pts[1] - pos.y);
        const distToEnd = Math.hypot(pts[pts.length-2] - pos.x, pts[pts.length-1] - pos.y);
        
        const CLOSE_THRESHOLD = 30;
        
        // If the path has at least 3 points (6 coords) and they clicked near an end, close it!
        if (pts.length >= 6 && (distToStart < CLOSE_THRESHOLD || distToEnd < CLOSE_THRESHOLD)) {
          const newRoads = roads.map(r => 
            r.id === selectedRoadId ? { ...r, isClosed: true } : r
          );
          handleUpdateRoads(newRoads);
          setSelectedRoadId(null);
          return;
        }

        const newRoads = roads.map(r => {
          if (r.id === selectedRoadId) {
            return { ...r, points: [...r.points, pos.x, pos.y] };
          }
          return r;
        });
        handleUpdateRoads(newRoads);
      } else {
        // Create new road
        if (!pendingRoad) {
          setPendingRoad([pos.x, pos.y]);
        } else {
          const newElement = {
            id: `${effectiveTool}_${Date.now()}`,
            type: effectiveTool,
            points: [pendingRoad[0], pendingRoad[1], pos.x, pos.y],
          };
          handleUpdateRoads([...roads, newElement]);
          setPendingRoad(null);
          setSelectedRoadId(newElement.id);
        }
      }
    }
  };

  const handleMouseMove = (e) => {
    if ((effectiveTool === 'road' || effectiveTool === 'boundary' || effectiveTool === 'bad_road' || effectiveTool === 'path' || effectiveTool === 'railway' || effectiveTool === 'pond' || effectiveTool === 'river' || effectiveTool === 'canal') && pendingRoad) {
      // Could render a temporary line here, handled implicitly by Konva re-render if we stored temp pos
    }
  };

  const handleDragPoint = (roadId, pointIndex, e) => {
    setRoads(prevRoads => prevRoads.map(r => {
      if (r.id === roadId) {
        const updatedPoints = [...r.points];
        updatedPoints[pointIndex * 2] = e.target.x();
        updatedPoints[pointIndex * 2 + 1] = e.target.y();
        return { ...r, points: updatedPoints };
      }
      return r;
    }));
  };

  const handleDragEnd = () => {
    setRoads(prev => {
      pushToHistory(prev);
      return prev;
    });
  };

  const handleAddMidpoint = (roadId, index, e) => {
    e.cancelBubble = true;
    const newRoads = roads.map(r => {
      if (r.id === roadId) {
        const p = r.points;
        const midX = (p[index * 2] + p[index * 2 + 2]) / 2;
        const midY = (p[index * 2 + 1] + p[index * 2 + 3]) / 2;
        const newPoints = [
          ...p.slice(0, index * 2 + 2),
          midX, midY,
          ...p.slice(index * 2 + 2)
        ];
        return { ...r, points: newPoints };
      }
      return r;
    });
    handleUpdateRoads(newRoads);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={48} /></div>;
  }

  if (!mapData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bold mb-4">Map not found</h2>
        <Link to="/dashboard" className="text-primary hover:text-white transition-colors flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const stats = {
    residential: 0,
    nonResidential: 0,
    temple: 0,
    mosque: 0,
    church: 0,
    gurudwara: 0,
    badBuilding: 0,
    total: 0
  };

  roads.forEach(r => {
    if (r.type === 'house') {
      if (r.isNonResidential) stats.nonResidential++;
      else stats.residential++;
      stats.total++;
    } else if (r.type === 'bad_house') {
      stats.badBuilding++;
      stats.total++;
    } else if (r.type === 'temple') {
      stats.temple++;
      stats.total++;
    } else if (r.type === 'mosque') {
      stats.mosque++;
      stats.total++;
    } else if (r.type === 'church') {
      stats.church++;
      stats.total++;
    } else if (r.type === 'gurudwara') {
      stats.gurudwara++;
      stats.total++;
    }
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0f0f13]">
      {/* Top Navbar */}
      <header className="h-16 border-b border-white/10 bg-surface/80 backdrop-blur-md flex items-center justify-between px-2 md:px-6 z-20 shrink-0">
        <div className="flex items-center gap-1 md:gap-4">
          <button 
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={20} />
          </button>
          <Link to="/dashboard" className="p-2 md:-ml-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div className="hidden md:block h-6 w-[1px] bg-white/10 mx-2"></div>
          <h1 className="text-base md:text-lg font-medium truncate max-w-[100px] md:max-w-xs">{mapData.name}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-surface/50 border border-white/10 rounded-lg p-1 mr-2">
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleUploadRef} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              title="Upload Reference Image"
            >
              <Upload size={16} />
            </button>
            {refImageStr && (
              <button 
                onClick={() => setIsRefVisible(!isRefVisible)}
                className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                title="Toggle Reference Visibility"
              >
                {isRefVisible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            )}
            <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
            <button 
              onClick={handleUndo}
              className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-30"
              disabled={historyStep <= 0}
              title="Undo (Ctrl+Z)"
            >
              <Undo size={16} />
            </button>
            <button 
              onClick={handleRedo}
              className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-30"
              disabled={historyStep >= historyRef.current.length - 1}
              title="Redo (Ctrl+Y)"
            >
              <Redo size={16} />
            </button>
          </div>
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-50"
            title="Download PDF (A3)"
          >
            {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-primary/20 text-primary hover:bg-primary/30 px-4 py-2 rounded-lg font-medium transition-all text-sm"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span className="hidden md:inline">Save</span>
          </button>
        </div>
      </header>

      <div className="flex flex-grow overflow-hidden relative">
        {/* Left Toolbar */}
        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden absolute inset-0 bg-black/50 z-20"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        <aside 
          className={`absolute md:relative left-0 top-0 h-full w-16 bg-surface/95 backdrop-blur-xl border-r border-white/10 z-30 flex flex-col items-center py-4 gap-4 overflow-y-auto overflow-x-hidden shrink-0 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <button 
            onClick={() => handleToolSelect('select')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'select' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title="Select"
          >
            <MousePointer2 size={20} />
          </button>
          <button 
            onClick={() => handleToolSelect('pan')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'pan' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title="Pan (Drag canvas)"
          >
            <Move size={20} />
          </button>
          <button 
            onClick={() => handleToolSelect('road')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'road' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title="Draw Road"
          >
            <Route size={20} />
          </button>
          <button 
            onClick={() => handleToolSelect('bad_road')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'bad_road' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title="Draw Unpaved Road"
          >
            <Cone size={20} />
          </button>
          <button 
            onClick={() => handleToolSelect('path')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'path' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title="Draw Path"
          >
            <Footprints size={20} />
          </button>
          <button 
            onClick={() => handleToolSelect('pond')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'pond' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title="Draw Pond"
          >
            <Droplets size={20} />
          </button>
          <button 
            onClick={() => handleToolSelect('railway')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'railway' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title="Draw Railway"
          >
            <TrainTrack size={20} />
          </button>
          <button 
            onClick={() => handleToolSelect('boundary')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'boundary' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title="Draw Boundary"
          >
            <SquareDashed size={20} />
          </button>
          <button 
            onClick={() => handleToolSelect('house')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'house' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title="Place House"
          >
            <Home size={20} />
          </button>
          <button 
            onClick={() => handleToolSelect('bad_house')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'bad_house' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title="Place Non-Residential"
          >
            <Factory size={20} />
          </button>
          <button 
            onClick={() => handleToolSelect('temple')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'temple' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title="Place Temple"
          >
            <Landmark size={20} />
          </button>
          <button 
            onClick={() => handleToolSelect('mosque')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'mosque' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title="Place Mosque"
          >
            <MoonStar size={20} />
          </button>
          <button 
            onClick={() => handleToolSelect('church')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'church' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title="Place Church"
          >
            <Church size={20} />
          </button>
          <button 
            onClick={() => handleToolSelect('gurudwara')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'gurudwara' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title="Place Gurudwara"
          >
            <BookOpen size={20} />
          </button>
          <button 
            onClick={() => handleToolSelect('text')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'text' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title="Add Text"
          >
            <Type size={20} />
          </button>
          <button 
            onClick={() => handleToolSelect('river')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'river' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title="Draw River"
          >
            <Waves size={20} />
          </button>
          <button 
            onClick={() => handleToolSelect('canal')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'canal' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title="Draw Canal"
          >
            <AlignJustify size={20} />
          </button>
          <button 
            onClick={() => handleToolSelect('well')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'well' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title="Place Well"
          >
            <CircleDot size={20} />
          </button>
          <button 
            onClick={() => handleToolSelect('pipe')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'pipe' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title="Place Pipe"
          >
            <ShowerHead size={20} />
          </button>
          <button 
            onClick={() => handleToolSelect('hand_pump')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'hand_pump' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title="Place Hand Pump"
          >
            <Droplet size={20} />
          </button>
          <div className="w-8 h-[1px] bg-white/10 my-1"></div>
          <button 
            onClick={() => handleToolSelect('eraser')}
            className={`p-3 rounded-xl transition-all ${activeTool === 'eraser' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-red-400 hover:bg-white/10'}`}
            title="Eraser (Click to delete)"
          >
            <Eraser size={20} />
          </button>
          
        </aside>

        {/* Canvas Area */}
        <main 
          className="flex-grow relative bg-[#1c1c1f]"
          style={{ cursor: effectiveTool === 'pan' ? 'grab' : (effectiveTool === 'road' || effectiveTool === 'boundary' || effectiveTool === 'bad_road' || effectiveTool === 'path' || effectiveTool === 'railway' || effectiveTool === 'pond' || effectiveTool === 'river' || effectiveTool === 'canal') ? 'crosshair' : effectiveTool === 'eraser' ? 'pointer' : 'default' }}
        >
          {isRefEditing && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-md border border-white/20 px-6 py-4 rounded-2xl shadow-2xl z-30 flex flex-col md:flex-row items-center gap-4 animate-in fade-in slide-in-from-top-4">
              <div className="text-sm text-gray-200">
                <span className="font-bold text-white">Reference Image Mode:</span> Drag to position, use corners to resize.
              </div>
              <button 
                onClick={() => setIsRefEditing(false)}
                className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              >
                <Check size={18} />
                Confirm Placement
              </button>
            </div>
          )}
          
          {/* Building Stats Summary */}
          <div className="absolute bottom-28 right-8 z-30 bg-surface/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-lg w-56 flex flex-col gap-2 transition-all">
            <div className="flex items-center justify-between mb-1 border-b border-white/10 pb-2">
              <h4 className="text-white font-medium">Map Summary</h4>
              <button 
                onClick={() => setIsSummaryVisible(!isSummaryVisible)}
                className="text-gray-400 hover:text-white transition-colors"
                title={isSummaryVisible ? "Hide Summary" : "Show Summary"}
              >
                {isSummaryVisible ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </button>
            </div>
            
            {isSummaryVisible && (
              <div className="flex flex-col gap-2">
                {stats.residential > 0 && (
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Residential:</span>
                    <span className="font-semibold text-white">{stats.residential}</span>
                  </div>
                )}
                {stats.nonResidential > 0 && (
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Non-Residential:</span>
                    <span className="font-semibold text-white">{stats.nonResidential}</span>
                  </div>
                )}
                {stats.badBuilding > 0 && (
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Bad Buildings:</span>
                    <span className="font-semibold text-white">{stats.badBuilding}</span>
                  </div>
                )}
                {stats.temple > 0 && (
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Temples:</span>
                    <span className="font-semibold text-white">{stats.temple}</span>
                  </div>
                )}
                {stats.mosque > 0 && (
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Mosques:</span>
                    <span className="font-semibold text-white">{stats.mosque}</span>
                  </div>
                )}
                {stats.church > 0 && (
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Churches:</span>
                    <span className="font-semibold text-white">{stats.church}</span>
                  </div>
                )}
                {stats.gurudwara > 0 && (
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Gurudwaras:</span>
                    <span className="font-semibold text-white">{stats.gurudwara}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-medium text-primary border-t border-white/10 pt-2 mt-1">
                  <span>Total Buildings:</span>
                  <span>{stats.total}</span>
                </div>
              </div>
            )}
          </div>

          {/* Floating Settings Button */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="absolute bottom-8 right-8 z-30 p-4 bg-surface border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center group"
            title="Settings"
          >
            <Settings size={24} className="group-hover:rotate-45 transition-transform duration-300" />
          </button>

          {/* Autosaving Indicator */}
          {isAutosavingIndicator && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center justify-center bg-surface/90 backdrop-blur-md border border-white/20 px-8 py-6 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95">
              <Loader2 size={40} className="animate-spin text-primary mb-3" />
              <div className="text-lg font-medium text-white">Autosaving...</div>
            </div>
          )}

          <Stage
            width={window.innerWidth - 64} // minus toolbar width
            height={window.innerHeight - 64} // minus header height
            onWheel={handleWheel}
            draggable={effectiveTool === 'pan'}
            scaleX={stageScale}
            scaleY={stageScale}
            x={stageX}
            y={stageY}
            ref={stageRef}
            onClick={handleStageClick}
            onMouseMove={handleMouseMove}
          >
            <Layer>
              {/* White A3 Canvas Background */}
              <Rect
                x={0}
                y={0}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                fill="white"
                name="background"
                shadowColor="black"
                shadowBlur={20} shadowEnabled={shadowsEnabled}
                shadowOpacity={0.5}
                shadowOffsetX={10}
                shadowOffsetY={10}
              />
              
              {/* Reference Image */}
              {isRefVisible && refImageObj && (
                <>
                  <Image
                    ref={refImageNode}
                    image={refImageObj}
                    x={refConfig.x}
                    y={refConfig.y}
                    width={refConfig.width}
                    height={refConfig.height}
                    rotation={refConfig.rotation}
                    scaleX={refConfig.scaleX || 1}
                    scaleY={refConfig.scaleY || 1}
                    opacity={isRefEditing ? 0.8 : refOpacity / 100}
                    draggable={isRefEditing}
                    onDragEnd={(e) => {
                      setRefConfig({
                        ...refConfig,
                        x: e.target.x(),
                        y: e.target.y(),
                      });
                    }}
                    onTransformEnd={(e) => {
                      const node = refImageNode.current;
                      setRefConfig({
                        ...refConfig,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        scaleX: node.scaleX(),
                        scaleY: node.scaleY(),
                      });
                    }}
                  />
                  {isRefEditing && (
                    <Transformer 
                      ref={trRef}
                      boundBoxFunc={(oldBox, newBox) => {
                        if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) {
                          return oldBox;
                        }
                        return newBox;
                      }}
                    />
                  )}
                </>
              )}

              {/* Roads and Boundaries */}

              {/* 1. Road Outer Borders */}
              {roads.filter(r => r.type === 'road' || r.type === 'bad_road').map((road) => (
                <Group key={'border_' + road.id}>
                  <Line
                    points={road.points}
                    stroke="#333"
                    strokeWidth={20}
                    lineCap="round"
                    lineJoin="round"
                    tension={0.4}
                    closed={road.isClosed}
                    dash={road.type === 'bad_road' ? [20, 20] : undefined}
                    fillEnabled={false}
                    onClick={() => {
                      if (effectiveTool === 'select') setSelectedRoadId(road.id);
                      else if (effectiveTool === 'eraser') {
                        handleUpdateRoads(roads.filter(r => r.id !== road.id));
                        if (selectedRoadId === road.id) setSelectedRoadId(null);
                      }
                    }}
                    hitStrokeWidth={40}
                  />
                </Group>
              ))}
              {/* 2. Road Inner Fills */}
              {roads.filter(r => r.type === 'road' || r.type === 'bad_road').map((road) => (
                <Group key={'fill_' + road.id}>
                  <Line
                    points={road.points}
                    stroke="#f4f4f5"
                    strokeWidth={16}
                    lineCap="round"
                    lineJoin="round"
                    tension={0.4}
                    closed={road.isClosed}
                    listening={false}
                  />
                </Group>
              ))}
              {/* 3. Road Dashed Lines */}
              {roads.filter(r => r.type === 'road' || r.type === 'bad_road').map((road) => (
                <Group key={'dash_' + road.id}>
                  <Line
                    points={road.points}
                    stroke="#ccc"
                    strokeWidth={2}
                    dash={[10, 10]}
                    tension={0.4}
                    closed={road.isClosed}
                    listening={false}
                  />
                </Group>
              ))}

              {roads.map((road) => {
                const type = road.type || 'road';
                return (
                <Group key={road.id}>
                  {type === 'road' || type === 'bad_road' ? null : type === 'boundary' || !type ? (
                    <>
                      {/* Boundary Line */}
                      <Line
                        points={road.points}
                        stroke={boundaryColor}
                        strokeWidth={12}
                        lineCap="round"
                        lineJoin="round"
                        tension={0.4}
                        closed={road.isClosed}
                        fillEnabled={false}
                        onClick={() => {
                          if (effectiveTool === 'select') {
                            setSelectedRoadId(road.id);
                          } else if (effectiveTool === 'eraser') {
                            handleUpdateRoads(roads.filter(r => r.id !== road.id));
                            if (selectedRoadId === road.id) setSelectedRoadId(null);
                          }
                        }}
                        hitStrokeWidth={30}
                      />
                    </>
                  ) : type === 'path' ? (
                    <>
                      {/* Path Line */}
                      <Line
                        points={road.points}
                        stroke="#333"
                        strokeWidth={4}
                        lineCap="round"
                        lineJoin="round"
                        tension={0.4}
                        closed={road.isClosed}
                        dash={[10, 10]}
                        fillEnabled={false}
                        onClick={() => {
                          if (effectiveTool === 'select') {
                            setSelectedRoadId(road.id);
                          } else if (effectiveTool === 'eraser') {
                            handleUpdateRoads(roads.filter(r => r.id !== road.id));
                            if (selectedRoadId === road.id) setSelectedRoadId(null);
                          }
                        }}
                        hitStrokeWidth={20}
                      />
                    </>
                  ) : type === 'pond' ? (
                    <>
                      {/* Pond Line/Fill */}
                      <Line
                        points={road.points}
                        stroke="#0ea5e9"
                        strokeWidth={6}
                        lineCap="round"
                        lineJoin="round"
                        tension={0.4}
                        closed={road.isClosed}
                        fillPatternImage={waterPattern}
                        fillPatternRepeat="repeat"
                        fillEnabled={road.isClosed}
                        onClick={() => {
                          if (effectiveTool === 'select') {
                            setSelectedRoadId(road.id);
                          } else if (effectiveTool === 'eraser') {
                            handleUpdateRoads(roads.filter(r => r.id !== road.id));
                            if (selectedRoadId === road.id) setSelectedRoadId(null);
                          }
                        }}
                        hitStrokeWidth={20}
                      />
                    </>
                  ) : type === 'river' ? (
                    <Group>
                      {/* Base River */}
                      <Line
                        points={road.points}
                        stroke="#0ea5e9"
                        strokeWidth={16}
                        lineCap="round"
                        lineJoin="round"
                        tension={0.4}
                        closed={road.isClosed}
                        fillEnabled={false}
                        onClick={() => {
                          if (effectiveTool === 'select') setSelectedRoadId(road.id);
                          else if (effectiveTool === 'eraser') handleUpdateRoads(roads.filter(r => r.id !== road.id));
                        }}
                        hitStrokeWidth={30}
                      />

                      {/* Water Flow Ripple Lines */}
                      <Line
                        points={road.points}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                        dash={[5, 20, 10, 10]}
                        lineCap="round"
                        lineJoin="round"
                        tension={0.4}
                        closed={road.isClosed}
                        listening={false}
                        opacity={0.6}
                        x={-4}
                        y={-4}
                      />
                      <Line
                        points={road.points}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                        dash={[15, 15, 5, 15]}
                        lineCap="round"
                        lineJoin="round"
                        tension={0.4}
                        closed={road.isClosed}
                        listening={false}
                        opacity={0.8}
                      />
                      <Line
                        points={road.points}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                        dash={[10, 15, 20, 5]}
                        lineCap="round"
                        lineJoin="round"
                        tension={0.4}
                        closed={road.isClosed}
                        listening={false}
                        opacity={0.6}
                        x={4}
                        y={4}
                      />
                    </Group>
                  ) : type === 'canal' ? (
                    <Group>
                      <Line
                        points={road.points}
                        stroke="#0ea5e9"
                        strokeWidth={16}
                        lineCap="butt"
                        lineJoin="miter"
                        tension={0}
                        closed={road.isClosed}
                        fillEnabled={false}
                        onClick={() => {
                          if (effectiveTool === 'select') setSelectedRoadId(road.id);
                          else if (effectiveTool === 'eraser') handleUpdateRoads(roads.filter(r => r.id !== road.id));
                        }}
                        hitStrokeWidth={30}
                      />
                      <Line
                        points={road.points}
                        stroke="#ffffff"
                        strokeWidth={12}
                        lineCap="butt"
                        lineJoin="miter"
                        tension={0}
                        closed={road.isClosed}
                        fillEnabled={false}
                        listening={false}
                      />
                    </Group>
                  ) : type === 'railway' ? (
                    <>
                      {/* Railway Ties / Sleepers (Thick dashed line) */}
                      <Line
                        points={road.points}
                        stroke="#333"
                        strokeWidth={24} // Length of the ties
                        lineCap="butt"
                        lineJoin="miter"
                        tension={0.4}
                        closed={road.isClosed}
                        dash={[3, 20]} // 3px thick
                        fillEnabled={false}
                        onClick={() => {
                          if (effectiveTool === 'select') {
                            setSelectedRoadId(road.id);
                          } else if (effectiveTool === 'eraser') {
                            handleUpdateRoads(roads.filter(r => r.id !== road.id));
                            if (selectedRoadId === road.id) setSelectedRoadId(null);
                          }
                        }}
                        hitStrokeWidth={30}
                      />
                      {/* Railway Spine (Thin solid line) */}
                      <Line
                        points={road.points}
                        stroke="#333"
                        strokeWidth={3} // 3px thick (matches dash)
                        lineCap="butt"
                        lineJoin="miter"
                        tension={0.4}
                        closed={road.isClosed}
                        listening={false}
                      />
                    </>
                  ) : type === 'house' ? (
                    <Group
                      x={road.x}
                      y={road.y}
                      draggable={effectiveTool === 'select'}
                      onClick={() => {
                        if (effectiveTool === 'eraser') {
                          handleUpdateRoads(roads.filter(r => r.id !== road.id));
                        }
                      }}
                      onDblClick={() => {
                        if (effectiveTool === 'select') {
                          setHouseModal({ isOpen: true, x: road.x, y: road.y, tool: road.type, editingId: road.id });
                          setHouseData({ number: road.number, isNonResidential: road.isNonResidential || false, purposeNumber: road.purposeNumber || '', isMultipleNumbers: road.isMultipleNumbers || false, endingNumber: road.endingNumber || '' });
                        }
                      }}
                      onDragEnd={(e) => {
                        setRoads(prev => {
                          const newRoads = prev.map(r => r.id === road.id ? { ...r, x: e.target.x(), y: e.target.y() } : r);
                          pushToHistory(newRoads);
                          return newRoads;
                        });
                      }}
                    >
                      <Rect
                        x={-houseSize / 2}
                        y={-houseSize / 2}
                        width={houseSize}
                        height={houseSize}
                        fill={road.isNonResidential ? (hatchPattern ? undefined : "#d1d5db") : "#ffffff"}
                        fillPatternImage={road.isNonResidential ? hatchPattern : null}
                        fillPatternRepeat="repeat"
                        stroke={road.isNonResidential ? "#4b5563" : "#374151"}
                        strokeWidth={Math.max(2, houseSize * 0.08)}
                        cornerRadius={Math.max(2, houseSize * 0.12)}
                        shadowColor="black"
                        shadowBlur={10} shadowEnabled={shadowsEnabled} perfectDrawEnabled={false}
                        shadowOpacity={0.2}
                        shadowOffsetY={5}
                      />
                      
                      <Text
                        text={road.isMultipleNumbers && road.endingNumber ? `${road.number} - ${road.endingNumber}` : road.number}
                        x={-houseSize / 2}
                        y={-houseSize * 0.16}
                        width={houseSize}
                        align="center"
                        fontSize={houseSize * (houseTextScale / 100)}
                        fontStyle="bold" listening={false}
                        fill="#111827"
                      />
                      {road.purposeNumber && (
                        <Text
                          text={road.purposeNumber}
                          x={-houseSize / 2}
                          y={houseSize * 0.55}
                          width={houseSize}
                          align="center"
                          fontSize={houseSize * (purposeTextScale / 100)}
                          fill="#4b5563" listening={false}
                        />
                      )}
                    </Group>
                  ) : type === 'bad_house' ? (
                    <Group
                      x={road.x}
                      y={road.y}
                      draggable={effectiveTool === 'select'}
                      onClick={() => {
                        if (effectiveTool === 'eraser') {
                          handleUpdateRoads(roads.filter(r => r.id !== road.id));
                        }
                      }}
                      onDblClick={() => {
                        if (effectiveTool === 'select') {
                          setHouseModal({ isOpen: true, x: road.x, y: road.y, tool: road.type, editingId: road.id });
                          setHouseData({ number: road.number, isNonResidential: road.isNonResidential || false, purposeNumber: road.purposeNumber || '', isMultipleNumbers: road.isMultipleNumbers || false, endingNumber: road.endingNumber || '' });
                        }
                      }}
                      onDragEnd={(e) => {
                        setRoads(prev => {
                          const newRoads = prev.map(r => r.id === road.id ? { ...r, x: e.target.x(), y: e.target.y() } : r);
                          pushToHistory(newRoads);
                          return newRoads;
                        });
                      }}
                    >
                      <RegularPolygon
                        sides={3}
                        radius={houseSize / 1.5}
                        fill={road.isNonResidential ? (hatchPattern ? undefined : "#d1d5db") : "#ffffff"}
                        fillPatternImage={road.isNonResidential ? hatchPattern : null}
                        fillPatternRepeat="repeat"
                        stroke={road.isNonResidential ? "#4b5563" : "#374151"}
                        strokeWidth={Math.max(2, houseSize * 0.08)}
                        shadowColor="black"
                        shadowBlur={10} shadowEnabled={shadowsEnabled} perfectDrawEnabled={false}
                        shadowOpacity={0.2}
                        shadowOffsetY={5}
                      />
                      <Text
                        text={road.isMultipleNumbers && road.endingNumber ? `${road.number} - ${road.endingNumber}` : road.number}
                        x={-houseSize / 2}
                        y={0}
                        width={houseSize}
                        align="center"
                        fontSize={houseSize * (houseTextScale / 100)}
                        fontStyle="bold" listening={false}
                        fill="#111827"
                      />
                      {road.purposeNumber && (
                        <Text
                          text={road.purposeNumber}
                          x={-houseSize / 2}
                          y={houseSize * 0.7}
                          width={houseSize}
                          align="center"
                          fontSize={houseSize * (purposeTextScale / 100)}
                          fill="#4b5563" listening={false}
                        />
                      )}
                    </Group>
                  ) : type === 'temple' ? (
                    <Group
                      x={road.x}
                      y={road.y}
                      draggable={effectiveTool === 'select'}
                      onClick={() => {
                        if (effectiveTool === 'eraser') {
                          handleUpdateRoads(roads.filter(r => r.id !== road.id));
                        }
                      }}
                      onDblClick={() => {
                        if (effectiveTool === 'select') {
                          setHouseModal({ isOpen: true, x: road.x, y: road.y, tool: road.type, editingId: road.id });
                          setHouseData({ number: road.number, isNonResidential: road.isNonResidential || false, purposeNumber: road.purposeNumber || '', isMultipleNumbers: road.isMultipleNumbers || false, endingNumber: road.endingNumber || '' });
                        }
                      }}
                      onDragEnd={(e) => {
                        setRoads(prev => {
                          const newRoads = prev.map(r => r.id === road.id ? { ...r, x: e.target.x(), y: e.target.y() } : r);
                          pushToHistory(newRoads);
                          return newRoads;
                        });
                      }}
                    >
                      {/* Flag pole */}
                      <Line
                        points={[0, -houseSize * 0.3, 0, -houseSize * 0.8]}
                        stroke="#374151"
                        listening={false}
                        strokeWidth={Math.max(2, houseSize * 0.05)}
                      />
                      {/* Flag */}
                      <Line
                        points={[0, -houseSize * 0.8, houseSize * 0.4, -houseSize * 0.65, 0, -houseSize * 0.5]}
                        stroke="#374151"
                        listening={false}
                        strokeWidth={Math.max(2, houseSize * 0.05)}
                        fill="#ffffff"
                        closed={true}
                      />
                      {/* Top Tier */}
                      <Rect
                        x={-houseSize * 0.35}
                        y={-houseSize * 0.3}
                        listening={false}
                        width={houseSize * 0.7}
                        height={houseSize * 0.2}
                        fill="#ffffff"
                        stroke="#374151"
                        strokeWidth={Math.max(2, houseSize * 0.08)}
                      />
                      {/* Base */}
                      <Rect
                        x={-houseSize / 2}
                        y={-houseSize * 0.1}
                        width={houseSize}
                        height={houseSize * 0.6}
                        fill="#ffffff"
                        stroke="#374151"
                        strokeWidth={Math.max(2, houseSize * 0.08)}
                      />
                      {/* Door */}
                      <Rect
                        x={-houseSize * 0.15}
                        y={houseSize * 0.2}
                        width={houseSize * 0.3}
                        height={houseSize * 0.3}
                        stroke="#374151"
                        strokeWidth={Math.max(2, houseSize * 0.08)}
                      />
                      <Text
                        text={road.isMultipleNumbers && road.endingNumber ? `${road.number} - ${road.endingNumber}` : road.number}
                        x={-houseSize / 2}
                        y={houseSize * 0.6} // Below the temple
                        width={houseSize}
                        align="center"
                        fontSize={houseSize * (houseTextScale / 100)}
                        fontStyle="bold" listening={false}
                        fill="#111827"
                      />
                      {road.purposeNumber && (
                        <Text
                          text={road.purposeNumber}
                          x={-houseSize / 2}
                          y={houseSize * 1.05}
                          width={houseSize}
                          align="center"
                          fontSize={houseSize * (purposeTextScale / 100)}
                          fill="#4b5563" listening={false}
                        />
                      )}
                    </Group>
                  ) : type === 'mosque' ? (
                    <Group
                      x={road.x} y={road.y} draggable={effectiveTool === 'select'}
                      onClick={() => { if (effectiveTool === 'eraser') handleUpdateRoads(roads.filter(r => r.id !== road.id)); }}
                      onDblClick={() => {
                        if (effectiveTool === 'select') {
                          setHouseModal({ isOpen: true, x: road.x, y: road.y, tool: road.type, editingId: road.id });
                          setHouseData({ number: road.number, isNonResidential: false, purposeNumber: road.purposeNumber || '', isMultipleNumbers: road.isMultipleNumbers || false, endingNumber: road.endingNumber || '' });
                        }
                      }}
                      onDragEnd={(e) => {
                        setRoads(prev => {
                          const newRoads = prev.map(r => r.id === road.id ? { ...r, x: e.target.x(), y: e.target.y() } : r);
                          pushToHistory(newRoads);
                          return newRoads;
                        });
                      }}
                    >
                      {/* Dome */}
                      <Arc x={0} y={-houseSize * 0.1} innerRadius={0} outerRadius={houseSize * 0.35} angle={180} rotation={180} fill="#ffffff" stroke="#374151" strokeWidth={Math.max(2, houseSize * 0.08)} />
                      {/* Base */}
                      <Rect x={-houseSize / 2} y={-houseSize * 0.1} width={houseSize} height={houseSize * 0.6} fill="#ffffff" stroke="#374151" strokeWidth={Math.max(2, houseSize * 0.08)} />
                      {/* Door */}
                      <Rect x={-houseSize * 0.15} y={houseSize * 0.2} width={houseSize * 0.3} height={houseSize * 0.3} stroke="#374151" strokeWidth={Math.max(2, houseSize * 0.08)} />
                      {/* Minaret */}
                      <Rect x={houseSize * 0.4} y={-houseSize * 0.6} width={houseSize * 0.15} height={houseSize * 0.8} fill="#ffffff" stroke="#374151" strokeWidth={Math.max(2, houseSize * 0.05)} />
                      <RegularPolygon x={houseSize * 0.475} y={-houseSize * 0.6} sides={3} radius={houseSize * 0.15} fill="#ffffff" stroke="#374151" strokeWidth={Math.max(2, houseSize * 0.05)} />
                      {/* Number Text */}
                      <Text text={road.isMultipleNumbers && road.endingNumber ? `${road.number} - ${road.endingNumber}` : road.number} x={-houseSize / 2} y={houseSize * 0.6} width={houseSize} align="center" fontSize={houseSize * (houseTextScale / 100)} fontStyle="bold" listening={false} fill="#111827" />
                      {road.purposeNumber && (
                        <Text text={road.purposeNumber} x={-houseSize / 2} y={houseSize * 1.05} width={houseSize} align="center" fontSize={houseSize * (purposeTextScale / 100)} fill="#4b5563" listening={false} />
                      )}
                    </Group>
                  ) : type === 'church' ? (
                    <Group
                      x={road.x} y={road.y} draggable={effectiveTool === 'select'}
                      onClick={() => { if (effectiveTool === 'eraser') handleUpdateRoads(roads.filter(r => r.id !== road.id)); }}
                      onDblClick={() => {
                        if (effectiveTool === 'select') {
                          setHouseModal({ isOpen: true, x: road.x, y: road.y, tool: road.type, editingId: road.id });
                          setHouseData({ number: road.number, isNonResidential: false, purposeNumber: road.purposeNumber || '', isMultipleNumbers: road.isMultipleNumbers || false, endingNumber: road.endingNumber || '' });
                        }
                      }}
                      onDragEnd={(e) => {
                        setRoads(prev => {
                          const newRoads = prev.map(r => r.id === road.id ? { ...r, x: e.target.x(), y: e.target.y() } : r);
                          pushToHistory(newRoads);
                          return newRoads;
                        });
                      }}
                    >
                      {/* Roof */}
                      <Line points={[-houseSize * 0.6, -houseSize * 0.1, 0, -houseSize * 0.6, houseSize * 0.6, -houseSize * 0.1]} stroke="#374151" strokeWidth={Math.max(2, houseSize * 0.08)} fill="#ffffff" closed={true} />
                      {/* Base */}
                      <Rect x={-houseSize / 2} y={-houseSize * 0.1} width={houseSize} height={houseSize * 0.6} fill="#ffffff" stroke="#374151" strokeWidth={Math.max(2, houseSize * 0.08)} />
                      {/* Door */}
                      <Rect x={-houseSize * 0.15} y={houseSize * 0.2} width={houseSize * 0.3} height={houseSize * 0.3} stroke="#374151" strokeWidth={Math.max(2, houseSize * 0.08)} />
                      {/* Cross */}
                      <Line points={[0, -houseSize * 0.6, 0, -houseSize]} stroke="#374151" strokeWidth={Math.max(2, houseSize * 0.05)} />
                      <Line points={[-houseSize * 0.15, -houseSize * 0.85, houseSize * 0.15, -houseSize * 0.85]} stroke="#374151" strokeWidth={Math.max(2, houseSize * 0.05)} />
                      {/* Number Text */}
                      <Text text={road.isMultipleNumbers && road.endingNumber ? `${road.number} - ${road.endingNumber}` : road.number} x={-houseSize / 2} y={houseSize * 0.6} width={houseSize} align="center" fontSize={houseSize * (houseTextScale / 100)} fontStyle="bold" listening={false} fill="#111827" />
                      {road.purposeNumber && (
                        <Text text={road.purposeNumber} x={-houseSize / 2} y={houseSize * 1.05} width={houseSize} align="center" fontSize={houseSize * (purposeTextScale / 100)} fill="#4b5563" listening={false} />
                      )}
                    </Group>
                  ) : type === 'gurudwara' ? (
                    <Group
                      x={road.x} y={road.y} draggable={effectiveTool === 'select'}
                      onClick={() => { if (effectiveTool === 'eraser') handleUpdateRoads(roads.filter(r => r.id !== road.id)); }}
                      onDblClick={() => {
                        if (effectiveTool === 'select') {
                          setHouseModal({ isOpen: true, x: road.x, y: road.y, tool: road.type, editingId: road.id });
                          setHouseData({ number: road.number, isNonResidential: false, purposeNumber: road.purposeNumber || '', isMultipleNumbers: road.isMultipleNumbers || false, endingNumber: road.endingNumber || '' });
                        }
                      }}
                      onDragEnd={(e) => {
                        setRoads(prev => {
                          const newRoads = prev.map(r => r.id === road.id ? { ...r, x: e.target.x(), y: e.target.y() } : r);
                          pushToHistory(newRoads);
                          return newRoads;
                        });
                      }}
                    >
                      {/* Base */}
                      <Rect x={-houseSize * 0.6} y={-houseSize * 0.1} width={houseSize * 1.2} height={houseSize * 0.6} fill="#ffffff" stroke="#374151" strokeWidth={Math.max(2, houseSize * 0.08)} />
                      {/* Door */}
                      <Rect x={-houseSize * 0.15} y={houseSize * 0.2} width={houseSize * 0.3} height={houseSize * 0.3} stroke="#374151" strokeWidth={Math.max(2, houseSize * 0.08)} />
                      {/* Main Dome */}
                      <Arc x={0} y={-houseSize * 0.1} innerRadius={0} outerRadius={houseSize * 0.3} angle={180} rotation={180} fill="#ffffff" stroke="#374151" strokeWidth={Math.max(2, houseSize * 0.08)} />
                      {/* Side Domes */}
                      <Arc x={-houseSize * 0.45} y={-houseSize * 0.1} innerRadius={0} outerRadius={houseSize * 0.15} angle={180} rotation={180} fill="#ffffff" stroke="#374151" strokeWidth={Math.max(2, houseSize * 0.08)} />
                      <Arc x={houseSize * 0.45} y={-houseSize * 0.1} innerRadius={0} outerRadius={houseSize * 0.15} angle={180} rotation={180} fill="#ffffff" stroke="#374151" strokeWidth={Math.max(2, houseSize * 0.08)} />
                      {/* Flag */}
                      <Line points={[houseSize * 0.6, 0, houseSize * 0.6, -houseSize * 0.8]} stroke="#374151" strokeWidth={Math.max(2, houseSize * 0.05)} />
                      <RegularPolygon x={houseSize * 0.6} y={-houseSize * 0.8} sides={3} radius={houseSize * 0.15} fill="#ffffff" stroke="#374151" strokeWidth={Math.max(2, houseSize * 0.05)} rotation={30} />
                      {/* Number Text */}
                      <Text text={road.isMultipleNumbers && road.endingNumber ? `${road.number} - ${road.endingNumber}` : road.number} x={-houseSize / 2} y={houseSize * 0.6} width={houseSize} align="center" fontSize={houseSize * (houseTextScale / 100)} fontStyle="bold" listening={false} fill="#111827" />
                      {road.purposeNumber && (
                        <Text text={road.purposeNumber} x={-houseSize / 2} y={houseSize * 1.05} width={houseSize} align="center" fontSize={houseSize * (purposeTextScale / 100)} fill="#4b5563" listening={false} />
                      )}
                    </Group>
                  ) : type === 'text' ? (
                    <Group
                      ref={(node) => { shapeRefs.current[road.id] = node; }}
                      x={road.x} y={road.y} rotation={road.rotation || 0}
                      scaleX={road.scaleX || 1} scaleY={road.scaleY || 1}
                      draggable={effectiveTool === 'select'}
                      onClick={() => { 
                        if (effectiveTool === 'eraser') handleUpdateRoads(roads.filter(r => r.id !== road.id)); 
                        else if (effectiveTool === 'select') setSelectedRoadId(road.id);
                      }}
                      onDblClick={() => {
                        if (effectiveTool === 'select') {
                          setHouseModal({ isOpen: true, x: road.x, y: road.y, tool: road.type, editingId: road.id });
                          setHouseData({ number: road.number, isNonResidential: false, textSize: road.textSize || 12, purposeNumber: road.purposeNumber || '', isMultipleNumbers: road.isMultipleNumbers || false, endingNumber: road.endingNumber || '', rotation: road.rotation || 0 });
                        }
                      }}
                      onDragEnd={(e) => {
                        setRoads(prev => {
                          const newRoads = prev.map(r => r.id === road.id ? { ...r, x: e.target.x(), y: e.target.y() } : r);
                          pushToHistory(newRoads);
                          return newRoads;
                        });
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        setRoads(prev => {
                          const newRoads = prev.map(r => r.id === road.id ? {
                            ...r,
                            x: node.x(),
                            y: node.y(),
                            rotation: node.rotation(),
                            scaleX: node.scaleX(),
                            scaleY: node.scaleY()
                          } : r);
                          pushToHistory(newRoads);
                          return newRoads;
                        });
                      }}
                    >
                      <Text text={road.number} x={-houseSize * 5} y={-houseSize * 0.2} width={houseSize * 10} align="center" fontSize={road.textSize || 12} fontStyle="bold" fill="#111827" />
                    </Group>
                  
) : type === 'well' ? (
                    <Group
                      ref={(node) => { shapeRefs.current[road.id] = node; }}
                      x={road.x} y={road.y} rotation={road.rotation || 0}
                      scaleX={road.scaleX || 1} scaleY={road.scaleY || 1}
                      draggable={effectiveTool === 'select'}
                      onClick={() => { 
                        if (effectiveTool === 'eraser') handleUpdateRoads(roads.filter(r => r.id !== road.id)); 
                        else if (effectiveTool === 'select') setSelectedRoadId(road.id);
                      }}
                      onDragEnd={(e) => {
                        setRoads(prev => {
                          const newRoads = prev.map(r => r.id === road.id ? { ...r, x: e.target.x(), y: e.target.y() } : r);
                          pushToHistory(newRoads);
                          return newRoads;
                        });
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        setRoads(prev => {
                          const newRoads = prev.map(r => r.id === road.id ? {
                            ...r, x: node.x(), y: node.y(), rotation: node.rotation(), scaleX: node.scaleX(), scaleY: node.scaleY()
                          } : r);
                          pushToHistory(newRoads);
                          return newRoads;
                        });
                      }}
                    >
                      <Circle x={0} y={0} radius={houseSize * 0.25} stroke="#374151" strokeWidth={Math.max(2, houseSize * 0.05)} fill="#ffffff" />
                      <Circle x={0} y={0} radius={houseSize * 0.05} fill="#374151" listening={false} />
                    </Group>
                  ) : type === 'pipe' ? (
                    <Group
                      ref={(node) => { shapeRefs.current[road.id] = node; }}
                      x={road.x} y={road.y} rotation={road.rotation || 0}
                      scaleX={road.scaleX || 1} scaleY={road.scaleY || 1}
                      draggable={effectiveTool === 'select'}
                      onClick={() => { 
                        if (effectiveTool === 'eraser') handleUpdateRoads(roads.filter(r => r.id !== road.id)); 
                        else if (effectiveTool === 'select') setSelectedRoadId(road.id);
                      }}
                      onDragEnd={(e) => {
                        setRoads(prev => {
                          const newRoads = prev.map(r => r.id === road.id ? { ...r, x: e.target.x(), y: e.target.y() } : r);
                          pushToHistory(newRoads);
                          return newRoads;
                        });
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        setRoads(prev => {
                          const newRoads = prev.map(r => r.id === road.id ? {
                            ...r, x: node.x(), y: node.y(), rotation: node.rotation(), scaleX: node.scaleX(), scaleY: node.scaleY()
                          } : r);
                          pushToHistory(newRoads);
                          return newRoads;
                        });
                      }}
                    >
                      {/* Vertical Pipe */}
                      <Rect x={-houseSize * 0.05} y={-houseSize * 0.1} width={houseSize * 0.1} height={houseSize * 0.3} fill="#94a3b8" stroke="#334155" strokeWidth={Math.max(1, houseSize * 0.03)} />
                      {/* Horizontal Pipe */}
                      <Rect x={-houseSize * 0.05} y={-houseSize * 0.1} width={houseSize * 0.25} height={houseSize * 0.1} fill="#94a3b8" stroke="#334155" strokeWidth={Math.max(1, houseSize * 0.03)} />
                      {/* Nozzle */}
                      <Rect x={houseSize * 0.1} y={0} width={houseSize * 0.1} height={houseSize * 0.1} fill="#94a3b8" stroke="#334155" strokeWidth={Math.max(1, houseSize * 0.03)} />
                      {/* Handle Stem */}
                      <Line points={[0, -houseSize * 0.15, 0, -houseSize * 0.1]} stroke="#334155" strokeWidth={Math.max(2, houseSize * 0.04)} />
                      {/* Handle Top */}
                      <Line points={[-houseSize * 0.05, -houseSize * 0.15, houseSize * 0.05, -houseSize * 0.15]} stroke="#334155" strokeWidth={Math.max(2, houseSize * 0.04)} lineCap="round" />
                      {/* Water Drop */}
                      <Circle x={houseSize * 0.15} y={houseSize * 0.18} radius={houseSize * 0.03} fill="#0ea5e9" />
                    </Group>
                  ) : type === 'hand_pump' ? (
                    <Group
                      ref={(node) => { shapeRefs.current[road.id] = node; }}
                      x={road.x} y={road.y} rotation={road.rotation || 0}
                      scaleX={road.scaleX || 1} scaleY={road.scaleY || 1}
                      draggable={effectiveTool === 'select'}
                      onClick={() => { 
                        if (effectiveTool === 'eraser') handleUpdateRoads(roads.filter(r => r.id !== road.id)); 
                        else if (effectiveTool === 'select') setSelectedRoadId(road.id);
                      }}
                      onDragEnd={(e) => {
                        setRoads(prev => {
                          const newRoads = prev.map(r => r.id === road.id ? { ...r, x: e.target.x(), y: e.target.y() } : r);
                          pushToHistory(newRoads);
                          return newRoads;
                        });
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        setRoads(prev => {
                          const newRoads = prev.map(r => r.id === road.id ? {
                            ...r, x: node.x(), y: node.y(), rotation: node.rotation(), scaleX: node.scaleX(), scaleY: node.scaleY()
                          } : r);
                          pushToHistory(newRoads);
                          return newRoads;
                        });
                      }}
                    >
                      {/* Base */}
                      <Rect x={-houseSize * 0.08} y={-houseSize * 0.1} width={houseSize * 0.16} height={houseSize * 0.4} fill="#64748b" stroke="#334155" strokeWidth={Math.max(1, houseSize * 0.03)} />
                      {/* Handle */}
                      <Line points={[0, houseSize * 0.0, houseSize * 0.35, -houseSize * 0.2]} stroke="#334155" strokeWidth={Math.max(2, houseSize * 0.04)} lineCap="round" />
                      {/* Spout */}
                      <Line points={[-houseSize * 0.08, houseSize * 0.1, -houseSize * 0.25, houseSize * 0.15]} stroke="#334155" strokeWidth={Math.max(2, houseSize * 0.04)} lineCap="round" />
                      <Circle x={-houseSize * 0.25} y={houseSize * 0.15} radius={houseSize * 0.03} fill="#0ea5e9" />
                    </Group>
                  ) : null}
                  
                  {/* Selection Anchors (All Vertices & Midpoints) */}
                  {selectedRoadId === road.id && (type === 'road' || type === 'boundary' || type === 'bad_road' || type === 'path' || type === 'railway' || type === 'pond' || type === 'river' || type === 'canal') && (
                    <>
                      {/* Midpoints */}
                      {Array.from({ length: road.points.length / 2 - 1 }).map((_, i) => (
                        <Circle
                          key={`mid_${i}`}
                          x={(road.points[i * 2] + road.points[i * 2 + 2]) / 2}
                          y={(road.points[i * 2 + 1] + road.points[i * 2 + 3]) / 2}
                          radius={10}
                          fill="#22c55e"
                          opacity={0.6}
                          onClick={(e) => handleAddMidpoint(road.id, i, e)}
                          onMouseEnter={(e) => { e.target.getStage().container().style.cursor = 'crosshair'; }}
                          onMouseLeave={(e) => { e.target.getStage().container().style.cursor = 'default'; }}
                        />
                      ))}
                      {/* Vertices */}
                      {Array.from({ length: road.points.length / 2 }).map((_, i) => (
                        <Circle
                          key={`vert_${i}`}
                          x={road.points[i * 2]}
                          y={road.points[i * 2 + 1]}
                          radius={12}
                          fill="#3b82f6"
                          stroke="white"
                          strokeWidth={3}
                          draggable={effectiveTool === 'select'}
                          onDragMove={(e) => handleDragPoint(road.id, i, e)}
                          onDragEnd={handleDragEnd}
                        />
                      ))}
                    </>
                  )}
                </Group>
                );
              })}

              {/* Pending Road (First Click) */}
              {pendingRoad && (
                <Circle
                  x={pendingRoad[0]}
                  y={pendingRoad[1]}
                  radius={8}
                  fill="#3b82f6"
                />
              )}
              {selectedRoadId && roads.find(r => r.id === selectedRoadId && ['text', 'well', 'pipe', 'hand_pump'].includes(r.type)) && (

                <Transformer 

                  ref={trTextRef}

                  boundBoxFunc={(oldBox, newBox) => {

                    if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) {

                      return oldBox;

                    }

                    return newBox;

                  }}

                />

              )}

            </Layer>
          </Stage>
          
          <div className="absolute bottom-6 left-6 glass-card px-4 py-2 rounded-xl text-sm text-gray-400 pointer-events-none z-10 shadow-lg">
            Scroll to Zoom | Hold Spacebar to Pan | Press Esc to deselect | Active Tool: {effectiveTool}
          </div>
          
          <div className="absolute top-6 right-6 glass-card w-12 h-12 rounded-full flex flex-col items-center justify-center pointer-events-none z-10 shadow-lg border border-white/10 bg-surface/80 backdrop-blur-md">
            <span className="text-[10px] font-bold text-red-500 leading-none mb-0.5">N</span>
            <Compass size={20} className="text-gray-300" />
          </div>
        </main>
      </div>

      {/* House Modal */}
      {houseModal.isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-white/10 rounded-xl p-6 shadow-2xl w-80 relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-white">
                {houseModal.tool === 'bad_house' ? (houseModal.editingId ? 'Edit Bad Building' : 'Add Bad Building') : 
                 houseModal.tool === 'temple' ? (houseModal.editingId ? 'Edit Temple' : 'Add Temple') : 
                 houseModal.tool === 'mosque' ? (houseModal.editingId ? 'Edit Mosque' : 'Add Mosque') : 
                 houseModal.tool === 'church' ? (houseModal.editingId ? 'Edit Church' : 'Add Church') : 
                 houseModal.tool === 'gurudwara' ? (houseModal.editingId ? 'Edit Gurudwara' : 'Add Gurudwara') : 
                 houseModal.tool === 'text' ? (houseModal.editingId ? 'Edit Text' : 'Add Text') : 
                 (houseModal.editingId ? 'Edit House' : 'Add House')}
              </h3>
              <button 
                onClick={() => {
                  setHouseModal({ isOpen: false, x: 0, y: 0, tool: 'house' });
                  setHouseData({ number: '', isNonResidential: false, textSize: 12, purposeNumber: '', isMultipleNumbers: false, endingNumber: '', rotation: 0 });
                  setActiveTool('select');
                }} 
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {houseModal.tool === 'bad_house' ? 'Bad Building Number' : 
                   houseModal.tool === 'temple' ? 'Temple Number' : 
                   houseModal.tool === 'mosque' ? 'Mosque Number' : 
                   houseModal.tool === 'church' ? 'Church Number' : 
                   houseModal.tool === 'gurudwara' ? 'Gurudwara Number' : 
                   houseModal.tool === 'text' ? 'Enter Text' : 
                   'House Number'}
                </label>
                {houseModal.tool === 'text' ? (
                  <textarea
                    value={houseData.number}
                    onChange={(e) => setHouseData({...houseData, number: e.target.value})}
                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-primary transition-colors resize-none"
                    placeholder="Enter text..."
                    rows={4}
                    autoFocus
                  />
                ) : (
                  <input 
                    type="text" 
                    value={houseData.number}
                    onChange={(e) => setHouseData({...houseData, number: e.target.value})}
                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. 101"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && houseData.number.trim() !== '') {
                        document.getElementById('place-house-btn').click();
                      }
                    }}
                  />
                )}
              </div>

              {/* Purpose Number Field */}
              {houseModal.tool !== 'text' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Purpose Number</label>
                  <input 
                    type="text" 
                    value={houseData.purposeNumber || ''}
                    onChange={(e) => setHouseData({...houseData, purposeNumber: e.target.value})}
                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. Shop, Commercial, etc."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        document.getElementById('place-house-btn').click();
                      }
                    }}
                  />
                </div>
              )}

              {/* Multiple Numbers Checkbox */}
              {houseModal.tool !== 'text' && (
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={houseData.isMultipleNumbers || false}
                      onChange={(e) => setHouseData({...houseData, isMultipleNumbers: e.target.checked})}
                      className="w-5 h-5 rounded border border-white/20 bg-[#1c1c1f] text-primary focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer appearance-none checked:bg-primary checked:border-primary"
                    />
                    {houseData.isMultipleNumbers && (
                      <svg className="w-3 h-3 text-white absolute left-1 top-1 pointer-events-none" viewBox="0 0 14 10" fill="none">
                        <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Multiple Numbers</span>
                </label>
              )}
              
              {houseData.isMultipleNumbers && houseModal.tool !== 'text' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Ending Number</label>
                  <input 
                    type="text" 
                    value={houseData.endingNumber || ''}
                    onChange={(e) => setHouseData({...houseData, endingNumber: e.target.value})}
                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. 105"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && houseData.endingNumber.trim() !== '') {
                        document.getElementById('place-house-btn').click();
                      }
                    }}
                  />
                </div>
              )}
              
              {['house', 'bad_house'].includes(houseModal.tool) && (
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={houseData.isNonResidential}
                      onChange={(e) => setHouseData({...houseData, isNonResidential: e.target.checked})}
                      className="w-5 h-5 rounded border border-white/20 bg-[#1c1c1f] text-primary focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer appearance-none checked:bg-primary checked:border-primary"
                    />
                    {houseData.isNonResidential && (
                      <svg className="w-3 h-3 text-white absolute left-1 top-1 pointer-events-none" viewBox="0 0 14 10" fill="none">
                        <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Non-Residential (Shaded)</span>
                </label>
              )}
              
              {houseModal.tool === 'text' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Text Size</label>
                  <input 
                    type="number"
                    min="1"
                    max="500"
                    value={houseData.textSize || 12}
                    onChange={(e) => setHouseData({...houseData, textSize: parseInt(e.target.value) || 12})}
                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              )}
              
              <button 
                id="place-house-btn"
                disabled={!houseData.number.trim()}
                onClick={() => {
                  if (!houseData.number.trim()) return;
                  
                  if (houseModal.editingId) {
                    const newRoads = roads.map(r => r.id === houseModal.editingId ? {
                      ...r,
                      number: houseData.number,
                      isNonResidential: houseData.isNonResidential,
                      textSize: houseData.textSize || 12,
                      purposeNumber: houseData.purposeNumber || '',
                      isMultipleNumbers: houseData.isMultipleNumbers || false,
                      endingNumber: houseData.endingNumber || '',
                      rotation: houseData.rotation || 0
                    } : r);
                    handleUpdateRoads(newRoads);
                  } else {
                    const newElement = {
                      id: `${houseModal.tool}_${Date.now()}`,
                      type: houseModal.tool,
                      x: houseModal.x,
                      y: houseModal.y,
                      number: houseData.number,
                      isNonResidential: houseData.isNonResidential,
                      textSize: houseData.textSize || 12,
                      purposeNumber: houseData.purposeNumber || '',
                      isMultipleNumbers: houseData.isMultipleNumbers || false,
                      endingNumber: houseData.endingNumber || '',
                      rotation: houseData.rotation || 0
                    };
                    handleUpdateRoads([...roads, newElement]);
                  }
                  
                  setHouseModal({ isOpen: false, x: 0, y: 0, tool: 'house' });
                  setHouseData({ number: '', isNonResidential: false, textSize: 12, purposeNumber: '', isMultipleNumbers: false, endingNumber: '', rotation: 0 });
                  setActiveTool('select');
                }}
                className="w-full bg-primary text-white font-medium py-2.5 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {houseModal.tool === 'bad_house' ? (houseModal.editingId ? 'Update Bad Building' : 'Place Bad Building') : 
                 houseModal.tool === 'temple' ? (houseModal.editingId ? 'Update Temple' : 'Place Temple') : 
                 houseModal.tool === 'mosque' ? (houseModal.editingId ? 'Update Mosque' : 'Place Mosque') : 
                 houseModal.tool === 'church' ? (houseModal.editingId ? 'Update Church' : 'Place Church') : 
                 houseModal.tool === 'gurudwara' ? (houseModal.editingId ? 'Update Gurudwara' : 'Place Gurudwara') : 
                 houseModal.tool === 'text' ? (houseModal.editingId ? 'Update Text' : 'Place Text') : 
                 (houseModal.editingId ? 'Update House' : 'Place House')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-white/10 rounded-xl p-6 shadow-2xl w-80 relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-white">Settings</h3>
              <button 
                onClick={() => setIsSettingsOpen(false)} 
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span>House Size on Map</span>
                  <span className="text-white font-medium">{houseSize}px</span>
                </label>
                <input 
                  type="range" 
                  min="20" 
                  max="150" 
                  value={houseSize}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setHouseSize(val);
                    localStorage.setItem('houseSize', val);
                  }}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span>House Number Size</span>
                  <span className="text-white font-medium">{houseTextScale}%</span>
                </label>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={houseTextScale}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setHouseTextScale(val);
                    localStorage.setItem('houseTextScale', val);
                  }}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span>Purpose Number Size</span>
                  <span className="text-white font-medium">{purposeTextScale}%</span>
                </label>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={purposeTextScale}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setPurposeTextScale(val);
                    localStorage.setItem('purposeTextScale', val);
                  }}
                  className="w-full accent-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Enable Shadows (Disable for performance)</label>
                <button
                  onClick={() => {
                    const newVal = !shadowsEnabled;
                    setShadowsEnabled(newVal);
                    localStorage.setItem('shadowsEnabled', newVal);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${shadowsEnabled ? 'bg-primary' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${shadowsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div>
                <label className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span>Autosave Interval</span>
                  <span className="text-white font-medium">{autosaveInterval > 0 ? `${autosaveInterval} mins` : 'Off'}</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="30" 
                  step="1"
                  value={autosaveInterval}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setAutosaveInterval(val);
                    localStorage.setItem('autosaveInterval', val);
                  }}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span>Reference Opacity</span>
                  <span className="text-white font-medium">{refOpacity}%</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={refOpacity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setRefOpacity(val);
                    localStorage.setItem('refOpacity', val);
                  }}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Boundary Color
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={boundaryColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBoundaryColor(val);
                      localStorage.setItem('boundaryColor', val);
                    }}
                    className="w-10 h-10 rounded border border-white/10 bg-transparent cursor-pointer"
                  />
                  <span className="text-white text-sm uppercase">{boundaryColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
