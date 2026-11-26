import * as THREE from 'three';
import { ROOM, makeBox } from '../constants.js';

export function buildKitchen(mats) {
  const group = new THREE.Group();
  group.name = 'Kitchen';

  const baseH = 0.85;
  const topT = 0.04;
  const topY = baseH + topT * 0.5; // 0.87

  // =========================================================================
  // 1. MAIN HOB COUNTER (East face of Partition Wall x = 2.17, z = -2.95..-0.55)
  // =========================================================================
  const hobX = ROOM.X_PART + ROOM.WALL_T * 0.5; // 2.17
  const hobDepth = 0.65;
  const hobCenterX = hobX + hobDepth * 0.5; // 2.495
  const hobZStart = -2.95;
  const hobZEnd = ROOM.Z_PART_END; // -0.55
  const hobLen = hobZEnd - hobZStart; // 2.40
  const hobZMid = (hobZStart + hobZEnd) * 0.5; // -1.75

  // Stainless toe kick + Matte Taupe base drawers/doors
  group.add(makeBox(hobDepth - 0.06, 0.08, hobLen - 0.06, mats.brushedSteel, hobCenterX - 0.02, 0.04, hobZMid));
  group.add(makeBox(hobDepth - 0.02, baseH - 0.08, hobLen - 0.04, mats.kitchenTaupe, hobCenterX, 0.08 + (baseH - 0.08) * 0.5, hobZMid));

  // Black horizontal Gola handle channels on Hob base drawers (facing +X)
  [0.44, 0.66, 0.82].forEach((gy) => {
    group.add(makeBox(0.015, 0.022, 1.55, mats.matteBlackMetal, hobX + hobDepth - 0.008, gy, -2.15));
  });

  // Black Granite Countertop & South Waterfall End Panel
  group.add(makeBox(hobDepth + 0.02, topT, hobLen + 0.02, mats.blackGranite, hobCenterX, topY, hobZMid));
  group.add(makeBox(hobDepth + 0.02, baseH + topT, 0.035, mats.blackGranite, hobCenterX, (baseH + topT) * 0.5, hobZEnd + 0.01));

  // Cream Onyx Marble Backsplash on East face of Partition Wall
  group.add(makeBox(0.02, 0.66, hobLen + 0.02, mats.floorMarble, hobX + 0.01, baseH + topT + 0.33, hobZMid, { cast: false }));

  // 3-Burner Black Glass Gas Hob centered at z = -1.75
  const hobUnit = new THREE.Group();
  hobUnit.position.set(hobCenterX + 0.02, baseH + topT, -1.75);
  hobUnit.add(makeBox(0.48, 0.022, 0.78, mats.matteBlackMetal, 0, 0.011, 0));
  [-0.24, 0, 0.24].forEach((bz, i) => {
    const burner = new THREE.Mesh(
      new THREE.CylinderGeometry(i === 1 ? 0.055 : 0.072, i === 1 ? 0.06 : 0.078, 0.028, 16),
      mats.matteBlackMetal
    );
    burner.position.set(i === 1 ? -0.05 : 0.03, 0.03, bz);
    hobUnit.add(burner);
    // Pan support trivet ring
    const trivet = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.008, 8, 16), mats.matteBlackMetal);
    trivet.rotation.x = Math.PI / 2;
    trivet.position.set(i === 1 ? -0.05 : 0.03, 0.042, bz);
    hobUnit.add(trivet);
  });
  group.add(hobUnit);

  // Utensil crock on South end of hob counter & Spice Rack on North end
  const crock = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.16, 16), mats.matteBlackMetal);
  crock.position.set(hobX + 0.20, baseH + topT + 0.08, -0.95);
  group.add(crock);

  const spiceRack = new THREE.Group();
  spiceRack.position.set(hobX + 0.22, baseH + topT, -2.55);
  spiceRack.add(makeBox(0.16, 0.015, 0.24, mats.matteBlackMetal, 0, 0.01, 0));
  spiceRack.add(makeBox(0.16, 0.015, 0.24, mats.matteBlackMetal, 0, 0.13, 0));
  spiceRack.add(makeBox(0.015, 0.24, 0.015, mats.matteBlackMetal, -0.07, 0.12, -0.11));
  spiceRack.add(makeBox(0.015, 0.24, 0.015, mats.matteBlackMetal, -0.07, 0.12, 0.11));
  const jarColors = [0xc85a32, 0xd49b38, 0x5c7d42, 0x9b452e];
  [0.055, 0.175].forEach((jy, row) => {
    [-0.07, 0, 0.07].forEach((jz, col) => {
      const jarMat = new THREE.MeshStandardMaterial({ color: jarColors[(row * 3 + col) % jarColors.length], roughness: 0.35 });
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.07, 12), jarMat);
      jar.position.set(0.01, jy, jz);
      spiceRack.add(jar);
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.015, 12), mats.matteBlackMetal);
      lid.position.set(0.01, jy + 0.04, jz);
      spiceRack.add(lid);
    });
  });
  group.add(spiceRack);

  // Dark Smoked-Glass Upper Cabinets (y = 1.55 .. 2.15)
  group.add(makeBox(0.36, 0.60, hobLen + 0.02, mats.matteBlackMetal, hobX + 0.18, 1.85, hobZMid));
  for (let i = 0; i < 4; i++) {
    const dz = hobZStart + 0.30 + i * 0.60;
    group.add(makeBox(0.02, 0.58, 0.585, mats.smokedGlassCabinet, hobX + 0.365, 1.85, dz));
  }
  // Black Chimney / Range Hood under upper cabinets above Hob
  group.add(makeBox(0.46, 0.05, 0.88, mats.matteBlackMetal, hobX + 0.24, 1.525, -1.75));
  group.add(makeBox(0.28, 0.12, 0.32, mats.matteBlackMetal, hobX + 0.16, 1.60, -1.75));

  // Matte Taupe Loft Cabinets above upper cabinets (y = 2.15 .. 2.95)
  group.add(makeBox(0.58, 0.80, hobLen + 0.02, mats.kitchenTaupe, hobX + 0.29, 2.55, hobZMid));

  // =========================================================================
  // 2. NORTH SINK COUNTER & GREY REFRIGERATOR (z = -3.60 .. -2.95)
  // =========================================================================
  const sinkXStart = hobX + hobDepth; // 2.82
  const sinkXEnd = 3.84;
  const sinkW = sinkXEnd - sinkXStart;
  const sinkXMid = (sinkXStart + sinkXEnd) * 0.5;
  const sinkZ = ROOM.Z_NORTH + 0.325;

  group.add(makeBox(sinkW, baseH, 0.65, mats.kitchenTaupe, sinkXMid, baseH * 0.5, sinkZ));
  group.add(makeBox(sinkW + 0.02, topT, 0.67, mats.blackGranite, sinkXMid, topY, sinkZ));
  // Cream marble backsplash on North kitchen wall
  group.add(makeBox(sinkW + 0.65, 1.25, 0.02, mats.floorMarble, sinkXMid + 0.3, 1.5, ROOM.Z_NORTH + 0.01, { cast: false }));

  // Recessed black kitchen sink & chrome gooseneck faucet
  group.add(makeBox(0.54, 0.02, 0.44, mats.matteBlackMetal, sinkXMid, baseH + topT + 0.005, sinkZ));
  const faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.26, 12), mats.brushedSteel);
  faucetBase.position.set(sinkXMid, baseH + topT + 0.13, ROOM.Z_NORTH + 0.12);
  group.add(faucetBase);

  // Loft cabinets running across North Kitchen wall (y = 2.15 .. 2.95)
  group.add(makeBox(2.20, 0.80, 0.62, mats.kitchenTaupe, sinkXStart + 1.10, 2.55, ROOM.Z_NORTH + 0.31));

  // Grey Double-Door Refrigerator (x = 3.88 .. 4.78, facing South +Z)
  const fridge = new THREE.Group();
  fridge.name = 'Refrigerator';
  fridge.position.set(4.33, 0, ROOM.Z_NORTH + 0.39);
  fridge.add(makeBox(0.86, 1.84, 0.72, mats.fridgeGrey, 0, 0.92, 0));
  // Horizontal freezer/fridge seam & vertical handle grooves
  fridge.add(makeBox(0.864, 0.015, 0.725, mats.matteBlackMetal, 0, 1.24, 0.002));
  fridge.add(makeBox(0.022, 0.45, 0.025, mats.matteBlackMetal, -0.34, 1.54, 0.365));
  fridge.add(makeBox(0.022, 0.82, 0.025, mats.matteBlackMetal, -0.34, 0.72, 0.365));
  group.add(fridge);

  // =========================================================================
  // 3. EAST APPLIANCE COUNTER (x = 4.38 .. 5.00, z = -1.28 .. +0.52)
  // =========================================================================
  const appZStart = -1.28;
  const appZEnd = 0.52;
  const appLen = appZEnd - appZStart; // 1.80
  const appZMid = (appZStart + appZEnd) * 0.5; // -0.38
  const appX = ROOM.X_EAST - 0.31; // 4.69

  // Matte taupe 4-door base cabinet + vertical door seam lines + black granite top & two waterfall side panels
  group.add(makeBox(0.58, 0.08, appLen - 0.06, mats.brushedSteel, appX + 0.02, 0.04, appZMid));
  group.add(makeBox(0.60, baseH - 0.08, appLen - 0.04, mats.kitchenTaupe, appX, 0.08 + (baseH - 0.08) * 0.5, appZMid));
  [-0.83, -0.38, 0.07].forEach((sz) => {
    group.add(makeBox(0.01, baseH - 0.08, 0.008, mats.matteBlackMetal, appX - 0.30, 0.08 + (baseH - 0.08) * 0.5, sz));
  });
  group.add(makeBox(0.64, topT, appLen + 0.04, mats.blackGranite, appX, topY, appZMid));
  group.add(makeBox(0.64, baseH + topT, 0.035, mats.blackGranite, appX, (baseH + topT) * 0.5, appZStart));
  group.add(makeBox(0.64, baseH + topT, 0.035, mats.blackGranite, appX, (baseH + topT) * 0.5, appZEnd));

  // Cream marble backsplash behind Appliance Counter
  group.add(makeBox(0.02, 1.70, appLen + 0.04, mats.floorMarble, ROOM.X_EAST - 0.01, 1.65, appZMid, { cast: false }));

  // 4 Dark Smoked-Glass Wall Cabinets above Appliance Counter
  group.add(makeBox(0.36, 0.62, appLen + 0.02, mats.matteBlackMetal, ROOM.X_EAST - 0.18, 1.86, appZMid));
  for (let i = 0; i < 4; i++) {
    const cz = appZStart + 0.225 + i * 0.45;
    group.add(makeBox(0.02, 0.60, 0.435, mats.smokedGlassCabinet, ROOM.X_EAST - 0.365, 1.86, cz));
  }

  // Black Microwave on North side of Appliance Counter (z = -0.92)
  const micro = new THREE.Group();
  micro.position.set(appX + 0.04, baseH + topT, -0.92);
  micro.add(makeBox(0.36, 0.28, 0.48, mats.matteBlackMetal, 0, 0.14, 0));
  micro.add(makeBox(0.02, 0.19, 0.32, mats.smokedGlassCabinet, -0.18, 0.145, 0.04));
  group.add(micro);

  // Stainless Toaster with toast slice on center of Appliance Counter (z = -0.35)
  const toaster = new THREE.Group();
  toaster.position.set(appX + 0.05, baseH + topT, -0.35);
  toaster.add(makeBox(0.18, 0.18, 0.26, mats.brushedSteel, 0, 0.09, 0));
  toaster.add(makeBox(0.03, 0.06, 0.12, mats.rattanWicker, 0, 0.20, 0));
  group.add(toaster);

  // =========================================================================
  // 4. VANITY WASHBASIN ALCOVE (x = 4.68, z = 0.60 .. 1.15)
  // =========================================================================
  group.add(makeBox(0.42, 0.26, 0.48, mats.kitchenTaupe, ROOM.X_EAST - 0.21, 0.68, 0.85));
  group.add(makeBox(0.44, 0.03, 0.50, mats.blackGranite, ROOM.X_EAST - 0.22, 0.825, 0.85));
  // White ceramic vessel basin
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.13, 0.13, 24), mats.whiteCeramic);
  basin.position.set(ROOM.X_EAST - 0.22, 0.90, 0.85);
  group.add(basin);
  // Wall mirror above washbasin
  group.add(makeBox(0.025, 0.82, 0.48, mats.matteBlackMetal, ROOM.X_EAST - 0.015, 1.56, 0.85));
  group.add(makeBox(0.028, 0.78, 0.44, mats.mirrorGlass, ROOM.X_EAST - 0.02, 1.56, 0.85));

  return group;
}
