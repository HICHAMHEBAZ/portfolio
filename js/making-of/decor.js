import * as THREE from 'three';
import { mix } from './palette.js';
import { WORLD } from './world.js';

// Set dressing from the film's world, all flat ink silhouettes tinted by the wash:
// acacias along the road, a tent at each notes field
// (where the job was done by hand), and a few birds crossing the sky.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function silhouette(w, h, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = ctx.strokeStyle = '#fff';
  draw(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// a flat-topped acacia: a forked trunk under a wide, layered canopy
const acaciaTex = () => silhouette(256, 256, (ctx) => {
  ctx.lineCap = 'round';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(128, 256);
  ctx.lineTo(124, 170);
  ctx.lineTo(90, 112);
  ctx.moveTo(124, 170);
  ctx.lineTo(170, 108);
  ctx.stroke();
  [[128, 96, 104, 22], [92, 108, 54, 14], [170, 104, 58, 15], [130, 80, 70, 16]].forEach(([x, y, rx, ry]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });
});

// a nomad tent: a low ridged roof on poles, the door flap left open
const tentTex = () => silhouette(256, 160, (ctx) => {
  ctx.beginPath();
  ctx.moveTo(8, 158);
  ctx.quadraticCurveTo(40, 70, 96, 40);
  ctx.lineTo(160, 40);
  ctx.quadraticCurveTo(216, 70, 248, 158);
  ctx.closePath();
  ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.moveTo(110, 158);
  ctx.lineTo(128, 92);
  ctx.lineTo(150, 158);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(96, 40);
  ctx.lineTo(90, 8);
  ctx.moveTo(160, 40);
  ctx.lineTo(166, 8);
  ctx.stroke();
});

const birdTex = (open) => silhouette(64, 32, (ctx) => {
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(4, open ? 8 : 20);
  ctx.quadraticCurveTo(18, open ? 4 : 14, 32, 20);
  ctx.quadraticCurveTo(46, open ? 4 : 14, 60, open ? 8 : 20);
  ctx.stroke();
});

function planted(w, h, material) {
  const geo = new THREE.PlaneGeometry(w, h);
  geo.translate(0, h / 2, 0);
  return new THREE.Mesh(geo, material);
}

export function createDecor(scene, fields) {
  const rand = seeded(73);
  const group = new THREE.Group();
  const far = new THREE.MeshBasicMaterial({ map: acaciaTex(), transparent: true, depthWrite: false });
  const tents = new THREE.MeshBasicMaterial({ map: tentTex(), transparent: true, depthWrite: false });

  for (let x = WORLD.start; x < WORLD.end; x += 7 + rand() * 9) {
    const s = 1.6 + rand() * 1.8;
    const tree = planted(s * 1.3, s * 1.3, far);
    tree.position.set(x, -0.05, -4 - rand() * 7);
    tree.scale.x = rand() > 0.5 ? 1 : -1;
    group.add(tree);
  }
  fields.forEach((f) => {
    const tent = planted(4.2, 2.6, tents);
    tent.position.set(f.x + 5.5, 0, -2.8);
    group.add(tent);
  });

  const flaps = [birdTex(true), birdTex(false)];
  const birdMat = new THREE.SpriteMaterial({ map: flaps[0], transparent: true, depthWrite: false });
  const birds = Array.from({ length: 7 }, (_, i) => {
    const s = new THREE.Sprite(birdMat.clone());
    const k = 0.45 + rand() * 0.4;
    s.scale.set(k, k / 2, 1);
    group.add(s);
    return { s, dx: rand() * 10 - 2, y: 6.5 + rand() * 2.4, z: -12 - rand() * 6, phase: rand() * 6, speed: 0.5 + rand() * 0.3 };
  });
  scene.add(group);

  return {
    update(t, camX) {
      far.color.copy(mix.ridgeNear).lerp(mix.ink, 0.55);
      tents.color.copy(mix.ink);
      // the flock drifts across whatever frame the camera holds, wrapping off its edges
      birds.forEach((b, i) => {
        const drift = ((t * b.speed + b.dx + i * 1.3) % 18) - 6;
        b.s.position.set(camX + drift, b.y + Math.sin(t * 0.8 + b.phase) * 0.3, b.z);
        b.s.material.map = flaps[Math.floor(t * 4 + b.phase) % 2];
        b.s.material.color.copy(mix.ink);
      });
    },
  };
}
