import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.defaults({ ease: 'power3.out', duration: 0.9 });

export const reducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isDesktop = (): boolean => window.matchMedia('(min-width: 1024px)').matches;
export const canHover = (): boolean => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
export const motionEnabled = (): boolean => !reducedMotion();

export { gsap, ScrollTrigger, SplitText };
