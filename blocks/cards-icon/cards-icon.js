import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      const hasPicture = div.querySelector('picture');
      const hasImg = div.children.length === 1 && div.querySelector('img');
      if (hasPicture || hasImg) {
        div.className = 'cards-icon-card-image';
      } else {
        div.className = 'cards-icon-card-body';
      }
    });
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  // Handle broken images – show a placeholder circle with first letter of alt text
  ul.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => {
      const placeholder = document.createElement('div');
      placeholder.className = 'cards-icon-placeholder';
      placeholder.textContent = img.alt?.charAt(0) || '?';
      placeholder.title = img.alt || '';
      img.replaceWith(placeholder);
    });
  });

  block.textContent = '';
  block.append(ul);
}
