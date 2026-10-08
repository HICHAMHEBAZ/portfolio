import { PROJECTS, SERVICES, PROCESS, FAQ, PROFILE, WRITING, NOISE_SIGNAL, imgPath } from './data.js';

export const $ = (sel, root = document) => root.querySelector(sel);

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'style') node.style.cssText = v;
    else node.setAttribute(k, v);
  });
  children.forEach((c) => node.append(c));
  return node;
}

const svgUse = (id) => {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  const use = document.createElementNS(NS, 'use');
  use.setAttribute('href', `#${id}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.append(use);
  return svg;
};

const img = (file, alt = '', extra = {}) => el('img', { src: imgPath(file), alt, loading: 'lazy', decoding: 'async', draggable: 'false', ...extra });
const project = (id) => PROJECTS.find((p) => p.id === id);

function renderProfile() {
  document.querySelectorAll('[data-profile]').forEach((node) => {
    const value = PROFILE[node.dataset.profile];
    if (!value) return;
    node.textContent = value;
    if (node.tagName === 'A' && node.dataset.profile === 'email') node.href = `mailto:${value}`;
  });
  document.querySelectorAll('[data-link]').forEach((a) => {
    const url = PROFILE[a.dataset.link];
    if (url) a.href = url;
    // a profile without a link yet is hidden rather than left as a dead "#"
    else if (a.dataset.link in PROFILE) a.closest('li')?.remove();
  });
  $('#year').textContent = new Date().getFullYear();
}

function renderCredits() {
  const items = PROJECTS.map((p) => el('span', {}, [p.title, el('small', { text: p.tag })]));
  $('#credits').append(...items, ...items.map((n) => {
    const c = n.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    return c;
  }));
}

// Ch. 02: four columns of real posts, used as the "noise" the visitor scrolls past
function renderNoise() {
  const all = PROJECTS.flatMap((p) => p.gallery);
  const cols = [0, 1, 2, 3].map((c) => el('div', { class: 'noise__col', 'data-col': c }, []));
  all.forEach((file, i) => cols[i % 4].append(img(file, '')));
  // repeat each column so it can travel without showing a gap
  cols.forEach((col) => [...col.children].forEach((n) => col.append(n.cloneNode())));
  $('#noise-feed').append(...cols);
  // the turn: one post comes forward in focus while the rest of the feed falls away
  $('#noise-feed').after(el('figure', { class: 'noise__signal', 'aria-hidden': 'true' }, [
    img(NOISE_SIGNAL, ''), el('span', { class: 'noise__ring' }), el('span', { class: 'noise__ring' }),
  ]));
}

function renderReel() {
  const track = $('#work-track');
  PROJECTS.forEach((p, i) => {
    track.append(el('li', { class: 'frame' }, [
      el('button', { 'data-open': p.id, 'data-cursor': 'View', 'aria-label': `Open ${p.title}, ${p.tag}` }, [
        el('div', { class: 'frame__img' }, [
          img(p.cover, '', { width: '800', height: '1000' }),
          el('span', { class: 'frame__no', text: String(i + 1).padStart(2, '0') }),
        ]),
        el('div', { class: 'frame__meta' }, [
          el('div', {}, [el('h3', { text: p.title }), el('p', { text: `${p.tag} · ${p.gallery.length} ${p.gallery.length > 1 ? 'visuals' : 'visual'}` })]),
          el('span', { text: p.year }),
        ]),
      ]),
    ]));
  });
  $('#work-total').textContent = `/ ${String(PROJECTS.length).padStart(2, '0')}`;
  track.append(el('li', { class: 'frame frame--end' }, [
    el('p', { text: 'The next frame could be yours.' }),
    el('a', { class: 'btn btn--solid', href: '#cta' }, ['Start a project', svgUse('i-arrow')]),
  ]));
}

export function slideNodes(gallery, title) {
  return gallery.map((file, i) => el('div', { class: 'carousel__slide', role: 'group', 'aria-roledescription': 'slide' }, [img(file, `${title}, visual ${i + 1}`)]));
}

// challenge -> idea -> what I made: the story beats under each case title
function renderCaseStories() {
  document.querySelectorAll('[data-case]').forEach((host) => {
    const p = project(host.dataset.case);
    if (!p) return;
    host.append(
      el('dl', { class: 'story-beats' }, [
        el('div', {}, [el('dt', { text: 'The challenge' }), el('dd', { text: p.challenge })]),
        el('div', {}, [el('dt', { text: 'The idea' }), el('dd', { text: p.idea })]),
        el('div', {}, [el('dt', { text: 'My part' }), el('dd', { text: p.role.join(', ') })]),
      ]),
      el('button', { class: 'btn btn--ghost', 'data-open': p.id, 'data-cursor': 'View' }, [`See all ${p.gallery.length} visuals`, svgUse('i-arrow')]),
    );
  });
  $('#taf-track').append(...slideNodes(project('tafilalt').gallery, 'Tafilalt'));
  const wa3i = project('wa3i');
  $('#wa3i-fan').append(...wa3i.gallery.map((file, i) => el('button', {
    'data-open': 'wa3i', 'data-fan': i, 'data-cursor': 'View', 'aria-label': `Open Wa3i Media slide ${i + 1}`,
  }, [img(file, '')])));
}

export function oklaImages() {
  return project('okla').gallery.map((file, i) => img(file, `Okla Bio post ${i + 1}`));
}

function renderMethod() {
  $('#process-steps').append(...PROCESS.map((s, i) => el('li', { class: 'step' }, [
    el('span', { class: 'step__n', text: String(i + 1).padStart(2, '0') }),
    el('h3', { text: s.step }),
    el('p', { text: s.text }),
  ])));
}

function renderServices() {
  $('#services-grid').append(...SERVICES.map((s) => el('li', { class: 'service' }, [
    el('span', { class: 'service__num', text: s.num, 'aria-hidden': 'true' }),
    el('h3', { text: s.title }),
    el('p', { text: s.text }),
    el('ul', {}, s.deliverables.map((d) => el('li', { text: d }))),
    el('p', { class: 'service__fit', text: `Good for: ${s.fit}` }),
    el('a', { class: 'service__cta', href: '#cta', 'data-service': s.title }, ['Ask about this', svgUse('i-arrow')]),
  ])));
}

// Ch. 05: each subject is a cassette on the shelf; the reels turn with the scroll
const reel = () => el('span', { class: 'tape__reel' }, [el('i')]);

function renderWriting() {
  $('#tapes').append(...WRITING.map((w, i) => el('li', { class: 'tape' }, [
    el('a', {
      class: 'tape__link', href: w.url, target: '_blank', rel: 'noopener', 'data-cursor': 'Play',
      'aria-label': `${w.title}: read on LinkedIn (opens in a new tab)`,
    }, [
      el('div', { class: 'tape__shell', 'aria-hidden': 'true' }, [
        el('div', { class: 'tape__label' }, [
          el('span', { class: 'tape__side', text: w.side }),
          el('span', { class: 'tape__topic', text: `No. ${String(i + 1).padStart(2, '0')} · ${w.topic}` }),
          el('span', { class: 'tape__title', text: w.title }),
        ]),
        el('div', { class: 'tape__window' }, [reel(), el('span', { class: 'tape__ribbon' }), reel()]),
        el('span', { class: 'tape__foot' }),
      ]),
      el('h3', { class: 'tape__h', text: w.title }),
      el('p', { class: 'tape__hook', text: w.hook }),
      el('span', { class: 'tape__play' }, [svgUse('i-play'), 'Read on LinkedIn']),
    ]),
  ])));
}

function renderFaq() {
  $('#faq-list').append(...FAQ.map((f) => el('details', { class: 'faq__item' }, [
    el('summary', {}, [f.q, el('i', { 'aria-hidden': 'true' })]),
    el('div', { class: 'faq__answer' }, [el('p', { text: f.a })]),
  ])));
}

export function renderAll() {
  renderProfile();
  renderCredits();
  renderNoise();
  renderReel();
  renderCaseStories();
  renderMethod();
  renderWriting();
  renderServices();
  renderFaq();
}
