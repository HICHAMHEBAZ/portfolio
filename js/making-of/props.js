import * as THREE from 'three';
import { drawCamel } from '../scene/caravan.js';
import { FACE, FACES, paintFace } from './board-art.js';
import { WASHES } from './palette.js';

// The things on the road: the signboards (one per step), the caravan that carries
// the work from board to board, and the field notes the wind gathers onto its load.
const smooth = (a, b, x) => THREE.MathUtils.smoothstep(x, a, b);

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function glowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,.7)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---------- the signboards ----------
const BOARD = { w: 3.4, h: 4.25, lift: 1.45 };

function board(x, beat, n, draw, wash, glow, renderer) {
  const p = WASHES[wash];
  const group = new THREE.Group();
  const ink = new THREE.MeshBasicMaterial({ color: p.ink });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(BOARD.w, BOARD.h, 0.16), ink);
  frame.position.y = BOARD.lift + BOARD.h / 2;
  const canvas = document.createElement('canvas');
  canvas.width = FACE.w;
  canvas.height = FACE.h;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const face = new THREE.Mesh(new THREE.PlaneGeometry(BOARD.w - 0.26, BOARD.h - 0.3), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  face.position.set(0, frame.position.y, 0.09);
  const postGeo = new THREE.BoxGeometry(0.16, BOARD.lift + 0.4, 0.16);
  const posts = [-1.1, 1.1].map((px) => {
    const m = new THREE.Mesh(postGeo, ink);
    m.position.set(px, (BOARD.lift + 0.4) / 2 - 0.4, -0.02);
    return m;
  });
  // a lantern on a crook at the board's corner: lit once the caravan has been here
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.08), ink);
  arm.position.set(BOARD.w / 2 + 0.3, BOARD.lift + BOARD.h - 0.2, 0);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.26), new THREE.MeshBasicMaterial({ color: p.ink }));
  lamp.position.set(BOARD.w / 2 + 0.55, BOARD.lift + BOARD.h - 0.45, 0);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: p.hot, transparent: true, depthWrite: false, opacity: 0 }));
  halo.scale.setScalar(1.6);
  halo.position.copy(lamp.position);
  group.add(frame, face, ...posts, arm, lamp, halo);
  group.position.set(x, 0, -1.6);
  group.rotation.y = n % 2 ? -0.08 : 0.06;
  const ready = document.fonts.ready.then(() => paintFace(canvas, draw, n, p)).then(() => { tex.needsUpdate = true; });
  const lampOn = new THREE.Color(p.hot);
  const lampOff = new THREE.Color(p.ink);
  return {
    group, beat, ready,
    update(u, t) {
      // it rises out of the sand as the caravan comes, and stays built
      const rise = smooth(beat - 0.95, beat - 0.3, u);
      group.position.y = (1 - rise) * -(BOARD.lift + BOARD.h + 0.6);
      group.visible = rise > 0.001;
      const lit = smooth(beat - 0.35, beat - 0.05, u);
      lamp.material.color.copy(lampOff).lerp(lampOn, lit);
      halo.material.opacity = lit * (0.7 + Math.sin(t * 7 + beat) * 0.06 + Math.sin(t * 13.7) * 0.04);
    },
  };
}

export function createBoards(scene, stations, renderer) {
  const glow = glowTexture();
  const boards = stations.map((s) => board(s.x, s.beat, s.n, FACES[s.device][s.n - 1], s.wash, glow, renderer));
  boards.forEach((b) => scene.add(b.group));
  return {
    ready: Promise.all(boards.map((b) => b.ready)),
    update: (u, t) => boards.forEach((b) => b.update(u, t)),
  };
}

// ---------- the caravan, on twos, with the load it collects ----------
const CAMEL = { size: 1.35, gap: 2.0 };

export function createCaravan(scene) {
  const frames = [drawCamel(0), drawCamel(1)];
  const geo = new THREE.PlaneGeometry(CAMEL.size * (256 / 192), CAMEL.size);
  geo.translate(0, CAMEL.size / 2, 0);
  const shadowGeo = new THREE.CircleGeometry(0.6, 24);
  shadowGeo.rotateX(-Math.PI / 2);
  const group = new THREE.Group();
  const walkers = [0, 1, 2].map((i) => {
    const material = new THREE.MeshBasicMaterial({ map: frames[0], transparent: true, depthWrite: false, toneMapped: false });
    const mesh = new THREE.Mesh(geo, material);
    mesh.scale.setScalar(i === 0 ? 1 : 0.94);
    const shadow = new THREE.Mesh(shadowGeo, new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.18, depthWrite: false }));
    shadow.scale.set(1.5, 1, 0.5);
    group.add(shadow, mesh);
    return { mesh, material, shadow, offset: -i * CAMEL.gap, phase: i * 0.37 };
  });
  // the load: a cream bundle roped in ink, riding behind the lead rider
  const load = new THREE.Group();
  const bundle = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.44, 0.4), new THREE.MeshBasicMaterial({ color: '#fff3e2' }));
  const ropeMat = new THREE.MeshBasicMaterial({ color: '#0d0820' });
  [-0.14, 0.14].forEach((rx) => {
    const rope = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.46, 0.42), ropeMat);
    rope.position.x = rx;
    load.add(rope);
  });
  load.add(bundle);
  group.add(load);
  group.position.z = 2.4;
  scene.add(group);

  let walkClock = 0;
  return {
    // world position of the load, where the gathered notes fly to
    loadPosition: (out) => out.copy(load.position).add(group.position),
    update(x, speed, t, dt, filled) {
      const moving = Math.min(1, Math.abs(speed) * 0.6);
      walkClock += dt * (moving > 0.05 ? 1 : 0);
      walkers.forEach((w) => {
        const step = moving > 0.05 ? Math.floor((walkClock + w.phase) * 5) % 2 : 0;
        w.material.map = frames[step];
        const bob = step ? 0.025 : 0;
        w.mesh.position.set(x + w.offset, bob, 0);
        w.shadow.position.set(x + w.offset + 0.1, 0.02, 0.05);
      });
      // the load grows with the notes gathered, settles with a small spring
      const s = 0.55 + filled * 0.75;
      load.scale.setScalar(THREE.MathUtils.damp(load.scale.x, s, 6, dt));
      load.position.set(x - 0.32, CAMEL.size * 0.86 + load.scale.x * 0.2, 0.02);
      load.rotation.z = Math.sin(t * 2.2) * 0.03;
    },
  };
}

// ---------- the field notes: the job by hand, swept onto the caravan ----------
function noteTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff3e2';
  ctx.fillRect(0, 0, 128, 160);
  ctx.fillStyle = 'rgba(13,8,32,.55)';
  [34, 58, 82, 106, 130].forEach((y, i) => ctx.fillRect(16, y, [90, 70, 96, 50, 80][i], 7));
  ctx.fillStyle = '#e8590c';
  ctx.fillRect(40, 0, 48, 14);
  ctx.strokeStyle = '#0d0820';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 122, 154);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createNotes(scene, fields, perField) {
  const rand = seeded(41);
  const count = fields.length * perField;
  const mesh = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.42, 0.52),
    new THREE.MeshBasicMaterial({ map: noteTexture(), side: THREE.DoubleSide, toneMapped: false }),
    count,
  );
  mesh.frustumCulled = false;
  const notes = Array.from({ length: count }, (_, i) => {
    const f = fields[Math.floor(i / perField)];
    const airborne = rand() > 0.45;
    return {
      f, k: i % perField,
      home: new THREE.Vector3(f.x + (rand() - 0.5) * 14, airborne ? 0.6 + rand() * 3 : 0.03, -0.5 + (rand() - 0.2) * 5),
      airborne, spin: (rand() - 0.5) * 3, phase: rand() * 6.28, tilt: rand() * 6.28,
    };
  });
  scene.add(mesh);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const pos = new THREE.Vector3();
  const sc = new THREE.Vector3();
  const target = new THREE.Vector3();
  const flat = new THREE.Euler(-Math.PI / 2, 0, 0);

  return {
    // returns how full the load is (0..1 over both bays) so the bundle can grow
    update(u, t, loadAt) {
      let gathered = 0;
      notes.forEach((n, i) => {
        // each note lets go a little after the last, so the sweep reads as wind, not a fade
        const g = THREE.MathUtils.clamp((u - n.f.beat - 0.12 - n.k * 0.018) / 0.55, 0, 1);
        const ge = g * g * (3 - 2 * g);
        gathered += ge;
        if (g >= 1) {
          sc.setScalar(0);
        } else {
          pos.copy(n.home);
          if (n.airborne) {
            pos.x += Math.sin(t * 0.7 + n.phase) * 0.6;
            pos.y += Math.sin(t * 1.3 + n.phase) * 0.25;
            e.set(Math.sin(t * 1.1 + n.phase) * 0.9, t * n.spin * 0.3, Math.sin(t * 0.9 + n.tilt) * 0.6);
          } else {
            e.copy(flat);
            e.z = n.tilt;
            pos.y += Math.max(0, Math.sin(t * 2 + n.phase)) * 0.015;
          }
          loadAt(target);
          pos.lerp(target, ge);
          pos.y += Math.sin(Math.PI * ge) * 1.8; // swept up in an arc onto the load
          e.x += ge * 4;
          q.setFromEuler(e);
          sc.setScalar(1 - ge * 0.75);
        }
        m.compose(pos, q, sc);
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
      return gathered / count;
    },
  };
}

