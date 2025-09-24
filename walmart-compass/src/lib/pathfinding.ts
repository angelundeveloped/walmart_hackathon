import { StoreLayout } from '@/types/store';

export interface GridPoint { x: number; y: number }

function key(p: GridPoint): string { return `${p.x},${p.y}`; }

// Build an occupancy grid from store layout; true means walkable
export function buildWalkableGrid(layout: StoreLayout): boolean[][] {
  const { width, height } = layout.map;
  const grid: boolean[][] = Array.from({ length: height }, () => Array<boolean>(width).fill(true));

  // Mark aisles as blocked (impassable)
  for (const section of layout.sections) {
    for (const aisle of section.aisles) {
      // Expect rectangular coordinates: [x1,y1], [x2,y1], [x2,y2], [x1,y2]
      const x1 = Math.floor(Math.min(aisle.coordinates[0][0], aisle.coordinates[1][0], aisle.coordinates[2][0], aisle.coordinates[3][0]));
      const y1 = Math.floor(Math.min(aisle.coordinates[0][1], aisle.coordinates[1][1], aisle.coordinates[2][1], aisle.coordinates[3][1]));
      const x2 = Math.ceil(Math.max(aisle.coordinates[0][0], aisle.coordinates[1][0], aisle.coordinates[2][0], aisle.coordinates[3][0]));
      const y2 = Math.ceil(Math.max(aisle.coordinates[0][1], aisle.coordinates[1][1], aisle.coordinates[2][1], aisle.coordinates[3][1]));

      for (let y = Math.max(0, y1); y < Math.min(height, y2); y++) {
        for (let x = Math.max(0, x1); x < Math.min(width, x2); x++) {
          grid[y][x] = false; // blocked
        }
      }
    }
  }

  return grid;
}

function heuristic(a: GridPoint, b: GridPoint): number {
  // Manhattan heuristic (grid movement 4-directional)
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function findPath(layout: StoreLayout, start: GridPoint, goal: GridPoint): GridPoint[] {
  const grid = buildWalkableGrid(layout);
  const { width, height } = layout.map;

  const inBounds = (p: GridPoint) => p.x >= 0 && p.x < width && p.y >= 0 && p.y < height;
  const walkable = (p: GridPoint) => grid[p.y]?.[p.x] === true;

  const neighbors = (p: GridPoint): GridPoint[] => {
    const deltas = [ {x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1} ];
    const result: GridPoint[] = [];
    for (const d of deltas) {
      const np = { x: p.x + d.x, y: p.y + d.y };
      if (inBounds(np) && walkable(np)) result.push(np);
    }
    return result;
  };

  const openSet = new Set<string>();
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  const startK = key(start);
  const goalK = key(goal);

  openSet.add(startK);
  gScore.set(startK, 0);
  fScore.set(startK, heuristic(start, goal));

  const getLowestF = (): string | null => {
    let best: string | null = null;
    let bestVal = Infinity;
    for (const k of openSet) {
      const v = fScore.get(k) ?? Infinity;
      if (v < bestVal) { bestVal = v; best = k; }
    }
    return best;
  };

  while (openSet.size > 0) {
    const currentK = getLowestF();
    if (!currentK) break;
    if (currentK === goalK) {
      // reconstruct path
      const path: GridPoint[] = [];
      let curr = currentK;
      while (curr) {
        const [cx, cy] = curr.split(',').map(Number);
        path.push({ x: cx, y: cy });
        const prev = cameFrom.get(curr);
        if (!prev) break;
        curr = prev;
      }
      return path.reverse();
    }

    openSet.delete(currentK);
    const [cx, cy] = currentK.split(',').map(Number);
    const current: GridPoint = { x: cx, y: cy };

    for (const nb of neighbors(current)) {
      const nbK = key(nb);
      const tentative = (gScore.get(currentK) ?? Infinity) + 1;
      if (tentative < (gScore.get(nbK) ?? Infinity)) {
        cameFrom.set(nbK, currentK);
        gScore.set(nbK, tentative);
        fScore.set(nbK, tentative + heuristic(nb, goal));
        if (!openSet.has(nbK)) openSet.add(nbK);
      }
    }
  }

  return [];
}

export function toGridPoint(x: number, y: number): GridPoint {
  return { x: Math.round(x), y: Math.round(y) };
}
