import React from 'react';
import { AlgoStep, NodeData } from '../types';

interface DataTableProps {
  step: AlgoStep | null;
  nodes: NodeData[];
}

const DataTable: React.FC<DataTableProps> = ({ step, nodes }) => {
  // Sort nodes by label for consistent table order
  const sortedNodes = [...nodes].sort((a, b) => a.label.localeCompare(b.label, undefined, {numeric: true}));

  return (
    <div className="absolute bottom-6 left-6 w-96 flex flex-col bg-slate-900/90 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 z-30 transition-all">
      <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 rounded-t-xl flex justify-between items-center flex-shrink-0">
        <h3 className="font-bold text-slate-200 text-sm">Trace Table</h3>
        {step && (
             <div className="flex gap-2 text-[10px]">
                 <span className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 rounded-full bg-green-500"></div>Vis</span>
                 <span className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 rounded-full bg-amber-500"></div>Cur</span>
                 <span className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Path</span>
             </div>
        )}
      </div>
      
      {/* Fixed height container for scrollable body */}
      <div className="relative h-64 overflow-hidden rounded-b-xl">
        <div className="overflow-y-auto custom-scrollbar h-full">
            <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-900 sticky top-0 z-10 shadow-md">
                <tr>
                <th className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-800 border-b border-slate-700">Node</th>
                <th className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-800 border-b border-slate-700">Dist</th>
                <th className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-800 border-b border-slate-700">Prev</th>
                <th className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-800 border-b border-slate-700">State</th>
                </tr>
            </thead>
            <tbody>
                {!step && (
                    <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-xs italic">
                            Press "Run" to start.
                        </td>
                    </tr>
                )}
                {step && sortedNodes.map(node => {
                const dist = step.distances[node.id];
                const prevId = step.previous[node.id];
                const prevLabel = prevId ? nodes.find(n => n.id === prevId)?.label : '-';
                
                const isVisited = step.visited.includes(node.id);
                const isCurrent = step.current === node.id;
                const isFrontier = step.frontier.includes(node.id);
                const isPath = step.path?.includes(node.id);

                let rowClass = "border-b border-slate-800 text-slate-300 hover:bg-slate-800/50 transition-colors";
                let badge = <span className="text-slate-600">-</span>;

                if (isPath) {
                    rowClass = "bg-blue-900/20 border-b border-blue-900/30 text-blue-100";
                    badge = <span className="text-blue-400 font-bold">Path</span>
                } else if (isCurrent) {
                    rowClass = "bg-amber-900/20 border-b border-amber-900/30 font-medium text-amber-100";
                    badge = <span className="text-amber-500 font-bold">Curr</span>
                } else if (isVisited) {
                    badge = <span className="text-green-500 font-medium">Done</span>
                } else if (isFrontier) {
                    badge = <span className="text-purple-500 font-medium">Q</span>
                }

                return (
                    <tr key={node.id} className={rowClass}>
                    <td className="px-4 py-2 font-mono text-xs">{node.label}</td>
                    <td className="px-4 py-2 font-mono text-xs">{dist === Infinity ? '∞' : Math.round(dist * 10) / 10}</td>
                    <td className="px-4 py-2 font-mono text-xs">{prevLabel}</td>
                    <td className="px-4 py-2 text-[10px] uppercase tracking-wider">{badge}</td>
                    </tr>
                );
                })}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default DataTable;