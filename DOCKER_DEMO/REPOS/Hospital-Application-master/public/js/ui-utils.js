/**
 * UI Utility Functions for Enhanced UX
 * Includes: Loading indicators, custom alerts, form validation, and accessibility features
 */

class UIUtils {
  constructor() {
    this.alertContainer = this.createAlertContainer();
    this.loadingOverlay = null;
    this.debounceTimers = new Map();
  }

  /**
   * Create alert container for custom notifications
   */
  createAlertContainer() {
    let container = document.getElementById('alert-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'alert-container';
      container.className = 'alert-container';
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Show custom alert with enhanced styling
   * @param {string} message - Alert message
   * @param {string} type - Alert type: success, danger, warning, info
   * @param {number} duration - Auto-hide duration in ms (0 = no auto-hide)
   */
  showAlert(message, type = 'info', duration = 5000) {
    const alertId = 'alert-' + Date.now();
    const alertElement = document.createElement('div');
    
    alertElement.id = alertId;
    alertElement.className = `custom-alert ${type}`;
    alertElement.setAttribute('role', 'alert');
    alertElement.setAttribute('aria-live', 'polite');
    
    // Icon mapping
    const icons = {
      success: 'fas fa-check-circle',
      danger: 'fas fa-exclamation-triangle',
      warning: 'fas fa-exclamation-circle',
      info: 'fas fa-info-circle'
    };
    
    alertElement.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="${icons[type]} me-2" aria-hidden="true"></i>
        <span class="flex-grow-1">${message}</span>
        <button type="button" class="close-btn" aria-label="Close alert">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    // Add event listener for close button
    const closeBtn = alertElement.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => this.hideAlert(alertId));

    this.alertContainer.appendChild(alertElement);

    // Auto-hide if duration is set
    if (duration > 0) {
      setTimeout(() => this.hideAlert(alertId), duration);
    }

    // Trigger reflow for animation
    alertElement.offsetHeight;
    
    return alertId;
  }

  /**
   * Hide specific alert
   * @param {string} alertId - Alert ID to hide
   */
  hideAlert(alertId) {
    const alertElement = document.getElementById(alertId);
    if (alertElement) {
      alertElement.style.animation = 'slideOutRight 0.3s ease-out forwards';
      setTimeout(() => {
        if (alertElement.parentNode) {
          alertElement.parentNode.removeChild(alertElement);
        }
      }, 300);
    }
  }

  /**
   * Clear all alerts
   */
  clearAlerts() {
    const alerts = this.alertContainer.querySelectorAll('.custom-alert');
    alerts.forEach(alert => {
      this.hideAlert(alert.id);
    });
  }

  /**
   * Show loading overlay
   * @param {string} message - Loading message
   */
  showLoading(message = 'Loading...') {
    this.hideLoading(); // Hide any existing overlay
    
    this.loadingOverlay = document.createElement('div');
    this.loadingOverlay.className = 'loading-overlay';
    this.loadingOverlay.setAttribute('aria-label', message);
    this.loadingOverlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner large"></div>
        <div class="loading-text">${message}</div>
      </div>
    `;
    
    document.body.appendChild(this.loadingOverlay);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }

  /**
   * Hide loading overlay
   */
  hideLoading() {
    if (this.loadingOverlay) {
      document.body.removeChild(this.loadingOverlay);
      this.loadingOverlay = null;
      document.body.style.overflow = ''; // Restore scrolling
    }
  }

  /**
   * Add loading state to button
   * @param {HTMLElement} button - Button element
   * @param {string} loadingText - Text to show while loading
   */
  setButtonLoading(button, loadingText = 'Loading...') {
    if (!button) return;
    
    button.disabled = true;
    button.setAttribute('data-original-text', button.innerHTML);
    button.classList.add('loading');
    button.innerHTML = `<span class="loading-spinner small"></span>${loadingText}`;
  }

  /**
   * Remove loading state from button
   * @param {HTMLElement} button - Button element
   */
  removeButtonLoading(button) {
    if (!button) return;
    
    button.disabled = false;
    button.classList.remove('loading');
    const originalText = button.getAttribute('data-original-text');
    if (originalText) {
      button.innerHTML = originalText;
      button.removeAttribute('data-original-text');
    }
  }

  /**
   * Add skeleton loading to container
   * @param {HTMLElement} container - Container element
   * @param {number} lines - Number of skeleton lines
   */
  showSkeleton(container, lines = 3) {
    if (!container) return;
    
    container.innerHTML = '';
    for (let i = 0; i < lines; i++) {
      const skeletonLine = document.createElement('div');
      skeletonLine.className = 'skeleton skeleton-text';
      container.appendChild(skeletonLine);
    }
  }

  /**
   * Enhanced form validation
   * @param {HTMLFormElement} form - Form element to validate
   * @returns {boolean} - Validation result
   */
  validateForm(form) {
    if (!form) return false;
    
    let isValid = true;
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      this.validateField(input);
      if (input.classList.contains('is-invalid')) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  /**
   * Validate individual field
   * @param {HTMLElement} field - Input field to validate
   * @returns {boolean} - Field validation result
   */
  validateField(field) {
    if (!field) return true;
    
    this.clearFieldValidation(field);
    
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !field.value.trim()) {
      isValid = false;
      errorMessage = `${this.getFieldLabel(field)} is required`;
    }
    
    // Email validation
    else if (field.type === 'email' && field.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    }
    
    // Phone validation
    else if (field.type === 'tel' && field.value) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(field.value.replace(/\D/g, ''))) {
        isValid = false;
        errorMessage = 'Please enter a valid 10-digit phone number';
      }
    }
    
    // Password validation
    else if (field.type === 'password' && field.value) {
      if (field.value.length < 6) {
        isValid = false;
        errorMessage = 'Password must be at least 6 characters long';
      }
    }
    
    // Pattern validation
    else if (field.hasAttribute('pattern') && field.value) {
      const pattern = new RegExp(field.getAttribute('pattern'));
      if (!pattern.test(field.value)) {
        isValid = false;
        errorMessage = field.getAttribute('title') || 'Invalid format';
      }
    }
    
    // Min/Max length validation
    if (isValid && field.value) {
      const minLength = field.getAttribute('minlength');
      const maxLength = field.getAttribute('maxlength');
      
      if (minLength && field.value.length < parseInt(minLength)) {
        isValid = false;
        errorMessage = `Minimum length is ${minLength} characters`;
      } else if (maxLength && field.value.length > parseInt(maxLength)) {
        isValid = false;
        errorMessage = `Maximum length is ${maxLength} characters`;
      }
    }
    
    // Apply validation styling
    if (isValid) {
      field.classList.add('is-valid');
      field.classList.remove('is-invalid');
    } else {
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
      this.showFieldError(field, errorMessage);
    }
    
    return isValid;
  }

  /**
   * Clear field validation styling
   * @param {HTMLElement} field - Input field
   */
  clearFieldValidation(field) {
    if (!field) return;
    
    field.classList.remove('is-valid', 'is-invalid');
    this.hideFieldError(field);
  }

  /**
   * Show field error message
   * @param {HTMLElement} field - Input field
   * @param {string} message - Error message
   */
  showFieldError(field, message) {
    this.hideFieldError(field);
    
    const errorElement = document.createElement('div');
    errorElement.className = 'invalid-feedback';
    errorElement.textContent = message;
    errorElement.setAttribute('data-field-error', field.name || field.id || 'field');
    
    field.parentNode.appendChild(errorElement);
  }

  /**
   * Hide field error message
   * @param {HTMLElement} field - Input field
   */
  hideFieldError(field) {
    const existingError = field.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
      existingError.remove();
    }
  }

  /**
   * Get field label for error messages
   * @param {HTMLElement} field - Input field
   * @returns {string} - Field label
   */
  getFieldLabel(field) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label) {
      return label.textContent.replace(':', '').trim();
    }
    return field.getAttribute('placeholder') || field.name || 'Field';
  }

  /**
   * Add real-time validation to form
   * @param {HTMLFormElement} form - Form element
   */
  addRealTimeValidation(form) {
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      // Validate on blur
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
      
      // Clear validation on focus
      input.addEventListener('focus', () => {
        this.clearFieldValidation(input);
      });
      
      // Debounced validation on input for text fields
      if (input.type === 'text' || input.type === 'email' || input.type === 'tel' || input.tagName === 'TEXTAREA') {
        input.addEventListener('input', () => {
          this.debounce(`validate-${input.id || input.name}`, () => {
            if (input.value.length > 2) { // Only validate after some input
              this.validateField(input);
            }
          }, 500);
        });
      }
    });
  }

  /**
   * Debounce function calls
   * @param {string} key - Unique key for the debounced function
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   */
  debounce(key, func, delay) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    
    const timer = setTimeout(() => {
      func();
      this.debounceTimers.delete(key);
    }, delay);
    
    this.debounceTimers.set(key, timer);
  }

  /**
   * Show confirmation modal
   * @param {string} title - Modal title
   * @param {string} message - Confirmation message
   * @param {string} confirmText - Confirm button text
   * @param {string} cancelText - Cancel button text
   * @returns {Promise<boolean>} - User confirmation result
   */
  showConfirm(title, message, confirmText = 'Confirm', cancelText = 'Cancel') {
    return new Promise((resolve) => {
      // Remove existing modal if any
      const existingModal = document.getElementById('ui-confirm-modal');
      if (existingModal) {
        existingModal.remove();
      }
      
      const modalHtml = `
        <div class="modal fade" id="ui-confirm-modal" tabindex="-1" aria-labelledby="confirmModalLabel">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="confirmModalLabel">${title}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <p>${message}</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${cancelText}</button>
                <button type="button" class="btn btn-danger" id="confirm-btn">${confirmText}</button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      
      const modal = new bootstrap.Modal(document.getElementById('ui-confirm-modal'));
      const confirmBtn = document.getElementById('confirm-btn');
      
      confirmBtn.addEventListener('click', () => {
        modal.hide();
        resolve(true);
      });
      
      document.getElementById('ui-confirm-modal').addEventListener('hidden.bs.modal', () => {
        document.getElementById('ui-confirm-modal').remove();
        resolve(false);
      });
      
      modal.show();
    });
  }

  /**
   * Format phone number as user types (simplified for 10-digit numbers)
   * @param {HTMLElement} input - Phone input element
   */
  formatPhoneInput(input) {
    if (!input) return;
    
    // Set maxlength to 10 for plain digits
    input.setAttribute('maxlength', '10');
    input.setAttribute('placeholder', 'Enter 10-digit number');
    
    input.addEventListener('input', (e) => {
      // Only allow digits
      let value = e.target.value.replace(/\D/g, '');
      
      // Limit to 10 digits
      if (value.length > 10) {
        value = value.slice(0, 10);
      }
      
      e.target.value = value;
    });
    
    // Handle paste events to clean pasted content
    input.addEventListener('paste', (e) => {
      setTimeout(() => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) {
          value = value.slice(0, 10);
        }
        e.target.value = value;
      }, 0);
    });
    
    // Add visual feedback when valid
    input.addEventListener('blur', () => {
      if (input.value.length === 10) {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');
      } else if (input.value.length > 0) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
      }
    });
  }

  /**
   * Add loading state to any element
   * @param {HTMLElement} element - Element to add loading state
   * @param {string} message - Loading message
   */
  addElementLoading(element, message = 'Loading...') {
    if (!element) return;
    
    element.classList.add('position-relative');
    element.style.pointerEvents = 'none';
    element.style.opacity = '0.6';
    
    const loadingEl = document.createElement('div');
    loadingEl.className = 'position-absolute top-50 start-50 translate-middle';
    loadingEl.innerHTML = `
      <div class="d-flex flex-column align-items-center">
        <div class="loading-spinner"></div>
        <small class="mt-2 text-muted">${message}</small>
      </div>
    `;
    loadingEl.setAttribute('data-loading-indicator', '');
    
    element.appendChild(loadingEl);
  }

  /**
   * Remove loading state from element
   * @param {HTMLElement} element - Element to remove loading state
   */
  removeElementLoading(element) {
    if (!element) return;
    
    element.style.pointerEvents = '';
    element.style.opacity = '';
    
    const loadingEl = element.querySelector('[data-loading-indicator]');
    if (loadingEl) {
      loadingEl.remove();
    }
  }

  /**
   * Initialize tooltips for elements with data-bs-toggle="tooltip"
   */
  initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  /**
   * Smooth scroll to element
   * @param {string} selector - Element selector or ID
   * @param {number} offset - Offset from top in pixels
   */
  scrollTo(selector, offset = 0) {
    const element = document.querySelector(selector);
    if (element) {
      const targetPosition = element.offsetTop - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }
}

// Create global instance
const ui = new UIUtils();

// Add CSS for slide out animation
const slideOutCSS = `
@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
`;

// Inject slide out CSS
if (!document.getElementById('ui-utils-css')) {
  const style = document.createElement('style');
  style.id = 'ui-utils-css';
  style.textContent = slideOutCSS;
  document.head.appendChild(style);
}

// Make ui instance globally available
window.ui = ui;

// Initialize tooltips when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  ui.initTooltips();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIUtils;
}
