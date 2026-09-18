/**
 * Setzt die Zeichen-Animation in Gang, sobald ein Icon ins Bild kommt.
 * Die Animation selbst steht in CSS, hier faellt nur die Entscheidung wann.
 */
export default function iconDraw(root: HTMLElement): () => void {
  const icons = [...root.querySelectorAll<SVGElement>("[data-icon='draw']")];
  if (!icons.length) return () => {};

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-drawn');
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.4 },
  );
  icons.forEach((i) => io.observe(i));

  return () => io.disconnect();
}
