/**
 * Stats row: first table row is one cell per stat column.
 * Each cell typically holds a heading (figure) plus supporting copy (label).
 */
export default function decorate(block) {
  const firstRow = block.querySelector(':scope > div');
  if (!firstRow) return;

  const cols = [...firstRow.children];
  if (cols.length === 0) return;

  block.style.setProperty('--columns-stats-cols', String(cols.length));
  block.classList.add(`columns-stats-${cols.length}-cols`);

  cols.forEach((col) => {
    col.classList.add('columns-stats-item');
  });
}
