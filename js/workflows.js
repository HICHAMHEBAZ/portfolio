// Ch. 05: the making-of. One sticky stage holds a Three.js tracking shot down a desert
// road (js/making-of/scene.js); scroll is its clock. Over it run the film's captions
// (what I observed, then each step) and a two-bay timeline deck. The page owns the
// beat; the 3D only follows it, so the captions, deck and wash still work without WebGL.
import { WORKFLOWS, WORKFLOWS_CLOSE } from './data.js';
import { el, svgUse, $ } from './render.js';

const CHAPTER = '05|The making-of';
const SWAP_AT = 0.55; // a caption changes halfway through the camera's move
const SPLICE_AT = 6.7; // where the overlay takes Bay 2's wash, in step with the 3D crossfade
const pad = (n) => String(n).padStart(2, '0');
const clamp01 = (x) => Math.min(1, Math.max(0, x));

// the beats in order, across both bays: step 0 is what I observed
const BEATS = WORKFLOWS.flatMap((w, b) => [0, ...w.steps.map((_, i) => i + 1)].map((s) => ({ b, s })));
const LAST = BEATS.length - 1;

// a headline whose words rise one after another when its caption comes on
function wordsOf(text, accent) {
  const words = text.split(/\s+/);
  return words.flatMap((w, i) => {
    const span = el('span', { class: w === accent ? 'w w--accent' : 'w', style: `--i:${i}`, 'aria-hidden': 'true', text: w });
    return i < words.length - 1 ? [span, ' '] : [span];
  });
}

function seenCaption(w) {
  return el('article', { class: 'cap cap--seen' }, [
    el('p', { class: 'slate' }, [el('span', { text: w.slate }), ` ${w.kind}`]),
    el('h3', { class: 'cap__title', id: `flow-${w.id}`, 'aria-label': w.headline }, wordsOf(w.headline, w.accent)),
    el('p', { class: 'cap__k', text: 'What I observed' }),
    el('p', { class: 'cap__text', text: w.observed }),
    el('ul', { class: 'cap__notes', 'aria-label': 'Field notes' }, w.notes.map((n, i) => el('li', { style: `--i:${i}`, text: n }))),
  ]);
}

function stepCaption(s, i) {
  return el('article', { class: 'cap cap--step' }, [
    el('span', { class: 'cap__n', text: pad(i + 1) }),
    el('div', {}, [el('h4', { text: s.title }), el('p', { class: 'cap__text', text: s.text })]),
  ]);
}

function renderDeck() {
  const groups = WORKFLOWS.map((w) => el('div', { class: 'deck__bay' }, [
    el('p', { class: 'deck__label' }, [el('b', { text: w.slate }), ` ${w.kind}`]),
    el('div', { class: 'deck__track' }, [
      el('i', { class: 'deck__fill' }),
      el('div', { class: 'deck__ticks' }, w.steps.map((_, i) => el('span', { text: pad(i + 1) }))),
    ]),
  ]));
  return el('div', { class: 'mk__deck', 'aria-hidden': 'true' }, [
    ...groups,
    el('p', { class: 'deck__count' }, [el('span', { class: 'deck__unit' }), el('b', { class: 'deck__value', text: '--' })]),
  ]);
}

function renderAfter() {
  const cols = WORKFLOWS.map((w) => el('div', { class: 'after__bay' }, [
    el('p', { class: 'cap__k', text: `For your agency · ${w.kind}` }),
    el('ul', {}, w.agency.map((a, i) => el('li', {}, [el('b', { text: pad(i + 1) }), a]))),
  ]));
  return el('div', { class: 'mk__after', 'data-grade': 'jungle' }, [
    el('div', { class: 'after__cols' }, cols),
    el('div', { class: 'after__close' }, [
      el('p', { text: WORKFLOWS_CLOSE.text }),
      el('a', { class: 'btn btn--solid', href: '#cta', 'data-nod': '' }, [WORKFLOWS_CLOSE.button, svgUse('i-arrow')]),
    ]),
  ]);
}

// the counter: the reel's runtime climbs to 1:00 in Bay 1, the carousel counts slides in Bay 2
function counter(w, s) {
  if (w.device === 'phone') {
    const sec = Math.round((w.counter.total * s) / w.steps.length);
    return { unit: w.counter.label, value: `${Math.floor(sec / 60)}:${pad(sec % 60)}` };
  }
  const n = Math.max(1, Math.round((w.counter.total * s) / w.steps.length));
  return { unit: w.counter.label, value: s ? `${pad(n)} / ${pad(w.counter.total)}` : '--' };
}

function createDirector(root) {
  const stage = root.querySelector('.mk__stage');
  const caps = [...root.querySelectorAll('.cap')];
  const fills = [...root.querySelectorAll('.deck__fill')];
  const ticks = [...root.querySelectorAll('.deck__bay')].map((g) => [...g.querySelectorAll('.deck__ticks span')]);
  const unit = root.querySelector('.deck__unit');
  const value = root.querySelector('.deck__value');
  let shown = -1;
  let scene = null;

  const beatOf = (u) => Math.min(LAST, Math.floor(u) + (u - Math.floor(u) >= SWAP_AT ? 1 : 0));

  function show(i) {
    if (i === shown) return;
    shown = i;
    const { b, s } = BEATS[i];
    caps.forEach((c, k) => {
      c.classList.toggle('is-now', k === i);
      c.toggleAttribute('inert', k !== i);
    });
    WORKFLOWS.forEach((w, bay) => {
      const done = bay < b ? w.steps.length : bay === b ? s : 0;
      fills[bay].style.transform = `scaleX(${(done / w.steps.length).toFixed(3)})`;
      ticks[bay].forEach((t, k) => t.classList.toggle('is-done', k < done));
    });
    const c = counter(WORKFLOWS[b], s);
    unit.textContent = c.unit;
    value.textContent = c.value;
    root.dataset.beat = String(i);
  }

  function update() {
    const r = root.getBoundingClientRect();
    const travel = Math.max(1, r.height - window.innerHeight);
    const u = clamp01(-r.top / travel) * LAST;
    stage.dataset.grade = u >= SPLICE_AT ? WORKFLOWS[1].grade : WORKFLOWS[0].grade;
    show(beatOf(u));
    scene?.setBeat(u);
  }

  return {
    update,
    attach(s) {
      scene = s;
      root.classList.add('has-3d');
      update();
    },
  };
}

// three.js streams in when the chapter is a screen and a half away, never before
function loadScene(root, director) {
  const host = root.querySelector('.mk__canvas');
  const io = new IntersectionObserver(async ([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    try {
      const { initMakingOf } = await import('./making-of/scene.js');
      const scene = await initMakingOf(host, WORKFLOWS);
      if (scene) director.attach(scene);
    } catch (err) {
      console.error('Making-of 3D failed, keeping the captions on the painted wash:', err);
    }
  }, { rootMargin: '150% 0px' });
  io.observe(root);
}

export function renderWorkflows() {
  const host = $('#workflows');
  if (!host) return;
  const caps = WORKFLOWS.flatMap((w) => [seenCaption(w), ...w.steps.map(stepCaption)]);
  const root = el('div', { class: 'mk', 'data-chapter': CHAPTER, style: `--beats:${BEATS.length}` }, [
    el('div', { class: 'mk__stage', 'data-grade': WORKFLOWS[0].grade }, [
      el('div', { class: 'mk__canvas', 'aria-hidden': 'true' }),
      el('div', { class: 'mk__caps' }, caps),
      renderDeck(),
    ]),
  ]);
  host.append(root, renderAfter());

  const director = createDirector(root);
  let queued = false;
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      director.update();
    });
  };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  director.update();
  loadScene(root, director);
}
