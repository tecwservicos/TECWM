// Rewarded Ads Service (Future Google AdMob Ready)
import { Premium } from './subscription.js';
import { CONFIG } from './config.js';

export const Ads = {
  /**
   * Load AdMob rewarded ads in background
   */
  load() {
    console.log("[AdMob] Initializing SDK and preloading rewarded ad...");
    if (CONFIG.adsEnabled) {
      // Future AdMob integration:
      // AdMob.initialize();
      // RewardedAd.load({ adUnitId: "ca-app-pub-3940256099942544/5224354917" });
    }
  },

  /**
   * Display rewarded ad simulation modal.
   * On completion, unlocks manualId for 24 hours.
   */
  showRewarded(manualId, onRewardGranted, onAdClosed) {
    if (CONFIG.adsEnabled) {
      // Future AdMob playback:
      // rewardedAd.show(() => { onRewardGranted(); });
      // return;
    }

    console.log(`[AdMob Simulation] Showing rewarded video for manual ID: ${manualId}`);
    
    // Create immersive simulated ad modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'ad-simulation-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      backgroundColor: 'rgba(10, 8, 20, 0.95)',
      zIndex: '10000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      color: 'white',
      fontFamily: 'var(--font-sans, sans-serif)',
      backdropFilter: 'blur(10px)',
      textAlign: 'center'
    });

    // Content container
    const content = document.createElement('div');
    Object.assign(content.style, {
      maxWidth: '480px',
      width: '100%',
      backgroundColor: '#1E1B29',
      border: '1px solid #3B3654',
      borderRadius: '24px',
      padding: '2.5rem 2rem',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      alignItems: 'center'
    });

    // Simulated Ad Header
    const adHeader = document.createElement('div');
    adHeader.innerHTML = `
      <span style="font-size: 0.625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent-color, #FF6600); background-color: rgba(255,102,0,0.1); padding: 0.25rem 0.75rem; border-radius: 100px;">Anúncio Patrocinado</span>
      <h3 style="font-size: 1.25rem; font-weight: 800; margin-top: 0.75rem; color: #FFFFFF;">Fluke Premium Tools</h3>
      <p style="font-size: 0.8125rem; color: #9CA3AF; margin-top: 0.25rem;">A precisão que você precisa em campo com multímetros e termofensores industriais.</p>
    `;

    // Simulated Ad Video / Animation Area
    const videoPlaceholder = document.createElement('div');
    Object.assign(videoPlaceholder.style, {
      width: '100%',
      height: '180px',
      borderRadius: '16px',
      background: 'linear-gradient(135deg, #2E1B4E 0%, #150A21 100%)',
      border: '1px solid #4338CA',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    });

    // Animated graphic inside video area
    videoPlaceholder.innerHTML = `
      <div class="ad-pulse-ring" style="width: 64px; height: 64px; border-radius: 50%; background-color: rgba(99, 102, 241, 0.2); display: flex; align-items: center; justify-content: center; animation: adPulse 2s infinite;">
        <svg viewBox="0 0 24 24" style="width: 28px; height: 28px; fill: #6366F1;" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
      <div style="font-family: monospace; font-size: 0.6875rem; color: #818CF8; margin-top: 0.75rem;">REPRODUZINDO VÍDEO...</div>
    `;

    // Countdown / Button Row
    const buttonRow = document.createElement('div');
    buttonRow.style.width = '100%';

    const skipButton = document.createElement('button');
    skipButton.disabled = true;
    Object.assign(skipButton.style, {
      width: '100%',
      padding: '0.875rem 1.5rem',
      borderRadius: '14px',
      border: 'none',
      backgroundColor: '#374151',
      color: '#9CA3AF',
      fontWeight: '700',
      fontSize: '0.875rem',
      cursor: 'not-allowed',
      transition: 'all 0.3s'
    });
    
    let countdown = 5; // 5 seconds simulation
    skipButton.textContent = `Aguarde ${countdown}s para liberar o manual...`;

    buttonRow.appendChild(skipButton);

    content.appendChild(adHeader);
    content.appendChild(videoPlaceholder);
    content.appendChild(buttonRow);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // CSS Keyframe Injection
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes adPulse {
        0% { transform: scale(0.95); opacity: 0.8; }
        50% { transform: scale(1.05); opacity: 1; }
        100% { transform: scale(0.95); opacity: 0.8; }
      }
    `;
    document.head.appendChild(styleEl);

    // Countdown interval
    const interval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        skipButton.textContent = `Aguarde ${countdown}s para liberar o manual...`;
      } else {
        clearInterval(interval);
        skipButton.disabled = false;
        skipButton.textContent = "Resgatar Acesso de 24 Horas";
        Object.assign(skipButton.style, {
          backgroundColor: '#6366F1',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
        });
        
        // Add active state click handler
        skipButton.addEventListener('click', () => {
          this.reward(manualId);
          document.body.removeChild(overlay);
          if (onRewardGranted) onRewardGranted();
        });
      }
    }, 1000);
  },

  /**
   * Reward user with 24 hour unlock
   */
  reward(manualId) {
    Premium.unlockByAd(manualId);
  },

  /**
   * Close advertisement modal
   */
  close() {
    const overlay = document.getElementById('ad-simulation-overlay');
    if (overlay) {
      document.body.removeChild(overlay);
    }
  }
};
