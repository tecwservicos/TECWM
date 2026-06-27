// Data Abstraction & Service Layer for Firebase Firestore
import { CONFIG } from './config.js';
import * as Storage from './storage.js';

// Global reference variables for lazy-loaded Firebase instances
let app = null;
let db = null;
let auth = null;

// Reusable Firestore error types helper
export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

/**
 * Handle Firestore operational errors with required system context logging
 */
export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('[Firestore Service Error]:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Lazy initializer for Firebase Firestore and Authentication
 */
export async function getFirebaseServices() {
  if (!CONFIG.firebaseEnabled) {
    return { enabled: false, db: null, auth: null };
  }

  if (db && auth) {
    return { enabled: true, db, auth };
  }

  try {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    const { getAuth } = await import('firebase/auth');

    let firebaseConfig = null;
    try {
      const response = await fetch('/firebase-applet-config.json');
      if (response.ok) {
        firebaseConfig = await response.json();
      }
    } catch (e) {
      console.warn("[Firebase Service] Could not fetch firebase-applet-config.json, trying fallback.");
    }

    if (!firebaseConfig || !firebaseConfig.apiKey) {
      throw new Error("Firebase configuration is missing. Please check your config parameters.");
    }

    if (!app) {
      app = initializeApp(firebaseConfig);
    }
    db = getFirestore(app);
    auth = getAuth(app);

    return { enabled: true, db, auth };
  } catch (error) {
    console.warn("[Firebase Service] Initializer failed. Operating in offline/fallback mode.", error);
    return { enabled: false, db: null, auth: null, error: error.message };
  }
}

// ==========================================
// 1. USER SERVICE
// ==========================================
export class UserService {
  /**
   * Fetch a single user profile document
   */
  static async get(uid) {
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { doc, getDoc } = await import('firebase/firestore');
      const path = `users/${uid}`;
      try {
        const docSnap = await getDoc(doc(services.db, "users", uid));
        return docSnap.exists() ? docSnap.data() : null;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    }

    // Fallback Local Storage
    const list = Storage.getRegisteredUsers();
    return list.find(u => u.uid === uid || u.email === uid) || null;
  }

  /**
   * Create a new user profile document
   */
  static async create(uid, nome, email, premium = false, subscriptionId = null) {
    const userData = {
      uid,
      nome,
      email,
      premium,
      subscriptionId,
      createdAt: new Date().toISOString() // will use serverTimestamp on real firestore
    };

    const services = await getFirebaseServices();
    if (services.enabled) {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const path = `users/${uid}`;
      try {
        const payload = { ...userData, createdAt: serverTimestamp() };
        await setDoc(doc(services.db, "users", uid), payload);
        return userData;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }

    // Fallback Local Storage
    const list = Storage.getRegisteredUsers();
    if (!list.some(u => u.uid === uid || u.email === email)) {
      list.push(userData);
      localStorage.setItem(Storage.StorageKeys.USERS_LIST, JSON.stringify(list));
    }
    return userData;
  }

  /**
   * Update profile fields (e.g., license status, premium)
   */
  static async update(uid, partialData) {
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { doc, updateDoc } = await import('firebase/firestore');
      const path = `users/${uid}`;
      try {
        await updateDoc(doc(services.db, "users", uid), partialData);
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    }

    // Fallback Local Storage
    const list = Storage.getRegisteredUsers();
    const idx = list.findIndex(u => u.uid === uid || u.email === uid);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...partialData };
      localStorage.setItem(Storage.StorageKeys.USERS_LIST, JSON.stringify(list));
      
      // Also sync currently logged user
      const current = Storage.getCurrentUser();
      if (current && (current.uid === uid || current.email === uid)) {
        Storage.setCurrentUser({ ...current, ...partialData });
      }
      return true;
    }
    return false;
  }

  /**
   * Delete a user profile
   */
  static async delete(uid) {
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const path = `users/${uid}`;
      try {
        await deleteDoc(doc(services.db, "users", uid));
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }

    // Fallback Local Storage
    const list = Storage.getRegisteredUsers();
    const filtered = list.filter(u => u.uid !== uid && u.email !== uid);
    localStorage.setItem(Storage.StorageKeys.USERS_LIST, JSON.stringify(filtered));
    return true;
  }
}

// ==========================================
// 2. MANUAL SERVICE
// ==========================================
export class ManualService {
  /**
   * Retrieve all catalogs (combining pre-sets with uploaded items)
   */
  static async getAll() {
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { collection, getDocs } = await import('firebase/firestore');
      const path = 'manuals';
      try {
        const querySnapshot = await getDocs(collection(services.db, "manuals"));
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }

    // Fallback local mock combining static JSON and custom user uploads
    try {
      const response = await fetch('/data/manuals.json');
      const localData = response.ok ? await response.json() : [];
      // Translate fields from Portuguese compatibility to English mapping if necessary
      const parsedLocal = localData.map(m => ({
        id: m.id,
        titulo: m.title || m.titulo,
        marca: m.brand || m.marca,
        modelo: m.model || m.modelo,
        categoria: m.category || m.categoria,
        descricao: m.description || m.descricao || "Manual técnico de campo.",
        imagem: m.coverImage || m.imagem,
        pdf: m.pdfUrl || m.pdf,
        premium: m.premium === true,
        downloads: m.downloads || 0,
        views: m.views || 0,
        keywords: m.keywords || [m.brand, m.model],
        paginas: m.pages || m.paginas || 10,
        tamanhoArquivo: parseFloat(m.fileSize) || m.tamanhoArquivo || 2.4,
        createdAt: m.createdAt || new Date().toISOString(),
        updatedAt: m.updatedAt || new Date().toISOString()
      }));

      const customs = Storage.getCustomManuals().map(m => ({
        id: m.id,
        titulo: m.title || m.titulo,
        marca: m.brand || m.marca,
        modelo: m.model || m.modelo,
        categoria: m.category || m.categoria,
        descricao: m.description || m.descricao,
        imagem: m.coverImage || m.imagem,
        pdf: m.pdfUrl || m.pdf,
        premium: m.premium === true,
        downloads: m.downloads || 0,
        views: m.views || 0,
        keywords: m.keywords || [],
        paginas: m.pages || m.paginas || 12,
        tamanhoArquivo: m.tamanhoArquivo || 4.5,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt || m.createdAt
      }));

      return [...customs, ...parsedLocal];
    } catch (error) {
      console.warn("[ManualService] Failed loading local json. Returning customs.", error);
      return Storage.getCustomManuals();
    }
  }

  /**
   * Fetch specific manual details
   */
  static async get(id) {
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { doc, getDoc } = await import('firebase/firestore');
      const path = `manuals/${id}`;
      try {
        const docSnap = await getDoc(doc(services.db, "manuals", id));
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    }

    const list = await this.getAll();
    return list.find(m => m.id === id) || null;
  }

  /**
   * Register or upload a manual
   */
  static async create(manualData) {
    const id = manualData.id || 'custom_' + Date.now();
    const record = {
      id,
      titulo: manualData.titulo || manualData.title,
      marca: manualData.marca || manualData.brand,
      modelo: manualData.modelo || manualData.model,
      categoria: manualData.categoria || manualData.category,
      descricao: manualData.descricao || manualData.description || "Manual técnico de placas de circuito.",
      imagem: manualData.imagem || manualData.coverImage || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600",
      pdf: manualData.pdf || manualData.pdfUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      premium: manualData.premium === true,
      downloads: parseInt(manualData.downloads || 0, 10),
      views: parseInt(manualData.views || 1, 10),
      keywords: manualData.keywords || [manualData.marca || manualData.brand],
      paginas: parseInt(manualData.paginas || manualData.pages || 12, 10),
      tamanhoArquivo: parseFloat(manualData.tamanhoArquivo || 3.5),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const services = await getFirebaseServices();
    if (services.enabled) {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const path = `manuals/${id}`;
      try {
        const payload = { 
          ...record, 
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(doc(services.db, "manuals", id), payload);
        return record;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }

    // Fallback Local Storage custom listing
    const legacyRecord = {
      id: record.id,
      title: record.titulo,
      brand: record.marca,
      model: record.modelo,
      category: record.categoria,
      description: record.descricao,
      coverImage: record.imagem,
      pdfUrl: record.pdf,
      premium: record.premium,
      downloads: record.downloads,
      views: record.views,
      createdAt: record.createdAt,
      pages: record.paginas,
      fileSize: `${record.tamanhoArquivo} MB`
    };
    Storage.saveCustomManual(legacyRecord);
    return record;
  }

  /**
   * Update fields (e.g. view counter increments, metadata updates)
   */
  static async update(id, partialData) {
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const path = `manuals/${id}`;
      try {
        const payload = { ...partialData, updatedAt: serverTimestamp() };
        await updateDoc(doc(services.db, "manuals", id), payload);
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    }

    // Fallback Local Storage customs updates
    const customs = Storage.getCustomManuals();
    const idx = customs.findIndex(m => m.id === id);
    if (idx !== -1) {
      const current = customs[idx];
      // Convert mapping
      const updated = {
        ...current,
        title: partialData.titulo !== undefined ? partialData.titulo : current.title,
        brand: partialData.marca !== undefined ? partialData.marca : current.brand,
        model: partialData.modelo !== undefined ? partialData.modelo : current.model,
        category: partialData.categoria !== undefined ? partialData.categoria : current.category,
        description: partialData.descricao !== undefined ? partialData.descricao : current.description,
        coverImage: partialData.imagem !== undefined ? partialData.imagem : current.coverImage,
        pdfUrl: partialData.pdf !== undefined ? partialData.pdf : current.pdfUrl,
        premium: partialData.premium !== undefined ? partialData.premium : current.premium,
        downloads: partialData.downloads !== undefined ? partialData.downloads : current.downloads,
        views: partialData.views !== undefined ? partialData.views : current.views
      };
      customs[idx] = updated;
      localStorage.setItem(Storage.StorageKeys.CUSTOM_MANUALS, JSON.stringify(customs));
      return true;
    }
    return false;
  }

  /**
   * Delete custom manual
   */
  static async delete(id) {
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const path = `manuals/${id}`;
      try {
        await deleteDoc(doc(services.db, "manuals", id));
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }

    if (id.startsWith('custom_')) {
      Storage.deleteCustomManual(id);
      return true;
    }
    return false;
  }
}

// ==========================================
// 3. FAVORITE SERVICE
// ==========================================
export class FavoriteService {
  /**
   * Get all favorite bookmarks for a user
   */
  static async getAll(uid) {
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const path = 'favorites';
      try {
        const q = query(collection(services.db, "favorites"), where("uid", "==", uid));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => d.data().manualId);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }

    return Storage.getFavorites();
  }

  /**
   * Add a favorite association
   */
  static async add(uid, manualId) {
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const path = 'favorites';
      try {
        await addDoc(collection(services.db, "favorites"), {
          uid,
          manualId,
          createdAt: serverTimestamp()
        });
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }

    let favs = Storage.getFavorites();
    if (!favs.includes(manualId)) {
      favs.push(manualId);
      localStorage.setItem(Storage.StorageKeys.FAVORITES, JSON.stringify(favs));
    }
    return true;
  }

  /**
   * Remove a favorite association
   */
  static async remove(uid, manualId) {
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { collection, getDocs, deleteDoc, doc, query, where } = await import('firebase/firestore');
      const path = 'favorites';
      try {
        const q = query(collection(services.db, "favorites"), where("uid", "==", uid), where("manualId", "==", manualId));
        const snapshot = await getDocs(q);
        const deletions = snapshot.docs.map(d => deleteDoc(doc(services.db, "favorites", d.id)));
        await Promise.all(deletions);
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }

    let favs = Storage.getFavorites();
    favs = favs.filter(id => id !== manualId);
    localStorage.setItem(Storage.StorageKeys.FAVORITES, JSON.stringify(favs));
    return true;
  }

  /**
   * Fast check if a manual is favorited
   */
  static async isFavorite(uid, manualId) {
    const favs = await this.getAll(uid);
    return favs.includes(manualId);
  }
}

// ==========================================
// 4. HISTORY SERVICE
// ==========================================
export class HistoryService {
  /**
   * Get all access timeline logs for a user
   */
  static async getAll(uid) {
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
      const path = 'history';
      try {
        const q = query(collection(services.db, "history"), where("uid", "==", uid), orderBy("openedAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }

    return Storage.getHistory().map(h => ({
      uid,
      manualId: h.manualId,
      openedAt: h.timestamp,
      lastPage: h.progress,
      readingTime: 45 // mock reading time in sec
    }));
  }

  /**
   * Add or update an access timeline log
   */
  static async addOrUpdate(uid, manualId, lastPage = 0, readingTime = 30) {
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { collection, getDocs, doc, setDoc, addDoc, query, where, serverTimestamp } = await import('firebase/firestore');
      const path = 'history';
      try {
        // Find existing record to overwrite/update
        const q = query(collection(services.db, "history"), where("uid", "==", uid), where("manualId", "==", manualId));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const docId = snapshot.docs[0].id;
          await setDoc(doc(services.db, "history", docId), {
            lastPage,
            readingTime,
            openedAt: serverTimestamp()
          }, { merge: true });
        } else {
          await addDoc(collection(services.db, "history"), {
            uid,
            manualId,
            openedAt: serverTimestamp(),
            lastPage,
            readingTime
          });
        }
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }

    // Local Storage mapping
    // Retrieve manual details for proper legacy storage format
    const manualsList = await ManualService.getAll();
    const m = manualsList.find(x => x.id === manualId);
    if (m) {
      Storage.addToHistory(m.id, m.titulo, m.modelo, m.imagem, m.marca, m.categoria, lastPage);
    }
    return true;
  }
}

// ==========================================
// 5. DOWNLOAD SERVICE
// ==========================================
export class DownloadService {
  /**
   * Get downloaded manuals list
   */
  static async getAll(uid) {
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const path = 'downloads';
      try {
        const q = query(collection(services.db, "downloads"), where("uid", "==", uid));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => d.data().manualId);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }

    return Storage.getDownloads();
  }

  /**
   * Add a download log tracking event
   */
  static async add(uid, manualId, device = 'Web Browser') {
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const path = 'downloads';
      try {
        await addDoc(collection(services.db, "downloads"), {
          uid,
          manualId,
          downloadedAt: serverTimestamp(),
          device
        });
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }

    Storage.addDownload(manualId);
    return true;
  }

  /**
   * Quick validation check
   */
  static async isDownloaded(uid, manualId) {
    const downloads = await this.getAll(uid);
    return downloads.includes(manualId);
  }
}

// ==========================================
// 6. AD REWARDED UNLOCKS SERVICE
// ==========================================
export class AdService {
  /**
   * Get active, non-expired ad unlocks for user + manual
   */
  static async getUnlockStatus(uid, manualId) {
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const path = 'ads';
      try {
        const q = query(
          collection(services.db, "ads"), 
          where("uid", "==", uid), 
          where("manualId", "==", manualId)
        );
        const snapshot = await getDocs(q);
        const now = Date.now();
        
        // Find if there is any watch with expiration later than now
        return snapshot.docs.some(doc => {
          const data = doc.data();
          const expires = data.expiresAt?.toDate ? data.expiresAt.toDate().getTime() : new Date(data.expiresAt).getTime();
          return expires > now;
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }

    // Local fallback check (tracks via session unlocks in localStorage)
    const adUnlocks = JSON.parse(localStorage.getItem('tecw_ad_unlocks') || '{}');
    const expiry = adUnlocks[manualId];
    if (expiry) {
      return expiry > Date.now();
    }
    return false;
  }

  /**
   * Track ad watched and generate custom temporary unlock access token (e.g. 24 hour expiry)
   */
  static async addUnlock(uid, manualId, durationHrs = 24, adType = 'rewarded_video') {
    const expiresAt = new Date(Date.now() + durationHrs * 60 * 60 * 1000).toISOString();
    
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const path = 'ads';
      try {
        await addDoc(collection(services.db, "ads"), {
          uid,
          manualId,
          watchedAt: serverTimestamp(),
          expiresAt: new Date(Date.now() + durationHrs * 60 * 60 * 1000), // convert to date object for Timestamp parsing
          adType
        });
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }

    // Fallback Local Storage
    const adUnlocks = JSON.parse(localStorage.getItem('tecw_ad_unlocks') || '{}');
    adUnlocks[manualId] = Date.now() + durationHrs * 60 * 60 * 1000;
    localStorage.setItem('tecw_ad_unlocks', JSON.stringify(adUnlocks));
    return true;
  }
}

// ==========================================
// 7. SUBSCRIPTION SERVICE
// ==========================================
export class SubscriptionService {
  /**
   * Get subscription details
   */
  static async get(uid) {
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { collection, getDocs, query, where, limit } = await import('firebase/firestore');
      const path = 'subscriptions';
      try {
        const q = query(collection(services.db, "subscriptions"), where("uid", "==", uid), limit(1));
        const snapshot = await getDocs(q);
        return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    }

    // Fallback user status check
    const current = Storage.getCurrentUser();
    if (current && current.isPremium) {
      return {
        uid,
        plan: "Plano Técnico PRO",
        status: "active",
        provider: "Stripe Checkout",
        startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: true
      };
    }
    return null;
  }

  /**
   * Register a premium subscription transaction
   */
  static async create(uid, plan = 'PRO Monthly', provider = 'Stripe') {
    const services = await getFirebaseServices();
    const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days active
    
    if (services.enabled) {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const path = 'subscriptions';
      try {
        const docRef = await addDoc(collection(services.db, "subscriptions"), {
          uid,
          plan,
          status: 'active',
          provider,
          startedAt: serverTimestamp(),
          expiresAt: expiry,
          autoRenew: true
        });
        
        // Update user premium status flag synchronously
        await UserService.update(uid, { premium: true, subscriptionId: docRef.id });
        return docRef.id;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }

    // Fallback sync user to premium in Local Storage
    await UserService.update(uid, { premium: true });
    return 'sub_local_' + Date.now();
  }

  /**
   * Terminate/cancel recurring plan
   */
  static async cancel(uid) {
    const subscription = await this.get(uid);
    if (!subscription) return false;

    const services = await getFirebaseServices();
    if (services.enabled) {
      const { doc, updateDoc } = await import('firebase/firestore');
      const path = `subscriptions/${subscription.id}`;
      try {
        await updateDoc(doc(services.db, "subscriptions", subscription.id), {
          status: 'canceled',
          autoRenew: false
        });
        await UserService.update(uid, { premium: false, subscriptionId: null });
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    }

    await UserService.update(uid, { premium: false });
    return true;
  }
}

// ==========================================
// 8. CATEGORY SERVICE
// ==========================================
export class CategoryService {
  /**
   * Get all active service groupings
   */
  static async getAll() {
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { collection, getDocs } = await import('firebase/firestore');
      const path = 'categories';
      try {
        const snapshot = await getDocs(collection(services.db, "categories"));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }

    // Fallback Local Storage / Local JSON fetch
    try {
      const response = await fetch('/data/categories.json');
      if (response.ok) {
        const data = await response.json();
        return data.map(c => ({
          id: c.id,
          nome: c.name || c.nome,
          icone: c.icon || c.icone,
          imagem: c.imagem || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400"
        }));
      }
    } catch (e) {
      console.warn("[CategoryService] JSON loading failed. Returning static values.");
    }

    return [
      { id: "all", nome: "Todos os Manuais", icone: "apps", imagem: "" },
      { id: "hvac", nome: "Ar Condicionado / Climatização", icone: "ac_unit", imagem: "" },
      { id: "refrig", nome: "Refrigeradores", icone: "kitchen", imagem: "" },
      { id: "washer", nome: "Lavadoras de Roupa", icone: "local_laundry_service", imagem: "" }
    ];
  }

  /**
   * Add a new category
   */
  static async create(id, nome, icone, imagem = '') {
    const payload = { id, nome, icone, imagem };
    
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { doc, setDoc } = await import('firebase/firestore');
      const path = `categories/${id}`;
      try {
        await setDoc(doc(services.db, "categories", id), payload);
        return payload;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }

    return payload;
  }
}

// ==========================================
// 9. BRAND SERVICE
// ==========================================
export class BrandService {
  /**
   * Get all service manufacturers
   */
  static async getAll() {
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { collection, getDocs } = await import('firebase/firestore');
      const path = 'brands';
      try {
        const snapshot = await getDocs(collection(services.db, "brands"));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }

    // Fallback JSON / Local List
    try {
      const response = await fetch('/data/brands.json');
      if (response.ok) {
        const data = await response.json();
        return data.map(b => ({
          id: b.toLowerCase(),
          nome: b,
          logo: ""
        }));
      }
    } catch (e) {}

    const staticBrands = ["Brastemp", "Consul", "Electrolux", "Samsung", "LG", "Midea"];
    return staticBrands.map(b => ({
      id: b.toLowerCase(),
      nome: b,
      logo: ""
    }));
  }

  /**
   * Register a new manufacturer
   */
  static async create(id, nome, logo = '') {
    const payload = { id, nome, logo };
    
    const services = await getFirebaseServices();
    if (services.enabled) {
      const { doc, setDoc } = await import('firebase/firestore');
      const path = `brands/${id}`;
      try {
        await setDoc(doc(services.db, "brands", id), payload);
        return payload;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }

    return payload;
  }
}
