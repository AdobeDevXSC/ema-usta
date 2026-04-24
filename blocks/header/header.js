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

/** Black circle with white down-caret (USTA Sites / Sections). */
function topBarCaretIcon() {
  return '<span class="nav-top-btn-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 18 18" focusable="false"><circle cx="9" cy="9" r="8" fill="#000"/><path fill="#fff" d="M5.5 6.5H12.5L9 11.5z"/></svg></span>';
}

function buildTopBar() {
  const topBar = document.createElement('div');
  topBar.className = 'nav-top-bar';
  topBar.innerHTML = `
    <div class="nav-top-bar-inner">
      <div class="nav-top-bar-left">
        <button class="nav-top-btn" type="button">
          ${topBarCaretIcon()}
          <span>USTA Sites</span>
        </button>
        <button class="nav-top-btn" type="button">
          ${topBarCaretIcon()}
          <span>USTA Sections</span>
        </button>
      </div>
      <div class="nav-top-bar-center">
        <div class="nav-location" role="group" aria-label="Location and section">
          <div class="nav-location-left">
            <svg class="nav-location-pin" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
            <span class="nav-location-city">Enter city or zip</span>
            <button type="button" class="nav-location-edit" aria-label="Edit location">
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            </button>
          </div>
          <span class="nav-location-divider" aria-hidden="true"></span>
          <span class="nav-location-region">SOUTHERN CALIFORNIA</span>
        </div>
      </div>
      <div class="nav-top-bar-right">
        <button class="nav-icon-btn" type="button" aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </button>
        <button class="nav-icon-btn" type="button" aria-label="Language">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
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
  // Only append div elements — skip meta/script/link injected by head.html
  [...fragment.children].forEach((child) => {
    if (child.tagName === 'DIV') nav.append(child);
  });

  const classes = ['brand', 'sections', 'tools'];
  const navDivs = nav.querySelectorAll(':scope > div');
  classes.forEach((c, i) => {
    if (navDivs[i]) navDivs[i].classList.add(`nav-${c}`);
  });

  // Brand: keep fragment markup; add layout classes only
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    navBrand.querySelectorAll('a').forEach((a) => a.classList.add('nav-brand-link'));
    const paragraphs = navBrand.querySelectorAll('p');
    if (paragraphs.length > 1) {
      paragraphs[paragraphs.length - 1].classList.add('nav-brand-section');
    }
  }

  // Nav sections: style active link
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((item) => {
      const linkStrong = item.querySelector('a strong');
      if (linkStrong) {
        item.classList.add('nav-active');
      }
      const hasSubmenu = item.querySelector(':scope > ul');
      if (hasSubmenu) {
        item.classList.add('nav-drop');
      } else if (!item.querySelector('a') && item.textContent.trim()) {
        item.classList.add('nav-drop');
      } else if (linkStrong) {
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
