/**
 * player-rankings block – Junior Tournament Rankings
 *
 * UI pattern: https://www.usta.com/en/home/play/rankings.html
 *
 * Production (how usta.com actually loads data):
 *   The live junior rankings search is a POST to USTA’s public rankings API, e.g.:
 *   POST https://services.usta.com/v1/dataexchange/rankings/search/public
 *   (same path is exposed via www.usta.com’s dispatcher in some setups).
 *   Request body matches what buildPayload() builds: { selection, pagination } with
 *   playerType, juniorListType, rankListGender, ageRestriction, list/match params,
 *   optional region, playerName, asOfDate, etc.
 *
 * Why this block uses jsons/ instead of calling that API in the browser:
 *   A page served from another origin (local dev, Franklin preview, or any non-USTA host)
 *   cannot reliably fetch services.usta.com in the client — the API does not allow
 *   those origins, so the browser enforces CORS and the call fails. To develop and
 *   demo the UI, we load static JSON snapshots from jsons/ and run filters + paging
 *   in memory. For production on usta.com (or any deployment with a same-origin
 *   endpoint, serverless proxy, or server-side call), you would replace loadMockCache +
 *   the body of fetchRankings with a real fetch(POST) using the same payload shape.
 *
 * State flow:
 *   1. Block initialises → render shell with controls
 *   2. On each filter change or page change → buildPayload() → fetchRankings()
 *   3. Response → renderTable() + renderPagination()
 *   4. Location hash is kept in sync (USTA-style), e.g.
 *      #tab=junior&junior-juniorListType=doubles&junior-rankListGender=M&junior-page=1&junior-sectionCode=S10
 *      (see usta.com/play/rankings for the same param names)
 *
 * Document authoring table shape (AEM/EDS table-block convention):
 *   Row 1: "Player Rankings"  (block name)
 *   Row 2: rankingType        e.g. "combined"
 *   Row 3: gender             e.g. "F"
 *   Row 4: ageGroup           e.g. "Y12"
 *
 * Block defaults (no table overrides) match usta.com: Combined National
 * Standings, Girls, 12 & Under, publish date 2026-04-22, search empty, all sections.
 */

/* ─── Constants ────────────────────────────────────────────────────────────── */

const PAGE_SIZE = 20;
/** 12 columns: three ranks, name, four point columns, city, state, section, district. */
const PR_TABLE_COL_COUNT = 12;
const PLAYER_PROFILE_URL = 'https://www.usta.com/en/home/play/player-search/profile.html';

function fmtPoints(value) {
  if (value == null || (typeof value === 'number' && Number.isNaN(value))) return '—';
  return Number(value).toLocaleString();
}

const LIST_TYPES = [
  {
    label: 'Combined National Standings List',
    value: 'combined',
    params: { listType: 'STANDING' },
  },
  {
    label: 'Singles Seeding List',
    value: 'seeding',
    params: { matchFormat: 'SINGLES', listType: 'SEEDING' },
  },
  {
    label: 'Doubles Seeding List',
    value: 'doubles',
    params: { matchFormat: 'DOUBLES', listType: 'SEEDING', matchFormatType: 'INDIVIDUAL' },
  },
  {
    label: 'Bonus Points List',
    value: 'bonusPoints',
    params: { listType: 'BONUS_POINTS' },
  },
  {
    label: 'Sectional Quota List',
    value: 'quota',
    params: { listType: 'QUOTA' },
  },
  {
    label: 'Final Year End Combined Rank List',
    value: 'combinedYearEnd',
    params: { listType: 'YEAR_END', matchFormat: 'NULL', matchFormatType: 'NULL' },
  },
  {
    label: 'Final Year End Doubles Rank List',
    value: 'doublesYearEnd',
    params: { matchFormat: 'DOUBLES', matchFormatType: 'INDIVIDUAL', listType: 'YEAR_END' },
  },
];

const GENDERS = [
  { label: 'Boys', value: 'M' },
  { label: 'Girls', value: 'F' },
];

const AGE_GROUPS = [
  { label: '12 & Under', value: 'Y12' },
  { label: '14 & Under', value: 'Y14' },
  { label: '16 & Under', value: 'Y16' },
  { label: '18 & Under', value: 'Y18' },
];

const SECTIONS = [
  { label: 'All Sections', value: '' },
  { label: 'Caribbean', value: 'S05' },
  { label: 'Eastern', value: 'S10' },
  { label: 'Florida', value: 'S15' },
  { label: 'Hawaii Pacific', value: 'S20' },
  { label: 'Intermountain', value: 'S25' },
  { label: 'Mid-Atlantic', value: 'S30' },
  { label: 'Middle States', value: 'S35' },
  { label: 'Midwest', value: 'S85' },
  { label: 'Missouri Valley', value: 'S40' },
  { label: 'New England', value: 'S45' },
  { label: 'Northern California', value: 'S50' },
  { label: 'Northern', value: 'S55' },
  { label: 'Pacific NW', value: 'S60' },
  { label: 'Southern California', value: 'S65' },
  { label: 'Southern', value: 'S70' },
  { label: 'Southwest', value: 'S75' },
  { label: 'Texas', value: 'S80' },
];

/* ─── State ─────────────────────────────────────────────────────────────────── */

function createState(defaults) {
  return {
    listType: defaults.listType || 'combined',
    gender: defaults.gender || 'F',
    ageGroup: defaults.ageGroup || 'Y12',
    section: '',
    searchName: '',
    /** YYYY-MM-DD; compared to each mock file’s publishDate. */
    publishDate: defaults.publishDate ?? '2026-04-22',
    currentPage: 1,
    loading: false,
    error: null,
    data: null,
  };
}

/* ── URL hash (USTA junior-* fragment params) ─────────────────────────── */

const SECTION_CODES = new Set(SECTIONS.map((s) => s.value).filter(Boolean));

/** True when the hash has at least one `junior-…` param (not `tab=junior` alone). */
function isJuniorUrlFragment(p) {
  for (const k of p.keys()) {
    if (k.startsWith('junior-')) return true;
  }
  return false;
}

const DEFAULT_JUNIOR_STATE = {
  listType: 'combined',
  gender: 'F',
  ageGroup: 'Y12',
  section: '',
  searchName: '',
  publishDate: '2026-04-22',
  currentPage: 1,
};

/**
 * Reads #tab=junior&junior-…; when a junior fragment is present, returns
 * a full set of filter fields (like USTA’s in-page behavior). Authored/defaults
 * are still merged by the caller (hash applies after createState(authoring)).
 * @returns {{ filterState: null | object, hadPublishInHash: boolean, ignore: boolean }}
 */
function getPlayerRankingsStateFromHash() {
  if (typeof location === 'undefined') {
    return { filterState: null, hadPublishInHash: false, ignore: false };
  }
  const raw = location.hash?.replace(/^#/, '') ?? '';
  if (!raw.trim()) {
    return { filterState: null, hadPublishInHash: false, ignore: false };
  }
  const p = new URLSearchParams(raw);
  if (p.has('tab') && p.get('tab') !== 'junior') {
    return { filterState: null, hadPublishInHash: false, ignore: true };
  }
  if (!isJuniorUrlFragment(p)) {
    return { filterState: null, hadPublishInHash: false, ignore: false };
  }
  const next = { ...DEFAULT_JUNIOR_STATE };
  if (p.has('junior-juniorListType')) {
    const v = p.get('junior-juniorListType') ?? '';
    if (v && LIST_TYPES.some((l) => l.value === v)) next.listType = v;
  }
  if (p.has('junior-rankListGender')) {
    const g = p.get('junior-rankListGender') ?? '';
    if (g && GENDERS.some((x) => x.value === g)) next.gender = g;
  }
  if (p.has('junior-ageRestriction')) {
    const a = p.get('junior-ageRestriction') ?? '';
    if (a && AGE_GROUPS.some((x) => x.value === a)) next.ageGroup = a;
  }
  if (p.has('junior-page')) {
    const n = parseInt(p.get('junior-page') ?? '1', 10);
    if (Number.isFinite(n) && n > 0) next.currentPage = n;
  } else {
    next.currentPage = 1;
  }
  if (p.has('junior-sectionCode')) {
    const c = p.get('junior-sectionCode') ?? '';
    if (c && SECTION_CODES.has(c)) next.section = c;
    else if (c === '' || c === 'all') next.section = '';
  }
  if (p.has('junior-publishDate')) {
    const d = p.get('junior-publishDate') ?? '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) next.publishDate = d;
  }
  if (p.has('junior-playerName')) {
    next.searchName = p.get('junior-playerName')?.trim() ?? '';
  } else if (p.has('junior-search')) {
    next.searchName = p.get('junior-search')?.trim() ?? '';
  } else {
    next.searchName = '';
  }
  return {
    filterState: next,
    hadPublishInHash: p.has('junior-publishDate'),
    ignore: false,
  };
}

/** Writes #tab=junior&junior-…; uses replaceState (no history spam). */
function replaceHashFromPlayerRankingsState(state) {
  if (typeof history === 'undefined' || typeof location === 'undefined') return;
  const next = new URLSearchParams();
  next.set('tab', 'junior');
  next.set('junior-juniorListType', state.listType);
  next.set('junior-rankListGender', state.gender);
  next.set('junior-ageRestriction', state.ageGroup);
  next.set('junior-page', String(state.currentPage));
  if (state.section) {
    next.set('junior-sectionCode', state.section);
  }
  if (state.publishDate) {
    next.set('junior-publishDate', state.publishDate);
  }
  const s = state.searchName ? state.searchName.trim() : '';
  if (s) {
    next.set('junior-playerName', s);
  }
  const hash = `#${next.toString()}`;
  if (location.hash === hash) return;
  const u = new URL(location.href);
  u.hash = hash;
  history.replaceState(null, '', u);
}

/** If there is no fragment, set #tab=junior so the bar matches USTA before/without filters. */
function ensureTabJuniorInUrlWhenHashEmpty() {
  if (typeof history === 'undefined' || typeof location === 'undefined') return;
  const fr = (location.hash || '').replace(/^#/, '').trim();
  if (fr !== '') return;
  const u = new URL(location.href);
  u.hash = 'tab=junior';
  history.replaceState(null, '', u);
}

/* ─── Date helper ────────────────────────────────────────────────────────── */

/** Calendar day YYYY-MM-DD in UTC, for comparing mock publishDate ISO strings. */
function calendarDayUTC(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

/* ─── Request shape + data load -------------------------------------------------
   buildPayload() is the same structure you would POST in production. Below, loadMockCache
   + fetchRankings() substitute static files under jsons/ because cross-origin fetches
   to services.usta.com are blocked (CORS) from typical dev and static site origins.
   ---------------------------------------------------------------------------- */

function buildPayload(state) {
  const listDef = LIST_TYPES.find((l) => l.value === state.listType) || LIST_TYPES[2];

  const selection = {
    playerType: 'JUNIOR',
    ageRestrictionModifier: 'UNDER',
    juniorListType: state.listType,
    rankListGender: state.gender,
    ageRestriction: state.ageGroup,
    ...listDef.params,
  };

  if (state.section) selection['region.sectionCode'] = state.section;
  if (state.searchName) selection.playerName = state.searchName.trim();

  if (state.publishDate) {
    const t = new Date(`${state.publishDate}T12:00:00`);
    if (!Number.isNaN(t.getTime())) {
      selection.asOfDate = { publishDate: t.toISOString() };
    }
  }

  return {
    selection,
    pagination: {
      pageSize: PAGE_SIZE,
      currentPage: state.currentPage,
    },
  };
}

/**
 * In-memory cache; keys are "{listType}-{gender}-{age}". Doubles + Boys 12U
 * can load pages 1–5; other combos use a single file when present.
 */
const mockCache = {};

/** Loads one or more JSON files from jsons/ — production would GET/POST the live API instead. */
async function loadMockCache(listType, gender, age) {
  const key = `${listType}-${gender}-${age}`;
  if (mockCache[key]) return mockCache[key];

  const base = window.hlx?.codeBasePath ?? '';
  let meta = null;
  const players = [];

  const maxPages = listType === 'doubles' && gender === 'M' && age === 'Y12' ? 5 : 1;

  for (let p = 1; p <= maxPages; p += 1) {
    const filename = `${key}-page-${p}.json`;

    // eslint-disable-next-line no-await-in-loop
    const res = await fetch(`${base}/blocks/player-rankings/jsons/${filename}`);
    if (!res.ok) break;

    // eslint-disable-next-line no-await-in-loop
    const json = await res.json();
    if (!meta) {
      const { data: _, ...rest } = json;
      meta = rest;
    }
    players.push(...(json.data || []));
  }

  mockCache[key] = { meta, players };
  return mockCache[key];
}

/**
 * Mocks: merge cached rows + client filters. Production: return response.json() from
 * fetch(services.usta.com/.../rankings/search/public) with the same `payload` body.
 */
async function fetchRankings(payload) {
  const listType = payload.selection?.juniorListType ?? 'combined';
  const gender = payload.selection?.rankListGender ?? 'F';
  const age = payload.selection?.ageRestriction ?? 'Y12';

  const { meta, players } = await loadMockCache(listType, gender, age);

  let filtered = players;

  const nameQuery = payload.selection?.playerName?.trim().toLowerCase();
  if (nameQuery) {
    filtered = filtered.filter((p) => p.name?.toLowerCase().includes(nameQuery));
  }

  const sectionCode = payload.selection?.['region.sectionCode'];
  if (sectionCode) {
    const sectionLabel = SECTIONS.find((s) => s.value === sectionCode)?.label;
    if (sectionLabel) {
      filtered = filtered.filter((p) => p.section?.name === sectionLabel);
    }
  }

  // If the user picked a day that does not match this mock’s publishDate, return empty.
  const selectedDay = payload.selection?.asOfDate?.publishDate
    ? calendarDayUTC(payload.selection.asOfDate.publishDate)
    : null;
  const listDay = calendarDayUTC(meta?.publishDate);
  if (selectedDay && listDay && selectedDay !== listDay) {
    const pageSize = payload.pagination?.pageSize ?? PAGE_SIZE;
    return {
      ...meta,
      data: [],
      pagination: {
        currentPage: 1,
        pageSize,
        totalResults: 0,
        totalPages: 1,
      },
      _dateMismatch: true,
    };
  }

  const page = payload.pagination?.currentPage ?? 1;
  const pageSize = payload.pagination?.pageSize ?? PAGE_SIZE;
  const start = (page - 1) * pageSize;
  const pageData = filtered.slice(start, start + pageSize);

  // Totals come only from loaded + filtered rows (name/section/publish-day filters).
  const totalResults = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));

  return {
    ...meta,
    data: pageData,
    pagination: {
      currentPage: page,
      pageSize,
      totalResults,
      totalPages,
    },
    _dateMismatch: false,
  };
}

/* ─── DOM helpers ───────────────────────────────────────────────────────────── */

function el(tag, attrs = {}, ...children) {
  const elem = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') elem.className = v;
    else if (k === 'text') elem.textContent = v;
    else elem.setAttribute(k, v);
  });
  children.forEach((c) => {
    if (!c) return;
    elem.append(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return elem;
}

function buildSelect(id, options, selectedValue, labelText, labelClass) {
  const wrapper = el('div', { class: 'pr-filter-group' });
  const label = el('label', { for: id, class: labelClass || 'pr-filter-label', text: labelText });
  const select = el('select', { id, class: 'pr-filter-select' });

  options.forEach(({ label: optLabel, value }) => {
    const opt = el('option', { value }, optLabel);
    if (value === selectedValue) opt.selected = true;
    select.append(opt);
  });

  wrapper.append(label, select);
  return wrapper;
}

/* ─── Block sections ─────────────────────────────────────────────────────────── */

/**
 * Category labels (Junior / Adult / NTRP / Family / Wheelchair) — static;
 * this block only implements Junior content.
 */
function buildCategoryTabs() {
  const nav = el('nav', { class: 'pr-cat-tabs', 'aria-label': 'Tournament ranking category' });
  const list = el('ul', { class: 'pr-cat-tabs__list' });

  const items = [
    { label: 'JUNIOR', isActive: true },
    { label: 'ADULT' },
    { label: 'NTRP' },
    { label: 'FAMILY' },
    { label: 'WHEELCHAIR' },
  ];

  items.forEach((item) => {
    const li = el('li', { class: 'pr-cat-tabs__item' });
    const attrs = item.isActive
      ? { class: 'pr-cat-tab pr-cat-tab--active', 'aria-current': 'true' }
      : { class: 'pr-cat-tab' };
    li.append(el('span', attrs, item.label));
    list.append(li);
  });

  nav.append(list);
  return nav;
}

function buildHeader(state) {
  const header = el('div', { class: 'pr-header' });

  const title = el('h2', { class: 'pr-title', text: 'JUNIOR TOURNAMENTS RANKINGS' });
  const subtitle = el('p', { class: 'pr-subtitle', text: 'The National Standing Lists are published on Wednesdays.' });

  const links = el('div', { class: 'pr-header-links' });
  const headerLinks = [
    { text: 'RANKING POINT TABLES', href: 'https://www.usta.com/content/dam/usta/2026-pdfs/jr-points-table-2026.pdf' },
    { text: 'BONUS POINTS TABLE', href: 'https://www.usta.com/content/dam/usta/2026-pdfs/jr-rankings-bonus-point-info-2026.pdf' },
    { text: 'FAQ', href: 'https://customercare.usta.com/hc/en-us/articles/360051797471-Junior-National-Standings-List-FAQs' },
    { text: 'REPORT RANK ISSUE', href: 'https://customercare.usta.com/hc/en-us/requests/new?ticket_form_id=34148968381204' },
  ];
  headerLinks.forEach(({ text, href }) => {
    const linkAttrs = {
      href,
      class: 'pr-header-link',
      target: '_blank',
      rel: 'noopener',
    };
    links.append(el('a', linkAttrs, text));
  });

  // Top-row filters live inside the blue header
  const headerFilters = el('div', { class: 'pr-header-filters' });
  headerFilters.append(
    buildSelect('pr-list-type', LIST_TYPES, state.listType, 'RANKING LIST', 'pr-filter-label pr-filter-label--light'),
    buildSelect('pr-gender', GENDERS, state.gender, 'GENDER', 'pr-filter-label pr-filter-label--light'),
    buildSelect('pr-age', AGE_GROUPS, state.ageGroup, 'AGE', 'pr-filter-label pr-filter-label--light'),
  );

  header.append(title, subtitle, links, headerFilters);
  return header;
}

function buildSidebar(state) {
  const sidebar = el('aside', { class: 'pr-sidebar' });

  // Search
  const searchSection = el('div', { class: 'pr-sidebar-section' });
  const searchLabel = el('p', { class: 'pr-sidebar-heading', text: 'SEARCH LIST' });
  const searchWrap = el('div', { class: 'pr-search-wrap' });
  const searchIcon = el('span', { class: 'pr-search-icon', 'aria-hidden': 'true' });
  searchIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  const searchInput = el('input', {
    type: 'search',
    id: 'pr-search',
    class: 'pr-filter-input pr-filter-input--search',
    placeholder: 'Search by player',
  });
  searchWrap.append(searchIcon, searchInput);
  searchSection.append(searchLabel, searchWrap);

  // Filter by
  const filterSection = el('div', { class: 'pr-sidebar-section' });
  const filterHeading = el('p', { class: 'pr-sidebar-heading pr-sidebar-heading--filter', text: 'FILTER BY:' });

  // Publish date — native datepicker; filters by list publish date in production
  const dateGroup = el('div', { class: 'pr-filter-group' });
  const dateLabelRow = el('div', { class: 'pr-label-row' });
  const dateLabel = el('label', { for: 'pr-publish-date', class: 'pr-filter-label', text: 'PUBLISH DATE' });
  const dateInfo = el('button', {
    type: 'button',
    class: 'pr-info-btn',
    'aria-label': 'About publish dates',
    title: 'The National Standing Lists are published on Wednesdays.',
  });
  dateInfo.textContent = 'i';
  dateLabelRow.append(dateLabel, dateInfo);
  const dateInput = el('input', {
    type: 'date',
    id: 'pr-publish-date',
    class: 'pr-date-input',
    'aria-describedby': 'pr-publish-date-hint',
  });
  if (state.publishDate) dateInput.value = state.publishDate;
  const dateHint = el('span', {
    id: 'pr-publish-date-hint',
    class: 'pr-sr-only',
    text: 'Select a publish date. The National Standing Lists are published on Wednesdays.',
  });
  dateGroup.append(dateLabelRow, dateInput, dateHint);

  // Section
  const sectionSelect = buildSelect('pr-section', SECTIONS, state.section, 'SECTION');

  filterSection.append(filterHeading, dateGroup, sectionSelect);

  // Reset button
  const resetBtn = el('button', { class: 'pr-btn-reset', type: 'button', text: 'RESET ALL' });

  sidebar.append(searchSection, filterSection, resetBtn);

  return { sidebar, searchInput, dateInput, resetBtn };
}

function buildTableSkeleton() {
  const wrap = el('div', { class: 'pr-table-wrap' });
  const table = el('table', { class: 'pr-table' });

  const thead = el('thead');
  const hr = el('tr');
  [
    { text: 'NATIONAL\nRANK', cls: 'pr-th--rank' },
    { text: 'SECTION\nRANK', cls: 'pr-th--rank' },
    { text: 'DISTRICT\nRANK', cls: 'pr-th--rank' },
    { text: 'NAME', cls: 'pr-th--name' },
    { text: 'TOTAL\nPOINTS', cls: 'pr-th--points' },
    { text: 'SINGLES\nPOINTS', cls: 'pr-th--points' },
    { text: 'DOUBLES\nPOINTS', cls: 'pr-th--points' },
    { text: 'BONUS\nPOINTS', cls: 'pr-th--points' },
    { text: 'CITY', cls: 'pr-th--loc' },
    { text: 'STATE', cls: 'pr-th--loc-narrow' },
    { text: 'SECTION', cls: 'pr-th--loc' },
    { text: 'DISTRICT', cls: 'pr-th--loc' },
  ].forEach(({ text, cls }) => {
    const th = el('th', { class: `pr-th ${cls}`.trim(), scope: 'col' });
    // Allow line breaks in header text
    text.split('\n').forEach((line, i) => {
      if (i > 0) th.append(document.createElement('br'));
      th.append(document.createTextNode(line));
    });
    hr.append(th);
  });
  thead.append(hr);

  table.append(thead, el('tbody', { class: 'pr-tbody' }));
  wrap.append(table);
  return wrap;
}

function renderTableBody(tbody, players, options = {}) {
  const emptyMessage = options.emptyMessage ?? 'No rankings found for the selected filters.';

  tbody.innerHTML = '';
  if (!players || players.length === 0) {
    const tr = el('tr');
    tr.append(el('td', { colspan: String(PR_TABLE_COL_COUNT), class: 'pr-no-results', text: emptyMessage }));
    tbody.append(tr);
    return;
  }

  players.forEach((player) => {
    const tr = el('tr', { class: 'pr-row' });
    const profileHref = `${PLAYER_PROFILE_URL}#uaid=${player.uaid}`;
    const nameLink = el('a', { href: profileHref, class: 'pr-player-link' }, player.name || '—');
    const pr = player.pointsRecord || {};

    tr.append(
      el('td', { class: 'pr-td pr-td--rank', text: String(player.rank?.national ?? '—') }),
      el('td', { class: 'pr-td pr-td--rank', text: String(player.rank?.section ?? '—') }),
      el('td', { class: 'pr-td pr-td--rank', text: String(player.rank?.district ?? '—') }),
      el('td', { class: 'pr-td pr-td--name' }, nameLink),
      el('td', { class: 'pr-td pr-td--points', text: fmtPoints(player.points) }),
      el('td', { class: 'pr-td pr-td--points', text: fmtPoints(pr.singlesPoints) }),
      el('td', { class: 'pr-td pr-td--points', text: fmtPoints(pr.doublesPoints) }),
      el('td', { class: 'pr-td pr-td--points', text: fmtPoints(pr.bonusPoints) }),
      el('td', { class: 'pr-td pr-td--loc', text: player.city || '—' }),
      el('td', { class: 'pr-td pr-td--state', text: player.state || '—' }),
      el('td', { class: 'pr-td pr-td--loc', text: player.section?.name || '—' }),
      el('td', { class: 'pr-td pr-td--loc', text: player.district?.name || '—' }),
    );

    tbody.append(tr);
  });
}

function buildPagination() {
  return el('div', { class: 'pr-pagination' });
}

function renderPagination(paginationEl, state, totalResults, totalPages, onPage) {
  paginationEl.innerHTML = '';
  if (!totalResults || totalPages <= 1) return;

  const { currentPage } = state;

  const prev = el('button', {
    class: `pr-page-btn${currentPage <= 1 ? ' pr-page-btn--disabled' : ''}`,
    'aria-label': 'Previous page',
    text: '‹',
  });
  if (currentPage > 1) prev.addEventListener('click', () => onPage(currentPage - 1));
  else prev.disabled = true;
  paginationEl.append(prev);

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  if (start > 1) {
    const firstBtn = el('button', { class: 'pr-page-btn', text: '1', 'data-page': '1' });
    firstBtn.addEventListener('click', () => onPage(1));
    paginationEl.append(firstBtn);
    if (start > 2) paginationEl.append(el('span', { class: 'pr-page-ellipsis', text: '…' }));
  }

  for (let p = start; p <= end; p += 1) {
    const btnAttrs = {
      class: `pr-page-btn${p === currentPage ? ' pr-page-btn--active' : ''}`,
      text: String(p),
      'data-page': String(p),
      'aria-label': `Page ${p}`,
    };
    if (p === currentPage) btnAttrs['aria-current'] = 'page';
    const btn = el('button', btnAttrs);
    if (p !== currentPage) btn.addEventListener('click', () => onPage(p));
    paginationEl.append(btn);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) paginationEl.append(el('span', { class: 'pr-page-ellipsis', text: '…' }));
    const lastBtn = el('button', { class: 'pr-page-btn', text: String(totalPages), 'data-page': String(totalPages) });
    lastBtn.addEventListener('click', () => onPage(totalPages));
    paginationEl.append(lastBtn);
  }

  const next = el('button', {
    class: `pr-page-btn${currentPage >= totalPages ? ' pr-page-btn--disabled' : ''}`,
    'aria-label': 'Next page',
    text: '›',
  });
  if (currentPage < totalPages) next.addEventListener('click', () => onPage(currentPage + 1));
  else next.disabled = true;
  paginationEl.append(next);

  // "X of Y pages" info
  const info = el('span', { class: 'pr-pagination-info', text: `${currentPage} of ${totalPages} pages` });
  paginationEl.append(info);
}

function buildStatusBar() {
  return el('div', { class: 'pr-status' });
}

function renderStatus(statusEl, state, total, options = {}) {
  if (state.loading) {
    statusEl.innerHTML = '<span class="pr-spinner" aria-label="Loading…"></span>';
    return;
  }
  if (state.error) {
    statusEl.textContent = `Error: ${state.error}`;
    statusEl.className = 'pr-status pr-status--error';
    return;
  }
  if (options.dateMismatch) {
    statusEl.className = 'pr-status pr-status--hint';
    statusEl.textContent = 'No standings for the selected publish date. The offline mock only includes the snapshot date for each list.';
    return;
  }
  statusEl.className = 'pr-status';
  statusEl.textContent = '';
}

/* ─── Block entry point ──────────────────────────────────────────────────────── */

export default async function decorate(block) {
  // Parse authored defaults from document table rows
  const rows = [...block.querySelectorAll(':scope > div')];
  const authored = {};
  rows.forEach((row) => {
    const [key, val] = [...row.children].map((c) => c.textContent.trim().toLowerCase());
    if (key === 'ranking type' || key === 'rankingtype') authored.listType = val;
    else if (key === 'gender') authored.gender = val.toUpperCase();
    else if (key === 'age' || key === 'age group') authored.ageGroup = val.toUpperCase();
  });

  const state = createState(authored);
  const hashIn = getPlayerRankingsStateFromHash();
  if (hashIn.ignore) {
    // #tab=adult|… — leave defaults; hash not applied.
  } else if (hashIn.filterState) {
    Object.assign(state, hashIn.filterState);
  }
  if (!hashIn.ignore) {
    ensureTabJuniorInUrlWhenHashEmpty();
  }

  // Build DOM
  block.innerHTML = '';
  block.setAttribute('role', 'region');
  block.setAttribute('aria-label', 'Junior Tournament Rankings');

  const categoryNav = buildCategoryTabs();
  const header = buildHeader(state);
  const { sidebar, searchInput, dateInput, resetBtn } = buildSidebar(state);
  const statusEl = buildStatusBar();
  const tableWrap = buildTableSkeleton();
  const tbody = tableWrap.querySelector('.pr-tbody');
  const pagination = buildPagination();

  // Body = sidebar + content
  const body = el('div', { class: 'pr-body' });
  const content = el('div', { class: 'pr-content' });
  content.append(statusEl, tableWrap, pagination);
  body.append(sidebar, content);

  block.append(categoryNav, header, body);

  let debounceTimer;
  /** Triggers re-syncing the datepicker from the loaded list when ranking/gender/age change. */
  let lastListKey = hashIn.hadPublishInHash
    ? `${state.listType}-${state.gender}-${state.ageGroup}`
    : null;

  // ── Load function ─────────────────────────────────────────────────────────────
  async function load() {
    if (state.loading) return;
    state.loading = true;
    state.error = null;
    renderStatus(statusEl, state, 0, {});
    tableWrap.classList.add('pr-table-wrap--loading');

    try {
      const payload = buildPayload(state);
      const response = await fetchRankings(payload);

      state.data = response;
      state.loading = false;

      // When Ranking List / Gender / Age changes, reset the datepicker to this list’s publish date.
      const listKey = `${state.listType}-${state.gender}-${state.ageGroup}`;
      if (listKey !== lastListKey && response.publishDate) {
        lastListKey = listKey;
        const day = calendarDayUTC(response.publishDate);
        if (day) {
          dateInput.value = day;
          state.publishDate = day;
        }
      }

      const dateMismatch = Boolean(response._dateMismatch);
      const players = response.data || [];
      const total = response.pagination?.totalResults ?? players.length;
      const pages = response.pagination?.totalPages ?? Math.ceil(total / PAGE_SIZE);

      renderTableBody(tbody, players, { emptyMessage: dateMismatch ? 'No results for the selected publish date.' : null });
      renderStatus(statusEl, state, total, { dateMismatch });
      renderPagination(pagination, state, total, pages, (page) => {
        state.currentPage = page;
        load();
      });
    } catch (err) {
      state.loading = false;
      state.error = err.message || 'Unknown error';
      renderStatus(statusEl, state, 0, {});
      tbody.innerHTML = `<tr><td colspan="${PR_TABLE_COL_COUNT}" class="pr-no-results">Unable to load rankings. Please try again.</td></tr>`;
      pagination.innerHTML = '';
    } finally {
      replaceHashFromPlayerRankingsState(state);
      tableWrap.classList.remove('pr-table-wrap--loading');
    }
  }

  // ── Wire up filters ──────────────────────────────────────────────────────────
  function goToPageOneAndLoad() {
    state.currentPage = 1;
    load();
  }

  header.querySelector('#pr-list-type').addEventListener('change', (e) => {
    state.listType = e.target.value;
    goToPageOneAndLoad();
  });

  header.querySelector('#pr-gender').addEventListener('change', (e) => {
    state.gender = e.target.value;
    goToPageOneAndLoad();
  });

  header.querySelector('#pr-age').addEventListener('change', (e) => {
    state.ageGroup = e.target.value;
    goToPageOneAndLoad();
  });

  sidebar.querySelector('#pr-section').addEventListener('change', (e) => {
    state.section = e.target.value;
    state.currentPage = 1;
    load();
  });

  dateInput.addEventListener('change', () => {
    state.publishDate = dateInput.value;
    state.currentPage = 1;
    load();
  });

  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.searchName = searchInput.value;
      state.currentPage = 1;
      load();
    }, 400);
  });

  const applyControlsFromState = () => {
    header.querySelector('#pr-list-type').value = state.listType;
    header.querySelector('#pr-gender').value = state.gender;
    header.querySelector('#pr-age').value = state.ageGroup;
    sidebar.querySelector('#pr-section').value = state.section || '';
    searchInput.value = state.searchName || '';
    if (state.publishDate) {
      dateInput.value = state.publishDate;
    }
  };

  window.addEventListener('hashchange', () => {
    const inHash = getPlayerRankingsStateFromHash();
    if (inHash.ignore) return;
    if (!inHash.filterState) {
      if (!location.hash || location.hash === '' || location.hash === '#') {
        lastListKey = null;
      }
      return;
    }
    Object.assign(state, inHash.filterState);
    if (inHash.hadPublishInHash) {
      lastListKey = `${state.listType}-${state.gender}-${state.ageGroup}`;
    } else {
      lastListKey = null;
    }
    applyControlsFromState();
    load();
  });

  resetBtn.addEventListener('click', () => {
    Object.assign(state, {
      listType: 'combined',
      gender: 'F',
      ageGroup: 'Y12',
      section: '',
      searchName: '',
      publishDate: '2026-04-22',
      currentPage: 1,
    });
    lastListKey = null;
    applyControlsFromState();
    load();
  });

  // Initial load
  await load();
}
