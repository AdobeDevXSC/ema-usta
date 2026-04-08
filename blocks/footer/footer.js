import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function buildSocialIcons() {
  const icons = [
    { label: 'Facebook', svg: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>' },
    { label: 'X', svg: '<path d="M4 4l6.5 8L4 20h2l5.3-6.5L16 20h4l-6.8-8.3L19.5 4H18l-5 6L8 4H4z"/>' },
    { label: 'Instagram', svg: '<rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.5"/>' },
    { label: 'YouTube', svg: '<path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" fill="none" stroke="currentColor" stroke-width="1.5"/><polygon points="9.75,15.02 15.5,11.75 9.75,8.48" fill="currentColor"/>' },
  ];

  const wrapper = document.createElement('div');
  wrapper.className = 'footer-social';
  icons.forEach(({ label, svg }) => {
    const a = document.createElement('a');
    a.href = '#';
    a.setAttribute('aria-label', label);
    a.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">${svg}</svg>`;
    wrapper.append(a);
  });
  return wrapper;
}

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Structure: section 1 = main footer content, section 2 = copyright
  const sections = [...footer.children];

  const footerMain = document.createElement('div');
  footerMain.className = 'footer-main';

  const footerBottom = document.createElement('div');
  footerBottom.className = 'footer-bottom';

  // First section: logo + links + social/apps
  if (sections[0]) {
    const firstSection = sections[0];

    // Find logo image
    const logo = firstSection.querySelector('picture');
    if (logo) {
      const logoWrapper = document.createElement('div');
      logoWrapper.className = 'footer-logo';
      logoWrapper.append(logo);
      footerMain.append(logoWrapper);
    }

    // Find link lists (ul elements)
    const lists = firstSection.querySelectorAll('ul');
    if (lists.length > 0) {
      const linksWrapper = document.createElement('div');
      linksWrapper.className = 'footer-links';
      lists.forEach((ul) => {
        const col = document.createElement('div');
        col.className = 'footer-links-col';
        col.append(ul.cloneNode(true));
        linksWrapper.append(col);
      });
      footerMain.append(linksWrapper);
    }

    // Social icons + USTA Apps
    const rightCol = document.createElement('div');
    rightCol.className = 'footer-right';
    rightCol.append(buildSocialIcons());

    // Find "USTA APPS" text and app icons
    const allPs = firstSection.querySelectorAll('p');
    let appsStarted = false;
    const appsWrapper = document.createElement('div');
    appsWrapper.className = 'footer-apps';

    allPs.forEach((p) => {
      const text = p.textContent.trim().toUpperCase();
      if (text === 'USTA APPS') {
        appsStarted = true;
        const label = document.createElement('p');
        label.className = 'footer-apps-label';
        label.textContent = 'USTA APPS';
        appsWrapper.append(label);
      } else if (appsStarted && p.querySelector('picture')) {
        const appIcons = document.createElement('div');
        appIcons.className = 'footer-apps-icons';
        p.querySelectorAll('picture').forEach((pic) => appIcons.append(pic.cloneNode(true)));
        appsWrapper.append(appIcons);
      }
    });

    if (appsWrapper.children.length > 0) {
      rightCol.append(appsWrapper);
    }

    footerMain.append(rightCol);
  }

  // Second section or remaining content: copyright
  if (sections[1]) {
    footerBottom.append(sections[1]);
  } else {
    // Fallback copyright
    const copy = document.createElement('p');
    copy.textContent = `© ${new Date().getFullYear()} USTA ALL RIGHTS RESERVED`;
    footerBottom.append(copy);
  }

  block.append(footerMain);
  block.append(footerBottom);
}
