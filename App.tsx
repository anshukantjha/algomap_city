import React, { useState, useCallback, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import ControlPanel from './components/ControlPanel';
import DataTable from './components/DataTable';
import EdgeModal from './components/EdgeModal';
import SettingsPanel from './components/SettingsPanel';
import { NodeData, EdgeData, NodeType, RoadType, InteractionMode, AlgorithmType, AlgoStep, Multipliers } from './types';
import { generateAlgorithmSteps } from './services/algorithmService';
import { ROAD_MULTIPLIERS, DEFAULT_ROAD_WEIGHT, PRESETS } from './constants';

const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  // --- State ---
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [edges, setEdges] = useState<EdgeData[]>([]);
  const [nodeCounts, setNodeCounts] = useState<Record<string, number>>({});
  
  const [mode, setMode] = useState<InteractionMode>('select');
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('Dijkstra');
  
  const [startNodeId, setStartNodeId] = useState<string>('');
  const [endNodeId, setEndNodeId] = useState<string>('');
  
  // Algorithm Config
  const [multipliers, setMultipliers] = useState<Multipliers>({ ...ROAD_MULTIPLIERS });

  // Animation State
  const [steps, setSteps] = useState<AlgoStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Viewport / Pan State
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Modal State for Edge Creation/Editing
  const [isEdgeModalOpen, setIsEdgeModalOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<{source: string, target: string} | null>(null);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [defaultEdgeWeight, setDefaultEdgeWeight] = useState(DEFAULT_ROAD_WEIGHT);

  // --- Handlers ---

  const handleAddNode = useCallback((type: NodeType, x: number, y: number) => {
    const count = (nodeCounts[type] || 0) + 1;
    setNodeCounts(prev => ({ ...prev, [type]: count }));
    
    const newNode: NodeData = {
      id: generateId(),
      x,
      y,
      type,
      label: `${type}${count}`
    };
    
    setNodes(prev => [...prev, newNode]);
  }, [nodeCounts]);

  const handleMoveNode = useCallback((id: string, x: number, y: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
    if (steps.length > 0) handleReset();
  }, [steps.length]);

  const handleDeleteNode = useCallback((id: string) => {
    if (startNodeId === id) setStartNodeId('');
    if (endNodeId === id) setEndNodeId('');
    if (isPlaying || steps.length > 0) handleReset();

    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.sourceId !== id && e.targetId !== id));
  }, [startNodeId, endNodeId, isPlaying, steps.length]);

  const initiateConnection = useCallback((sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    
    const exists = edges.some(e => 
      (e.sourceId === sourceId && e.targetId === targetId) ||
      (e.sourceId === targetId && e.targetId === sourceId)
    );
    
    if (!exists) {
        const sourceNode = nodes.find(n => n.id === sourceId);
        const targetNode = nodes.find(n => n.id === targetId);
        let dist = DEFAULT_ROAD_WEIGHT;
        if (sourceNode && targetNode) {
            const dx = sourceNode.x - targetNode.x;
            const dy = sourceNode.y - targetNode.y;
            dist = Math.round(Math.sqrt(dx*dx + dy*dy));
        }

        setDefaultEdgeWeight(dist);
        setPendingConnection({ source: sourceId, target: targetId });
        setEditingEdgeId(null);
        setIsEdgeModalOpen(true);
    }
  }, [edges, nodes]);

  const handleEdgeClick = (id: string) => {
      setEditingEdgeId(id);
      setIsEdgeModalOpen(true);
  };

  const confirmEdgeModal = (weight: number, roadType: RoadType) => {
      if (editingEdgeId) {
          setEdges(prev => prev.map(e => e.id === editingEdgeId ? { ...e, weight, roadType } : e));
      } else if (pendingConnection) {
          const newEdge: EdgeData = {
              id: generateId(),
              sourceId: pendingConnection.source,
              targetId: pendingConnection.target,
              weight,
              roadType
          };
          setEdges(prev => [...prev, newEdge]);
      }
      setIsEdgeModalOpen(false);
      setPendingConnection(null);
      setEditingEdgeId(null);
      if (steps.length > 0) handleReset();
  };

  const deleteEdge = () => {
      if (editingEdgeId) {
          setEdges(prev => prev.filter(e => e.id !== editingEdgeId));
          setIsEdgeModalOpen(false);
          setEditingEdgeId(null);
          if (steps.length > 0) handleReset();
      }
  };

  const handleRunAlgorithm = () => {
    if (!startNodeId || !endNodeId) return;
    setCurrentStepIndex(-1);
    setIsPlaying(false);
    
    const generatedSteps = generateAlgorithmSteps(nodes, edges, startNodeId, endNodeId, algorithm, multipliers);
    setSteps(generatedSteps);
    setIsPlaying(true);
    setCurrentStepIndex(0);
  };

  const handleReset = () => {
      setIsPlaying(false);
      setCurrentStepIndex(-1);
      setSteps([]);
      if (timerRef.current) clearInterval(timerRef.current);
  };
  
  // --- Preset Loading ---
  const handleLoadPreset = (type: 'cityGrid' | 'complex') => {
      handleReset();
      const preset = PRESETS[type];
      
      setNodes(JSON.parse(JSON.stringify(preset.nodes)));
      setEdges(JSON.parse(JSON.stringify(preset.edges)));
      
      if (preset.startId) setStartNodeId(preset.startId);
      if (preset.endId) setEndNodeId(preset.endId);
      
      setNodeCounts({}); 
      setPan({ x: 0, y: 0 }); // Recenter
  };

  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      timerRef.current = window.setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 500); 
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, steps]);

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;
  const editingEdge = editingEdgeId ? edges.find(e => e.id === editingEdgeId) : null;

  return (
    <div className="flex h-screen w-screen overflow-hidden text-slate-200 bg-slate-950">
      
      <SettingsPanel 
        multipliers={multipliers} 
        onChange={(type, val) => {
            setMultipliers(prev => ({ ...prev, [type]: val }));
            if (steps.length > 0) handleReset();
        }}
      />

      <Canvas 
        nodes={nodes} 
        edges={edges} 
        mode={mode}
        pan={pan}
        onPan={(dx, dy) => setPan(p => ({ x: p.x + dx, y: p.y + dy }))}
        onAddNode={handleAddNode}
        onMoveNode={handleMoveNode}
        onConnectNodes={initiateConnection}
        onEdgeClick={handleEdgeClick}
        onDeleteNode={handleDeleteNode}
        currentStep={currentStep}
      />

      <Sidebar />

      <ControlPanel 
        algorithm={algorithm}
        setAlgorithm={setAlgorithm}
        startNodeId={startNodeId}
        endNodeId={endNodeId}
        onStartChange={setStartNodeId}
        onEndChange={setEndNodeId}
        nodes={nodes}
        onRun={handleRunAlgorithm}
        onReset={handleReset}
        onLoadPreset={handleLoadPreset}
        onRecenter={() => setPan({ x: 0, y: 0 })}
        isPlaying={isPlaying}
        mode={mode}
        setMode={setMode}
      />

      <DataTable step={currentStep} nodes={nodes} />

      <EdgeModal 
        isOpen={isEdgeModalOpen} 
        onClose={() => { setIsEdgeModalOpen(false); setEditingEdgeId(null); setPendingConnection(null); }} 
        onSubmit={confirmEdgeModal}
        onDelete={editingEdge ? deleteEdge : undefined}
        isEditing={!!editingEdgeId}
        initialWeight={editingEdge ? editingEdge.weight : defaultEdgeWeight}
        initialType={editingEdge?.roadType}
      />
    </div>
  );
};

export default App;