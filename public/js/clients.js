/**
 * Client Management UI Functions
 * Handles DOM manipulation and user interactions for client pages
 */

/**
 * Show loading spinner
 * @param {string} containerId - ID of the container element
 */
function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading...</p>
      </div>
    `;
  }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 * @param {string} containerId - ID of the container element (optional)
 */
function showError(message, containerId = null) {
  const alertHtml = `
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <strong>Error:</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  
  if (containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = alertHtml;
    }
  } else {
    // Insert at top of main content
    const main = document.querySelector('main') || document.body;
    main.insertAdjacentHTML('afterbegin', alertHtml);
  }
}

/**
 * Show success message
 * @param {string} message - Success message to display
 */
function showSuccess(message) {
  const alertHtml = `
    <div class="alert alert-success alert-dismissible fade show" role="alert">
      <i class="bi bi-check-circle-fill me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  
  const main = document.querySelector('main') || document.body;
  main.insertAdjacentHTML('afterbegin', alertHtml);
  
  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    const alert = main.querySelector('.alert-success');
    if (alert) {
      alert.remove();
    }
  }, 3000);
}

/**
 * Confirm delete action
 * @param {string} clientName - Name of the client to delete
 * @returns {boolean} True if confirmed
 */
function confirmDelete(clientName) {
  return confirm(`Are you sure you want to delete "${clientName}"?\n\nThis action cannot be undone.`);
}

/**
 * Format date string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get URL parameter
 * @param {string} name - Parameter name
 * @returns {string|null} Parameter value
 */
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

