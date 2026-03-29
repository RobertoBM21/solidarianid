document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('proposals');

  if (!container) {
    return;
  }

  container.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
      return;
    }

    const { id, action } = button.dataset;
    if (!id || !action) {
      return;
    }

    const suffix = action === 'approve' ? 'aprobar' : 'rechazar';
    const url = `/comunidades/validaciones/${id}/${suffix}`;

    const originalContent = button.innerHTML;

    try {
      button.disabled = true;
      button.innerHTML =
        '<span class="loading loading-spinner loading-xs"></span>'; // DaisyUI spinner

      await axios.post(url);

      const rowItem = button.closest('.group'); // row container
      if (rowItem) {
        rowItem.style.transition = 'opacity 0.3s, height 0.3s';
        rowItem.style.opacity = '0';
        setTimeout(() => rowItem.remove(), 300);
      }
    } catch (error) {
      console.error(`Error processing ${action}:`, error);

      button.disabled = false;
      button.innerHTML = originalContent;

      alert('Ocurrió un error al procesar la solicitud.');
    }
  });
});
