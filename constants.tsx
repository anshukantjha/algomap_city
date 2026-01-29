import React from 'react';
import {
  Home,
  GraduationCap,
  Stethoscope,
  Shield,
  Trees,
  ShoppingBag,
  Factory,
  Plane,
  Flame,
  BedDouble,
  LucideIcon
} from 'lucide-react';
import { NodeType, RoadType, NodeData, EdgeData } from './types';

export const NODE_ICONS: Record<NodeType, LucideIcon> = {
  House: Home,
  School: GraduationCap,
  Hospital: Stethoscope,
  Police: Shield,
  Park: Trees,
  Shop: ShoppingBag,
  Factory: Factory,
  Airport: Plane,
  FireStation: Flame,
  Hotel: BedDouble,
};

export const ROAD_COLORS: Record<RoadType, string> = {
  Highway: '#4ade80', // Green-400 (Brighter for dark mode)
  City: '#facc15',    // Yellow-400
  Dirt: '#f87171',    // Red-400
};

export const ROAD_MULTIPLIERS: Record<RoadType, number> = {
  Highway: 1,
  City: 1.5,
  Dirt: 2.5, // High penalty for dirt roads
};

export const DEFAULT_ROAD_WEIGHT = 10;

// --- PRESETS ---

export const PRESETS: Record<string, { nodes: NodeData[], edges: EdgeData[], startId?: string, endId?: string }> = {
  cityGrid: {
    startId: 'n1',
    endId: 'n9',
    nodes: [
      { id: 'n1', x: 200, y: 200, type: 'House', label: 'Start' },
      { id: 'n2', x: 400, y: 200, type: 'School', label: 'S1' },
      { id: 'n3', x: 600, y: 200, type: 'Shop', label: 'Sh1' },
      { id: 'n4', x: 200, y: 400, type: 'Park', label: 'P1' },
      { id: 'n5', x: 400, y: 400, type: 'Police', label: 'Pol1' },
      { id: 'n6', x: 600, y: 400, type: 'House', label: 'H2' },
      { id: 'n7', x: 200, y: 600, type: 'Factory', label: 'F1' },
      { id: 'n8', x: 400, y: 600, type: 'Hotel', label: 'Hot1' },
      { id: 'n9', x: 600, y: 600, type: 'Hospital', label: 'End' },
    ],
    edges: [
      { id: 'e1', sourceId: 'n1', targetId: 'n2', weight: 200, roadType: 'City' },
      { id: 'e2', sourceId: 'n2', targetId: 'n3', weight: 200, roadType: 'City' },
      { id: 'e3', sourceId: 'n1', targetId: 'n4', weight: 200, roadType: 'City' },
      { id: 'e4', sourceId: 'n2', targetId: 'n5', weight: 200, roadType: 'City' },
      { id: 'e5', sourceId: 'n3', targetId: 'n6', weight: 200, roadType: 'City' },
      { id: 'e6', sourceId: 'n4', targetId: 'n5', weight: 200, roadType: 'City' },
      { id: 'e7', sourceId: 'n5', targetId: 'n6', weight: 200, roadType: 'City' },
      { id: 'e8', sourceId: 'n4', targetId: 'n7', weight: 200, roadType: 'City' },
      { id: 'e9', sourceId: 'n5', targetId: 'n8', weight: 200, roadType: 'City' },
      { id: 'e10', sourceId: 'n6', targetId: 'n9', weight: 200, roadType: 'City' },
      { id: 'e11', sourceId: 'n7', targetId: 'n8', weight: 200, roadType: 'City' },
      { id: 'e12', sourceId: 'n8', targetId: 'n9', weight: 200, roadType: 'City' },
    ]
  },
  complex: {
    startId: 'cn1',
    endId: 'cn5',
    nodes: [
      { id: 'cn1', x: 100, y: 400, type: 'House', label: 'Start' },
      { id: 'cn2', x: 400, y: 400, type: 'Park', label: 'Mud' }, // Trap node
      { id: 'cn3', x: 400, y: 150, type: 'Airport', label: 'Fly' },
      { id: 'cn4', x: 400, y: 650, type: 'Factory', label: 'Ind' },
      { id: 'cn5', x: 800, y: 400, type: 'Hotel', label: 'End' },
      { id: 'cn6', x: 250, y: 250, type: 'Shop', label: 'Stop1' },
      { id: 'cn7', x: 650, y: 250, type: 'Shop', label: 'Stop2' },
      { id: 'cn8', x: 250, y: 550, type: 'FireStation', label: 'Fire' },
      { id: 'cn9', x: 650, y: 550, type: 'Hospital', label: 'Hosp' },
    ],
    edges: [
      // Direct path (Short distance but DIRT road - High Cost)
      { id: 'ce1', sourceId: 'cn1', targetId: 'cn2', weight: 300, roadType: 'Dirt' },
      { id: 'ce2', sourceId: 'cn2', targetId: 'cn5', weight: 400, roadType: 'Dirt' },
      
      // Top Path (Longer distance but HIGHWAY - Low Cost)
      { id: 'ce3', sourceId: 'cn1', targetId: 'cn6', weight: 212, roadType: 'Highway' },
      { id: 'ce4', sourceId: 'cn6', targetId: 'cn3', weight: 180, roadType: 'Highway' },
      { id: 'ce5', sourceId: 'cn3', targetId: 'cn7', weight: 269, roadType: 'Highway' },
      { id: 'ce6', sourceId: 'cn7', targetId: 'cn5', weight: 212, roadType: 'Highway' },

      // Bottom Path (Average City)
      { id: 'ce7', sourceId: 'cn1', targetId: 'cn8', weight: 212, roadType: 'City' },
      { id: 'ce8', sourceId: 'cn8', targetId: 'cn4', weight: 180, roadType: 'City' },
      { id: 'ce9', sourceId: 'cn4', targetId: 'cn9', weight: 269, roadType: 'City' },
      { id: 'ce10', sourceId: 'cn9', targetId: 'cn5', weight: 212, roadType: 'City' },
      
      // Interconnections
      { id: 'ce11', sourceId: 'cn6', targetId: 'cn2', weight: 212, roadType: 'Dirt' },
      { id: 'ce12', sourceId: 'cn8', targetId: 'cn2', weight: 212, roadType: 'Dirt' },
    ]
  }
};