import { StoreLayout, UWBAnchor } from '@/types/store';

export interface Point2D {
  x: number;
  y: number;
}

export interface AnchorDistance {
  anchor: UWBAnchor;
  distance: number; // measured (noisy) distance in same units as layout
}

// Euclidean distance
export function calculateEuclideanDistance(a: Point2D, b: Point2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Box-Muller transform to generate Gaussian noise
function gaussianNoise(mean = 0, stdDev = 1): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const mag = Math.sqrt(-2.0 * Math.log(u));
  const z0 = mag * Math.cos(2.0 * Math.PI * v);
  return z0 * stdDev + mean;
}

// Simulate UWB distance measurements with optional noise
export function simulateUwbMeasurements(
  layout: StoreLayout,
  truePosition: Point2D,
  options?: { noiseStdDev?: number; maxAnchors?: number; rangeLimitScale?: number }
): AnchorDistance[] {
  const noiseStdDev = options?.noiseStdDev ?? 0.5; // in grid units
  const rangeLimitScale = options?.rangeLimitScale ?? 1.0; // scale anchor.range if needed

  const usable: AnchorDistance[] = [];

  for (const anchor of layout.uwb_anchors) {
    const anchorPoint: Point2D = { x: anchor.coordinates[0], y: anchor.coordinates[1] };
    const trueDistance = calculateEuclideanDistance(truePosition, anchorPoint);
    const maxRange = (anchor.range ?? 25) * rangeLimitScale;
    if (trueDistance <= maxRange) {
      const noisy = Math.max(0, trueDistance + gaussianNoise(0, noiseStdDev));
      usable.push({ anchor, distance: noisy });
    }
  }

  // Prefer the closest anchors to improve stability
  usable.sort((a, b) => a.distance - b.distance);
  const maxAnchors = Math.max(3, options?.maxAnchors ?? usable.length);
  return usable.slice(0, maxAnchors);
}

// Trilateration via non-linear least squares (Gauss-Newton with a few iterations)
export function estimatePositionFromAnchors(
  anchors: AnchorDistance[],
  initialGuess?: Point2D
): Point2D | null {
  if (!anchors || anchors.length < 3) return null;

  // Initial guess: centroid of anchor positions
  let x =
    initialGuess?.x ?? anchors.reduce((sum, a) => sum + a.anchor.coordinates[0], 0) / anchors.length;
  let y =
    initialGuess?.y ?? anchors.reduce((sum, a) => sum + a.anchor.coordinates[1], 0) / anchors.length;

  // Perform a small fixed number of Gauss-Newton iterations
  const iterations = 10;
  for (let iter = 0; iter < iterations; iter++) {
    let JtJ_xx = 0;
    let JtJ_xy = 0;
    let JtJ_yy = 0;
    let Jtr_x = 0;
    let Jtr_y = 0;

    for (const m of anchors) {
      const xi = m.anchor.coordinates[0];
      const yi = m.anchor.coordinates[1];
      const dx = x - xi;
      const dy = y - yi;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1e-6; // avoid div by zero
      const ri = dist - m.distance; // residual

      // Jacobian for residual w.r.t x and y: [dx/dist, dy/dist]
      const Jx = dx / dist;
      const Jy = dy / dist;

      JtJ_xx += Jx * Jx;
      JtJ_xy += Jx * Jy;
      JtJ_yy += Jy * Jy;

      Jtr_x += Jx * ri;
      Jtr_y += Jy * ri;
    }

    // Solve 2x2 system: (J^T J) * delta = - J^T r
    const det = JtJ_xx * JtJ_yy - JtJ_xy * JtJ_xy;
    if (Math.abs(det) < 1e-6) break;

    const inv_xx = JtJ_yy / det;
    const inv_xy = -JtJ_xy / det;
    const inv_yy = JtJ_xx / det;

    const deltaX = -(inv_xx * Jtr_x + inv_xy * Jtr_y);
    const deltaY = -(inv_xy * Jtr_x + inv_yy * Jtr_y);

    x += deltaX;
    y += deltaY;

    if (Math.abs(deltaX) + Math.abs(deltaY) < 1e-4) break;
  }

  return { x, y };
}

// Convenience: full pipeline from true position to estimated position
export function simulateAndEstimate(
  layout: StoreLayout,
  truePosition: Point2D,
  options?: { noiseStdDev?: number; maxAnchors?: number; rangeLimitScale?: number; initialGuess?: Point2D }
): { measured: AnchorDistance[]; estimated: Point2D | null } {
  const measured = simulateUwbMeasurements(layout, truePosition, options);
  const estimated = estimatePositionFromAnchors(measured, options?.initialGuess);
  return { measured, estimated };
}
