import React from 'react';
import { Play, RotateCcw, MousePointer, Edit2, Map as MapIcon, Grid, Crosshair } from 'lucide-react';
import { AlgorithmType, InteractionMode, NodeData } from '../types';

interface ControlPanelProps {
  algorithm: AlgorithmType;
  setAlgorithm: (a: AlgorithmType) => void;
  startNodeId: string;
  endNodeId: string;
  onStartChange: (id: string) => void;
  onEndChange: (id: string) => void;
  nodes: NodeData[];
  onRun: () => void;
  onReset: () => void;
  onLoadPreset: (type: 'cityGrid' | 'complex') => void;
  onRecenter: () => void;
  isPlaying: boolean;
  mode: InteractionMode;
  setMode: (m: InteractionMode) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  algorithm,
  setAlgorithm,
  startNodeId,
  endNodeId,
  onStartChange,
  onEndChange,
  nodes,
  onRun,
  onReset,
  onLoadPreset,
  onRecenter,
  isPlaying,
  mode,
  setMode
}) => {
  // Sort nodes by label for cleaner dropdowns
  const sortedNodes = [...nodes].sort((a, b) => a.label.localeCompare(b.label, undefined, {numeric: true}));

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-6 z-30 transition-all max-w-[95vw] overflow-x-auto custom-scrollbar">
      
      {/* Presets */}
      <div className="flex bg-slate-800 rounded-lg p-1 gap-1 border border-slate-700">
        <button
            onClick={() => onLoadPreset('cityGrid')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            title="Load City Grid Map"
        >
            <Grid size={14} />
            <span>Grid</span>
        </button>
        <div className="w-px h-full bg-slate-700 mx-1"></div>
        <button
            onClick={() => onLoadPreset('complex')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            title="Load Complex Terrain Map"
        >
            <MapIcon size={14} />
            <span>Complex</span>
        </button>
      </div>

      <div className="w-px h-8 bg-slate-700 flex-shrink-0"></div>

      {/* Tools */}
      <div className="flex bg-slate-800 rounded-lg p-1 gap-1 border border-slate-700">
        <button
            onClick={() => setMode('select')}
            className={`p-2 rounded-md transition-all ${mode === 'select' ? 'bg-slate-700 shadow text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
            title="Move / Pan Mode"
        >
            <MousePointer size={18} />
        </button>
        <button
            onClick={() => setMode('draw-edge')}
            className={`p-2 rounded-md transition-all ${mode === 'draw-edge' ? 'bg-slate-700 shadow text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
            title="Draw Road Mode"
        >
            <Edit2 size={18} />
        </button>
        <button
            onClick={onRecenter}
            className="p-2 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-all"
            title="Recenter Map"
        >
            <Crosshair size={18} />
        </button>
      </div>

      <div className="w-px h-8 bg-slate-700 flex-shrink-0"></div>

      {/* Algorithm Config */}
      <div className="flex gap-4 items-center">
         <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Start</label>
            <select
                className="w-28 bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                value={startNodeId}
                onChange={(e) => onStartChange(e.target.value)}
            >
                <option value="" disabled>Select Node</option>
                {sortedNodes.map(n => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                ))}
            </select>
         </div>
         <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">End</label>
            <select
                className="w-28 bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                value={endNodeId}
                onChange={(e) => onEndChange(e.target.value)}
            >
                <option value="" disabled>Select Node</option>
                {sortedNodes.map(n => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                ))}
            </select>
         </div>
         <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Algorithm</label>
            <select 
                className="w-24 bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as AlgorithmType)}
            >
                <option value="AStar">A* Search</option>
                <option value="Dijkstra">Dijkstra</option>
            </select>
         </div>
      </div>

      <div className="w-px h-8 bg-slate-700 flex-shrink-0"></div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
            onClick={onRun}
            disabled={!startNodeId || !endNodeId || isPlaying}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs text-white shadow-lg transition-transform active:scale-95 ${(!startNodeId || !endNodeId) ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/50'}`}
        >
            <Play size={14} fill="currentColor" />
            {isPlaying ? 'Running...' : 'Run'}
        </button>
        <button
            onClick={onReset}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-red-400 transition-colors"
            title="Reset Visualization"
        >
            <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;