// Ch. 05: two content workflows, each a story (what I observed) beside a numbered pipeline.
// Copy lives in data.js; the props are flat ink shapes that read the scene's wash tokens.
import { WORKFLOWS, WORKFLOWS_CLOSE } from './data.js';
import { el, svgUse, $ } from './render.js';

// a film strip: six sprocketed frames, one lit by the sun
const FILM = `<svg viewBox="0 0 240 64" role="presentation" aria-hidden="true">
  <rect x="2" y="6" width="236" height="52" rx="4" fill="var(--land-near)"/>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${12 + i * 38}" y="18" width="30" height="28" rx="2" fill="${i === 2 ? 'var(--sun)' : 'var(--land-far)'}"/>`).join('')}
  ${Array.from({ length: 12 }, (_, i) => `<rect x="${10 + i * 19}" y="9" width="8" height="5" rx="1" fill="var(--paper)"/><rect x="${10 + i * 19}" y="50" width="8" height="5" rx="1" fill="var(--paper)"/>`).join('')}
  <path d="M96 26 L96 38 L108 32Z" fill="var(--hot)"/>
</svg>`;

// stacked slides: three offset cards, the front one carries the hot dot
const SLIDES = `<svg viewBox="0 0 160 110" role="presentation" aria-hidden="true">
  <rect x="48" y="4" width="76" height="96" rx="4" fill="var(--land-far)" stroke="var(--land-near)" stroke-width="3"/>
  <rect x="30" y="10" width="76" height="96" rx="4" fill="var(--sun)" stroke="var(--land-near)" stroke-width="3"/>
  <rect x="12" y="4" width="76" height="96" rx="4" fill="var(--paper)" stroke="var(--land-near)" stroke-width="3"/>
  <circle cx="34" cy="30" r="9" fill="var(--hot)"/>
  <rect x="24" y="54" width="52" height="6" rx="2" fill="var(--land-near)"/>
  <rect x="24" y="68" width="36" height="6" rx="2" fill="var(--land-near)"/>
</svg>`;
const PROPS = { film: FILM, slides: SLIDES };

function renderStep(s, i) {
  return el('li', { class: 'flow__step' }, [
    el('span', { class: 'flow__n', text: String(i + 1).padStart(2, '0') }),
    el('h4', { text: s.title }),
    el('p', { text: s.text }),
  ]);
}

function renderFlow(w, i) {
  const prop = el('span', { class: 'flow__prop', 'aria-hidden': 'true' });
  prop.innerHTML = PROPS[w.prop] || '';
  const story = el('div', { class: 'flow__story' }, [
    prop,
    el('p', { class: 'slate' }, [el('span', { text: w.slate }), ` · ${w.kind}`]),
    el('h3', { class: 'h-display', id: `flow-${w.id}`, 'data-accent': w.accent, 'data-split': '', text: w.headline }),
    el('p', { class: 'flow__seen-h', text: 'What I observed' }),
    el('p', { class: 'flow__seen', text: w.observed }),
  ]);
  const pipe = el('div', { class: 'flow__pipe' }, [
    el('ol', { class: 'flow__steps' }, w.steps.map(renderStep)),
    el('div', { class: 'flow__agency' }, [
      el('p', { class: 'flow__seen-h', text: 'For your agency' }),
      el('ul', {}, w.agency.map((a) => el('li', { text: a }))),
    ]),
  ]);
  const parts = [story, pipe];
  // the closing line sits on the last scene's wash
  if (i === WORKFLOWS.length - 1) {
    parts.push(el('div', { class: 'flow__close' }, [
      el('p', { text: WORKFLOWS_CLOSE.text }),
      el('a', { class: 'btn btn--solid', href: '#cta', 'data-nod': '' }, [WORKFLOWS_CLOSE.button, svgUse('i-arrow')]),
    ]));
  }
  return el('article', { class: 'flow', 'data-chapter': '05|The workflows', 'data-grade': w.grade, 'aria-labelledby': `flow-${w.id}` }, parts);
}

export function renderWorkflows() {
  const host = $('#workflows');
  if (!host) return;
  host.append(...WORKFLOWS.map(renderFlow));
}
