(() => {
  const userList = document.getElementById('users-list');
  if (!userList) return;
  const searchInput = document.getElementById('user-search');
  if (!searchInput) return;
  const clearSearch = document.getElementById('clear-search');
  if (!clearSearch) return;
  const pagination = document.getElementById('pagination');
  if (!pagination) return;
  const reportTitle = document.getElementById('report-title');
  if (!reportTitle) return;
  const reportUserName = document.getElementById('report-user-name');
  if (!reportUserName) return;
  const reportUserMeta = document.getElementById('report-user-meta');
  if (!reportUserMeta) return;
  const reportBody = document.getElementById('report-body');
  if (!reportBody) return;
  const downloadPdf = document.getElementById('download-pdf');
  if (!downloadPdf) return;
  const reportSheet = document.getElementById('report-sheet');
  if (!reportSheet) return;

  let page = 1;
  let totalPages = 1;
  let users = [];
  let search = '';
  let selectedUser = null;

  const renderUsers = () => {
    if (!users.length) {
      userList.innerHTML =
        "<div class='alert alert-info'>No hay usuarios para mostrar.</div>";
      return;
    }

    userList.innerHTML = users
      .map(
        (user) => `
          <div class='card border border-base-200 bg-base-100 shadow-sm'>
            <div class='card-body p-4'>
              <div class='flex items-center justify-between gap-4'>
                <div>
                  <h3 class='font-semibold'>${user.name}</h3>
                  <p class='text-sm text-base-content/60'>
                    ${user.communities.length ? user.communities.join(', ') : 'Sin comunidades'}
                  </p>
                </div>
                <button
                  class='btn btn-outline btn-sm'
                  data-user-id='${user.id}'
                  type='button'
                >
                  Ver informe
                </button>
              </div>
            </div>
          </div>
        `,
      )
      .join('');
  };

  const renderPagination = () => {
    pagination.innerHTML = '';
    for (let i = 1; i < totalPages + 1; i += 1) {
      pagination.innerHTML += `
        <button
          class='join-item btn'
          data-page='${i}'
          type='button'
          ${i === page ? 'disabled' : ''}
        >
          ${i}
        </button>
      `;
    }
  };

  const fetchUsers = async () => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    if (search) {
      params.set('search', search);
    }

    const response = await fetch(`/informes/users?${params.toString()}`);
    if (!response.ok) {
      throw new Error('No se pudo cargar la lista de usuarios.');
    }
    return response.json();
  };

  const fetchUserHistory = async (userId) => {
    const response = await fetch(`/informes/users/${userId}/contributions`);
    if (!response.ok) {
      throw new Error('No se pudo cargar el informe del usuario.');
    }
    return response.json();
  };

  const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString();
  };

  const renderHistory = (history) => {
    if (!history?.items?.length) {
      reportBody.innerHTML =
        "<p class='text-base-content/70'>No hay actividad registrada.</p>";
      return;
    }

    const itemsMarkup = history.items
      .map((item) => {
        const hasAmount = Number.isFinite(item.amount);
        const meta = hasAmount
          ? `Importe: ${item.amount} \u20ac`
          : item.end
            ? `Fin: ${formatDate(item.end)}`
            : '';
        return `
          <div class='report-item'>
            <div>
              <p class='font-semibold'>${item.subject}</p>
              <p class='report-item__meta'>${formatDate(item.date)} ${meta}</p>
            </div>
            <span class='report-item__badge'>${item.type}</span>
          </div>
        `;
      })
      .join('');

    reportBody.innerHTML = `
      <section class='report-section'>
        <h4 class='report-section__title'>Hist\u00f3rico de actividad</h4>
        <div class='report-section__items'>
          ${itemsMarkup}
        </div>
      </section>
    `;
  };

  const loadUsers = async () => {
    try {
      const usersPage = await fetchUsers();
      if (usersPage.totalPages < totalPages) {
        page = 1;
      }
      totalPages = usersPage.totalPages;
      users = usersPage.users;
      renderUsers();
      renderPagination();
    } catch (err) {
      if (userList) {
        userList.innerHTML = `<div class='alert alert-error'>${err.message}</div>`;
      }
    }
  };

  const loadHistory = async (userId, name, communities) => {
    try {
      const history = await fetchUserHistory(userId);
      selectedUser = { id: userId, name };
      if (reportTitle) reportTitle.textContent = `Informe de ${name}`;
      if (reportUserName) reportUserName.textContent = name;
      if (reportUserMeta) {
        reportUserMeta.textContent = communities?.length
          ? communities.join(', ')
          : 'Sin comunidades';
      }
      renderHistory(history);
    } catch (err) {
      if (reportBody) {
        reportBody.innerHTML = `<div class='alert alert-error'>${err.message}</div>`;
      }
    }
  };

  /**
   * Event Listeners
   */
  userList.addEventListener('click', (event) => {
    const target = event.target.closest('button[data-user-id]');
    if (!target) return;
    const userId = target.getAttribute('data-user-id');
    const card = target.closest('.card');
    const name = card?.querySelector('h3')?.textContent ?? '';
    const communitiesRaw = target.getAttribute('data-communities');
    const communities = communitiesRaw
      ? JSON.parse(decodeURIComponent(communitiesRaw))
      : card
          ?.querySelector('p.text-sm')
          ?.textContent?.trim()
          ?.split(',')
          ?.map((c) => c.trim());
    loadHistory(userId, name, communities);
  });

  pagination.addEventListener('click', (event) => {
    const target = event.target.closest('button[data-page]');
    if (!target) return;
    const newPage = parseInt(target.getAttribute('data-page'));
    if (newPage === page) return;
    page = newPage;
    loadUsers();
  });

  let searchTimer;
  searchInput.addEventListener('input', (event) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      search = event.target.value.trim();
      page = 1;
      loadUsers();
    }, 300);
  });

  clearSearch.addEventListener('click', () => {
    clearTimeout(searchTimer);
    searchInput.value = '';
    if (!search) return;
    search = '';
    page = 1;
    loadUsers();
  });

  downloadPdf.addEventListener('click', async () => {
    if (!selectedUser || !reportSheet || typeof html2pdf === 'undefined') {
      return;
    }
    if (downloadPdf.dataset.loading === 'true') {
      return;
    }

    const buildPdfNode = () => {
      const titleText = reportTitle?.textContent?.trim() ?? 'Informe';
      const nameText = reportUserName?.textContent?.trim() ?? '';
      const metaText = reportUserMeta?.textContent?.trim() ?? '';
      const items = Array.from(
        reportBody?.querySelectorAll('.report-item') ?? [],
      ).map((item) => ({
        subject:
          item.querySelector('p.font-semibold')?.textContent?.trim() ?? '',
        meta:
          item.querySelector('.report-item__meta')?.textContent?.trim() ?? '',
        type:
          item.querySelector('.report-item__badge')?.textContent?.trim() ?? '',
      }));

      const container = document.createElement('div');
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.background = '#ffffff';
      container.style.color = '#0f172a';
      container.style.border = '1px solid #e5e7eb';
      container.style.borderRadius = '16px';
      container.style.padding = '24px';
      container.style.width = '100%';

      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'flex-start';
      header.style.borderBottom = '1px solid #e5e7eb';
      header.style.paddingBottom = '12px';
      header.style.marginBottom = '16px';

      const headerText = document.createElement('div');
      const userName = document.createElement('div');
      userName.textContent = nameText || '-';
      userName.style.fontSize = '20px';
      userName.style.fontWeight = '600';
      const userMeta = document.createElement('div');
      userMeta.textContent = metaText;
      userMeta.style.fontSize = '12px';
      userMeta.style.color = '#64748b';
      headerText.appendChild(userName);
      headerText.appendChild(userMeta);

      const badge = document.createElement('div');
      badge.textContent = 'SolidarianID';
      badge.style.background = '#0f172a';
      badge.style.color = '#ffffff';
      badge.style.padding = '6px 12px';
      badge.style.borderRadius = '999px';
      badge.style.fontSize = '12px';
      badge.style.textTransform = 'uppercase';
      badge.style.letterSpacing = '1px';

      header.appendChild(headerText);
      header.appendChild(badge);

      const titleLabel = document.createElement('div');
      titleLabel.textContent = 'Informe';
      titleLabel.style.fontSize = '12px';
      titleLabel.style.textTransform = 'uppercase';
      titleLabel.style.letterSpacing = '2px';
      titleLabel.style.color = '#64748b';

      const title = document.createElement('h2');
      title.textContent = titleText;
      title.style.fontSize = '22px';
      title.style.margin = '4px 0 16px';

      const sectionTitle = document.createElement('h4');
      sectionTitle.textContent = 'Hist\u00f3rico de actividad';
      sectionTitle.style.fontSize = '14px';
      sectionTitle.style.fontWeight = '600';
      sectionTitle.style.margin = '0 0 8px';

      const list = document.createElement('div');
      list.style.display = 'flex';
      list.style.flexDirection = 'column';
      list.style.gap = '8px';

      if (!items.length) {
        const empty = document.createElement('div');
        empty.textContent = 'No hay actividad registrada.';
        empty.style.fontSize = '13px';
        empty.style.color = '#64748b';
        list.appendChild(empty);
      } else {
        items.forEach((item) => {
          const row = document.createElement('div');
          row.classList.add('no-split');
          row.style.border = '1px solid #e5e7eb';
          row.style.borderRadius = '12px';
          row.style.padding = '12px';
          row.style.display = 'flex';
          row.style.justifyContent = 'space-between';
          row.style.alignItems = 'center';
          row.style.gap = '12px';
          row.style.pageBreakInside = 'avoid';
          row.style.breakInside = 'avoid';

          const textWrap = document.createElement('div');
          const subject = document.createElement('div');
          subject.textContent = item.subject;
          subject.style.fontWeight = '600';
          const meta = document.createElement('div');
          meta.textContent = item.meta;
          meta.style.fontSize = '12px';
          meta.style.color = '#64748b';
          textWrap.appendChild(subject);
          textWrap.appendChild(meta);

          const type = document.createElement('div');
          type.textContent = item.type;
          type.style.background = '#f1f5f9';
          type.style.color = '#0f172a';
          type.style.borderRadius = '999px';
          type.style.padding = '4px 10px';
          type.style.fontSize = '12px';
          type.style.textTransform = 'uppercase';

          row.appendChild(textWrap);
          row.appendChild(type);
          list.appendChild(row);
        });
      }

      container.appendChild(titleLabel);
      container.appendChild(title);
      container.appendChild(header);
      container.appendChild(sectionTitle);
      container.appendChild(list);

      return container;
    };

    const originalText = downloadPdf.textContent ?? 'Generar PDF';
    downloadPdf.dataset.loading = 'true';
    downloadPdf.classList.add('loading', 'btn-disabled');
    downloadPdf.disabled = true;
    downloadPdf.textContent = 'Generando...';

    try {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const styleStates = Array.from(document.styleSheets).map((sheet) => ({
        sheet,
        disabled: sheet.disabled,
      }));
      styleStates.forEach(({ sheet }) => {
        try {
          sheet.disabled = true;
        } catch {
          // Ignore stylesheets we can't disable (e.g., cross-origin).
        }
      });
      const fileName = `informe-${selectedUser.name.replace(/\s+/g, '-')}.pdf`;
      const printWrapper = document.createElement('div');
      printWrapper.style.position = 'fixed';
      printWrapper.style.left = '-10000px';
      printWrapper.style.top = '0';
      printWrapper.style.width = '8.27in';
      printWrapper.style.padding = '0';
      printWrapper.style.boxSizing = 'border-box';
      printWrapper.appendChild(buildPdfNode());
      document.body.appendChild(printWrapper);
      const pdfNode = printWrapper.firstChild;
      if (pdfNode && pdfNode.style) {
        pdfNode.style.width = '100%';
        pdfNode.style.boxSizing = 'border-box';
        pdfNode.style.margin = '0';
      }

      await html2pdf()
        .set({
          margin: 0.25,
          filename: fileName,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 0.9,
            useCORS: true,
            backgroundColor: '#ffffff',
            scrollX: 0,
            scrollY: 0,
            onclone: (doc) => {
              doc
                .querySelectorAll('link[rel="stylesheet"], style')
                .forEach((el) => el.remove());
              doc.documentElement.style.color = '#0f172a';
              doc.documentElement.style.backgroundColor = '#ffffff';
              doc.body.style.color = '#0f172a';
              doc.body.style.backgroundColor = '#ffffff';
            },
          },
          jsPDF: { unit: 'in', format: 'A4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] },
        })
        .from(printWrapper.firstChild)
        .save();
      printWrapper.remove();
      styleStates.forEach(({ sheet, disabled }) => {
        try {
          sheet.disabled = disabled;
        } catch {
          // Ignore stylesheets we can't restore.
        }
      });
    } catch (err) {
      console.error('PDF error', err);
      const existing = document.querySelector('.reports-pdf-preview');
      if (existing) existing.remove();
    } finally {
      Array.from(document.styleSheets).forEach((sheet) => {
        try {
          sheet.disabled = false;
        } catch {
          // Ignore stylesheets we can't re-enable.
        }
      });
      downloadPdf.dataset.loading = 'false';
      downloadPdf.classList.remove('loading', 'btn-disabled');
      downloadPdf.disabled = false;
      downloadPdf.textContent = originalText;
    }
  });

  /**
   * Initial Load
   */
  loadUsers();
})();
