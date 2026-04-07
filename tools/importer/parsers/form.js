/* eslint-disable */
/* global WebImporter */

/**
 * Parser for form.
 * Base: form. Source: https://www.usta.com/en/home/play.html
 * Selectors from captured DOM: .v-lead-generation-wrapper
 * Form block: 1 column, row 1 = block name, row 2 = form content
 * Lead generation email signup form with heading, subtitle, email/zip fields
 */
export default function parse(element, { document }) {
  // Extract form heading (from captured DOM: .v-lead-generation-form__title)
  const heading = element.querySelector('.v-lead-generation-form__title, h4');

  // Extract subtitle (from captured DOM: .v-lead-generation-form__cta-text p)
  const subtitle = element.querySelector('.v-lead-generation-form__cta-text p, .v-lead-generation-form__cta-text');

  // Build content cell with form description
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subtitle) contentCell.push(subtitle);

  const cells = [];
  if (contentCell.length > 0) {
    cells.push(contentCell);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'form', cells });
  element.replaceWith(block);
}
