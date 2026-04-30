/* eslint-disable */
/* global WebImporter */

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // --- Cleanup: remove site chrome ---
    const removeSelectors = [
      'header', 'footer',
      'nav:not([class*="breadcrumb"])',
      '.topnavigation', '.top-navigation',
      '.breadcrumb', '[class*="breadcrumb"]',
      '.skip-to-main-content-link', '#usntA42Toggle', '#top-of-page',
      '.sr-only', '.pageLanguage', '.securePage',
      'iframe:not([src*="youtube"])',
      'link', 'noscript',
      '.phe-block',
      '.cmp-text__icon',
    ];
    removeSelectors.forEach((sel) => {
      main.querySelectorAll(sel).forEach((el) => el.remove());
    });

    // Remove phe--display-none class
    main.querySelectorAll('.phe--display-none').forEach((el) => {
      el.classList.remove('phe--display-none');
    });

    // Remove the footer section (identified by footer-specific content)
    main.querySelectorAll('[class*="footer"], [class*="copyright"]').forEach((el) => el.remove());
    // Remove donate iframe
    main.querySelectorAll('iframe:not([src*="youtube"])').forEach((el) => el.remove());

    // --- Generic content extraction ---
    // Find the main content container (usually .root-responsivegrid or similar)
    const contentRoot = main.querySelector('.root-responsivegrid, #mainContent, [role="main"]') || main;

    // Collect all meaningful content sections
    const output = document.createElement('div');
    let currentSection = document.createElement('div');

    function flushSection() {
      if (currentSection.children.length > 0 || currentSection.textContent.trim()) {
        output.appendChild(currentSection);
        const hr = document.createElement('hr');
        output.appendChild(hr);
        currentSection = document.createElement('div');
      }
    }

    // Walk through all .cmp-text, .cmp-image, .cmp-button, .embed, and .cmp-container elements
    const allTexts = contentRoot.querySelectorAll('.cmp-text');
    const allImages = contentRoot.querySelectorAll('.cmp-image');
    const allButtons = contentRoot.querySelectorAll('a.cmp-button');
    const allEmbeds = contentRoot.querySelectorAll('.cmp-embed iframe[src*="youtube"]');

    // Strategy: extract content by walking the DOM top-down, collecting
    // headings, paragraphs, images, buttons, and embeds in section order.
    const contentSections = contentRoot.querySelectorAll('.responsivegrid > .cmp-container > .aem-Grid > .responsivegrid, .responsivegrid > .cmp-container > .aem-Grid > .container');

    // If we find structured sections, use them
    if (contentSections.length > 2) {
      contentSections.forEach((section) => {
        const sectionDiv = document.createElement('div');
        let hasContent = false;

        // Extract all text content
        section.querySelectorAll('.cmp-text').forEach((textEl) => {
          const els = textEl.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote');
          els.forEach((el) => {
            const text = el.textContent.trim();
            if (!text || text === ' ' || text === ' ') return;
            const clone = el.cloneNode(true);
            // Clean up spans inside headings
            clone.querySelectorAll('span').forEach((span) => {
              span.replaceWith(...span.childNodes);
            });
            sectionDiv.appendChild(clone);
            hasContent = true;
          });
        });

        // Extract images
        section.querySelectorAll('.cmp-image img').forEach((img) => {
          if (!img.src || img.src.includes('data:image')) return;
          const p = document.createElement('p');
          const newImg = document.createElement('img');
          newImg.src = img.src;
          newImg.alt = img.alt || '';
          p.appendChild(newImg);
          sectionDiv.appendChild(p);
          hasContent = true;
        });

        // Extract CTA buttons
        section.querySelectorAll('a.cmp-button').forEach((btn) => {
          const href = btn.getAttribute('href') || btn.href;
          const text = btn.textContent.trim();
          if (text && href) {
            const p = document.createElement('p');
            const a = document.createElement('a');
            a.href = href;
            a.textContent = text;
            p.appendChild(a);
            sectionDiv.appendChild(p);
            hasContent = true;
          }
        });

        // Extract YouTube embeds
        section.querySelectorAll('.cmp-embed iframe[src*="youtube"]').forEach((iframe) => {
          const src = iframe.src;
          const ytUrl = src.replace('/embed/', '/watch?v=').split('?')[0].split('&')[0];
          const embedBlock = WebImporter.Blocks.createBlock(document, {
            name: 'Embed',
            cells: [[ytUrl]],
          });
          sectionDiv.appendChild(embedBlock);
          hasContent = true;
        });

        if (hasContent) {
          output.appendChild(sectionDiv);
          output.appendChild(document.createElement('hr'));
        }
      });
    } else {
      // Fallback: extract all content generically from the entire content root
      contentRoot.querySelectorAll('.cmp-text').forEach((textEl) => {
        const els = textEl.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote');
        els.forEach((el) => {
          const text = el.textContent.trim();
          if (!text || text === ' ' || text === ' ') return;
          const tag = el.tagName.toLowerCase();
          // Start new section on h1/h2
          if (tag === 'h1' || tag === 'h2') {
            flushSection();
          }
          const clone = el.cloneNode(true);
          clone.querySelectorAll('span').forEach((span) => {
            span.replaceWith(...span.childNodes);
          });
          currentSection.appendChild(clone);
        });
      });

      // Get remaining images
      contentRoot.querySelectorAll('.cmp-image img').forEach((img) => {
        if (!img.src || img.src.includes('data:image')) return;
        const p = document.createElement('p');
        const newImg = document.createElement('img');
        newImg.src = img.src;
        newImg.alt = img.alt || '';
        p.appendChild(newImg);
        currentSection.appendChild(p);
      });

      // Get CTA buttons
      contentRoot.querySelectorAll('a.cmp-button').forEach((btn) => {
        const href = btn.getAttribute('href') || btn.href;
        const text = btn.textContent.trim();
        if (text && href) {
          const p = document.createElement('p');
          const a = document.createElement('a');
          a.href = href;
          a.textContent = text;
          p.appendChild(a);
          currentSection.appendChild(p);
        }
      });

      // Get YouTube embeds
      contentRoot.querySelectorAll('.cmp-embed iframe[src*="youtube"]').forEach((iframe) => {
        const src = iframe.src;
        const ytUrl = src.replace('/embed/', '/watch?v=').split('?')[0].split('&')[0];
        const embedBlock = WebImporter.Blocks.createBlock(document, {
          name: 'Embed',
          cells: [[ytUrl]],
        });
        currentSection.appendChild(embedBlock);
      });

      flushSection();
    }

    // --- Replace main with extracted content ---
    while (main.firstChild) main.removeChild(main.firstChild);
    while (output.firstChild) main.appendChild(output.firstChild);

    // Remove trailing empty sections
    const children = [...main.children];
    for (let i = children.length - 1; i >= 0; i--) {
      if (children[i].tagName === 'HR' || (children[i].tagName === 'DIV' && !children[i].textContent.trim() && !children[i].querySelector('img, table'))) {
        children[i].remove();
      } else {
        break;
      }
    }

    // --- Metadata ---
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: 'foundation-page',
        blocks: [],
      },
    }];
  },
};
