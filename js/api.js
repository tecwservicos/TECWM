// Database Abstraction Layer (Future Firestore Ready)
import { CONFIG } from './config.js';
import { 
  UserService, 
  ManualService, 
  FavoriteService, 
  CategoryService, 
  BrandService 
} from './services.js';
import { getCurrentUser } from './storage.js';

export const Database = {
  /**
   * Retrieve all manuals, combining static catalog from manuals.json with local user uploads
   */
  async getManuals() {
    return await ManualService.getAll();
  },

  /**
   * Retrieve a single manual by its ID
   */
  async getManualById(manualId) {
    return await ManualService.get(manualId);
  },

  /**
   * Retrieve all categories
   */
  async getCategories() {
    const list = await CategoryService.getAll();
    // Maintain backwards compatibility with legacy properties
    return list.map(c => ({
      id: c.id,
      name: c.nome,
      icon: c.icone,
      imagem: c.imagem
    }));
  },

  /**
   * Retrieve all available brands
   */
  async getBrands() {
    const list = await BrandService.getAll();
    return list.map(b => b.nome);
  },

  /**
   * Get current authenticated user details from local store or cloud auth
   */
  async getUser() {
    const localUser = getCurrentUser();
    if (!localUser) return null;
    return await UserService.get(localUser.uid || localUser.email);
  },

  /**
   * Toggle manual favorite state and sync with local/cloud database
   */
  async saveFavorite(manualId) {
    const localUser = getCurrentUser();
    if (!localUser) {
      // Offline fallback toggle
      const { toggleFavorite } = await import('./storage.js');
      return toggleFavorite(manualId);
    }

    const uid = localUser.uid || localUser.email;
    const isFav = await FavoriteService.isFavorite(uid, manualId);
    if (isFav) {
      await FavoriteService.remove(uid, manualId);
      return false;
    } else {
      await FavoriteService.add(uid, manualId);
      return true;
    }
  }
};

