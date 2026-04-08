function isBlockNameRow(row) {
  if (!row || row.children.length !== 1) return false;
  const text = row.children[0].textContent.trim().toLowerCase();
  return text === 'form';
}

/** Unwrap a single nested div wrapper so we see `p` / headings (e.g. default-content-wrapper). */
function flattenCellContent(cell) {
  if (!cell) return [];
  let nodes = [...cell.children];
  for (let depth = 0; depth < 4 && nodes.length === 1 && nodes[0].tagName === 'DIV'; depth += 1) {
    const next = [...nodes[0].children];
    if (next.length === 0) break;
    nodes = next;
  }
  return nodes;
}

/** First line is icon: DA `:heart:` text, icon span, or post–decorateIcons heart img. */
function isHeartIconLine(el) {
  if (!el) return false;
  if (el.querySelector('img[src*="heart"], img[data-icon-name="heart"]')) return true;
  if (el.querySelector('span.icon-heart, span[class*="icon-heart"]')) return true;
  const t = el.textContent.replace(/\s+/g, ' ').trim();
  return t === ':heart:' || /^:heart:$/i.test(t);
}

function extractLegacyTwoColumn(row) {
  const cells = [...row.children];
  const [left, right] = cells;
  const h = left.querySelector('h2, h3, h4, h1');
  let headingNode;
  if (h) {
    headingNode = h.cloneNode(true);
  } else {
    headingNode = document.createElement('h2');
    headingNode.textContent = left.textContent.trim();
  }
  return {
    showIcon: false,
    iconImg: null,
    headingNode,
    subtitleText: right.textContent.trim(),
  };
}

function parseIntroFlow(flow) {
  let i = 0;

  let showIcon = false;
  let iconImg = null;
  if (flow[i] && isHeartIconLine(flow[i])) {
    showIcon = true;
    const existing = flow[i].querySelector('img[src*="heart"], img[data-icon-name="heart"]');
    iconImg = existing ? existing.cloneNode(true) : null;
    i += 1;
  }

  let headingNode = null;
  if (flow[i]) {
    const el = flow[i];
    if (el.matches('h1, h2, h3, h4')) {
      headingNode = el.cloneNode(true);
    } else if (el.matches('p')) {
      const strong = el.querySelector('strong');
      headingNode = document.createElement('h2');
      headingNode.textContent = strong ? strong.textContent.trim() : el.textContent.trim();
    } else {
      headingNode = document.createElement('h2');
      headingNode.textContent = el.textContent.trim();
    }
    i += 1;
  }

  const subtitleParts = [];
  for (; i < flow.length; i += 1) {
    const part = flow[i].textContent.trim();
    if (part) subtitleParts.push(part);
  }

  return {
    showIcon,
    iconImg,
    headingNode,
    subtitleText: subtitleParts.join(' '),
  };
}

/**
 * Reads Document Authoring table rows before the block is cleared.
 * Legacy: one content row, two cells (heading | subtitle), no icon.
 * Current: one or more rows with one cell each — optional :heart: line, heading, subtitle
 * (DA often emits one table row per line). Also unwraps a single wrapper div in each cell.
 */
function extractLeadGenIntro(block) {
  const empty = {
    showIcon: false,
    iconImg: null,
    headingNode: null,
    subtitleText: '',
  };

  const rows = [...block.children];
  if (!rows.length) return empty;

  let r = 0;
  if (r < rows.length && isBlockNameRow(rows[r])) r += 1;
  if (r >= rows.length) return empty;

  const firstContentRow = rows[r];
  const firstCells = [...firstContentRow.children];

  if (firstCells.length >= 2) {
    return extractLegacyTwoColumn(firstContentRow);
  }

  const flow = [];
  while (r < rows.length) {
    const row = rows[r];
    const cells = [...row.children];
    if (cells.length >= 2) break;
    const cell = cells[0];
    if (cell) {
      flow.push(...flattenCellContent(cell));
    }
    r += 1;
  }

  if (!flow.length) return empty;

  return parseIntroFlow(flow);
}

function createHeartImageEl() {
  const img = document.createElement('img');
  img.src = `${window.hlx?.codeBasePath ?? ''}/icons/heart.svg`;
  img.alt = '';
  img.className = 'form-icon-img';
  img.loading = 'lazy';
  return img;
}

export default async function decorate(block) {
  const intro = extractLeadGenIntro(block);

  block.innerHTML = '';

  const headingWrapper = document.createElement('div');
  headingWrapper.className = 'form-heading';

  if (intro.showIcon) {
    const iconWrap = document.createElement('div');
    iconWrap.className = 'form-icon';
    if (intro.iconImg) {
      intro.iconImg.classList.add('form-icon-img');
      if (!intro.iconImg.alt) intro.iconImg.alt = '';
      iconWrap.append(intro.iconImg);
    } else {
      iconWrap.append(createHeartImageEl());
    }
    headingWrapper.append(iconWrap);
  }

  if (intro.headingNode) {
    headingWrapper.append(intro.headingNode);
  }
  if (intro.subtitleText) {
    const sub = document.createElement('p');
    sub.className = 'form-subtitle';
    sub.textContent = intro.subtitleText;
    headingWrapper.append(sub);
  }
  block.append(headingWrapper);

  const form = document.createElement('form');
  form.className = 'form-lead-gen';

  const emailGroup = document.createElement('div');
  emailGroup.className = 'form-field';
  emailGroup.innerHTML = `
    <label for="lead-email"><span class="form-required">*</span>EMAIL</label>
    <input type="email" id="lead-email" name="email" required>
  `;

  const zipGroup = document.createElement('div');
  zipGroup.className = 'form-field';
  zipGroup.innerHTML = `
    <label for="lead-zip"><span class="form-required">*</span>ZIP/POSTAL CODE</label>
    <input type="text" id="lead-zip" name="zipcode" required>
  `;

  const submitWrapper = document.createElement('div');
  submitWrapper.className = 'form-submit';
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = '* MATCH POINT TO YOU';
  submitWrapper.append(submitBtn);

  const inputRow = document.createElement('div');
  inputRow.className = 'form-input-row';
  inputRow.append(emailGroup, zipGroup, submitWrapper);
  form.append(inputRow);

  const terms = document.createElement('p');
  terms.className = 'form-terms';
  terms.innerHTML = '* By clicking <strong>MATCH POINT TO YOU</strong> above, you agree to our '
    + '<a href="/en/home/about-usta/who-we-are/national/usta-terms-of-use">USTA Terms of Use</a> '
    + 'and acknowledge that you have read our '
    + '<a href="/en/home/about-usta/who-we-are/national/usta-privacy-policy">USTA Privacy Policy</a>. '
    + 'You must be 13 years of age or older to subscribe to these communications.';
  form.append(terms);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'SUBMITTING...';

    const payload = {
      data: {
        email: form.querySelector('#lead-email').value,
        zipcode: form.querySelector('#lead-zip').value,
        timestamp: new Date().toISOString(),
      },
    };

    try {
      const resp = await fetch('https://main--ema-usta--adobedevxsc.aem.page/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        btn.textContent = 'THANK YOU!';
      } else {
        throw new Error(`${resp.status}`);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Form submission failed:', err);
      btn.textContent = 'SOMETHING WENT WRONG';
      setTimeout(() => {
        btn.textContent = '* MATCH POINT TO YOU';
        btn.disabled = false;
      }, 3000);
    }
  });

  block.append(form);
}
