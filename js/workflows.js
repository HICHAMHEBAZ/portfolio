// Ch. 05: the making-of. Each workflow is an editing bay: the beats scroll on one side,
// the device on the other stays put (sticky) and builds itself beat by beat.
// Beat 0 is what I observed: field notes float around the device like the noise of Ch. 02.
// From beat 1 the notes are swept away and the pipeline takes over, one step per beat.
// The bay's state is driven by a plain scroll read-out, so it works without GSAP and
// with reduced motion (the CSS then switches states without travel).
import { WORKFLOWS, WORKFLOWS_CLOSE } from './data.js';
import { el, svgUse, $ } from './render.js';
import { STAGES } from './bay-stage.js';

const CHAPTER = '05|The making-of';
// where the field notes sit around the device: x%, y% of the stage, tilt
const NOTE_SPOTS = [[-14, 6, -7], [62, 0, 5], [-20, 44, 4], [66, 40, -6], [-6, 80, -3]];

const pad = (n) => String(n).padStart(2, '0');

function renderBeats(w) {
  const seen = el('div', { class: 'beat beat--seen', 'data-beat': '0' }, [
    el('p', { class: 'slate' }, [el('span', { text: w.slate }), ` ${w.kind}`]),
    el('h3', { class: 'h-display', id: `flow-${w.id}`, 'data-accent': w.accent, 'data-split': '', text: w.headline }),
    el('p', { class: 'beat__k', text: 'What I observed' }),
    el('p', { class: 'beat__seen', text: w.observed }),
  ]);
  const steps = w.steps.map((s, i) => el('div', { class: 'beat', 'data-beat': String(i + 1) }, [
    el('span', { class: 'beat__n', text: pad(i + 1) }),
    el('div', {}, [el('h4', { text: s.title }), el('p', { text: s.text })]),
  ]));
  return el('ol', { class: 'bay__beats' }, [seen, ...steps].map((b) => el('li', {}, [b])));
}

function renderStage(w) {
  const notes = el('div', { class: 'bay__notes' }, w.notes.map((n, i) => {
    const [x, y, r] = NOTE_SPOTS[i % NOTE_SPOTS.length];
    return el('span', { class: 'note', style: `--x:${x}%;--y:${y}%;--r:${r}deg;--i:${i}`, text: n });
  }));
  const screen = el('div', { class: 'device__screen' });
  screen.innerHTML = STAGES[w.device]();
  const ticks = el('div', { class: 'deck__ticks' }, w.steps.map((_, i) => el('span', { text: pad(i + 1) })));
  const deck = el('div', { class: 'bay__deck' }, [
    el('p', { class: 'deck__count' }, [el('span', { text: w.counter.label }), el('b', { class: 'deck__value', text: '--' })]),
    el('div', { class: 'deck__track' }, [el('i', { class: 'deck__fill' }), ticks]),
  ]);
  return el('div', { class: 'bay__stage', 'aria-hidden': 'true' }, [
    el('div', { class: 'bay__frame' }, [el('span', { class: 'stage__n', text: '00' }), notes, el('div', { class: `device device--${w.device}` }, [screen]), deck]),
  ]);
}

function renderAgency(w) {
  return el('div', { class: 'bay__agency' }, [
    el('p', { class: 'beat__k', text: 'For your agency' }),
    el('ul', {}, w.agency.map((a, i) => el('li', {}, [el('b', { text: pad(i + 1) }), a]))),
  ]);
}

function renderBay(w, i) {
  // beats and stage share their own box, so the sticky stage stops before the agency credits
  const parts = [el('div', { class: 'bay__scene' }, [renderBeats(w), renderStage(w)]), renderAgency(w)];
  // the closing line sits on the last bay's wash, right before night falls
  if (i === WORKFLOWS.length - 1) {
    parts.push(el('div', { class: 'bay__close' }, [
      el('p', { text: WORKFLOWS_CLOSE.text }),
      el('a', { class: 'btn btn--solid', href: '#cta', 'data-nod': '' }, [WORKFLOWS_CLOSE.button, svgUse('i-arrow')]),
    ]));
  }
  return el('article', {
    class: `bay bay--${w.device}`, 'data-chapter': CHAPTER, 'data-grade': w.grade, 'data-at': '0', 'aria-labelledby': `flow-${w.id}`,
  }, parts);
}

// the counter under the device: the reel's runtime climbs to 1:00, the carousel counts its slides
function counterText(w, at) {
  const share = at / w.steps.length;
  if (w.device === 'phone') {
    const s = Math.round(w.counter.total * share);
    return `${Math.floor(s / 60)}:${pad(s % 60)}`;
  }
  return at ? `${pad(Math.max(1, Math.round(w.counter.total * share)))} / ${pad(w.counter.total)}` : '--';
}

function setBeat(bay, w, at) {
  if (bay.dataset.at === String(at) && bay.dataset.ready) return;
  bay.dataset.at = String(at);
  bay.dataset.ready = '1';
  bay.style.setProperty('--p', (at / w.steps.length).toFixed(3));
  bay.querySelectorAll('.st').forEach((s) => s.classList.toggle('is-on', s.dataset.on.split(' ').includes(String(at))));
  bay.querySelectorAll('.beat').forEach((b) => b.classList.toggle('is-now', b.dataset.beat === String(at)));
  bay.querySelectorAll('.deck__ticks span').forEach((t, i) => t.classList.toggle('is-done', i < at));
  bay.querySelector('.deck__value').textContent = counterText(w, at);
  bay.querySelector('.stage__n').textContent = pad(at);
}

// the beat under the reading line is the one on the device: mid-screen on desktop, low on
// phones, where the sticky stage covers the top half. Measured on scroll (one rAF per frame)
// rather than on crossings, so a jump from the nav still lands on the right beat.
const phoneQuery = window.matchMedia('(max-width: 899px)');

function beatAt(beats, line) {
  let at = 0;
  beats.forEach((b, i) => {
    if (b.getBoundingClientRect().top <= line) at = i;
  });
  return at;
}

function watchBays(bays) {
  let queued = false;
  const update = () => {
    queued = false;
    const line = window.innerHeight * (phoneQuery.matches ? 0.74 : 0.5);
    bays.forEach(({ bay, w, beats }) => {
      const r = bay.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      setBeat(bay, w, beatAt(beats, line));
    });
  };
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };
  bays.forEach(({ bay, w }) => setBeat(bay, w, 0));
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  queue();
}

export function renderWorkflows() {
  const host = $('#workflows');
  if (!host) return;
  const bays = WORKFLOWS.map((w, i) => {
    // the cut between the two bays is a dust seam, like every other change of wash
    if (i > 0) host.append(el('div', { class: 'seam', 'data-seam': 'splice', 'aria-hidden': 'true' }));
    const bay = renderBay(w, i);
    host.append(bay);
    return { bay, w, beats: [...bay.querySelectorAll('.beat')] };
  });
  watchBays(bays);
}
