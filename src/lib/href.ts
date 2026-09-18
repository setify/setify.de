/**
 * Hash-Links brauchen ausserhalb der Startseite einen `/`-Praefix, damit sie
 * dorthin zurueckfuehren. Pfade wie `/ki` duerfen ihn nie bekommen, sonst
 * entsteht `//ki`, also eine protokollrelative URL auf den Host `ki`.
 */
export function navHref(href: string, pathname: string): string {
  if (!href.startsWith('#')) return href;
  return pathname === '/' ? href : `/${href}`;
}
