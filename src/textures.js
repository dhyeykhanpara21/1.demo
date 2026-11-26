import * as THREE from 'three';

/**
 * Deterministic PRNG (Mulberry32) so procedural textures look identical
 * across the live WebGL viewer and Node GLB exports.
 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2D(ix, iy, seed) {
  let n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1442695041);
  n = (n ^ (n >>> 13)) | 0;
  n = Math.imul(n, 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function valueNoise2D(x, y, seed) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2D(ix, iy, seed);
  const b = hash2D(ix + 1, iy, seed);
  const c = hash2D(ix, iy + 1, seed);
  const d = hash2D(ix + 1, iy + 1, seed);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x, y, seed, octaves = 4) {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    value += amp * valueNoise2D(x * freq, y * freq, seed + i * 97);
    freq *= 2.02;
    amp *= 0.5;
  }
  return value;
}

function clampByte(v) {
  return v < 0 ? 0 : v > 255 ? 255 : v | 0;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Lightweight pure-JS RGBA rasterizer producing THREE.DataTexture.
 */
class Raster {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height * 4);
  }

  fill(r, g, b, a = 255) {
    for (let i = 0; i < this.data.length; i += 4) {
      this.data[i] = r;
      this.data[i + 1] = g;
      this.data[i + 2] = b;
      this.data[i + 3] = a;
    }
  }

  blendPixel(x, y, r, g, b, alpha = 1) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const idx = (y * this.width + x) * 4;
    const inv = 1 - alpha;
    this.data[idx] = clampByte(this.data[idx] * inv + r * alpha);
    this.data[idx + 1] = clampByte(this.data[idx + 1] * inv + g * alpha);
    this.data[idx + 2] = clampByte(this.data[idx + 2] * inv + b * alpha);
    this.data[idx + 3] = 255;
  }

  fillRect(x, y, w, h, r, g, b, alpha = 1) {
    const x0 = Math.max(0, Math.floor(x));
    const y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(this.width, Math.ceil(x + w));
    const y1 = Math.min(this.height, Math.ceil(y + h));
    for (let py = y0; py < y1; py++) {
      for (let px = x0; px < x1; px++) {
        this.blendPixel(px, py, r, g, b, alpha);
      }
    }
  }

  fillCircle(cx, cy, radius, r, g, b, alpha = 1) {
    const x0 = Math.max(0, Math.floor(cx - radius));
    const y0 = Math.max(0, Math.floor(cy - radius));
    const x1 = Math.min(this.width - 1, Math.ceil(cx + radius));
    const y1 = Math.min(this.height - 1, Math.ceil(cy + radius));
    const r2 = radius * radius;
    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {
        const dx = px - cx;
        const dy = py - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 <= r2) {
          const edge = Math.min(1, (radius - Math.sqrt(d2)) * 1.2);
          this.blendPixel(px, py, r, g, b, alpha * Math.max(0, edge));
        }
      }
    }
  }

  fillEllipse(cx, cy, rx, ry, r, g, b, alpha = 1) {
    const x0 = Math.max(0, Math.floor(cx - rx));
    const y0 = Math.max(0, Math.floor(cy - ry));
    const x1 = Math.min(this.width - 1, Math.ceil(cx + rx));
    const y1 = Math.min(this.height - 1, Math.ceil(cy + ry));
    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {
        const nx = (px - cx) / rx;
        const ny = (py - cy) / ry;
        const d = nx * nx + ny * ny;
        if (d <= 1) {
          this.blendPixel(px, py, r, g, b, alpha * Math.min(1, (1 - d) * 4));
        }
      }
    }
  }

  drawLine(x0, y0, x1, y1, thickness, r, g, b, alpha = 1) {
    const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    const rad = Math.max(0.6, thickness * 0.5);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = lerp(x0, x1, t);
      const py = lerp(y0, y1, t);
      this.fillCircle(px, py, rad, r, g, b, alpha);
    }
  }

  toTexture(repeatX = 1, repeatY = 1, srgb = true) {
    const tex = new THREE.DataTexture(this.data, this.width, this.height, THREE.RGBAFormat);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.flipY = true;
    tex.needsUpdate = true;
    return tex;
  }
}

export function createTextures() {
  // 1. Cream Onyx Marble Floor & Kitchen Backsplash
  const creamMarble = (() => {
    const r = new Raster(256, 256);
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const u = x / 256;
        const v = y / 256;
        const n = fbm(u * 4.5, v * 4.5, 11, 4);
        const vein = Math.abs(Math.sin((u * 3.1 + v * 2.3 + n * 2.4) * Math.PI));
        const cloud = Math.pow(vein, 0.35);
        const cr = lerp(225, 246, cloud);
        const cg = lerp(214, 241, cloud);
        const cb = lerp(196, 232, cloud);
        const idx = (y * 256 + x) * 4;
        r.data[idx] = clampByte(cr);
        r.data[idx + 1] = clampByte(cg);
        r.data[idx + 2] = clampByte(cb);
        r.data[idx + 3] = 255;
      }
    }
    return r.toTexture(3, 3);
  })();

  // 2. Textured Grey Wallpaper (middle wall bands & dining panel)
  const greyWallpaper = (() => {
    const r = new Raster(256, 256);
    const rng = mulberry32(42);
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const n = fbm(x / 22, y / 22, 23, 3);
        const grain = (rng() - 0.5) * 14;
        const base = 172 + (n - 0.5) * 28 + grain;
        const idx = (y * 256 + x) * 4;
        r.data[idx] = clampByte(base);
        r.data[idx + 1] = clampByte(base + 1);
        r.data[idx + 2] = clampByte(base + 2);
        r.data[idx + 3] = 255;
      }
    }
    return r.toTexture(2, 1);
  })();

  // 3. Warm Oak / Teak Wood Grain (Pooja unit, doors, dining frame, console)
  const warmWood = (() => {
    const r = new Raster(256, 256);
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const n = fbm(x / 10, y / 95, 77, 4);
        const ring = Math.sin(x * 0.42 + n * 7.5) * 0.5 + 0.5;
        const fine = valueNoise2D(x * 0.8, y * 0.08, 99);
        const t = ring * 0.65 + fine * 0.35;
        const idx = (y * 256 + x) * 4;
        r.data[idx] = clampByte(lerp(132, 174, t));
        r.data[idx + 1] = clampByte(lerp(90, 126, t));
        r.data[idx + 2] = clampByte(lerp(54, 82, t));
        r.data[idx + 3] = 255;
      }
    }
    return r.toTexture(1, 1);
  })();

  // 4. Dark Walnut Wood (trims, TV console top, chair frames)
  const darkWalnut = (() => {
    const r = new Raster(128, 128);
    for (let y = 0; y < 128; y++) {
      for (let x = 0; x < 128; x++) {
        const n = fbm(x / 8, y / 45, 131, 3);
        const t = Math.sin(x * 0.35 + n * 5.0) * 0.5 + 0.5;
        const idx = (y * 128 + x) * 4;
        r.data[idx] = clampByte(lerp(48, 76, t));
        r.data[idx + 1] = clampByte(lerp(31, 49, t));
        r.data[idx + 2] = clampByte(lerp(21, 34, t));
        r.data[idx + 3] = 255;
      }
    }
    return r.toTexture(1, 1);
  })();

  // 5. Black Speckled Granite (Kitchen countertops)
  const blackGranite = (() => {
    const r = new Raster(256, 256);
    const rng = mulberry32(314);
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const n = fbm(x / 18, y / 18, 201, 3);
        const speck = rng();
        let v = 32 + n * 24;
        if (speck > 0.96) v = 135;
        else if (speck > 0.88) v = 82;
        else if (speck < 0.08) v = 18;
        const idx = (y * 256 + x) * 4;
        r.data[idx] = clampByte(v);
        r.data[idx + 1] = clampByte(v + 1);
        r.data[idx + 2] = clampByte(v + 3);
        r.data[idx + 3] = 255;
      }
    }
    return r.toTexture(2, 2);
  })();

  // 6. Black Marble with Gold/White Veins (Door inlays & Dining tabletop)
  const blackMarble = (() => {
    const r = new Raster(256, 256);
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const u = x / 256;
        const v = y / 256;
        const n = fbm(u * 5, v * 5, 505, 4);
        const vein = Math.max(0, 1 - Math.abs(Math.sin((u * 3.8 + v * 2.5 + n * 3.2) * Math.PI)) * 11);
        const idx = (y * 256 + x) * 4;
        r.data[idx] = clampByte(lerp(22, 198, vein));
        r.data[idx + 1] = clampByte(lerp(22, 176, vein));
        r.data[idx + 2] = clampByte(lerp(24, 145, vein));
        r.data[idx + 3] = 255;
      }
    }
    return r.toTexture(1, 1);
  })();

  // 7. Grey Veined Marble (Coffee table tops)
  const greyMarble = (() => {
    const r = new Raster(256, 256);
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const u = x / 256;
        const v = y / 256;
        const n = fbm(u * 4, v * 4, 610, 4);
        const vein = Math.pow(Math.abs(Math.sin((u * 2.6 - v * 2.1 + n * 2.8) * Math.PI)), 0.3);
        const base = lerp(110, 206, vein);
        const idx = (y * 256 + x) * 4;
        r.data[idx] = clampByte(base);
        r.data[idx + 1] = clampByte(base + 3);
        r.data[idx + 2] = clampByte(base + 8);
        r.data[idx + 3] = 255;
      }
    }
    return r.toTexture(1, 1);
  })();

  // 8. TV Screen: Sunset Bridge over Water
  const tvScreen = (() => {
    const r = new Raster(256, 144);
    for (let y = 0; y < 144; y++) {
      const t = y / 144;
      for (let x = 0; x < 256; x++) {
        let cr, cg, cb;
        if (y < 76) {
          // Sky gradient: deep dusk blue at top -> golden sunset at horizon
          const st = y / 76;
          cr = lerp(34, 245, Math.pow(st, 1.5));
          cg = lerp(92, 175, Math.pow(st, 1.2));
          cb = lerp(195, 118, st);
        } else {
          // Water reflection
          const wt = (y - 76) / 68;
          cr = lerp(220, 22, Math.pow(wt, 0.7));
          cg = lerp(150, 58, Math.pow(wt, 0.7));
          cb = lerp(115, 128, wt);
          const ripple = Math.sin(x * 0.25 + y * 0.9) * 14;
          cr += ripple;
          cg += ripple * 0.7;
        }
        const idx = (y * 256 + x) * 4;
        r.data[idx] = clampByte(cr);
        r.data[idx + 1] = clampByte(cg);
        r.data[idx + 2] = clampByte(cb);
        r.data[idx + 3] = 255;
      }
    }
    // Bridge deck & golden arch trusses
    r.fillRect(0, 72, 256, 5, 58, 48, 42);
    for (let i = 0; i < 3; i++) {
      const cx = 42 + i * 74;
      for (let a = Math.PI; a <= Math.PI * 2; a += 0.02) {
        const ax = cx + Math.cos(a) * 34;
        const ay = 72 + Math.sin(a) * 30;
        r.fillCircle(ax, ay, 1.6, 244, 194, 96);
      }
      for (let vx = -24; vx <= 24; vx += 8) {
        const h = Math.sqrt(Math.max(0, 30 * 30 - vx * vx)) * 0.85;
        r.drawLine(cx + vx, 72, cx + vx, 72 - h, 1.0, 232, 182, 88, 0.7);
      }
    }
    // Soft horizontal sunset shimmer on water (no full circle rings)
    for (let wy = 79; wy < 138; wy += 4) {
      const spread = 18 + (wy - 79) * 0.9;
      r.fillRect(105 - spread * 0.5, wy, spread, 1.5, 242, 184, 102, 0.28);
    }
    // Distant city skyline on right
    const heights = [18, 26, 15, 32, 22, 28, 16, 20];
    heights.forEach((h, i) => {
      r.fillRect(185 + i * 9, 72 - h, 7, h, 38, 46, 68);
    });
    return r.toTexture(1, 1);
  })();

  // 9. Pooja Mandir Arch Mural (Temple Domes, Foliage, Peacocks, Cows)
  const poojaMural = (() => {
    const r = new Raster(256, 320);
    // Soft blush cream background
    for (let y = 0; y < 320; y++) {
      const t = y / 320;
      r.fillRect(0, y, 256, 1, clampByte(lerp(245, 232, t)), clampByte(lerp(226, 238, t)), clampByte(lerp(220, 218, t)));
    }
    // Temple facade & domes
    r.fillRect(42, 132, 172, 118, 218, 204, 184);
    // Domes
    [76, 128, 180].forEach((dx, idx) => {
      const rad = idx === 1 ? 30 : 22;
      const dy = idx === 1 ? 114 : 124;
      r.fillCircle(dx, dy, rad, 224, 210, 188);
      r.drawLine(dx, dy - rad - 14, dx, dy - rad, 2.5, 178, 146, 86);
    });
    // Temple archways
    [74, 128, 182].forEach((ax) => {
      r.fillRect(ax - 18, 165, 36, 70, 142, 128, 108);
      r.fillCircle(ax, 165, 18, 142, 128, 108);
      r.fillRect(ax - 11, 174, 22, 56, 88, 105, 78);
    });
    // Lush green palm/banana leaves on left and right edges
    for (let i = 0; i < 7; i++) {
      r.drawLine(0, 70 + i * 24, 48 + (i % 2) * 14, 54 + i * 22, 7, 74, 126, 62, 0.88);
      r.drawLine(255, 74 + i * 24, 208 - (i % 2) * 14, 58 + i * 22, 7, 74, 126, 62, 0.88);
    }
    // Green lawn base
    r.fillRect(0, 245, 256, 75, 198, 212, 175);
    // Two sacred white cows on left & right foreground
    [46, 210].forEach((cx) => {
      r.fillEllipse(cx, 272, 22, 14, 245, 236, 220);
      r.fillCircle(cx + (cx < 128 ? 18 : -18), 260, 8, 245, 236, 220);
      r.fillRect(cx - 14, 282, 5, 18, 232, 222, 206);
      r.fillRect(cx + 9, 282, 5, 18, 232, 222, 206);
    });
    // Peacock silhouette on upper right dome
    r.fillEllipse(196, 118, 7, 10, 48, 92, 128);
    r.drawLine(196, 125, 208, 146, 5, 58, 118, 98);
    return r.toTexture(1, 1);
  })();

  // 10. Dining Orange Citrus Botanical Art
  const citrusArt = (() => {
    const r = new Raster(256, 320);
    r.fill(239, 235, 228);
    // Soft peach watercolor wash behind oranges
    r.fillEllipse(128, 162, 74, 102, 233, 205, 185, 0.72);
    r.fillEllipse(118, 145, 52, 65, 236, 198, 174, 0.55);
    // Branch & stems
    r.drawLine(132, 46, 122, 272, 3, 72, 68, 52);
    r.drawLine(128, 120, 96, 145, 2.5, 72, 68, 52);
    r.drawLine(126, 165, 160, 196, 2.5, 72, 68, 52);
    // Green leaves
    [
      [152, 86, 22, 10],
      [96, 98, 20, 9],
      [172, 142, 24, 11],
      [88, 212, 20, 9],
      [148, 238, 18, 9]
    ].forEach(([lx, ly, rx, ry]) => {
      r.fillEllipse(lx, ly, rx, ry, 72, 104, 62, 0.92);
    });
    // Two vibrant oranges
    r.fillCircle(98, 150, 34, 216, 98, 24);
    r.fillCircle(88, 140, 14, 238, 134, 46, 0.65);
    r.fillCircle(156, 198, 26, 232, 142, 34);
    r.fillCircle(148, 190, 11, 246, 174, 62, 0.6);
    return r.toTexture(1, 1);
  })();

  // 11. Sofa Back Wide Abstract Golden/Black Artwork
  const sofaArt = (() => {
    const r = new Raster(320, 112);
    r.fill(230, 212, 176);
    const blocks = [
      [0, 52, 175, 128, 58],
      [52, 48, 224, 196, 126],
      [100, 62, 242, 228, 195],
      [162, 58, 184, 132, 64],
      [220, 48, 128, 92, 48],
      [268, 52, 214, 174, 96]
    ];
    blocks.forEach(([x, w, cr, cg, cb]) => r.fillRect(x, 0, w, 112, cr, cg, cb, 0.85));
    // 3 stylized tall vertical figures
    [118, 164, 216].forEach((fx) => {
      r.fillCircle(fx, 34, 6, 32, 26, 22);
      r.fillEllipse(fx, 70, 10, 32, 28, 24, 20);
    });
    return r.toTexture(1, 1);
  })();

  // 12. Three Circular Mid-Century Artworks
  const circleArts = [0, 1, 2].map((variant) => {
    const r = new Raster(128, 128);
    r.fill(228, 224, 214);
    const palette = [
      [[220, 108, 42], [32, 44, 66], [235, 226, 208]],
      [[34, 52, 74], [218, 116, 48], [186, 204, 212]],
      [[64, 126, 118], [218, 112, 46], [228, 216, 192]]
    ][variant];
    for (let y = 0; y < 128; y++) {
      for (let x = 0; x < 128; x++) {
        const dx = x - 64;
        const dy = y - 64;
        const ang = Math.atan2(dy, dx) + variant * 1.1;
        const seg = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 3) % 3;
        const c = palette[seg];
        r.blendPixel(x, y, c[0], c[1], c[2], 1);
      }
    }
    // Stripes accent
    for (let i = 0; i < 6; i++) {
      r.drawLine(24, 34 + i * 8, 66, 34 + i * 8, 2.5, 28, 34, 42, 0.75);
    }
    return r.toTexture(1, 1);
  });

  // 13. Sunlit Balcony Tree Foliage Backdrop
  const foliage = (() => {
    const r = new Raster(256, 256);
    for (let y = 0; y < 256; y++) {
      const t = y / 256;
      r.fillRect(0, y, 256, 1, clampByte(lerp(245, 220, t)), clampByte(lerp(250, 232, t)), clampByte(lerp(248, 212, t)));
    }
    const rng = mulberry32(909);
    for (let i = 0; i < 95; i++) {
      const cx = 40 + rng() * 190;
      const cy = 20 + rng() * 195;
      const rad = 10 + rng() * 24;
      const g = 105 + rng() * 85;
      r.fillCircle(cx, cy, rad, 64 + rng() * 45, g, 46, 0.68);
    }
    return r.toTexture(1, 1);
  })();

  return {
    creamMarble,
    greyWallpaper,
    warmWood,
    darkWalnut,
    blackGranite,
    blackMarble,
    greyMarble,
    tvScreen,
    poojaMural,
    citrusArt,
    sofaArt,
    circleArts,
    foliage
  };
}
