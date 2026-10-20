// Reel B: the contact sheet. Five carousels, nine frames each, on a paper sheet over a
// light table. Rows develop from negative to positive as they arrive, a red grease-pencil
// line runs down the margin through the five colour chips, and on a mouse a loupe
// magnifies whichever frame is under the pointer. A click opens the row in the lightbox.
import { DAILIES, imgPath, thumbPath } from './data.js';
import { el } from './render.js';
import { loopPath, pencilSvg } from './dailies-pencil.js';

const ZOOM = 2.5;
const LOUPE = 180;
const COVER = { w: 100, h: 120 };

const frame = (c, i) => {
  const thumb = el('button', {
    class: i === 0 ? 'thumb thumb--cover' : 'thumb', type: 'button', tabindex: '-1', style: `--i:${i}`,
    'data-open': c.id, 'data-fan': String(i), 'data-n': String(i + 1), 'data-full': imgPath(c.gallery[i]),
    'aria-label': `Open ${c.reel} ${c.reelName}, slide ${i + 1}`,
  }, [el('img', { src: thumbPath(c.gallery[i]), width: '270', height: '338', alt: '', loading: 'lazy', decoding: 'async', draggable: 'false' })]);
  // the cover frame gets a quick circle once the row has developed
  if (i === 0) thumb.append(pencilSvg(loopPath(COVER.w, COVER.h, 7), COVER.w, COVER.h, 'thumb__ring'));
  return thumb;
};

function row(c) {
  return el('li', { class: 'row', style: `--wash:${c.wash}` }, [
    el('div', { class: 'row__margin' }, [
      el('button', { class: 'row__label', type: 'button', 'data-open': c.id, 'data-cursor': 'Open' }, [
        el('i', { class: 'chip', 'aria-hidden': 'true' }),
        el('b', { text: `${c.reel} · ${c.reelName}` }),
      ]),
      el('p', { class: 'row__ar', lang: 'ar', dir: 'rtl', text: c.titleAr }),
      el('p', { class: 'row__gloss', text: c.gloss }),
    ]),
    el('div', { class: 'row__frames' }, c.gallery.map((_, i) => frame(c, i))),
  ]);
}

// fine pointers only: a 180 px lens that follows the cursor and shows the slide at 2.5x
function initLoupe(loupe) {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  const lens = loupe.querySelector('.loupe__lens');
  let thumb = null;
  const place = (e) => {
    const r = thumb.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    loupe.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    lens.style.backgroundSize = `${r.width * ZOOM}px ${r.height * ZOOM}px`;
    lens.style.backgroundPosition = `${LOUPE / 2 - x * r.width * ZOOM}px ${LOUPE / 2 - y * r.height * ZOOM}px`;
  };
  const off = () => { thumb = null; loupe.classList.remove('is-on'); };
  document.addEventListener('pointermove', (e) => {
    const t = e.target.closest?.('.row__frames .thumb');
    if (!t) { if (thumb) off(); return; }
    if (t !== thumb) {
      thumb = t;
      lens.style.backgroundImage = `url("${t.dataset.full}")`;
      loupe.classList.add('is-on');
    }
    place(e);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', off);
  window.addEventListener('scroll', off, { passive: true });
}

export function renderSheet(host) {
  const sheet = el('div', { class: 'sheet' }, [
    el('ol', { class: 'sheet__rows' }, DAILIES.carousels.map(row)),
    el('p', { class: 'sheet__note', text: 'never the same wash twice' }),
  ]);
  const loupe = el('div', { class: 'loupe', 'aria-hidden': 'true' }, [el('i', { class: 'loupe__handle' }), el('i', { class: 'loupe__lens' })]);
  host.append(
    el('div', { class: 'sheet-head' }, [
      el('p', { class: 'slate' }, [el('span', { text: 'Reel B' }), ' The contact sheet']),
      el('h3', { class: 'sheet-head__line', text: 'Five carousels, nine frames each. Click a row to flip through it.' }),
    ]),
    el('div', { class: 'lighttable' }, [sheet]),
    loupe,
  );
  initLoupe(loupe);
}

// the margin line is drawn from the real chip positions, so it is rebuilt on every refresh
function buildLine(sheet, svg, path) {
  const box = sheet.getBoundingClientRect();
  const pts = [...sheet.querySelectorAll('.chip')].map((c) => {
    const r = c.getBoundingClientRect();
    return [r.left - box.left + r.width / 2, r.top - box.top + r.height / 2];
  });
  const note = sheet.querySelector('.sheet__note').getBoundingClientRect();
  const last = pts[pts.length - 1];
  let d = `M${pts[0][0] - 2} ${pts[0][1] - 30}`;
  pts.forEach(([x, y], i) => {
    const [px, py] = i ? pts[i - 1] : [x - 2, y - 30];
    d += ` Q${((px + x) / 2 + (i % 2 ? 9 : -9)).toFixed(1)} ${((py + y) / 2).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  d += ` Q${last[0] + 8} ${(last[1] + note.top - box.top) / 2} ${last[0] + 2} ${note.top - box.top - 4}`;
  svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
  path.setAttribute('d', d);
}

const developMs = (row) => 900 + (row.querySelectorAll('.thumb').length - 1) * 60 + 150;

export function sheetMotion(gsap, ScrollTrigger) {
  const sheet = document.querySelector('.sheet');
  if (!sheet) return;
  // rows start as negatives and are developed, frame by frame, as each one arrives
  sheet.classList.add('is-negative');
  sheet.querySelectorAll('.row').forEach((r) => {
    const ring = r.querySelector('.thumb__ring path');
    gsap.set(ring, { strokeDashoffset: 1 });
    ScrollTrigger.create({
      trigger: r, start: 'top 88%', once: true,
      onEnter: () => {
        r.classList.add('is-developing', 'is-developed');
        setTimeout(() => r.classList.remove('is-developing'), developMs(r));
        gsap.to(ring, { strokeDashoffset: 0, duration: 0.55, ease: 'power2.out', delay: 0.9 });
      },
    });
  });

  // the red line runs down the margin as the sheet scrolls past, then the note is written
  const line = pencilSvg('M0 0', 1, 1, 'sheet__pencil');
  sheet.append(line);
  const path = line.querySelector('path');
  const rebuild = () => buildLine(sheet, line, path);
  rebuild();
  ScrollTrigger.addEventListener('refresh', rebuild);
  gsap.fromTo(path, { strokeDashoffset: 1 }, {
    strokeDashoffset: 0, ease: 'none',
    scrollTrigger: { trigger: sheet, start: 'top 50%', end: 'bottom 72%', scrub: 0.5 },
  });
  gsap.from('.sheet__note', {
    opacity: 0, x: -14, duration: 0.65, ease: 'expo.out',
    scrollTrigger: { trigger: '.sheet__note', start: 'top 90%' },
  });
}
