const INDEX_URL = '/en/home/improve/query-index.json';
const PAGE_SIZE = 6;

let allArticles = [];
let filteredArticles = [];
let currentPage = 0;

async function fetchIndex() {
  const resp = await fetch(INDEX_URL);
  const json = await resp.json();
  return json.data || [];
}

function createCard(article) {
  const card = document.createElement('li');
  card.className = 'filter-cards-card';

  if (article.image) {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'filter-cards-card-image';
    const a = document.createElement('a');
    a.href = article.path;
    const img = document.createElement('img');
    img.src = article.image;
    img.alt = article.title;
    img.loading = 'lazy';
    a.appendChild(img);
    imageDiv.appendChild(a);
    card.appendChild(imageDiv);
  }

  const body = document.createElement('div');
  body.className = 'filter-cards-card-body';

  const title = document.createElement('h3');
  const titleLink = document.createElement('a');
  titleLink.href = article.path;
  titleLink.textContent = article.title;
  title.appendChild(titleLink);
  body.appendChild(title);

  if (article.description) {
    const desc = document.createElement('p');
    desc.textContent = article.description;
    body.appendChild(desc);
  }

  const readMore = document.createElement('p');
  const readMoreLink = document.createElement('a');
  readMoreLink.href = article.path;
  readMoreLink.textContent = 'Read More';
  readMoreLink.className = 'filter-cards-read-more';
  readMore.appendChild(readMoreLink);
  body.appendChild(readMore);

  card.appendChild(body);
  return card;
}

function renderCards(block, articles, append = false) {
  let list = block.querySelector('.filter-cards-list');
  if (!list || !append) {
    list = document.createElement('ul');
    list.className = 'filter-cards-list';
    const existing = block.querySelector('.filter-cards-list');
    if (existing) existing.remove();
    block.insertBefore(list, block.querySelector('.filter-cards-more'));
  }

  articles.forEach((article) => {
    list.appendChild(createCard(article));
  });
}

function getPageArticles() {
  const start = currentPage * PAGE_SIZE;
  return filteredArticles.slice(start, start + PAGE_SIZE);
}

function updateMoreButton(block) {
  const btn = block.querySelector('.filter-cards-more');
  const totalShown = (currentPage + 1) * PAGE_SIZE;
  if (totalShown >= filteredArticles.length) {
    btn.style.display = 'none';
  } else {
    btn.style.display = '';
  }
}

function filterArticles(filter) {
  if (!filter) {
    filteredArticles = [...allArticles];
  } else {
    const lowerFilter = filter.toLowerCase();
    filteredArticles = allArticles.filter((a) => {
      const content = (a.content || '').toLowerCase();
      const title = (a.title || '').toLowerCase();
      const tags = (a.tags || '').toLowerCase();
      return content.includes(lowerFilter)
        || title.includes(lowerFilter)
        || tags.includes(lowerFilter);
    });
  }
}

export default async function decorate(block) {
  block.textContent = '';

  const moreBtn = document.createElement('button');
  moreBtn.className = 'filter-cards-more';
  moreBtn.textContent = 'MORE';
  block.appendChild(moreBtn);

  const data = await fetchIndex();
  allArticles = data
    .filter((a) => a.path && a.title && a.path !== window.location.pathname)
    .sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));

  filteredArticles = [...allArticles];
  currentPage = 0;

  renderCards(block, getPageArticles());
  updateMoreButton(block);

  moreBtn.addEventListener('click', () => {
    currentPage += 1;
    renderCards(block, getPageArticles(), true);
    updateMoreButton(block);
  });

  // Listen for filter events from filter-bubble block
  document.addEventListener('filter-change', (e) => {
    const filter = e.detail?.filter || '';
    filterArticles(filter);
    currentPage = 0;
    renderCards(block, getPageArticles());
    updateMoreButton(block);
  });
}
