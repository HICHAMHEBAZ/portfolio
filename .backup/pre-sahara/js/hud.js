// Camera-slate HUD: chapter number, chapter name and a running timecode.
// The page is treated as one four-minute film; scroll position is the playhead.
const RUNTIME_S = 240;
const FPS = 24;

const pad = (n) => String(n).padStart(2, '0');

function timecode(progress) {
  const frames = Math.round(progress * RUNTIME_S * FPS);
  const s = Math.floor(frames / FPS);
  return `00:${pad(Math.floor(s / 60))}:${pad(s % 60)}:${pad(frames % FPS)}`;
}

export function initHud(gsap, ScrollTrigger) {
  const hud = document.getElementById('hud');
  if (!hud) return;
  const no = hud.querySelector('.hud__no');
  const name = hud.querySelector('.hud__name');
  const tc = hud.querySelector('.hud__tc');

  // roll the old label up and the new one in from below, like a split-flap.
  // Fast jumps kill the running roll so the last chapter entered always wins.
  let current = no.textContent;
  let rolling = null;
  const roll = (num, label) => {
    if (current === num) return;
    current = num;
    rolling?.kill();
    rolling = gsap.timeline()
      .to([no, name], { yPercent: -110, opacity: 0, duration: 0.22, ease: 'power2.in', stagger: 0.04 })
      .add(() => { no.textContent = num; name.textContent = label; })
      .fromTo([no, name], { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'expo.out', stagger: 0.05 });
  };

  document.querySelectorAll('[data-chapter]').forEach((section) => {
    const [num, label] = section.dataset.chapter.split('|');
    ScrollTrigger.create({
      trigger: section, start: 'top 55%', end: 'bottom 55%',
      // enter fires even when a jump skips straight past, so the label never goes stale
      onEnter: () => roll(num, label),
      onEnterBack: () => roll(num, label),
    });
  });

  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => { tc.textContent = timecode(self.progress); },
  });
  ScrollTrigger.create({
    trigger: '.hero', start: 'top top', end: 'bottom 60%',
    onToggle: (self) => hud.classList.toggle('is-tucked', self.isActive),
  });
  hud.classList.add('is-on');
}
