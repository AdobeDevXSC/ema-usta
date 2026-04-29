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
        "nav",
        "header",
        "footer",
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
      main.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-track");
        el.removeAttribute("data-cmp-data-layer");
      });
      const content = document.createElement("div");
      const h1El = main.querySelector("h1");
      if (h1El) {
        const heroDiv = document.createElement("div");
        const h1 = document.createElement("h1");
        h1.textContent = h1El.textContent.trim().replace(/\s+/g, " ");
        heroDiv.appendChild(h1);
        const subtitleEl = h1El.closest(".cmp-text");
        if (subtitleEl) {
          const pSub = subtitleEl.querySelector("p");
          if (pSub) {
            const p = document.createElement("p");
            p.textContent = pSub.textContent.trim();
            heroDiv.appendChild(p);
          }
        }
        const learnMoreBtn = main.querySelector('a.cmp-button[href*="who-we-are"]');
        if (learnMoreBtn) {
          const p = document.createElement("p");
          const a = document.createElement("a");
          a.href = learnMoreBtn.href;
          a.textContent = "LEARN MORE";
          p.appendChild(a);
          heroDiv.appendChild(p);
        }
        content.appendChild(heroDiv);
      }
      content.appendChild(document.createElement("hr"));
      const statsDiv = document.createElement("div");
      const statTexts = main.querySelectorAll("#container-c949c3b71b .cmp-text");
      if (statTexts.length >= 3) {
        const statsRows = [];
        statTexts.forEach((st) => {
          const ps = st.querySelectorAll("p");
          if (ps.length >= 2) {
            const num = ps[0].textContent.trim();
            const label = ps[1].textContent.trim();
            if (num && label) {
              statsRows.push({ num, label });
            }
          }
        });
        if (statsRows.length > 0) {
          const colBlock = WebImporter.Blocks.createBlock(document, {
            name: "Columns",
            cells: [statsRows.map((s) => {
              const cell = document.createElement("div");
              const pNum = document.createElement("p");
              pNum.innerHTML = `<strong>${s.num}</strong>`;
              cell.appendChild(pNum);
              const pLabel = document.createElement("p");
              pLabel.textContent = s.label;
              cell.appendChild(pLabel);
              return cell;
            })]
          });
          content.appendChild(colBlock);
        }
      }
      content.appendChild(document.createElement("hr"));
      const h2s = main.querySelectorAll("h2");
      h2s.forEach((h2) => {
        const text = h2.textContent.trim().replace(/\s+/g, " ");
        if (text.includes("Ready on the court")) {
          const sectionDiv = document.createElement("div");
          const heading = document.createElement("h2");
          heading.textContent = text;
          sectionDiv.appendChild(heading);
          const parentCmp = h2.closest(".cmp-text");
          if (parentCmp) {
            const bodyP = parentCmp.querySelector("p");
            if (bodyP) {
              const p = document.createElement("p");
              p.textContent = bodyP.textContent.trim();
              sectionDiv.appendChild(p);
            }
          }
          content.appendChild(sectionDiv);
        }
      });
      content.appendChild(document.createElement("hr"));
      const aboutTexts = main.querySelectorAll("#text-131b3f0032, #text-dacfd10974");
      const aboutEl = aboutTexts.length > 0 ? aboutTexts[0] : null;
      if (aboutEl) {
        const aboutDiv = document.createElement("div");
        const h3 = aboutEl.querySelector("h3");
        if (h3) {
          const heading = document.createElement("h3");
          heading.textContent = h3.textContent.trim();
          aboutDiv.appendChild(heading);
        }
        aboutEl.querySelectorAll("p").forEach((p) => {
          const text = p.textContent.trim();
          if (text && text !== " ") {
            const newP = document.createElement("p");
            newP.textContent = text;
            aboutDiv.appendChild(newP);
          }
        });
        const whoBtn = main.querySelector('a.cmp-button[href*="who-we-are"]');
        const whatBtn = main.querySelector('a.cmp-button[href*="what-we-do"]');
        if (whoBtn) {
          const p = document.createElement("p");
          const a = document.createElement("a");
          a.href = whoBtn.href;
          a.textContent = "WHO WE ARE";
          p.appendChild(a);
          aboutDiv.appendChild(p);
        }
        if (whatBtn) {
          const p = document.createElement("p");
          const a = document.createElement("a");
          a.href = whatBtn.href;
          a.textContent = "WHAT WE DO";
          p.appendChild(a);
          aboutDiv.appendChild(p);
        }
        content.appendChild(aboutDiv);
      }
      const videoH3 = [...main.querySelectorAll("h3")].find((h) => h.textContent.includes("Learn more about how we transform"));
      if (videoH3) {
        const videoDiv = document.createElement("div");
        const heading = document.createElement("h3");
        heading.textContent = videoH3.textContent.trim();
        videoDiv.appendChild(heading);
        const youtubeIframe = main.querySelector('iframe[src*="youtube"]');
        if (youtubeIframe) {
          const ytUrl = youtubeIframe.src.replace("/embed/", "/watch?v=").split("?si=")[0];
          const embedBlock = WebImporter.Blocks.createBlock(document, {
            name: "Embed",
            cells: [[ytUrl]]
          });
          videoDiv.appendChild(embedBlock);
        }
        const captionCmp = main.querySelector("#text-7bb31e11e2");
        if (captionCmp) {
          const captionP = captionCmp.querySelector("p");
          if (captionP) {
            const p = document.createElement("p");
            p.textContent = captionP.textContent.trim();
            videoDiv.appendChild(p);
          }
        }
        content.appendChild(videoDiv);
      }
      content.appendChild(document.createElement("hr"));
      const impactH2 = [...main.querySelectorAll("h2")].find((h) => h.textContent.includes("For decades"));
      if (impactH2) {
        const impactDiv = document.createElement("div");
        const heading = document.createElement("h2");
        heading.textContent = impactH2.textContent.trim();
        impactDiv.appendChild(heading);
        const impactImgs = impactH2.closest(".cmp-container, .responsivegrid");
        if (impactImgs) {
          impactImgs.querySelectorAll("img.cmp-image__image").forEach((img) => {
            const p = document.createElement("p");
            const newImg = document.createElement("img");
            newImg.src = img.src;
            newImg.alt = img.alt || "";
            p.appendChild(newImg);
            impactDiv.appendChild(p);
          });
        }
        const impactTextContainer = impactH2.closest(".cmp-container, .responsivegrid");
        if (impactTextContainer) {
          const cmpTexts = impactTextContainer.querySelectorAll(".cmp-text");
          cmpTexts.forEach((ct) => {
            ct.querySelectorAll("p").forEach((p) => {
              const text = p.textContent.trim();
              if (text && text !== " " && !text.includes("For decades")) {
                const newP = document.createElement("p");
                newP.textContent = text;
                impactDiv.appendChild(newP);
              }
            });
          });
        }
        const impactBtn = impactH2.closest(".responsivegrid, .cmp-container");
        if (impactBtn) {
          const learnMore = impactBtn.querySelector('a.cmp-button[href*="our-impact"]');
          if (learnMore) {
            const p = document.createElement("p");
            const a = document.createElement("a");
            a.href = learnMore.href;
            a.textContent = "LEARN MORE";
            p.appendChild(a);
            impactDiv.appendChild(p);
          }
        }
        content.appendChild(impactDiv);
      }
      content.appendChild(document.createElement("hr"));
      const supportH2 = [...main.querySelectorAll("h2")].find((h) => h.textContent.includes("Your support"));
      if (supportH2) {
        const supportDiv = document.createElement("div");
        const heading = document.createElement("h2");
        heading.textContent = supportH2.textContent.trim();
        supportDiv.appendChild(heading);
        const subtitleCmp = supportH2.closest(".cmp-text");
        if (subtitleCmp) {
          const subP = subtitleCmp.querySelector("p");
          if (subP) {
            const p = document.createElement("p");
            p.textContent = subP.textContent.trim();
            supportDiv.appendChild(p);
          }
        }
        const cardData = [];
        const cardSelectors = ["#container-0275248b8a", "#container-b611778fd8"];
        const supportContainer = supportH2.closest(".responsivegrid, .cmp-container");
        if (supportContainer) {
          const cardContainers = supportContainer.querySelectorAll(".responsivegrid .cmp-container");
          cardContainers.forEach((cc) => {
            const img = cc.querySelector("img.cmp-image__image");
            const h4 = cc.querySelector("h4");
            const texts = cc.querySelectorAll(".cmp-text p");
            if (img && h4) {
              const card = {
                imgSrc: img.src,
                imgAlt: img.alt || "",
                title: h4.textContent.trim(),
                description: "",
                linkHref: "",
                linkText: ""
              };
              texts.forEach((p) => {
                const text = p.textContent.trim();
                const link = p.querySelector("a");
                if (link) {
                  card.linkHref = link.href;
                  card.linkText = link.textContent.trim();
                } else if (text && text !== " " && text !== card.title) {
                  card.description = text;
                }
              });
              if (!cardData.some((c) => c.title === card.title)) {
                cardData.push(card);
              }
            }
          });
        }
        if (cardData.length > 0) {
          const rows = cardData.map((card) => {
            const imgCell = document.createElement("div");
            const img = document.createElement("img");
            img.src = card.imgSrc;
            img.alt = card.imgAlt;
            imgCell.appendChild(img);
            const bodyCell = document.createElement("div");
            const h4 = document.createElement("h4");
            h4.textContent = card.title;
            bodyCell.appendChild(h4);
            if (card.description) {
              const p = document.createElement("p");
              p.textContent = card.description;
              bodyCell.appendChild(p);
            }
            if (card.linkHref) {
              const p = document.createElement("p");
              const a = document.createElement("a");
              a.href = card.linkHref;
              a.textContent = card.linkText || "LEARN MORE";
              p.appendChild(a);
              bodyCell.appendChild(p);
            }
            return [imgCell, bodyCell];
          });
          const cardsBlock = WebImporter.Blocks.createBlock(document, {
            name: "Cards",
            cells: rows
          });
          supportDiv.appendChild(cardsBlock);
        }
        content.appendChild(supportDiv);
      }
      while (main.firstChild) main.removeChild(main.firstChild);
      while (content.firstChild) main.appendChild(content.firstChild);
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
          template: "foundation-home",
          blocks: ["columns", "embed", "cards"]
        }
      }];
    }
  };
  return __toCommonJS(import_foundation_home_exports);
})();
