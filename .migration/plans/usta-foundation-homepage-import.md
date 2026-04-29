# USTA Foundation Homepage Import Plan

## Overview

Import content from `https://www.ustafoundation.com/en/home.html` into the EDS project. This is a **different site** (USTA Foundation) from the previously imported USTA national articles. The page is a landing/homepage with a hero, stats, body content, embedded YouTube video, image gallery, and CTA cards. **No code changes** — content import only.

## Source Page Analysis

**URL:** `https://www.ustafoundation.com/en/home.html`  
**Site:** USTA Foundation (ustafoundation.com) — different domain from usta.com  
**Page type:** Homepage / Landing page

### Content Sections Identified

| # | Section | Content | EDS Approach |
|---|---------|---------|--------------|
| 1 | **Hero** | H1 "Transforming Lives Through Tennis & Education", subtitle paragraph, "LEARN MORE" CTA button, background image | Hero block or default content |
| 2 | **Stats Bar** | Three stats: "270+ Community-Based Organizations", "233,000+ Young People Served Annually", "30+ Years of Impact" | Default content (formatted text) or columns block |
| 3 | **Mission Statement** | H2 "Ready on the court. Ready for life.", body paragraph | Default content |
| 4 | **About Section** | H3 "We go beyond wins and losses.", 3 paragraphs, "WHO WE ARE" and "WHAT WE DO" CTA buttons | Default content with buttons |
| 5 | **Video Section** | H3 "Learn more about how we transform lives.", YouTube embed (`feWWwtGHIoQ`), caption paragraph | Embed block (YouTube) |
| 6 | **Impact Section** | H2 "For decades, our work has had an impact nationwide.", 2 images, 3 paragraphs, "LEARN MORE" CTA | Default content or columns block |
| 7 | **Support Section** | H2 "Your support makes a difference.", subtitle, then 4 CTA cards (image + H4 + paragraph + link each): Make a donation, Explore funding priorities, Support special funds, Learn about local work | Cards block |
| 8 | **Metadata** | Title, description, OG image | Metadata block |

## Approach

This is a **new page type** (foundation homepage) that doesn't match the existing article template. A new import script is needed for this one-off page.

### Key Decisions

- **No code changes** — use existing blocks only (hero, embed, cards, columns, default content)
- The article import script (`import-article-page.js`) was deleted from the workspace — a new import script specific to this page is required
- The source domain is `ustafoundation.com`, not `usta.com` — the cleanup transformer selectors may not match this site's DOM structure; the import script will need its own cleanup logic
- Content output path: `content/en/home.plain.html` (the foundation homepage)

### Import Infrastructure Needed

1. **New import script** — `tools/importer/import-foundation-home.js` with page-specific transform logic
2. **Bundle** — `tools/importer/import-foundation-home.bundle.js`
3. **URL file** — `tools/importer/urls-foundation-home.txt` with the single URL
4. No new parsers or transformers needed — the page uses standard blocks

## Checklist

- [ ] Create `tools/importer/import-foundation-home.js` — import script with transform logic for the foundation homepage
  - [ ] Remove header/nav/footer/breadcrumb chrome
  - [ ] Extract hero section (H1, subtitle, CTA, background image)
  - [ ] Extract stats bar as default content or columns
  - [ ] Extract mission statement section
  - [ ] Extract about section with CTAs
  - [ ] Extract YouTube video as embed block
  - [ ] Extract impact section with images
  - [ ] Extract support cards (4 cards with image + H4 + text + link)
  - [ ] Generate metadata block
- [ ] Bundle the import script using `@adobe/aem-import-helper`
- [ ] Create `tools/importer/urls-foundation-home.txt` with the single URL
- [ ] Run the bulk import
- [ ] Verify the generated `content/en/home.plain.html` has correct structure
- [ ] Update `tools/importer/page-templates.json` with the new foundation-home template

## Notes

- The existing `usta-cleanup.js` transformer targets `usta.com` DOM selectors (`.cmp-experiencefragment--usta-en-header-ef`, etc.) which likely won't match `ustafoundation.com` — the new import script should handle its own cleanup
- This is a single page import, not a template for many pages
- **Execution requires switching to Execute mode**
