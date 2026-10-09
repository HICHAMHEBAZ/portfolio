import * as THREE from 'three';
import { midCrest } from './dunes.js';

// A small caravan crossing the far dune crest: ink cut-outs on two drawings,
// swapped on "twos" like cel animation, softened by the haze.
const W = 256;
const H = 192;
const GROUND = 184;

function limb(ctx, x, y, angle, len) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.sin(angle) * len, y + Math.cos(angle) * len);
  ctx.stroke();
}

function drawCamel(frame) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = ctx.strokeStyle = '#1d142c';
  ctx.lineCap = 'round';
  ctx.lineWidth = 9;
  // legs: the two drawings swap which pair reaches forward
  const swing = frame ? 0.32 : -0.32;
  const legLen = GROUND - 112;
  limb(ctx, 82, 112, swing, legLen);
  limb(ctx, 98, 112, -swing, legLen);
  limb(ctx, 150, 112, -swing, legLen);
  limb(ctx, 166, 112, swing, legLen);
  // body, hump, neck, head
  ctx.beginPath(); ctx.ellipse(124, 98, 60, 24, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(118, 76, 32, 26, 0, Math.PI, 0); ctx.fill();
  ctx.lineWidth = 14;
  ctx.beginPath(); ctx.moveTo(176, 96); ctx.quadraticCurveTo(206, 92, 206, 56); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(216, 54, 17, 9, 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(64, 92); ctx.quadraticCurveTo(54, 104, 58, 118); ctx.stroke();
  // rider: robe, shoulders, turban with a trailing tail
  ctx.beginPath(); ctx.moveTo(104, 66); ctx.lineTo(132, 66); ctx.lineTo(126, 24); ctx.lineTo(110, 24); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(118, 16, 9, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(110, 14); ctx.quadraticCurveTo(96, frame ? 18 : 12, 86, frame ? 24 : 20); ctx.stroke();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createCaravan({ anchor, count = 3, speed = 0.45, span = 22, center = -13 }) {
  const frames = [drawCamel(0), drawCamel(1)];
  const group = new THREE.Group();
  const size = 1.05;
  const geo = new THREE.PlaneGeometry(size * (W / H), size);
  geo.translate(0, size / 2, 0); // pivot at the feet
  const walkers = Array.from({ length: count }, (_, i) => {
    const material = new THREE.MeshBasicMaterial({ map: frames[0], transparent: true, depthWrite: false, opacity: 0 });
    const mesh = new THREE.Mesh(geo, material);
    mesh.scale.setScalar(i === 0 ? 1 : 0.92);
    group.add(mesh);
    return { mesh, material, offset: -i * 2.1, phase: i * 0.37 };
  });

  // presence 0..1 fades the caravan out of the haze during the opening shot
  const update = (t, presence = 1) => {
    walkers.forEach((w) => {
      const local = ((((6 + t * speed + w.offset) % span) + span) % span) - span / 2;
      const x = center + local;
      const crest = midCrest(x);
      const step = Math.floor((t + w.phase) * 4) % 2; // the two drawings swap four times a second
      w.material.map = frames[step];
      w.mesh.position.set(anchor.x + x, anchor.y + crest.y - 0.08 + (step ? 0.02 : 0), anchor.z + crest.z + 0.4);
      // fade at the ends of the walk so the wrap never pops
      const edge = Math.min(1, (span / 2 - Math.abs(local)) / 3);
      w.material.opacity = presence * Math.max(0, edge);
    });
  };
  return { group, update };
}
