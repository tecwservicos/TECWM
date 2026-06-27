// Firebase Service Layer (Future Integration Ready)
import { CONFIG } from './config.js';

/**
 * Initializes Firebase App and Services (Firestore, Auth, Storage)
 * When CONFIG.firebaseEnabled is true, this will connect to the real Firebase SDK.
 */
export function initializeFirebase() {
  console.log("[Firebase] Checking configuration...");
  if (CONFIG.firebaseEnabled) {
    console.log("[Firebase] Initializing real Firebase SDK...");
    // TODO: Import and initialize Firebase SDK here:
    // import { initializeApp } from 'firebase/app';
    // import { getAuth } from 'firebase/auth';
    // import { getFirestore } from 'firebase/firestore';
    // const app = initializeApp(firebaseConfig);
    // return { auth: getAuth(app), db: getFirestore(app) };
  } else {
    console.log("[Firebase] Running in Mock/Offline mode. Falling back to LocalStorage.");
  }
}

/**
 * Sign in user with email and password
 */
export async function login(email, password) {
  if (CONFIG.firebaseEnabled) {
    // TODO: Real Firebase Authentication sign-in
    // import { signInWithEmailAndPassword } from 'firebase/auth';
    // const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // return userCredential.user;
  } else {
    console.log("[Firebase Mock] Authenticating offline...");
    // Fallback to offline Storage auth
    return null; // Will be handled by auth.js fallback
  }
}

/**
 * Log out current authenticated user
 */
export async function logout() {
  if (CONFIG.firebaseEnabled) {
    // TODO: Real Firebase Authentication sign-out
    // await auth.signOut();
  } else {
    console.log("[Firebase Mock] Signing out offline...");
  }
}

/**
 * Get current authenticated user details
 */
export function getCurrentUser() {
  if (CONFIG.firebaseEnabled) {
    // TODO: Real Firebase Authentication observer
    // return auth.currentUser;
  } else {
    console.log("[Firebase Mock] Reading user from storage...");
    return null; 
  }
}

/**
 * Save or update user profile details in database
 */
export async function saveUser(userId, userData) {
  if (CONFIG.firebaseEnabled) {
    // TODO: Real Firestore write
    // import { doc, setDoc } from 'firebase/firestore';
    // await setDoc(doc(db, "users", userId), userData, { merge: true });
  } else {
    console.log("[Firebase Mock] Saving user to local storage...");
  }
}

/**
 * Retrieve a specific manual by its ID
 */
export async function getManual(manualId) {
  if (CONFIG.firebaseEnabled) {
    // TODO: Real Firestore retrieve document
    // import { doc, getDoc } from 'firebase/firestore';
    // const docSnap = await getDoc(doc(db, "manuals", manualId));
    // return docSnap.exists() ? docSnap.data() : null;
  } else {
    console.log("[Firebase Mock] Fetching manual details locally...");
    return null;
  }
}

/**
 * Retrieve all manuals (with optional filters)
 */
export async function getManuals() {
  if (CONFIG.firebaseEnabled) {
    // TODO: Real Firestore query
    // import { collection, getDocs } from 'firebase/firestore';
    // const querySnapshot = await getDocs(collection(db, "manuals"));
    // return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } else {
    console.log("[Firebase Mock] Fetching manuals list locally...");
    return null;
  }
}

/**
 * Upload manual and metadata
 */
export async function uploadManual(manualData, pdfFile) {
  if (CONFIG.firebaseEnabled) {
    // TODO: Real Firebase Storage upload + Firestore registration
    // import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
    // const storageRef = ref(storage, `manuals/${pdfFile.name}`);
    // const snapshot = await uploadBytes(storageRef, pdfFile);
    // const downloadUrl = await getDownloadURL(snapshot.ref);
    // ... then save to Firestore
  } else {
    console.log("[Firebase Mock] Uploading manual locally...");
    return { success: true, manualData };
  }
}

/**
 * Sync user favorites to cloud database
 */
export async function updateFavorites(userId, favoritesList) {
  if (CONFIG.firebaseEnabled) {
    // TODO: Real Firestore sync
    // await setDoc(doc(db, "users", userId), { favorites: favoritesList }, { merge: true });
  } else {
    console.log("[Firebase Mock] Updating favorites locally...");
  }
}

/**
 * Track manual download event
 */
export async function downloadManual(manualId) {
  if (CONFIG.firebaseEnabled) {
    // TODO: Increment download counter in Firestore
  } else {
    console.log("[Firebase Mock] Tracking download locally...");
  }
}

/**
 * Check if the user is a Premium subscriber on the server
 */
export async function checkPremium(userId) {
  if (CONFIG.firebaseEnabled) {
    // TODO: Check field in Firestore
    // const userSnap = await getDoc(doc(db, "users", userId));
    // return userSnap.exists() && userSnap.data().isPremium;
  } else {
    console.log("[Firebase Mock] Checking premium locally...");
    return false;
  }
}
