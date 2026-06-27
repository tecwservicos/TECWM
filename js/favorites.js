// Favorites Page Orchestrator (Future-Ready Architecture)
import { Database } from './api.js';
import { Manual } from './manuals.js';
import { getFavorites, addToHistory } from './storage.js';
import { renderManualCards, showManualDetailDrawer } from './ui.js';

export async function initFavoritesPage(currentUser) {
  const gridContainer = document.getElementById('favorites-results-grid');
  const emptyStateContainer = document.getElementById('favorites-empty-state');
  
  if (!gridContainer) return;
  
  const refreshFavorites = async () => {
    const favoriteIds = getFavorites();
    
    if (favoriteIds.length === 0) {
      gridContainer.style.display = 'none';
      if (emptyStateContainer) emptyStateContainer.style.display = 'flex';
      return;
    }
    
    if (emptyStateContainer) emptyStateContainer.style.display = 'none';
    gridContainer.style.display = 'grid';
    
    // Load matching manuals
    const allManuals = await Database.getManuals();
    const favoritedManuals = allManuals.filter(m => favoriteIds.includes(m.id));
    
    const onCardClick = (manual) => {
      showManualDetailDrawer(manual, currentUser, (selected) => {
        addToHistory(selected.id, selected.title, selected.model, selected.coverImage, selected.brand, selected.category, 5);
        Manual.open(selected.id);
      }, refreshFavorites);
    };
    
    renderManualCards(favoritedManuals, gridContainer, onCardClick);
  };
  
  // First load
  await refreshFavorites();
}
