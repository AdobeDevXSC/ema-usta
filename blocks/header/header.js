import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

function buildTopBar() {
  const topBar = document.createElement('div');
  topBar.className = 'nav-top-bar';
  topBar.innerHTML = `
    <div class="nav-top-bar-inner">
      <div class="nav-top-bar-left">
        <button class="nav-top-btn" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          USTA Sites
        </button>
        <button class="nav-top-btn" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          USTA Sections
        </button>
      </div>
      <div class="nav-top-bar-center">
        <div class="nav-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          <input type="text" placeholder="Enter city or zip" class="nav-location-input">
          <span class="nav-section-label">SOUTHERN CALIFORNIA</span>
        </div>
      </div>
      <div class="nav-top-bar-right">
        <button class="nav-icon-btn" type="button" aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </button>
        <button class="nav-icon-btn" type="button" aria-label="Language">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        </button>
      </div>
    </div>
  `;
  return topBar;
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Brand: extract text and build logo area
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('a');
    const sectionLabel = navBrand.querySelector('p:last-child');
    const sectionText = sectionLabel ? sectionLabel.textContent.trim() : '';

    navBrand.innerHTML = '';
    const logoLink = document.createElement('a');
    logoLink.href = brandLink ? brandLink.href : '/';
    logoLink.className = 'nav-brand-link';
    logoLink.innerHTML = `
      <img src="https://www.usta.com/content/dam/usta/logos/usta-logo.svg" alt="USTA" class="nav-logo">
    `;
    navBrand.append(logoLink);

    if (sectionText) {
      const sectionEl = document.createElement('span');
      sectionEl.className = 'nav-brand-section';
      sectionEl.textContent = sectionText;
      navBrand.append(sectionEl);
    }
  }

  // Nav sections: style active link
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((item) => {
      const link = item.querySelector('a strong');
      if (link) {
        item.classList.add('nav-active');
      }
      // Add dropdown arrow for items without links (dropdown placeholders)
      if (!item.querySelector('a') && item.textContent.trim()) {
        item.classList.add('nav-drop');
      }
    });
  }

  // Tools: style as JOIN and SIGN IN buttons
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const links = navTools.querySelectorAll('a');
    links.forEach((link) => {
      link.classList.remove('button');
      const text = link.textContent.trim();
      if (text === 'JOIN') {
        link.classList.add('nav-btn', 'nav-btn-outline');
      } else if (text === 'SIGN IN') {
        link.classList.add('nav-btn', 'nav-btn-filled');
      }
    });
    // Remove button-container wrappers
    navTools.querySelectorAll('.button-container').forEach((bc) => {
      bc.classList.remove('button-container');
    });
  }

  // Hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  // Build top bar
  const topBar = buildTopBar();

  // Assemble header
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(topBar);
  navWrapper.append(nav);
  block.append(navWrapper);
}
