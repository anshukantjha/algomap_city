import { NodeData, EdgeData, AlgoStep, AlgorithmType, RoadType, Multipliers } from '../types';

// Priority Queue helper
class PriorityQueue<T> {
  private items: { element: T; priority: number }[] = [];

  enqueue(element: T, priority: number) {
    const queueElement = { element, priority };
    let added = false;
    for (let i = 0; i < this.items.length; i++) {
      if (queueElement.priority < this.items[i].priority) {
        this.items.splice(i, 0, queueElement);
        added = true;
        break;
      }
    }
    if (!added) {
      this.items.push(queueElement);
    }
  }

  dequeue(): T | undefined {
    return this.items.shift()?.element;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  getElements(): T[] {
    return this.items.map(i => i.element);
  }
}

const getCost = (distance: number, roadType: RoadType, multipliers: Multipliers): number => {
  return distance * multipliers[roadType];
};

const heuristic = (a: NodeData, b: NodeData): number => {
  // Euclidean distance in pixels
  // This is admissible ONLY if edge weights are >= pixel distance.
  // The App ensures default edge weights match pixel distance.
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy); 
};

export const generateAlgorithmSteps = (
  nodes: NodeData[],
  edges: EdgeData[],
  startId: string,
  endId: string,
  algorithm: AlgorithmType,
  multipliers: Multipliers
): AlgoStep[] => {
  const steps: AlgoStep[] = [];
  
  // Build Undirected Graph
  const adjacency: Record<string, { node: string; weight: number }[]> = {};
  nodes.forEach(n => { adjacency[n.id] = []; });
  
  edges.forEach(e => {
    // Edge Weight = Distance (e.weight is distance input by user) * Multiplier
    const cost = getCost(e.weight, e.roadType, multipliers);
    
    // Undirected: Add to both source and target
    if (adjacency[e.sourceId]) adjacency[e.sourceId].push({ node: e.targetId, weight: cost });
    if (adjacency[e.targetId]) adjacency[e.targetId].push({ node: e.sourceId, weight: cost });
  });

  const distances: Record<string, number> = {}; // gScore
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();
  
  nodes.forEach(n => {
    distances[n.id] = Infinity;
    previous[n.id] = null;
  });

  distances[startId] = 0;
  
  const startNode = nodes.find(n => n.id === startId);
  const endNode = nodes.find(n => n.id === endId);
  
  const pq = new PriorityQueue<string>();
  
  // Initial Priority
  // Dijkstra: p = 0
  // A*: p = h(start, end)
  let initialPriority = 0;
  if (algorithm === 'AStar' && startNode && endNode) {
    initialPriority = heuristic(startNode, endNode);
  }
  pq.enqueue(startId, initialPriority);

  // Initial Step
  steps.push({
    visited: [],
    distances: { ...distances },
    previous: { ...previous },
    current: null,
    frontier: pq.getElements()
  });

  while (!pq.isEmpty()) {
    const currentId = pq.dequeue();

    if (!currentId) break;
    
    // Lazy Deletion: If we've already visited this node, skip it.
    // This happens if a shorter path was found after this node was added to PQ with a higher cost.
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
       // Final success step
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
      // Calculate tentative gScore
      const tentativeG = distances[currentId] + neighbor.weight;

      if (tentativeG < distances[neighbor.node]) {
        // Path is better
        previous[neighbor.node] = currentId;
        distances[neighbor.node] = tentativeG;

        let priority = tentativeG; // Default Dijkstra: Priority = g(n)
        
        if (algorithm === 'AStar' && endNode) {
           const neighborNode = nodes.find(n => n.id === neighbor.node);
           if (neighborNode) {
             // A*: Priority = f(n) = g(n) + h(n)
             priority = tentativeG + heuristic(neighborNode, endNode);
           }
        }
        
        pq.enqueue(neighbor.node, priority);
      }
    }
    
    // Snapshot after updating neighbors
    steps.push({
        visited: Array.from(visited),
        distances: { ...distances },
        previous: { ...previous },
        current: currentId,
        frontier: pq.getElements()
      });
  }

  // No path found
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