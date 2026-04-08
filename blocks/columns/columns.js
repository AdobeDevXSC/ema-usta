export default function decorate(block) {
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
}
