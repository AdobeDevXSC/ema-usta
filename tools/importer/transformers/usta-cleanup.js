/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: USTA site cleanup. Selectors from captured DOM of usta.com.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove popups/modals and error dialogs (from captured DOM: .cmp-experiencefragment--usta-en-popups-xf, #systemErrorModal)
    WebImporter.DOMUtils.remove(element, [
      '.cmp-experiencefragment--usta-en-popups-xf',
      '#systemErrorModal',
      '#usntA42Toggle',
      '.skip-to-main-content-link',
      '.pageLanguage',
      '.securePage',
    ]);
  }

  if (hookName === H.after) {
    // Remove header/navigation (from captured DOM: .cmp-experiencefragment--usta-en-header-ef, nav.top-navigation)
    // Remove footer (from captured DOM: .cmp-experiencefragment--usta-en-footer-ef)
    // Remove banners, iframes, links, noscript
    WebImporter.DOMUtils.remove(element, [
      '.cmp-experiencefragment--usta-en-header-ef',
      '.cmp-experiencefragment--usta-en-footer-ef',
      'nav.top-navigation',
      '.v-banner',
      'iframe',
      'link',
      'noscript',
      '.sr-only',
      '#top-of-page',
    ]);

    // Remove tracking/event attributes
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-track');
      el.removeAttribute('data-cmp-data-layer');
    });
  }
}
