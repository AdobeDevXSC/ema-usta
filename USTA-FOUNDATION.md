# USTA / USTA Foundation - AEM Edge Delivery Services Project

## Overview

This is an AEM Edge Delivery Services (EDS) project built on the Adobe Block Collection boilerplate. It supports two sites using a repoless architecture:

- **USTA** (usta.com) - Improve section content (tips, health/fitness, gear, rules)
- **USTA Foundation** (ustafoundation.com) - Foundation pages (who we are, what we do, impact, news)

**Repository:** `AdobeDevXSC/ema-usta`
**DA Location:** `adobedevxsc/usta-foundation`
**Architecture:** Repoless (no fstab.yaml)
**Content Authoring:** Document Authoring via DA (content.da.live)

---

## Project Structure

```
/workspace
  blocks/              25 EDS blocks
  content/             Imported content (.plain.html files)
  fonts/               Roboto font files (woff2)
  icons/               SVG icons (heart, player-avatar, search, foundation logo)
  plugins/             Experimentation plugin (A/B testing, audiences, campaigns)
  scripts/             Core JS (aem.js, scripts.js, context.js, delayed.js, sidekick.js)
  styles/              Global CSS + fonts (styles.css, fonts.css, context.css, lazy-styles.css)
  tools/               Importer scripts, demo apps, sidekick config
  ue/                  Universal Editor models and scripts
  .github/             CI workflow (lint on push)
  .migration/          Migration project config
  migration-work/      Scraping/analysis working directory
```

---

## Blocks

### Standard Blocks (from Block Collection)

| Block | Description |
|---|---|
| `accordion` | Expandable/collapsible content panels |
| `cards` | Grid of content cards (image + body) |
| `carousel` | Rotating content slides |
| `columns` | Multi-column layout |
| `embed` | YouTube/video embeds |
| `footer` | Site footer |
| `form` | Form with field definitions |
| `fragment` | Content fragment reference |
| `header` | Site header/navigation |
| `hero` | Hero banner with background image (3 variants: default, foundation, improve) |
| `modal` | Modal/dialog overlay |
| `quote` | Blockquote with author |
| `search` | Search interface |
| `table` | Data table |
| `tabs` | Tabbed content panels |
| `video` | Video player |

### Custom Blocks

| Block | Description |
|---|---|
| `cards-icon` | Cards with icon images (USTA-specific) |
| `columns-feature` | Feature columns with background styling |
| `columns-stats` | Statistics display in columns |
| `filter-bubble` | Filter chips/tags UI for content filtering |
| `filter-cards` | Dynamic cards loaded from query-index.json (6 per page, "More" button) |
| `hero-landing` | Landing page hero variant |
| `near-you` | Placeholder for dynamic location-based content |
| `player-profile` | Tennis player profile display |
| `player-rankings` | Tennis player rankings table with mock data |

---

## Hero Block Variants

The hero block supports three body-class-scoped variants:

### Default (`.hero`)
- Relative positioned with absolute background image
- White H1, max-width 1200px

### Foundation (`body.foundation .hero`)
- Full-height hero with dark gradient overlay
- Left-aligned white text (H1, subtitle, CTA buttons)
- `.hero-media` and `.hero-copy` structure created by JS
- Responsive: 380-560px mobile, 680px max-width desktop

### Improve (`body.improve .hero`)
- Banner-style hero (280px mobile, 340px desktop)
- Dark teal overlay via `::before` (`rgb(0 40 40 / 45%)`)
- White vertical border lines via `::after` (inset from edges)
- Centered white H1, z-index layered above overlay

---

## Filter System

### filter-bubble Block
- Renders filter chips from authored content
- Row 1: "Filter By {Category}" label
- Row 2: Comma-separated filter options
- Dispatches `filter-change` custom events on selection

### filter-cards Block
- Fetches articles from `/en/home/improve/query-index.json`
- Filters out articles missing image, title, or description
- Sorts by `lastModified` (most recent first)
- Displays 6 cards by default
- "MORE" button loads next 6
- Listens for `filter-change` events from filter-bubble
- 3-column grid (desktop), 2-column (tablet), 1-column (mobile)

---

## Styles

### Global Styles (`styles/styles.css`)

**Fonts:**
- `Graphik Regular` - Body text
- `Graphik XXCond Bold` - Headings (h1-h3)
- `Graphik Semibold` - Subheadings (h4-h6), buttons, labels

**Heading Sizes (desktop):**
- H1: 100px (no text-transform, color #333)
- H2: 36px (uppercase)
- H3: 56px (no text-transform)
- H4: 22px
- H5: 20px
- H6: 18px

**Section Styles:**
- `.light` / `.highlight` - Light gray background (#f5f5f5)
- `.related-articles` - Olive/sage background (#e5e5d1)
- `.gold` - Yellow background (#f5c518)

**Buttons (main content):**
- Black pill style, 50px border-radius
- Graphik Semibold, 14px, uppercase, 1.5px letter-spacing

---

## Import Infrastructure

### Import Scripts

| Script | Target |
|---|---|
| `import-article-page.js` | USTA article pages (usta.com/en/home/stay-current/national/) |
| `import-foundation.js` | USTA Foundation pages (ustafoundation.com) with hero bg image extraction |
| `import-foundation-home.js` | Foundation homepage (generic content extraction) |
| `import-play-page.js` | USTA Play landing page |

### Parsers (block-specific extraction)
- `cards-icon.js` - Cards with icon images
- `columns-feature.js` - Feature columns
- `form.js` - Lead generation forms
- `hero-landing.js` - Landing page heroes

### Transformers (page-level cleanup)
- `usta-cleanup.js` - Remove USTA site chrome (header, footer, nav, ads)
- `usta-sections.js` - Section boundary detection

### Import Process
1. URLs listed in `urls-*.txt` files
2. `run-bulk-import.js` processes each URL via Playwright
3. Import script transforms DOM into clean EDS content
4. Output saved as `.plain.html` in `/content/` directory
5. Reports generated in `/tools/importer/reports/`

---

## Content Structure

### USTA Improve Section (`/en/home/improve/`)

```
improve/
  gear-up/                          Landing page + 13 articles
  tennis-health-fitness/            Landing page + 67 articles
  tennis-rules/                     38 articles
  tips-and-instruction/             Landing page + 90+ articles
```

**Landing pages** include:
- Hero block (background image + H1)
- Body intro paragraphs
- `filter-bubble` block (category filters)
- `filter-cards` block (empty - loads dynamically)

**Article pages** include:
- Eyebrow ("National"), H1, author/date
- Hero image
- Article body content
- `filter-cards` block (Related Articles section with `related-articles` style)
- Metadata block (title, description, image, og:title)

### Query Index

`/en/home/improve/query-index.json` indexes all improve content with fields:
- `path`, `title`, `description`, `date`, `lastModified`
- `featured`, `author`, `image`, `content`, `tags`

---

## Universal Editor (UE)

Models defined in `/ue/models/blocks/` for 15 blocks. Merged into root `component-*.json` files via `npm run build:json`.

Key model features:
- Page metadata: title, description, image, robots, theme select
- Section styles: multiselect (Border Bottom, Border Top, Blue, Yellow)
- Filter bubble: multiselect filter options, label text
- Hero: image, alt, text
- Video: autoplay toggle, URL, poster image

---

## CI/CD

### GitHub Actions (`.github/workflows/main.yaml`)
- Triggers on every push
- Node.js 20
- Runs `npm run lint` (ESLint + Stylelint)

### Pre-commit Hook (`.husky/`)
- Runs `build:json` to regenerate merged UE component files

---

## Key Configuration

### Migration Project (`.migration/project.json`)
```json
{
  "type": "da",
  "libraryUrl": "https://main--ema-usta--adobedevxsc.aem.live/blocks/library.json",
  "contentHostUrl": "content.da.live"
}
```

### Helix Query Index (`helix-query.yaml`)
Indexes content under `/en/home/improve/` with properties: title, description, date, lastModified, featured, author, image, content, tags.

### Sidekick (`tools/sidekick/config.json`)
Custom sidekick configuration for the project.

---

## Fonts

| Font File | Weight | Usage |
|---|---|---|
| `Graphik-Regular-App.woff2` | 400 | Body text |
| `Graphik-Semibold-App.woff2` | 600 | Buttons, labels, h4-h6 |
| `GraphikXXCondensed-Bold-App.woff2` | 700 | h1-h3 headings |
| `roboto-regular.woff2` | 400 | Fallback |
| `roboto-medium.woff2` | 500 | Fallback |
| `roboto-bold.woff2` | 700 | Fallback |
| `roboto-condensed-bold.woff2` | 700 | Fallback condensed |

---

## Statistics

- **25 blocks** total (16 standard + 9 custom)
- **211 content pages** in /improve section
- **4 import scripts** with parsers and transformers
- **3 hero variants** (default, foundation, improve)
- **1 experimentation plugin** (A/B testing)
- **15 Universal Editor block models**
- **127 articles** indexed in query-index.json
