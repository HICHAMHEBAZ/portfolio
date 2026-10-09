import * as THREE from 'three';

// Cel-shaded Sahara: sharp-crested dunes lit from behind, so the faces toward
// the camera fall into the ink band and only the crests catch the light.
// Flat fills come from a 3-step toon ramp; the only gradients are in the haze.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// a soft-cornered sharp crest: |d| with a rounded tip, gentle windward, steep lee
const crestProfile = (d, windward, lee) => Math.exp(-Math.sqrt(d * d + 0.06) / (d > 0 ? windward : lee));

// ---------- the dune he stands on ----------
const PEAK = 3.4;
const crestZ = (x) => Math.sin(x * 0.19) * 1.1 + (Math.sin(x * 0.06 + 0.8) - Math.sin(0.8)) * 2.2;

function rawHeight(x, z) {
  const d = z - crestZ(x);
  const across = crestProfile(d, 3.6, 1.4) / crestProfile(0, 3.6, 1.4);
  const along = Math.exp(-(x * x) / 120);
  const swell = Math.sin(x * 0.35 + 1.3) * 0.25 + Math.sin(x * 0.13) * 0.35;
  // wind ripples on the windward face only
  const ripples = d > 0 ? Math.sin(x * 0.9 + d * 2.6 + Math.sin(x * 0.5) * 1.5) * 0.03 * Math.min(1, d) : 0;
  return PEAK * along * across + swell * 0.3 + ripples - 0.6;
}
const CREST_HEIGHT = rawHeight(0, 0);

// height of the near dune at (x, z) in its local space; a small level patch at the crest for his feet
export function moundHeight(x, z) {
  const level = Math.exp(-(x * x + z * z) / 0.9);
  return rawHeight(x, z) * (1 - level) + CREST_HEIGHT * level;
}

function toonRamp() {
  const ramp = new THREE.DataTexture(new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  return ramp;
}

function duneMesh(heightFn, { width, depth, segX, segZ, color, shadows }) {
  const geo = new THREE.PlaneGeometry(width, depth, segX, segZ);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, heightFn(pos.getX(i), pos.getZ(i)));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ color, gradientMap: toonRamp() }));
  mesh.receiveShadow = shadows;
  mesh.castShadow = shadows;
  return mesh;
}

export function createNearDune() {
  return duneMesh(moundHeight, { width: 64, depth: 30, segX: 220, segZ: 110, color: '#2f4744', shadows: true });
}

// ---------- the mid dune sea, where the caravan walks ----------
const MID_PEAKS = [
  { x: -22, h: 2.6, w: 70 }, { x: -9, h: 3.4, w: 55 }, { x: 4, h: 2.2, w: 40 },
  { x: 15, h: 3.9, w: 70 }, { x: 30, h: 2.8, w: 60 },
];
const midCrestZ = (x) => Math.sin(x * 0.15) * 1.0;

export function midHeight(x, z) {
  const across = crestProfile(z - midCrestZ(x), 4.2, 1.8);
  let h = 0;
  MID_PEAKS.forEach((p) => { h = Math.max(h, p.h * Math.exp(-((x - p.x) ** 2) / p.w)); });
  return (h + 0.6) * across - 0.4;
}
export const midCrest = (x) => ({ y: midHeight(x, midCrestZ(x)), z: midCrestZ(x) });

export function createMidDunes() {
  return duneMesh(midHeight, { width: 90, depth: 20, segX: 200, segZ: 50, color: '#55705f', shadows: false });
}

// ---------- flat far ridges, the haze does the depth ----------
export function createFarRidges() {
  const group = new THREE.Group();
  const layer = (seed, base, height, z, color) => {
    const rand = seeded(seed);
    const shape = new THREE.Shape();
    const w = 180;
    shape.moveTo(-w / 2, base - 30);
    let y = base;
    for (let i = 0; i <= 60; i++) {
      y = THREE.MathUtils.clamp(y + (rand() - 0.5) * 1.4, base, base + height);
      // dune-like: rounded swells instead of jagged rock
      const x0 = -w / 2 + (w * i) / 60;
      shape.quadraticCurveTo(x0 - w / 120, y + 0.6, x0, y);
    }
    shape.lineTo(w / 2, base - 30);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(shape, 4), new THREE.MeshBasicMaterial({ color }));
    m.position.z = z;
    return m;
  };
  group.add(layer(7, -1, 4.5, -48, '#8a9478'), layer(19, -2, 3, -32, '#5d7064'));
  return group;
}

// ---------- out-of-focus dune lips right at the lens ----------
function blurredLip(seed, w, h, color, blurPx) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const rand = seeded(seed);
  const a = 0.5 + rand();
  const b = 1.5 + rand() * 2;
  ctx.filter = `blur(${blurPx}px)`;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += w / 64) {
    const u = x / w;
    ctx.lineTo(x, h * (0.42 + Math.sin(u * a * Math.PI) * -0.12 + Math.sin(u * b * Math.PI + seed) * 0.06));
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createForeground() {
  const group = new THREE.Group();
  const mk = (seed, w, h, x, y, z, flip) => {
    const mat = new THREE.MeshBasicMaterial({ map: blurredLip(seed, 1024, 512, '#1d142c', 9), transparent: true, depthWrite: false, fog: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set(x, y, z);
    if (flip) mesh.scale.x = -1;
    mesh.renderOrder = 5;
    return mesh;
  };
  // heavy mass bottom-right, a sliver bottom-left: keeps the copy readable
  group.add(mk(3, 12, 6, -14.5, -4.8, 7, false), mk(29, 18, 9, 9, -4.6, 6.5, true));
  return group;
}
