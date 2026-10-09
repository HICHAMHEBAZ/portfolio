import * as THREE from 'three';

// A word painted into the sky, standing between the two far ridge lines so the
// near ridge and the figure overlap it: the title lives inside the landscape.
const FONT = 'italic 800 340px "Fraunces", Georgia, serif';
const PAD = 60;

function paint(text) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = FONT;
  const w = Math.ceil(ctx.measureText(text).width) + PAD * 2;
  const h = 440;
  canvas.width = w;
  canvas.height = h;
  ctx.font = FONT;
  ctx.textBaseline = 'alphabetic';
  // a flat cel fill in the wash's cream light: no glow, no gradient inside the shape
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#1d142c';
  ctx.lineWidth = 14;
  ctx.strokeText(text, PAD, h - 110);
  ctx.fillStyle = '#fefecb';
  ctx.fillText(text, PAD, h - 110);
  return { canvas, aspect: w / h };
}

export async function createTitleWord(text) {
  try {
    await document.fonts.load(FONT);
  } catch {
    // fall back to the serif stack; the word still reads
  }
  const { canvas, aspect } = paint(text);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, fog: false, opacity: 0 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(aspect, 1), material);
  mesh.renderOrder = -1;

  const state = { height: 1, baseY: 0, rise: 0 };

  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();

  // fit the word to a share of the frame width at its depth, its centre on a
  // screen height (ndcY) so the HTML lines either side can never collide with it
  function fit(camera, z, widthShare, ndcY) {
    const dist = camera.position.z - z;
    const viewH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const viewW = viewH * camera.aspect;
    state.height = Math.min((viewW * widthShare) / aspect, viewH * 0.42);
    plane.constant = -z;
    ray.setFromCamera(new THREE.Vector2(0, ndcY), camera);
    state.baseY = ray.ray.intersectPlane(plane, hit) ? hit.y - state.height * 0.5 : 0;
    mesh.scale.set(state.height, state.height, 1);
    mesh.position.set(hit.x, 0, z);
    apply();
  }

  // rise 0 -> sunk behind the ridge, 1 -> fully up in the sky
  function apply() {
    const r = state.rise;
    mesh.position.y = state.baseY + state.height * (0.5 - (1 - r) * 0.85);
    material.opacity = Math.min(1, r * 1.6);
  }

  function setRise(r) {
    state.rise = THREE.MathUtils.clamp(r, 0, 1);
    apply();
  }

  return { mesh, fit, setRise };
}
