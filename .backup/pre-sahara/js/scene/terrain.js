import * as THREE from 'three';

// The ridge the figure stands on: a rocky mound with faceted, posterized
// shading (teal with ember flecks), plus far ridges and a blurred foreground.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hash(x, z) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x, z) {
  const xi = Math.floor(x); const zi = Math.floor(z);
  const xf = x - xi; const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf); const v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi); const b = hash(xi + 1, zi); const c = hash(xi, zi + 1); const d = hash(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

const PEAK = { x: 0, z: 0, height: 3.4 };

// height of the mound at (x, z) in its local space
export function moundHeight(x, z) {
  const r2 = (x * x) / 70 + (z * z) / 28;
  const mound = PEAK.height * Math.exp(-r2);
  let rock = 0;
  let amp = 0.55;
  let f = 0.6;
  for (let i = 0; i < 4; i++) {
    rock += Math.abs(vnoise(x * f, z * f) - 0.5) * amp;
    amp *= 0.5;
    f *= 2.1;
  }
  // a little flat top for the figure to stand on
  const plateau = Math.exp(-(x * x + z * z) / 1.2);
  return mound + rock * (0.4 + Math.exp(-r2) * 0.8) * (1 - plateau * 0.8) - 0.6;
}

export function createRidge() {
  // jitter the grid before un-indexing so facets are irregular but still closed
  const geo0 = new THREE.PlaneGeometry(46, 26, 170, 96);
  geo0.rotateX(-Math.PI / 2);
  const p0 = geo0.attributes.position;
  for (let i = 0; i < p0.count; i++) {
    const x = p0.getX(i);
    const z = p0.getZ(i);
    const jx = (hash(x * 3.1, z * 1.7) - 0.5) * 0.22;
    const jz = (hash(z * 2.3, x * 4.1) - 0.5) * 0.22;
    p0.setXYZ(i, x + jx, moundHeight(x + jx, z + jz), z + jz);
  }
  const geo = geo0.toNonIndexed();
  geo.computeVertexNormals();

  // colour by facet orientation, like a backlit rubble pile: most faces in
  // shadow, teal light only on the tops, the odd ember chip
  const pos = geo.attributes.position;
  const nrm = geo.attributes.normal;
  const rand = seeded(13);
  const shadow = new THREE.Color('#1b2129');
  const mid = new THREE.Color('#24414b');
  const lit = new THREE.Color('#3f8c8f');
  const rim = new THREE.Color('#7cc4b6');
  const ember = new THREE.Color('#d9602b');
  const colors = new Float32Array(pos.count * 3);
  for (let f = 0; f < pos.count; f += 3) {
    const ny = nrm.getY(f);
    const nz = nrm.getZ(f); // facing away from camera = toward the light behind
    const facing = ny * 0.7 - nz * 0.5 + (rand() - 0.5) * 0.25;
    let c = shadow;
    if (facing > 0.78) c = rand() < 0.04 ? ember : rim;
    else if (facing > 0.55) c = lit;
    else if (facing > 0.3) c = mid;
    for (let k = 0; k < 3; k++) c.toArray(colors, (f + k) * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const gradient = new THREE.DataTexture(new Uint8Array([90, 90, 90, 255, 170, 170, 170, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  gradient.minFilter = gradient.magFilter = THREE.NearestFilter;
  gradient.needsUpdate = true;
  const mesh = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: gradient }));
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  return mesh;
}

export function createFarRidges() {
  const group = new THREE.Group();
  const layer = (seed, base, height, z, color) => {
    const rand = seeded(seed);
    const shape = new THREE.Shape();
    const w = 160;
    shape.moveTo(-w / 2, base - 30);
    let y = base;
    for (let i = 0; i <= 90; i++) {
      y = THREE.MathUtils.clamp(y + (rand() - 0.5) * 1.6, base, base + height);
      shape.lineTo(-w / 2 + (w * i) / 90, y);
    }
    shape.lineTo(w / 2, base - 30);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color }));
    m.position.z = z;
    return m;
  };
  group.add(layer(7, -1, 5, -48, '#d0875a'), layer(19, -2, 3.5, -32, '#9a5648'));
  return group;
}

// Out-of-focus foreground: dark rubble painted on a canvas, then blurred.
function blurredSilhouette(seed, w, h, color, blurPx) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const rand = seeded(seed);
  ctx.filter = `blur(${blurPx}px)`;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, h);
  let y = h * 0.45;
  for (let x = 0; x <= w; x += w / 40) {
    y = Math.max(h * 0.15, Math.min(h * 0.85, y + (rand() - 0.5) * h * 0.18));
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
  // a few slabs and sticks poking out, like debris
  for (let i = 0; i < 9; i++) {
    ctx.save();
    ctx.translate(rand() * w, h * (0.25 + rand() * 0.4));
    ctx.rotate((rand() - 0.5) * 1.6);
    ctx.fillRect(-w * 0.04, -h * 0.02, w * (0.06 + rand() * 0.12), h * 0.035);
    ctx.restore();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createForeground() {
  const group = new THREE.Group();
  const mk = (seed, w, h, x, y, z, flip) => {
    const tex = blurredSilhouette(seed, 1024, 512, '#22141c', 7);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set(x, y, z);
    if (flip) mesh.scale.x = -1;
    mesh.renderOrder = 5;
    return mesh;
  };
  // heavy mass bottom-right, a sliver bottom-left: keeps the title card readable
  group.add(mk(3, 12, 6, -14.5, -4.6, 7, false), mk(29, 18, 9, 8.5, -4.4, 6.5, true));
  return group;
}
