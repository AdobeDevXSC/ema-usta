/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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

  // tools/importer/import-foundation-home.js
  var import_foundation_home_exports = {};
  __export(import_foundation_home_exports, {
    default: () => import_foundation_home_default
  });
  var import_foundation_home_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      const removeSelectors = [
        "header",
        "footer",
        'nav:not([class*="breadcrumb"])',
        ".topnavigation",
        ".top-navigation",
        ".breadcrumb",
        '[class*="breadcrumb"]',
        ".skip-to-main-content-link",
        "#usntA42Toggle",
        "#top-of-page",
        ".sr-only",
        ".pageLanguage",
        ".securePage",
        'iframe:not([src*="youtube"])',
        "link",
        "noscript",
        ".phe-block",
        ".cmp-text__icon"
      ];
      removeSelectors.forEach((sel) => {
        main.querySelectorAll(sel).forEach((el) => el.remove());
      });
      main.querySelectorAll(".phe--display-none").forEach((el) => {
        el.classList.remove("phe--display-none");
      });
      main.querySelectorAll('[class*="footer"], [class*="copyright"]').forEach((el) => el.remove());
      main.querySelectorAll('iframe:not([src*="youtube"])').forEach((el) => el.remove());
      const contentRoot = main.querySelector('.root-responsivegrid, #mainContent, [role="main"]') || main;
      const output = document.createElement("div");
      let currentSection = document.createElement("div");
      function flushSection() {
        if (currentSection.children.length > 0 || currentSection.textContent.trim()) {
          output.appendChild(currentSection);
          const hr2 = document.createElement("hr");
          output.appendChild(hr2);
          currentSection = document.createElement("div");
        }
      }
      const allTexts = contentRoot.querySelectorAll(".cmp-text");
      const allImages = contentRoot.querySelectorAll(".cmp-image");
      const allButtons = contentRoot.querySelectorAll("a.cmp-button");
      const allEmbeds = contentRoot.querySelectorAll('.cmp-embed iframe[src*="youtube"]');
      const contentSections = contentRoot.querySelectorAll(".responsivegrid > .cmp-container > .aem-Grid > .responsivegrid, .responsivegrid > .cmp-container > .aem-Grid > .container");
      if (contentSections.length > 2) {
        contentSections.forEach((section) => {
          const sectionDiv = document.createElement("div");
          let hasContent = false;
          section.querySelectorAll(".cmp-text").forEach((textEl) => {
            const els = textEl.querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote");
            els.forEach((el) => {
              const text = el.textContent.trim();
              if (!text || text === " " || text === "\xA0") return;
              const clone = el.cloneNode(true);
              clone.querySelectorAll("span").forEach((span) => {
                span.replaceWith(...span.childNodes);
              });
              sectionDiv.appendChild(clone);
              hasContent = true;
            });
          });
          section.querySelectorAll(".cmp-image img").forEach((img) => {
            if (!img.src || img.src.includes("data:image")) return;
            const p = document.createElement("p");
            const newImg = document.createElement("img");
            newImg.src = img.src;
            newImg.alt = img.alt || "";
            p.appendChild(newImg);
            sectionDiv.appendChild(p);
            hasContent = true;
          });
          section.querySelectorAll("a.cmp-button").forEach((btn) => {
            const href = btn.getAttribute("href") || btn.href;
            const text = btn.textContent.trim();
            if (text && href) {
              const p = document.createElement("p");
              const a = document.createElement("a");
              a.href = href;
              a.textContent = text;
              p.appendChild(a);
              sectionDiv.appendChild(p);
              hasContent = true;
            }
          });
          section.querySelectorAll('.cmp-embed iframe[src*="youtube"]').forEach((iframe) => {
            const src = iframe.src;
            const ytUrl = src.replace("/embed/", "/watch?v=").split("?")[0].split("&")[0];
            const embedBlock = WebImporter.Blocks.createBlock(document, {
              name: "Embed",
              cells: [[ytUrl]]
            });
            sectionDiv.appendChild(embedBlock);
            hasContent = true;
          });
          if (hasContent) {
            output.appendChild(sectionDiv);
            output.appendChild(document.createElement("hr"));
          }
        });
      } else {
        contentRoot.querySelectorAll(".cmp-text").forEach((textEl) => {
          const els = textEl.querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote");
          els.forEach((el) => {
            const text = el.textContent.trim();
            if (!text || text === " " || text === "\xA0") return;
            const tag = el.tagName.toLowerCase();
            if (tag === "h1" || tag === "h2") {
              flushSection();
            }
            const clone = el.cloneNode(true);
            clone.querySelectorAll("span").forEach((span) => {
              span.replaceWith(...span.childNodes);
            });
            currentSection.appendChild(clone);
          });
        });
        contentRoot.querySelectorAll(".cmp-image img").forEach((img) => {
          if (!img.src || img.src.includes("data:image")) return;
          const p = document.createElement("p");
          const newImg = document.createElement("img");
          newImg.src = img.src;
          newImg.alt = img.alt || "";
          p.appendChild(newImg);
          currentSection.appendChild(p);
        });
        contentRoot.querySelectorAll("a.cmp-button").forEach((btn) => {
          const href = btn.getAttribute("href") || btn.href;
          const text = btn.textContent.trim();
          if (text && href) {
            const p = document.createElement("p");
            const a = document.createElement("a");
            a.href = href;
            a.textContent = text;
            p.appendChild(a);
            currentSection.appendChild(p);
          }
        });
        contentRoot.querySelectorAll('.cmp-embed iframe[src*="youtube"]').forEach((iframe) => {
          const src = iframe.src;
          const ytUrl = src.replace("/embed/", "/watch?v=").split("?")[0].split("&")[0];
          const embedBlock = WebImporter.Blocks.createBlock(document, {
            name: "Embed",
            cells: [[ytUrl]]
          });
          currentSection.appendChild(embedBlock);
        });
        flushSection();
      }
      while (main.firstChild) main.removeChild(main.firstChild);
      while (output.firstChild) main.appendChild(output.firstChild);
      const children = [...main.children];
      for (let i = children.length - 1; i >= 0; i--) {
        if (children[i].tagName === "HR" || children[i].tagName === "DIV" && !children[i].textContent.trim() && !children[i].querySelector("img, table")) {
          children[i].remove();
        } else {
          break;
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
          template: "foundation-page",
          blocks: []
        }
      }];
    }
  };
  return __toCommonJS(import_foundation_home_exports);
})();
