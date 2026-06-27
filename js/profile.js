// Profile Page Orchestrator (Future-Ready Architecture)
import { Auth } from './auth.js';
import { Premium } from './subscription.js';
import { getHistory, getDownloads, getFavorites } from './storage.js';

export function initProfilePage(currentUser) {
  const avatarLetters = document.getElementById('profile-avatar-letters');
  const userName = document.getElementById('profile-user-name');
  const userEmail = document.getElementById('profile-user-email');
  const statusBadge = document.getElementById('profile-status-badge');
  
  const viewsVal = document.getElementById('stat-views-val');
  const downloadsVal = document.getElementById('stat-downloads-val');
  const favsVal = document.getElementById('stat-favs-val');
  
  const upgradeOffer = document.getElementById('profile-upgrade-offer');
  const activateBtn = document.getElementById('profile-activate-btn');
  const logoutTrigger = document.getElementById('logout-trigger');

  if (!currentUser) return;

  // 1. Fill basic identity
  if (userName) userName.textContent = currentUser.fullName || "Técnico Especialista";
  if (userEmail) userEmail.textContent = currentUser.email || "";
  
  if (avatarLetters) {
    const names = (currentUser.fullName || "TE").split(' ');
    avatarLetters.textContent = names.length > 1 
      ? (names[0][0] + names[1][0]).toUpperCase() 
      : names[0].substring(0, 2).toUpperCase();
  }

  // 2. Fetch & Render statistics from Storage
  const historyCount = getHistory().length;
  const downloadsCount = getDownloads().length;
  const favoritesCount = getFavorites().length;

  if (viewsVal) viewsVal.textContent = historyCount;
  if (downloadsVal) downloadsVal.textContent = downloadsCount;
  if (favsVal) favsVal.textContent = favoritesCount;

  // 3. Subscription Status updates
  const isPremium = Premium.check();
  if (statusBadge) {
    if (isPremium) {
      statusBadge.textContent = "Parceiro Técnico PRO";
      statusBadge.className = "profile-badge premium-active";
      // Inject styled badge color
      Object.assign(statusBadge.style, {
        backgroundColor: 'rgba(255, 102, 0, 0.15)',
        color: 'var(--accent-color)',
        border: '1px solid rgba(255,102,0,0.3)',
        fontWeight: '800'
      });
    } else {
      statusBadge.textContent = "Membro Gratuito";
      statusBadge.className = "profile-badge";
      Object.assign(statusBadge.style, {
        backgroundColor: 'var(--border-color)',
        color: 'var(--text-muted)',
        border: 'none',
        fontWeight: '500'
      });
    }
  }

  // Show promotional upgrade container for non-premium accounts
  if (upgradeOffer) {
    upgradeOffer.style.display = isPremium ? 'none' : 'block';
  }

  // Redirect to premium purchase flows
  if (activateBtn) {
    activateBtn.addEventListener('click', () => {
      window.location.href = 'premium.html';
    });
  }

  // Bind logout execution
  if (logoutTrigger) {
    logoutTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.logout();
    });
  }
}
