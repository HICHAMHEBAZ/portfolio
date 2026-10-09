import * as THREE from 'three';

// Soft, out-of-focus haze (the amber wash's --haze / --haze-2) and a few distant birds.
// Movement against the still figure is the point of the shot.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function puffTexture(inner, outer, seed) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const rand = seeded(seed);
  ctx.filter = 'blur(14px)';
  // a cluster of overlapping soft lobes reads as a dust cloud, not a circle
  for (let i = 0; i < 7; i++) {
    const x = size * (0.3 + rand() * 0.4);
    const y = size * (0.35 + rand() * 0.35);
    const r = size * (0.14 + rand() * 0.14);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createDust() {
  const textures = [
    puffTexture('rgba(255,243,176,0.95)', 'rgba(255,243,176,0)', 1),
    puffTexture('rgba(251,176,112,0.9)', 'rgba(251,176,112,0)', 2),
    puffTexture('rgba(254,214,106,0.9)', 'rgba(254,214,106,0)', 3),
  ];
  const rand = seeded(77);
  const group = new THREE.Group();
  const puffs = [];
  const add = (x, y, z, s, t) => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: textures[t], transparent: true, depthWrite: false, fog: false, opacity: z > 3 ? 0.75 : 0.45 }));
    sprite.position.set(x, y, z);
    sprite.scale.set(s * 1.6, s, 1);
    sprite.renderOrder = z > 3 ? 6 : 2;
    group.add(sprite);
    puffs.push({ sprite, x, y, s, speed: 0.15 + rand() * 0.25, phase: rand() * 6 });
  };
  // midground banks around the base of the ridge
  [[-7, -0.6, 1.5, 4.5, 0], [4.5, -1.2, 1.8, 4.5, 0], [9, -0.2, 0.5, 4, 1], [-11, 0, 0, 5, 2]].forEach((p) => add(...p));
  // big blurry foreground drifts (close to the lens)
  [[-4, -3.4, 6, 7, 1], [6.5, -3, 5.5, 6.5, 0], [12, -1.8, 4.5, 5, 1]].forEach((p) => add(...p));

  const update = (t) => {
    puffs.forEach((p) => {
      p.sprite.position.x = p.x + Math.sin(t * p.speed * 0.4 + p.phase) * 1.2;
      p.sprite.position.y = p.y + Math.sin(t * p.speed + p.phase) * 0.15;
      const breathe = 1 + Math.sin(t * p.speed * 0.8 + p.phase) * 0.05;
      p.sprite.scale.set(p.s * 1.6 * breathe, p.s * breathe, 1);
    });
  };
  return { group, update };
}

function birdGeometry() {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    0, 0, 0, -0.42, 0.16, 0, -0.18, 0.02, 0,
    0, 0, 0, 0.18, 0.02, 0, 0.42, 0.16, 0,
  ]), 3));
  return g;
}

export function createBirds(count = 4) {
  const mesh = new THREE.InstancedMesh(birdGeometry(), new THREE.MeshBasicMaterial({ color: '#1d142c', side: THREE.DoubleSide, fog: false }), count);
  mesh.frustumCulled = false;
  const rand = seeded(91);
  const flock = Array.from({ length: count }, () => ({ x: (rand() - 0.5) * 30, y: 6 + rand() * 3, z: -12 - rand() * 6, speed: 0.4 + rand() * 0.4, phase: rand() * 6, s: 0.35 + rand() * 0.25 }));
  const dummy = new THREE.Object3D();
  const update = (t) => {
    flock.forEach((b, i) => {
      const x = ((b.x + t * b.speed + 25) % 50) - 25;
      const flap = Math.sin(t * 7 * b.speed + b.phase);
      dummy.position.set(x, b.y + Math.sin(t * 0.6 + b.phase) * 0.3, b.z);
      dummy.scale.set(b.s, b.s * (0.3 + 0.7 * Math.abs(flap)) * Math.sign(flap || 1), 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  return { mesh, update };
}

function grainTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.9)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

// Wind-blown sand: grains stream across the frame in gusts, catching the backlight.
export function createSand(count = 220) {
  const rand = seeded(53);
  const BOX = { x: 36, y: 7, z: 16 };
  const seeds = Array.from({ length: count }, () => ({
    x: (rand() - 0.5) * BOX.x, y: -3.6 + rand() * BOX.y, z: -8 + rand() * BOX.z,
    speed: 0.6 + rand() * 1.4, lift: rand() * 6, wobble: 0.2 + rand() * 0.5,
  }));
  const positions = new Float32Array(count * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: '#fff3b0', size: 0.07, map: grainTexture(), transparent: true, opacity: 0.75, depthWrite: false, fog: false,
  });
  const points = new THREE.Points(geo, material);
  points.frustumCulled = false;
  points.renderOrder = 4;

  let drift = 0;
  const update = (t, dt) => {
    // gusts: the wind breathes on a slow two-sine cycle, never stops
    const gust = 0.55 + 0.45 * Math.sin(t * 0.35) * Math.sin(t * 0.13 + 1);
    drift += dt * (0.6 + gust * 1.6);
    seeds.forEach((s, i) => {
      const x = ((s.x + drift * s.speed + BOX.x / 2) % BOX.x + BOX.x) % BOX.x - BOX.x / 2;
      positions[i * 3] = x;
      positions[i * 3 + 1] = s.y + Math.sin(t * s.wobble + s.lift) * 0.25;
      positions[i * 3 + 2] = s.z;
    });
    geo.attributes.position.needsUpdate = true;
    material.opacity = 0.35 + gust * 0.45;
  };
  return { points, update };
}
