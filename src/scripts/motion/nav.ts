import { gsap, ScrollTrigger, motionEnabled } from './gsap-setup';

export default function nav(root: HTMLElement): () => void {
  const bg = root.querySelector<HTMLElement>('[data-nav-bg]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const overlay = root.querySelector<HTMLElement>('[data-nav-overlay]');
  const items = overlay?.querySelectorAll<HTMLElement>('[data-nav-overlay-item]') ?? [];
  let open = false;

  const trigger = ScrollTrigger.create({
    start: 80,
    end: 'max',
    onUpdate(self) {
      const scrolled = self.scroll() > 80;
      if (bg) bg.style.opacity = scrolled ? '1' : '0';
      const hide = self.direction === 1 && self.scroll() > 200 && !open;
      root.style.transform = hide ? 'translateY(-100%)' : 'translateY(0)';
    },
    onLeaveBack() {
      if (bg) bg.style.opacity = '0';
      root.style.transform = 'translateY(0)';
    },
  });

  const setOpen = (next: boolean) => {
    open = next;
    if (!toggle || !overlay) return;
    toggle.setAttribute('aria-expanded', String(next));
    toggle.setAttribute('aria-label', next ? 'Menü schließen' : 'Menü öffnen');
    document.documentElement.style.overflow = next ? 'hidden' : '';
    const bars = toggle.querySelectorAll<HTMLElement>('[data-bar]');
    bars[0]?.style.setProperty('transform', next ? 'translateY(7px) rotate(45deg)' : '');
    bars[1]?.style.setProperty('opacity', next ? '0' : '1');
    bars[2]?.style.setProperty('transform', next ? 'translateY(-7px) rotate(-45deg)' : '');

    if (next) {
      overlay.hidden = false;
      if (motionEnabled()) {
        gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.4 });
        gsap.fromTo(items, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, delay: 0.1 });
      }
    } else if (motionEnabled()) {
      gsap.to(overlay, { opacity: 0, duration: 0.3, onComplete: () => { overlay.hidden = true; } });
    } else {
      overlay.hidden = true;
    }
  };

  const onToggle = () => setOpen(!open);
  const onLink = () => open && setOpen(false);
  const onKey = (e: KeyboardEvent) => e.key === 'Escape' && open && setOpen(false);

  toggle?.addEventListener('click', onToggle);
  overlay?.querySelectorAll('a').forEach((a) => a.addEventListener('click', onLink));
  document.addEventListener('keydown', onKey);

  return () => {
    trigger.kill();
    toggle?.removeEventListener('click', onToggle);
    overlay?.querySelectorAll('a').forEach((a) => a.removeEventListener('click', onLink));
    document.removeEventListener('keydown', onKey);
    document.documentElement.style.overflow = '';
  };
}
