(async () => {
  const lastUpdatedElements = document.querySelectorAll('[data-auto-last-updated]');
  const dataUpdatedElements = document.querySelectorAll('[data-auto-data-updated]');

  if (!lastUpdatedElements.length && !dataUpdatedElements.length) return;

  const fallbackLabel = 'Auto-updated with each deployment';
  let buildLabel = fallbackLabel;
  let dataLabel = '';

  try {
    const response = await fetch('/build-meta.json', { cache: 'no-store' });
    if (response.ok) {
      const meta = await response.json();
      const buildDate = meta?.buildTimestamp ? new Date(meta.buildTimestamp) : null;
      if (buildDate && !Number.isNaN(buildDate.getTime())) {
        buildLabel = `Updated on ${buildDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
      }

      const dataDateRaw = meta?.dataFreshness?.latestAvailable;
      if (dataDateRaw) {
        const dataDate = new Date(dataDateRaw);
        if (!Number.isNaN(dataDate.getTime())) {
          dataLabel = `Data snapshot: ${dataDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
        }
      }
    }
  } catch (error) {
    // Keep fallback labels silently.
  }

  lastUpdatedElements.forEach((node) => {
    node.textContent = buildLabel;
  });

  dataUpdatedElements.forEach((node) => {
    node.textContent = dataLabel || 'Data snapshot unavailable';
  });
})();
