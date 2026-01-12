document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');

  if (!form) {
    return;
  }

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorContainer = document.getElementById('js-error-container');
  const errorMessage = document.getElementById('js-error-message');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let isValid = true;
    let message = '';

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value;

    if (!emailValue) {
      isValid = false;
      message = 'El correo electrónico es obligatorio.';
    } else if (!emailInput.checkValidity()) {
      isValid = false;
      message = 'Por favor, introduce un correo electrónico válido.';
    } else if (!passwordValue) {
      isValid = false;
      message = 'La contraseña es obligatoria.';
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
        .post('/auth/login', {
          email: emailValue,
          password: passwordValue,
        })
        .then(() => {
          window.location.href = '/';
        })
        .catch((error) => {
          const msg =
            error.response?.data?.message ||
            'Error al iniciar sesión. Inténtelo de nuevo.';
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
