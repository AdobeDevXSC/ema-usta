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

  // tools/importer/import-article-page.js
  var import_article_page_exports = {};
  __export(import_article_page_exports, {
    default: () => import_article_page_default
  });

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

  // tools/importer/import-article-page.js
  var PAGE_TEMPLATE = {
    name: "article-page",
    description: "USTA article page with title, author, date, hero image, and body text",
    urls: ["https://www.usta.com/en/home/stay-current/national/USTA-awards-wheelchair-tennis-grants.html"],
    blocks: [],
    sections: [
      {
        id: "section-1",
        name: "Article Content",
        selector: "#mainContent",
        style: null,
        blocks: [],
        defaultContent: [".cmp-title", ".cmp-image", ".cmp-text"]
      }
    ]
  };
  var transformers = [
    transform
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
  var import_article_page_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const mainContent = main.querySelector("#mainContent");
      executeTransformers("afterTransform", main, payload);
      if (mainContent) {
        mainContent.querySelectorAll(".v-social-media-sharing, .socialmediasharing").forEach((el) => el.remove());
        mainContent.querySelectorAll(".core-tabs, .relatedopportunities, .textandlinkwithimage").forEach((el) => el.remove());
        mainContent.querySelectorAll('[class*="ros-ad"], .adImageComp, .ad, [id*="gpt-ad"], [id*="skipAd"]').forEach((el) => el.remove());
        mainContent.querySelectorAll('a.skipAd, a[href*="skipAd"]').forEach((el) => {
          const parent = el.closest("p") || el;
          parent.remove();
        });
        mainContent.querySelectorAll("h4").forEach((el) => {
          if (el.textContent.trim() === "Advertisement") el.remove();
        });
        mainContent.querySelectorAll(".list, .relatedarticles, .v-related-articles").forEach((el) => el.remove());
        mainContent.querySelectorAll("h3").forEach((h) => {
          if (h.textContent.trim() === "Related Articles") {
            const parentText = h.closest(".cmp-text") || h.closest(".text");
            if (parentText) {
              parentText.remove();
            } else {
              h.remove();
            }
          }
        });
        mainContent.querySelectorAll(".phe-block").forEach((el) => el.remove());
        mainContent.querySelectorAll(".cmp-separator").forEach((el) => el.remove());
        mainContent.querySelectorAll(".separator").forEach((el) => el.remove());
        mainContent.querySelectorAll(".iframealignment").forEach((el) => el.remove());
        const titleEl = mainContent.querySelector(".cmp-title");
        if (titleEl) {
          const eyebrow = titleEl.querySelector(".cmp-articlesection span");
          const h1 = titleEl.querySelector("h1");
          const authorDate = titleEl.querySelector(".cmp-title__authorDate");
          const titleContainer = document.createElement("div");
          if (eyebrow) {
            const p = document.createElement("p");
            p.innerHTML = `<em>${eyebrow.textContent.trim()}</em>`;
            titleContainer.appendChild(p);
          }
          if (h1) {
            const heading = document.createElement("h1");
            heading.textContent = h1.textContent.trim().replace(/\s+/g, " ");
            titleContainer.appendChild(heading);
          }
          if (authorDate) {
            const p = document.createElement("p");
            p.innerHTML = `<em>${authorDate.textContent.trim().replace(/\s+/g, " ")}</em>`;
            titleContainer.appendChild(p);
          }
          titleEl.replaceWith(titleContainer);
        }
        const textEl = mainContent.querySelector(".cmp-text");
        if (textEl) {
          textEl.querySelectorAll("p").forEach((p) => {
            if (p.textContent.trim() === "" || p.textContent.trim() === "\xA0") {
              p.remove();
            }
          });
          textEl.querySelectorAll("h3").forEach((h) => {
            if (h.textContent.trim() === "" || h.textContent.trim() === "\xA0") {
              h.remove();
            }
          });
        }
        mainContent.querySelectorAll(".phe--display-none").forEach((el) => {
          el.classList.remove("phe--display-none");
        });
        const allParagraphs = mainContent.querySelectorAll("p");
        allParagraphs.forEach((p) => {
          const text = p.textContent.trim();
          if (text === "" || text === "\u200B" || text === "\xA0") {
            p.remove();
          }
        });
        mainContent.querySelectorAll(".conditional-container, .cmp-container").forEach((el) => {
          if (el.textContent.trim() === "") el.remove();
        });
        while (main.firstChild) {
          main.removeChild(main.firstChild);
        }
        while (mainContent.firstChild) {
          main.appendChild(mainContent.firstChild);
        }
      }
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
          blocks: []
        }
      }];
    }
  };
  return __toCommonJS(import_article_page_exports);
})();
