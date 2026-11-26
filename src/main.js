import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { buildRoomModel } from './buildRoom.js';

const canvas = document.getElementById('viewport');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdce4ea);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;

const camera = new THREE.PerspectiveCamera(56, window.innerWidth / window.innerHeight, 0.08, 60);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.maxDistance = 24;
controls.minDistance = 0.5;

// Build Room
const { root, interactive } = buildRoomModel();
scene.add(root);

// Lighting Rig
const hemi = new THREE.HemisphereLight(0xfff9f0, 0xb8afa4, 0.72);
scene.add(hemi);

// Daylight from Balcony (South)
const balconySun = new THREE.DirectionalLight(0xfff6e8, 1.55);
balconySun.position.set(-2.0, 4.2, 5.2);
balconySun.castShadow = true;
balconySun.shadow.mapSize.set(2048, 2048);
balconySun.shadow.camera.near = 0.5;
balconySun.shadow.camera.far = 16;
balconySun.shadow.camera.left = -5.5;
balconySun.shadow.camera.right = 6.5;
balconySun.shadow.camera.top = 4.5;
balconySun.shadow.camera.bottom = -4.5;
balconySun.shadow.bias = -0.0005;
scene.add(balconySun);

// Living, Dining & Kitchen Interior Fill Lights
const addPointLight = (color, intensity, distance, x, y, z) => {
  const l = new THREE.PointLight(color, intensity, distance, 1.6);
  l.position.set(x, y, z);
  scene.add(l);
  return l;
};

addPointLight(0xfff5e4, 2.8, 9, -0.1, 2.7, -1.8); // Living center
addPointLight(0xffe8c8, 1.8, 7, 0.5, 2.5, 0.5);   // Dining cove
addPointLight(0xfff8ee, 2.6, 8, 3.6, 2.6, -0.8);  // Kitchen ceiling
addPointLight(0xffffff, 1.8, 6, -1.75, 2.3, -4.1); // Foyer behind entrance door

// Camera Presets matching the 5 reference photos + Dollhouse Cutaway
const PRESETS = {
  living: {
    pos: [0.08, 1.42, 0.38],
    target: [-0.08, 1.26, -2.55],
    fov: 68,
    ceiling: true
  },
  dining: {
    pos: [0.35, 1.38, -2.05],
    target: [0.12, 1.24, 1.15],
    fov: 60,
    ceiling: true
  },
  kitchenEast: {
    pos: [2.15, 1.40, -0.45],
    target: [4.85, 1.28, -0.55],
    fov: 65,
    ceiling: true
  },
  kitchenWest: {
    pos: [4.38, 1.38, -0.15],
    target: [-0.95, 1.26, -0.82],
    fov: 65,
    ceiling: true
  },
  panorama: {
    pos: [0.85, 1.46, 0.35],
    target: [-1.80, 1.30, -1.65],
    fov: 74,
    ceiling: true
  },
  dollhouse: {
    pos: [1.3, 8.8, 7.6],
    target: [1.3, 0.5, -1.1],
    fov: 52,
    ceiling: false
  }
};

// State
let fanOn = true;
let ceilingShown = true;
let doorsOpen = false;
let walkMode = false;
let transition = null;
const keysPressed = new Set();

const setCeilingVisibility = (visible) => {
  ceilingShown = visible;
  if (interactive.ceilingGroup) interactive.ceilingGroup.visible = visible;
  const btn = document.getElementById('btnCeiling');
  btn.classList.toggle('active', visible);
  btn.textContent = `Ceiling: ${visible ? 'Shown' : 'Hidden'}`;
};

function applyPreset(name) {
  const p = PRESETS[name];
  if (!p) return;
  walkMode = false;
  document.getElementById('btnWalk').classList.remove('active');
  document.getElementById('modeHint').textContent = 'Drag to orbit · Scroll to zoom · Right-drag to pan';

  setCeilingVisibility(p.ceiling);
  camera.fov = p.fov || 56;
  camera.updateProjectionMatrix();
  transition = {
    startPos: camera.position.clone(),
    endPos: new THREE.Vector3(...p.pos),
    startTarget: controls.target.clone(),
    endTarget: new THREE.Vector3(...p.target),
    t: 0
  };

  document.querySelectorAll('#cameraBar button').forEach((b) => {
    b.classList.toggle('active', b.dataset.preset === name);
  });
}

// Initialize from ?view=<preset> or default to Living Room view (Image 1)
const initialView = new URLSearchParams(window.location.search).get('view') || 'living';
const initPreset = PRESETS[initialView] || PRESETS.living;
setCeilingVisibility(initPreset.ceiling);
camera.fov = initPreset.fov || 56;
camera.updateProjectionMatrix();
camera.position.set(...initPreset.pos);
controls.target.set(...initPreset.target);
controls.update();
document.querySelectorAll('#cameraBar button').forEach((b) => {
  b.classList.toggle('active', b.dataset.preset === (PRESETS[initialView] ? initialView : 'living'));
});
window.__applyPreset = applyPreset;
window.__snapPreset = (name) => {
  const p = PRESETS[name];
  if (!p) return;
  transition = null;
  setCeilingVisibility(p.ceiling);
  if (p.fov) {
    camera.fov = p.fov;
    camera.updateProjectionMatrix();
  } else if (camera.fov !== 56) {
    camera.fov = 56;
    camera.updateProjectionMatrix();
  }
  camera.position.set(...p.pos);
  controls.target.set(...p.target);
  controls.update();
  document.querySelectorAll('#cameraBar button').forEach((b) => {
    b.classList.toggle('active', b.dataset.preset === name);
  });
  renderer.render(scene, camera);
};

// UI Listeners
document.querySelectorAll('#cameraBar button').forEach((btn) => {
  btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
});

document.getElementById('btnFan').addEventListener('click', (e) => {
  fanOn = !fanOn;
  e.target.classList.toggle('active', fanOn);
  e.target.textContent = `Fan: ${fanOn ? 'On' : 'Off'}`;
});

document.getElementById('btnCeiling').addEventListener('click', () => {
  setCeilingVisibility(!ceilingShown);
});

document.getElementById('btnDoors').addEventListener('click', (e) => {
  doorsOpen = !doorsOpen;
  e.target.classList.toggle('active', doorsOpen);
  e.target.textContent = `Doors: ${doorsOpen ? 'Open' : 'Closed'}`;
});

document.getElementById('btnWalk').addEventListener('click', (e) => {
  walkMode = !walkMode;
  e.target.classList.toggle('active', walkMode);
  document.getElementById('modeHint').textContent = walkMode
    ? 'WASD / Arrow keys to walk · Drag to look around'
    : 'Drag to orbit · Scroll to zoom · Right-drag to pan';
  if (walkMode) {
    camera.position.y = 1.48;
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    controls.target.copy(camera.position).addScaledVector(dir, 0.8);
  }
});

document.getElementById('btnExport').addEventListener('click', () => {
  const exporter = new GLTFExporter();
  const prevCeiling = interactive.ceilingGroup.visible;
  interactive.ceilingGroup.visible = true;
  exporter.parse(
    root,
    (result) => {
      interactive.ceilingGroup.visible = prevCeiling;
      const blob = new Blob([result], { type: 'model/gltf-binary' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'room_model.glb';
      a.click();
      URL.revokeObjectURL(url);
    },
    (err) => console.error('GLB export error:', err),
    { binary: true }
  );
});

window.addEventListener('keydown', (e) => keysPressed.add(e.code));
window.addEventListener('keyup', (e) => keysPressed.delete(e.code));

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
const clock = new THREE.Clock();
const forwardVec = new THREE.Vector3();
const rightVec = new THREE.Vector3();

const pauseLoop = new URLSearchParams(window.location.search).get('pause') === '1';

function animate() {
  if (!pauseLoop) requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (transition) {
    transition.t = Math.min(1, transition.t + dt * 2.2);
    const k = 1 - Math.pow(1 - transition.t, 3);
    camera.position.lerpVectors(transition.startPos, transition.endPos, k);
    controls.target.lerpVectors(transition.startTarget, transition.endTarget, k);
    if (transition.t >= 1) transition = null;
  }

  if (walkMode) {
    camera.getWorldDirection(forwardVec);
    forwardVec.y = 0;
    forwardVec.normalize();
    rightVec.crossVectors(forwardVec, camera.up).normalize();
    const speed = 2.4 * dt;
    const move = new THREE.Vector3();
    if (keysPressed.has('KeyW') || keysPressed.has('ArrowUp')) move.addScaledVector(forwardVec, speed);
    if (keysPressed.has('KeyS') || keysPressed.has('ArrowDown')) move.addScaledVector(forwardVec, -speed);
    if (keysPressed.has('KeyD') || keysPressed.has('ArrowRight')) move.addScaledVector(rightVec, speed);
    if (keysPressed.has('KeyA') || keysPressed.has('ArrowLeft')) move.addScaledVector(rightVec, -speed);
    camera.position.add(move);
    controls.target.add(move);
  }

  if (fanOn && interactive.fanRotor) {
    interactive.fanRotor.rotation.y += dt * 4.2;
  }

  // Smooth Door Open/Close animation
  const targetEntRot = doorsOpen ? 0.85 : 0;
  const targetBedRot = doorsOpen ? -0.9 : 0;
  const targetSlideX = doorsOpen ? -0.74 : 0;
  if (interactive.entrancePivot) {
    interactive.entrancePivot.rotation.y = THREE.MathUtils.lerp(interactive.entrancePivot.rotation.y, targetEntRot, dt * 5);
  }
  if (interactive.bedroomPivot) {
    interactive.bedroomPivot.rotation.y = THREE.MathUtils.lerp(interactive.bedroomPivot.rotation.y, targetBedRot, dt * 5);
  }
  if (interactive.washroomPivot) {
    interactive.washroomPivot.rotation.y = THREE.MathUtils.lerp(interactive.washroomPivot.rotation.y, -targetBedRot, dt * 5);
  }
  if (interactive.balconySlider) {
    interactive.balconySlider.position.x = THREE.MathUtils.lerp(interactive.balconySlider.position.x, targetSlideX, dt * 5);
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
