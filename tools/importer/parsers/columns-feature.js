/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-feature.
 * Base: columns. Source: https://www.usta.com/en/home/play.html
 * Selectors from captured DOM: #container-36d8db448f, #container-cf58c1a9d4, #container-f498b06250
 * Columns table: 2 columns per row. Col 1 = image, Col 2 = heading + paragraph + CTA
 * Used for: Tennis for All, Youth Tennis, College Tennis, Adult Tennis sections
 */
export default function parse(element, { document }) {
  // From captured DOM: two side-by-side containers within .aem-Grid
  // One contains an image (background), the other contains text + CTA

  // Extract main image (from captured DOM: img in container with background image)
  const image = element.querySelector('.cmp-container > img, :scope > div > div > .cmp-container > img');

  // Extract heading (from captured DOM: .cmp-text h2)
  const heading = element.querySelector('.cmp-text h2, h2');

  // Extract description paragraph (from captured DOM: .cmp-text p, skip empty &nbsp; paragraphs)
  const paragraphs = element.querySelectorAll('.cmp-text p');
  let description = null;
  paragraphs.forEach((p) => {
    const text = p.textContent.trim();
    if (text && text !== '\u00a0' && !description) {
      description = p;
    }
  });

  // Extract CTA link (from captured DOM: a.cmp-button)
  const cta = element.querySelector('a.cmp-button, .button a');

  // Build columns row: [image column, text column]
  const imageCell = [];
  if (image) imageCell.push(image);

  const textCell = [];
  if (heading) textCell.push(heading);
  if (description) textCell.push(description);
  if (cta) textCell.push(cta);

  const cells = [];
  cells.push([imageCell, textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
