"use client";

const TokenProgress = ({ token, threshold, formatNumber }) => {
  const circulationPercentage = token?.tokensSold 
    ? Math.min(100, (token.tokensSold / threshold) * 100) 
    : 0;

  return (
    <div className="progress-section">
      <h4>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        Bonding Curve Progress
      </h4>
      <div className="supply-numbers">
        <div className="supply-fractions">
          <span className="circulating-amount">{formatNumber(token?.tokensSold || 0)}</span>
          <span className="supply-divider">/</span>
          <span className="max-amount">{formatNumber(threshold)}</span>
        </div>
        <div className="supply-percentage-badge">
          {circulationPercentage.toFixed(2)}%
        </div>
      </div>
      <div className="supply-progress-container">
        <div 
          className="supply-progress-bar" 
          style={{ width: `${circulationPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default TokenProgress;