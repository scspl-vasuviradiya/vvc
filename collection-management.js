// Collection Management Script - GitHub Workflow Version
(function(){
  'use strict';

  const COLLECTIONS_JSON = 'collections.json';
  const IMAGES_DIR = 'img/collections';
  const LOCAL_STORAGE_KEY = 'vvc_collections';
  const GITHUB_SYNC_KEY = 'vvc_github_sync';

  // Detect if running from file:// protocol (local development)
  const isLocalFile = window.location.protocol === 'file:';
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Elements
  const form = document.getElementById('collection-form');
  const editIndexEl = document.getElementById('edit-index');
  const formTitle = document.getElementById('form-title');
  const resetFormBtn = document.getElementById('reset-form-btn');
  const resetDataBtn = document.getElementById('reset-data-btn');
  const syncGitHubBtn = document.getElementById('sync-github-btn');

  const titleEl = document.getElementById('title');
  const priceEl = document.getElementById('price');
  const descEl = document.getElementById('desc');
  const altEl = document.getElementById('alt');
  const genderEl = document.getElementById('gender');
  const categoryEl = document.getElementById('category');

  const uploadZone = document.getElementById('upload-zone');
  const imageInput = document.getElementById('image-input');
  const imagePreview = document.getElementById('image-preview');
  const previewImg = document.getElementById('preview-img');
  const removeImageBtn = document.getElementById('remove-image');
  const uploadStatus = document.getElementById('upload-status');

  const cancelBtn = document.getElementById('cancel-btn');

  const searchInput = document.getElementById('search-input');
  const filterCategory = document.getElementById('filter-category');
  const grid = document.getElementById('collections-grid');
  const emptyState = document.getElementById('no-collections');

  // Toast
  const toast = document.getElementById('toast');
  const toastMsg = toast?.querySelector('.toast-message');
  const toastClose = toast?.querySelector('.toast-close');

  // Delete modal
  const deleteModal = document.getElementById('delete-modal');
  const modalClose = document.getElementById('modal-close');
  const cancelDelete = document.getElementById('cancel-delete');
  const confirmDelete = document.getElementById('confirm-delete');
  let pendingDeleteIndex = null;

  // In-memory state
  let collections = [];
  let currentImageFile = null;
  let currentImageDataURL = '';
  let hasChanges = false;

  function showToast(message, type='info'){
    if (!toast) return;
    toastMsg.textContent = message;
    toast.classList.add('show');
    
    // Add type-based styling
    toast.className = 'toast show';
    if (type === 'success') toast.classList.add('toast-success');
    if (type === 'error') toast.classList.add('toast-error');
    if (type === 'warning') toast.classList.add('toast-warning');
    
    setTimeout(()=> toast.classList.remove('show'), 4000);
  }
  toastClose?.addEventListener('click', ()=> toast.classList.remove('show'));

  // Show mode-specific messages
  if (isLocalhost) {
    const devNotice = document.getElementById('dev-notice');
    if (devNotice) {
      devNotice.style.display = 'flex';
      devNotice.innerHTML = `
        <i class="fas fa-server"></i>
        <span>Localhost Mode: Full functionality with direct file access and image uploads</span>
      `;
    }
    setTimeout(() => {
      showToast('Localhost server active: Collections and images save directly to files.', 'success');
    }, 1500);
  } else if (isLocalFile) {
    // Show GitHub sync button in local mode
    if (syncGitHubBtn) {
      syncGitHubBtn.style.display = 'inline-flex';
    }
    if (resetDataBtn) {
      resetDataBtn.style.display = 'inline-flex';
    }
    const devNotice = document.getElementById('dev-notice');
    if (devNotice) {
      devNotice.style.display = 'flex';
      devNotice.innerHTML = `
        <i class="fas fa-github"></i>
        <span>GitHub Mode: Edit locally → Export JSON → Push to GitHub → Static site updates automatically</span>
      `;
    }
    setTimeout(() => {
      showToast('GitHub workflow ready: Edit collections locally, export files, then commit to GitHub.', 'info');
    }, 1500);
  }

  function openDeleteModal(index){
    pendingDeleteIndex = index;
    deleteModal.classList.add('active');
  }
  function closeDeleteModal(){
    pendingDeleteIndex = null;
    deleteModal.classList.remove('active');
  }
  modalClose?.addEventListener('click', closeDeleteModal);
  cancelDelete?.addEventListener('click', closeDeleteModal);

  // Initialize
  async function init(){
    await loadCollections();
    bindUpload();
    bindForm();
    bindFilters();
    updateSyncStatus();
  }

  async function loadCollections(){
    try {
      if (isLocalhost) {
        // Load from server endpoint for localhost
        try {
          const res = await fetch('save-collections.php', { 
            method: 'GET',
            cache: 'no-store' 
          });
          if (res.ok) {
            collections = await res.json();
          } else {
            console.warn('Failed to load from server, using localStorage fallback');
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            collections = stored ? JSON.parse(stored) : [];
          }
        } catch(e) {
          console.warn('Server unavailable, using localStorage fallback:', e);
          const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
          collections = stored ? JSON.parse(stored) : [];
        }
      } else if (isLocalFile) {
        // Load from localStorage for local development
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          collections = JSON.parse(stored);
        } else {
          // Load existing collections.json as starting point
          try {
            const res = await fetch(COLLECTIONS_JSON, { cache: 'no-store' });
            collections = await res.json();
            // Save to localStorage
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(collections));
          } catch(e) {
            collections = [];
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(collections));
          }
        }
      } else {
        // Load from server/GitHub pages
        const res = await fetch(COLLECTIONS_JSON + '?v=' + Date.now(), { cache: 'no-store' });
        collections = await res.json();
      }
    } catch(e) {
      collections = [];
      if (isLocalFile || isLocalhost) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(collections));
      }
    }
    
    // Ensure active flag exists
    collections = collections.map(item => ({ ...item, active: item.active !== false }));
    renderList();
  }

  function bindUpload(){
    uploadZone.addEventListener('click', ()=> imageInput.click());

    uploadZone.addEventListener('dragover', (e)=>{ e.preventDefault(); uploadZone.classList.add('drag'); });
    uploadZone.addEventListener('dragleave', ()=> uploadZone.classList.remove('drag'));
    uploadZone.addEventListener('drop', (e)=>{
      e.preventDefault();
      uploadZone.classList.remove('drag');
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileSelect(file);
    });

    imageInput.addEventListener('change', (e)=>{
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    });

    removeImageBtn.addEventListener('click', ()=>{
      currentImageFile = null;
      currentImageDataURL = '';
      previewImg.src = '';
      imagePreview.style.display = 'none';
      uploadStatus.textContent = '';
    });
  }

  function handleFileSelect(file){
    if (!file.type.startsWith('image/')){ showToast('Please select an image file', 'error'); return; }
    if (file.size > 5 * 1024 * 1024){ showToast('Image must be <= 5MB', 'error'); return; }
    
    currentImageFile = file;
    const reader = new FileReader();
    reader.onload = (e)=>{
      currentImageDataURL = e.target.result;
      previewImg.src = currentImageDataURL;
      imagePreview.style.display = 'block';
          const modeText = isLocalhost 
            ? '<i class="fas fa-server"></i> Will be uploaded to img/collections/ folder'
            : '<i class="fas fa-github"></i> Will be saved for GitHub export';
          uploadStatus.innerHTML = `
        <strong>${file.name}</strong> (${Math.round(file.size/1024)} KB)<br>
        <small style="color: #16a34a;">${modeText}</small>
      `;
    };
    reader.readAsDataURL(file);
  }

  function bindForm(){
    resetFormBtn.addEventListener('click', resetForm);
    cancelBtn.addEventListener('click', resetForm);
    
    // Reset data button (local mode only)
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all data? This will restore original collections from collections.json.')) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          localStorage.removeItem(GITHUB_SYNC_KEY);
          // Reload from original file
          loadCollections();
          resetForm();
          hasChanges = false;
          updateSyncStatus();
          showToast('Data reset to original collections', 'success');
        }
      });
    }

    // GitHub sync button
    if (syncGitHubBtn) {
      syncGitHubBtn.addEventListener('click', exportForGitHub);
    }

    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const item = collectFormData();
      if (!item) return;

      const index = editIndexEl.value !== '' ? parseInt(editIndexEl.value, 10) : -1;

      // Handle image upload and path
      let imgPath = '';
      if (currentImageDataURL) {
        // Generate simple filename for img/collections/ folder
        const safeName = slugify(item.title);
        const fileName = `${safeName || 'image'}.jpg`;
        imgPath = `${IMAGES_DIR}/${fileName}`;
        
        if (isLocalhost) {
          // Upload image to server
          try {
            const uploadResult = await uploadImage(currentImageDataURL, fileName);
            if (uploadResult.success) {
              imgPath = uploadResult.path;
              showToast(`Image uploaded: ${uploadResult.filename}`, 'success');
            } else {
              showToast('Image upload failed', 'error');
              return;
            }
          } catch(e) {
            showToast('Image upload error: ' + e.message, 'error');
            return;
          }
        } else {
          // Store data URL for preview and export (local development)
          item.imageDataURL = currentImageDataURL;
          item.needsUpload = true;
        }
      } else if (index >= 0) {
        imgPath = collections[index].img; // keep existing
        if (collections[index].imageDataURL && !isLocalhost) {
          item.imageDataURL = collections[index].imageDataURL;
          item.needsUpload = collections[index].needsUpload;
        }
      }
      
      item.img = imgPath;

      // Create or update
      if (index >= 0) {
        collections[index] = { ...collections[index], ...item };
        showToast('Collection updated successfully', 'success');
      } else {
        collections.push(item);
        showToast('Collection added successfully', 'success');
      }

      // Save data
      const saved = await saveCollections(collections);
      if (!saved) { 
        showToast('Failed to save collections', 'error'); 
        return; 
      }

      hasChanges = true;
      updateSyncStatus();
      resetForm();
      renderList();
    });
  }

  function collectFormData(){
    const title = titleEl.value.trim();
    const price = priceEl.value.trim();
    const desc = descEl.value.trim();
    const alt = altEl.value.trim();
    const gender = genderEl.value;
    const category = categoryEl.value;

    if (!title || !price || !desc || !alt || !gender || !category){
      showToast('Please fill all required fields', 'error');
      return null;
    }

    return {
      tags: [gender, category],
      img: '', // set later
      alt,
      title,
      desc,
      price,
      active: true
    };
  }

  function resetForm(){
    form.reset();
    editIndexEl.value = '';
    formTitle.textContent = 'Add New Collection';
    currentImageFile = null;
    currentImageDataURL = '';
    imagePreview.style.display = 'none';
    uploadStatus.textContent = '';
  }

  function bindFilters(){
    searchInput.addEventListener('input', renderList);
    filterCategory.addEventListener('change', renderList);
  }

  function renderList(){
    grid.innerHTML = '';
    const term = searchInput.value.toLowerCase();
    const filter = filterCategory.value;

    let list = [...collections];
    if (term){
      list = list.filter(x => `${x.title} ${x.desc} ${x.price}`.toLowerCase().includes(term));
    }
    if (filter){
      list = list.filter(x => x.tags.includes(filter));
    }

    if (list.length === 0){
      emptyState.style.display = 'block';
      return;
    } else {
      emptyState.style.display = 'none';
    }

    list.forEach((item, idx) => {
      const index = collections.indexOf(item);
      const card = document.createElement('div');
      card.className = 'collection-card';
      
      // Handle image display - use data URL for preview if available
      const imgSrc = item.imageDataURL || item.img || 'img/logo/logo.png';
      const imgError = "this.src='img/logo/logo.png'";
      
      card.innerHTML = `
        <div class="card-image">
          <img src="${imgSrc}" alt="${item.alt}" onerror="${imgError}">
          <div class="card-badges">
            <span class="badge ${item.active ? 'active' : ''}">${item.active ? 'Active' : 'Inactive'}</span>
            <span class="badge">${item.tags.join(' · ')}</span>
            ${item.needsUpload ? '<span class="badge badge-upload"><i class="fas fa-upload"></i> Upload Pending</span>' : ''}
          </div>
        </div>
        <div class="card-content">
          <h4 class="card-title">${item.title}</h4>
          <p class="card-desc">${item.desc}</p>
          <div class="card-price">${item.price}</div>
          <div class="card-path"><small><i class="fas fa-folder"></i> ${item.img}</small></div>
        </div>
        <div class="card-actions">
          <label class="toggle">
            <input type="checkbox" ${item.active ? 'checked' : ''} data-action="toggle" data-index="${index}">
            <span>${item.active ? 'Active' : 'Inactive'}</span>
          </label>
          <div class="action-buttons">
            <button class="btn btn-outline btn-sm" data-action="edit" data-index="${index}"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-danger btn-sm" data-action="delete" data-index="${index}"><i class="fas fa-trash"></i> Delete</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    // Wire actions
    grid.querySelectorAll('[data-action="edit"]').forEach(btn => btn.addEventListener('click', onEdit));
    grid.querySelectorAll('[data-action="delete"]').forEach(btn => btn.addEventListener('click', onDelete));
    grid.querySelectorAll('[data-action="toggle"]').forEach(toggle => toggle.addEventListener('change', onToggleActive));
  }

  function onEdit(e){
    const index = parseInt(e.currentTarget.dataset.index, 10);
    const item = collections[index];
    if (!item) return;
    
    editIndexEl.value = index;
    formTitle.textContent = 'Edit Collection';

    titleEl.value = item.title;
    priceEl.value = item.price;
    descEl.value = item.desc;
    altEl.value = item.alt;
    genderEl.value = item.tags[0];
    categoryEl.value = item.tags[1];

    if (item.imageDataURL) {
      currentImageDataURL = item.imageDataURL;
      previewImg.src = currentImageDataURL;
      imagePreview.style.display = 'block';
      uploadStatus.innerHTML = '<strong>Current image loaded</strong><br><small>Will be exported for GitHub upload</small>';
    } else if (item.img) {
      previewImg.src = item.img;
      imagePreview.style.display = 'block';
      uploadStatus.innerHTML = '<strong>Current image</strong><br><small>Already on GitHub</small>';
    } else {
      imagePreview.style.display = 'none';
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function onDelete(e){
    const index = parseInt(e.currentTarget.dataset.index, 10);
    openDeleteModal(index);
  }

  confirmDelete?.addEventListener('click', async ()=>{
    if (pendingDeleteIndex === null) return;
    
    collections.splice(pendingDeleteIndex, 1);
    const saved = await saveCollections(collections);
    if (!saved) { 
      showToast('Failed to save after delete', 'error'); 
      return; 
    }
    
    closeDeleteModal();
    renderList();
    hasChanges = true;
    updateSyncStatus();
    showToast('Collection deleted successfully', 'success');
  });

  async function onToggleActive(e){
    const index = parseInt(e.currentTarget.dataset.index, 10);
    const checked = e.currentTarget.checked;
    collections[index].active = checked;
    
    const saved = await saveCollections(collections);
    if (!saved) { 
      showToast('Failed to update status', 'error'); 
      return; 
    }
    
    renderList();
    hasChanges = true;
    updateSyncStatus();
    showToast(`Collection ${checked ? 'activated' : 'deactivated'}`, 'success');
  }

  function updateSyncStatus() {
    if (!syncGitHubBtn) return;
    
    const pendingUploads = collections.filter(item => item.needsUpload).length;
    
    if (hasChanges || pendingUploads > 0) {
      syncGitHubBtn.innerHTML = `<i class="fas fa-upload"></i> <span>Export for GitHub${pendingUploads > 0 ? ` (${pendingUploads} images)` : ''}</span>`;
      syncGitHubBtn.classList.add('btn-warning');
      syncGitHubBtn.classList.remove('btn-secondary');
    } else {
      syncGitHubBtn.innerHTML = '<i class="fas fa-check"></i> <span>Up to Date</span>';
      syncGitHubBtn.classList.add('btn-secondary');
      syncGitHubBtn.classList.remove('btn-warning');
    }
  }

  function exportForGitHub() {
    if (collections.length === 0) {
      showToast('No collections to export', 'error');
      return;
    }

    // Create GitHub-compatible version (remove data URLs and upload flags for smaller file)
    const githubCollections = collections.map(item => {
      const { imageDataURL, needsUpload, ...cleanItem } = item;
      return cleanItem;
    });

    // Generate collections.json
    const jsonStr = JSON.stringify(githubCollections, null, 2);
    const jsonBlob = new Blob([jsonStr], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    
    // Create download link for JSON
    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl;
    jsonLink.download = 'collections.json';
    jsonLink.style.display = 'none';
    document.body.appendChild(jsonLink);
    jsonLink.click();

    // Generate image instructions if needed
    const imageInstructions = generateImageInstructions();
    if (imageInstructions) {
      const instructionsBlob = new Blob([imageInstructions], { type: 'text/plain' });
      const instructionsUrl = URL.createObjectURL(instructionsBlob);
      
      // Create download link for instructions
      const instructionsLink = document.createElement('a');
      instructionsLink.href = instructionsUrl;
      instructionsLink.download = 'GitHub-Upload-Instructions.txt';
      instructionsLink.style.display = 'none';
      document.body.appendChild(instructionsLink);
      instructionsLink.click();
      
      setTimeout(() => {
        URL.revokeObjectURL(instructionsUrl);
        document.body.removeChild(instructionsLink);
      }, 1000);
    }

    // Update sync status
    localStorage.setItem(GITHUB_SYNC_KEY, JSON.stringify({
      lastSync: Date.now(),
      collectionsCount: collections.length
    }));
    
    // Mark all images as no longer needing upload
    collections.forEach(item => {
      if (item.needsUpload) {
        delete item.needsUpload;
      }
    });
    saveCollections(collections);
    
    hasChanges = false;
    updateSyncStatus();
    renderList();
    
    const pendingImages = collections.filter(item => item.imageDataURL).length;
    const message = pendingImages > 0 
      ? `Files exported! Upload collections.json and ${pendingImages} images to GitHub, then commit.`
      : 'collections.json exported! Upload to GitHub and commit.';
    
    showToast(message, 'success');
    
    // Cleanup
    setTimeout(() => {
      URL.revokeObjectURL(jsonUrl);
      document.body.removeChild(jsonLink);
    }, 1000);
  }

  function generateImageInstructions() {
    const newImages = collections.filter(item => item.imageDataURL);
    
    if (newImages.length === 0) return null;
    
    let instructions = `# GitHub Image Upload Instructions\n\n`;
    instructions += `Generated: ${new Date().toLocaleString()}\n`;
    instructions += `Collections with new images: ${newImages.length}\n\n`;
    
    instructions += `## Quick Steps:\n`;
    instructions += `1. Right-click each image in the collection management interface\n`;
    instructions += `2. Save to your computer with the exact filename shown below\n`;
    instructions += `3. Upload to img/collections/ folder in your GitHub repository\n`;
    instructions += `4. Upload the collections.json file to the root folder\n`;
    instructions += `5. Commit all changes via GitHub Desktop\n\n`;
    
    instructions += `## Images to Upload:\n\n`;
    
    newImages.forEach((item, index) => {
      instructions += `### ${index + 1}. ${item.title}\n`;
      instructions += `   📁 Upload to: ${item.img}\n`;
      instructions += `   📝 Alt text: ${item.alt}\n`;
      instructions += `   💡 Right-click the image in collection management → Save As → Use exact filename from path above\n\n`;
    });
    
    instructions += `\n## GitHub Repository Structure:\n`;
    instructions += `your-repo/\n`;
    instructions += `├── collections.json (replace with exported file)\n`;
    instructions += `└── img/\n`;
    instructions += `    └── collections/ (upload all images here)\n`;
    instructions += `        ├── wine-emperor-indowestern.jpg\n`;
    instructions += `        ├── regal-cream-sherwani.jpg\n`;
    instructions += `        ├── maharani-legacy-lehenga.jpg\n`;
    instructions += `        └── ... (all collection images)\n\n`;
    
    instructions += `## After Upload:\n`;
    instructions += `- Your static site will automatically update\n`;
    instructions += `- New collections will appear on the main website\n`;
    instructions += `- Images will load properly from GitHub\n`;
    instructions += `\n🚀 Happy uploading!\n`;
    
    return instructions;
  }

  function slugify(str){
    return str.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  }

  async function saveCollections(data){
    try {
      if (isLocalhost) {
        // Save to server endpoint for localhost
        const response = await fetch('save-collections.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Also save to localStorage as backup
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
            return true;
          } else {
            console.error('Server error:', result.error);
            return false;
          }
        } else {
          console.error('HTTP error:', response.status);
          return false;
        }
      } else {
        // Save to localStorage for local development
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        return true;
      }
    } catch(err) {
      console.error('Save error:', err);
      return false;
    }
  }
  
  async function uploadImage(imageDataURL, filename) {
    try {
      const response = await fetch('upload-image.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: imageDataURL,
          filename: filename
        })
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
    } catch(err) {
      console.error('Upload error:', err);
      throw err;
    }
  }

  function getSampleCollections() {
    // Sample collections data for initial setup
    return [
      {
        "tags": ["men", "indowestern"],
        "img": "img/collections/men-indowestern/wine-emperor-indowestern.jpg",
        "alt": "Wine Emperor Indowestern - Men's wedding suit",
        "title": "Wine Emperor Indowestern",
        "desc": "Tailored fit • 3-piece",
        "price": "₹3999/-",
        "active": true
      },
      {
        "tags": ["men", "sherwani"],
        "img": "img/collections/men-sherwani/regal-cream-sherwani.jpg",
        "alt": "Regal Cream Sherwani - Men's traditional wear",
        "title": "Regal Cream Sherwani",
        "desc": "Zari work • Dupatta",
        "price": "₹9999/-",
        "active": true
      },
      {
        "tags": ["women", "lehenga"],
        "img": "img/collections/women-lehenga/maharani-legacy-lehenga.jpg",
        "alt": "Maharani's Legacy Lehenga - Bridal collection",
        "title": "Maharani's Legacy Lehenga",
        "desc": "Bridal collection • Heavy work",
        "price": "₹19999/-",
        "active": true
      },
      {
        "tags": ["women", "choli"],
        "img": "img/collections/women-choli/rajwada-blue-choli.jpg",
        "alt": "Rajwada Blue Choli - Traditional design",
        "title": "Rajwada Blue Choli",
        "desc": "Traditional design • Comfortable fit",
        "price": "₹7999/-",
        "active": true
      }
    ];
  }

  // Boot
  document.addEventListener('DOMContentLoaded', init);
})();