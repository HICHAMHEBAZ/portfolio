// The opening shot as data: each track eases one value from 0 to 1 over its
// own window, so the scene reads the whole choreography off a single clock.
// Setup (dim wide frame) -> action (sun up, dolly in, figure lit, word rises)
// -> resolution (he nods, ambient life takes over).
export const ease = {
  // the site's signature curve, cubic-bezier(0.16, 1, 0.3, 1), approximated as expo-out
  out: (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)),
  // on-screen moves and light changes: smooth at both ends
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
};

const TRACKS = {
  light: { at: 0, dur: 2.2, ease: ease.inOut }, // sky comes up from pre-dawn
  sun: { at: 0.1, dur: 2.4, ease: ease.out }, // ringed sun climbs behind him
  dolly: { at: 0, dur: 2.8, ease: ease.out }, // camera travels in from the wide
  figure: { at: 0.35, dur: 1.6, ease: ease.inOut }, // silhouette -> lit
  word: { at: 0.7, dur: 1.4, ease: ease.out }, // "Stories" rises from the dunes
  caravan: { at: 1.2, dur: 1.2, ease: ease.inOut }, // the caravan fades out of the haze
};
export const NOD_AT = 2.3;
export const SHOT_LENGTH = 3;

const clamp01 = (v) => Math.min(1, Math.max(0, v));

// progress of every track at `elapsed` seconds into the shot
export function sample(elapsed) {
  return Object.fromEntries(Object.entries(TRACKS).map(([k, tr]) => [k, tr.ease(clamp01((elapsed - tr.at) / tr.dur))]));
}

export const lerp = (a, b, t) => a + (b - a) * t;
