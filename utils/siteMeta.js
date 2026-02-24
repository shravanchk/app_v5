import buildMeta from '../generated/buildMeta.json';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});

export const getBuildTimestamp = () => {
  const timestamp = buildMeta?.buildTimestamp;
  return timestamp || new Date().toISOString();
};

export const getBuildDate = () => getBuildTimestamp().slice(0, 10);

export const formatDateLabel = (dateValue) => {
  if (!dateValue) return null;
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;
  return DATE_FORMATTER.format(parsed);
};

export const getAutoUpdatedLabel = () => {
  const label = formatDateLabel(getBuildTimestamp());
  return label ? `Auto-updated on ${label}` : 'Auto-updated';
};

export const getDataFreshnessLabel = () => {
  const latest = buildMeta?.dataFreshness?.latestAvailable;
  const label = formatDateLabel(latest);
  return label ? `Data snapshot: ${label}` : null;
};
