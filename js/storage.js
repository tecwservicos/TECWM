// Storage Helper for Tec W Manuais (Static Edition)

export const StorageKeys = {
  THEME: 'tecw_theme',
  USER: 'tecw_logged_user',
  FAVORITES: 'tecw_favorites',
  HISTORY: 'tecw_history',
  DOWNLOADS: 'tecw_downloads',
  CUSTOM_MANUALS: 'tecw_custom_manuals',
  USERS_LIST: 'tecw_registered_users'
};

// Theme Preference
export function getTheme() {
  return localStorage.getItem(StorageKeys.THEME) || 'dark';
}

export function setTheme(theme) {
  localStorage.setItem(StorageKeys.THEME, theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }
}

// User Profile & Authentication States
export function getCurrentUser() {
  const userJson = localStorage.getItem(StorageKeys.USER);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(StorageKeys.USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(StorageKeys.USER);
  }
}

export function getRegisteredUsers() {
  const users = localStorage.getItem(StorageKeys.USERS_LIST);
  if (!users) return [];
  try {
    return JSON.parse(users);
  } catch (e) {
    return [];
  }
}

export function saveRegisteredUser(user) {
  const users = getRegisteredUsers();
  users.push(user);
  localStorage.setItem(StorageKeys.USERS_LIST, JSON.stringify(users));
}

// Favorites System
export function getFavorites() {
  const favs = localStorage.getItem(StorageKeys.FAVORITES);
  if (!favs) return [];
  try {
    return JSON.parse(favs);
  } catch (e) {
    return [];
  }
}

export function isFavorite(manualId) {
  return getFavorites().includes(manualId);
}

export function toggleFavorite(manualId) {
  let favs = getFavorites();
  if (favs.includes(manualId)) {
    favs = favs.filter(id => id !== manualId);
  } else {
    favs.push(manualId);
  }
  localStorage.setItem(StorageKeys.FAVORITES, JSON.stringify(favs));
  return favs.includes(manualId);
}

// Reading & Click History
export function getHistory() {
  const hist = localStorage.getItem(StorageKeys.HISTORY);
  if (!hist) return [];
  try {
    return JSON.parse(hist);
  } catch (e) {
    return [];
  }
}

export function addToHistory(manualId, title, model, coverImage, brand, category, progress = 0) {
  let hist = getHistory();
  // Remove duplicate entry if exists
  hist = hist.filter(item => item.manualId !== manualId);
  // Add new entry on top
  hist.unshift({
    manualId,
    title,
    model,
    coverImage,
    brand,
    category,
    progress,
    timestamp: new Date().toISOString()
  });
  // Cap history at 15 items
  if (hist.length > 15) hist.pop();
  localStorage.setItem(StorageKeys.HISTORY, JSON.stringify(hist));
}

// Download Tracking
export function getDownloads() {
  const dls = localStorage.getItem(StorageKeys.DOWNLOADS);
  if (!dls) return [];
  try {
    return JSON.parse(dls);
  } catch (e) {
    return [];
  }
}

export function isDownloaded(manualId) {
  return getDownloads().includes(manualId);
}

export function addDownload(manualId) {
  const dls = getDownloads();
  if (!dls.includes(manualId)) {
    dls.push(manualId);
    localStorage.setItem(StorageKeys.DOWNLOADS, JSON.stringify(dls));
  }
}

// Custom manual creation/updates (Technician features)
export function getCustomManuals() {
  const customs = localStorage.getItem(StorageKeys.CUSTOM_MANUALS);
  if (!customs) return [];
  try {
    return JSON.parse(customs);
  } catch (e) {
    return [];
  }
}

export function saveCustomManual(manual) {
  const customs = getCustomManuals();
  const existingIdx = customs.findIndex(m => m.id === manual.id);
  if (existingIdx >= 0) {
    customs[existingIdx] = manual;
  } else {
    customs.unshift(manual);
  }
  localStorage.setItem(StorageKeys.CUSTOM_MANUALS, JSON.stringify(customs));
}

export function deleteCustomManual(manualId) {
  let customs = getCustomManuals();
  customs = customs.filter(m => m.id !== manualId);
  localStorage.setItem(StorageKeys.CUSTOM_MANUALS, JSON.stringify(customs));
}
