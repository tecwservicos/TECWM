// Search Page Orchestrator (Future-Ready Architecture)
import { Database } from './api.js';
import { Manual } from './manuals.js';
import { renderManualCards, showManualDetailDrawer } from './ui.js';
import { addToHistory } from './storage.js';

export async function initSearchPage(currentUser) {
  const gridContainer = document.getElementById('search-results-grid');
  const searchInput = document.getElementById('search-input');
  const categoryContainer = document.getElementById('categories-chips-wrapper');
  const brandSelect = document.getElementById('brand-filter-select');
  const resultCounter = document.getElementById('result-count-indicator');
  
  if (!gridContainer) return;
  
  let activeCategory = 'all';
  let activeBrand = 'all';
  let query = '';
  
  // Populate brands dropdown
  const brands = await Database.getBrands();
  if (brandSelect) {
    brandSelect.innerHTML = '<option value="all">Todas as Marcas</option>';
    brands.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.toLowerCase();
      opt.textContent = b;
      brandSelect.appendChild(opt);
    });
  }
  
  // Trigger on card clicks
  const onCardClick = (manual) => {
    showManualDetailDrawer(manual, currentUser, (selected) => {
      // Add to reading history
      addToHistory(selected.id, selected.title, selected.model, selected.coverImage, selected.brand, selected.category, 5);
      // Let Manual access gatekeeper decide
      Manual.open(selected.id);
    }, runFilter);
  };
  
  // Dynamic filter runner
  const runFilter = async () => {
    if (resultCounter) {
      resultCounter.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted);">
          <div class="skeleton-spinner" style="width: 14px; height: 14px; border: 2px solid var(--border-color); border-top-color: var(--primary-light); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
          <span>Buscando esquemas...</span>
        </div>
      `;
    }
    
    const results = await Manual.searchAndFilter(query, activeCategory, activeBrand);
    
    if (resultCounter) {
      resultCounter.textContent = `${results.length} manuais técnicos encontrados`;
    }
    renderManualCards(results, gridContainer, onCardClick);
  };
  
  // Generate category chips dynamically
  const categories = await Database.getCategories();
  if (categoryContainer) {
    categoryContainer.innerHTML = '';
    categories.forEach(cat => {
      const chip = document.createElement('button');
      chip.className = `category-chip ${cat.id === activeCategory ? 'active' : ''}`;
      chip.innerHTML = `
        <span style="font-size: 1.125rem;" class="material-icons-outlined">${cat.icon}</span>
        <span>${cat.name}</span>
      `;
      
      chip.addEventListener('click', () => {
        document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCategory = cat.id;
        runFilter();
      });
      
      categoryContainer.appendChild(chip);
    });
  }
  
  // Bind live listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      query = e.target.value;
      runFilter();
    });
  }
  
  if (brandSelect) {
    brandSelect.addEventListener('change', (e) => {
      activeBrand = e.target.value;
      runFilter();
    });
  }
  
  // Perform first run
  await runFilter();
}
