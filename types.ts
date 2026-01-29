export type NodeType = 
  | 'House' 
  | 'School' 
  | 'Hospital' 
  | 'Police' 
  | 'Park' 
  | 'Shop' 
  | 'Factory' 
  | 'Airport' 
  | 'FireStation' 
  | 'Hotel';

export type RoadType = 'Highway' | 'City' | 'Dirt';

export interface NodeData {
  id: string;
  x: number;
  y: number;
  type: NodeType;
  label: string;
}

export interface EdgeData {
  id: string;
  sourceId: string;
  targetId: string;
  weight: number;
  roadType: RoadType;
}

export interface AlgoStep {
  visited: string[]; // Set of visited node IDs
  distances: Record<string, number>; // Current shortest distance to each node
  previous: Record<string, string | null>; // Previous node in path
  current: string | null; // Node currently being processed
  frontier: string[]; // Nodes in the priority queue/stack
  path?: string[]; // Final path if found
}

export type InteractionMode = 'select' | 'draw-edge';

export type AlgorithmType = 'Dijkstra' | 'AStar';

export type Multipliers = Record<RoadType, number>;