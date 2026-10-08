import * as THREE from 'three';
import { createSky, HAZE_COLOR } from './sky.js';
import { createRidge, createFarRidges, createForeground, moundHeight } from './terrain.js';
import { createDust, createBirds } from './atmosphere.js';
import { createMascot } from './mascot-rig.js';
import { createBehavior } from './mascot-behavior.js';
import { createTitleWord } from './title-word.js';

const MOBILE_BREAKPOINT = 760;
const SOURCE_HEIGHT = 8.4; // rig is built at this height, then scaled
const FIGURE_HEIGHT = { desktop: 4.6, mobile: 3.4 };
const RIDGE_Y = -3.2;
const RIDGE_Z = -2;
// the title word stands between the far ridges (z -32 and -48)
const WORD_Z = -40;

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function createLights(scene) {
  // backlight from the bright sky behind the ridge: rims on the rocks,
  // and the figure's shadow runs down the slope toward the camera
  const key = new THREE.DirectionalLight('#fefecb', 2.6);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -14, right: 14, top: 10, bottom: -10, near: 1, far: 60 });
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.03;
  key.shadow.radius = 5;
  scene.add(key, key.target);
  scene.add(new THREE.HemisphereLight('#fed66a', '#1d142c', 1.1));
  return key;
}

export async function initHeroScene(container, { mascotUrl } = {}) {
  if (!container || !supportsWebGL()) return null;

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  // supersample on 1x screens so the cutout stays crisp; cap at 2x for the GPU
  renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 1.5), 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(HAZE_COLOR, 20, 75);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 150);

  const sky = createSky();
  scene.add(sky.mesh);
  const key = createLights(scene);
  scene.add(createFarRidges());

  const ridge = createRidge();
  scene.add(ridge);
  const foreground = createForeground();
  scene.add(foreground);
  const dust = createDust();
  scene.add(dust.group);
  const birds = createBirds();
  scene.add(birds.mesh);
  const word = await createTitleWord('Stories');
  scene.add(word.mesh);

  let rig;
  let behavior;
  try {
    rig = await createMascot(mascotUrl, SOURCE_HEIGHT, renderer);
    behavior = createBehavior(rig);
    scene.add(rig.group);
  } catch (err) {
    console.error('Figure texture failed to load:', err);
  }

  const pointer = new THREE.Vector2();
  const smooth = new THREE.Vector2();
  const look = new THREE.Vector3();
  const head = new THREE.Vector3();
  const halo = new THREE.Vector3();
  let figureX = 0;
  let base = { camX: 0, camY: 1, camZ: 13.5, lookY: 1.2 };

  function layout() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const mobile = w < MOBILE_BREAKPOINT;
    camera.fov = mobile ? 46 : 32;
    camera.updateProjectionMatrix();
    sky.uniforms.uAspect.value = camera.aspect;

    // the figure is the subject: dead centre, title lines either side of him
    figureX = 0;
    // mobile: the figure holds the upper half of the frame, the copy stacks below him
    base = mobile ? { camX: 0, camY: 0.4, camZ: 13, lookY: -1.5 } : { camX: 0, camY: 1, camZ: 13.5, lookY: 1.2 };
    ridge.position.set(figureX, RIDGE_Y, RIDGE_Z);
    key.position.set(figureX - 6, 12, RIDGE_Z - 14);
    key.target.position.set(figureX, 0, RIDGE_Z);
    foreground.position.x = mobile ? 0 : 0.5;
    camera.position.set(base.camX, base.camY, base.camZ);
    word.fit(camera, WORD_Z, mobile ? 0.95 : 0.62, mobile ? -0.5 : 0.6);

    if (rig) {
      const height = mobile ? FIGURE_HEIGHT.mobile : FIGURE_HEIGHT.desktop;
      const s = height / SOURCE_HEIGHT;
      const groundY = RIDGE_Y + moundHeight(0, 0);
      rig.group.scale.setScalar(s);
      // feet sink a touch into the rubble
      rig.group.position.set(figureX, groundY + height / 2 - 0.25, RIDGE_Z + 0.2);
    }
  }

  window.addEventListener('pointermove', (e) => {
    const rect = container.getBoundingClientRect();
    pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -(((e.clientY - rect.top) / rect.height) * 2 - 1));
    behavior?.setPointer(THREE.MathUtils.clamp(pointer.x * 1.1, -1.2, 1.2), pointer.y, performance.now());
  }, { passive: true });

  let visible = true;
  let running = !document.hidden;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(container);
  document.addEventListener('visibilitychange', () => { running = !document.hidden; });
  new ResizeObserver(layout).observe(container);
  layout();
  // the hero is a still frame: the title word stands fully up, the camera holds
  word.setRise(1);

  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!visible || !running) return;
    const t = now / 1000;

    // only the pointer moves the camera, a touch of depth parallax
    smooth.lerp(pointer, 1 - Math.exp(-dt * 2.5));
    camera.position.set(base.camX + smooth.x * 0.8, base.camY + smooth.y * 0.35, base.camZ);
    look.set(figureX, base.lookY, RIDGE_Z);
    camera.lookAt(look);

    sky.uniforms.uTime.value = t;
    if (rig) {
      head.set(figureX, rig.group.position.y + 1.2, RIDGE_Z);
      halo.copy(head).project(camera);
      sky.uniforms.uHalo.value.set(halo.x * 0.5 + 0.5, halo.y * 0.5 + 0.5);
      behavior.update(now, dt);
    }
    dust.update(t);
    birds.update(t);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  return {
    nod: () => behavior?.play('nod', performance.now()),
  };
}
