import React, { useRef, useState, useEffect } from 'react';
import { NodeData, EdgeData, InteractionMode, AlgoStep } from '../types';
import { NODE_ICONS, ROAD_COLORS } from '../constants';
import { Trash2 } from 'lucide-react';

interface CanvasProps {
  nodes: NodeData[];
  edges: EdgeData[];
  mode: InteractionMode;
  pan: { x: number; y: number };
  onPan: (dx: number, dy: number) => void;
  onAddNode: (type: any, x: number, y: number) => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  onConnectNodes: (sourceId: string, targetId: string) => void;
  onEdgeClick: (id: string) => void;
  onDeleteNode: (id: string) => void;
  currentStep: AlgoStep | null;
}

const Canvas: React.FC<CanvasProps> = ({
  nodes,
  edges,
  mode,
  pan,
  onPan,
  onAddNode,
  onMoveNode,
  onConnectNodes,
  onEdgeClick,
  onDeleteNode,
  currentStep
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [drawingEdgeStartId, setDrawingEdgeStartId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // In Graph Coordinates
  
  // Pan State
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 }); // Screen coords for delta calc

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeId: string } | null>(null);

  // Close context menu on global click
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Compute visualization states
  const visitedSet = new Set(currentStep?.visited || []);
  const frontierSet = new Set(currentStep?.frontier || []);
  const pathSet = new Set(currentStep?.path || []);
  const currentNode = currentStep?.current;

  // Helpers to get SVG coordinates
  const getSvgCoords = (e: React.MouseEvent | React.DragEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // --- Drag & Drop for New Nodes ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('nodeType');
    if (type) {
      const { x, y } = getSvgCoords(e);
      // Correct for Pan offset
      onAddNode(type, x - pan.x, y - pan.y);
    }
  };

  // --- Interaction Logic ---
  
  const handleMouseDown = (e: React.MouseEvent) => {
      // Background click
      if (e.button === 0) {
          setIsPanning(true);
          lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
  };

  const handleMouseDownNode = (e: React.MouseEvent, id: string) => {
    // Left click only
    if (e.button !== 0) return;
    e.stopPropagation(); // Stop propagation so we don't start panning
    if (mode === 'draw-edge') {
      setDrawingEdgeStartId(id);
    } else {
      setDraggingNodeId(id);
    }
  };
  
  const handleRightClickNode = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = getSvgCoords(e);
    // Position menu in Screen/Viewport Coords (relative to SVG container)
    setContextMenu({ x: x + 10, y: y + 10, nodeId: id });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getSvgCoords(e); // Viewport Coords
    
    // Calculate Graph Coords
    const graphX = x - pan.x;
    const graphY = y - pan.y;

    setMousePos({ x: graphX, y: graphY });

    if (isPanning) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        onPan(dx, dy);
        return;
    }

    if (draggingNodeId && mode === 'select') {
      onMoveNode(draggingNodeId, graphX, graphY);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
        setIsPanning(false);
    }
    if (drawingEdgeStartId) {
        // If we let go over empty space, cancel
        setDrawingEdgeStartId(null);
    }
    setDraggingNodeId(null);
  };

  const handleMouseUpNode = (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    if (drawingEdgeStartId && drawingEdgeStartId !== targetId) {
      onConnectNodes(drawingEdgeStartId, targetId);
    }
    setDrawingEdgeStartId(null);
    setDraggingNodeId(null);
  };

  // Render temporary line while drawing
  const renderDraftLine = () => {
    if (!drawingEdgeStartId) return null;
    const startNode = nodes.find(n => n.id === drawingEdgeStartId);
    if (!startNode) return null;
    return (
      <line
        x1={startNode.x}
        y1={startNode.y}
        x2={mousePos.x}
        y2={mousePos.y}
        stroke="#60a5fa"
        strokeWidth="2"
        strokeDasharray="5,5"
        className="pointer-events-none"
      />
    );
  };

  return (
    <div className="flex-1 relative bg-slate-950 overflow-hidden h-full">
        {/* Grid Background - moves with pan */}
        <div className="absolute inset-0 pointer-events-none opacity-10 transition-none will-change-transform"
             style={{
                backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                backgroundPosition: `${pan.x}px ${pan.y}px`
             }}
        />

      <svg
        ref={svgRef}
        className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Stop panning if leaving canvas
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Transform Group for Graph Content */}
        <g transform={`translate(${pan.x}, ${pan.y})`}>
            {/* Edges */}
            {edges.map(edge => {
            const start = nodes.find(n => n.id === edge.sourceId);
            const end = nodes.find(n => n.id === edge.targetId);
            if (!start || !end) return null;

            // Check if edge is part of the final path
            let isPathEdge = false;
            if (currentStep?.path) {
                const startIdx = currentStep.path.indexOf(start.id);
                const endIdx = currentStep.path.indexOf(end.id);
                // For undirected path, check adjacency in path array
                if (startIdx !== -1 && endIdx !== -1 && Math.abs(startIdx - endIdx) === 1) {
                    isPathEdge = true;
                }
            }

            return (
                <g 
                    key={edge.id} 
                    className="group cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); onEdgeClick(edge.id); }}
                >
                    {/* Invisible wide stroke for easier clicking */}
                    <line
                        x1={start.x}
                        y1={start.y}
                        x2={end.x}
                        y2={end.y}
                        stroke="transparent"
                        strokeWidth="15"
                    />
                <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={isPathEdge ? '#3b82f6' : ROAD_COLORS[edge.roadType]}
                    strokeWidth={isPathEdge ? 6 : 4}
                    strokeOpacity={isPathEdge ? 1 : 0.7}
                    strokeLinecap="round"
                    className="transition-all group-hover:stroke-white group-hover:stroke-opacity-100"
                />
                {/* Edge Label (Weight) */}
                <g transform={`translate(${(start.x + end.x) / 2}, ${(start.y + end.y) / 2})`}>
                    <rect x="-12" y="-9" width="24" height="18" fill="#1e293b" rx="4" className="shadow-sm group-hover:fill-slate-700" stroke="#334155" strokeWidth="1" />
                    <text
                        textAnchor="middle"
                        dy="4"
                        fontSize="11"
                        fill="#f1f5f9"
                        className="font-mono font-bold select-none pointer-events-none"
                    >
                        {edge.weight}
                    </text>
                </g>
                </g>
            );
            })}

            {renderDraftLine()}

            {/* Nodes */}
            {nodes.map(node => {
            const Icon = NODE_ICONS[node.type];
            const isVisited = visitedSet.has(node.id);
            const isCurrent = currentNode === node.id;
            const isFrontier = frontierSet.has(node.id);
            const isPath = pathSet.has(node.id);

            let strokeColor = '#334155'; // slate-700
            let strokeWidth = 2;
            let shadowClass = '';

            if (isPath) {
                strokeColor = '#3b82f6'; // blue-500
                strokeWidth = 4;
                shadowClass = 'filter drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]';
            } else if (isCurrent) {
                strokeColor = '#f59e0b'; // amber-500
                strokeWidth = 4;
                shadowClass = 'filter drop-shadow-[0_0_10px_rgba(245,158,11,0.7)]';
            } else if (isFrontier) {
                strokeColor = '#a855f7'; // purple-500
                strokeWidth = 3;
            } else if (isVisited) {
                strokeColor = '#10b981'; // green-500
                strokeWidth = 3;
            }

            return (
                <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                onMouseUp={(e) => handleMouseUpNode(e, node.id)}
                onContextMenu={(e) => handleRightClickNode(e, node.id)}
                className={`cursor-pointer transition-all duration-300 ${draggingNodeId === node.id ? 'opacity-80' : ''}`}
                >
                    {/* Node Label Below - Light text for Dark Mode */}
                    <text
                        y="38"
                        textAnchor="middle"
                        className="text-[11px] font-bold fill-slate-200 pointer-events-none uppercase tracking-wide select-none"
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}
                    >
                        {node.label}
                    </text>
                    
                    {/* Node Circle */}
                <circle
                    r="22"
                    fill="#1e293b" 
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    className={shadowClass}
                />
                
                {/* Icon */}
                <foreignObject x="-12" y="-12" width="24" height="24" className="pointer-events-none">
                    <div className="flex items-center justify-center w-full h-full text-slate-300">
                    <Icon size={18} />
                    </div>
                </foreignObject>
                </g>
            );
            })}
        </g>
      </svg>
      
      {/* Interaction Hint */}
      <div className="absolute top-4 right-4 pointer-events-none bg-slate-800/80 backdrop-blur px-3 py-1 rounded-full text-xs text-slate-300 border border-slate-700 shadow-lg">
         Mode: <span className="font-bold text-blue-400 uppercase">{mode === 'select' ? 'Move' : 'Draw'}</span>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="absolute bg-slate-800 border border-slate-700 shadow-xl rounded-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => { onDeleteNode(contextMenu.nodeId); setContextMenu(null); }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-400 hover:bg-slate-700 w-full text-left"
          >
            <Trash2 size={14} />
            Delete Node
          </button>
        </div>
      )}
    </div>
  );
};

export default Canvas;