import { readBlockConfig, toClassName } from '../../scripts/aem.js';

/**
 * Labels for known multiselect values (sync with component-models / ue filter-bubble options).
 */
const FILTER_OPTION_LABELS = {
  tournaments: 'Tournaments',
  programs: 'Programs',
  coaches: 'Coaches',
};

/**
 * @param {string|string[]|undefined} raw
 * @returns {string[]}
 */
function normalizeFilters(raw) {
  if (raw == null || raw === '') return [];
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(Boolean);
  }
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Reads a value cell as UE often renders multiselects: multiple &lt;p&gt; or &lt;div&gt;,
 * or one line with commas (readBlockConfig does not always capture this).
 * @param {Element|null} col
 * @returns {string[]}
 */
function parseValueColumn(col) {
  if (!col) return [];
  const ps = [...col.querySelectorAll(':scope > p')];
  if (ps.length > 1) {
    return ps.map((p) => p.textContent.trim()).filter(Boolean);
  }
  if (ps.length === 1) {
    const t = ps[0].textContent.trim();
    if (!t) return [];
    if (t.includes(',')) return t.split(',').map((s) => s.trim()).filter(Boolean);
    return [t];
  }
  const divs = [...col.querySelectorAll(':scope > div')];
  if (divs.length >= 1) {
    return divs.map((d) => d.textContent.trim()).filter(Boolean);
  }
  const t = col.textContent.trim();
  if (!t) return [];
  if (t.includes(',')) return t.split(',').map((s) => s.trim()).filter(Boolean);
  if (/\n/.test(t)) return t.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  return [t];
}

/**
 * @param {Element} block
 * @param {string} keySlug toClassName of label, e.g. "filters", "category"
 * @returns {Element|null} value column
 */
function findRowValueColumn(block, keySlug) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const row = rows.find((r) => {
    const cols = [...r.children].filter((c) => c.tagName === 'DIV');
    if (cols.length < 2) return false;
    return toClassName(cols[0].textContent) === keySlug;
  });
  if (!row) return null;
  const cols = [...row.children].filter((c) => c.tagName === 'DIV');
  return cols[1] || null;
}

/**
 * Fallback when rows are not key/value: one column of &lt;p&gt; chips, or &lt;ul&gt;&lt;li&gt;.
 * @param {Element} block
 * @returns {string[]}
 */
function parseLooseBubbleSources(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const single = rows.find((row) => {
    const cols = [...row.children].filter((c) => c.tagName === 'DIV');
    if (cols.length !== 1) return false;
    return parseValueColumn(cols[0]).length > 0;
  });
  if (single) {
    const [cell] = [...single.children].filter((c) => c.tagName === 'DIV');
    return parseValueColumn(cell);
  }
  const lis = [...block.querySelectorAll(':scope ul > li')];
  if (lis.length) return lis.map((li) => li.textContent.trim()).filter(Boolean);
  return [];
}

/**
 * @param {Element} block
 * @returns {{ values: string[], category: string }}
 */
function extractFiltersAndCategory(block) {
  const config = readBlockConfig(block);
  let values = normalizeFilters(config.filters);
  let categoryText = '';
  if (typeof config.category === 'string') {
    categoryText = config.category.trim();
  }

  const filtersCol = findRowValueColumn(block, 'filters');
  if (filtersCol) {
    const parsed = parseValueColumn(filtersCol);
    if (parsed.length) values = parsed;
  }

  if (!values.length) {
    values = parseLooseBubbleSources(block);
  }

  if (!categoryText) {
    const catCol = findRowValueColumn(block, 'category');
    if (catCol) categoryText = catCol.textContent.trim();
  }

  return { values, category: categoryText };
}

function chipLabel(value) {
  const slug = toClassName(value);
  if (slug && FILTER_OPTION_LABELS[slug]) return FILTER_OPTION_LABELS[slug];
  return value;
}

export default function decorate(block) {
  const { values, category: categoryText } = extractFiltersAndCategory(block);

  block.textContent = '';
  block.innerHTML = '';

  if (values.length) {
    block.dataset.filters = JSON.stringify(values);
  } else {
    delete block.dataset.filters;
    block.classList.add('filter-bubble-empty');
  }

  if (categoryText) {
    block.dataset.category = categoryText;
  } else {
    delete block.dataset.category;
  }

  values.forEach((value) => {
    const slug = toClassName(value);
    if (slug) block.classList.add(`filter-bubble--${slug}`);
  });

  const inner = document.createElement('div');
  inner.className = 'filter-bubble-inner';

  const aside = document.createElement('div');
  aside.className = 'filter-bubble-aside';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'filter-bubble-eyebrow';
  eyebrow.textContent = 'Filter by';

  const title = document.createElement('p');
  title.className = 'filter-bubble-title';
  title.textContent = categoryText;

  aside.append(eyebrow, title);

  const list = document.createElement('div');
  list.className = 'filter-bubble-list';
  list.setAttribute('role', 'list');
  list.setAttribute('aria-label', 'Selected filters');

  values.forEach((value) => {
    const chip = document.createElement('span');
    chip.className = 'filter-bubble-chip';
    chip.setAttribute('role', 'listitem');
    chip.dataset.filter = value;
    chip.textContent = chipLabel(value);
    list.append(chip);
  });

  inner.append(aside, list);
  block.append(inner);
}
