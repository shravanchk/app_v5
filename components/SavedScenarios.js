import React, { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Save, Trash2 } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

const MAX_SCENARIOS = 8;

const formatSavedDate = (value) => {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  } catch (error) {
    return 'Saved recently';
  }
};

const readSavedScenarios = (storageKey) => {
  if (typeof window === 'undefined') return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const SavedScenarios = ({
  storageKey,
  currentScenario,
  defaultName = 'My scenario',
  onLoadScenario,
  disabled = false,
  maxScenarios = MAX_SCENARIOS
}) => {
  const [scenarios, setScenarios] = useState([]);
  const [scenarioName, setScenarioName] = useState(defaultName);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setScenarios(readSavedScenarios(storageKey));
  }, [storageKey]);

  useEffect(() => {
    setScenarioName(defaultName);
  }, [defaultName]);

  const hasSavedScenarios = scenarios.length > 0;
  const cleanScenarioName = scenarioName.trim();

  const setTemporaryStatus = (message) => {
    setStatus(message);
    window.setTimeout(() => setStatus(''), 2200);
  };

  const persistScenarios = (nextScenarios) => {
    setScenarios(nextScenarios);
    window.localStorage.setItem(storageKey, JSON.stringify(nextScenarios));
  };

  const saveScenario = () => {
    if (disabled || !currentScenario || typeof window === 'undefined') return;

    const now = new Date().toISOString();
    const nextScenario = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: cleanScenarioName || defaultName,
      createdAt: now,
      summary: currentScenario.summary || '',
      data: currentScenario.data
    };
    const nextScenarios = [nextScenario, ...scenarios].slice(0, maxScenarios);

    persistScenarios(nextScenarios);
    trackEvent('scenario_action', { action: 'save', storage_key: storageKey });
    setTemporaryStatus('Scenario saved on this device.');
  };

  const loadScenario = (scenario) => {
    onLoadScenario(scenario.data);
    trackEvent('scenario_action', { action: 'load', storage_key: storageKey });
    setScenarioName(scenario.name);
    setTemporaryStatus('Scenario loaded.');
  };

  const deleteScenario = (scenarioId) => {
    const nextScenarios = scenarios.filter((scenario) => scenario.id !== scenarioId);
    persistScenarios(nextScenarios);
    trackEvent('scenario_action', { action: 'delete', storage_key: storageKey });
    setTemporaryStatus('Scenario deleted.');
  };

  const helperText = useMemo(() => {
    if (disabled) return 'Calculate a result before saving a scenario.';
    if (hasSavedScenarios) return `Saved on this device. Latest ${maxScenarios} scenarios are kept.`;
    return 'Save this result to compare or reload it later.';
  }, [disabled, hasSavedScenarios, maxScenarios]);

  return (
    <div className="saved-scenarios">
      <div className="saved-scenarios-header">
        <div>
          <h4>Saved scenarios</h4>
          <p>{helperText}</p>
        </div>
      </div>

      <div className="saved-scenarios-save-row">
        <input
          type="text"
          value={scenarioName}
          onChange={(event) => setScenarioName(event.target.value)}
          className="saved-scenarios-input"
          aria-label="Scenario name"
          disabled={disabled}
        />
        <button
          type="button"
          className="result-action-button saved-scenarios-icon-button"
          onClick={saveScenario}
          disabled={disabled}
          title="Save scenario"
          aria-label="Save scenario"
        >
          <Save size={16} aria-hidden="true" />
          <span>Save</span>
        </button>
      </div>

      {hasSavedScenarios && (
        <div className="saved-scenarios-list">
          {scenarios.map((scenario) => (
            <div className="saved-scenarios-item" key={scenario.id}>
              <div className="saved-scenarios-copy">
                <strong>{scenario.name}</strong>
                <span>{scenario.summary}</span>
                <small>{formatSavedDate(scenario.createdAt)}</small>
              </div>
              <div className="saved-scenarios-controls">
                <button
                  type="button"
                  className="result-action-button saved-scenarios-icon-button"
                  onClick={() => loadScenario(scenario)}
                  title="Load scenario"
                  aria-label={`Load ${scenario.name}`}
                >
                  <RotateCcw size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="result-action-button saved-scenarios-icon-button"
                  onClick={() => deleteScenario(scenario.id)}
                  title="Delete scenario"
                  aria-label={`Delete ${scenario.name}`}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {status && <p className="result-actions-status">{status}</p>}
    </div>
  );
};

export default SavedScenarios;
