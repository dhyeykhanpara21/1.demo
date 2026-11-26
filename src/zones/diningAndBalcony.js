import * as THREE from 'three';
import { ROOM, makeBox } from '../constants.js';

export function buildDiningAndBalcony(mats) {
  const group = new THREE.Group();
  group.name = 'DiningAndBalcony';

  const zWall = ROOM.Z_SOUTH; // 1.15
  const diningCenterX = 0.50;

  // 1. Backlit Dining Feature Panel (x = -0.35 .. +1.35, y = 0 .. 2.35)
  const panelW = 1.70;
  const panelH = 2.35;
  const frameT = 0.055;
  const panelGroup = new THREE.Group();
  panelGroup.position.set(diningCenterX, 0, zWall);

  // Warm oak outer frame
  panelGroup.add(makeBox(frameT, panelH, 0.06, mats.warmWood, -panelW / 2 + frameT / 2, panelH / 2, -0.03));
  panelGroup.add(makeBox(frameT, panelH, 0.06, mats.warmWood, panelW / 2 - frameT / 2, panelH / 2, -0.03));
  panelGroup.add(makeBox(panelW, frameT, 0.06, mats.warmWood, 0, panelH - frameT / 2, -0.03));

  // Warm perimeter LED cove glow strip
  panelGroup.add(makeBox(0.025, panelH - frameT, 0.03, mats.ledCoveWarm, -panelW / 2 + frameT + 0.015, (panelH - frameT) / 2, -0.02, { cast: false }));
  panelGroup.add(makeBox(0.025, panelH - frameT, 0.03, mats.ledCoveWarm, panelW / 2 - frameT - 0.015, (panelH - frameT) / 2, -0.02, { cast: false }));
  panelGroup.add(makeBox(panelW - frameT * 2, 0.025, 0.03, mats.ledCoveWarm, 0, panelH - frameT - 0.015, -0.02, { cast: false }));

  // Recessed textured grey inner panel
  panelGroup.add(makeBox(panelW - frameT * 2.6, panelH - frameT * 1.4, 0.035, mats.wallGreyPanel, 0, (panelH - frameT * 1.4) / 2, -0.022));

  // Centered Black-Framed Orange Citrus Botanical Artwork
  panelGroup.add(makeBox(0.80, 1.00, 0.028, mats.matteBlackMetal, 0, 1.48, -0.048));
  panelGroup.add(makeBox(0.74, 0.94, 0.032, mats.citrusArt, 0, 1.48, -0.05));
  group.add(panelGroup);

  // 2. Black Veined Marble Dining Table + Tableware
  const tableZ = zWall - 0.56; // 0.59
  const tableW = 1.42;
  const tableD = 0.82;
  const tableH = 0.76;
  const table = new THREE.Group();
  table.name = 'DiningTable';
  table.position.set(diningCenterX, 0, tableZ);

  table.add(makeBox(tableW, 0.038, tableD, mats.blackMarble, 0, tableH - 0.019, 0));
  table.add(makeBox(tableW - 0.14, 0.045, tableD - 0.16, mats.darkWalnut, 0, tableH - 0.06, 0));
  // Four slim dark legs
  [
    [-tableW / 2 + 0.10, -tableD / 2 + 0.09],
    [tableW / 2 - 0.10, -tableD / 2 + 0.09],
    [-tableW / 2 + 0.10, tableD / 2 - 0.09],
    [tableW / 2 - 0.10, tableD / 2 - 0.09]
  ].forEach(([lx, lz]) => {
    table.add(makeBox(0.048, tableH - 0.06, 0.048, mats.darkWalnut, lx, (tableH - 0.06) / 2, lz));
  });

  // 4 Cream placemats & 4 tall glasses
  [
    [-0.36, 0.20],
    [0.36, 0.20],
    [-0.50, 0],
    [0.50, 0]
  ].forEach(([px, pz], idx) => {
    const mat = makeBox(idx < 2 ? 0.34 : 0.24, 0.004, idx < 2 ? 0.22 : 0.34, mats.pillowPatternA, px, tableH + 0.002, pz, { cast: false });
    table.add(mat);
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.018, 0.14, 14), mats.clearWindowGlass);
    glass.position.set(px * 0.65, tableH + 0.07, pz + 0.04);
    table.add(glass);
  });

  // Two tiny green succulent planters
  [-0.18, 0.18].forEach((px) => {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.022, 0.045, 12), mats.whiteCeramic);
    pot.position.set(px, tableH + 0.0225, 0.04);
    table.add(pot);
    const plant = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), mats.foliageBackdrop);
    plant.position.set(px, tableH + 0.055, 0.04);
    table.add(plant);
  });
  group.add(table);

  // 3. Four Upholstered Dining Chairs (2 in front, 1 left end, 1 right end)
  const makeChair = (cx, cz, rotY) => {
    const c = new THREE.Group();
    c.position.set(cx, 0, cz);
    c.rotation.y = rotY;
    // 4 Tapered dark walnut legs
    [
      [-0.18, -0.18],
      [0.18, -0.18],
      [-0.18, 0.18],
      [0.18, 0.18]
    ].forEach(([lx, lz]) => {
      c.add(makeBox(0.036, 0.44, 0.036, mats.darkWalnut, lx, 0.22, lz));
    });
    // Seat cushion & frame
    c.add(makeBox(0.42, 0.055, 0.42, mats.chairFabric, 0, 0.46, 0));
    // Tall upholstered backrest framed in dark walnut
    c.add(makeBox(0.42, 0.50, 0.04, mats.darkWalnut, 0, 0.72, -0.19));
    c.add(makeBox(0.35, 0.43, 0.048, mats.chairFabric, 0, 0.72, -0.188));
    group.add(c);
  };

  // Front two chairs (north side facing south toward dining wall)
  makeChair(diningCenterX - 0.30, tableZ - 0.44, 0);
  makeChair(diningCenterX + 0.30, tableZ - 0.44, 0);
  // End chairs
  makeChair(diningCenterX - 0.86, tableZ, Math.PI / 2);
  makeChair(diningCenterX + 0.86, tableZ, -Math.PI / 2);

  // 4. White Sheer Pleated Curtain (West half of Balcony Door)
  const curtainGroup = new THREE.Group();
  curtainGroup.name = 'SheerCurtain';
  const cWidth = 0.96;
  const cHeight = ROOM.CEILING_H - 0.04;
  const cGeo = new THREE.PlaneGeometry(cWidth, cHeight, 48, 2);
  const pos = cGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setZ(i, Math.sin(x * 38) * 0.045);
  }
  cGeo.computeVertexNormals();
  const curtainMesh = new THREE.Mesh(cGeo, mats.sheerCurtain);
  curtainMesh.position.set(-1.90, cHeight * 0.5 + 0.01, zWall - 0.07);
  curtainMesh.castShadow = true;
  curtainGroup.add(curtainMesh);
  group.add(curtainGroup);

  // 5. Outdoor Balcony: Rattan Hanging Egg Swing Chair + 3D Trees + Glass Balustrade
  const balcony = new THREE.Group();
  balcony.name = 'BalconyZone';
  // Glass & metal balustrade at z = 2.52
  balcony.add(makeBox(2.2, 0.04, 0.05, mats.matteBlackMetal, -1.42, 1.02, 2.52));
  balcony.add(makeBox(2.15, 0.98, 0.02, mats.clearWindowGlass, -1.42, 0.50, 2.52, { cast: false }));

  // 3D Balcony Potted Trees (looks clean in both interior and Dollhouse views!)
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x5d9444, roughness: 0.85 });
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c422c, roughness: 0.9 });
  [
    [-2.0, 2.85, 2.4],
    [-1.1, 3.05, 2.7]
  ].forEach(([tx, tz, th]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, th * 0.65, 10), trunkMat);
    trunk.position.set(tx, th * 0.32, tz);
    balcony.add(trunk);
    [
      [0, th * 0.72, 0, 0.58],
      [-0.32, th * 0.64, 0.18, 0.44],
      [0.34, th * 0.68, -0.15, 0.46]
    ].forEach(([lx, ly, lz, lr]) => {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(lr, 14, 12), treeMat);
      leaf.position.set(tx + lx, ly, tz + lz);
      balcony.add(leaf);
    });
  });

  // Rattan Hanging Egg Swing Chair on dark curved C-stand
  const swing = new THREE.Group();
  swing.position.set(-1.12, 0, 1.88);
  swing.rotation.y = 0.32;
  // Circular base ring
  const baseRing = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.022, 10, 32), mats.matteBlackMetal);
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.022;
  swing.add(baseRing);

  // Curved C-arm stand pole (behind basket at +Z)
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.02, 0.44),
    new THREE.Vector3(0, 0.95, 0.52),
    new THREE.Vector3(0, 1.78, 0.25),
    new THREE.Vector3(0, 1.94, -0.05)
  ]);
  const pole = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.022, 10, false), mats.matteBlackMetal);
  pole.castShadow = true;
  swing.add(pole);

  // Hanging chain
  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.42, 8), mats.brushedSteel);
  chain.position.set(0, 1.72, -0.05);
  swing.add(chain);

  // Rattan Egg Basket (opening faces -Z into the room!)
  const basket = new THREE.Group();
  basket.position.set(0, 1.02, -0.05);
  const shellGeo = new THREE.SphereGeometry(0.44, 22, 16, -Math.PI * 0.22, Math.PI * 1.44, 0.14, Math.PI * 0.84);
  const shellMat = mats.rattanWicker.clone();
  shellMat.side = THREE.DoubleSide;
  const shell = new THREE.Mesh(shellGeo, shellMat);
  shell.scale.set(0.95, 1.18, 0.84);
  shell.castShadow = true;
  basket.add(shell);

  // Wicker rim & horizontal ribs
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.02, 10, 28), mats.rattanWicker);
  rim.scale.set(1.0, 1.24, 1.0);
  rim.position.set(0, 0.0, -0.26);
  basket.add(rim);

  // Seat cushion & accent pillow inside swing
  const cush = new THREE.Mesh(new THREE.SphereGeometry(0.30, 16, 12), mats.pillowPatternA);
  cush.scale.set(1.0, 0.38, 0.88);
  cush.position.set(0, -0.28, 0.04);
  basket.add(cush);
  swing.add(basket);
  balcony.add(swing);
  group.add(balcony);

  return group;
}
