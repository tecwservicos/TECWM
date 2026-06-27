// Manuals Logic and Access Controller (Future-Ready Architecture)
import { Database } from './api.js';
import { Premium } from './subscription.js';
import { saveCustomManual, deleteCustomManual } from './storage.js';

export const Manual = {
  /**
   * Central gatekeeper for technical manual access.
   * Checks if manual is premium, verifies active subscriptions or ad-based temporary unlocks,
   * then routes appropriately.
   */
  async open(manualId) {
    const manual = await Database.getManualById(manualId);
    if (!manual) {
      console.error(`[Manual Service] Manual ID ${manualId} not found in database.`);
      return;
    }

    if (manual.premium) {
      const isPro = Premium.check();
      const isAdUnlocked = Premium.isUnlockedByAd(manualId);

      if (!isPro && !isAdUnlocked) {
        console.log(`[Manual Service] Access locked for manual ${manualId}. Redirecting to Premium upgrade.`);
        // Redirect to premium.html with manualId reference so they can unlock it
        window.location.href = `premium.html?id=${manualId}`;
        return;
      }
    }

    // Access granted! Redirect to the dedicated PDF viewer component
    window.location.href = `manual.html?id=${manualId}`;
  },

  /**
   * Client-side search and filtering system
   */
  async searchAndFilter(query = '', categoryId = 'all', brandName = 'all') {
    const allList = await Database.getManuals();
    
    return allList.filter(m => {
      // 1. Text Search matching title, model, description or keywords
      const matchesQuery = query === '' || 
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.model.toLowerCase().includes(query.toLowerCase()) ||
        m.description.toLowerCase().includes(query.toLowerCase()) ||
        (m.keywords && m.keywords.some(k => k.toLowerCase().includes(query.toLowerCase())));
        
      // 2. Category Check
      let matchesCategory = true;
      if (categoryId !== 'all') {
        const categoryMapping = {
          'hvac': 'Air Conditioners',
          'refrig': 'Refrigerators',
          'washer': 'Washing Machines',
          'dryer': 'Dryers',
          'microwave': 'Microwaves',
          'compressor': 'Compressors',
          'electronics': 'Electronics',
          'tools': 'Tools'
        };
        const expectedName = categoryMapping[categoryId];
        matchesCategory = m.category === expectedName || m.category === categoryId;
      }
      
      // 3. Brand Check
      const matchesBrand = brandName === 'all' || m.brand.toLowerCase() === brandName.toLowerCase();
      
      return matchesQuery && matchesCategory && matchesBrand;
    });
  },

  /**
   * Register a custom technician manual (LocalStorage fallback / future Firestore Storage upload)
   */
  async addCustom(manualData) {
    const id = 'custom_' + Date.now();
    const newManual = {
      id,
      title: manualData.title,
      brand: manualData.brand,
      model: manualData.model,
      category: manualData.category,
      description: manualData.description || "Manual técnico adicionado pelo usuário.",
      coverImage: manualData.coverImage || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600",
      pdfUrl: manualData.pdfUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      premium: manualData.premium === true || manualData.premium === 'true',
      views: 1,
      downloads: 0,
      favorites: 0,
      createdAt: new Date().toISOString(),
      pages: parseInt(manualData.pages || 12, 10),
      fileSize: manualData.fileSize || "4.5 MB",
      compatibleEquipment: manualData.compatibleEquipment || [manualData.model],
      publicationDate: new Date().toISOString().split('T')[0]
    };
    
    saveCustomManual(newManual);
    return newManual;
  },

  /**
   * Delete a registered custom manual
   */
  async delete(id) {
    if (id.startsWith('custom_')) {
      deleteCustomManual(id);
      return true;
    }
    return false;
  }
};

// Export backward compatible legacy named bindings
export const getManuals = () => Database.getManuals();
export const getManualById = (id) => Database.getManualById(id);
export const getCategories = () => Database.getCategories();
export const getBrands = () => Database.getBrands();
export const searchAndFilter = (q, c, b) => Manual.searchAndFilter(q, c, b);
export const addCustomManual = (data) => Manual.addCustom(data);
export const deleteManual = (id) => Manual.delete(id);
