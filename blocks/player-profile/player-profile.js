/**
 * Player Profile block – renders hero image with section title overlay on the
 * left and a green profile / safe-play panel on the right.
 *
 * Static content authored in the block:
 *   Row 1, Cell 1 – hero background picture
 *   Row 1, Cell 2 – "Help Keep Tennis Safe!" heading, icon list, CTA link list
 *
 * Dynamic content injected from USTA API:
 *   GET https://services.usta.com/v1/customers/me/player/profile/extended
 */

async function fetchPlayerProfile() {
  // In production this token would come from your auth layer (e.g. window.adobeIMS, a cookie parser, etc.)
  const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlJ5OExDbF9iVFhQcDVHUTJZUDlFMSJ9.eyJ1YWlkIjoiMjAyMDMzMTI5NiIsImV2ZW50LnN0YXRzIjp7ImxvZ2luc19jb3VudCI6NX0sImlzX3NvY2lhbCI6ZmFsc2UsImN1c3RvbWVyX3Byb2ZpbGUiOlsiemlwIiwiZmlyc3ROYW1lIiwibGFzdE5hbWUiLCJhZGRyZXNzIiwiZ2VuZGVyIiwibmF0aW9uYWxpdHkiLCJkYXRlT2ZCaXJ0aCIsImN1c3RvbWVyUm9sZSIsImVtYWlsIl0sInNlc3Npb25fY3JlYXRlZF9hdCI6IjE5OTktMTItMzFUMjI6MDA6MDAuMDAwWiIsImlzcyI6Imh0dHBzOi8vYWNjb3VudC51c3RhLmNvbS8iLCJzdWIiOiJhdXRoMHw2OTlmM2FlZmY5NjdjZGExZjhlOTRiNzciLCJhdWQiOlsidXN0YSIsImh0dHBzOi8vdXN0YS1kaWdpdGFsLXByb2QudXMuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTc3NzA3Mjk2OCwiZXhwIjoxNzc3MTU5MzY4LCJzY29wZSI6Im9wZW5pZCBlbWFpbCBvZmZsaW5lX2FjY2VzcyIsImF6cCI6IkhFWFZCYXk0OXRmNGU4a0Vrc1hxRENjUk5yVWp4VE0xIiwicGVybWlzc2lvbnMiOlsiYXBpLWFjY291bnQvY2FsbGJhY2sudXJsOnJlYWQiLCJhcGktY29nbml0by1hZG1pbi9jYWxsYmFjay51cmw6cmVhZCIsImFwaS1jb21tZXJjZS9vcmRlcjpyZWFkX3VwZGF0ZSIsImFwaS1jb21tZXJjZS9wYXltZW50OnBlcmZvcm0iLCJhcGktY29tbWVyY2UvcGF5bWVudDpyZWFkIiwiYXBpLWNvbW1vbi9yZWZlcmVuY2UuZGF0YTpyZWFkIiwiYXBpLWN1c3RvbWVyL2N1c3RvbWVyOmNyZWF0ZSIsImFwaS1jdXN0b21lci9jdXN0b21lci5tZW1iZXJzaGlwLmZhbWlseTpyZWFkIiwiYXBpLWN1c3RvbWVyL2N1c3RvbWVyLnByb2dyYW06bWFuYWdlIiwiYXBpLWN1c3RvbWVyL2N1c3RvbWVyOnJlYWQiLCJhcGktY3VzdG9tZXIvY3VzdG9tZXI6dXBkYXRlIiwiYXBpLWN1c3RvbWVyL2dob3N0OmRlbGV0ZSIsImFwaS1jdXN0b21lci9pZGVudGl0eTp1cGRhdGUiLCJhcGktY3VzdG9tZXIvcGxheWVyOnJlYWQiLCJhcGktY3VzdG9tZXIvcGxheWVyOnVuYm91bmQ6cmVhZCIsImFwaS1jdXN0b21lci9wbGF5ZXI6dXBkYXRlIiwiYXBpLWN1c3RvbWVyL3BsYXloaXN0b3J5OnJlYWQiLCJhcGktY3VzdG9tZXIvcGxheWhpc3Rvcnk6cmVhZF91bmJvdW5kIiwiYXBpLWN1c3RvbWVyL3Byb3ZpZGVyOnJlYWQiLCJhcGktY3VzdG9tZXIvc2NoZWR1bGU6cmVhZCIsImFwaS1jdXN0b21lci9zY2hlZHVsZTpyZWFkX3VuYm91bmQiLCJhcGktY3VzdG9tZXIvc3VzcGVuc2lvbjpyZWFkIiwiYXBpLWZhY2lsaXR5L2ZhY2lsaXR5OmNyZWF0ZSIsImFwaS1mYWNpbGl0eS9mYWNpbGl0eTpyZWFkX3VuYm91bmQiLCJhcGktb3JnYW5pemF0aW9uL29yZ2FuaXphdGlvbjpjcmVhdGVfdXBkYXRlIiwiYXBpLW9yZ2FuaXphdGlvbi9vcmdhbml6YXRpb246cmVhZCIsImFwaS1wcm9ncmFtL3Byb2dyYW06Y3JlYXRlX3VuYm91bmQiLCJhcGktcHJvZ3JhbS9wcm9ncmFtOmRlbGV0ZV91bmJvdW5kIiwiYXBpLXByb2dyYW0vcHJvZ3JhbTpyZWFkX3VuYm91bmQiLCJhcGktcHJvZ3JhbS9wcm9ncmFtOnVwZGF0ZV91bmJvdW5kIiwiYXBpLXJhbmtpbmdzL3Jhbmtpbmc6cmVhZCIsImFwaS1yYW5raW5ncy9yYW5raW5nOnJlYWRfdW5ib3VuZCIsImFwaS1yYXRpbmdzL2NvYWNoOnJlYWRfdXBkYXRlIiwiYXBpLXJhdGluZ3MvY29tcGV0aXRpb246dXBkYXRlIiwiYXBpLXNhZmVzcG9ydC9jb3Vyc2V3b3JrOnJlYWQiLCJhcGktc2FmZXNwb3J0L2NvdXJzZXdvcms6d3JpdGUiLCJhcGktdXNwdHIvcHRyOnJlYWRfdXBkYXRlIl19.XBvxEL2JPsy5GZKHgtQXYhXztSfvn6sGjCJ3U2v7w_IskcHbU8aOXxDqVKIFVVH7wmzoYgZvzAOenUAr1RqDSASr_CzCoAyRbFC8xuKbLLEb6YVZwPdDzZJ1nXzGtk51DWlbHPM9tkCzAF4A3ZsMhnqmrXKE6copkOLQANvhNGjFXRqKoZVhamErQ5v_v8WnNbVRzPAWkY3fvOiFFpVbZc8B6jOGXzB0jQHaZz3i4cTKBO8TKwDbwfhlkMMeDtclJUg5Ajo70TI-z20Ie-kSQUVZJ1vLR5qDZFWTn2OiZ0fgt24BuwEzpefe7sylu1nfrMN2Xek0jF8SjiY_6Q5kIw'; // your full token here

  try {
    const response = await fetch('https://services.usta.com/v1/customers/me/player/profile/extended', {
      method: 'GET',
      headers: {
        Accept: '*/*',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Authorization: `Bearer ${token}`,
      },
      // No credentials: 'include' — that caused the CORS preflight failure
    });

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function populateProfile(block, profile) {
  if (!profile) return;

  const { firstName, gender, residencyDeclaration, uaid } = profile;
  const { section, district, countryIso } = residencyDeclaration ?? {};

  const greet = block.querySelector('.player-profile-greeting');
  if (greet && firstName) greet.textContent = `Welcome, ${firstName}!`;

  const sectionName = block.querySelector('.player-profile-section-name');
  if (sectionName && section) sectionName.textContent = section;

  const genderEl = block.querySelector('.player-profile-gender');
  if (genderEl && gender) genderEl.textContent = gender;

  const locationEl = block.querySelector('.player-profile-location');
  if (locationEl) {
    locationEl.innerHTML = `<strong>Section:</strong> ${section ?? '[USTA Section]'} | <strong>District:</strong> ${district ?? '[USTA District]'} |<br><strong>Nationality:</strong> ${countryIso ?? '[Nationality]'}`;
  }

  const ustaNum = block.querySelector('.player-profile-usta-number-value');
  if (ustaNum && uaid) ustaNum.textContent = uaid;
}

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

export default async function decorate(block) {
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

  /* ── Fetch & populate ───────────────────────────────────────────── */
  const profile = await fetchPlayerProfile();
  populateProfile(block, profile);
}
