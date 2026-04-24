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
  var FALLBACK_RELATED_ARTICLES = [
    {
      image: { src: "https://www.usta.com/content/dam/usta/Articles/article-desktop/20170215_Wheelchair_All_Comers_Camp_A.jpg.transform/resize-400/img.jpg", alt: "Visit the Wheelchair grants awarded page" },
      eyebrow: "National",
      title: "Wheelchair grants awarded",
      href: "/en/home/stay-current/national/usta-awards-over--100-000-to-wc-tennis-programs.html",
      date: "February 12, 2019",
      description: "Wheelchair tennis will continue to grow in the U.S., thanks to generous grants of more than $100,000 awarded to wheelchair tennis programs nationwide by the USTA."
    },
    {
      image: { src: "https://www.usta.com/content/dam/usta/Articles/article-desktop/20190205_WC_Mens_Qualie_A.jpg.transform/resize-400/img.jpg", alt: "Visit the U.S. men qualify for WTC page" },
      eyebrow: "National",
      title: "U.S. men qualify for WTC",
      href: "/en/home/stay-current/national/team-usa-qualifies-for-world-team-cup-finals.html",
      date: "February 05, 2019",
      description: "For the second consecutive year, the U.S. men's wheelchair tennis team defeated Chili, 2-0, in the championship match at the BNP Paribas World Team Cup Qualification event Friday to secure its spot in the final of the BNP Paribas World Team Cup."
    },
    {
      image: { src: "https://www.usta.com/content/dam/usta/Articles/article-desktop/20181204_Wagner_AT.jpg.transform/resize-400/img.jpg", alt: "Visit the NEC Masters an Ace page" },
      eyebrow: "National",
      title: "NEC Masters an Ace",
      href: "/en/home/stay-current/national/2018-nec-wheelchair-tennis-masters--a-smashing-success.html",
      date: "December 04, 2018",
      description: "In November, the USTA National Campus successfully hosted the 2018 NEC Wheelchair Tennis Masters, the marquee event of the UNIQLO Wheelchair Tennis Tour."
    }
  ];
  var import_article_page_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      let cardsData = [];
      let nearYouTabs = [];
      executeTransformers("beforeTransform", main, payload);
      const mainContent = main.querySelector("#mainContent");
      executeTransformers("afterTransform", main, payload);
      if (mainContent) {
        const coreTabs = mainContent.querySelector(".core-tabs");
        if (coreTabs) {
          coreTabs.querySelectorAll(".cmp-tabs__tabpanel").forEach((panel) => {
            const h2 = panel.querySelector("h2");
            if (h2) nearYouTabs.push(h2.textContent.trim());
          });
        }
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
        const relatedArticlesList = mainContent.querySelector(".list-core-component__wrapper, .list ul");
        if (relatedArticlesList) {
          relatedArticlesList.querySelectorAll(".list-core-component__item-wrapper, li").forEach((item) => {
            const imgEl = item.querySelector("img");
            const titleLink = item.querySelector(".list-core-component__title, a.list-core-component__title");
            const eyebrowEl = item.querySelector(".list-core-item__eyebrow span, .list-core-item__eyebrow");
            const dateEl = item.querySelector(".cmp-list--subtitle-date, .list-core-component__subtitle span");
            const descEl = item.querySelector(".cmp-list--item-description, .list-core-component__content span");
            const readMoreLink = item.querySelector(".list-core-component__more-link, a.list-core-component__more-link");
            const card = {
              image: imgEl ? { src: imgEl.src, alt: imgEl.alt || "" } : null,
              eyebrow: eyebrowEl ? eyebrowEl.textContent.trim() : "",
              title: titleLink ? titleLink.textContent.trim() : "",
              href: titleLink ? titleLink.href || (readMoreLink ? readMoreLink.href : "") : "",
              date: dateEl ? dateEl.textContent.trim() : "",
              description: descEl ? descEl.textContent.trim() : ""
            };
            if (card.title) cardsData.push(card);
          });
        }
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
      {
        const nearYouHeadings = nearYouTabs.length > 0 ? nearYouTabs : ["Tournaments near you", "Programs near you"];
        const sectionBreak = document.createElement("hr");
        main.appendChild(sectionBreak);
        const rows = nearYouHeadings.map((heading) => {
          const cell = document.createElement("div");
          const p = document.createElement("p");
          p.textContent = heading;
          cell.appendChild(p);
          return [cell];
        });
        const nearYouBlock = WebImporter.Blocks.createBlock(document, {
          name: "Near You",
          cells: rows
        });
        main.appendChild(nearYouBlock);
      }
      if (cardsData.length === 0) {
        cardsData = FALLBACK_RELATED_ARTICLES;
      }
      {
        const sectionBreak = document.createElement("hr");
        main.appendChild(sectionBreak);
        const heading = document.createElement("h3");
        heading.textContent = "Related Articles";
        main.appendChild(heading);
        const rows = cardsData.map((card) => {
          const imgCell = document.createElement("div");
          if (card.image) {
            const img = document.createElement("img");
            img.src = card.image.src;
            img.alt = card.image.alt;
            imgCell.appendChild(img);
          }
          const bodyCell = document.createElement("div");
          if (card.eyebrow) {
            const ep = document.createElement("p");
            ep.innerHTML = `<em>${card.eyebrow}</em>`;
            bodyCell.appendChild(ep);
          }
          if (card.title) {
            const tp = document.createElement("p");
            if (card.href) {
              tp.innerHTML = `<strong><a href="${card.href}">${card.title}</a></strong>`;
            } else {
              tp.innerHTML = `<strong>${card.title}</strong>`;
            }
            bodyCell.appendChild(tp);
          }
          if (card.date) {
            const dp = document.createElement("p");
            dp.textContent = card.date;
            bodyCell.appendChild(dp);
          }
          if (card.description) {
            const desc = document.createElement("p");
            desc.textContent = card.description;
            bodyCell.appendChild(desc);
          }
          if (card.href) {
            const rp = document.createElement("p");
            rp.innerHTML = `<a href="${card.href}">Read More</a>`;
            bodyCell.appendChild(rp);
          }
          return [imgCell, bodyCell];
        });
        const cardsBlock = WebImporter.Blocks.createBlock(document, {
          name: "Cards",
          cells: rows
        });
        main.appendChild(cardsBlock);
        const sectionMeta = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: "related-articles" }
        });
        main.appendChild(sectionMeta);
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
          blocks: ["near-you", ...cardsData.length > 0 ? ["cards"] : []]
        }
      }];
    }
  };
  return __toCommonJS(import_article_page_exports);
})();
