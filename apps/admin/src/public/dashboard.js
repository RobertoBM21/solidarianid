(() => {
  const data = JSON.parse(
    document.getElementById('dashboard-stats-data').textContent,
  );

  const monthLabels = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];
  const activity = data.activity ?? [];
  const activityTotals = new Map();

  activity.forEach((row) => {
    const key = `${row.year}-${row.month}`;
    const entry = activityTotals.get(key) ?? {
      year: row.year,
      month: row.month,
      causes: 0,
      communities: new Set(),
    };
    entry.causes += row.newCauses;
    entry.communities.add(row.communityId);
    activityTotals.set(key, entry);
  });

  const sortedActivity = Array.from(activityTotals.values()).sort((a, b) => {
    if (a.year === b.year) {
      return a.month - b.month;
    }
    return a.year - b.year;
  });

  const lineLabels = sortedActivity.map(
    (item) => `${monthLabels[item.month - 1]} ${item.year}`,
  );
  const lineCauses = sortedActivity.map((item) => item.causes);
  const lineCommunities = sortedActivity.map((item) => item.communities.size);

  const palette = [
    '#1d4ed8',
    '#0f766e',
    '#f97316',
    '#7c3aed',
    '#db2777',
    '#0891b2',
    '#ca8a04',
    '#16a34a',
  ];

  const odsEntries = data.odsCount ? Object.entries(data.odsCount) : [];
  const odsLabels = odsEntries.map(([ods]) => `ODS ${ods}`);
  const odsValues = odsEntries.map(([, count]) => count);
  const odsColors = odsLabels.map(
    (_, index) => palette[index % palette.length],
  );

  const barCommunities = data.communities?.map((item) => item.name) ?? [];
  const barUsers = data.communities?.map((item) => item.users) ?? [];
  const barAdmins = data.communities?.map((item) => item.admins) ?? [];
  const barActive = data.communities?.map((item) => item.activeCauses) ?? [];
  const barClosed = data.communities?.map((item) => item.closedCauses) ?? [];
  const barOds = data.communities?.map((item) => item.odsCovered) ?? [];
  const barSupports = data.communities?.map((item) => item.supports) ?? [];

  const charts = [
    {
      id: 'platform-activity',
      type: 'line',
      data: {
        labels: lineLabels,
        datasets: [
          {
            label: 'Comunidades',
            data: lineCommunities,
            borderColor: '#1d4ed8',
            backgroundColor: 'rgba(29, 78, 216, 0.15)',
            tension: 0.35,
          },
          {
            label: 'Causas',
            data: lineCauses,
            borderColor: '#0f766e',
            backgroundColor: 'rgba(15, 118, 110, 0.15)',
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
        },
        scales: {
          y: { beginAtZero: true },
        },
      },
    },
    {
      id: 'ods-chart',
      type: 'doughnut',
      data: {
        labels: odsLabels,
        datasets: [
          {
            data: odsValues,
            backgroundColor: odsColors,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    },
    {
      id: 'actions-chart',
      type: 'bar',
      data: {
        labels: barCommunities,
        datasets: [
          {
            label: 'Usuarios',
            data: barUsers,
            backgroundColor: '#2563eb',
            borderRadius: 10,
          },
          {
            label: 'Administradores',
            data: barAdmins,
            backgroundColor: '#0ea5e9',
            borderRadius: 10,
          },
          {
            label: 'Causas Activas',
            data: barActive,
            backgroundColor: '#10b981',
            borderRadius: 10,
          },
          {
            label: 'Causas Cerradas',
            data: barClosed,
            backgroundColor: '#f97316',
            borderRadius: 10,
          },
          {
            label: 'ODS',
            data: barOds,
            backgroundColor: '#a855f7',
            borderRadius: 10,
          },
          {
            label: 'Apoyos',
            data: barSupports,
            backgroundColor: '#db2777',
            borderRadius: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
        },
        scales: {
          x: { stacked: true },
          y: { beginAtZero: true, stacked: true },
        },
      },
    },
  ];

  charts.forEach((chartConfig) => {
    const canvas = document.getElementById(chartConfig.id);
    if (!canvas || typeof Chart === 'undefined') {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    // eslint-disable-next-line no-new
    new Chart(context, {
      type: chartConfig.type,
      data: chartConfig.data,
      options: chartConfig.options,
    });
  });
})();
