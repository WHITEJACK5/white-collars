document.addEventListener('DOMContentLoaded', function() {
  initNavbar();
  initSearchForm();
  initPasswordStrength();
  initFormValidation();
  initAnimations();
  initBackToTop();
  initAlerts();
  initJobApplications();
});

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', function() {
    if (window.scrollY > 100) {
      navbar.style.background = 'rgba(0, 0, 0, 0.98)';
      navbar.style.boxShadow = '0 8px 24px rgba(57, 255, 20, 0.1)';
    } else {
      navbar.style.background = 'rgba(0, 0, 0, 0.95)';
      navbar.style.boxShadow = 'none';
    }
  });

  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    const linkPath = new URL(link.href).pathname;
    if (currentPath === linkPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function initSearchForm() {
  const searchForm = document.querySelector('.search-form');
  if (!searchForm) return;

  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const jobTitle = document.getElementById('jobTitle')?.value.trim();
    const location = document.getElementById('location')?.value.trim();

    if (!jobTitle && !location) {
      showAlert('Please enter a job title or location', 'warning');
      return;
    }

    const params = new URLSearchParams();
    if (jobTitle) params.append('title', jobTitle);
    if (location) params.append('location', location);
    window.location.href = `/jobs?${params.toString()}`;
  });
}

function initPasswordStrength() {
  const passwordInput = document.getElementById('createPassword') || document.getElementById('password');
  if (!passwordInput) return;

  const strengthBar = document.getElementById('strengthBar');
  const strengthLabel = document.getElementById('strengthLabel');
  if (!strengthBar || !strengthLabel) return;

  passwordInput.addEventListener('input', function() {
    const password = this.value;
    const result = evaluatePasswordStrength(password);
    if (strengthBar) {
      strengthBar.style.width = result.percent + '%';
      strengthBar.className = 'strength-line ' + result.className;
    }
    if (strengthLabel) {
      strengthLabel.textContent = result.text;
      strengthLabel.className = 'strength-label ' + result.className;
    }
  });
}

function evaluatePasswordStrength(password) {
  let score = 0;
  if (!password) return { text: '', percent: 0, className: 'strength-weak' };
  if (password.length >= 6) score++;
  if (/\d/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 10) score++;
  if (score <= 2) return { text: 'Weak', percent: 25, className: 'strength-weak' };
  if (score === 3) return { text: 'Fair', percent: 50, className: 'strength-fair' };
  if (score === 4 || score === 5) return { text: 'Good', percent: 75, className: 'strength-good' };
  if (score >= 6) return { text: 'Great', percent: 100, className: 'strength-great' };
  return { text: '', percent: 0, className: 'strength-weak' };
}

function initFormValidation() {
  const forms = document.querySelectorAll('form[data-validate]');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      if (!validateForm(this)) {
        e.preventDefault();
      }
    });
  });
}

function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
  inputs.forEach(input => {
    if (!validateField(input)) {
      isValid = false;
    }
  });
  return isValid;
}

function validateField(field) {
  const value = field.value.trim();
  const type = field.type;
  let isValid = true;
  let errorMessage = '';

  if (field.hasAttribute('required') && !value) {
    isValid = false;
    errorMessage = 'This field is required';
  }

  if (type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }
  }

  if (field.id === 'password' || field.id === 'createPassword') {
    if (value.length < 6) {
      isValid = false;
      errorMessage = 'Password must be at least 6 characters';
    }
  }

  return isValid;
}

function initAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  const animateElements = document.querySelectorAll('.job-card, .card, .category-card, .company-card');
  animateElements.forEach((element, index) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(element);
  });
}

function initBackToTop() {
  const backToTopBtn = document.createElement('button');
  backToTopBtn.innerHTML = '↑';
  backToTopBtn.className = 'back-to-top';
  backToTopBtn.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(backToTopBtn);

  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      backToTopBtn.style.opacity = '1';
      backToTopBtn.style.visibility = 'visible';
    } else {
      backToTopBtn.style.opacity = '0';
      backToTopBtn.style.visibility = 'hidden';
    }
  });

  backToTopBtn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initAlerts() {
  const closeButtons = document.querySelectorAll('.alert-close');
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      this.parentElement.remove();
    });
  });
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    setTimeout(() => {
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  });
}

function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  const colors = {
    success: 'background: rgba(57, 255, 20, 0.1); border: 1px solid #39FF14; color: #39FF14;',
    error: 'background: rgba(255, 0, 0, 0.1); border: 1px solid #ff4444; color: #ff4444;',
    warning: 'background: rgba(255, 165, 0, 0.1); border: 1px solid #ffa500; color: #ffa500;',
    info: 'background: rgba(57, 255, 20, 0.1); border: 1px solid #39FF14; color: #39FF14;'
  };
  alertDiv.style.cssText = colors[type] || colors.info;
  alertDiv.innerHTML = `<span>${message}</span><button class="alert-close" style="float: right; background: none; border: none; font-size: 1.2rem; cursor: pointer; margin-left: 1rem;">&times;</button>`;
  document.body.appendChild(alertDiv);
  alertDiv.querySelector('.alert-close').addEventListener('click', function() {
    alertDiv.remove();
  });
  setTimeout(() => {
    alertDiv.style.opacity = '0';
    setTimeout(() => alertDiv.remove(), 300);
  }, 5000);
}

function initJobApplications() {
  const applyButtons = document.querySelectorAll('.apply-btn');
  applyButtons.forEach(button => {
    button.addEventListener('click', async function(e) {
      e.preventDefault();
      const jobId = this.dataset.jobId;
      if (!jobId) return;
      const isLoggedIn = document.body.dataset.userLoggedIn === 'true';
      if (!isLoggedIn) {
        showAlert('Please sign in to apply for jobs', 'warning');
        setTimeout(() => {
          window.location.href = '/auth/signin?redirect=/jobs/' + jobId;
        }, 1500);
        return;
      }
      if (confirm('Apply for this job? Your profile will be submitted to the employer.')) {
        try {
          const response = await fetch('/jobs/' + jobId + '/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId })
          });
          const result = await response.json();
          if (result.success) {
            showAlert('Application submitted successfully!', 'success');
            this.textContent = 'Applied';
            this.disabled = true;
          } else {
            showAlert(result.message || 'Application failed', 'error');
          }
        } catch (error) {
          showAlert('An error occurred. Please try again.', 'error');
        }
      }
    });
  });
}

window.WHITE_COLLARS = { showAlert, evaluatePasswordStrength };