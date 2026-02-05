import { NodeData, EdgeData, AlgoStep, Multipliers } from '../types';
import { PriorityQueue, buildAdjacencyList, heuristic } from './graphUtils';

export const runAStar = (
  nodes: NodeData[],
  edges: EdgeData[],
  startId: string,
  endId: string,
  multipliers: Multipliers
): AlgoStep[] => {

  const steps: AlgoStep[] = [];
  const adjacency = buildAdjacencyList(nodes, edges, multipliers);

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();

  nodes.forEach(n => {
    distances[n.id] = Infinity;
    previous[n.id] = null;
  });

  distances[startId] = 0;

  const startNode = nodes.find(n => n.id === startId)!;
  const endNode = nodes.find(n => n.id === endId)!;

  const pq = new PriorityQueue<string>();
  pq.enqueue(startId, heuristic(startNode, endNode));

  steps.push({
    visited: [],
    distances: { ...distances },
    previous: { ...previous },
    current: null,
    frontier: pq.getElements()
  });

  while (!pq.isEmpty()) {
    const current = pq.dequeue();
    if (!current || visited.has(current)) continue;

    steps.push({
      visited: Array.from(visited),
      distances: { ...distances },
      previous: { ...previous },
      current,
      frontier: pq.getElements()
    });

    if (current === endId) break;

    visited.add(current);

    for (const neighbor of adjacency[current]) {
      const tentativeG = distances[current] + neighbor.weight;

      if (tentativeG < distances[neighbor.node]) {
        distances[neighbor.node] = tentativeG;
        previous[neighbor.node] = current;

        const neighborNode = nodes.find(n => n.id === neighbor.node)!;
        const fScore = tentativeG + heuristic(neighborNode, endNode);

        pq.enqueue(neighbor.node, fScore);
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let curr: string | null = endId;
  while (curr) {
    path.unshift(curr);
    curr = previous[curr];
  }

  steps.push({
    visited: Array.from(visited),
    distances: { ...distances },
    previous: { ...previous },
    current: null,
    frontier: [],
    path
  });

  return steps;
};
