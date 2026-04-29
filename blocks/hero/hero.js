/**
 * Foundation site: normalize hero markup so media fills the viewport band and
 * copy (headline, body, CTAs) stacks in a left-aligned column over a dark overlay.
 */
export default function decorate(block) {
  if (!document.body.classList.contains('foundation')) return;

  const picture = block.querySelector(':scope picture');
  if (!picture) return;

  const pictureCol = picture.parentElement;
  const pictureRow = pictureCol?.parentElement;
  if (!pictureRow || pictureRow.parentElement !== block) return;

  const img = picture.querySelector('img');
  if (img) {
    img.setAttribute('loading', 'eager');
    img.setAttribute('fetchpriority', 'high');
  }

  const media = document.createElement('div');
  media.className = 'hero-media';
  picture.replaceWith(media);
  media.append(picture);

  const copy = document.createElement('div');
  copy.className = 'hero-copy';

  while (media.nextSibling) {
    copy.append(media.nextSibling);
  }

  let mergeRow = pictureRow.nextElementSibling;
  while (mergeRow) {
    const toStrip = mergeRow;
    mergeRow = mergeRow.nextElementSibling;
    [...toStrip.children].forEach((col) => {
      while (col.firstChild) {
        copy.append(col.firstChild);
      }
    });
    toStrip.remove();
  }

  if (copy.childNodes.length > 0) {
    media.after(copy);
  }

  block.classList.add('hero-decorated');
}
