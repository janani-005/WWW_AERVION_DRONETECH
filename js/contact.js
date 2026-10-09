/**
 * AERVION DRONETECH SOLUTIONS PVT. LTD. - Contact & Quote Form Handling
 */

// Google Apps Script Web App URL (Deploy > New deployment > Web app) - see google-apps-script/Code.gs
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwl3rnUPKdPGHgOy7AKSGb-A4-mzRtVyiqOuLGY3jW4hXj-azJL-fCfacFGki1SRuBM3g/exec';

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm') || document.getElementById('aervion-contact-form');
  const modal = document.getElementById('contact-modal');
  const closeModalBtn = document.getElementById('close-modal');

  if (!contactForm) return;

  // Real-time Field Validation Helpers
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

  const clearError = (field) => {
    const parent = field.closest('.form-group');
    if (!parent) return;
    parent.classList.remove('error');
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^[0-9+\s-]{8,15}$/.test(phone);
  };

  // Add blur listener to inputs
  const inputs = contactForm.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      if (input.hasAttribute('required') && !input.value.trim()) {
        showError(input, 'This field is required.');
      } else if (input.type === 'email' && input.value && !validateEmail(input.value)) {
        showError(input, 'Please enter a valid email address.');
      } else if (input.type === 'tel' && input.value && !validatePhone(input.value)) {
        showError(input, 'Please enter a valid phone number.');
      } else {
        clearError(input);
      }
    });

    input.addEventListener('input', () => clearError(input));
  });

  // Form Submission Handler
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    inputs.forEach(input => {
      if (input.hasAttribute('required') && !input.value.trim()) {
        showError(input, 'This field is required.');
        isValid = false;
      } else if (input.type === 'email' && input.value && !validateEmail(input.value)) {
        showError(input, 'Please enter a valid email address.');
        isValid = false;
      } else if (input.type === 'tel' && input.value && !validatePhone(input.value)) {
        showError(input, 'Please enter a valid phone number.');
        isValid = false;
      }
    });

    if (isValid) {
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Processing Request...</span>`;
      }

      // Sends every named field (fullName, email, phone, serviceType, message, website) as form-encoded data.
      // Form encoding keeps this a "simple" CORS request, which Apps Script web apps accept.
      const formData = new URLSearchParams(new FormData(contactForm));
      formData.append('page', window.location.href);

      fetch(GOOGLE_SHEET_URL, { method: 'POST', body: formData })
        .then((response) => response.json())
        .then((data) => {
          if (data.result !== 'success') throw new Error(data.error || 'Submission rejected');
          if (modal) {
            modal.classList.add('active');
          } else {
            alert('Thank you for reaching out to Aervion DroneTech Solutions Pvt. Ltd.! Your quote request has been submitted successfully.');
          }
          contactForm.reset();
        })
        .catch((error) => {
          console.error('Google Sheet submission failed:', error);
          alert('Sorry, your request could not be sent. Please try again or contact us directly by phone or email.');
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
          }
        });
    }
  });

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
});
