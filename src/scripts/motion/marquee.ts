import { gsap, motionEnabled } from './gsap-setup';

export default function marquee(root: HTMLElement): () => void {
  const track = root.querySelector<HTMLElement>('[data-marquee-track]');
  if (!track || !motionEnabled()) return () => {};

  const tween = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
  const pause = () => tween.pause();
  const play = () => tween.play();
  root.addEventListener('pointerenter', pause);
  root.addEventListener('pointerleave', play);

  return () => {
    tween.kill();
    root.removeEventListener('pointerenter', pause);
    root.removeEventListener('pointerleave', play);
  };
}
