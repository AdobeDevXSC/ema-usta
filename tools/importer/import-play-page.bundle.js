var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-play-page.js
  var import_play_page_exports = {};
  __export(import_play_page_exports, {
    default: () => import_play_page_default
  });

  // tools/importer/parsers/hero-landing.js
  function parse(element, { document }) {
    const bgImage = element.querySelector(":scope > img, :scope > div > img");
    const heading = element.querySelector("h1");
    const subtitle = element.querySelector(".cmp-text p");
    const cells = [];
    if (bgImage) {
      cells.push([bgImage]);
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (subtitle) contentCell.push(subtitle);
    cells.push(contentCell);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-landing", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/form.js
  function parse2(element, { document }) {
    const heading = element.querySelector(".v-lead-generation-form__title, h4");
    const subtitle = element.querySelector(".v-lead-generation-form__cta-text p, .v-lead-generation-form__cta-text");
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (subtitle) contentCell.push(subtitle);
    const cells = [];
    if (contentCell.length > 0) {
      cells.push(contentCell);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "form", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon.js
  function parse3(element, { document }) {
    const cardContainers = element.querySelectorAll(":scope > div > .container.responsivegrid.full-width");
    const cells = [];
    cardContainers.forEach((card) => {
      const icon = card.querySelector(".cmp-image__image, .cmp-image img");
      const heading = card.querySelector("h5, h4, h3");
      const description = card.querySelector(".cmp-text p");
      const cta = card.querySelector("a.cmp-button, .button a");
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
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-icon", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function parse4(element, { document }) {
    const image = element.querySelector(".cmp-container > img, :scope > div > div > .cmp-container > img");
    const heading = element.querySelector(".cmp-text h2, h2");
    const paragraphs = element.querySelectorAll(".cmp-text p");
    let description = null;
    paragraphs.forEach((p) => {
      const text = p.textContent.trim();
      if (text && text !== "\xA0" && !description) {
        description = p;
      }
    });
    const cta = element.querySelector("a.cmp-button, .button a");
    const imageCell = [];
    if (image) imageCell.push(image);
    const textCell = [];
    if (heading) textCell.push(heading);
    if (description) textCell.push(description);
    if (cta) textCell.push(cta);
    const cells = [];
    cells.push([imageCell, textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/usta-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        ".cmp-experiencefragment--usta-en-popups-xf",
        "#systemErrorModal",
        "#usntA42Toggle",
        ".skip-to-main-content-link",
        ".pageLanguage",
        ".securePage"
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        ".cmp-experiencefragment--usta-en-header-ef",
        ".cmp-experiencefragment--usta-en-footer-ef",
        "nav.top-navigation",
        ".v-banner",
        "iframe",
        "link",
        "noscript",
        ".sr-only",
        "#top-of-page"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-track");
        el.removeAttribute("data-cmp-data-layer");
      });
    }
  }

  // tools/importer/transformers/usta-sections.js
  var H2 = { after: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const template = payload && payload.template;
      if (!template || !template.sections || template.sections.length < 2) return;
      const { sections } = template;
      const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document: element.getRootNode() };
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selectors) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) continue;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-play-page.js
  var parsers = {
    "hero-landing": parse,
    "form": parse2,
    "cards-icon": parse3,
    "columns-feature": parse4
  };
  var PAGE_TEMPLATE = {
    name: "play-page",
    description: "USTA Play landing page with activities, programs, and resources for playing tennis",
    urls: ["https://www.usta.com/en/home/play.html"],
    blocks: [
      {
        name: "hero-landing",
        instances: ["#container-1b53a43ea8"]
      },
      {
        name: "form",
        instances: [".v-lead-generation-wrapper"]
      },
      {
        name: "cards-icon",
        instances: ["#aa-default-national_play_get_in_the_game"]
      },
      {
        name: "columns-feature",
        instances: ["#container-36d8db448f", "#container-cf58c1a9d4", "#container-f498b06250"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero",
        selector: "#container-1b53a43ea8",
        style: null,
        blocks: ["hero-landing"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Location Prompt",
        selector: ".cmp-experiencefragment--local-content",
        style: null,
        blocks: [],
        defaultContent: ["#text-de4f0fe635 p", "#sharelocationbutton_large_not-fixed-width"]
      },
      {
        id: "section-3",
        name: "Lead Generation Form",
        selector: ".v-lead-generation-wrapper",
        style: null,
        blocks: ["form"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Get in the Game",
        selector: "#aa-default-national_play_get_in_the_game",
        style: null,
        blocks: ["cards-icon"],
        defaultContent: ["#text-fb7006ecfb h2"]
      },
      {
        id: "section-5",
        name: "Tennis for All",
        selector: "#container-36d8db448f .container.responsivegrid:first-child",
        style: null,
        blocks: ["columns-feature"],
        defaultContent: []
      },
      {
        id: "section-6",
        name: "Youth Tennis",
        selector: "#container-36d8db448f",
        style: "gold",
        blocks: ["columns-feature"],
        defaultContent: []
      },
      {
        id: "section-7",
        name: "College Tennis",
        selector: "#container-cf58c1a9d4",
        style: null,
        blocks: ["columns-feature"],
        defaultContent: []
      },
      {
        id: "section-8",
        name: "Adult Tennis",
        selector: "#container-f498b06250",
        style: "gold",
        blocks: ["columns-feature"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_play_page_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_play_page_exports);
})();
