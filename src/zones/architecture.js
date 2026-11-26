import * as THREE from 'three';
import { ROOM, makeBox } from '../constants.js';

/**
 * Helper to build the 3-tier wall finish (taupe lower, grey textured middle,
 * off-white top, plus two dark walnut horizontal trim strips) along X or Z.
 */
function buildThreeTierWall({
  length,
  x,
  z,
  normalAxis, // 'x' (facing +X or -X) or 'z' (facing +Z or -Z)
  normalDir,  // +1 or -1
  mats
}) {
  const g = new THREE.Group();
  const t = 0.02;
  const trimT = 0.025;
  const offset = normalDir * (t * 0.5);
  const trimOff = normalDir * (t + trimT * 0.5);

  const mkPanel = (h, yCenter, mat) => {
    const w = normalAxis === 'z' ? length : t;
    const d = normalAxis === 'z' ? t : length;
    return makeBox(w, h, d, mat, x + (normalAxis === 'x' ? offset : 0), yCenter, z + (normalAxis === 'z' ? offset : 0), {
      cast: false,
      receive: true
    });
  };

  const mkTrim = (yCenter) => {
    const w = normalAxis === 'z' ? length : trimT;
    const d = normalAxis === 'z' ? trimT : length;
    return makeBox(w, 0.036, d, mats.darkWalnut, x + (normalAxis === 'x' ? trimOff : 0), yCenter, z + (normalAxis === 'z' ? trimOff : 0), {
      cast: true,
      receive: true
    });
  };

  g.add(mkPanel(ROOM.BAND_LOW_H, ROOM.BAND_LOW_H * 0.5, mats.wallTaupeLower));
  g.add(mkPanel(ROOM.BAND_MID_H, ROOM.BAND_LOW_H + ROOM.BAND_MID_H * 0.5, mats.wallGreyPanel));
  g.add(mkPanel(ROOM.BAND_TOP_H, ROOM.BAND_LOW_H + ROOM.BAND_MID_H + ROOM.BAND_TOP_H * 0.5, mats.wallOffWhite));
  g.add(mkTrim(ROOM.BAND_LOW_H));
  g.add(mkTrim(ROOM.BAND_LOW_H + ROOM.BAND_MID_H));
  return g;
}

/**
 * Reusable interior oak flush door with architectural groove lines and lever handle.
 */
export function buildOakDoor(width, height, mats, { hingeSide = 'left', pivotName = 'doorPivot' } = {}) {
  const frameGroup = new THREE.Group();
  const jambT = 0.055;
  const depth = 0.14;

  // Outer door frame
  frameGroup.add(makeBox(jambT, height, depth, mats.warmWood, -width / 2 + jambT / 2, height / 2, 0));
  frameGroup.add(makeBox(jambT, height, depth, mats.warmWood, width / 2 - jambT / 2, height / 2, 0));
  frameGroup.add(makeBox(width, jambT, depth, mats.warmWood, 0, height - jambT / 2, 0));

  const leafW = width - jambT * 2;
  const leafH = height - jambT;
  const pivot = new THREE.Group();
  pivot.name = pivotName;
  const hingeX = hingeSide === 'left' ? -leafW / 2 : leafW / 2;
  pivot.position.set(hingeX, 0, 0);

  const leafCenterX = hingeSide === 'left' ? leafW / 2 : -leafW / 2;
  const leaf = makeBox(leafW, leafH, 0.045, mats.warmWood, leafCenterX, leafH / 2, 0);
  pivot.add(leaf);

  // Architectural dark groove lines
  [0.45, 1.48].forEach((gy) => {
    pivot.add(makeBox(leafW - 0.02, 0.008, 0.048, mats.darkWalnut, leafCenterX, gy, 0));
  });
  pivot.add(makeBox(0.008, leafH - 0.04, 0.048, mats.darkWalnut, leafCenterX + (hingeSide === 'left' ? 0.14 : -0.14), leafH / 2, 0));

  // Lever handle on latch side
  const handleX = hingeSide === 'left' ? leafW - 0.09 : -(leafW - 0.09);
  const leverDir = hingeSide === 'left' ? -1 : 1;
  pivot.add(makeBox(0.04, 0.055, 0.06, mats.matteBlackMetal, handleX, 1.0, 0));
  pivot.add(makeBox(0.11, 0.018, 0.018, mats.matteBlackMetal, handleX + leverDir * 0.045, 1.0, 0.05));
  pivot.add(makeBox(0.11, 0.018, 0.018, mats.matteBlackMetal, handleX + leverDir * 0.045, 1.0, -0.05));

  frameGroup.add(pivot);
  return { frameGroup, pivot };
}

export function buildArchitecture(mats) {
  const group = new THREE.Group();
  group.name = 'Architecture';

  const interactive = {
    entrancePivot: null,
    bedroomPivot: null,
    washroomPivot: null,
    balconySlider: null,
    ceilingGroup: null,
    fanRotor: null,
    ledMeshes: []
  };

  // 1. Main Floor Slab (Living + Dining + Kitchen)
  const floorW = ROOM.X_EAST - ROOM.X_WEST + 0.4;
  const floorD = ROOM.Z_SOUTH - ROOM.Z_NORTH + 0.4;
  const mainFloor = makeBox(
    floorW,
    0.1,
    floorD,
    mats.floorMarble,
    (ROOM.X_WEST + ROOM.X_EAST) * 0.5,
    -0.05,
    (ROOM.Z_NORTH + ROOM.Z_SOUTH) * 0.5,
    { cast: false, receive: true, name: 'MainFloor' }
  );
  group.add(mainFloor);

  // Corridor & Outdoor Balcony Floors
  group.add(makeBox(1.8, 0.1, 1.3, mats.floorMarble, 3.6, -0.05, 1.75, { cast: false, receive: true }));
  group.add(makeBox(2.2, 0.1, 1.5, mats.wallOffWhite, -1.4, -0.06, 1.85, { cast: false, receive: true }));
  group.add(makeBox(1.3, 0.1, 1.65, mats.wallGreyPanel, 5.65, -0.06, -2.0, { cast: false, receive: true }));

  // 2. North Wall (z = -3.60)
  // Bright Foyer behind Entrance Door so opening the door reveals lit space
  group.add(makeBox(1.6, ROOM.CEILING_H, 1.2, mats.wallOffWhite, -1.75, ROOM.CEILING_H * 0.5, ROOM.Z_NORTH - 0.65, { cast: false }));
  // North structural backing wall (right of entrance door)
  group.add(makeBox(6.35, ROOM.CEILING_H, ROOM.WALL_T, mats.wallOffWhite, 1.9, ROOM.CEILING_H * 0.5, ROOM.Z_NORTH - ROOM.WALL_T * 0.5));
  // Header above entrance door
  group.add(makeBox(1.25, ROOM.BAND_TOP_H, ROOM.WALL_T, mats.wallOffWhite, -1.78, 2.2 + ROOM.BAND_TOP_H * 0.5, ROOM.Z_NORTH - ROOM.WALL_T * 0.5));
  group.add(makeBox(1.25, 0.036, 0.03, mats.darkWalnut, -1.78, 2.2, ROOM.Z_NORTH + 0.01));

  // Main Entrance Door (x = -2.35..-1.20) with 3 vertical black marble inlay strips & smart lock
  const entDoorW = 1.15;
  const entDoorH = 2.20;
  const entFrame = new THREE.Group();
  entFrame.position.set(-1.78, 0, ROOM.Z_NORTH);
  entFrame.add(makeBox(0.06, entDoorH, 0.14, mats.warmWood, -entDoorW / 2 + 0.03, entDoorH / 2, 0));
  entFrame.add(makeBox(0.06, entDoorH, 0.14, mats.warmWood, entDoorW / 2 - 0.03, entDoorH / 2, 0));
  entFrame.add(makeBox(entDoorW, 0.06, 0.14, mats.warmWood, 0, entDoorH - 0.03, 0));

  const entPivot = new THREE.Group();
  entPivot.name = 'EntranceDoorPivot';
  const entLeafW = entDoorW - 0.12;
  const entLeafH = entDoorH - 0.06;
  entPivot.position.set(-entLeafW / 2, 0, 0);
  entPivot.add(makeBox(entLeafW, entLeafH, 0.05, mats.warmWood, entLeafW / 2, entLeafH / 2, 0));
  // 3 vertical black-gold marble inlay strips on latch side
  [0.54, 0.68, 0.82].forEach((ix) => {
    entPivot.add(makeBox(0.065, entLeafH - 0.02, 0.054, mats.blackMarble, ix, entLeafH / 2, 0));
  });
  // Smart lock body & handle
  entPivot.add(makeBox(0.075, 0.24, 0.08, mats.matteBlackMetal, 0.92, 1.06, 0));
  entPivot.add(makeBox(0.11, 0.02, 0.02, mats.matteBlackMetal, 0.85, 1.0, 0.05));
  entFrame.add(entPivot);
  group.add(entFrame);
  interactive.entrancePivot = entPivot;

  // Sofa Back Wall 3-tier paneling (x = -1.18 .. 2.04)
  group.add(
    buildThreeTierWall({
      length: 3.22,
      x: 0.43,
      z: ROOM.Z_NORTH,
      normalAxis: 'z',
      normalDir: 1,
      mats
    })
  );

  // Golden Abstract 3-Figure Artwork above sofa
  const sofaArtGroup = new THREE.Group();
  sofaArtGroup.position.set(0.45, 1.58, ROOM.Z_NORTH + 0.035);
  sofaArtGroup.add(makeBox(1.28, 0.48, 0.024, mats.matteBlackMetal, 0, 0, 0));
  sofaArtGroup.add(makeBox(1.22, 0.42, 0.028, mats.sofaArt, 0, 0, 0.004));
  group.add(sofaArtGroup);

  // 3. West Wall (x = -2.40, z = -3.60 .. 1.15)
  const westLen = ROOM.Z_SOUTH - ROOM.Z_NORTH;
  group.add(
    makeBox(ROOM.WALL_T, ROOM.CEILING_H, westLen + 0.2, mats.wallOffWhite, ROOM.X_WEST - ROOM.WALL_T * 0.5, ROOM.CEILING_H * 0.5, (ROOM.Z_NORTH + ROOM.Z_SOUTH) * 0.5)
  );
  group.add(
    buildThreeTierWall({
      length: westLen,
      x: ROOM.X_WEST,
      z: (ROOM.Z_NORTH + ROOM.Z_SOUTH) * 0.5,
      normalAxis: 'x',
      normalDir: 1,
      mats
    })
  );

  // Wall-mounted 65" TV + Sunset Bridge Image
  const tvGroup = new THREE.Group();
  tvGroup.position.set(ROOM.X_WEST + 0.045, 1.58, -1.95);
  tvGroup.add(makeBox(0.03, 0.84, 1.46, mats.matteBlackMetal, 0, 0, 0));
  tvGroup.add(makeBox(0.034, 0.80, 1.42, mats.tvScreen, 0.004, 0, 0));
  group.add(tvGroup);
  // White switchboard plate under TV
  group.add(makeBox(0.02, 0.11, 0.24, mats.whiteCeramic, ROOM.X_WEST + 0.03, 0.72, -1.95));

  // 4. Living-Kitchen Partition Wall (x = 2.10, z = -3.60 .. -0.55)
  const partLen = ROOM.Z_PART_END - ROOM.Z_NORTH;
  const partZMid = (ROOM.Z_NORTH + ROOM.Z_PART_END) * 0.5;
  group.add(makeBox(ROOM.WALL_T, ROOM.CEILING_H, partLen, mats.wallOffWhite, ROOM.X_PART, ROOM.CEILING_H * 0.5, partZMid));
  // Living side 3-tier paneling
  group.add(
    buildThreeTierWall({
      length: partLen,
      x: ROOM.X_PART - ROOM.WALL_T * 0.5,
      z: partZMid,
      normalAxis: 'x',
      normalDir: -1,
      mats
    })
  );
  // Vertical dark walnut trim at South end of Partition Wall
  group.add(makeBox(0.04, ROOM.CEILING_H, 0.04, mats.darkWalnut, ROOM.X_PART - 0.06, ROOM.CEILING_H * 0.5, ROOM.Z_PART_END));
  group.add(makeBox(0.04, ROOM.CEILING_H, 0.04, mats.darkWalnut, ROOM.X_PART + 0.06, ROOM.CEILING_H * 0.5, ROOM.Z_PART_END));

  // 3 Circular Mid-Century Artworks on Living side of Partition Wall
  [-2.8, -2.05, -1.3].forEach((cz, idx) => {
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.025, 32), mats.matteBlackMetal);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(ROOM.X_PART - ROOM.WALL_T * 0.5 - 0.032, 1.58, cz);
    rim.castShadow = true;
    group.add(rim);

    const art = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.028, 32), mats.circleArts[idx]);
    art.rotation.z = Math.PI / 2;
    art.rotation.x = Math.PI / 2;
    art.position.set(ROOM.X_PART - ROOM.WALL_T * 0.5 - 0.034, 1.58, cz);
    group.add(art);
  });

  // 5. South Wall (z = 1.15)
  // Pillar between West wall and Balcony opening (-2.40..-2.32), Header above Balcony opening (-2.32..-0.62)
  group.add(makeBox(0.12, ROOM.CEILING_H, ROOM.WALL_T, mats.wallOffWhite, -2.38, ROOM.CEILING_H * 0.5, ROOM.Z_SOUTH + ROOM.WALL_T * 0.5));
  group.add(makeBox(1.74, 0.5, ROOM.WALL_T, mats.wallOffWhite, -1.47, 2.7, ROOM.Z_SOUTH + ROOM.WALL_T * 0.5));
  // Wall section for Dining Feature Panel (-0.62 .. 1.65)
  group.add(makeBox(2.27, ROOM.CEILING_H, ROOM.WALL_T, mats.wallOffWhite, 0.515, ROOM.CEILING_H * 0.5, ROOM.Z_SOUTH + ROOM.WALL_T * 0.5));
  // Header above Bedroom Door (1.65 .. 2.65)
  group.add(makeBox(1.0, 0.7, ROOM.WALL_T, mats.wallOffWhite, 2.15, 2.6, ROOM.Z_SOUTH + ROOM.WALL_T * 0.5));
  // Wall pier between Bedroom Door and Corridor (2.65 .. 2.95)
  group.add(makeBox(0.3, ROOM.CEILING_H, ROOM.WALL_T, mats.wallOffWhite, 2.8, ROOM.CEILING_H * 0.5, ROOM.Z_SOUTH + ROOM.WALL_T * 0.5));
  // Corridor back wall & header (z = 2.25)
  group.add(makeBox(2.3, ROOM.CEILING_H, ROOM.WALL_T, mats.wallOffWhite, 4.0, ROOM.CEILING_H * 0.5, 2.25));

  // Balcony Sliding Glass Door Frame (x = -2.32 .. -0.62, y = 0 .. 2.45)
  const balcFrame = new THREE.Group();
  balcFrame.position.set(-1.47, 0, ROOM.Z_SOUTH + 0.04);
  balcFrame.add(makeBox(0.05, 2.45, 0.08, mats.matteBlackMetal, -0.825, 1.225, 0));
  balcFrame.add(makeBox(0.05, 2.45, 0.08, mats.matteBlackMetal, 0.825, 1.225, 0));
  balcFrame.add(makeBox(1.7, 0.05, 0.08, mats.matteBlackMetal, 0, 2.425, 0));
  balcFrame.add(makeBox(1.7, 0.03, 0.08, mats.matteBlackMetal, 0, 0.015, 0));
  // Fixed glass panel (West half)
  balcFrame.add(makeBox(0.83, 2.38, 0.015, mats.clearWindowGlass, -0.415, 1.22, 0.015, { cast: false }));
  // Movable sliding door panel (East half)
  const slider = new THREE.Group();
  slider.name = 'BalconySlider';
  slider.add(makeBox(0.85, 2.38, 0.015, mats.clearWindowGlass, 0.415, 1.22, -0.015, { cast: false }));
  slider.add(makeBox(0.035, 2.38, 0.04, mats.matteBlackMetal, 0.0, 1.22, -0.015));
  slider.add(makeBox(0.035, 2.38, 0.04, mats.matteBlackMetal, 0.81, 1.22, -0.015));
  balcFrame.add(slider);
  group.add(balcFrame);
  interactive.balconySlider = slider;

  // Bedroom Door on South Wall (x = 1.65 .. 2.65)
  const { frameGroup: bedDoor, pivot: bedPivot } = buildOakDoor(1.0, 2.25, mats, {
    hingeSide: 'right',
    pivotName: 'BedroomDoorPivot'
  });
  bedDoor.position.set(2.15, 0, ROOM.Z_SOUTH + 0.06);
  group.add(bedDoor);
  interactive.bedroomPivot = bedPivot;

  // 6. Kitchen North & East Perimeter Walls
  // East Wall (x = 5.00): North segment (-3.60 .. -2.75), Utility Balcony Parapet (-2.75 .. -1.30), Appliance + Washbasin (-1.30 .. 2.25)
  group.add(makeBox(ROOM.WALL_T, ROOM.CEILING_H, 0.95, mats.wallOffWhite, ROOM.X_EAST + ROOM.WALL_T * 0.5, ROOM.CEILING_H * 0.5, -3.175));
  // Utility balcony parapet wall + granite cap
  group.add(makeBox(ROOM.WALL_T, 0.88, 1.48, mats.wallGreyPanel, ROOM.X_EAST + ROOM.WALL_T * 0.5, 0.44, -2.02));
  group.add(makeBox(0.22, 0.04, 1.52, mats.blackGranite, ROOM.X_EAST + 0.06, 0.9, -2.02));
  // Header above utility balcony opening
  group.add(makeBox(ROOM.WALL_T, 0.55, 1.5, mats.wallOffWhite, ROOM.X_EAST + ROOM.WALL_T * 0.5, 2.675, -2.02));
  // East wall behind Appliance counter & Washroom alcove
  group.add(makeBox(ROOM.WALL_T, ROOM.CEILING_H, 3.6, mats.wallOffWhite, ROOM.X_EAST + ROOM.WALL_T * 0.5, ROOM.CEILING_H * 0.5, 0.5));
  // Utility balcony 3D trees (instead of flat billboard card)
  const utilTreeMat = new THREE.MeshStandardMaterial({ color: 0x5d9444, roughness: 0.85 });
  const utilTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5c422c, roughness: 0.9 });
  const uTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 1.8, 10), utilTrunkMat);
  uTrunk.position.set(6.05, 0.9, -1.9);
  group.add(uTrunk);
  [
    [6.05, 2.05, -1.9, 0.55],
    [5.95, 1.75, -1.55, 0.45],
    [6.1, 1.85, -2.25, 0.42]
  ].forEach(([lx, ly, lz, lr]) => {
    const lf = new THREE.Mesh(new THREE.SphereGeometry(lr, 14, 12), utilTreeMat);
    lf.position.set(lx, ly, lz);
    group.add(lf);
  });
  group.add(makeBox(1.3, 0.9, 0.12, mats.wallGreyPanel, 5.6, 0.45, -2.85));

  // Washroom Door in South-East Corridor (x = 3.55, z = 2.18)
  const { frameGroup: washDoor, pivot: washPivot } = buildOakDoor(0.92, 2.25, mats, {
    hingeSide: 'left',
    pivotName: 'WashroomDoorPivot'
  });
  washDoor.position.set(3.55, 0, 2.18);
  group.add(washDoor);
  interactive.washroomPivot = washPivot;

  // 7. Ceiling Group (toggleable in Dollhouse view!)
  const ceilingGroup = new THREE.Group();
  ceilingGroup.name = 'CeilingGroup';

  // Main ceiling slab
  const ceilSlab = makeBox(7.8, 0.12, 5.2, mats.ceilingMatte, 1.3, ROOM.CEILING_H + 0.06, -1.15, {
    cast: false,
    receive: true
  });
  ceilingGroup.add(ceilSlab);

  // Kitchen drop soffit beam separating living/dining from kitchen ceiling
  ceilingGroup.add(makeBox(0.18, 0.42, 4.9, mats.wallOffWhite, ROOM.X_PART + 0.02, ROOM.CEILING_H - 0.21, -1.15));
  ceilingGroup.add(makeBox(2.9, 0.42, 0.28, mats.wallOffWhite, 3.55, ROOM.CEILING_H - 0.21, 1.15));

  // Two Living Room Linear LED Light Strips
  [-1.7, 1.35].forEach((lx) => {
    const strip = makeBox(0.065, 0.02, 3.6, mats.ledStrip, lx, ROOM.CEILING_H - 0.005, -1.45, { cast: false });
    ceilingGroup.add(strip);
    interactive.ledMeshes.push(strip);
  });

  // Dining / Curtain Cove Warm LED
  const curtainCove = makeBox(1.7, 0.03, 0.08, mats.ledCoveWarm, -1.47, ROOM.CEILING_H - 0.02, ROOM.Z_SOUTH - 0.12, { cast: false });
  ceilingGroup.add(curtainCove);
  interactive.ledMeshes.push(curtainCove);

  // Recessed Round Spotlights with black trim
  [
    [-1.4, -2.5],
    [1.15, -2.7],
    [1.15, -2.2],
    [-0.15, -1.8],
    [-1.1, 0.55],
    [0.5, 0.45],
    [3.5, -0.5],
    [3.5, 0.65]
  ].forEach(([sx, sz]) => {
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.02, 18), mats.matteBlackMetal);
    rim.position.set(sx, ROOM.CEILING_H - 0.005, sz);
    ceilingGroup.add(rim);

    const bulb = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.022, 18), mats.ledStrip);
    bulb.position.set(sx, ROOM.CEILING_H - 0.007, sz);
    ceilingGroup.add(bulb);
    interactive.ledMeshes.push(bulb);
  });

  // Modern White 3-Blade Ceiling Fan centered in Living Room
  const fanGroup = new THREE.Group();
  fanGroup.name = 'CeilingFan';
  fanGroup.position.set(-0.15, ROOM.CEILING_H, -1.85);
  // Downrod & canopy
  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.14, 24), mats.fanWhite);
  canopy.position.y = -0.07;
  fanGroup.add(canopy);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 16), mats.fanWhite);
  rod.position.y = -0.18;
  fanGroup.add(rod);

  const fanRotor = new THREE.Group();
  fanRotor.name = 'FanRotor';
  fanRotor.position.y = -0.26;
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.095, 0.07, 28), mats.fanWhite);
  fanRotor.add(hub);

  // 3 Sculpted Aerodynamic Fan Blades
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(0.08, -0.03);
  bladeShape.quadraticCurveTo(0.32, -0.09, 0.62, -0.055);
  bladeShape.quadraticCurveTo(0.68, 0.0, 0.62, 0.055);
  bladeShape.quadraticCurveTo(0.32, 0.065, 0.08, 0.03);
  bladeShape.closePath();

  const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2
  });
  bladeGeo.rotateX(Math.PI / 2);

  for (let i = 0; i < 3; i++) {
    const holder = new THREE.Group();
    holder.rotation.y = (i * Math.PI * 2) / 3;
    const blade = new THREE.Mesh(bladeGeo, mats.fanWhite);
    blade.rotation.x = 0.12;
    blade.castShadow = true;
    holder.add(blade);
    fanRotor.add(holder);
  }
  fanGroup.add(fanRotor);
  ceilingGroup.add(fanGroup);
  interactive.fanRotor = fanRotor;

  group.add(ceilingGroup);
  interactive.ceilingGroup = ceilingGroup;

  return { group, interactive };
}
