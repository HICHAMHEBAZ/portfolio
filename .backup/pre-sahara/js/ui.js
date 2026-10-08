import { PROJECTS, PROFILE } from './data.js';
import { Carousel } from './carousel.js';
import { $, slideNodes, el } from './render.js';

const finePointer = window.matchMedia('(pointer: fine)').matches;

export function initNav() {
  const nav = $('#nav');
  const burger = $('#burger');
  const links = [...document.querySelectorAll('.nav__links a')];
  const sticky = $('.sticky-cta');
  let lastY = window.scrollY;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const goingDown = y > lastY && y > 400;
    nav.classList.toggle('is-hidden', goingDown && !nav.classList.contains('is-open'));
    sticky?.classList.toggle('is-shown', y > window.innerHeight * 0.8);
    nav.classList.toggle('is-solid', y > 40);
    lastY = y;
  }, { passive: true });

  const close = () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  };
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  links.forEach((a) => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['proof', 'method', 'writing', 'offer', 'faq'].forEach((id) => {
    const s = document.getElementById(id);
    if (s) spy.observe(s);
  });
}

export function initCursor() {
  const cursor = $('#cursor');
  const label = $('#cursor-label');
  if (!finePointer || !cursor) return;
  let x = -100; let y = -100; let cx = x; let cy = y;
  window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
  const tick = () => {
    cx += (x - cx) * 0.22;
    cy += (y - cy) * 0.22;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(tick);
  };
  tick();
  document.addEventListener('pointerover', (e) => {
    const target = e.target.closest('[data-cursor]');
    cursor.classList.toggle('is-label', !!target);
    label.textContent = target ? target.dataset.cursor : '';
  });
}

export function initLightbox() {
  const dialog = $('#lightbox');
  const carousel = new Carousel($('#lb-carousel'));
  let opener = null;

  const open = (id, startAt = 0) => {
    const p = PROJECTS.find((x) => x.id === id);
    if (!p) return;
    $('#lb-title').textContent = p.title;
    $('#lb-tag').textContent = `${p.tag} · ${p.year}`;
    $('#lb-blurb').textContent = p.blurb;
    $('#lb-roles').replaceChildren(...p.role.map((r) => el('li', { text: r })));
    carousel.setSlides(slideNodes(p.gallery, p.title));
    $('#lb-carousel .carousel__ui').hidden = p.gallery.length < 2;
    dialog.showModal();
    requestAnimationFrame(() => carousel.goTo(startAt));
    $('#lb-track').focus({ preventScroll: true });
  };

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open]');
    if (!trigger) return;
    opener = trigger;
    open(trigger.dataset.open, Number(trigger.dataset.fan || 0));
  });
  $('#lb-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function initForm() {
  const form = $('#contact-form');
  const error = $('#form-error');

  // "Ask about this" on a service pre-selects the matching chip
  document.querySelectorAll('[data-service]').forEach((a) => a.addEventListener('click', () => {
    const map = { 'Social media content': 'Social media content', 'Campaign creative': 'Campaign creative', 'Marketing strategy': 'Marketing strategy', 'Ads that convert': 'Ads' };
    const radio = form.querySelector(`input[value="${map[a.dataset.service]}"]`);
    if (radio) radio.checked = true;
  }));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const fields = {
      name: (data.name || '').trim(),
      email: (data.email || '').trim(),
      message: (data.message || '').trim(),
    };
    const problems = [];
    form.querySelectorAll('[aria-invalid]').forEach((n) => n.removeAttribute('aria-invalid'));
    if (fields.name.length < 2) problems.push(['name', 'your name']);
    if (!EMAIL_RE.test(fields.email)) problems.push(['email', 'a valid email']);
    if (fields.message.length < 10) problems.push(['message', 'a few words about the project']);
    if (problems.length) {
      problems.forEach(([n]) => form.elements[n].setAttribute('aria-invalid', 'true'));
      error.textContent = `Please add ${problems.map((p) => p[1]).join(', ')}.`;
      form.elements[problems[0][0]].focus();
      form.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(0)' }], { duration: 350, easing: 'ease-in-out' });
      return;
    }
    error.textContent = '';
    const subject = `Project brief: ${data.type} (${fields.name})`;
    const body = `Name: ${fields.name}\nEmail: ${fields.email}\nNeed: ${data.type}\n\n${fields.message}`;
    window.location.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

const HANDLE_RE = /^[A-Za-z0-9._]{1,30}$/;

// Hero lead magnet: one field (Instagram handle), handed to the visitor's mail app.
export function initAuditForm() {
  const form = $('#audit-form');
  const msg = $('#audit-msg');
  if (!form) return;
  const defaultMsg = msg.innerHTML;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const handle = form.elements.handle.value.trim().replace(/^@/, '');
    if (!HANDLE_RE.test(handle)) {
      form.setAttribute('aria-invalid', 'true');
      msg.classList.add('is-error');
      msg.textContent = 'Type your Instagram handle, letters, numbers, dots or underscores.';
      form.elements.handle.focus();
      form.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], { duration: 320, easing: 'ease-in-out' });
      return;
    }
    form.removeAttribute('aria-invalid');
    msg.classList.remove('is-error');
    msg.innerHTML = defaultMsg;
    const subject = `Free feed audit: @${handle}`;
    const body = `Hi, could you look at https://instagram.com/${handle} and send me your 3 fixes?

What I sell:
`;
    window.location.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  form.elements.handle.addEventListener('input', () => {
    if (form.hasAttribute('aria-invalid')) {
      form.removeAttribute('aria-invalid');
      msg.classList.remove('is-error');
      msg.innerHTML = defaultMsg;
    }
  });
}
