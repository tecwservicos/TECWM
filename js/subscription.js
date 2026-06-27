// Premium Subscription Service (Future RevenueCat Ready)
import { getCurrentUser, setCurrentUser, getRegisteredUsers, saveRegisteredUser } from './storage.js';
import { CONFIG } from './config.js';

export const Premium = {
  /**
   * Check if user currently has Premium access (either through active subscription or rewarded ad unlock)
   */
  check() {
    if (CONFIG.premiumEnabled) {
      // Future RevenueCat check:
      // const customerInfo = await Purchases.getCustomerInfo();
      // return customerInfo.entitlements.active["pro_access"] !== undefined;
    }

    // 1. Check if user is logged in and marked as Premium
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.isPremium) {
      return true;
    }

    // 2. Check if general premium flag is stored in localStorage
    const localPremium = localStorage.getItem('tecw_premium_status') === 'true';
    if (localPremium) {
      return true;
    }

    return false;
  },

  /**
   * Activate Premium subscription
   */
  subscribe() {
    if (CONFIG.premiumEnabled) {
      // Future RevenueCat Purchase call:
      // await Purchases.purchasePackage(package);
    }

    console.log("[Premium Service] Simulating purchase/subscription...");
    localStorage.setItem('tecw_premium_status', 'true');

    // Sync to currently logged in user if any
    const currentUser = getCurrentUser();
    if (currentUser) {
      currentUser.isPremium = true;
      setCurrentUser(currentUser);

      // Sync into the registered users table as well
      const users = getRegisteredUsers();
      const updatedUsers = users.map(u => {
        if (u.email.toLowerCase() === currentUser.email.toLowerCase()) {
          u.isPremium = true;
        }
        return u;
      });
      localStorage.setItem('tecw_registered_users', JSON.stringify(updatedUsers));
    }

    return { success: true, message: "Assinatura PRO ativada com sucesso!" };
  },

  /**
   * Restore previous purchases
   */
  restore() {
    if (CONFIG.premiumEnabled) {
      // Future RevenueCat restore purchases:
      // const customerInfo = await Purchases.restorePurchases();
    }
    
    console.log("[Premium Service] Restoring purchases offline...");
    const localPremium = localStorage.getItem('tecw_premium_status') === 'true';
    if (localPremium) {
      this.subscribe(); // re-verify and sync
      return { success: true, message: "Assinatura PRO restaurada com sucesso!" };
    }
    return { success: false, message: "Nenhuma assinatura anterior encontrada." };
  },

  /**
   * Expire Premium subscription
   */
  expire() {
    console.log("[Premium Service] Simulating subscription expiration...");
    localStorage.removeItem('tecw_premium_status');

    const currentUser = getCurrentUser();
    if (currentUser) {
      currentUser.isPremium = false;
      setCurrentUser(currentUser);

      const users = getRegisteredUsers();
      const updatedUsers = users.map(u => {
        if (u.email.toLowerCase() === currentUser.email.toLowerCase()) {
          u.isPremium = false;
        }
        return u;
      });
      localStorage.setItem('tecw_registered_users', JSON.stringify(updatedUsers));
    }
  },

  /**
   * Unlock a specific premium manual for 24 hours using rewarded ad
   */
  unlockByAd(manualId) {
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
    const adUnlocks = JSON.parse(localStorage.getItem('tecw_ad_unlocks') || '{}');
    adUnlocks[manualId] = expiresAt;
    localStorage.setItem('tecw_ad_unlocks', JSON.stringify(adUnlocks));
    console.log(`[Premium Service] Manual ${manualId} unlocked via ad. Expires at ${new Date(expiresAt).toLocaleString()}`);
    return true;
  },

  /**
   * Check if a specific manual is unlocked by a rewarded ad (less than 24 hours elapsed)
   */
  isUnlockedByAd(manualId) {
    const adUnlocks = JSON.parse(localStorage.getItem('tecw_ad_unlocks') || '{}');
    const expiresAt = adUnlocks[manualId];
    if (expiresAt && expiresAt > Date.now()) {
      return true;
    }
    return false;
  }
};
