// Corner chrome, as on the carousel slides: the chapter counter ("03 / 08")
// and the chapter's name, rolled like a split-flap when a new chapter arrives.
export function initHud(gsap, ScrollTrigger) {
  const hud = document.getElementById('hud');
  if (!hud) return;
  const no = hud.querySelector('.hud__no');
  const name = hud.querySelector('.hud__name');

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

  // start above the fold so the HUD is already tucked at scroll 0 (a 'top top' start is inactive there)
  ScrollTrigger.create({
    trigger: '.hero', start: 'top bottom', end: 'bottom 60%',
    onToggle: (self) => hud.classList.toggle('is-tucked', self.isActive),
  });
  hud.classList.add('is-on');
}
