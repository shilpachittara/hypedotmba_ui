"use client";

import Image from 'next/image';

const TokenInfo = ({ token, formatNumber, truncateAddress, calculateTimeAgo }) => {
  const imageSrc = token?.image && token.image !== "https://example.com/image.png" && token.image !== ""
    ? token.image
    : "/default_image.png";

  return (
    <div className="token-info-section">
      <div className="token-header">
        <div className="token-image-container">
          <Image 
            src={imageSrc} 
            alt={token?.name || "Token"} 
            width={64} 
            height={64} 
            className="token-image"
          />
        </div>
        <div className="token-title">
          <h1>{token?.name || "Loading..."}</h1>
          <div className="token-symbol-price">
            <span className="token-symbol">{token?.symbol}</span>
            <span className="token-price">${formatNumber(token?.price)}</span>
            <span className={`price-change ${parseFloat(token?.priceChange24h) >= 0 ? 'positive' : 'negative'}`}>
              {parseFloat(token?.priceChange24h) >= 0 ? '+' : ''}{token?.priceChange24h}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="token-stats">
        <div className="stat-item">
          <span className="stat-label">Market Cap</span>
          <span className="stat-value">${formatNumber(token?.marketCap)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">24h Volume</span>
          <span className="stat-value">${formatNumber(token?.dailyVolume)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Holders</span>
          <span className="stat-value">{formatNumber(token?.holderCount || 0)}</span>
        </div>
      </div>
      
      <div className="creator-section">
        <div className="creator-info">
          <span className="creator-label">Creator:</span> 
          <span className="creator-address" title={token?.creatorAddress} onClick={() => navigator.clipboard.writeText(token?.creatorAddress)}>
            {truncateAddress(token?.creatorAddress)}
          </span>
          <span className="creation-time">Created {calculateTimeAgo(token?.createdAt)}</span>
        </div>
        
        <div className="token-links">
          {token?.social?.website && 
            <a href={token.social.website} target="_blank" rel="noopener noreferrer" className="token-link website">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <path d="M15 3h6v6" />
                <path d="M10 14L21 3" />
              </svg>
              <span>Website</span>
            </a>
          }
          {token?.social?.twitter && 
            <a href={token.social.twitter} target="_blank" rel="noopener noreferrer" className="token-link twitter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
              <span>Twitter</span>
            </a>
          }
          {token?.social?.telegram && 
            <a href={token.social.telegram} target="_blank" rel="noopener noreferrer" className="token-link telegram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2L2 10l7 4m7 8l-3-9 9-5m-9 5V22" />
              </svg>
              <span>Telegram</span>
            </a>
          }
        </div>
      </div>
      
      <div className="token-description">
        <p>{token?.description || "No description available."}</p>
      </div>
    </div>
  );
};

export default TokenInfo;