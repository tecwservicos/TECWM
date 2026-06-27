// Premium Page Controller (Future-Ready Architecture)
import { Database } from './api.js';
import { Premium } from './subscription.js';
import { Ads } from './ads.js';
import { showToast } from './ui.js';

export async function initPremiumPage(currentUser) {
  const backBtn = document.getElementById('premium-back-btn');
  const restoreBtn = document.getElementById('premium-restore-btn');
  
  const adCard = document.getElementById('ad-unlock-promo-card');
  const adTargetTitle = document.getElementById('ad-unlock-target-title');
  const adTriggerBtn = document.getElementById('ad-trigger-button');
  
  const monthlyCard = document.getElementById('plan-monthly-card');
  const annualCard = document.getElementById('plan-annual-card');
  const monthlyRadio = document.getElementById('monthly-radio-icon');
  const annualRadio = document.getElementById('annual-radio-icon');
  
  const checkoutTrigger = document.getElementById('premium-checkout-trigger');
  
  const billingOverlay = document.getElementById('billing-drawer-overlay');
  const billingBody = document.getElementById('billing-drawer-body');
  const closeBillingBtn = document.getElementById('close-billing-drawer');
  
  const tabPix = document.getElementById('payment-tab-pix');
  const tabCard = document.getElementById('payment-tab-card');
  const panelPix = document.getElementById('payment-panel-pix');
  const panelCard = document.getElementById('payment-panel-card');
  
  const copyPixBtn = document.getElementById('copy-pix-key-btn');
  const pixKeyValue = document.getElementById('pix-key-value');
  const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
  const confirmPaymentText = document.getElementById('confirm-payment-text');
  
  let selectedPlan = 'annual'; // default
  
  // 1. Check URL parameters for premium manual unlock request
  const urlParams = new URLSearchParams(window.location.search);
  const targetManualId = urlParams.get('id');
  
  if (targetManualId && adCard) {
    adCard.style.display = 'block';
    const manual = await Database.getManualById(targetManualId);
    if (manual && adTargetTitle) {
      adTargetTitle.textContent = `Você está tentando abrir o manual "${manual.title} (${manual.brand} ${manual.model})". Assista a um anúncio rápido de 5s para ter acesso livre por 24h.`;
    }
    
    // Bind ad trigger button
    if (adTriggerBtn) {
      adTriggerBtn.addEventListener('click', () => {
        Ads.showRewarded(targetManualId, () => {
          showToast("Acesso Liberado! Manual liberado por 24 horas.", "success");
          setTimeout(() => {
            window.location.href = `manual.html?id=${targetManualId}`;
          }, 1500);
        });
      });
    }
  }

  // 2. Back and Restore Buttons
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'home.html';
      }
    });
  }
  
  if (restoreBtn) {
    restoreBtn.addEventListener('click', () => {
      const res = Premium.restore();
      if (res.success) {
        showToast(res.message, "success");
        setTimeout(() => { window.location.href = 'home.html'; }, 1500);
      } else {
        showToast(res.message, "error");
      }
    });
  }

  // 3. Plan Selections
  const selectPlan = (plan) => {
    selectedPlan = plan;
    if (plan === 'monthly') {
      monthlyCard.classList.add('selected');
      monthlyCard.style.borderColor = 'var(--accent-color)';
      monthlyCard.style.backgroundColor = 'rgba(255,102,0,0.03)';
      monthlyRadio.textContent = 'radio_button_checked';
      monthlyRadio.style.color = 'var(--accent-color)';
      
      annualCard.classList.remove('selected');
      annualCard.style.borderColor = 'var(--border-color)';
      annualCard.style.backgroundColor = 'var(--card-bg)';
      annualRadio.textContent = 'radio_button_unchecked';
      annualRadio.style.color = 'var(--text-muted)';
    } else {
      annualCard.classList.add('selected');
      annualCard.style.borderColor = 'var(--accent-color)';
      annualCard.style.backgroundColor = 'rgba(255,102,0,0.03)';
      annualRadio.textContent = 'radio_button_checked';
      annualRadio.style.color = 'var(--accent-color)';
      
      monthlyCard.classList.remove('selected');
      monthlyCard.style.borderColor = 'var(--border-color)';
      monthlyCard.style.backgroundColor = 'var(--card-bg)';
      monthlyRadio.textContent = 'radio_button_unchecked';
      monthlyRadio.style.color = 'var(--text-muted)';
    }
  };

  if (monthlyCard) monthlyCard.addEventListener('click', () => selectPlan('monthly'));
  if (annualCard) annualCard.addEventListener('click', () => selectPlan('annual'));

  // 4. Billing Drawer Interactions
  const openDrawer = () => {
    if (billingOverlay && billingBody) {
      billingOverlay.style.display = 'block';
      setTimeout(() => {
        billingBody.style.bottom = '0';
      }, 50);
    }
  };

  const closeDrawer = () => {
    if (billingOverlay && billingBody) {
      billingBody.style.bottom = '-100%';
      setTimeout(() => {
        billingOverlay.style.display = 'none';
      }, 350);
    }
  };

  if (checkoutTrigger) checkoutTrigger.addEventListener('click', openDrawer);
  if (closeBillingBtn) closeBillingBtn.addEventListener('click', closeDrawer);
  if (billingOverlay) {
    billingOverlay.addEventListener('click', (e) => {
      if (e.target === billingOverlay) closeDrawer();
    });
  }

  // 5. Payment Tab Swapping inside drawer
  if (tabPix && tabCard && panelPix && panelCard) {
    tabPix.addEventListener('click', () => {
      tabPix.style.backgroundColor = 'var(--card-bg)';
      tabPix.style.color = 'white';
      tabCard.style.backgroundColor = 'transparent';
      tabCard.style.color = 'var(--text-muted)';
      panelPix.style.display = 'flex';
      panelCard.style.display = 'none';
    });

    tabCard.addEventListener('click', () => {
      tabCard.style.backgroundColor = 'var(--card-bg)';
      tabCard.style.color = 'white';
      tabPix.style.backgroundColor = 'transparent';
      tabPix.style.color = 'var(--text-muted)';
      panelCard.style.display = 'flex';
      panelPix.style.display = 'none';
    });
  }

  // 6. Copy PIX Key button
  if (copyPixBtn && pixKeyValue) {
    copyPixBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(pixKeyValue.value).then(() => {
        const originalText = copyPixBtn.textContent;
        copyPixBtn.textContent = "Copiado!";
        copyPixBtn.style.backgroundColor = "#10B981";
        setTimeout(() => {
          copyPixBtn.textContent = originalText;
          copyPixBtn.style.backgroundColor = "var(--primary-color)";
        }, 2000);
      });
    });
  }

  // 7. Confirm Payment Simulation
  if (confirmPaymentBtn) {
    confirmPaymentBtn.addEventListener('click', () => {
      confirmPaymentBtn.disabled = true;
      if (confirmPaymentText) confirmPaymentText.textContent = "Processando pagamento...";
      
      // Spinner integration
      const spinner = document.createElement('div');
      spinner.className = 'skeleton-spinner';
      Object.assign(spinner.style, {
        width: '18px',
        height: '18px',
        border: '3px solid white',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite'
      });
      confirmPaymentBtn.appendChild(spinner);

      setTimeout(() => {
        // Upgrade user
        const result = Premium.subscribe();
        if (result.success) {
          closeDrawer();
          showToast(`Sucesso! Sua Assinatura PRO (${selectedPlan === 'annual' ? 'Anual' : 'Mensal'}) está ativa!`, "success");
          
          setTimeout(() => {
            // If they came to view a locked manual, redirect there. Otherwise home.
            if (targetManualId) {
              window.location.href = `manual.html?id=${targetManualId}`;
            } else {
              window.location.href = 'home.html';
            }
          }, 1500);
        }
      }, 1800);
    });
  }
}
