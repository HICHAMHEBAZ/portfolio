import * as THREE from 'three';
import { setMix, mix } from './palette.js';
import { createWorld } from './world.js';
import { createBoards, createCaravan, createNotes } from './props.js';
import { createDecor } from './decor.js';

// CH 05, the making-of: one tracking shot down a desert road. Scroll drives a beat
// clock u (0 .. beats-1). Between beats the camera holds, moves, holds, like the
// film's pans; the caravan walks while it moves and stands while it holds.
// Beat 0 of each bay is the field of notes (the job by hand); beats 1-6 are boards.
const MOBILE = 760;
const SPACING = 14;
const SPLICE = 20; // the extra road between the two bays, where the wash turns
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

// where each beat sits on the road, and which board stands there
function layoutRoad(bays) {
  const stops = [];
  const stations = [];
  const fields = [];
  let x = 0;
  bays.forEach((bay, b) => {
    if (b > 0) x += SPLICE;
    fields.push({ x: x - 2, beat: stops.length });
    stops.push(x);
    bay.steps.forEach((_, i) => {
      x += SPACING;
      stations.push({ x, beat: stops.length, n: i + 1, device: bay.device, wash: bay.grade });
      stops.push(x);
    });
  });
  return { stops, stations, fields };
}

// hold -> move -> hold between two stops
function pathX(stops, u) {
  const i = Math.min(stops.length - 2, Math.max(0, Math.floor(u)));
  const f = THREE.MathUtils.clamp(u - i, 0, 1);
  const e = THREE.MathUtils.smoothstep(f, 0.22, 0.88);
  return stops[i] + (stops[i + 1] - stops[i]) * e;
}

export async function initMakingOf(container, bays) {
  if (!container || !supportsWebGL()) return null;
  let mobile = container.clientWidth < MOBILE;

  const renderer = new THREE.WebGLRenderer({ antialias: window.devicePixelRatio < 2, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75));
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  setMix(0);
  scene.fog = new THREE.Fog(mix.horizon.clone(), 30, 115);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 220);
  const key = new THREE.DirectionalLight('#fffbe8', 2.4);
  key.position.set(30, 40, -60);
  const fill = new THREE.AmbientLight('#ffffff', 1.1);
  scene.add(key, fill);

  const road = layoutRoad(bays);
  const world = createWorld(scene);
  const boards = createBoards(scene, road.stations, renderer);
  const decor = createDecor(scene, road.fields);
  const caravan = createCaravan(scene);
  const notes = createNotes(scene, road.fields, mobile ? 18 : 30);
  container.append(renderer.domElement);

  const last = road.stops.length - 1;
  let target = 0;
  let u = 0;
  let caravanX = 0;
  let lastCaravanX = 0;
  let filled = 0;
  const loadAt = (out) => caravan.loadPosition(out);
  const size = new THREE.Vector2();

  // desktop frames the board right of centre (the caption sits left); phones centre it high
  function placeCamera(x) {
    if (mobile) {
      // tilted down so the board and the caravan both sit above the caption card
      camera.position.set(x - 0.4, 3.6, 19);
      camera.lookAt(x - 0.4, -0.9, 0);
    } else {
      camera.position.set(x - 3.6, 3.1, 17);
      camera.lookAt(x - 3.6, 2.6, 0);
    }
  }

  function layout() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    mobile = w < MOBILE;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = mobile ? 52 : 30;
    camera.updateProjectionMatrix();
    placeCamera(pathX(road.stops, u));
    camera.updateMatrixWorld();
    renderer.getDrawingBufferSize(size);
    world.layout(camera, size.x, size.y);
    render(performance.now(), 0);
  }

  function render(now, dt) {
    const t = reduced ? 0 : now / 1000;
    const x = pathX(road.stops, u);
    placeCamera(x);
    // the wash turns on the splice road, between the last board of Bay 1 and the next field
    setMix(THREE.MathUtils.smoothstep(u, 6.25, 7.15));
    scene.fog.color.copy(mix.horizon);
    renderer.setClearColor(mix.horizon);
    world.update(t, camera.position.x);
    decor.update(t, camera.position.x);
    // the caravan leads the lens, stopping at each board's foot
    caravanX = x - (mobile ? 2.3 : 2.4);
    const speed = dt > 0 ? (caravanX - lastCaravanX) / dt : 0;
    lastCaravanX = caravanX;
    caravan.update(caravanX, speed, t, dt, filled);
    filled = notes.update(u, t, loadAt);
    boards.update(u, t);
    renderer.render(scene, camera);
  }

  let visible = false;
  let running = !document.hidden;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(container);
  document.addEventListener('visibilitychange', () => { running = !document.hidden; });
  new ResizeObserver(layout).observe(container);
  layout();
  boards.ready.then(() => render(performance.now(), 0));

  let prev = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - prev) / 1000, 0.05);
    prev = now;
    if (!visible || !running) return;
    // scroll is the clock, eased so a flick still travels like a dolly
    u = reduced ? target : THREE.MathUtils.damp(u, target, 3.2, dt);
    if (Math.abs(u - target) < 0.0005) u = target;
    render(now, dt);
  }
  requestAnimationFrame(frame);

  return {
    // u in beats: 0 = Bay 1 field, 6 = its last board, 7 = Bay 2 field, 13 = the PDF
    setBeat(value) {
      target = THREE.MathUtils.clamp(value, 0, last);
      if (reduced && visible) render(performance.now(), 0);
    },
  };
}
