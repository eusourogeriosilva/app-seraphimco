// Seraphim.co — menu do cabeçalho (disclosure) para 5 ou mais links, abaixo de 960 px.
// Marcação: ver src/components/README.md. Sem dependências.
const WIDE = '(min-width: 960px)';

function set(header: HTMLElement, toggle: HTMLElement, open: boolean): void {
  header.toggleAttribute('data-open', open);
  toggle.setAttribute('aria-expanded', String(open));
}

export function initMenu(root: ParentNode = document): void {
  for (const header of root.querySelectorAll<HTMLElement>('.site-header[data-nav="menu"]')) {
    const toggle = header.querySelector<HTMLElement>('.site-header__toggle');
    if (!toggle) continue;
    set(header, toggle, false);
    toggle.addEventListener('click', () => set(header, toggle, !header.hasAttribute('data-open')));
    header.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !header.hasAttribute('data-open')) return;
      set(header, toggle, false);
      toggle.focus();
    });
    header.addEventListener('click', (e) => {
      if ((e.target as Element).closest('.site-header__nav a')) set(header, toggle, false);
    });
    // Ao chegar ao desktop o menu volta ao estado fechado, para não reabrir sozinho ao estreitar.
    window.matchMedia(WIDE).addEventListener('change', (m) => { if (m.matches) set(header, toggle, false); });
  }
}
