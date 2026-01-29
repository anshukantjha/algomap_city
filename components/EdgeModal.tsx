import React, { useState, useEffect } from 'react';
import { RoadType } from '../types';
import { DEFAULT_ROAD_WEIGHT, ROAD_COLORS } from '../constants';
import { Trash2 } from 'lucide-react';

interface EdgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (weight: number, type: RoadType) => void;
  onDelete?: () => void;
  initialWeight?: number;
  initialType?: RoadType;
  isEditing?: boolean;
}

const EdgeModal: React.FC<EdgeModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onDelete,
  initialWeight = DEFAULT_ROAD_WEIGHT,
  initialType = 'City',
  isEditing = false
}) => {
  const [weight, setWeight] = useState(initialWeight);
  const [type, setType] = useState<RoadType>(initialType);

  // Reset/Sync when opening
  useEffect(() => {
    if (isOpen) {
        setWeight(initialWeight);
        setType(initialType);
    }
  }, [isOpen, initialWeight, initialType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl shadow-2xl p-6 w-80 transform transition-all scale-100 border border-slate-700">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-100">{isEditing ? 'Edit Road' : 'Build Road'}</h3>
            {isEditing && onDelete && (
                <button 
                    onClick={onDelete}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Delete Road"
                >
                    <Trash2 size={18} />
                </button>
            )}
        </div>
        
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Distance (Cost)</label>
                <input 
                    type="number" 
                    min="1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={weight}
                    onChange={(e) => setWeight(parseInt(e.target.value) || 1)}
                />
                <p className="text-[10px] text-slate-500 mt-1">Calculated based on pixel distance for accuracy.</p>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Road Type</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['Highway', 'City', 'Dirt'] as RoadType[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${type === t ? 'border-blue-500 bg-blue-900/20' : 'border-transparent bg-slate-800 hover:bg-slate-700'}`}
                        >
                            <div className="w-full h-1 rounded-full mb-1" style={{ backgroundColor: ROAD_COLORS[t]}}></div>
                            <span className="text-[10px] font-medium text-slate-400">{t}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
            <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={() => onSubmit(weight, type)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/50 transition-colors"
            >
                {isEditing ? 'Save' : 'Connect'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default EdgeModal;