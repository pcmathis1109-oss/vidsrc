const lockScreen = document.getElementById('lock-screen');
const contentScreen = document.getElementById('content-screen');
const accessCodeInput = document.getElementById('access-code');
const unlockButton = document.getElementById('unlock-button');
const lockMessage = document.getElementById('lock-message');
const searchQueryInput = document.getElementById('search-query');
const searchButton = document.getElementById('search-button');
const videoResult = document.getElementById('video-result');
const playerContainer = document.getElementById('player-container');

const ACCESS_CODE_SECRET = [77, 97, 116, 104, 105, 115, 49, 49, 48, 57];
const STORAGE_KEY = 'vidsrc_access_granted';
const BLOCK_KEY = 'vidsrc_block_until';
const MAX_ATTEMPTS = 5;
const BLOCK_TIME_MS = 90_000; // 90 secondes après trop d'échecs

const VIDSRC_API_KEY_OBF = '';
function getVidsrcKey() {
  if (!VIDSRC_API_KEY_OBF) {
    return '';
  }
  try {
    return atob(VIDSRC_API_KEY_OBF);
  } catch {
    return '';
  }
}

function showMessage(element, text, type = 'error') {
  element.textContent = text;
  element.className = type ? `message ${type}` : 'message';
}

function codeToArray(code) {
  return Array.from(code.trim()).map((char) => char.charCodeAt(0));
}

function isValidCode(code) {
  const input = codeToArray(code);
  if (input.length !== ACCESS_CODE_SECRET.length) {
    return false;
  }
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
    showMessage(lockMessage, `Trop d'essais. Réessaye dans ${remaining} secondes.`, 'error');
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
  fetchVideo();
}

function extractVidsrcId(input) {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/embed\/movie\/(\d+)/); 
  if (urlMatch) {
    return urlMatch[1];
  }
  const digitsOnly = trimmed.match(/^(\d+)$/);
  if (digitsOnly) {
    return digitsOnly[1];
  }
  return '';
}

function renderPlayer(id) {
  const embedUrl = `https://vidsrc.to/embed/movie/${id}`;
  playerContainer.innerHTML = `
    <div class="iframe-wrapper">
      <iframe src="${embedUrl}" frameborder="0" allowfullscreen allow="autoplay; fullscreen" title="VidSRC Embed"></iframe>
    </div>
  `;
  videoResult.innerHTML = `<p>Lecteur VidSRC chargé pour l'ID ${id}.</p>`;
}

async function fetchVideo(query = '') {
  if (!hasAccess()) {
    renderAccessState();
    return;
  }

  if (!query.trim()) {
    videoResult.innerHTML = '<p class="error">Saisis un ID VidSRC valide ou une URL d’embed.</p>';
    playerContainer.innerHTML = '';
    return;
  }

  const movieId = extractVidsrcId(query);
  if (!movieId) {
    videoResult.innerHTML = '<p class="error">Saisis un ID VidSRC valide ou une URL d’embed.</p>';
    playerContainer.innerHTML = '';
    return;
  }

  renderPlayer(movieId);
}

unlockButton.addEventListener('click', unlock);
searchButton.addEventListener('click', () => {
  const query = searchQueryInput.value;
  fetchVideo(query);
});

document.addEventListener('DOMContentLoaded', () => {
  renderAccessState();
});
