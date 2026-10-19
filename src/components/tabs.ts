// Seraphim.co — abas de painel (WAI-ARIA tabs), ativação automática e foco móvel.
// Marcação: ver src/components/README.md. Sem dependências.
const TAB = '[role="tab"]';

function select(list: HTMLElement, tab: HTMLElement, focus: boolean): void {
  for (const t of list.querySelectorAll<HTMLElement>(TAB)) {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(t.getAttribute('aria-controls') ?? '');
    if (panel) panel.hidden = !on;
  }
  if (focus) tab.focus();
  tab.scrollIntoView({ inline: 'nearest', block: 'nearest' });
}

export function initTabs(root: ParentNode = document): void {
  for (const list of root.querySelectorAll<HTMLElement>('[role="tablist"]')) {
    const tabs = [...list.querySelectorAll<HTMLElement>(TAB)];
    if (!tabs.length) continue;
    select(list, tabs.find((t) => t.getAttribute('aria-selected') === 'true') ?? tabs[0]!, false);
    list.addEventListener('click', (e) => {
      const tab = (e.target as Element).closest<HTMLElement>(TAB);
      if (tab && list.contains(tab)) select(list, tab, false);
    });
    list.addEventListener('keydown', (e) => {
      const current = (e.target as Element).closest<HTMLElement>(TAB);
      if (!current) return;
      const i = tabs.indexOf(current);
      const next =
        e.key === 'ArrowRight' ? tabs[(i + 1) % tabs.length]
        : e.key === 'ArrowLeft' ? tabs[(i - 1 + tabs.length) % tabs.length]
        : e.key === 'Home' ? tabs[0]
        : e.key === 'End' ? tabs[tabs.length - 1]
        : undefined;
      if (!next) return;
      e.preventDefault();
      select(list, next, true);
    });
  }
}
