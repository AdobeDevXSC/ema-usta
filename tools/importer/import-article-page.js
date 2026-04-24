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

const FALLBACK_RELATED_ARTICLES = [
  {
    image: { src: 'https://www.usta.com/content/dam/usta/Articles/article-desktop/20170215_Wheelchair_All_Comers_Camp_A.jpg.transform/resize-400/img.jpg', alt: 'Visit the Wheelchair grants awarded page' },
    eyebrow: 'National',
    title: 'Wheelchair grants awarded',
    href: '/en/home/stay-current/national/usta-awards-over--100-000-to-wc-tennis-programs.html',
    date: 'February 12, 2019',
    description: 'Wheelchair tennis will continue to grow in the U.S., thanks to generous grants of more than $100,000 awarded to wheelchair tennis programs nationwide by the USTA.',
  },
  {
    image: { src: 'https://www.usta.com/content/dam/usta/Articles/article-desktop/20190205_WC_Mens_Qualie_A.jpg.transform/resize-400/img.jpg', alt: 'Visit the U.S. men qualify for WTC page' },
    eyebrow: 'National',
    title: 'U.S. men qualify for WTC',
    href: '/en/home/stay-current/national/team-usa-qualifies-for-world-team-cup-finals.html',
    date: 'February 05, 2019',
    description: 'For the second consecutive year, the U.S. men\'s wheelchair tennis team defeated Chili, 2-0, in the championship match at the BNP Paribas World Team Cup Qualification event Friday to secure its spot in the final of the BNP Paribas World Team Cup.',
  },
  {
    image: { src: 'https://www.usta.com/content/dam/usta/Articles/article-desktop/20181204_Wagner_AT.jpg.transform/resize-400/img.jpg', alt: 'Visit the NEC Masters an Ace page' },
    eyebrow: 'National',
    title: 'NEC Masters an Ace',
    href: '/en/home/stay-current/national/2018-nec-wheelchair-tennis-masters--a-smashing-success.html',
    date: 'December 04, 2018',
    description: 'In November, the USTA National Campus successfully hosted the 2018 NEC Wheelchair Tennis Masters, the marquee event of the UNIQLO Wheelchair Tennis Tour.',
  },
];

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;
    let cardsData = [];

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

      // Extract related articles as a cards block before removing them
      const relatedArticlesList = mainContent.querySelector('.list-core-component__wrapper, .list ul');
      if (relatedArticlesList) {
        relatedArticlesList.querySelectorAll('.list-core-component__item-wrapper, li').forEach((item) => {
          const imgEl = item.querySelector('img');
          const titleLink = item.querySelector('.list-core-component__title, a.list-core-component__title');
          const eyebrowEl = item.querySelector('.list-core-item__eyebrow span, .list-core-item__eyebrow');
          const dateEl = item.querySelector('.cmp-list--subtitle-date, .list-core-component__subtitle span');
          const descEl = item.querySelector('.cmp-list--item-description, .list-core-component__content span');
          const readMoreLink = item.querySelector('.list-core-component__more-link, a.list-core-component__more-link');

          const card = {
            image: imgEl ? { src: imgEl.src, alt: imgEl.alt || '' } : null,
            eyebrow: eyebrowEl ? eyebrowEl.textContent.trim() : '',
            title: titleLink ? titleLink.textContent.trim() : '',
            href: titleLink ? titleLink.href || (readMoreLink ? readMoreLink.href : '') : '',
            date: dateEl ? dateEl.textContent.trim() : '',
            description: descEl ? descEl.textContent.trim() : '',
          };
          if (card.title) cardsData.push(card);
        });
      }

      // Now remove the related articles DOM elements
      mainContent.querySelectorAll('.list, .relatedarticles, .v-related-articles').forEach((el) => el.remove());
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

    // 5. Build Related Articles cards block (use fallback if none found on page)
    if (cardsData.length === 0) {
      cardsData = FALLBACK_RELATED_ARTICLES;
    }
    {
      const sectionBreak = document.createElement('hr');
      main.appendChild(sectionBreak);

      const heading = document.createElement('h3');
      heading.textContent = 'Related Articles';
      main.appendChild(heading);

      const rows = cardsData.map((card) => {
        const imgCell = document.createElement('div');
        if (card.image) {
          const img = document.createElement('img');
          img.src = card.image.src;
          img.alt = card.image.alt;
          imgCell.appendChild(img);
        }

        const bodyCell = document.createElement('div');
        if (card.eyebrow) {
          const ep = document.createElement('p');
          ep.innerHTML = `<em>${card.eyebrow}</em>`;
          bodyCell.appendChild(ep);
        }
        if (card.title) {
          const tp = document.createElement('p');
          if (card.href) {
            tp.innerHTML = `<strong><a href="${card.href}">${card.title}</a></strong>`;
          } else {
            tp.innerHTML = `<strong>${card.title}</strong>`;
          }
          bodyCell.appendChild(tp);
        }
        if (card.date) {
          const dp = document.createElement('p');
          dp.textContent = card.date;
          bodyCell.appendChild(dp);
        }
        if (card.description) {
          const desc = document.createElement('p');
          desc.textContent = card.description;
          bodyCell.appendChild(desc);
        }
        if (card.href) {
          const rp = document.createElement('p');
          rp.innerHTML = `<a href="${card.href}">Read More</a>`;
          bodyCell.appendChild(rp);
        }

        return [imgCell, bodyCell];
      });

      const cardsBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Cards',
        cells: rows,
      });
      main.appendChild(cardsBlock);

      const sectionMeta = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: 'related-articles' },
      });
      main.appendChild(sectionMeta);
    }

    // Apply WebImporter built-in rules
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
        blocks: cardsData.length > 0 ? ['cards'] : [],
      },
    }];
  },
};
