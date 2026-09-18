/**
 * Bilder blenden nach dem Laden weich ein.
 *
 * Kein Beobachter noetig: die Bilder laden ohnehin verzoegert (loading="lazy"),
 * das Einblenden haengt deshalb am load-Ereignis. Bereits vollstaendige Bilder,
 * etwa aus dem Cache oder beim Zurueckblaettern, werden sofort geschaltet,
 * sonst blieben sie unsichtbar.
 */
export default function imageFade(root: HTMLElement): () => void {
  const bilder = Array.from(root.querySelectorAll<HTMLImageElement>('img[data-fade]'));
  const abgeraeumt: Array<() => void> = [];

  for (const bild of bilder) {
    if (bild.complete && bild.naturalWidth > 0) {
      bild.setAttribute('data-geladen', '');
      continue;
    }
    const an = () => bild.setAttribute('data-geladen', '');
    bild.addEventListener('load', an, { once: true });
    // Auch bei einem Fehler freigeben, sonst bleibt an der Stelle ein Loch.
    bild.addEventListener('error', an, { once: true });
    abgeraeumt.push(() => {
      bild.removeEventListener('load', an);
      bild.removeEventListener('error', an);
    });
  }

  return () => abgeraeumt.forEach((fn) => fn());
}
