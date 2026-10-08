// Scroll lengths for the pinned shots, in one place so every layer that rides
// a pin (motion.js, ambient.js) stays in step with it.
export const PIN = {
  noise: window.innerWidth < 761 ? '+=120%' : '+=170%',
  // share of the reel's width the visitor scrolls through; under 1 runs the reel faster than the wheel
  proof: 0.7,
};
