/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-landing.
 * Base: hero. Source: https://www.usta.com/en/home/play.html
 * Selectors from captured DOM: #container-1b53a43ea8
 * Hero table: 1 column, row 1 = block name, row 2 = background image, row 3 = heading + text
 */
export default function parse(element, { document }) {
  // Extract background image (from captured DOM: img direct child of container)
  const bgImage = element.querySelector(':scope > img, :scope > div > img');

  // Extract heading (from captured DOM: .cmp-text h1)
  const heading = element.querySelector('h1');

  // Extract subtitle (from captured DOM: .cmp-text p b "GET OUT AND PLAY.")
  const subtitle = element.querySelector('.cmp-text p');

  const cells = [];

  // Row 1: background image
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 2: heading + subtitle content
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subtitle) contentCell.push(subtitle);
  cells.push(contentCell);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-landing', cells });
  element.replaceWith(block);
}
