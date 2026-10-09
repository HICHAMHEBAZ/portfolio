import * as THREE from 'three';
import { createSky, HAZE_COLOR } from './sky.js';
import { createNearDune, createMidDunes, createFarRidges, createForeground, moundHeight } from './dunes.js';
import { createDust, createBirds, createSand } from './atmosphere.js';
import { createCaravan } from './caravan.js';
import { createMascot } from './mascot-rig.js';
import { createBehavior } from './mascot-behavior.js';
import { createTitleWord } from './title-word.js';
import { sample, lerp, NOD_AT, SHOT_LENGTH } from './shot.js';

// CH 01, the opening shot. The intro bars part on a dim wide frame; the ringed
// sun climbs behind the graduate, the camera travels in, he steps out of
// silhouette, "Stories" rises out of the dunes and he gives a nod. Then the
// desert keeps breathing: sand in gusts, a caravan on the far crest, birds.
const MOBILE_BREAKPOINT = 760;
const SOURCE_HEIGHT = 8.4; // rig is built at this height, then scaled
const FIGURE_HEIGHT = { desktop: 4.6, mobile: 3.4 };
const DUNE = { y: -3.2, z: -2 };
const MID = { x: 0, y: -3.6, z: -16 };
const WORD_Z = -40; // between the far ridges (z -32 and -48)
const LIT = new THREE.Color('#f0d9bf'); // warm grade so the figure sits inside the light
const SILHOUETTE = new THREE.Color('#3a2740');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function createLights(scene, mobile) {
  // backlight from the sun behind him: the crests catch it, the dune faces fall
  // into the ink band and his shadow runs down the slope toward the lens
  const key = new THREE.DirectionalLight('#fefecb', 2.8);
  key.castShadow = true;
  key.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -14, right: 14, top: 10, bottom: -10, near: 1, far: 60 });
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.03;
  key.shadow.radius = 4;
  scene.add(key, key.target);
  // flat ambient (not a hemisphere) so the toon bands stay flat cel fills
  const fill = new THREE.AmbientLight('#fed66a', 0.9);
  scene.add(fill);
  return { key, fill };
}

// camera framings: where the shot settles, and the wide it starts from
function framing(mobile) {
  const rest = mobile ? { x: 0, y: 0.4, z: 13, lookY: -0.6 } : { x: 0, y: 1, z: 13.5, lookY: 1.2 };
  const wide = { x: rest.x - 1.2, y: rest.y - 1.4, z: rest.z + 11, lookY: rest.lookY + 2.2 };
  return { rest, wide };
}

export async function initHeroScene(container, { mascotUrl } = {}) {
  if (!container || !supportsWebGL()) return null;

  let mobile = window.innerWidth < MOBILE_BREAKPOINT;
  const renderer = new THREE.WebGLRenderer({ antialias: window.devicePixelRatio < 2, powerPreference: 'high-performance' });
  // supersample on 1x screens so the cutout stays crisp; cap the GPU load on phones and 2x screens
  const dpr = window.devicePixelRatio;
  renderer.setPixelRatio(mobile ? Math.min(dpr, 1.5) : dpr >= 2 ? 1.75 : Math.max(dpr, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(HAZE_COLOR, 18, 70);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 150);

  const sky = createSky();
  const { key, fill } = createLights(scene, mobile);
  const dune = createNearDune();
  const mid = createMidDunes();
  mid.position.set(MID.x, MID.y, MID.z);
  const foreground = createForeground();
  const dust = createDust();
  const sand = createSand(mobile ? 120 : 220);
  const birds = createBirds();
  const caravan = createCaravan({ anchor: MID });
  scene.add(sky.mesh, createFarRidges(), mid, caravan.group, dune, foreground, dust.group, sand.points, birds.mesh);
  const word = await createTitleWord('Stories');
  scene.add(word.mesh);

  let rig = null;
  let behavior = null;
  try {
    rig = await createMascot(mascotUrl, SOURCE_HEIGHT, renderer);
    behavior = createBehavior(rig);
    scene.add(rig.group);
  } catch (err) {
    console.error('Figure texture failed to load:', err);
  }
  container.append(renderer.domElement);

  const pointer = new THREE.Vector2();
  const smooth = new THREE.Vector2();
  const look = new THREE.Vector3();
  const sunAnchor = new THREE.Vector3();
  const sunScreen = new THREE.Vector3();
  let frames = framing(mobile);
  let figureHeight = FIGURE_HEIGHT.desktop;
  let groundY = DUNE.y + moundHeight(0, 0);

  // the shot clock: null until play(); reduced motion starts on the last frame
  let shotStart = null;
  let wantShot = false; // play() was called; the clock starts on the first visible frame
  let nodded = false;
  const shotAt = (now) => (reduced ? SHOT_LENGTH : shotStart === null ? 0 : (now - shotStart) / 1000);

  function placeCamera(from, to, k, exit, sx, sy) {
    camera.position.set(
      lerp(from.x, to.x, k) + sx * 0.8,
      lerp(from.y, to.y, k) + sy * 0.35 + exit * 2.6,
      lerp(from.z, to.z, k) - exit * 1.8,
    );
    look.set(0, lerp(from.lookY, to.lookY, k) + exit * 3.4, DUNE.z);
    camera.lookAt(look);
  }

  function layout() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    mobile = w < MOBILE_BREAKPOINT;
    camera.fov = mobile ? 46 : 32;
    camera.updateProjectionMatrix();
    sky.uniforms.uAspect.value = camera.aspect;
    frames = framing(mobile);

    dune.position.set(0, DUNE.y, DUNE.z);
    key.position.set(-5, 16, DUNE.z - 12);
    key.target.position.set(0, 0, DUNE.z);
    foreground.position.x = mobile ? 0 : 0.5;

    // the word is fitted from the resting frame, centred on a fixed screen height:
    // desktop between the two HTML lines, mobile high above his cap
    placeCamera(frames.rest, frames.rest, 1, 0, 0, 0);
    camera.updateMatrixWorld();
    word.fit(camera, WORD_Z, mobile ? 0.86 : 0.5, mobile ? 0.68 : 0.06);

    figureHeight = mobile ? FIGURE_HEIGHT.mobile : FIGURE_HEIGHT.desktop;
    groundY = DUNE.y + moundHeight(0, 0);
    if (rig) {
      rig.group.scale.setScalar(figureHeight / SOURCE_HEIGHT);
      // feet sink a touch into the sand
      rig.group.position.set(0, groundY + figureHeight / 2 - 0.25, DUNE.z + 0.2);
    }
    if (reduced) render(performance.now());
  }

  window.addEventListener('pointermove', (e) => {
    const rect = container.getBoundingClientRect();
    pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -(((e.clientY - rect.top) / rect.height) * 2 - 1));
    behavior?.setPointer(THREE.MathUtils.clamp(pointer.x * 1.1, -1.2, 1.2), pointer.y, performance.now());
  }, { passive: true });

  // he answers a click with a small hop; the cursor tells you he is clickable
  const figureHit = (clientX, clientY) => {
    if (!rig) return false;
    const rect = container.getBoundingClientRect();
    const top = new THREE.Vector3(0, groundY + figureHeight, DUNE.z).project(camera);
    const feet = new THREE.Vector3(0, groundY, DUNE.z).project(camera);
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    const halfW = (top.y - feet.y) * 0.22 / camera.aspect;
    return y < top.y && y > feet.y && Math.abs(x - top.x) < halfW;
  };
  renderer.domElement.addEventListener('pointermove', (e) => {
    renderer.domElement.style.cursor = figureHit(e.clientX, e.clientY) ? 'pointer' : '';
  });
  renderer.domElement.addEventListener('click', (e) => {
    if (figureHit(e.clientX, e.clientY)) behavior?.play('hop', performance.now());
  });

  function render(now) {
    const t = reduced ? 0 : now / 1000;
    const shot = sample(shotAt(now));
    const exit = THREE.MathUtils.clamp(window.scrollY / Math.max(1, container.clientHeight), 0, 1);

    // camera: dolly in from the wide, a touch of pointer parallax, crane up on the way out
    placeCamera(frames.wide, frames.rest, shot.dolly, reduced ? 0 : exit, smooth.x, smooth.y);

    // light: pre-dawn rose to noon amber, on the sky and on the dunes
    sky.uniforms.uTime.value = t;
    sky.uniforms.uLight.value = shot.light;
    sky.uniforms.uExit.value = exit;
    key.intensity = lerp(0.6, 2.8, shot.light);
    fill.intensity = lerp(0.35, 0.9, shot.light);

    // the sun climbs from behind the crest to sit behind his head
    sunAnchor.set(0, lerp(groundY - 3, groundY + figureHeight * 0.92, shot.sun), DUNE.z - 0.5).project(camera);
    sunScreen.copy(sunAnchor);
    sky.uniforms.uSun.value.set(sunScreen.x * 0.5 + 0.5, sunScreen.y * 0.5 + 0.5);
    sky.uniforms.uSunR.value = (mobile ? 0.075 : 0.085) * lerp(0.8, 1, shot.sun);

    word.setRise(shot.word);
    if (rig) {
      rig.material.color.copy(SILHOUETTE).lerp(LIT, shot.figure);
    }
    caravan.update(t, shot.caravan);
    renderer.render(scene, camera);
  }

  let visible = true;
  let running = !document.hidden;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(container);
  document.addEventListener('visibilitychange', () => { running = !document.hidden; });
  new ResizeObserver(layout).observe(container);
  layout();

  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!visible || !running) return;
    if (wantShot && shotStart === null) shotStart = now;
    const t = now / 1000;
    smooth.lerp(pointer, 1 - Math.exp(-dt * 2.5));
    if (shotStart !== null && !nodded && shotAt(now) >= NOD_AT) {
      nodded = true;
      behavior?.play('nod', now);
    }
    ambient(t, dt, now);
    render(now);
  }

  // the desert's own life, independent of the shot
  function ambient(t, dt, now) {
    dust.update(t);
    sand.update(t, dt);
    birds.update(t);
    if (rig) behavior.update(now, dt);
  }
  if (reduced) {
    ambient(0, 0, 0);
    render(0);
  } else {
    requestAnimationFrame(frame);
  }

  return {
    // roll the opening shot; called once the cold open has cleared the frame
    play: () => { wantShot = true; },
    nod: () => behavior?.play('nod', performance.now()),
  };
}
