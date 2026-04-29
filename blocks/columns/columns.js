import { toClassName } from '../../scripts/aem.js';

/**
 * Franklin table rows: col0 "style", col1 comma-separated tokens → classes on block.
 * @param {Element} block
 */
function applyStyleConfigRows(block) {
  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    const cols = [...row.children];
    if (cols.length !== 2) return;
    const key = toClassName(cols[0].textContent);
    if (key !== 'style') return;
    const raw = cols[1].textContent.trim();
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => toClassName(s))
      .filter(Boolean)
      .forEach((cls) => block.classList.add(cls));
    row.remove();
  });
}

export default function decorate(block) {
  applyStyleConfigRows(block);

  const rows = [...block.children];

  // Check last row for a background color value (e.g. "#ffcb05" or "gold")
  const lastRow = rows[rows.length - 1];
  const lastRowText = lastRow?.textContent?.trim();
  const colorValue = lastRowText?.replace(/;$/, '');
  if (colorValue && (colorValue.startsWith('#') || colorValue.startsWith('rgb'))) {
    block.style.backgroundColor = colorValue;
    lastRow.remove();
  }

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  if (block.classList.contains('gallery') && block.classList.contains('2-left-1-right')) {
    const row = block.querySelector(':scope > div');
    if (row) {
      [...row.children].forEach((col) => {
        const pics = col.querySelectorAll(':scope picture');
        if (pics.length >= 3) {
          col.classList.add('columns-gallery-col', 'columns-gallery--2-left-1-right');
        }
      });
    }
  }
}
