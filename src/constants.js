export const ROOM = {
  CEILING_H: 2.95,
  WALL_T: 0.14,

  X_WEST: -2.4,
  X_PART: 2.1,
  X_EAST: 5.0,

  Z_NORTH: -3.6,
  Z_PART_END: -0.55,
  Z_SOUTH: 1.15,

  BAND_LOW_H: 0.95,
  BAND_MID_H: 1.25, // 0.95 -> 2.20
  BAND_TOP_H: 0.75  // 2.20 -> 2.95
};

/**
 * Helper to create a positioned Box mesh in one call.
 */
export function makeBox(w, h, d, material, x, y, z, { cast = true, receive = true, name = '' } = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  if (name) mesh.name = name;
  return mesh;
}

import * as THREE from 'three';
