import React from 'react';
import { getAutoUpdatedLabel, getDataFreshnessLabel } from '../utils/siteMeta';
import CredibilityPanel from './calculator/CredibilityPanel';

const CalculatorInfoPanel = ({
  title = 'Methodology and source notes',
  inputs = [],
  formulas = [],
  assumptions = [],
  sources = [],
  guideLinks = [],
  showCredibilityPanel = true,
  credibilityScope,
  reviewedOn
}) => {
  const updatedLabel = getAutoUpdatedLabel();
  const dataLabel = getDataFreshnessLabel();

  return (
    <div>
      {showCredibilityPanel ? (
        <CredibilityPanel
          reviewedOn={reviewedOn}
          scope={credibilityScope}
        />
      ) : null}
      <details className="calculator-info-panel">
        <summary className="calculator-info-summary">
          {title}
        </summary>

        <div className="calculator-info-meta">
          <span>{updatedLabel}</span>
          {dataLabel && <span>{dataLabel}</span>}
        </div>

        {!!inputs.length && (
          <div className="calculator-info-section">
            <h4>Inputs used</h4>
            <ul>
              {inputs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {!!formulas.length && (
          <div className="calculator-info-section">
            <h4>Formula basis</h4>
            <ul>
              {formulas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {!!assumptions.length && (
          <div className="calculator-info-section">
            <h4>Assumptions and limits</h4>
            <ul>
              {assumptions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {!!sources.length && (
          <div className="calculator-info-section">
            <h4>Official sources</h4>
            <ul>
              {sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!!guideLinks.length && (
          <div className="calculator-info-section">
            <h4>Related guides</h4>
            <ul>
              {guideLinks.map((guide) => (
                <li key={guide.href}>
                  <a href={guide.href} target="_blank" rel="noopener noreferrer">{guide.label}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </details>
    </div>
  );
};

export default CalculatorInfoPanel;
