import React from 'react';
import '../styles/LoadingSkeleton.css';

const LoadingSkeleton = () => {
  // Create an array of 12 items to represent loading cards (3 rows of 4)
  const skeletonCards = Array(12).fill(null);
  
  return (
    <div className="loading-skeleton-container">
      <div className="loading-grid">
        {skeletonCards.map((_, index) => (
          <div key={index} className="loading-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-symbol"></div>
              <div className="skeleton-title"></div>
              <div className="skeleton-description"></div>
              
              <div className="token-metrics">
                <div className="skeleton-metric">
                  <div className="metric-value"></div>
                  <div className="metric-label"></div>
                </div>
                <div className="skeleton-metric">
                  <div className="metric-value"></div>
                  <div className="metric-label"></div>
                </div>
                <div className="skeleton-metric">
                  <div className="metric-value"></div>
                  <div className="metric-label"></div>
                </div>
              </div>
              
              <div className="skeleton-footer">
                <div className="skeleton-creator"></div>
                <div className="skeleton-time"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;