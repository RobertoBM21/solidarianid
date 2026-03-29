document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');

  if (!form) {
    return;
  }

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const passwordInput = document.getElementById('password');
  const errorContainer = document.getElementById('js-error-container');
  const errorMessage = document.getElementById('js-error-message');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let isValid = true;
    let message = '';

    const nameValue = nameInput.value.trim();
    const emailValue = emailInput.value.trim();
    const phoneValue = phoneInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    if (!nameInput.checkValidity()) {
      isValid = false;
      if (nameInput.validity.valueMissing) {
        message = 'El nombre no puede estar vacío.';
      } else {
        message =
          'El nombre solo puede contener letras y espacios (no números ni símbolos).';
      }
    } else if (!emailInput.checkValidity()) {
      isValid = false;
      if (emailInput.validity.valueMissing) {
        message = 'El correo electrónico es obligatorio.';
      } else {
        message = 'Por favor, introduce un correo electrónico válido.';
      }
    } else if (!phoneInput.checkValidity()) {
      isValid = false;
      message = 'El teléfono es obligatorio.';
    } else if (!passwordInput.checkValidity()) {
      isValid = false;
      if (passwordInput.validity.tooShort) {
        message = 'La contraseña debe tener al menos 8 caracteres.';
      } else {
        message = 'La contraseña es obligatoria.';
      }
    }

    if (!isValid) {
      showError(message);
    } else {
      hideError();

      const button = form.querySelector('button[type="submit"]');
      const originalContent = button.innerHTML;
      button.disabled = true;
      button.innerHTML =
        '<span class="loading loading-spinner loading-xs"></span>';

      axios
        .post('/auth/register', {
          name: nameValue,
          email: emailValue,
          phone: phoneValue,
          password: passwordValue,
        })
        .then(() => {
          window.location.href = '/auth/login';
        })
        .catch((error) => {
          console.error('Register error:', error);
          const msg =
            error.response?.data?.message ||
            'Error al registrarse. Inténtelo de nuevo.';
          showError(msg);
          button.disabled = false;
          button.innerHTML = originalContent;
        });
    }
  });

  function showError(msg) {
    errorMessage.textContent = msg;
    errorContainer.classList.remove('hidden');
    errorContainer.classList.add('flex');
  }

  function hideError() {
    errorContainer.classList.add('hidden');
    errorContainer.classList.remove('flex');
    errorMessage.textContent = '';
  }
});
