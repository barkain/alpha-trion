// 3D world positions in scene space
export const WORLD_3D_POSITIONS: [number, number, number][] = [
  [-3.6, 0, 7.2],    // World 0 - Forest (bottom-left)
  [3.6, 0, 3.6],     // World 1 - Cave (center-right)
  [-6.0, 0, -3.5],   // World 2 - Library (upper-left)
  [4.3, 0, -4.3],    // World 3 - Tower (upper-right)
  [0, 0, -9.1],      // World 4 - Palace (top-center)
];

// Path waypoints (world positions + midpoints for meandering curve)
export const MAP_PATH_WAYPOINTS: [number, number, number][] = [
  [-3.6, 0.05, 7.2],   [0, 0.05, 5.8],
  [3.6, 0.05, 3.6],    [0, 0.05, 1.8],
  [-6.0, 0.05, -3.5],  [-1.0, 0.05, -4.0],
  [4.3, 0.05, -4.3],   [2.5, 0.05, -7.0],
  [0, 0.05, -9.1],
];

export const CLEARING_RADIUS = 2.8;
export const PATH_EXCLUSION_RADIUS = 1.2;
