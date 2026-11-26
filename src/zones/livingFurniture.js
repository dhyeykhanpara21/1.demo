import * as THREE from 'three';
import { ROOM, makeBox } from '../constants.js';

export function buildLivingFurniture(mats) {
  const group = new THREE.Group();
  group.name = 'LivingFurniture';

  // 1. Floating/Floor-standing TV Console with Rounded South End
  const consoleGroup = new THREE.Group();
  consoleGroup.name = 'TVConsole';
  const cX = ROOM.X_WEST; // -2.40
  const cDepth = 0.44;
  const cZStart = -3.45;
  const cZEnd = 0.62;
  const cStraightLen = cZEnd - cZStart - cDepth * 0.5;
  const cBodyH = 0.30;
  const cBaseY = 0.04;

  // Top dark walnut slab with rounded front-south end
  const topShape = new THREE.Shape();
  // Shape in (x_local = depth from wall, y_local = along Z)
  const rCorner = cDepth * 0.5;
  const straightZ = cZEnd - cZStart - rCorner;
  topShape.moveTo(0, 0);
  topShape.lineTo(cDepth, 0);
  topShape.lineTo(cDepth, straightZ);
  topShape.absarc(rCorner, straightZ, rCorner, 0, Math.PI, false);
  topShape.lineTo(0, 0);
  topShape.closePath();

  const extrudeSettings = (depth) => ({
    depth,
    bevelEnabled: false,
    curveSegments: 24
  });

  // Top slab
  const topGeo = new THREE.ExtrudeGeometry(topShape, extrudeSettings(0.036));
  topGeo.rotateX(Math.PI / 2);
  const topMesh = new THREE.Mesh(topGeo, mats.darkWalnut);
  topMesh.position.set(cX, cBaseY + cBodyH + 0.036, cZStart);
  topMesh.castShadow = true;
  topMesh.receiveShadow = true;
  consoleGroup.add(topMesh);

  // Rounded wood body base at south end
  const bodyRoundShape = new THREE.Shape();
  bodyRoundShape.moveTo(0, straightZ - 0.55);
  bodyRoundShape.lineTo(cDepth - 0.02, straightZ - 0.55);
  bodyRoundShape.lineTo(cDepth - 0.02, straightZ);
  bodyRoundShape.absarc(rCorner - 0.01, straightZ, rCorner - 0.01, 0, Math.PI, false);
  bodyRoundShape.lineTo(0, straightZ - 0.55);
  bodyRoundShape.closePath();

  const southBodyGeo = new THREE.ExtrudeGeometry(bodyRoundShape, extrudeSettings(cBodyH));
  southBodyGeo.rotateX(Math.PI / 2);
  const southBody = new THREE.Mesh(southBodyGeo, mats.warmWood);
  southBody.position.set(cX, cBaseY + cBodyH, cZStart);
  southBody.castShadow = true;
  southBody.receiveShadow = true;
  consoleGroup.add(southBody);

  // Center glossy grey drawers + North warm wood section
  consoleGroup.add(makeBox(cDepth - 0.02, cBodyH, 0.95, mats.warmWood, cX + (cDepth - 0.02) * 0.5, cBaseY + cBodyH * 0.5, cZStart + 0.475));
  consoleGroup.add(makeBox(cDepth - 0.02, cBodyH, 1.15, mats.glossGreyDrawer, cX + (cDepth - 0.02) * 0.5, cBaseY + cBodyH * 0.5, cZStart + 0.95 + 0.575));
  consoleGroup.add(makeBox(cDepth - 0.02, cBodyH, 1.15, mats.glossGreyDrawer, cX + (cDepth - 0.02) * 0.5, cBaseY + cBodyH * 0.5, cZStart + 2.11 + 0.575));
  // Dark recessed plinth under console
  consoleGroup.add(makeBox(cDepth - 0.08, cBaseY, cStraightLen, mats.darkWalnut, cX + (cDepth - 0.08) * 0.5, cBaseY * 0.5, cZStart + cStraightLen * 0.5));

  // Small branching sculptural decor on north end of TV console
  const decor = new THREE.Group();
  decor.position.set(cX + 0.25, cBaseY + cBodyH + 0.036, -3.05);
  decor.add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.02, 16), mats.matteBlackMetal));
  [
    [0, 0.11, 0, 0.2],
    [-0.04, 0.12, 0.03, -0.35],
    [0.04, 0.1, -0.03, 0.4]
  ].forEach(([bx, bh, bz, rot]) => {
    const twig = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.012, bh, 8), mats.matteBlackMetal);
    twig.position.set(bx, bh * 0.5 + 0.01, bz);
    twig.rotation.z = rot;
    decor.add(twig);
  });
  consoleGroup.add(decor);
  group.add(consoleGroup);

  // 2. Tall Pooja / Mandir Unit (on south end of TV Console, z = -0.32 .. +0.52)
  const pooja = new THREE.Group();
  pooja.name = 'PoojaUnit';
  const pZ = 0.10;
  const pW = 0.84;
  const pD = 0.42;
  const pY0 = cBaseY + cBodyH + 0.036; // 0.376m

  // Lower 2-drawer cabinet (0.38 -> 0.78)
  pooja.add(makeBox(pD, 0.40, pW, mats.warmWood, cX + pD * 0.5, pY0 + 0.20, pZ));
  // Drawer divider groove + 2 small black knobs
  pooja.add(makeBox(0.01, 0.008, pW - 0.04, mats.darkWalnut, cX + pD + 0.003, pY0 + 0.20, pZ));
  [pY0 + 0.30, pY0 + 0.10].forEach((ky) => {
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 12), mats.matteBlackMetal);
    knob.position.set(cX + pD + 0.014, ky, pZ);
    pooja.add(knob);
  });

  // Back wall of open shrine & arch niche
  pooja.add(makeBox(0.03, 1.48, pW, mats.warmWood, cX + 0.015, pY0 + 0.40 + 0.74, pZ));
  // Side panels of Pooja cabinet
  pooja.add(makeBox(pD, 1.48, 0.045, mats.warmWood, cX + pD * 0.5, pY0 + 0.40 + 0.74, pZ - pW * 0.5 + 0.0225));
  pooja.add(makeBox(pD, 1.48, 0.045, mats.warmWood, cX + pD * 0.5, pY0 + 0.40 + 0.74, pZ + pW * 0.5 - 0.0225));

  // Two stepped wooden pedestals inside the shrine
  pooja.add(makeBox(0.28, 0.10, pW - 0.09, mats.warmWood, cX + 0.17, pY0 + 0.45, pZ));
  pooja.add(makeBox(0.14, 0.09, pW - 0.09, mats.warmWood, cX + 0.10, pY0 + 0.545, pZ));

  // Upper Arched Mural Backdrop & Arched Wood Fascia
  pooja.add(makeBox(0.015, 0.78, pW - 0.09, mats.poojaMural, cX + 0.04, pY0 + 1.44, pZ));

  // Carved arch fascia frame across upper front of Pooja unit
  const archW = pW - 0.09;
  const archH = 0.86;
  const archR = archW * 0.44;
  const archShape = new THREE.Shape();
  archShape.moveTo(-archW * 0.5, 0);
  archShape.lineTo(archW * 0.5, 0);
  archShape.lineTo(archW * 0.5, archH);
  archShape.lineTo(-archW * 0.5, archH);
  archShape.closePath();

  const hole = new THREE.Path();
  hole.moveTo(-archR, 0);
  hole.lineTo(-archR, 0.45);
  hole.absarc(0, 0.45, archR, Math.PI, 0, true);
  hole.lineTo(archR, 0);
  hole.closePath();
  archShape.holes.push(hole);

  const archGeo = new THREE.ExtrudeGeometry(archShape, { depth: 0.04, bevelEnabled: false, curveSegments: 24 });
  archGeo.rotateY(Math.PI / 2);
  const archMesh = new THREE.Mesh(archGeo, mats.warmWood);
  archMesh.position.set(cX + pD - 0.04, pY0 + 1.02, pZ);
  archMesh.castShadow = true;
  pooja.add(archMesh);

  // Dark walnut top cornice cap
  pooja.add(makeBox(pD + 0.03, 0.045, pW + 0.04, mats.darkWalnut, cX + (pD + 0.03) * 0.5, pY0 + 1.90, pZ));
  group.add(pooja);

  // 3. L-Shaped Grey Sectional Sofa (North-East Living Corner)
  const sofa = new THREE.Group();
  sofa.name = 'LShapedSofa';
  // Back section along North wall (x = -0.82 .. 1.98, z = -3.54 .. -2.64)
  // Chaise/Right arm along Partition wall (x = 1.12 .. 1.98, z = -2.64 .. -1.16)
  // Dark wood base plinth & slim corner legs
  sofa.add(makeBox(2.80, 0.04, 0.88, mats.darkWalnut, 0.58, 0.14, -3.09));
  sofa.add(makeBox(0.88, 0.04, 1.48, mats.darkWalnut, 1.54, 0.14, -1.90));
  [
    [-0.76, -3.48],
    [-0.76, -2.70],
    [1.92, -3.48],
    [1.16, -1.22],
    [1.92, -1.22]
  ].forEach(([lx, lz]) => {
    sofa.add(makeBox(0.045, 0.12, 0.045, mats.darkWalnut, lx, 0.06, lz));
  });

  // Main seat cushions
  sofa.add(makeBox(2.60, 0.24, 0.84, mats.sofaFabric, 0.62, 0.28, -3.09));
  sofa.add(makeBox(0.84, 0.24, 1.46, mats.sofaFabric, 1.54, 0.28, -1.91));
  // Left track arm & Right/South end track arm
  sofa.add(makeBox(0.18, 0.54, 0.90, mats.sofaFabric, -0.73, 0.43, -3.09));
  sofa.add(makeBox(0.88, 0.54, 0.16, mats.sofaFabric, 1.54, 0.43, -1.24));
  // Backrest frames (North & East)
  sofa.add(makeBox(2.80, 0.58, 0.18, mats.sofaFabric, 0.58, 0.45, -3.44));
  sofa.add(makeBox(0.18, 0.58, 2.38, mats.sofaFabric, 1.89, 0.45, -2.35));

  // Soft back cushions along North & East
  [-0.30, 0.35, 1.00, 1.55].forEach((cx) => {
    sofa.add(makeBox(0.60, 0.36, 0.16, mats.sofaFabric, cx, 0.58, -3.26));
  });
  [-2.75, -2.10, -1.55].forEach((cz) => {
    sofa.add(makeBox(0.16, 0.36, 0.56, mats.sofaFabric, 1.72, 0.58, cz));
  });

  // Decorative throw pillows
  const addPillow = (x, y, z, rotY, rotX, mat) => {
    const p = makeBox(0.34, 0.34, 0.11, mat, x, y, z);
    p.rotation.set(rotX, rotY, 0);
    sofa.add(p);
  };
  addPillow(-0.46, 0.56, -3.14, 0.35, -0.15, mats.sofaFabric);
  addPillow(-0.18, 0.55, -3.10, 0.12, -0.18, mats.pillowPatternA);
  addPillow(1.50, 0.56, -3.05, -0.65, -0.15, mats.pillowPatternA);
  addPillow(1.56, 0.55, -2.35, -1.35, -0.16, mats.pillowPatternB);
  addPillow(1.55, 0.54, -1.65, -1.45, -0.16, mats.pillowPatternA);

  // Draped throw blanket on left end of sofa
  sofa.add(makeBox(0.32, 0.04, 0.72, mats.pillowPatternB, -0.45, 0.41, -3.00));
  sofa.add(makeBox(0.32, 0.24, 0.04, mats.pillowPatternB, -0.45, 0.29, -2.66));
  group.add(sofa);

  // 4. Two Round Nesting Coffee Tables (Grey Marble + Brushed Brass Rings)
  const addCoffeeTable = (cx, cz, radius, height) => {
    const t = new THREE.Group();
    t.position.set(cx, 0, cz);
    // Marble top
    const top = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.028, 36), mats.greyMarble);
    top.position.y = height - 0.014;
    top.castShadow = true;
    top.receiveShadow = true;
    t.add(top);

    // Top & bottom brass torus rings
    [height - 0.032, 0.018].forEach((ry) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius - 0.02, 0.011, 10, 36), mats.brassMetal);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = ry;
      ring.castShadow = true;
      t.add(ring);
    });

    // 4 Vertical brass legs
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + 0.4;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, height - 0.04, 10), mats.brassMetal);
      leg.position.set(Math.cos(a) * (radius - 0.02), height * 0.5, Math.sin(a) * (radius - 0.02));
      leg.castShadow = true;
      t.add(leg);
    }
    group.add(t);
    return t;
  };

  const tallTable = addCoffeeTable(0.32, -1.95, 0.38, 0.43);
  addCoffeeTable(0.56, -1.62, 0.33, 0.34);

  // Small book & glass tray decor on tall coffee table
  tallTable.add(makeBox(0.20, 0.022, 0.15, mats.whiteCeramic, 0, 0.442, 0));
  tallTable.add(makeBox(0.11, 0.07, 0.11, mats.clearWindowGlass, 0.01, 0.488, 0));

  return group;
}
