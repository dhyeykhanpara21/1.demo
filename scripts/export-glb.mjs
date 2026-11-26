import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { buildRoomModel } from '../src/buildRoom.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, '..', 'room_model.glb');

// Pure-JS CRC32 & PNG encoder so THREE.DataTexture embeds natively into .GLB in Node
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePNG(rgba, width, height) {
  const stride = width * 4;
  const raw = Buffer.alloc(height * (1 + stride));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + stride)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(raw, y * (1 + stride) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const idat = zlib.deflateSync(raw, { level: 6 });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

// Minimal browser Canvas + FileReader polyfill for GLTFExporter in Node
class NodeCanvas {
  constructor() {
    this.width = 0;
    this.height = 0;
    this._rgba = null;
  }
  getContext() {
    const self = this;
    return {
      createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }),
      putImageData: (imgData) => {
        self._rgba = new Uint8Array(imgData.data.buffer, imgData.data.byteOffset, imgData.data.byteLength);
      },
      translate() {},
      scale() {},
      drawImage() {}
    };
  }
  toBlob(cb, mimeType = 'image/png') {
    const png = encodePNG(this._rgba || new Uint8Array(this.width * this.height * 4), this.width, this.height);
    cb(new Blob([png], { type: mimeType }));
  }
}

globalThis.ImageData = class NodeImageData {
  constructor(data, width, height) {
    this.data = data;
    this.width = width;
    this.height = height;
  }
};

globalThis.document = {
  createElement: (tag) => {
    if (tag === 'canvas') return new NodeCanvas();
    return {};
  }
};

globalThis.FileReader = class NodeFileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      if (this.onloadend) this.onloadend({ target: this });
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buf) => {
      const b64 = Buffer.from(buf).toString('base64');
      this.result = `data:${blob.type || 'application/octet-stream'};base64,${b64}`;
      if (this.onloadend) this.onloadend({ target: this });
    });
  }
};

const { root } = buildRoomModel();
const exporter = new GLTFExporter();

exporter.parse(
  root,
  (glb) => {
    const buf = Buffer.from(glb);
    fs.writeFileSync(outPath, buf);
    console.log(`Exported ${outPath} (${(buf.length / 1024).toFixed(1)} KB)`);
  },
  (err) => {
    console.error('GLB export failed:', err);
    process.exit(1);
  },
  { binary: true }
);
