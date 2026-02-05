import { NodeData, EdgeData, AlgoStep } from '../types';
import { PriorityQueue } from './graphUtils'; 

export const runDijkstra = (
  nodes: NodeData[],
  edges: EdgeData[],
  startId: string,
  endId: string
  // Removed 'multipliers' parameter completely
): AlgoStep[] => {
  const steps: AlgoStep[] = [];

  // 1. Build Adjacency List locally (Weight = Distance * 1)
  const adjacency: Record<string, { node: string; weight: number }[]> = {};
  
  nodes.forEach(n => { 
    adjacency[n.id] = []; 
  });
  
  edges.forEach(e => {
    // Dijkstra specific: Ignore multipliers, just use raw distance weight
    const cost = e.weight; 
    
    if (adjacency[e.sourceId]) adjacency[e.sourceId].push({ node: e.targetId, weight: cost });
    if (adjacency[e.targetId]) adjacency[e.targetId].push({ node: e.sourceId, weight: cost });
  });

  // 2. Initialize Algorithm
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();

  nodes.forEach(n => {
    distances[n.id] = Infinity;
    previous[n.id] = null;
  });

  distances[startId] = 0;

  const pq = new PriorityQueue<string>();
  pq.enqueue(startId, 0);

  // Initial Snapshot
  steps.push({
    visited: [],
    distances: { ...distances },
    previous: { ...previous },
    current: null,
    frontier: pq.getElements()
  });

  // 3. Main Loop
  while (!pq.isEmpty()) {
    const currentId = pq.dequeue();
    if (!currentId) break;

    if (visited.has(currentId)) continue;

    // Snapshot: Visiting node
    steps.push({
      visited: Array.from(visited),
      distances: { ...distances },
      previous: { ...previous },
      current: currentId,
      frontier: pq.getElements()
    });

    if (currentId === endId) {
       // Reconstruct path
       const path: string[] = [];
       let curr: string | null = endId;
       while (curr) {
         path.unshift(curr);
         curr = previous[curr];
       }
       // Final Success Snapshot
       steps.push({
         visited: Array.from(visited).concat(currentId),
         distances: { ...distances },
         previous: { ...previous },
         current: null,
         frontier: [],
         path: path
       });
       return steps;
    }

    visited.add(currentId);

    const neighbors = adjacency[currentId] || [];

    for (const neighbor of neighbors) {
      const tentativeG = distances[currentId] + neighbor.weight;

      if (tentativeG < distances[neighbor.node]) {
        previous[neighbor.node] = currentId;
        distances[neighbor.node] = tentativeG;

        // Dijkstra Priority = g(n) (Actual cost so far)
        pq.enqueue(neighbor.node, tentativeG);
      }
    }
    
    // Snapshot: After processing neighbors
    steps.push({
        visited: Array.from(visited),
        distances: { ...distances },
        previous: { ...previous },
        current: currentId,
        frontier: pq.getElements()
      });
  }

  // 4. No Path Found Snapshot
  steps.push({
    visited: Array.from(visited),
    distances: { ...distances },
    previous: { ...previous },
    current: null,
    frontier: [],
    path: []
  });

  return steps;
};