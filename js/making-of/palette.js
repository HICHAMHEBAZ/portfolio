import * as THREE from 'three';

// The two washes of the making-of, sampled from the same film table as the CSS grades:
// Bay 1 rides the road-blue daylight, Bay 2 the night green under the black sun.
// The scene crossfades every colour between them, so the splice happens in camera.
export const WASHES = {
  road: {
    skyTop: '#1ca9e4', skyMid: '#4fc8ea', horizon: '#f5e1b0', sun: '#fefecb', halo: '#fff3b0', eclipse: 0,
    ridgeFar: '#efc88a', ridgeNear: '#fdb46a', dune: '#fd9d28', road: '#fdba46', lip: '#0c2a5e',
    ink: '#0a1a3a', hot: '#e8590c', paper: '#fff3e2', numeral: '#4fc8ea',
  },
  jungle: {
    skyTop: '#24944e', skyMid: '#8bdc58', horizon: '#fdfdb5', sun: '#050d08', halo: '#4cce3e', eclipse: 1,
    ridgeFar: '#9fd77a', ridgeNear: '#4cce3e', dune: '#24944e', road: '#3e8a45', lip: '#08100b',
    ink: '#08100b', hot: '#c4161a', paper: '#fff3e2', numeral: '#4cce3e',
  },
};

// THREE.Color pairs per key, so a frame's mix is one lerp per colour, no allocations
const keys = Object.keys(WASHES.road).filter((k) => k !== 'eclipse');
const from = Object.fromEntries(keys.map((k) => [k, new THREE.Color(WASHES.road[k])]));
const to = Object.fromEntries(keys.map((k) => [k, new THREE.Color(WASHES.jungle[k])]));
export const mix = Object.fromEntries(keys.map((k) => [k, new THREE.Color()]));

export function setMix(k) {
  keys.forEach((key) => mix[key].copy(from[key]).lerp(to[key], k));
  mix.eclipse = k;
  return mix;
}
