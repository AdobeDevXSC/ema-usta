/**
 * Player Profile block – renders hero image with section title overlay on the
 * left and a green profile / safe-play panel on the right.
 *
 * Static content authored in the block:
 *   Row 1, Cell 1 – hero background picture
 *   Row 1, Cell 2 – "Help Keep Tennis Safe!" heading, icon list, CTA link list
 *
 * Dynamic content (injected by a separate personalisation layer later):
 *   - Section name  → .player-profile-section-name
 *   - Greeting      → .player-profile-greeting
 *   - Gender        → .player-profile-gender
 *   - Location line → .player-profile-location
 *   - USTA number   → .player-profile-usta-number-value
 */

function buildAvatarIcons() {
  const wrap = document.createElement('div');
  wrap.className = 'player-profile-avatar-icons';
  const base = window.hlx?.codeBasePath ?? '';
  for (let i = 0; i < 3; i += 1) {
    const img = document.createElement('img');
    img.src = `${base}/icons/player-avatar.svg`;
    img.alt = '';
    img.className = 'player-profile-avatar-icon';
    img.loading = 'lazy';
    wrap.append(img);
  }
  return wrap;
}

function buildWelcomeBar() {
  const bar = document.createElement('div');
  bar.className = 'player-profile-welcome-bar';

  const left = document.createElement('div');
  left.className = 'player-profile-welcome-left';

  const greeting = document.createElement('h2');
  greeting.className = 'player-profile-greeting';
  greeting.textContent = 'Welcome, [Player Name]!';

  const profileBtn = document.createElement('a');
  profileBtn.className = 'player-profile-btn player-profile-btn--dark';
  profileBtn.href = '#';
  profileBtn.textContent = 'MY PROFILE';

  left.append(greeting, profileBtn);

  const right = document.createElement('div');
  right.className = 'player-profile-welcome-right';

  right.append(buildAvatarIcons());

  const manageRoles = document.createElement('a');
  manageRoles.className = 'player-profile-manage-roles';
  manageRoles.href = '#';
  manageRoles.textContent = 'Manage Roles';
  right.append(manageRoles);

  bar.append(left, right);
  return bar;
}

function buildUserMeta() {
  const meta = document.createElement('div');
  meta.className = 'player-profile-user-meta';

  const gender = document.createElement('p');
  gender.className = 'player-profile-gender';
  gender.textContent = '[Gender]';

  const location = document.createElement('p');
  location.className = 'player-profile-location';
  location.innerHTML = '<strong>Section:</strong> [USTA Section] | <strong>District:</strong> [USTA District] |<br><strong>Nationality:</strong> [Nationality]';

  const ustaRow = document.createElement('p');
  ustaRow.className = 'player-profile-usta-number';
  ustaRow.innerHTML = '<strong>USTA Number:</strong><br><span class="player-profile-usta-number-value">[Player User ID]</span>';

  meta.append(gender, location, ustaRow);
  return meta;
}

function buildCoursesGrid(ul) {
  const grid = document.createElement('ul');
  grid.className = 'player-profile-courses-grid';

  [...ul.querySelectorAll('li')].forEach((li) => {
    const img = li.querySelector('img');
    const label = [...li.querySelectorAll('p')].find((p) => !p.querySelector('img'));
    const item = document.createElement('li');
    item.className = 'player-profile-course-item';

    const iconWrap = document.createElement('div');
    iconWrap.className = 'player-profile-course-icon';
    if (img) {
      const cloned = img.cloneNode(true);
      cloned.removeAttribute('width');
      cloned.removeAttribute('height');
      iconWrap.append(cloned);
    }

    const text = document.createElement('span');
    text.className = 'player-profile-course-label';
    text.textContent = label ? label.textContent.trim() : '';

    item.append(iconWrap, text);
    grid.append(item);
  });

  return grid;
}

function buildActions(ul) {
  const wrap = document.createElement('div');
  wrap.className = 'player-profile-actions';

  const links = [...ul.querySelectorAll('a')];

  const topRow = document.createElement('div');
  topRow.className = 'player-profile-actions-row';

  const bottomRow = document.createElement('div');
  bottomRow.className = 'player-profile-actions-row player-profile-actions-row--center';

  links.forEach((a, i) => {
    const btn = document.createElement('a');
    btn.className = 'player-profile-btn player-profile-btn--dark';
    btn.href = a.href;
    btn.textContent = a.textContent.trim();
    if (i < 2) topRow.append(btn);
    else bottomRow.append(btn);
  });

  if (topRow.children.length) wrap.append(topRow);
  if (bottomRow.children.length) wrap.append(bottomRow);

  return wrap;
}

export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;

  const [imageCell, contentCell] = [...row.children];

  /* ── Left panel ─────────────────────────────────────────────────── */
  const imagePanel = document.createElement('div');
  imagePanel.className = 'player-profile-image-panel';

  const picture = imageCell?.querySelector('picture');
  if (picture) imagePanel.append(picture);

  const titleOverlay = document.createElement('div');
  titleOverlay.className = 'player-profile-section-overlay';

  const titleHeading = document.createElement('h1');
  titleHeading.className = 'player-profile-section-title';
  const titleSpan = document.createElement('span');
  titleSpan.className = 'player-profile-section-name';
  titleSpan.textContent = '[USTA Section]';
  titleHeading.append(document.createTextNode('Tennis Players in '), titleSpan);
  titleOverlay.append(titleHeading);
  imagePanel.append(titleOverlay);

  /* ── Right panel ────────────────────────────────────────────────── */
  const contentPanel = document.createElement('div');
  contentPanel.className = 'player-profile-content-panel';

  contentPanel.append(buildWelcomeBar());
  contentPanel.append(buildUserMeta());

  if (contentCell) {
    const safePlayed = document.createElement('div');
    safePlayed.className = 'player-profile-safe-play';

    const heading = contentCell.querySelector('h3, h2');
    if (heading) {
      const h = heading.cloneNode(true);
      safePlayed.append(h);
    }

    const [coursesUl, actionsUl] = [...contentCell.querySelectorAll('ul')];
    if (coursesUl) safePlayed.append(buildCoursesGrid(coursesUl));
    if (actionsUl) safePlayed.append(buildActions(actionsUl));

    contentPanel.append(safePlayed);
  }

  block.innerHTML = '';
  block.append(imagePanel, contentPanel);
}
