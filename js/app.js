import { renderAll, oklaImages, $ } from './render.js';
import { mountElements } from './elements.js';
import { mountSeams } from './seams.js';
import { mountAmbient } from './ambient.js';
import { Carousel, SwipeDeck } from './carousel.js';
import { initNav, initCursor, initLightbox, initForm, initAuditForm } from './ui.js';
import { initMotion } from './motion.js';

let heroApi = null;
// proxy so motion can talk to the 3D scene before it has finished loading
const hero = {
  nod: () => heroApi?.nod(),
};

function boot() {
  renderAll();
  mountElements();
  mountSeams();
  mountAmbient();
  new Carousel(document.querySelector('.case [data-carousel]'));
  new SwipeDeck($('#okla-deck'), oklaImages());
  initNav();
  initCursor();
  initLightbox();
  initForm();
  initAuditForm();
  initMotion({ hero });
  loadHero();
}

async function loadHero() {
  const container = $('#hero-canvas');
  try {
    // three.js is only fetched once the page content is up
    const { initHeroScene } = await import('./scene/hero-scene.js');
    heroApi = await initHeroScene(container, { mascotUrl: 'assets/img/mascot-cutout.webp' });
    if (heroApi) {
      container.classList.add('is-live');
      container.closest('.hero')?.classList.add('has-3d');
    }
  } catch (err) {
    console.error('3D hero failed, keeping the static mascot:', err);
  }
}

boot();
