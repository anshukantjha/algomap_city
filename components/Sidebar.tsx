import React from 'react';
import { NODE_ICONS } from '../constants';
import { NodeType } from '../types';

const Sidebar: React.FC = () => {
  const handleDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('nodeType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="w-24 bg-slate-900/90 backdrop-blur shadow-xl border-l border-slate-800 flex flex-col items-center py-6 h-full overflow-y-auto custom-scrollbar z-20">
      <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Palette</h3>
      <div className="flex flex-col gap-4">
        {(Object.keys(NODE_ICONS) as NodeType[]).map((type) => {
          const Icon = NODE_ICONS[type];
          return (
            <div
              key={type}
              draggable
              onDragStart={(e) => handleDragStart(e, type)}
              className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing group hover:scale-110 transition-transform"
              title={`Drag to add ${type}`}
            >
              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-slate-700 group-hover:bg-blue-900/30 group-hover:border-blue-500/50 group-hover:shadow-md transition-all">
                <Icon size={24} className="text-slate-400 group-hover:text-blue-400" />
              </div>
              <span className="text-[10px] font-medium text-slate-500 group-hover:text-blue-400">{type}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;