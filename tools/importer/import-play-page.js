/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroLandingParser from './parsers/hero-landing.js';
import formParser from './parsers/form.js';
import cardsIconParser from './parsers/cards-icon.js';
import columnsFeatureParser from './parsers/columns-feature.js';

// TRANSFORMER IMPORTS
import ustaCleanupTransformer from './transformers/usta-cleanup.js';
import ustaSectionsTransformer from './transformers/usta-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-landing': heroLandingParser,
  'form': formParser,
  'cards-icon': cardsIconParser,
  'columns-feature': columnsFeatureParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'play-page',
  description: 'USTA Play landing page with activities, programs, and resources for playing tennis',
  urls: ['https://www.usta.com/en/home/play.html'],
  blocks: [
    {
      name: 'hero-landing',
      instances: ['#container-1b53a43ea8'],
    },
    {
      name: 'form',
      instances: ['.v-lead-generation-wrapper'],
    },
    {
      name: 'cards-icon',
      instances: ['#aa-default-national_play_get_in_the_game'],
    },
    {
      name: 'columns-feature',
      instances: ['#container-36d8db448f', '#container-cf58c1a9d4', '#container-f498b06250'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero',
      selector: '#container-1b53a43ea8',
      style: null,
      blocks: ['hero-landing'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Location Prompt',
      selector: '.cmp-experiencefragment--local-content',
      style: null,
      blocks: [],
      defaultContent: ['#text-de4f0fe635 p', '#sharelocationbutton_large_not-fixed-width'],
    },
    {
      id: 'section-3',
      name: 'Lead Generation Form',
      selector: '.v-lead-generation-wrapper',
      style: null,
      blocks: ['form'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'Get in the Game',
      selector: '#aa-default-national_play_get_in_the_game',
      style: null,
      blocks: ['cards-icon'],
      defaultContent: ['#text-fb7006ecfb h2'],
    },
    {
      id: 'section-5',
      name: 'Tennis for All',
      selector: '#container-36d8db448f .container.responsivegrid:first-child',
      style: null,
      blocks: ['columns-feature'],
      defaultContent: [],
    },
    {
      id: 'section-6',
      name: 'Youth Tennis',
      selector: '#container-36d8db448f',
      style: 'gold',
      blocks: ['columns-feature'],
      defaultContent: [],
    },
    {
      id: 'section-7',
      name: 'College Tennis',
      selector: '#container-cf58c1a9d4',
      style: null,
      blocks: ['columns-feature'],
      defaultContent: [],
    },
    {
      id: 'section-8',
      name: 'Adult Tennis',
      selector: '#container-f498b06250',
      style: 'gold',
      blocks: ['columns-feature'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  ustaCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [ustaSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
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

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

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
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
