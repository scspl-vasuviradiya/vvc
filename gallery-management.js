// Gallery Management Script
(function(){
  'use strict';

  const GALLERY_MANIFEST = 'gallery_manifest.json';
  const GALLERY_DIR = 'img/gallery';
  
  // Detect if running from localhost
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Use same origin for API calls (same protocol, host, and port as the current page)
  const baseUrl = window.location.origin;

  // Elements
  const uploadForm = document.getElementById('gallery-upload-form');
  const categorySelect = document.getElementById('category');
  const uploadArea = document.getElementById('upload-area');
  const imageInput = document.getElementById('image-input');
  const uploadStatus = document.getElementById('upload-status');
  const refreshBtn = document.getElementById('refresh-btn');
  
  const categoryTabs = document.querySelectorAll('.category-tab');
  const galleryGrid = document.getElementById('gallery-grid');
  const galleryStats = document.getElementById('gallery-stats');
  const noImagesEl = document.getElementById('no-images');
  const bulkActions = document.getElementById('bulk-actions');
  const selectedCount = document.getElementById('selected-count');
  const deleteSelectedBtn = document.getElementById('delete-selected-btn');
  
  // Toast
  const toast = document.getElementById('toast');
  const toastMsg = toast?.querySelector('.toast-message');
  const toastClose = toast?.querySelector('.toast-close');
  
  // Delete modal
  const deleteModal = document.getElementById('delete-modal');
  const modalClose = document.getElementById('modal-close');
  const cancelDelete = document.getElementById('cancel-delete');
  const confirmDelete = document.getElementById('confirm-delete');
  const deleteMessage = document.getElementById('delete-message');
  
  // State
  let galleryManifest = { Male: 0, Female: 0 };
  let currentCategory = 'all';
  let selectedImages = new Set();
  let pendingDelete = null;

  function showToast(message, type='info'){
    if (!toast) return;
    toastMsg.textContent = message;
    toast.classList.add('show');
    
    toast.className = 'toast show';
    if (type === 'success') toast.classList.add('toast-success');
    if (type === 'error') toast.classList.add('toast-error');
    if (type === 'warning') toast.classList.add('toast-warning');
    
    setTimeout(()=> toast.classList.remove('show'), 4000);
  }
  toastClose?.addEventListener('click', ()=> toast.classList.remove('show'));

  // Show server mode notice
  if (isLocalhost) {
    const devNotice = document.getElementById('dev-notice');
    if (devNotice) {
      devNotice.style.display = 'flex';
    }
  }

  function openDeleteModal(deleteData) {
    pendingDelete = deleteData;
    if (deleteData.bulk) {
      deleteMessage.textContent = `Are you sure you want to delete ${deleteData.images.length} selected image(s)? This action cannot be undone.`;
    } else {
      deleteMessage.textContent = `Are you sure you want to delete ${deleteData.filename}? This action cannot be undone.`;
    }
    deleteModal.classList.add('active');
  }
  
  function closeDeleteModal() {
    pendingDelete = null;
    deleteModal.classList.remove('active');
  }
  
  modalClose?.addEventListener('click', closeDeleteModal);
  cancelDelete?.addEventListener('click', closeDeleteModal);

  // Initialize
  async function init() {
    await loadGalleryManifest();
    await loadGalleryImages();
    bindUpload();
    bindEventListeners();
    updateStats();
  }

  async function loadGalleryManifest() {
    try {
      const response = await fetch(GALLERY_MANIFEST + '?v=' + Date.now());
      if (response.ok) {
        galleryManifest = await response.json();
      } else {
        // Create default manifest if it doesn't exist
        galleryManifest = { Male: 0, Female: 0 };
      }
    } catch (error) {
      console.error('Error loading gallery manifest:', error);
      galleryManifest = { Male: 0, Female: 0 };
    }
  }

  async function saveGalleryManifest() {
    if (!isLocalhost) {
      showToast('Server mode required to save manifest', 'error');
      return false;
    }

    try {
      const response = await fetch('gallery-manifest.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(galleryManifest)
      });

      const result = await response.json();
      if (result.success) {
        return true;
      } else {
        showToast('Failed to save gallery manifest: ' + result.error, 'error');
        return false;
      }
    } catch (error) {
      showToast('Error saving gallery manifest: ' + error.message, 'error');
      return false;
    }
  }

  async function loadGalleryImages() {
    if (!isLocalhost) {
      showToast('Server mode required to load images', 'warning');
      return;
    }

    try {
      const apiUrl = `${baseUrl}/gallery-list.php`;
      console.log('Fetching gallery from:', apiUrl);
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        displayGalleryImages(result.images || []);
        // Update manifest from server data
        updateManifestFromImages(result.images || []);
      } else {
        showToast('Failed to load gallery images: ' + (result.error || 'Unknown error'), 'error');
        displayGalleryImages([]);
      }
    } catch (error) {
      console.error('Gallery load error:', error);
      showToast('Error loading gallery images: ' + error.message, 'error');
      displayGalleryImages([]);
    }
  }

  function displayGalleryImages(images) {
    galleryGrid.innerHTML = '';
    selectedImages.clear();
    updateBulkActions();

    if (!images || images.length === 0) {
      noImagesEl.classList.remove('hidden');
      return;
    }

    noImagesEl.classList.add('hidden');

    // Filter images by current category
    const filteredImages = currentCategory === 'all' 
      ? images 
      : images.filter(img => img.category === currentCategory);

    filteredImages.forEach(image => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.innerHTML = `
        <img src="${image.path}" alt="Gallery Image ${image.filename}" 
             onerror="this.src='img/logo/logo.png'">
        <div class="gallery-item-info">
          <strong>${image.filename}</strong>
          <div style="color: #666; font-size: 0.9em;">
            Category: ${image.category} • Size: ${formatFileSize(image.size)}
          </div>
        </div>
        <div class="gallery-item-actions">
          <label class="checkbox-container">
            <input type="checkbox" class="image-checkbox" 
                   data-category="${image.category}" 
                   data-filename="${image.filename}">
            <span class="checkmark"></span>
          </label>
          <button class="btn btn-danger btn-sm delete-image-btn" 
                  data-category="${image.category}" 
                  data-filename="${image.filename}">
            <i class="fas fa-trash"></i>
            Delete
          </button>
        </div>
      `;
      galleryGrid.appendChild(item);
    });

    // Bind delete buttons
    document.querySelectorAll('.delete-image-btn').forEach(btn => {
      btn.addEventListener('click', handleDeleteSingle);
    });

    // Bind checkboxes
    document.querySelectorAll('.image-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', handleCheckboxChange);
    });
  }

  function handleCheckboxChange(e) {
    const checkbox = e.target;
    const imageId = `${checkbox.dataset.category}/${checkbox.dataset.filename}`;
    
    if (checkbox.checked) {
      selectedImages.add(imageId);
    } else {
      selectedImages.delete(imageId);
    }
    
    updateBulkActions();
  }

  function updateBulkActions() {
    const count = selectedImages.size;
    if (count > 0) {
      bulkActions.style.display = 'flex';
      selectedCount.textContent = `${count} selected`;
    } else {
      bulkActions.style.display = 'none';
    }
  }

  function handleDeleteSingle(e) {
    const btn = e.target.closest('.delete-image-btn');
    const category = btn.dataset.category;
    const filename = btn.dataset.filename;
    
    openDeleteModal({
      bulk: false,
      category,
      filename
    });
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function updateManifestFromImages(images) {
    // Count images by category
    const counts = { Male: 0, Female: 0 };
    if (images && Array.isArray(images)) {
      images.forEach(img => {
        if (img.category && counts.hasOwnProperty(img.category)) {
          counts[img.category]++;
        }
      });
    }
    galleryManifest = counts;
  }

  function updateStats() {
    const total = Object.values(galleryManifest).reduce((sum, count) => sum + count, 0);
    
    galleryStats.innerHTML = `
      <div class="stat-card">
        <div class="stat-number">${total}</div>
        <div class="stat-label">Total Images</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${galleryManifest.Male || 0}</div>
        <div class="stat-label">Male Gallery</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${galleryManifest.Female || 0}</div>
        <div class="stat-label">Female Gallery</div>
      </div>
    `;
  }

  function bindUpload() {
    uploadArea.addEventListener('click', () => imageInput.click());

    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      if (files.length > 0) {
        imageInput.files = createFileList(files);
        updateUploadStatus(files);
      }
    });

    imageInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      updateUploadStatus(files);
    });
  }

  function createFileList(files) {
    const dt = new DataTransfer();
    files.forEach(file => dt.items.add(file));
    return dt.files;
  }

  function updateUploadStatus(files) {
    if (files.length === 0) {
      uploadStatus.innerHTML = '';
      return;
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    uploadStatus.innerHTML = `
      <strong>${files.length} file(s) selected</strong> (${formatFileSize(totalSize)})<br>
      <small style="color: #16a34a;">Ready to upload to gallery</small>
    `;
  }

  function bindEventListeners() {
    uploadForm.addEventListener('submit', handleUpload);
    refreshBtn.addEventListener('click', () => {
      loadGalleryManifest();
      loadGalleryImages();
      updateStats();
    });

    categoryTabs.forEach(tab => {
      tab.addEventListener('click', handleCategoryChange);
    });

    deleteSelectedBtn.addEventListener('click', handleDeleteSelected);
    confirmDelete.addEventListener('click', handleConfirmDelete);
  }

  function handleCategoryChange(e) {
    const newCategory = e.target.dataset.category;
    currentCategory = newCategory;

    // Update active tab
    categoryTabs.forEach(tab => tab.classList.remove('active'));
    e.target.classList.add('active');

    // Reload images with new filter
    loadGalleryImages();
  }

  function handleDeleteSelected() {
    if (selectedImages.size === 0) return;
    
    const images = Array.from(selectedImages).map(imageId => {
      const [category, filename] = imageId.split('/');
      return { category, filename };
    });

    openDeleteModal({
      bulk: true,
      images
    });
  }

  async function handleConfirmDelete() {
    if (!pendingDelete || !isLocalhost) {
      closeDeleteModal();
      return;
    }

    try {
      let response;
      const deleteApiUrl = `${baseUrl}/gallery-delete.php`;
      
      if (pendingDelete.bulk) {
        // Bulk delete
        response = await fetch(deleteApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bulk: true,
            images: pendingDelete.images
          })
        });
      } else {
        // Single delete
        response = await fetch(deleteApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: pendingDelete.category,
            filename: pendingDelete.filename
          })
        });
      }

      const result = await response.json();
      if (result.success) {
        if (result.manifest) {
          galleryManifest = result.manifest;
        }
        
        showToast(pendingDelete.bulk 
          ? `${pendingDelete.images.length} image(s) deleted successfully`
          : 'Image deleted successfully', 'success');
        
        // Refresh display
        await loadGalleryImages();
        updateStats();
      } else {
        showToast('Delete failed: ' + result.error, 'error');
      }
    } catch (error) {
      showToast('Error deleting image(s): ' + error.message, 'error');
    }

    closeDeleteModal();
  }

  async function handleUpload(e) {
    e.preventDefault();
    
    if (!isLocalhost) {
      showToast('Server mode required for upload', 'error');
      return;
    }
    
    // Upload endpoint is now available in Node.js server

    const category = categorySelect.value;
    const files = imageInput.files;

    if (!category) {
      showToast('Please select a category', 'error');
      return;
    }

    if (!files || files.length === 0) {
      showToast('Please select at least one image', 'error');
      return;
    }

    // Validate files
    for (let file of files) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select only image files', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast(`File ${file.name} is too large. Maximum size is 5MB`, 'error');
        return;
      }
    }

    try {
      uploadStatus.innerHTML = `<div style="color: #0066cc;">Uploading ${files.length} image(s)...</div>`;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('image', file);
        formData.append('category', category);

        uploadStatus.innerHTML = `<div style="color: #0066cc;">Uploading image ${i + 1} of ${files.length}...</div>`;

        const apiUrl = `${baseUrl}/gallery-upload.php`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(`Failed to upload ${file.name}: ${result.error}`);
        }
      }

      // Get updated manifest
      const manifestApiUrl = `${baseUrl}/gallery-manifest.php`;
      const manifestResponse = await fetch(manifestApiUrl);
      const manifestResult = await manifestResponse.json();
      if (manifestResult.success) {
        galleryManifest = manifestResult.manifest;
      }

      showToast(`${files.length} image(s) uploaded successfully`, 'success');
      
      // Reset form and refresh display
      uploadForm.reset();
      uploadStatus.innerHTML = '';
      await loadGalleryImages();
      updateStats();

    } catch (error) {
      showToast('Upload error: ' + error.message, 'error');
      uploadStatus.innerHTML = `<div style="color: #cc0000;">Upload failed: ${error.message}</div>`;
    }
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', init);

})();