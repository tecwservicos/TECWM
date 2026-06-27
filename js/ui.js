// UI Rendering Engine for Tec W Manuais (Static Edition)
import { isFavorite, toggleFavorite, isDownloaded, addDownload } from './storage.js';

// Show toast notifications
export function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast animate-shake ${type === 'success' ? 'toast-success' : 'toast-error'}`;
  toast.innerHTML = `
    <span class="toast-message">${message}</span>
  `;
  
  // Style toast on the fly
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: type === 'success' ? '#2B8A3E' : '#C92A2A',
    color: '#FFFFFF',
    padding: '0.75rem 1.5rem',
    borderRadius: '100px',
    fontSize: '0.8125rem',
    fontWeight: '700',
    boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
    zIndex: '2500',
    pointerEvents: 'none',
    transition: 'opacity 300ms ease'
  });
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Render dynamic lists of manual cards
export function renderManualCards(manuals, containerElement, onCardClick) {
  if (!containerElement) return;
  containerElement.innerHTML = '';
  
  if (manuals.length === 0) {
    containerElement.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1.5rem; color: var(--text-muted);">
        <i data-lucide="search-code" style="width: 48px; height: 48px; stroke-width: 1.5; margin-bottom: 1rem; color: var(--text-super-muted);"></i>
        <h3 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-color);">Nenhum manual encontrado</h3>
        <p style="font-size: 0.8125rem; max-width: 320px; margin: 0 auto;">Tente buscar por termos diferentes ou selecione outra categoria.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }
  
  manuals.forEach(m => {
    const card = document.createElement('div');
    card.className = 'manual-card scale-in';
    card.id = `card-${m.id}`;
    
    const isFav = isFavorite(m.id);
    const isDl = isDownloaded(m.id);
    
    card.innerHTML = `
      <div>
        <div class="card-image-wrapper">
          <img src="${m.coverImage}" alt="${m.title}" class="card-image" loading="lazy">
          <div class="card-overlay"></div>
          <span class="card-badge">${m.brand}</span>
          ${m.premium ? `
            <span class="premium-indicator">
              <i data-lucide="sparkles" style="width: 10px; height: 10px;"></i>
              PRO
            </span>
          ` : ''}
        </div>
        
        <div class="card-content">
          <span class="card-category">${m.category}</span>
          <h4 class="card-title">${m.title}</h4>
          <p class="card-model">Model: <span>${m.model}</span></p>
        </div>
      </div>
      
      <div class="card-footer">
        <div class="card-actions">
          <span style="display: inline-flex; align-items: center; gap: 0.25rem;">
            <i data-lucide="eye" style="width: 12px; height: 12px;"></i>
            ${m.views}
          </span>
          <span style="display: inline-flex; align-items: center; gap: 0.25rem;">
            <i data-lucide="arrow-down-to-line" style="width: 12px; height: 12px;"></i>
            ${m.downloads}
          </span>
        </div>
        
        <button class="btn-read-trigger" style="background: none; border: none; color: var(--primary-light); font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 0.25rem;">
          <span>Abrir</span>
          <i data-lucide="book-open" style="width: 12px; height: 12px;"></i>
        </button>
      </div>
    `;
    
    // Wire up events
    card.addEventListener('click', (e) => {
      onCardClick(m);
    });
    
    containerElement.appendChild(card);
  });
  
  if (window.lucide) window.lucide.createIcons();
}

// Display side detailed modal/drawer for manual specifications
export function showManualDetailDrawer(manual, currentUser, onOpenPdf, onUpdateUI) {
  // Check if drawer container already exists
  let overlay = document.getElementById('detail-drawer-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'detail-drawer-overlay';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }
  
  const isFav = isFavorite(manual.id);
  const isDl = isDownloaded(manual.id);
  
  overlay.innerHTML = `
    <div class="modal-content slide-up" style="max-width: 520px; border-radius: 28px; overflow: hidden;">
      <!-- Banner / Image section -->
      <div style="position: relative; height: 140px; background: linear-gradient(135deg, var(--primary-color) 0%, #1E1E24 100%);">
        <button id="close-drawer" class="btn-icon" style="position: absolute; top: 1rem; right: 1rem; background-color: rgba(0,0,0,0.5); border: none; color: white; border-radius: 50%; z-index: 20;">
          <i data-lucide="x" style="width: 18px; height: 18px;"></i>
        </button>
        <div style="position: absolute; bottom: -2rem; left: 2rem; display: flex; gap: 1rem; align-items: flex-end; z-index: 10;">
          <img src="${manual.coverImage}" style="width: 80px; height: 100px; object-fit: cover; border-radius: 12px; box-shadow: var(--shadow-lg); border: 2px solid var(--border-color);" />
          <div style="padding-bottom: 0.5rem;">
            <span style="font-size: 0.625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary-light); background-color: var(--primary-transparent); padding: 0.25rem 0.5rem; border-radius: 6px;">
              ${manual.category}
            </span>
            <h3 style="font-size: 1.125rem; font-weight: 800; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.5); margin-top: 0.375rem;">
              ${manual.brand}
            </h3>
          </div>
        </div>
      </div>
      
      <!-- Specs Sheet Section -->
      <div style="padding: 3rem 2rem 2rem; display: flex; flex-direction: column; gap: 1.25rem;">
        <div>
          <h2 style="font-size: 1.25rem; line-height: 1.35; margin-bottom: 0.25rem; color: var(--text-color);">${manual.title}</h2>
          <p style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">Modelo: <span style="font-weight: 700; color: var(--text-color);">${manual.model}</span></p>
        </div>
        
        <!-- Bento grid values -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; background-color: var(--surface-color); padding: 1rem; border-radius: 16px; border: 1px solid var(--border-color);">
          <div style="text-align: center;">
            <span style="font-size: 0.625rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Tamanho</span>
            <span style="font-size: 0.8125rem; font-weight: 700; color: var(--text-color);">${manual.fileSize}</span>
          </div>
          <div style="text-align: center; border-inline: 1px solid var(--border-color);">
            <span style="font-size: 0.625rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Páginas</span>
            <span style="font-size: 0.8125rem; font-weight: 700; color: var(--text-color);">${manual.pages}</span>
          </div>
          <div style="text-align: center;">
            <span style="font-size: 0.625rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Publicação</span>
            <span style="font-size: 0.8125rem; font-weight: 700; color: var(--text-color);">${manual.publicationDate}</span>
          </div>
        </div>
        
        <div>
          <h4 style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.375rem; letter-spacing: 0.05em;">Equipamentos Compatíveis:</h4>
          <p style="font-size: 0.75rem; color: var(--text-color); line-height: 1.5; font-family: var(--font-mono); font-weight: 500;">
            ${manual.compatibleEquipment.join(', ')}
          </p>
        </div>
        
        <div>
          <h4 style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.375rem; letter-spacing: 0.05em;">Descrição Técnica:</h4>
          <p style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.6;">
            ${manual.description}
          </p>
        </div>
        
        <!-- Action Row -->
        <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
          <button id="btn-favorite-toggle" class="btn btn-secondary" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; border-radius: 14px;">
            <i data-lucide="heart" class="${isFav ? 'fav-filled' : ''}" style="width: 18px; height: 18px; ${isFav ? 'fill: #E03131; stroke: #E03131;' : ''}"></i>
            <span>${isFav ? 'Favoritado' : 'Favoritar'}</span>
          </button>
          
          <button id="btn-download-save" class="btn btn-secondary" style="padding: 0 1rem; border-radius: 14px; position: relative;" title="Salvar Offline">
            <i data-lucide="${isDl ? 'check-circle-2' : 'arrow-down-to-line'}" style="width: 18px; height: 18px; ${isDl ? 'color: #2B8A3E;' : ''}"></i>
          </button>
          
          <button id="btn-open-viewer" class="btn btn-primary" style="flex: 1.5; font-size: 0.8125rem; font-weight: 700; border-radius: 14px;">
            <span>Abrir Documento</span>
            <i data-lucide="chevron-right" style="width: 16px; height: 16px;"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  
  overlay.classList.add('active');
  if (window.lucide) window.lucide.createIcons();
  
  // Handlers
  document.getElementById('close-drawer').addEventListener('click', () => {
    overlay.classList.remove('active');
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });
  
  document.getElementById('btn-favorite-toggle').addEventListener('click', () => {
    const active = toggleFavorite(manual.id);
    showToast(active ? "Manual adicionado aos favoritos!" : "Manual removido dos favoritos!");
    showManualDetailDrawer(manual, currentUser, onOpenPdf, onUpdateUI);
    if (onUpdateUI) onUpdateUI();
  });
  
  document.getElementById('btn-download-save').addEventListener('click', () => {
    if (isDownloaded(manual.id)) {
      showToast("Este arquivo já está disponível em seu dispositivo offline.");
      return;
    }
    
    // Simulate high-speed download
    showToast("Baixando pacotes de esquemas elétricos e PDF...");
    setTimeout(() => {
      addDownload(manual.id);
      showToast("Download finalizado! Arquivo pronto para acesso offline.", "success");
      showManualDetailDrawer(manual, currentUser, onOpenPdf, onUpdateUI);
      if (onUpdateUI) onUpdateUI();
    }, 1200);
  });
  
  document.getElementById('btn-open-viewer').addEventListener('click', () => {
    overlay.classList.remove('active');
    onOpenPdf(manual);
  });
}

// Display premium billing details pop-up modal
export function showPremiumUpgradeModal(currentUser, onActivationSuccess) {
  let overlay = document.getElementById('premium-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'premium-overlay';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }
  
  overlay.innerHTML = `
    <div class="modal-content slide-up" style="max-width: 480px; border-radius: 28px; overflow: hidden; display: flex; flex-direction: column;">
      <!-- Header Banner with premium badge -->
      <div style="background: linear-gradient(135deg, #7C3AED 0%, #1E1E24 100%); padding: 2rem; color: white; position: relative;">
        <button id="close-premium" class="btn-icon" style="position: absolute; top: 1rem; right: 1rem; background-color: rgba(0,0,0,0.5); border: none; color: white; border-radius: 50%; z-index: 20;">
          <i data-lucide="x" style="width: 16px; height: 16px;"></i>
        </button>
        <span style="font-size: 0.625rem; font-weight: 800; background-color: var(--accent-color); color: white; padding: 0.25rem 0.625rem; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; margin-bottom: 0.75rem;">
          Biblioteca Premium
        </span>
        <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.375rem;">Tec W Manuais PRO</h2>
        <p style="font-size: 0.8125rem; color: #D1D5DB; line-height: 1.5;">Desbloqueie acesso instantâneo a esquemas elétricos oficiais e catálogos avançados.</p>
      </div>
      
      <!-- Checkout Form Content -->
      <div style="padding: 1.75rem 2rem 2rem; display: flex; flex-direction: column; gap: 1.25rem;">
        <!-- Benefits -->
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <h4 style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); letter-spacing: 0.05em;">Benefícios Exclusivos:</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.8125rem; color: var(--text-color);">
            <li style="display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="check-circle-2" style="width: 14px; height: 14px; color: var(--primary-light);"></i>
              Acesso irrestrito a mais de 12.000 manuais
            </li>
            <li style="display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="check-circle-2" style="width: 14px; height: 14px; color: var(--primary-light);"></i>
              Downloads em alta velocidade sem anúncios
            </li>
            <li style="display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="check-circle-2" style="width: 14px; height: 14px; color: var(--primary-light);"></i>
              Modo Offline completo e sincronização em nuvem
            </li>
          </ul>
        </div>
        
        <!-- Credit card checkout mock values -->
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Número do Cartão de Crédito</label>
          <div class="input-container">
            <i class="input-icon" data-lucide="credit-card"></i>
            <input type="text" class="input-field" placeholder="4000 1234 5678 9010" value="4000 1234 5678 9010" readonly style="font-family: var(--font-mono); font-weight: 700;" />
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Validade</label>
            <input type="text" class="input-field" value="12/32" readonly style="padding-left: 1rem; text-align: center; font-family: var(--font-mono);" />
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">CVV</label>
            <input type="password" class="input-field" value="123" readonly style="padding-left: 1rem; text-align: center; font-family: var(--font-mono);" />
          </div>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 0.5rem; border-top: 1px solid var(--border-color);">
          <div>
            <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Valor da Assinatura:</span>
            <span style="font-size: 1.25rem; font-weight: 800; color: var(--text-color);">R$ 29,90 <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">/mês</span></span>
          </div>
          
          <button id="btn-activate-premium" class="btn btn-primary" style="padding: 0.875rem 1.5rem; border-radius: 14px;">
            <span>Ativar Agora</span>
            <i data-lucide="zap" style="width: 14px; height: 14px; fill: white;"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  
  overlay.classList.add('active');
  if (window.lucide) window.lucide.createIcons();
  
  // Handlers
  document.getElementById('close-premium').addEventListener('click', () => {
    overlay.classList.remove('active');
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });
  
  document.getElementById('btn-activate-premium').addEventListener('click', () => {
    const btn = document.getElementById('btn-activate-premium');
    btn.innerHTML = `
      <div class="spinner"></div>
      <span>Processando...</span>
    `;
    btn.disabled = true;
    
    setTimeout(() => {
      currentUser.isPremium = true;
      localStorage.setItem('tecw_logged_user', JSON.stringify(currentUser));
      overlay.classList.remove('active');
      showToast("Tec W Pro ativado com sucesso! Aproveite os privilégios profissionais.", "success");
      if (onActivationSuccess) onActivationSuccess();
    }, 2000);
  });
}

// Display modal for uploading/creating new technical manuals
export function showUploadManualModal(onUploadSuccess) {
  let overlay = document.getElementById('upload-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'upload-overlay';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }
  
  overlay.innerHTML = `
    <div class="modal-content slide-up" style="max-width: 500px; border-radius: 28px;">
      <div style="padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
        <h2 style="font-size: 1.125rem; font-weight: 800; color: var(--text-color);">Novo Manual Técnico</h2>
        <button id="close-upload" class="btn-icon" style="border: none; background: none; border-radius: 50%;">
          <i data-lucide="x" style="width: 18px; height: 18px;"></i>
        </button>
      </div>
      
      <form id="upload-form" style="padding: 1.5rem 2rem; display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Título do Catálogo</label>
          <div class="input-container">
            <i class="input-icon" data-lucide="type"></i>
            <input type="text" id="up-title" class="input-field" placeholder="Ex: Manual de Serviço Condicionador de Ar" required />
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Marca/Fabricante</label>
            <div class="input-container">
              <i class="input-icon" data-lucide="tag"></i>
              <input type="text" id="up-brand" class="input-field" placeholder="Ex: Brastemp" required />
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Código do Modelo</label>
            <div class="input-container">
              <i class="input-icon" data-lucide="hash"></i>
              <input type="text" id="up-model" class="input-field" placeholder="Ex: BRE80AK" required />
            </div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 0.75rem;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Categoria</label>
            <select id="up-category" class="input-field" style="padding-left: 1rem;" required>
              <option value="Air Conditioners">Air Conditioners</option>
              <option value="Refrigerators">Refrigerators</option>
              <option value="Washing Machines">Washing Machines</option>
              <option value="Dryers">Dryers</option>
              <option value="Microwaves">Microwaves</option>
              <option value="Compressors">Compressors</option>
              <option value="Electronics">Electronics</option>
              <option value="Tools">Tools</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Páginas</label>
            <div class="input-container">
              <i class="input-icon" data-lucide="book-open"></i>
              <input type="number" id="up-pages" class="input-field" placeholder="45" value="45" min="1" required />
            </div>
          </div>
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Especificações Técnicas / Descrição</label>
          <textarea id="up-desc" class="input-field" style="padding-left: 1rem; height: 80px; resize: none; border-radius: 12px;" placeholder="Inclua códigos de sensores, esquemas elétricos de placas..." required></textarea>
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">URL da Imagem de Capa</label>
          <div class="input-container">
            <i class="input-icon" data-lucide="image"></i>
            <input type="url" id="up-image" class="input-field" placeholder="https://images.unsplash.com..." />
          </div>
        </div>
        
        <button type="submit" class="btn btn-primary" style="width: 100%; font-size: 0.875rem; padding: 0.875rem; border-radius: 14px; margin-top: 0.5rem;">
          <i data-lucide="plus-circle" style="width: 16px; height: 16px;"></i>
          <span>Cadastrar Manual</span>
        </button>
      </form>
    </div>
  `;
  
  overlay.classList.add('active');
  if (window.lucide) window.lucide.createIcons();
  
  // Handlers
  document.getElementById('close-upload').addEventListener('click', () => {
    overlay.classList.remove('active');
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });
  
  document.getElementById('upload-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('up-title').value;
    const brand = document.getElementById('up-brand').value;
    const model = document.getElementById('up-model').value;
    const category = document.getElementById('up-category').value;
    const pages = parseInt(document.getElementById('up-pages').value, 10);
    const description = document.getElementById('up-desc').value;
    const coverImage = document.getElementById('up-image').value || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600";
    
    overlay.classList.remove('active');
    onUploadSuccess({ title, brand, model, category, pages, description, coverImage });
  });
}
