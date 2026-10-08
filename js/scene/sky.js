import * as THREE from 'three';

// Amber wash (Erghad Afewo, 0:00): pale sky-1 at the top down to sky-3 amber,
// a cream halo behind the figure, a peach haze low on the left. The dusk grade
// takes the film's next wash, magenta, as the visitor scrolls on.
const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }
`;

const fragmentShader = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uAspect;
  uniform float uDusk;
  uniform vec2 uHalo;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; } return v; }

  void main() {
    vec2 uv = vUv;
    vec2 p = vec2(uv.x * uAspect, uv.y);
    vec3 top = vec3(0.996, 0.839, 0.416);
    vec3 low = vec3(0.992, 0.71, 0.169);
    vec3 pink = vec3(0.984, 0.69, 0.439);
    vec3 dusk = vec3(0.914, 0.318, 0.773);

    vec3 col = mix(low, top, smoothstep(0.2, 0.9, uv.y));
    // pink haze rising from the lower left
    float haze = smoothstep(0.55, 0.0, distance(uv, vec2(0.05, 0.12)));
    col = mix(col, pink, haze * 0.8);
    // mottled cloud wash, posterized into two soft steps
    float c = fbm(p * vec2(2.2, 3.0) + vec2(uTime * 0.008, 0.0));
    col = mix(col, col * 1.06 + 0.02, smoothstep(0.5, 0.56, c) * 0.6);
    col = mix(col, col * 0.93, smoothstep(0.62, 0.68, c) * 0.5);
    // halo behind the figure
    float d = distance(p, vec2(uHalo.x * uAspect, uHalo.y));
    col += vec3(0.996, 0.996, 0.796) * exp(-d * 3.5) * 0.32;
    // dusk grade as the visitor scrolls on
    col = mix(col, dusk, uDusk * 0.55 * smoothstep(0.0, 1.0, uv.y));
    // grain
    col += (hash(uv * 1100.0 + floor(uTime * 12.0)) - 0.5) * 0.03;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createSky() {
  const uniforms = {
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uDusk: { value: 0 },
    uHalo: { value: new THREE.Vector2(0.6, 0.6) },
  };
  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, depthWrite: false, depthTest: false, fog: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return { mesh, uniforms };
}

export const HAZE_COLOR = new THREE.Color().setRGB(1.0, 0.953, 0.69, THREE.SRGBColorSpace);
