import * as THREE from 'three';
import { mix } from './palette.js';

// The long side-on desert the making-of is shot across. The road runs along +x;
// the camera tracks it like the film's panning cels, so depth is real parallax:
// sky (follows the camera), far ridges, the mid dune sea, the road, dark lips at the lens.
// Every layer reads its colour from the palette mix, so the splice is one crossfade.
export const WORLD = { start: -40, end: 240 };
const LENGTH = WORLD.end - WORLD.start;
const CENTER = (WORLD.start + WORLD.end) / 2;

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function toonRamp() {
  const ramp = new THREE.DataTexture(new Uint8Array([90, 90, 90, 255, 170, 170, 170, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  return ramp;
}

// ---------- sky: a backdrop that travels with the camera, painted in screen space ----------
// Bands are placed from the horizon's height on screen (uHorizon, set on layout), so the
// frame keeps the film's wide, low horizon on every aspect ratio.
const SKY_VERT = /* glsl */`
  void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const SKY_FRAG = /* glsl */`
  uniform vec3 uTop, uMid, uLow, uSun, uHalo;
  uniform vec2 uSunPos, uRes;
  uniform float uHorizonY, uEclipse, uTime;
  void main() {
    vec2 s = gl_FragCoord.xy / uRes;
    float h = uHorizonY;
    // flat bands with soft joins, like the film's painted skies
    vec3 col = mix(uLow, uMid, smoothstep(h, h + 0.2, s.y));
    col = mix(col, uTop, smoothstep(h + 0.22, 1.05, s.y));
    vec2 d = (s - uSunPos) * vec2(uRes.x / uRes.y, 1.0);
    float r = length(d);
    float R = 0.055;
    float halo = (1.0 - smoothstep(R, R * 3.2, r)) * (0.5 + 0.08 * sin(uTime * 1.05));
    col = mix(col, uHalo, halo);
    // day: a cream disc. night green: a black disc inside a pale corona ring
    float disc = 1.0 - smoothstep(R - 0.002, R + 0.002, r);
    float ring = smoothstep(R - 0.003, R, r) * (1.0 - smoothstep(R + 0.004, R + 0.009, r));
    col = mix(col, uSun, disc);
    col = mix(col, uLow, ring * uEclipse);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }`;

function createSky() {
  const uniforms = {
    uTop: { value: mix.skyTop }, uMid: { value: mix.skyMid }, uLow: { value: mix.horizon },
    uSun: { value: mix.sun }, uHalo: { value: mix.halo },
    uSunPos: { value: new THREE.Vector2(0.76, 0.78) }, uRes: { value: new THREE.Vector2(1, 1) },
    uHorizonY: { value: 0.45 }, uEclipse: { value: 0 }, uTime: { value: 0 },
  };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 300),
    new THREE.ShaderMaterial({ uniforms, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, depthWrite: false, fog: false }),
  );
  mesh.position.set(0, 0, -100);
  mesh.renderOrder = -10;
  return { mesh, uniforms };
}

// ---------- far ridges: flat silhouettes, the fog does the distance ----------
function ridge(seed, base, height, z) {
  const rand = seeded(seed);
  const shape = new THREE.Shape();
  shape.moveTo(WORLD.start - 60, base - 40);
  let y = base;
  const steps = 90;
  for (let i = 0; i <= steps; i++) {
    y = THREE.MathUtils.clamp(y + (rand() - 0.5) * 2.2, base, base + height);
    const x = WORLD.start - 60 + ((LENGTH + 120) * i) / steps;
    shape.quadraticCurveTo(x - 1.5, y + 0.9, x, y);
  }
  shape.lineTo(WORLD.end + 60, base - 40);
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape, 3), new THREE.MeshBasicMaterial());
  mesh.position.z = z;
  return mesh;
}

// ---------- the dune sea behind the road, cel-banded ----------
function duneSea() {
  const rand = seeded(11);
  const peaks = Array.from({ length: 26 }, (_, i) => ({ x: WORLD.start + i * 11 + rand() * 6, h: 1.1 + rand() * 1.9, w: 16 + rand() * 30 }));
  const height = (x, z) => {
    let h = 0;
    peaks.forEach((p) => { h = Math.max(h, p.h * Math.exp(-((x - p.x) ** 2) / p.w)); });
    const across = Math.exp(-((z + 14) ** 2) / 18); // crest line around z = -14, falling to the road
    return h * across + Math.sin(x * 0.7 + z) * 0.04;
  };
  const geo = new THREE.PlaneGeometry(LENGTH, 24, 560, 40);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + CENTER;
    pos.setY(i, height(x, pos.getZ(i) - 14));
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ gradientMap: toonRamp() }));
  mesh.position.set(CENTER, -0.05, -14);
  return mesh;
}

// ---------- the road: flat sand with wind ripples, where the caravan walks ----------
function road() {
  const geo = new THREE.PlaneGeometry(LENGTH, 22, 400, 30);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, Math.sin(x * 1.3 + Math.sin(z * 0.8) * 2) * 0.025 + Math.max(0, z - 5) * 0.12);
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ gradientMap: toonRamp() }));
  mesh.position.set(CENTER, 0, 2);
  return mesh;
}

// ---------- dune lips at the lens: one continuous flat ink silhouette along the whole road ----------
// It runs far below the frame, so no camera tilt ever finds an edge.
function lips() {
  const rand = seeded(5);
  const shape = new THREE.Shape();
  shape.moveTo(WORLD.start - 40, -30);
  let x = WORLD.start - 40;
  shape.lineTo(x, 0.4);
  while (x < WORLD.end + 40) {
    const w = 6 + rand() * 9;
    const peak = 0.9 + rand() * 1.1;
    // a soft mound, then a dip back to the sand line
    shape.bezierCurveTo(x + w * 0.2, peak, x + w * 0.6, peak, x + w * 0.8, 0.3 + rand() * 0.3);
    shape.quadraticCurveTo(x + w * 0.9, 0.15, x + w, 0.4);
    x += w;
  }
  shape.lineTo(x, -30);
  const material = new THREE.MeshBasicMaterial({ fog: false });
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape, 6), material);
  mesh.position.z = 9.4;
  mesh.renderOrder = 5;
  return { group: mesh, materials: [material] };
}

// ---------- drifting haze puffs, the wash's halo colour ----------
function puffTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,.9)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function haze() {
  const rand = seeded(23);
  const material = new THREE.SpriteMaterial({ map: puffTexture(), transparent: true, depthWrite: false, opacity: 0.32 });
  const puffs = [];
  const group = new THREE.Group();
  for (let x = WORLD.start; x < WORLD.end; x += 6 + rand() * 6) {
    const s = new THREE.Sprite(material);
    const sc = 6 + rand() * 8;
    s.scale.set(sc * 1.8, sc * 0.6, 1);
    s.position.set(x, 0.6 + rand() * 2, -8 - rand() * 14);
    puffs.push({ s, base: x, speed: 0.2 + rand() * 0.3, phase: rand() * 6 });
    group.add(s);
  }
  return { group, material, puffs };
}

export function createWorld(scene) {
  const sky = createSky();
  const farRidge = ridge(7, 0.2, 3.2, -60);
  const nearRidge = ridge(19, -0.6, 2.6, -38);
  const sea = duneSea();
  const ground = road();
  const lip = lips();
  const mist = haze();
  scene.add(sky.mesh, farRidge, nearRidge, sea, ground, mist.group, lip.group);

  const update = (t, camX) => {
    sky.mesh.position.x = camX;
    sky.uniforms.uTime.value = t;
    sky.uniforms.uEclipse.value = mix.eclipse;
    farRidge.material.color.copy(mix.ridgeFar);
    nearRidge.material.color.copy(mix.ridgeNear);
    sea.material.color.copy(mix.dune);
    ground.material.color.copy(mix.road);
    lip.materials.forEach((m) => m.color.copy(mix.lip));
    mist.material.color.copy(mix.halo);
    mist.puffs.forEach((p) => { p.s.position.x = p.base + Math.sin(t * p.speed + p.phase) * 2.5; });
  };
  // the horizon's height on screen and the canvas size feed the sky's bands
  const layout = (camera, w, h) => {
    sky.uniforms.uRes.value.set(w, h);
    const p = new THREE.Vector3(camera.position.x, 2.4, -60).project(camera);
    sky.uniforms.uHorizonY.value = p.y * 0.5 + 0.5;
  };
  return { update, layout, sky };
}
