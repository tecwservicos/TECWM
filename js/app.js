// Central Coordinator for Tec W Manuais (Static Edition)
import { 
  getTheme, 
  setTheme, 
  getCurrentUser, 
  getHistory, 
  getDownloads, 
  getFavorites, 
  addToHistory 
} from './storage.js';
import { 
  checkAuthAndRedirect, 
  checkGuestState, 
  logout, 
  simulateGoogleSignIn, 
  login, 
  register, 
  forgotPassword,
  Auth
} from './auth.js';
import { 
  Manual,
  getManuals, 
  getCategories, 
  getBrands, 
  searchAndFilter, 
  addCustomManual 
} from './manuals.js';
import { 
  renderManualCards, 
  showManualDetailDrawer, 
  showPremiumUpgradeModal, 
  showUploadManualModal, 
  showToast 
} from './ui.js';
import { Premium } from './subscription.js';
import { initSearchPage } from './search.js';
import { initFavoritesPage } from './favorites.js';
import { initProfilePage } from './profile.js';
import { initPremiumPage } from './premium.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Theme Sync
  const savedTheme = getTheme();
  setTheme(savedTheme);
  
  // 2. Identify Page
  const body = document.body;
  const pageId = body.getAttribute('data-page');
  
  if (!pageId) return;
  
  // 3. Guest/Auth Gate checks
  let currentUser = null;
  const authProtectedPages = ['home', 'search', 'manual', 'favorites', 'profile', 'settings'];
  const guestPages = ['login', 'register', 'index', 'premium'];
  
  if (authProtectedPages.includes(pageId)) {
    currentUser = checkAuthAndRedirect();
    if (!currentUser) return; // redirected
    setupHeaderAndBottomBar(pageId, currentUser);
  } else if (guestPages.includes(pageId)) {
    // If logged in, don't block premium page, but block auth pages
    if (pageId !== 'index' && pageId !== 'premium') {
      checkGuestState();
    } else {
      currentUser = getCurrentUser();
      setupHeaderAndBottomBar(pageId, currentUser);
    }
  }
  
  // 4. Page Specific Initializations
  switch (pageId) {
    case 'login':
      initLoginPage();
      break;
    case 'register':
      initRegisterPage();
      break;
    case 'home':
      await initHomePage(currentUser);
      break;
    case 'search':
      await initSearchPage(currentUser);
      break;
    case 'favorites':
      await initFavoritesPage(currentUser);
      break;
    case 'profile':
      initProfilePage(currentUser);
      break;
    case 'premium':
      await initPremiumPage(currentUser);
      break;
    case 'settings':
      initSettingsPage(currentUser);
      break;
    case 'manual':
      await initManualViewerPage(currentUser);
      break;
  }
});

// Setup sticky headers and highlight the active bottom bar navigation items
function setupHeaderAndBottomBar(pageId, currentUser) {
  // Bind standard logout triggers
  const logoutBtn = document.getElementById('logout-trigger');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
  
  // Display current user details on header if container exists
  const headerUserSpan = document.getElementById('header-user-name');
  if (headerUserSpan) {
    if (currentUser) {
      headerUserSpan.textContent = (currentUser.fullName || "T").split(' ')[0][0].toUpperCase();
    } else {
      headerUserSpan.textContent = "G";
    }
  }
  
  // Update subscription badge using the uniform Premium.check() method
  const subscriptionBadge = document.getElementById('header-sub-badge');
  if (subscriptionBadge) {
    const isPro = Premium.check();
    if (isPro) {
      subscriptionBadge.textContent = 'PRO';
      subscriptionBadge.style.backgroundColor = 'var(--accent-color)';
    } else {
      subscriptionBadge.textContent = 'FREE';
      subscriptionBadge.style.backgroundColor = 'var(--primary-transparent)';
    }
  }
  
  // Highlight Active Bottom Nav Icons
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const targetPage = item.getAttribute('data-target');
    if (targetPage === pageId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
    
    // Bind redirection logic
    item.addEventListener('click', () => {
      window.location.href = `${targetPage}.html`;
    });
  });
}

// Login Page Logic
function initLoginPage() {
  const form = document.getElementById('login-form');
  const googleBtn = document.getElementById('btn-google-login');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;
      
      const result = login(email, pass);
      if (result.success) {
        showToast("Seja bem-vindo de volta!", "success");
        setTimeout(() => {
          window.location.href = 'home.html';
        }, 800);
      } else {
        showToast(result.message, "error");
      }
    });
  }
  
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      const result = simulateGoogleSignIn();
      if (result.success) {
        showToast("Login com Google efetuado com sucesso!", "success");
        setTimeout(() => {
          window.location.href = 'home.html';
        }, 800);
      }
    });
  }
}

// Register Page Logic
function initRegisterPage() {
  const form = document.getElementById('register-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const pass = document.getElementById('reg-password').value;
      const conf = document.getElementById('reg-confirm').value;
      
      const result = register(name, email, pass, conf);
      if (result.success) {
        showToast("Sua conta foi criada com sucesso!", "success");
        setTimeout(() => {
          window.location.href = 'home.html';
        }, 800);
      } else {
        showToast(result.message, "error");
      }
    });
  }
}

// Home Page Logic
async function initHomePage(currentUser) {
  const popularContainer = document.getElementById('popular-manuals-grid');
  const historyContainer = document.getElementById('recent-history-grid');
  const emptyHistory = document.getElementById('empty-history-state');
  const premiumBanner = document.getElementById('premium-hero-banner');
  const uploadBtn = document.getElementById('fab-upload-manual');
  
  // Render Premium Upgrade Banner if not active
  const isPremiumUser = Premium.check();
  if (premiumBanner) {
    if (isPremiumUser) {
      premiumBanner.style.display = 'none';
    } else {
      premiumBanner.style.display = 'block';
      const upgradeBtn = document.getElementById('banner-upgrade-btn');
      if (upgradeBtn) {
        upgradeBtn.addEventListener('click', () => {
          window.location.href = 'premium.html';
        });
      }
    }
  }
  
  // Load Manual list
  const manuals = await getManuals();
  
  // Handler for opening manuals through the unified Manual gatekeeper
  const onCardClick = (m) => {
    showManualDetailDrawer(m, currentUser, (selectedManual) => {
      addToHistory(selectedManual.id, selectedManual.title, selectedManual.model, selectedManual.coverImage, selectedManual.brand, selectedManual.category, 10);
      Manual.open(selectedManual.id);
    }, () => {
      loadHistory();
    });
  };
  
  // Render Popular items (max 6 items)
  renderManualCards(manuals.slice(0, 6), popularContainer, onCardClick);
  
  // Load History items
  const loadHistory = () => {
    const historyList = getHistory();
    if (historyList.length === 0) {
      if (emptyHistory) emptyHistory.style.display = 'block';
      if (historyContainer) historyContainer.style.display = 'none';
    } else {
      if (emptyHistory) emptyHistory.style.display = 'none';
      if (historyContainer) {
        historyContainer.style.display = 'grid';
        historyContainer.innerHTML = '';
        
        historyList.slice(0, 3).forEach(hist => {
          const item = document.createElement('div');
          item.className = 'history-item';
          Object.assign(item.style, {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            cursor: 'pointer'
          });
          
          item.innerHTML = `
            <img src="${hist.coverImage}" style="width: 44px; height: 56px; object-fit: cover; border-radius: 8px;" />
            <div style="flex: 1; min-width: 0;">
              <span style="font-size: 0.625rem; font-weight: 800; color: var(--primary-light); text-transform: uppercase;">${hist.brand}</span>
              <h4 style="font-size: 0.8125rem; font-weight: 700; color: var(--text-color); margin: 0.15rem 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${hist.title}</h4>
              <p style="font-size: 0.6875rem; color: var(--text-muted);">Progresso: ${hist.progress}%</p>
            </div>
            <span class="material-icons-outlined" style="font-size: 1.125rem; color: var(--primary-light);">play_arrow</span>
          `;
          
          item.addEventListener('click', () => {
            Manual.open(hist.manualId);
          });
          
          historyContainer.appendChild(item);
        });
      }
    }
  };
  
  loadHistory();
  
  // Custom manual add trigger
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      showUploadManualModal(async (formData) => {
        const added = await addCustomManual(formData);
        showToast("Parabéns! Manual técnico cadastrado e indexado com sucesso!", "success");
        // Reload cards
        const refreshed = await getManuals();
        renderManualCards(refreshed.slice(0, 6), popularContainer, onCardClick);
      });
    });
  }
}

// Settings Page Logic
function initSettingsPage(currentUser) {
  const themeToggle = document.getElementById('settings-theme-toggle');
  if (themeToggle) {
    themeToggle.checked = getTheme() === 'dark';
    themeToggle.addEventListener('change', (e) => {
      const mode = e.target.checked ? 'dark' : 'light';
      setTheme(mode);
      showToast(mode === 'dark' ? "Modo Noturno ativado" : "Modo Claro ativado");
    });
  }
  
  // Show active storage counts
  const countFavs = document.getElementById('set-count-favs');
  const countDls = document.getElementById('set-count-downloads');
  if (countFavs) countFavs.textContent = `${getFavorites().length} salvos`;
  if (countDls) countDls.textContent = `${getDownloads().length} arquivos`;
}

// PDF Viewer page Logic
async function initManualViewerPage(currentUser) {
  const urlParams = new URLSearchParams(window.location.search);
  const manualId = urlParams.get('id');
  
  if (!manualId) {
    window.location.href = 'home.html';
    return;
  }
  
  const manualsList = await getManuals();
  const manual = manualsList.find(m => m.id === manualId);
  if (!manual) {
    window.location.href = 'home.html';
    return;
  }
  
  const viewerTitle = document.getElementById('viewer-title');
  const modelSub = document.getElementById('viewer-model-subtitle');
  const pdfMock = document.getElementById('embedded-pdf-canvas');
  const bookmarkBtn = document.getElementById('btn-bookmark-pdf');
  const premiumOverlay = document.getElementById('reader-premium-gate');
  const exitBtn = document.getElementById('btn-exit-reader');
  
  if (viewerTitle) viewerTitle.textContent = manual.title;
  if (modelSub) modelSub.textContent = `Marca: ${manual.brand} | Modelo: ${manual.model}`;
  
  // Premium Gate Block Integration
  const isPro = Premium.check();
  const isAdUnlocked = Premium.isUnlockedByAd(manualId);
  
  if (manual.premium && !isPro && !isAdUnlocked) {
    if (premiumOverlay) {
      premiumOverlay.style.display = 'flex';
      const buyBtn = document.getElementById('reader-activate-premium-btn');
      if (buyBtn) {
        buyBtn.addEventListener('click', () => {
          window.location.href = `premium.html?id=${manualId}`;
        });
      }
    }
  } else {
    if (premiumOverlay) premiumOverlay.style.display = 'none';
    loadPdfMockPage(manual, pdfMock);
  }
  
  // Back button trigger
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      window.location.href = 'home.html';
    });
  }
  
  // Bookmarking inside PDF
  let isBookmarked = getFavorites().includes(manual.id);
  const updateBookmarkStyle = () => {
    if (bookmarkBtn) {
      if (isBookmarked) {
        bookmarkBtn.style.color = 'var(--accent-color)';
        bookmarkBtn.innerHTML = '<span class="material-icons-outlined" style="color: var(--accent-color); font-size: 1.125rem;">bookmark</span>';
      } else {
        bookmarkBtn.style.color = 'inherit';
        bookmarkBtn.innerHTML = '<span class="material-icons-outlined" style="font-size: 1.125rem;">bookmark_border</span>';
      }
    }
  };
  
  updateBookmarkStyle();
  if (bookmarkBtn) {
    bookmarkBtn.addEventListener('click', () => {
      isBookmarked = !isBookmarked;
      const favList = getFavorites();
      let updatedFavs;
      if (isBookmarked) {
        updatedFavs = [...favList, manual.id];
        showToast("Página marcada! Manual adicionado aos seus favoritos.");
      } else {
        updatedFavs = favList.filter(id => id !== manual.id);
        showToast("Marcador removido.");
      }
      localStorage.setItem('tecw_favorites', JSON.stringify(updatedFavs));
      updateBookmarkStyle();
    });
  }
}

// Generate elegant Vector schemas dynamically in browser mock canvas
function loadPdfMockPage(manual, canvasContainer) {
  if (!canvasContainer) return;
  
  const isDark = getTheme() === 'dark';
  canvasContainer.innerHTML = `
    <div class="pdf-page-mockup ${isDark ? 'dark-pdf' : ''}">
      <div style="border-bottom: 2px solid var(--primary-light); padding-bottom: 1rem;">
        <span style="font-size: 0.6875rem; font-family: var(--font-mono); text-transform: uppercase; color: var(--primary-light); font-weight: 700;">Esquema Técnico Oficial</span>
        <h2 style="font-size: 1.125rem; font-family: var(--font-display); font-weight: 800; margin-top: 0.25rem;">Diagrama de Conectividade Elétrica e Sensores</h2>
      </div>
      
      <!-- High-end Technical SVG diagram representing actual motherboard circuitry -->
      <div style="flex: 1; border: 1px dashed var(--border-color); border-radius: 12px; display: flex; align-items: center; justify-content: center; position: relative; padding: 1rem; overflow: hidden; background-color: rgba(255, 255, 255, 0.02);">
        <svg viewBox="0 0 400 250" style="width: 100%; height: 100%; max-height: 240px;">
          <!-- Motherboard borders -->
          <rect x="10" y="10" width="380" height="230" rx="8" fill="none" stroke="${isDark ? '#3A3A4A' : '#D1D5DB'}" stroke-width="2" stroke-dasharray="4"/>
          <!-- CPU chip -->
          <rect x="160" y="80" width="80" height="80" rx="4" fill="${isDark ? '#2E2E38' : '#F1F3F5'}" stroke="var(--primary-light)" stroke-width="2" />
          <text x="200" y="125" fill="${isDark ? '#E5E7EB' : '#374151'}" font-family="monospace" font-size="9" text-anchor="middle" font-weight="bold">TEC-W MCU</text>
          
          <!-- Connector Rails -->
          <line x1="40" y1="50" x2="160" y2="100" stroke="#FF6600" stroke-width="1.5" />
          <circle cx="40" cy="50" r="4" fill="#FF6600" />
          <text x="35" y="40" fill="${isDark ? '#9CA3AF' : '#6B7280'}" font-family="monospace" font-size="7">SENSOR TEMP (CN1)</text>
 
          <line x1="40" y1="180" x2="160" y2="140" stroke="#1D5CFF" stroke-width="1.5" />
          <circle cx="40" cy="180" r="4" fill="#1D5CFF" />
          <text x="35" y="195" fill="${isDark ? '#9CA3AF' : '#6B7280'}" font-family="monospace" font-size="7">DISPLAY PANEL (CN2)</text>
 
          <line x1="360" y1="120" x2="240" y2="120" stroke="#2B8A3E" stroke-width="1.5" />
          <circle cx="360" cy="120" r="4" fill="#2B8A3E" />
          <text x="365" y="115" fill="${isDark ? '#9CA3AF' : '#6B7280'}" font-family="monospace" font-size="7">COMPRESSOR RELAY</text>
        </svg>
      </div>
 
      <!-- Specs details inside reader -->
      <div style="font-size: 0.75rem; line-height: 1.6; display: flex; flex-direction: column; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
        <p style="font-weight: 700; color: var(--text-color);">Roteiro de Autoteste de Cargas:</p>
        <p style="color: var(--text-muted);">1. Pressione a tecla autoteste por 3 segundos para acionar relé de degelo.<br>
        2. Certifique-se que a resistência dissipe calor e verifique tensão de 127V/220V AC nas saídas principais.</p>
      </div>
      
      <span class="pdf-page-num">Pág. 1 de ${manual.pages}</span>
    </div>
  `;
}
