import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

// Copy application source files
fs.cpSync(path.join(rootDir, 'src'), path.join(distDir, 'src'), { recursive: true });

// Copy Three.js browser build and JSM addons into vendor/ so static hosts serve them cleanly
fs.cpSync(
  path.join(rootDir, 'node_modules', 'three', 'build'),
  path.join(distDir, 'vendor', 'three', 'build'),
  { recursive: true }
);
fs.cpSync(
  path.join(rootDir, 'node_modules', 'three', 'examples', 'jsm'),
  path.join(distDir, 'vendor', 'three', 'examples', 'jsm'),
  { recursive: true }
);

// Copy pre-generated GLB if present
const glbPath = path.join(rootDir, 'room_model.glb');
if (fs.existsSync(glbPath)) {
  fs.copyFileSync(glbPath, path.join(distDir, 'room_model.glb'));
}

// Rewrite importmap paths in index.html from /node_modules/three/ to /vendor/three/
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const builtHtml = indexHtml.replaceAll('/node_modules/three/', '/vendor/three/');
fs.writeFileSync(path.join(distDir, 'index.html'), builtHtml, 'utf8');

console.log('Built static site into dist/');
