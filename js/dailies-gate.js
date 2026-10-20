// Reel A: the gate. A 35 mm strip of 18 stills (6 per explainer, a black leader between
// films) crosses a pinned stage and slides through a projector gate. Colour exists only
// in the gate: it plays the film's muted loop in true colour, while the strip is graded
// into the indigo wash and dimmed. A clapperboard slate beside it snaps shut on every
// film change and its rows swap under the stick.
// The strip, the slate and the gate are plain markup first, so without GSAP or with
// reduced motion css/dailies.css lays the three films out as readable cards.
import { DAILIES, imgPath } from './data.js';
import { el, svgUse } from './render.js';
import { PIN } from './timing.js';

const FILMS = DAILIES.films;
const pad = (n) => String(n).padStart(2, '0');
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const code = (id) => id.toUpperCase().replace('PERSONALITY', 'PERS');
// the pipeline step each slate row is proof of, stamped next to its label
const PROVES = { hook: 'Script with a spine', scenes: 'Final cut you can edit', sources: 'Footage with receipts' };

const stamp = (text) => el('span', { class: 'stamp', text });

function leaderCell(film, i) {
  return el('div', { class: 'lead' }, [
    el('span', { class: 'lead__id', text: film ? `Take ${pad(i + 1)} · ${code(film.id)}` : 'End of reel' }),
  ]);
}

function frameCell(film, j) {
  return el('figure', { class: 'cell' }, [
    el('img', { src: imgPath(film.frames[j]), width: '240', height: '427', alt: '', loading: 'lazy', decoding: 'async', draggable: 'false' }),
    el('figcaption', { text: `${code(film.id)} ${pad(j + 1)}A ▸` }),
  ]);
}

function metaCell(label, value, proves) {
  return el('div', {}, [el('dt', { text: label }), el('dd', {}, [value, proves ? stamp(proves) : null].filter(Boolean))]);
}

// one clapperboard card per film; they stack in one spot and only the current one shows
function slateCard(f, i) {
  return el('article', { class: i === 0 ? 'sl is-current' : 'sl', 'data-film': f.id }, [
    el('p', { class: 'sl__scene' }, [`Scene ${pad(i + 1)} / ${pad(FILMS.length)} · ${code(f.id)} · `, el('span', { class: 'sl__take', text: 'Take 01 / 06' })]),
    el('h3', { class: 'sl__title', lang: 'ar', dir: 'rtl', text: f.titleAr }),
    el('p', { class: 'sl__gloss', text: f.gloss }),
    el('dl', { class: 'sl__meta' }, [
      metaCell('Runtime', f.runtime),
      metaCell('Scenes', String(f.scenes), PROVES.scenes),
      metaCell('Language', f.language),
    ]),
    el('div', { class: 'sl__row' }, [
      el('p', { class: 'sl__k' }, ['Hook', stamp(PROVES.hook)]),
      el('p', { class: 'sl__ar', lang: 'ar', dir: 'rtl', text: f.hookAr }),
      el('p', { class: 'sl__en', text: f.hookEn }),
    ]),
    el('div', { class: 'sl__row' }, [
      el('p', { class: 'sl__k' }, ['Sources', stamp(PROVES.sources)]),
      el('p', { class: 'sl__txt', text: f.sources.join(' · ') }),
    ]),
    el('div', { class: 'sl__row sl__row--music' }, [
      el('p', { class: 'sl__k', text: 'Music' }),
      el('p', { class: 'sl__txt', text: f.music }),
    ]),
    // reduced motion has no gate to hang the button on, so each card carries its own
    el('button', { class: 'btn btn--ghost btn--sm sl__watch', type: 'button', 'data-watch': f.id }, [svgUse('i-play'), 'Watch the opening']),
  ]);
}

function gateEl() {
  const corners = ['tl', 'tr', 'bl', 'br'].map((c) => el('i', { class: `gate__mark gate__mark--${c}` }));
  return el('div', { class: 'gate', 'data-film': '0' }, [
    el('span', { class: 'gate__glow' }),
    el('div', { class: 'gate__window' }, [
      el('video', { class: 'gate__video', loop: '', playsinline: '', preload: 'none', poster: imgPath(FILMS[0].poster), 'aria-label': 'A muted loop from the film on the slate' }),
      el('span', { class: 'gate__leak' }),
    ]),
    ...corners,
    el('button', { class: 'btn btn--solid btn--sm gate__watch', type: 'button', 'data-watch': FILMS[0].id }, [svgUse('i-play'), 'Watch the opening']),
  ]);
}

export function renderGate(host) {
  const cells = FILMS.flatMap((f, i) => [leaderCell(f, i), ...f.frames.map((_, j) => frameCell(f, j))]);
  cells.push(leaderCell(null));
  host.append(el('div', { class: 'gate-stage' }, [
    el('p', { class: 'gate__reel' }, ['Reel A · explainer videos, 9:16']),
    el('div', { class: 'strip', 'aria-hidden': 'true' }, cells),
    el('div', { class: 'slate-card' }, [
      el('div', { class: 'clap', 'aria-hidden': 'true' }, [el('i', { class: 'clap__stick' }), el('i', { class: 'clap__base' })]),
      el('div', { class: 'slate-body' }, FILMS.map(slateCard)),
    ]),
    gateEl(),
  ]));
}

// scroll is the projector: the strip travels one way, the gate and slate follow which film is in it
export function gateMotion(gsap) {
  const stage = document.querySelector('.gate-stage');
  if (!stage) return;
  const strip = stage.querySelector('.strip');
  const gate = stage.querySelector('.gate');
  const video = gate.querySelector('video');
  video.muted = true;
  const leak = gate.querySelector('.gate__leak');
  const stick = stage.querySelector('.clap__stick');
  const watch = gate.querySelector('.gate__watch');
  const cards = [...stage.querySelectorAll('.sl')];
  const takes = cards.map((c) => c.querySelector('.sl__take'));
  const frames = [...strip.querySelectorAll('.cell')];
  const leaders = [...strip.querySelectorAll('.lead')];
  const perFilm = frames.length / FILMS.length;

  // strip coordinates of every cell centre and of the gate's centre; read again on each refresh
  let gx = 0;
  let frameX = [];
  let leaderX = [];
  const centre = (n) => n.offsetLeft + n.offsetWidth / 2;
  const measure = () => {
    const s = stage.getBoundingClientRect();
    const g = gate.getBoundingClientRect();
    gx = g.left - s.left + g.width / 2;
    frameX = frames.map(centre);
    leaderX = leaders.map(centre);
  };
  const span = () => {
    measure();
    return frameX[frameX.length - 1] - frameX[0];
  };

  // the gate's loop: the source is only set while the stage is near, it only plays while on screen
  let near = false;
  let visible = false;
  let shown = -1;
  const loopSrc = (f) => (video.canPlayType('video/webm; codecs="vp9"') ? f.loop.webm : f.loop.mp4);
  const sync = () => {
    const src = near && shown >= 0 ? loopSrc(FILMS[shown]) : '';
    if (video.dataset.src !== src) {
      video.dataset.src = src;
      video.pause();
      if (src) video.src = src;
      else video.removeAttribute('src');
      video.load();
    }
    if (visible && src) video.play().catch(() => {});
    else video.pause();
  };
  new IntersectionObserver(([e]) => { near = e.isIntersecting; sync(); }, { rootMargin: '100% 0px' }).observe(stage);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold: 0.15 }).observe(stage);

  // a film change: the stick snaps shut (160 ms, sharp in), then the rows swap under it and
  // a three-step light leak burns off the gate while the new loop starts
  let cutTl = null;
  const swap = (film) => {
    cards.forEach((c, i) => c.classList.toggle('is-current', i === film));
    gate.dataset.film = String(film);
    watch.dataset.watch = FILMS[film].id;
    video.poster = imgPath(FILMS[film].poster);
    sync();
  };
  const cut = (film) => {
    const first = shown < 0;
    shown = film;
    cutTl?.kill();
    if (first) {
      swap(film);
      return;
    }
    cutTl = gsap.timeline()
      .fromTo(stick, { rotate: -16 }, { rotate: 0, duration: 0.16, ease: 'power3.in' })
      .add(() => swap(film))
      .fromTo(leak, { opacity: 1 }, { opacity: 0, duration: 0.24, ease: 'steps(3)' }, '<');
  };

  // pos: the strip coordinate under the gate. Past a leader's centre, the next film is on.
  let take = -1;
  const follow = (pos) => {
    const film = clamp(leaderX.filter((x) => x < pos).length - 1, 0, FILMS.length - 1);
    if (film !== shown) cut(film);
    let nearest = 0;
    frameX.forEach((x, i) => { if (Math.abs(x - pos) < Math.abs(frameX[nearest] - pos)) nearest = i; });
    if (nearest === take) return;
    take = nearest;
    takes[Math.floor(nearest / perFilm)].textContent = `Take ${pad((nearest % perFilm) + 1)} / ${pad(perFilm)}`;
  };

  measure();
  cut(0);
  gsap.fromTo(strip, { x: () => { measure(); return gx - frameX[0]; } }, {
    x: () => gx - frameX[frameX.length - 1], ease: 'none',
    scrollTrigger: {
      trigger: stage, start: 'top top', end: () => `+=${Math.round(span() * PIN.dailies)}`,
      pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
    },
    onUpdate: () => follow(gx - gsap.getProperty(strip, 'x')),
  });
}
