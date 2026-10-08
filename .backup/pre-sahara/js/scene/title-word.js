import * as THREE from 'three';

// A word painted into the sky, standing between the two far ridge lines so the
// near ridge and the figure overlap it: the title lives inside the landscape.
const FONT = 'italic 400 360px "Instrument Serif", "Times New Roman", serif';
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
  // sun-bleached bone at the top, warming toward the dust at the foot
  const fill = ctx.createLinearGradient(0, 40, 0, h);
  fill.addColorStop(0, '#fff8e6');
  fill.addColorStop(0.65, '#ffe2b0');
  fill.addColorStop(1, '#f6b38b');
  ctx.shadowColor = 'rgba(239, 143, 182, .55)';
  ctx.shadowBlur = 40;
  ctx.fillStyle = fill;
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

  // fit the word to a share of the frame width at its depth
  function fit(camera, z, widthShare, baseY) {
    const dist = camera.position.z - z;
    const viewH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const viewW = viewH * camera.aspect;
    state.height = Math.min((viewW * widthShare) / aspect, viewH * 0.42);
    state.baseY = baseY;
    mesh.scale.set(state.height, state.height, 1);
    mesh.position.z = z;
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
