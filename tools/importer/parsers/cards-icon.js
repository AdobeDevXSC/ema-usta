/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-icon.
 * Base: cards. Source: https://www.usta.com/en/home/play.html
 * Selectors from captured DOM: #aa-default-national_play_get_in_the_game
 * Cards table: 2 columns per row. Col 1 = image/icon, Col 2 = heading + description + CTA
 * 4 card items: Find a Court, Find a Coach, Leagues, Membership
 */
export default function parse(element, { document }) {
  // Each card is in a container with grid column class aem-GridColumn--default--3
  // From captured DOM: each card container has .cmp-image img, .cmp-text h5/p, .cmp-button a
  const cardContainers = element.querySelectorAll(':scope > div > .container.responsivegrid.full-width');

  const cells = [];

  cardContainers.forEach((card) => {
    // Extract icon image (from captured DOM: .cmp-image__image)
    const icon = card.querySelector('.cmp-image__image, .cmp-image img');

    // Extract heading (from captured DOM: .cmp-text h5)
    const heading = card.querySelector('h5, h4, h3');

    // Extract description (from captured DOM: .cmp-text p)
    const description = card.querySelector('.cmp-text p');

    // Extract CTA button/link (from captured DOM: a.cmp-button)
    const cta = card.querySelector('a.cmp-button, .button a');

    // Build card row: [image, content]
    const imageCell = [];
    if (icon) imageCell.push(icon);

    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    if (cta) contentCell.push(cta);

    if (imageCell.length > 0 || contentCell.length > 0) {
      cells.push([imageCell, contentCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon', cells });
  element.replaceWith(block);
}
