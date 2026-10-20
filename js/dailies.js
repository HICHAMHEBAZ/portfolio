// Ch. 05: the dailies. This file builds the head's tally, the board of prints, the close
// and the Watch dialog. The film-strip gate is js/dailies-gate.js, the contact sheet is
// js/dailies-sheet.js and every scroll-driven move is in js/dailies-motion.js. All of it is
// plain markup first, so the chapter reads fine without GSAP or with reduced motion.
import { DAILIES, DAILIES_CLOSE, imgPath } from './data.js';
import { el, svgUse, $ } from './render.js';
import { renderGate } from './dailies-gate.js';
import { renderSheet } from './dailies-sheet.js';
import { loopPath, pencilSvg, ARROW } from './dailies-pencil.js';

const pad = (n) => String(n).padStart(2, '0');

const BOARD_LINE = 'Before a scene is built, the client sees three looks for each series on one page and picks once. No email chain.';
const APPROVAL_LINE = 'Carousels get the same page: every block approved before a slide is built.';
// each print lies a little off square, the way prints are dropped on a table
const TILT = [-2.4, 1.6, -1.1, 1.9, -2.1, 1.2, -1.4, 2.2, -0.8];
// the pencil loop's box: a print plus the margin the loop leaves around it
const LOOP = { w: 182, h: 289 };

function renderTally() {
  const t = DAILIES.totals;
  const cells = [
    { n: pad(t.films), count: t.films, fmt: 'pad', label: 'explainers' },
    { n: t.runtime, count: t.runtimeSec, fmt: 'time', label: 'of runtime' },
    { n: pad(t.slides), count: t.slides, fmt: 'pad', label: 'slides' },
    { n: pad(t.colourStories), count: t.colourStories, fmt: 'pad', label: 'colour stories' },
  ];
  $('#dly-tally').append(...cells.map((c) => el('div', { class: 'tally__cell' }, [
    el('dt', { text: c.label }),
    el('dd', { class: 'tally__n', 'data-count': c.count, 'data-fmt': c.fmt, text: c.n }),
  ])));
}

function print(look, n) {
  const li = el('li', { class: look.picked ? 'print print--pick' : 'print', style: `--r:${TILT[n]}deg` }, [
    el('img', {
      src: imgPath(look.image), width: '320', height: '569', loading: 'lazy', decoding: 'async',
      alt: `${look.title}, an intro look${look.picked ? ', the one picked' : ''}`,
    }),
  ]);
  if (look.picked) {
    li.append(
      pencilSvg(loopPath(LOOP.w, LOOP.h, n + 3), LOOP.w, LOOP.h, 'print__pencil'),
      el('span', { class: 'print__note' }, [pencilSvg(ARROW.d, ARROW.w, ARROW.h, 'note__arrow'), look.title]),
    );
  }
  return li;
}

// the nine looks are three series of three: one row per series, one pick circled in each
function renderBoard() {
  const looks = DAILIES.board.looks;
  const series = [...new Set(looks.map((l) => l.seriesKey))];
  const rows = series.map((key) => {
    const items = looks.filter((l) => l.seriesKey === key);
    return el('div', { class: 'prow' }, [
      el('span', { class: 'prow__label', lang: 'ar', dir: 'rtl', text: items[0].series }),
      el('ul', { class: 'prow__prints', 'aria-label': `Intro looks, ${items.length} options` }, items.map((l) => print(l, looks.indexOf(l)))),
    ]);
  });
  // the approval page is cropped at the top of the file: its fixed send bar is left off the fragment
  const approval = el('figure', { class: 'approval' }, [
    el('div', { class: 'approval__page' }, [el('img', {
      src: imgPath(DAILIES.board.approval), width: '1200', height: '1500', loading: 'lazy', decoding: 'async',
      alt: 'The approval page for a carousel: three cover options and three slide outlines, each with a pick button.',
    })]),
    el('figcaption', { text: APPROVAL_LINE }),
  ]);
  $('#dly-board').append(
    el('div', { class: 'board__copy' }, [
      el('p', { class: 'slate' }, [el('span', { text: 'Interlude' }), ' Looks on one board']),
      el('h3', { class: 'board__line', text: BOARD_LINE }),
      approval,
    ]),
    el('div', { class: 'table' }, rows),
  );
}

function renderClose() {
  $('#dly-close').append(
    el('p', { text: DAILIES_CLOSE.text }),
    el('a', { class: 'btn btn--solid', href: '#cta', 'data-service': 'Content pipelines', 'data-nod': '' }, [DAILIES_CLOSE.button, svgUse('i-arrow')]),
  );
}

// "Watch the opening": the real first seconds of the film, with sound. The browser traps focus
// in a modal dialog and Esc closes it; closing also stops the video.
function initWatch() {
  const video = el('video', { class: 'watch__video', controls: '', playsinline: '', preload: 'none' });
  const slate = el('p', { class: 'slate' });
  const title = el('h3', { id: 'watch-title', lang: 'ar', dir: 'rtl' });
  const close = el('button', { class: 'lightbox__close', type: 'button', 'aria-label': 'Close' }, ['✕']);
  const dialog = el('dialog', { class: 'watch', 'aria-labelledby': 'watch-title' }, [
    el('div', { class: 'lightbox__head' }, [el('div', {}, [slate, title]), close]),
    video,
  ]);
  document.body.append(dialog);
  let opener = null;

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-watch]');
    const film = trigger && DAILIES.films.find((f) => f.id === trigger.dataset.watch);
    if (!film) return;
    opener = trigger;
    slate.replaceChildren(el('span', { text: 'The opening' }), ` ${film.hookSeconds} s of ${film.runtime} · sound on`);
    title.textContent = film.titleAr;
    video.poster = imgPath(film.poster);
    video.src = film.hook;
    dialog.showModal();
    close.focus({ preventScroll: true });
    video.play().catch(() => {});
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    video.pause();
    opener?.focus({ preventScroll: true });
  });
}

export function renderDailies() {
  if (!$('#dailies')) return;
  renderTally();
  renderGate($('#dly-gate'));
  renderBoard();
  renderSheet($('#dly-sheet'));
  renderClose();
  initWatch();
}
