import { getCustomManuals, saveCustomManual, deleteCustomManual } from './storage.js';

let cachedManuals = [];
let cachedCategories = [];
let cachedBrands = [];

// Load default catalogs from JSON
async function loadStaticData() {
  if (cachedManuals.length === 0) {
    try {
      const response = await fetch('data/manuals.json');
      cachedManuals = await response.json();
    } catch (e) {
      console.warn("Failed to load manuals.json directly. Falling back to default lists.", e);
      // Fallback inside client
      cachedManuals = [];
    }
  }
  
  if (cachedCategories.length === 0) {
    try {
      const response = await fetch('data/categories.json');
      cachedCategories = await response.json();
    } catch (e) {
      console.warn("Failed to load categories.json directly. Fallback active.");
      cachedCategories = [
        { "id": "all", "name": "Todos", "icon": "description" },
        { "id": "hvac", "name": "Ar Condicionado", "icon": "ac_unit" },
        { "id": "refrig", "name": "Geladeiras", "icon": "kitchen" },
        { "id": "washer", "name": "Lava e Seca", "icon": "local_laundry_service" }
      ];
    }
  }

  if (cachedBrands.length === 0) {
    try {
      const response = await fetch('data/brands.json');
      cachedBrands = await response.json();
    } catch (e) {
      cachedBrands = ["Brastemp", "Consul", "Electrolux", "Samsung", "LG", "Daikin"];
    }
  }
}

// Get unified list of manuals (JSON + Custom local)
export async function getManuals() {
  await loadStaticData();
  const customList = getCustomManuals();
  return [...customList, ...cachedManuals];
}

export async function getManualById(id) {
  const allList = await getManuals();
  return allList.find(m => m.id === id);
}

export async function getCategories() {
  await loadStaticData();
  return cachedCategories;
}

export async function getBrands() {
  await loadStaticData();
  return cachedBrands;
}

// Client-side search and filtering system
export async function searchAndFilter(query = '', categoryId = 'all', brandName = 'all') {
  const allList = await getManuals();
  
  return allList.filter(m => {
    // 1. Text Search matching title, model, description or keywords
    const matchesQuery = query === '' || 
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.model.toLowerCase().includes(query.toLowerCase()) ||
      m.description.toLowerCase().includes(query.toLowerCase()) ||
      (m.keywords && m.keywords.some(k => k.toLowerCase().includes(query.toLowerCase())));
      
    // 2. Category Check
    // Convert categories display to match correctly
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
}

// Add/Upload a custom manual (Technician feature)
export async function addCustomManual(manualData) {
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
    premium: manualData.premium || false,
    views: 1,
    downloads: 0,
    favorites: 0,
    createdAt: new Date().toISOString(),
    pages: manualData.pages || 12,
    fileSize: manualData.fileSize || "4.5 MB",
    compatibleEquipment: manualData.compatibleEquipment || [manualData.model],
    publicationDate: new Date().toISOString().split('T')[0]
  };
  
  saveCustomManual(newManual);
  return newManual;
}

// Delete custom manual
export async function deleteManual(id) {
  if (id.startsWith('custom_')) {
    deleteCustomManual(id);
    return true;
  }
  return false;
}
