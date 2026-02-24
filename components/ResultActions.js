import React, { useMemo, useState } from 'react';

const buildReportText = ({ title, summaryLines, shareUrl }) =>
  [
    title,
    '',
    ...summaryLines.map((line) => `- ${line}`),
    '',
    `Calculator link: ${shareUrl}`
  ].join('\n');

const ResultActions = ({ title, summaryLines = [], fileName = 'calculation-summary.txt' }) => {
  const [status, setStatus] = useState('');
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://upaman.com';

  const reportText = useMemo(
    () => buildReportText({ title, summaryLines, shareUrl }),
    [title, summaryLines, shareUrl]
  );

  const setTemporaryStatus = (message) => {
    setStatus(message);
    window.setTimeout(() => setStatus(''), 2200);
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setTemporaryStatus('Summary copied.');
    } catch (error) {
      setTemporaryStatus('Unable to copy. Try download.');
    }
  };

  const shareSummary = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: summaryLines.join('\n'),
          url: shareUrl
        });
        setTemporaryStatus('Shared successfully.');
        return;
      } catch (error) {
        // User cancelled share; no status required.
      }
    }

    copySummary();
  };

  const downloadSummary = () => {
    try {
      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      setTemporaryStatus('Report downloaded.');
    } catch (error) {
      setTemporaryStatus('Download failed.');
    }
  };

  if (!summaryLines.length) return null;

  return (
    <div className="result-actions">
      <div className="result-actions-buttons">
        <button type="button" className="result-action-button" onClick={copySummary}>
          Copy summary
        </button>
        <button type="button" className="result-action-button" onClick={shareSummary}>
          Share
        </button>
        <button type="button" className="result-action-button" onClick={downloadSummary}>
          Download report
        </button>
      </div>
      {status && <p className="result-actions-status">{status}</p>}
    </div>
  );
};

export default ResultActions;
