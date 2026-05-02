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

  // tools/importer/import-foundation.js
  var import_foundation_exports = {};
  __export(import_foundation_exports, {
    default: () => import_foundation_default
  });
  var import_foundation_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      const h1 = main.querySelector("h1");
      let heroBgUrl = null;
      if (h1) {
        let el = h1;
        while (el && !heroBgUrl) {
          const style = el.getAttribute("style") || "";
          const computed = window.getComputedStyle ? window.getComputedStyle(el) : null;
          const bgImg = computed ? computed.backgroundImage : "";
          if (bgImg && bgImg !== "none") {
            const match = bgImg.match(/url\("?([^"]+)"?\)/);
            if (match) heroBgUrl = match[1];
          }
          el = el.parentElement;
        }
      }
      const removeSelectors = [
        "header",
        "footer",
        "nav",
        '[class*="breadcrumb"]',
        ".skip-to-main-content-link",
        'iframe:not([src*="youtube"])',
        "link",
        "noscript",
        ".phe-block",
        ".cmp-text__icon",
        ".cmp-separator",
        ".separator"
      ];
      removeSelectors.forEach((sel) => {
        main.querySelectorAll(sel).forEach((el) => el.remove());
      });
      main.querySelectorAll(".phe--display-none").forEach((el) => {
        el.classList.remove("phe--display-none");
      });
      main.querySelectorAll('[class*="--default--hide"]').forEach((el) => el.remove());
      main.querySelectorAll('[class*="--mobile--hide"]').forEach((el) => {
      });
      const output = document.createElement("div");
      if (h1) {
        const heroTable = document.createElement("div");
        if (heroBgUrl) {
          const imgRow = document.createElement("div");
          const imgCell = document.createElement("div");
          const img = document.createElement("img");
          img.src = heroBgUrl;
          img.alt = "";
          imgCell.appendChild(img);
          imgRow.appendChild(imgCell);
          heroTable.appendChild(imgRow);
        }
        const h1Row = document.createElement("div");
        const h1Cell = document.createElement("div");
        const heading = document.createElement("h1");
        heading.textContent = h1.textContent.trim().replace(/\s+/g, " ");
        h1Cell.appendChild(heading);
        h1Row.appendChild(h1Cell);
        heroTable.appendChild(h1Row);
        const subtitleContainer = h1.closest(".cmp-text");
        const subtitleP = subtitleContainer ? subtitleContainer.querySelector("p") : null;
        if (subtitleP && subtitleP.textContent.trim()) {
          const subRow = document.createElement("div");
          const subCell = document.createElement("div");
          subCell.textContent = subtitleP.textContent.trim();
          subRow.appendChild(subCell);
          heroTable.appendChild(subRow);
        }
        const heroSection = h1.closest(".responsivegrid, .cmp-container");
        const ctaBtns = heroSection ? heroSection.querySelectorAll("a.cmp-button") : [];
        if (ctaBtns.length > 0) {
          const ctaRow = document.createElement("div");
          const ctaCell = document.createElement("div");
          ctaBtns.forEach((btn) => {
            const p = document.createElement("p");
            const a = document.createElement("a");
            a.href = btn.getAttribute("href") || btn.href;
            a.textContent = btn.textContent.trim();
            p.appendChild(a);
            ctaCell.appendChild(p);
          });
          ctaRow.appendChild(ctaCell);
          heroTable.appendChild(ctaRow);
        }
        const heroBlock = WebImporter.Blocks.createBlock(document, {
          name: "Hero",
          cells: [...heroTable.children].map((row) => {
            return [...row.children].map((cell) => cell);
          })
        });
        const heroSection2 = document.createElement("div");
        heroSection2.appendChild(heroBlock);
        output.appendChild(heroSection2);
        output.appendChild(document.createElement("hr"));
      }
      const heroContainer = h1 ? h1.closest(".responsivegrid") : null;
      const contentRoot = main.querySelector(".root-responsivegrid") || main;
      const allSections = contentRoot.querySelectorAll(":scope > .aem-Grid > .responsivegrid > .cmp-container > .aem-Grid > .responsivegrid, :scope > .aem-Grid > .responsivegrid > .cmp-container > .aem-Grid > .container");
      const seen = /* @__PURE__ */ new Set();
      const contentElements = contentRoot.querySelectorAll(".cmp-text, .cmp-image, a.cmp-button, .cmp-embed");
      let currentSection = document.createElement("div");
      let sectionHasContent = false;
      contentElements.forEach((el) => {
        if (heroContainer && heroContainer.contains(el)) return;
        if (el.closest('[class*="footer"], [class*="experience-fragment"]')) return;
        if (el.classList.contains("cmp-text")) {
          const textEls = el.querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote");
          textEls.forEach((te) => {
            const text = te.textContent.trim();
            if (!text || text === " " || text === "\xA0") return;
            const dedupeKey = te.tagName + ":" + text.substring(0, 80);
            if (seen.has(dedupeKey)) return;
            seen.add(dedupeKey);
            if (te.tagName === "H2" && sectionHasContent) {
              output.appendChild(currentSection);
              output.appendChild(document.createElement("hr"));
              currentSection = document.createElement("div");
              sectionHasContent = false;
            }
            const clone = te.cloneNode(true);
            clone.querySelectorAll("span").forEach((span) => span.replaceWith(...span.childNodes));
            clone.removeAttribute("id");
            currentSection.appendChild(clone);
            sectionHasContent = true;
          });
        } else if (el.classList.contains("cmp-image")) {
          const img = el.querySelector("img");
          if (img && img.src && !img.src.includes("data:image")) {
            const dedupeKey = "img:" + img.alt + img.src.substring(img.src.length - 40);
            if (seen.has(dedupeKey)) return;
            seen.add(dedupeKey);
            const p = document.createElement("p");
            const newImg = document.createElement("img");
            newImg.src = img.src;
            newImg.alt = img.alt || "";
            p.appendChild(newImg);
            currentSection.appendChild(p);
            sectionHasContent = true;
          }
        } else if (el.tagName === "A" && el.classList.contains("cmp-button")) {
          if (heroContainer && heroContainer.contains(el)) return;
          const href = el.getAttribute("href") || el.href;
          const text = el.textContent.trim();
          if (text && href) {
            const dedupeKey = "btn:" + text + href;
            if (seen.has(dedupeKey)) return;
            seen.add(dedupeKey);
            const p = document.createElement("p");
            const a = document.createElement("a");
            a.href = href;
            a.textContent = text;
            p.appendChild(a);
            currentSection.appendChild(p);
            sectionHasContent = true;
          }
        } else if (el.classList.contains("cmp-embed")) {
          const iframe = el.querySelector('iframe[src*="youtube"]');
          if (iframe) {
            const ytUrl = iframe.src.replace("/embed/", "/watch?v=").split("?")[0];
            const embedBlock = WebImporter.Blocks.createBlock(document, {
              name: "Embed",
              cells: [[ytUrl]]
            });
            currentSection.appendChild(embedBlock);
            sectionHasContent = true;
          }
        }
      });
      if (sectionHasContent) {
        output.appendChild(currentSection);
      }
      const children = [...output.children];
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        if (child.tagName === "HR" || child.tagName === "DIV" && !child.textContent.trim() && !child.querySelector("img, table")) {
          child.remove();
        } else {
          break;
        }
      }
      while (main.firstChild) main.removeChild(main.firstChild);
      while (output.firstChild) main.appendChild(output.firstChild);
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
          blocks: ["hero"]
        }
      }];
    }
  };
  return __toCommonJS(import_foundation_exports);
})();
