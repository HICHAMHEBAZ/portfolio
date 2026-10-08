// Scroll-snap carousel with buttons, keyboard, drag-to-scroll and a progress bar.
export class Carousel {
  constructor(root) {
    this.root = root;
    this.track = root.querySelector('.carousel__track');
    this.bar = root.querySelector('[data-bar]');
    this.prevBtn = root.querySelector('[data-prev]');
    this.nextBtn = root.querySelector('[data-next]');
    this.index = 0;
    this.bind();
  }

  get slides() {
    return [...this.track.children];
  }

  setSlides(nodes) {
    this.track.replaceChildren(...nodes);
    this.track.scrollLeft = 0;
    this.index = 0;
    requestAnimationFrame(() => this.sync());
  }

  goTo(i) {
    const slides = this.slides;
    if (!slides.length) return;
    const target = slides[(i + slides.length) % slides.length];
    const pad = parseFloat(getComputedStyle(this.track).paddingLeft) || 0;
    this.track.scrollTo({ left: target.offsetLeft - pad, behavior: 'smooth' });
  }

  sync() {
    const slides = this.slides;
    if (!slides.length) return;
    const pad = parseFloat(getComputedStyle(this.track).paddingLeft) || 0;
    const left = this.track.scrollLeft + pad;
    const atEnd = this.track.scrollLeft + this.track.clientWidth >= this.track.scrollWidth - 4;
    let best = 0;
    let bestDist = Infinity;
    slides.forEach((s, i) => {
      const d = atEnd ? slides.length - i : Math.abs(s.offsetLeft - left);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    this.index = best;
    slides.forEach((s, i) => {
      s.classList.toggle('is-current', i === best);
      s.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
    });
    if (this.bar) this.bar.style.width = `${((best + 1) / slides.length) * 100}%`;
  }

  bind() {
    this.prevBtn?.addEventListener('click', () => this.goTo(this.index - 1));
    this.nextBtn?.addEventListener('click', () => this.goTo(this.index + 1));
    let raf = 0;
    this.track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => this.sync());
    }, { passive: true });
    this.track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); this.goTo(this.index + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); this.goTo(this.index - 1); }
    });

    // mouse drag (touch already scrolls natively)
    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    let moved = false;
    this.track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startScroll = this.track.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) {
        moved = true;
        this.track.classList.add('is-dragging');
      }
      this.track.scrollLeft = startScroll - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      this.track.classList.remove('is-dragging');
      if (moved) this.goTo(this.index);
    });
    // swallow the click that ends a drag
    this.track.addEventListener('click', (e) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
  }
}

// Stack of cards; drag the top one sideways past a threshold to send it to the back.
export class SwipeDeck {
  constructor(root, images, { onSwipe } = {}) {
    this.root = root;
    this.onSwipe = onSwipe;
    this.cards = images.map((img, i) => {
      const card = document.createElement('div');
      card.className = 'deck__card';
      card.append(img);
      card.dataset.i = i;
      return card;
    });
    this.root.append(...this.cards.slice().reverse());
    this.layout();
    this.bindTop();
    this.root.tabIndex = 0;
    this.root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') this.throwTop(e.key === 'ArrowRight' ? 1 : -1);
    });
  }

  layout() {
    this.cards.forEach((card, depth) => {
      const rot = depth === 0 ? -2 : (depth % 2 ? 4 : -5) + depth;
      card.style.zIndex = String(this.cards.length - depth);
      card.style.transform = `translate(${depth * 8}px, ${depth * 10}px) rotate(${rot}deg) scale(${1 - depth * 0.03})`;
      card.setAttribute('aria-hidden', depth === 0 ? 'false' : 'true');
    });
  }

  throwTop(dir) {
    const top = this.cards[0];
    top.style.transform = `translate(${dir * 120}%, -10%) rotate(${dir * 24}deg)`;
    setTimeout(() => {
      this.cards = [...this.cards.slice(1), top];
      this.layout();
      this.bindTop();
      this.onSwipe?.();
    }, 260);
  }

  bindTop() {
    const card = this.cards[0];
    if (card.dataset.bound) return;
    card.dataset.bound = '1';
    let startX = 0;
    let dx = 0;
    let active = false;
    card.addEventListener('pointerdown', (e) => {
      if (this.cards[0] !== card) return;
      active = true;
      startX = e.clientX;
      dx = 0;
      card.setPointerCapture(e.pointerId);
      card.classList.add('is-dragging');
    });
    card.addEventListener('pointermove', (e) => {
      if (!active) return;
      dx = e.clientX - startX;
      card.style.transform = `translate(${dx}px, ${Math.abs(dx) * -0.05}px) rotate(${dx * 0.06}deg)`;
    });
    const end = () => {
      if (!active) return;
      active = false;
      card.classList.remove('is-dragging');
      if (Math.abs(dx) > this.root.clientWidth * 0.25) this.throwTop(Math.sign(dx));
      else this.layout();
    };
    card.addEventListener('pointerup', end);
    card.addEventListener('pointercancel', end);
  }
}
