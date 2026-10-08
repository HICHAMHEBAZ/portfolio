// Drives the mascot rig. Layers, from the motion-design playbook:
// primary   = look at cursor / nod / hop
// secondary = tassel spring, chest counter-sway, shadow squash
// ambient   = breathing and idle glances when nobody is moving the mouse
const IDLE_AFTER_MS = 2200;

const lerp = (a, b, t) => a + (b - a) * t;

export function createBehavior(rig) {
  const { bones, tasselPivot, shadow, rest } = rig;
  const state = {
    pointer: { x: 0, y: 0 },
    lastPointer: -Infinity,
    look: { x: 0, y: 0 },
    glance: { x: 0, y: 0, next: 0 },
    action: null, // { type, start, duration }
    tassel: { angle: 0, vel: 0 },
    prevHeadX: 0,
  };

  const setPointer = (x, y, now) => {
    state.pointer.x = x;
    state.pointer.y = y;
    state.lastPointer = now;
  };

  const play = (type, now) => {
    if (state.action && now - state.action.start < state.action.duration) return;
    const duration = type === 'hop' ? 900 : 1000;
    state.action = { type, start: now, duration };
  };

  function actionOffsets(now) {
    const out = { headY: 0, headSquash: 1, rootY: 0, bodySquash: 1, shadow: 1 };
    const a = state.action;
    if (!a) return out;
    const t = (now - a.start) / a.duration;
    if (t >= 1) {
      state.action = null;
      return out;
    }
    if (a.type === 'nod') {
      // two nods, second smaller
      const n = Math.sin(t * Math.PI * 4) * (1 - t);
      out.headY = -Math.max(0, n) * 0.12;
      out.headSquash = 1 - Math.max(0, n) * 0.04;
    }
    if (a.type === 'hop') {
      // anticipation squash -> jump -> land squash -> settle
      if (t < 0.18) {
        const k = t / 0.18;
        out.bodySquash = 1 - 0.06 * k;
        out.rootY = -0.05 * k;
      } else if (t < 0.62) {
        const k = (t - 0.18) / 0.44;
        out.rootY = Math.sin(k * Math.PI) * 0.75;
        out.bodySquash = 1 + 0.04 * Math.sin(k * Math.PI);
        out.shadow = 1 - Math.sin(k * Math.PI) * 0.4;
      } else {
        const k = (t - 0.62) / 0.38;
        // land: squash, then a damped wobble back to rest
        out.bodySquash = 1 - 0.07 * Math.exp(-k * 5) * Math.cos(k * 10);
      }
    }
    return out;
  }

  function update(now, dt) {
    const tracking = now - state.lastPointer < IDLE_AFTER_MS;
    if (!tracking && now > state.glance.next) {
      // idle: glance somewhere every few seconds
      state.glance.x = (Math.random() - 0.5) * 1.4;
      state.glance.y = (Math.random() - 0.3) * 0.6;
      state.glance.next = now + 2500 + Math.random() * 3500;
    }
    const target = tracking ? state.pointer : state.glance;
    const follow = 1 - Math.exp(-dt * (tracking ? 7 : 3));
    state.look.x = lerp(state.look.x, target.x, follow);
    state.look.y = lerp(state.look.y, target.y, follow);

    const t = now / 1000;
    const breath = Math.sin(t * 1.6);
    const act = actionOffsets(now);

    // head: tilt toward the target, slide a little to fake a turn
    bones.head.rotation.z = -state.look.x * 0.13 + Math.sin(t * 0.7) * 0.012;
    bones.head.position.x = rest.head.x + state.look.x * 0.06;
    bones.head.position.y = rest.head.y + state.look.y * 0.04 + act.headY;
    bones.head.scale.y = act.headSquash;

    // chest: breathing + counter-sway (opposes the head, like a real neck)
    bones.chest.rotation.z = state.look.x * 0.025 + Math.sin(t * 0.9) * 0.008;
    bones.chest.scale.set(1 + breath * 0.004, 1 + breath * 0.009, 1);

    // hips: tiny weight shift
    bones.hips.rotation.z = Math.sin(t * 0.45) * 0.006;

    // root: hop
    bones.root.position.y = rest.root.y + act.rootY;
    bones.root.scale.set(2 - act.bodySquash, act.bodySquash, 1);
    shadow.scale.x = shadow.userData.baseX * act.shadow;

    // tassel: damped spring driven by head motion + a desert breeze
    const headVel = (bones.head.position.x - state.prevHeadX) / Math.max(dt, 1e-3);
    state.prevHeadX = bones.head.position.x;
    const restAngle = -bones.head.rotation.z * 0.9 + Math.sin(t * 1.3) * 0.05;
    const k = 38;
    const c = 4.5;
    const tas = state.tassel;
    tas.vel += (-(tas.angle - restAngle) * k - tas.vel * c - headVel * 6) * dt;
    tas.angle += tas.vel * dt;
    tasselPivot.rotation.z = tas.angle;
  }

  shadow.userData.baseX = shadow.scale.x;
  return { update, setPointer, play };
}
