import * as THREE from 'three';
import { createTextures } from './textures.js';
import { createMaterials } from './materials.js';
import { buildArchitecture } from './zones/architecture.js';
import { buildLivingFurniture } from './zones/livingFurniture.js';
import { buildDiningAndBalcony } from './zones/diningAndBalcony.js';
import { buildKitchen } from './zones/kitchen.js';

/**
 * Builds the complete 3D room scene graph from shared textures & materials.
 * Used identically by both the interactive Three.js viewer and Node GLB exporter.
 */
export function buildRoomModel() {
  const root = new THREE.Group();
  root.name = 'ModernApartmentRoom';

  const textures = createTextures();
  const mats = createMaterials(textures);

  const { group: archGroup, interactive } = buildArchitecture(mats);
  const livingGroup = buildLivingFurniture(mats);
  const diningGroup = buildDiningAndBalcony(mats);
  const kitchenGroup = buildKitchen(mats);

  root.add(archGroup);
  root.add(livingGroup);
  root.add(diningGroup);
  root.add(kitchenGroup);

  return { root, interactive, mats };
}
