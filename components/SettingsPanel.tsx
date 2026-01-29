import React from 'react';
import { Multipliers, RoadType } from '../types';
import { ROAD_COLORS } from '../constants';

interface SettingsPanelProps {
  multipliers: Multipliers;
  onChange: (type: RoadType, value: number) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ multipliers, onChange }) => {
  return (
    <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-slate-700 z-30 w-64">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
        Terrain Costs
      </h3>
      <div className="space-y-3">
        {(Object.keys(multipliers) as RoadType[]).map((type) => (
          <div key={type} className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-300 flex items-center gap-2">
                 <div className="w-3 h-1 rounded-full" style={{ backgroundColor: ROAD_COLORS[type] }}></div>
                 {type}
              </span>
              <span className="text-slate-500 font-mono">x{multipliers[type].toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={multipliers[type]}
              onChange={(e) => onChange(type, parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPanel;