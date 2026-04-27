/**
 * Near you — dynamic shell (tabs + default not-logged-in copy).
 * Content is code-driven at runtime; empty block in the document is expected (plan A).
 */

const DEFAULT_BODY = 'Localize your USTA.com experience by adjusting your browser settings to allow location sharing.';

function createPanel(panelId, labelledByTabId, titleText) {
  const panel = document.createElement('div');
  panel.className = 'near-you-panel';
  panel.id = panelId;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', labelledByTabId);
  const title = document.createElement('h2');
  title.className = 'near-you-panel-title';
  title.textContent = titleText;
  const body = document.createElement('p');
  body.className = 'near-you-panel-body';
  body.textContent = DEFAULT_BODY;
  panel.append(title, body);
  return panel;
}

export default function decorate(block) {
  const base = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `ny-${Date.now()}`;
  const tabTournamentsId = `near-you-tab-tournaments-${base}`;
  const tabProgramsId = `near-you-tab-programs-${base}`;
  const panelTournamentsId = `near-you-panel-tournaments-${base}`;
  const panelProgramsId = `near-you-panel-programs-${base}`;

  const tablist = document.createElement('div');
  tablist.className = 'near-you-tablist';
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'Near you');

  const tabTournaments = document.createElement('button');
  tabTournaments.type = 'button';
  tabTournaments.className = 'near-you-tab';
  tabTournaments.id = tabTournamentsId;
  tabTournaments.textContent = 'Tournaments';
  tabTournaments.setAttribute('role', 'tab');
  tabTournaments.setAttribute('aria-selected', 'true');
  tabTournaments.setAttribute('aria-controls', panelTournamentsId);
  tabTournaments.setAttribute('tabindex', '0');

  const tabPrograms = document.createElement('button');
  tabPrograms.type = 'button';
  tabPrograms.className = 'near-you-tab';
  tabPrograms.id = tabProgramsId;
  tabPrograms.textContent = 'Programs';
  tabPrograms.setAttribute('role', 'tab');
  tabPrograms.setAttribute('aria-selected', 'false');
  tabPrograms.setAttribute('aria-controls', panelProgramsId);
  tabPrograms.setAttribute('tabindex', '-1');

  tablist.append(tabTournaments, tabPrograms);

  const panelTournaments = createPanel(
    panelTournamentsId,
    tabTournamentsId,
    'TOURNAMENTS NEAR YOU',
  );
  panelTournaments.setAttribute('aria-hidden', 'false');

  const panelPrograms = createPanel(
    panelProgramsId,
    tabProgramsId,
    'PROGRAMS NEAR YOU',
  );
  panelPrograms.setAttribute('aria-hidden', 'true');

  const panels = document.createElement('div');
  panels.className = 'near-you-panels';
  panels.append(panelTournaments, panelPrograms);

  const tabs = [tabTournaments, tabPrograms];
  const tabpanels = [panelTournaments, panelPrograms];

  function selectTab(index) {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.setAttribute('tabindex', selected ? '0' : '-1');
    });
    tabpanels.forEach((panel, i) => {
      panel.setAttribute('aria-hidden', String(i !== index));
    });
  }

  tabTournaments.addEventListener('click', () => {
    selectTab(0);
    tabTournaments.focus();
  });
  tabPrograms.addEventListener('click', () => {
    selectTab(1);
    tabPrograms.focus();
  });

  tablist.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(e.target);
    if (i < 0) return;
    if (e.key === 'ArrowRight' && i < tabs.length - 1) {
      e.preventDefault();
      selectTab(i + 1);
      tabs[i + 1].focus();
    } else if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault();
      selectTab(i - 1);
      tabs[i - 1].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      selectTab(0);
      tabs[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      selectTab(tabs.length - 1);
      tabs[tabs.length - 1].focus();
    }
  });

  block.textContent = '';
  block.append(tablist, panels);
}
