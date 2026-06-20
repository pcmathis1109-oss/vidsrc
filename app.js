// DOM Elements
const lockScreen = document.getElementById('lock-screen');
const contentScreen = document.getElementById('content-screen');
const accessCodeInput = document.getElementById('access-code');
const unlockButton = document.getElementById('unlock-button');
const lockMessage = document.getElementById('lock-message');
const contentTypeSelect = document.getElementById('content-type');
const searchControls = document.getElementById('search-controls');
const listControls = document.getElementById('list-controls');
const searchQueryInput = document.getElementById('search-query');
const searchButton = document.getElementById('search-button');
const loadListButton = document.getElementById('load-list-button');
const paginationControls = document.getElementById('pagination-controls');
const pageInfo = document.getElementById('page-info');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const statusMessage = document.getElementById('status-message');
const contentList = document.getElementById('content-list');
const listItems = document.getElementById('list-items');
const playerContainer = document.getElementById('player-container');

const ACCESS_CODE_SECRET = [77, 97, 116, 104, 105, 115, 49, 49, 48, 57];
const STORAGE_KEY = 'vidsrc_access_granted';
const BLOCK_KEY = 'vidsrc_block_until';
const MAX_ATTEMPTS = 5;
const BLOCK_TIME_MS = 90_000;

let currentPage = 1;
let currentContentType = 'search';
let cachedList = [];

function showMessage(element, text, type = 'error') {
  element.textContent = text;
  element.className = type ? 'message ' + type : 'message';
}

function codeToArray(code) {
  return Array.from(code.trim()).map((char) => char.charCodeAt(0));
}

function isValidCode(code) {
  const input = codeToArray(code);
  if (input.length !== ACCESS_CODE_SECRET.length) return false;
  return input.every((value, index) => value === ACCESS_CODE_SECRET[index]);
}

function getBlockUntil() {
  return Number(localStorage.getItem(BLOCK_KEY) || '0');
}

function isBlocked() {
  return Date.now() < getBlockUntil();
}

function recordFailure() {
  const count = Number(localStorage.getItem('vidsrc_failed_attempts') || '0') + 1;
  localStorage.setItem('vidsrc_failed_attempts', String(count));
  if (count >= MAX_ATTEMPTS) {
    localStorage.setItem(BLOCK_KEY, String(Date.now() + BLOCK_TIME_MS));
    localStorage.setItem('vidsrc_failed_attempts', '0');
  }
}

function clearFailures() {
  localStorage.removeItem('vidsrc_failed_attempts');
  localStorage.removeItem(BLOCK_KEY);
}

function setAccess() {
  localStorage.setItem(STORAGE_KEY, 'true');
}

function hasAccess() {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

function renderAccessState() {
  if (hasAccess()) {
    lockScreen.classList.add('hidden');
    contentScreen.classList.remove('hidden');
    return true;
  }
  lockScreen.classList.remove('hidden');
  contentScreen.classList.add('hidden');
  return false;
}

function unlock() {
  if (isBlocked()) {
    const remaining = Math.ceil((getBlockUntil() - Date.now()) / 1000);
    showMessage(lockMessage, 'Trop d''essais. Réessaye dans ' + remaining + ' secondes.', 'error');
    return;
  }

  const code = accessCodeInput.value;
  if (!code) {
    showMessage(lockMessage, 'Veuillez saisir le code.', 'error');
    return;
  }

  if (!isValidCode(code)) {
    recordFailure();
    showMessage(lockMessage, 'Code invalide. Essaie encore.', 'error');
    return;
  }

  clearFailures();
  setAccess();
  renderAccessState();
}

function updateControlsVisibility() {
  currentContentType = contentTypeSelect.value;
  currentPage = 1;
  playerContainer.classList.add('hidden');
  contentList.classList.add('hidden');
  paginationControls.classList.add('hidden');
  statusMessage.textContent = '';
  cachedList = [];

  if (currentContentType === 'search') {
    searchControls.classList.remove('hidden');
    listControls.classList.add('hidden');
  } else {
    searchControls.classList.add('hidden');
    listControls.classList.remove('hidden');
  }
}

function extractVidsrcId(input) {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/embed\/(movie|tv)\/(\d+)/);
  if (urlMatch) {
    return { type: urlMatch[1], id: urlMatch[2] };
  }
  const digitsOnly = trimmed.match(/^(\d+)$'/);
  if (digitsOnly) {
    return { type: currentContentType === 'tv' ? 'tv' : 'movie', id: digitsOnly[1] };
  }
  return null;
}

function renderPlayer(type, id) {
  const embedUrl = 'https://vidsrc.to/embed/' + type + '/' + id;
  playerContainer.innerHTML = '<div class=\"iframe-wrapper\"><iframe src=\"' + embedUrl + '\" frameborder=\"0\" allowfullscreen allow=\"autoplay; fullscreen\" title=\"VidSRC Embed\"><' + '/iframe></div>';
  playerContainer.classList.remove('hidden');
  contentList.classList.add('hidden');
  statusMessage.textContent = '';
}

async function fetchList(page = 1) {
  if (!hasAccess()) {
    renderAccessState();
    return;
  }

  let endpoint = '';
  if (currentContentType === 'movies') {
    endpoint = 'https://vidsrc.to/api/v1/movie/new?page=' + page;
  } else if (currentContentType === 'tv') {
    endpoint = 'https://vidsrc.to/api/v1/tv/new?page=' + page;
  } else if (currentContentType === 'episodes') {
    endpoint = 'https://vidsrc.to/api/v1/episode/new?page=' + page;
  }

  if (!endpoint) return;

  try {
    showMessage(statusMessage, 'Chargement...', 'info');
    const response = await fetch(endpoint);
    if (!response.ok) {
      showMessage(statusMessage, 'Erreur API: ' + response.status, 'error');
      return;
    }

    const data = await response.json();
    cachedList = data.results || [];
    currentPage = page;
    updatePageInfo();
    renderList();
    showMessage(statusMessage, '', '');
  } catch (error) {
    showMessage(statusMessage, 'Erreur: ' + error.message, 'error');
  }
}

function renderList() {
  if (!cachedList || cachedList.length === 0) {
    showMessage(statusMessage, 'Aucun résultat.', 'error');
    contentList.classList.add('hidden');
    return;
  }

  listItems.innerHTML = '';
  cachedList.forEach((item) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'list-item';
    
    const id = item.id || item.imdbID || item.tmdbID || '';
    const title = item.title || item.name || item.tv_name || 'Sans titre';
    const poster = item.poster || item.image || '';
    
    itemEl.innerHTML = '<div class=\"item-content\">' + (poster ? '<img src=\"' + poster + '\" alt=\"' + title + '\" class=\"item-poster\">' : '') + '<div class=\"item-info\"><h3>' + title + '<' + '/h3><p>ID: ' + id + '<' + '/p><button class=\"item-button\" data-id=\"' + id + '\" data-type=\"' + currentContentType + '\">Regarder<' + '/button><' + '/div><' + '/div>';
    
    const btn = itemEl.querySelector('.item-button');
    btn.addEventListener('click', () => {
      const type = currentContentType === 'episodes' ? 'episode' : currentContentType === 'tv' ? 'tv' : 'movie';
      renderPlayer(type, id);
    });
    
    listItems.appendChild(itemEl);
  });

  contentList.classList.remove('hidden');
  paginationControls.classList.remove('hidden');
}

function updatePageInfo() {
  pageInfo.textContent = 'Page ' + currentPage;
}

unlockButton.addEventListener('click', unlock);
contentTypeSelect.addEventListener('change', updateControlsVisibility);

searchButton.addEventListener('click', () => {
  const query = searchQueryInput.value;
  if (!query.trim()) {
    showMessage(statusMessage, 'Entrez un ID ou une URL.', 'error');
    return;
  }

  const parsed = extractVidsrcId(query);
  if (!parsed) {
    showMessage(statusMessage, 'ID ou URL invalide.', 'error');
    return;
  }

  renderPlayer(parsed.type, parsed.id);
});

loadListButton.addEventListener('click', () => {
  fetchList(1);
});

prevPageButton.addEventListener('click', () => {
  if (currentPage > 1) {
    fetchList(currentPage - 1);
  }
});

nextPageButton.addEventListener('click', () => {
  fetchList(currentPage + 1);
});

document.addEventListener('DOMContentLoaded', () => {
  renderAccessState();
  updateControlsVisibility();
});
