/* eslint-disable */
/* global WebImporter */

// TRANSFORMER IMPORTS
import ustaCleanupTransformer from './transformers/usta-cleanup.js';

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'article-page',
  description: 'USTA article page with title, author, date, hero image, and body text',
  urls: ['https://www.usta.com/en/home/stay-current/national/USTA-awards-wheelchair-tennis-grants.html'],
  blocks: [],
  sections: [
    {
      id: 'section-1',
      name: 'Article Content',
      selector: '#mainContent',
      style: null,
      blocks: [],
      defaultContent: ['.cmp-title', '.cmp-image', '.cmp-text'],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  ustaCleanupTransformer,
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Extract article content before cleanup removes surrounding chrome
    const mainContent = main.querySelector('#mainContent');

    // 3. Execute afterTransform transformers (remove header/footer/etc.)
    executeTransformers('afterTransform', main, payload);

    // 4. Article-specific cleanup
    if (mainContent) {
      // Remove social media sharing icons
      mainContent.querySelectorAll('.v-social-media-sharing, .socialmediasharing').forEach((el) => el.remove());

      // Remove interactive components not suitable for static import
      mainContent.querySelectorAll('.core-tabs, .relatedopportunities, .textandlinkwithimage').forEach((el) => el.remove());

      // Remove ad experience fragments and ad components
      mainContent.querySelectorAll('[class*="ros-ad"], .adImageComp, .ad, [id*="gpt-ad"], [id*="skipAd"]').forEach((el) => el.remove());
      mainContent.querySelectorAll('a.skipAd, a[href*="skipAd"]').forEach((el) => {
        const parent = el.closest('p') || el;
        parent.remove();
      });

      // Remove "Advertisement" headings
      mainContent.querySelectorAll('h4').forEach((el) => {
        if (el.textContent.trim() === 'Advertisement') el.remove();
      });

      // Remove related articles section (list component + heading)
      mainContent.querySelectorAll('.list, .relatedarticles, .v-related-articles').forEach((el) => el.remove());
      // Remove "Related Articles" heading text node
      mainContent.querySelectorAll('h3').forEach((h) => {
        if (h.textContent.trim() === 'Related Articles') {
          const parentText = h.closest('.cmp-text') || h.closest('.text');
          if (parentText) {
            parentText.remove();
          } else {
            h.remove();
          }
        }
      });

      // Remove empty spacer divs
      mainContent.querySelectorAll('.phe-block').forEach((el) => el.remove());

      // Remove empty separators
      mainContent.querySelectorAll('.cmp-separator').forEach((el) => el.remove());
      mainContent.querySelectorAll('.separator').forEach((el) => el.remove());

      // Remove empty containers
      mainContent.querySelectorAll('.iframealignment').forEach((el) => el.remove());

      // Extract the article title
      const titleEl = mainContent.querySelector('.cmp-title');
      if (titleEl) {
        const eyebrow = titleEl.querySelector('.cmp-articlesection span');
        const h1 = titleEl.querySelector('h1');
        const authorDate = titleEl.querySelector('.cmp-title__authorDate');

        // Build clean title section
        const titleContainer = document.createElement('div');

        if (eyebrow) {
          const p = document.createElement('p');
          p.innerHTML = `<em>${eyebrow.textContent.trim()}</em>`;
          titleContainer.appendChild(p);
        }

        if (h1) {
          const heading = document.createElement('h1');
          heading.textContent = h1.textContent.trim().replace(/\s+/g, ' ');
          titleContainer.appendChild(heading);
        }

        if (authorDate) {
          const p = document.createElement('p');
          p.innerHTML = `<em>${authorDate.textContent.trim().replace(/\s+/g, ' ')}</em>`;
          titleContainer.appendChild(p);
        }

        titleEl.replaceWith(titleContainer);
      }

      // Clean up article body text
      const textEl = mainContent.querySelector('.cmp-text');
      if (textEl) {
        // Remove empty paragraphs with just &nbsp;
        textEl.querySelectorAll('p').forEach((p) => {
          if (p.textContent.trim() === '' || p.textContent.trim() === ' ') {
            p.remove();
          }
        });

        // Remove empty headings
        textEl.querySelectorAll('h3').forEach((h) => {
          if (h.textContent.trim() === '' || h.textContent.trim() === ' ') {
            h.remove();
          }
        });
      }

      // Remove phe--display-none class (it hides elements via CSS)
      mainContent.querySelectorAll('.phe--display-none').forEach((el) => {
        el.classList.remove('phe--display-none');
      });

      // Remove trailing empty paragraphs with zero-width spaces
      const allParagraphs = mainContent.querySelectorAll('p');
      allParagraphs.forEach((p) => {
        const text = p.textContent.trim();
        if (text === '' || text === '​' || text === ' ') {
          p.remove();
        }
      });

      // Remove empty containers left after cleanup
      mainContent.querySelectorAll('.conditional-container, .cmp-container').forEach((el) => {
        if (el.textContent.trim() === '') el.remove();
      });

      // Clean: only keep mainContent children
      while (main.firstChild) {
        main.removeChild(main.firstChild);
      }
      while (mainContent.firstChild) {
        main.appendChild(mainContent.firstChild);
      }
    }

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: [],
      },
    }];
  },
};
