import { NodeData, EdgeData, RoadType, Multipliers } from '../types';

// ---------- Priority Queue ----------
export class PriorityQueue<T> {
  private items: { element: T; priority: number }[] = [];

  enqueue(element: T, priority: number) {
    const queueElement = { element, priority };
    let added = false;

    for (let i = 0; i < this.items.length; i++) {
      if (priority < this.items[i].priority) {
        this.items.splice(i, 0, queueElement);
        added = true;
        break;
      }
    }

    if (!added) this.items.push(queueElement);
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

// ---------- Cost ----------
export const getCost = (
  distance: number,
  roadType: RoadType,
  multipliers: Multipliers
): number => distance * multipliers[roadType];

// ---------- Graph ----------
export const buildAdjacencyList = (
  nodes: NodeData[],
  edges: EdgeData[],
  multipliers: Multipliers
) => {
  const adjacency: Record<string, { node: string; weight: number }[]> = {};

  nodes.forEach(n => (adjacency[n.id] = []));

  edges.forEach(e => {
    const cost = getCost(e.weight, e.roadType, multipliers);
    adjacency[e.sourceId].push({ node: e.targetId, weight: cost });
    adjacency[e.targetId].push({ node: e.sourceId, weight: cost });
  });

  return adjacency;
};

// ---------- Heuristic (A*) ----------
export const heuristic = (a: NodeData, b: NodeData): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};
