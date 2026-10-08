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
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: textures[t], transparent: true, depthWrite: false, fog: false, opacity: 0.9 }));
    sprite.position.set(x, y, z);
    sprite.scale.set(s * 1.6, s, 1);
    sprite.renderOrder = z > 3 ? 6 : 2;
    group.add(sprite);
    puffs.push({ sprite, x, y, s, speed: 0.15 + rand() * 0.25, phase: rand() * 6 });
  };
  // midground banks around the base of the ridge
  [[-6, 0.4, 1.5, 5, 0], [-2.5, -0.4, 2.5, 4.5, 2], [4, 0, 1.8, 5, 0], [8, 0.8, 0.5, 4, 1], [-10, 1, 0, 5.5, 2]].forEach((p) => add(...p));
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
