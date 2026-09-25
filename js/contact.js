/**
 * AERVION DRONETECH SOLUTIONS PVT. LTD. - Contact & Quote Form Handling
 */
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
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Processing Request...</span>`;
      }

      setTimeout(() => {
        if (modal) {
          modal.classList.add('active');
        } else {
          alert('Thank you for reaching out to Aervion DroneTech Solutions Pvt. Ltd.! Your quote request has been submitted successfully.');
        }

        contactForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Submit Quote Request</span> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
        }
      }, 800);
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
