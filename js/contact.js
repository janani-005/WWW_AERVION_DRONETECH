/**
 * AERVION DRONETECH SOLUTIONS PVT. LTD.
 * Contact Form & Quote Request JavaScript Integration for Spring Boot Microservice
 */

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm') || document.getElementById('aervion-contact-form');
  const alertContainer = document.getElementById('form-alert-container');
  const modal = document.getElementById('contact-modal');
  const closeModalBtn = document.getElementById('close-modal');

  if (!contactForm) return;

  // Resolve Spring Boot REST API Endpoint
  const getApiEndpoint = () => {
    if (window.AERVION_CONFIG && window.AERVION_CONFIG.SPRING_BOOT_API_URL) {
      return window.AERVION_CONFIG.SPRING_BOOT_API_URL;
    }
    const formAction = contactForm.getAttribute('action');
    if (formAction && formAction.startsWith('http')) {
      return formAction;
    }
    return 'http://localhost:8080/api/contact';
  };

  // Helper: Display field-level error
  const showError = (field, message) => {
    const parent = field.closest('.form-group');
    if (!parent) return;
    parent.classList.add('error');
    let errorEl = parent.querySelector('.error-msg');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'error-msg';
      parent.appendChild(errorEl);
    }
    errorEl.textContent = message;
  };

  // Helper: Clear field-level error
  const clearError = (field) => {
    const parent = field.closest('.form-group');
    if (!parent) return;
    parent.classList.remove('error');
  };

  // Helper: Clear all field errors
  const clearAllErrors = () => {
    const errorGroups = contactForm.querySelectorAll('.form-group.error');
    errorGroups.forEach(group => group.classList.remove('error'));
    if (alertContainer) {
      alertContainer.style.display = 'none';
      alertContainer.className = 'form-alert';
      alertContainer.innerHTML = '';
    }
  };

  // Helper: Show top alert banner
  const showAlert = (type, title, message) => {
    if (!alertContainer) return;
    alertContainer.className = `form-alert alert-${type}`;
    alertContainer.style.display = 'flex';
    alertContainer.innerHTML = `
      <div class="alert-icon">
        ${type === 'success' 
          ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
          : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
        }
      </div>
      <div class="alert-body">
        <strong>${title}</strong>
        <p>${message}</p>
      </div>
    `;
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // Validation rules
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[+]?[0-9\s\-\(\)]{7,20}$/.test(phone);

  // Attach blur event listeners for interactive validation
  const inputs = contactForm.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      const val = input.value.trim();
      if (input.hasAttribute('required') && !val) {
        showError(input, 'This field is required.');
      } else if (input.id === 'fullName' && val.length < 2) {
        showError(input, 'Full name must be at least 2 characters.');
      } else if (input.type === 'email' && val && !validateEmail(val)) {
        showError(input, 'Please enter a valid email address.');
      } else if (input.type === 'tel' && val && !validatePhone(val)) {
        showError(input, 'Please enter a valid phone number (7 to 20 digits).');
      } else if (input.id === 'message' && val.length < 10) {
        showError(input, 'Please provide project details (minimum 10 characters).');
      } else {
        clearError(input);
      }
    });

    input.addEventListener('input', () => clearError(input));
  });

  // Handle Form Submission
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors();

    let isValid = true;

    // Validate all fields prior to sending payload
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const serviceTypeInput = document.getElementById('serviceType');
    const messageInput = document.getElementById('message');

    if (fullNameInput && (!fullNameInput.value.trim() || fullNameInput.value.trim().length < 2)) {
      showError(fullNameInput, 'Full Name or Organization must be at least 2 characters.');
      isValid = false;
    }
    if (emailInput && (!emailInput.value.trim() || !validateEmail(emailInput.value.trim()))) {
      showError(emailInput, 'Please provide a valid email address.');
      isValid = false;
    }
    if (phoneInput && (!phoneInput.value.trim() || !validatePhone(phoneInput.value.trim()))) {
      showError(phoneInput, 'Please provide a valid phone number (7-20 digits).');
      isValid = false;
    }
    if (serviceTypeInput && !serviceTypeInput.value) {
      showError(serviceTypeInput, 'Please select a required drone service category.');
      isValid = false;
    }
    if (messageInput && (!messageInput.value.trim() || messageInput.value.trim().length < 10)) {
      showError(messageInput, 'Please provide a project overview (at least 10 characters).');
      isValid = false;
    }

    if (!isValid) {
      showAlert('danger', 'Validation Error', 'Please complete all required fields correctly before submitting.');
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="btn-spinner"></span>
        <span>Sending Request to Server...</span>
      `;
    }

    const requestPayload = {
      fullName: fullNameInput ? fullNameInput.value.trim() : '',
      email: emailInput ? emailInput.value.trim() : '',
      phone: phoneInput ? phoneInput.value.trim() : '',
      serviceType: serviceTypeInput ? serviceTypeInput.value : '',
      message: messageInput ? messageInput.value.trim() : ''
    };

    const targetUrl = getApiEndpoint();
    console.log(`[Aervion Contact] Posting JSON payload to: ${targetUrl}`, requestPayload);

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      const responseData = await response.json().catch(() => null);

      if (response.ok && responseData && responseData.success) {
        // SUCCESS HANDLING (HTTP 200/201)
        showAlert(
          'success',
          'Quote Request Sent Successfully!',
          responseData.message || 'Thank you for reaching out to Aervion DroneTech Solutions Pvt. Ltd.! Our technical team will get back to you within 24 hours.'
        );

        if (modal) {
          const modalMessage = modal.querySelector('.modal-message');
          if (modalMessage) {
            modalMessage.textContent = responseData.message || 'Your quote request has been transmitted directly to our flight operations desk.';
          }
          modal.classList.add('active');
        }

        contactForm.reset();

      } else if (response.status === 400 && responseData && responseData.errors) {
        // VALIDATION ERROR HANDLING FROM SPRING BOOT DTO (@Valid)
        showAlert(
          'danger',
          'Submission Validation Error',
          responseData.message || 'One or more fields failed server validation.'
        );

        // Highlight exact server field errors
        Object.keys(responseData.errors).forEach(fieldKey => {
          const matchingInput = document.getElementById(fieldKey);
          if (matchingInput) {
            showError(matchingInput, responseData.errors[fieldKey]);
          }
        });

      } else {
        // SERVER OR SMTP FAILURE (HTTP 500 or status error)
        const errorMsg = (responseData && responseData.message)
          ? responseData.message
          : `Server returned error status (${response.status}). Unable to process email dispatch.`;

        showAlert('danger', 'Server Error', errorMsg);
      }

    } catch (netErr) {
      // NETWORK / CONNECTION FAILURE
      console.error('[Aervion Contact] Network error calling Spring Boot backend:', netErr);
      showAlert(
        'danger',
        'Connection Error',
        `Unable to reach the Spring Boot backend service at <code>${targetUrl}</code>. Please make sure the service is running, or contact us directly at <a href="mailto:Info@aerviondronetechsolutions.in">Info@aerviondronetechsolutions.in</a>.`
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    }
  });

  // Modal Close Handlers
  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
});
