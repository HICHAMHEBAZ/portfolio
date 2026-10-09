import * as THREE from 'three';

// Amber wash (Erghad Afewo, 0:00) with the film's signature light: a flat cream
// sun ringed by cel bands that drift slowly outward. The sun sits behind the
// figure like a halo; everything else in the sky stays two-step posterized.
const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }
`;

const fragmentShader = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uAspect;
  uniform float uLight;   // 0 pre-dawn -> 1 noon (opening shot)
  uniform float uExit;    // 0 -> 1 as the visitor scrolls out of the hero
  uniform vec2 uSun;      // sun centre, screen uv
  uniform float uSunR;    // disc radius, in frame heights

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; } return v; }

  void main() {
    vec2 uv = vUv;
    vec2 p = vec2(uv.x * uAspect, uv.y);
    vec3 top = vec3(0.996, 0.839, 0.416);   // --sky-1
    vec3 low = vec3(0.992, 0.71, 0.169);    // --sky-3
    vec3 pink = vec3(0.984, 0.69, 0.439);   // --haze-2
    vec3 cream = vec3(0.996, 0.996, 0.796); // --sun
    vec3 ring = vec3(1.0, 0.953, 0.69);     // --haze

    vec3 col = mix(low, top, smoothstep(0.15, 0.95, uv.y));
    col = mix(col, pink, smoothstep(0.6, 0.0, distance(uv, vec2(0.04, 0.1))) * 0.75);

    // mottled cloud wash, posterized into two soft steps
    float c = fbm(p * vec2(2.2, 3.0) + vec2(uTime * 0.008, 0.0));
    col = mix(col, col * 1.05 + 0.02, smoothstep(0.5, 0.55, c) * 0.55);
    col = mix(col, col * 0.94, smoothstep(0.63, 0.68, c) * 0.45);

    // the ringed sun: a wide soft halo, cel rings drifting outward, a flat disc
    vec2 sp = vec2(uSun.x * uAspect, uSun.y);
    float d = distance(p, sp);
    float r = uSunR;
    col += cream * exp(-d / (r * 2.2)) * 0.28;
    float phase = (d - r * 1.3) / (r * 0.62) - uTime * 0.05;
    float band = fract(phase);
    float rings = smoothstep(0.0, 0.02, band) * (1.0 - smoothstep(0.16, 0.18, band));
    float reach = step(r * 1.3, d) * (1.0 - smoothstep(r * 2.2, r * 5.5, d));
    col = mix(col, ring, rings * reach * 0.55);
    float disc = 1.0 - smoothstep(r - 0.0025, r + 0.0025, d);
    col = mix(col, cream, disc);

    // pre-dawn: the same wash, pulled down into dusky rose
    col = mix(col * vec3(0.62, 0.42, 0.5), col, uLight);
    // scrolling out, the sky bleaches toward the next chapter's pale light
    col = mix(col, vec3(0.992, 0.992, 0.71), uExit * 0.35 * smoothstep(0.2, 1.0, uv.y));
    col += (hash(uv * 1100.0 + floor(uTime * 12.0)) - 0.5) * 0.028;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createSky() {
  const uniforms = {
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uLight: { value: 1 },
    uExit: { value: 0 },
    uSun: { value: new THREE.Vector2(0.5, 0.7) },
    uSunR: { value: 0.09 },
  };
  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, depthWrite: false, depthTest: false, fog: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return { mesh, uniforms };
}

export const HAZE_COLOR = new THREE.Color().setRGB(1.0, 0.953, 0.69, THREE.SRGBColorSpace);
