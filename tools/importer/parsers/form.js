/* eslint-disable */
/* global WebImporter */

/**
 * Parser for form.
 * Base: form. Source: https://www.usta.com/en/home/play.html
 * Selectors from captured DOM: .v-lead-generation-wrapper
 * DA block: row 1 = "form"; row 2 = one cell — :heart: line, heading, subtitle (stacked).
 */
export default function parse(element, { document }) {
  const heading = element.querySelector('.v-lead-generation-form__title, h4');
  const subtitle = element.querySelector('.v-lead-generation-form__cta-text p, .v-lead-generation-form__cta-text');

  const contentCell = [];

  const heartLine = document.createElement('p');
  heartLine.textContent = ':heart:';
  contentCell.push(heartLine);

  if (heading) contentCell.push(heading);
  if (subtitle) {
    if (subtitle.tagName === 'P') {
      contentCell.push(subtitle.cloneNode(true));
    } else {
      const subP = document.createElement('p');
      subP.textContent = subtitle.textContent.trim();
      contentCell.push(subP);
    }
  }

  const cells = [contentCell];
  const block = WebImporter.Blocks.createBlock(document, { name: 'form', cells });
  element.replaceWith(block);
}
