import Image from "next/image";
import { useRouter } from "next/navigation";

const TokenCard = ({ token }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/coin/${token.id}`);
  };

  const imageSrc = token.image || "/default_image.png";
  const truncatedCreator = `${token.creator.slice(0, 6)}...${token.creator.slice(-4)}`;

  // Calculate time ago
  const calculateTimeAgo = (createdOn) => {
    const now = new Date();
    const createdDate = new Date(createdOn * 1000); // Convert timestamp to milliseconds
    const diff = now - createdDate; // Time difference in milliseconds

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);

    if (months > 0) return `${months}m`;
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const timeAgo = calculateTimeAgo(token.createdOn);
  
  // Format market cap with currency symbol
  const formatMarketCap = (value) => {
    const formatted = parseFloat(value).toLocaleString('en-US', {
      maximumFractionDigits: 2
    });
    return formatted;
  };
  
  // Random price change for demo (replace with actual data)
  const priceChange = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 10).toFixed(2);
  const isPriceUp = priceChange > 0;

  return (
    <div className="token-card" onClick={handleClick}>
      {/* Image Section */}
      <div className="token-image-section">
        <Image
          src={imageSrc}
          alt={token.name}
          className="token-image"
          width={300}
          height={200}
          priority
          style={{height:"250px",objectFit:"cover"}}
        />
        <div className="image-overlay"></div>
      </div>

      {/* Content Section - Enhanced with adjusted padding */}
      <div className="token-content">
        {/* Title Row - Enhanced */}
        <div className="token-header">
          <span className="token-symbol">{token.symbol || "TOKEN"}</span>
          <h3 className="token-name">{token.name}</h3>
          <div className="token-rarity">
            <span className="rarity-value">Top 1%</span>
          </div>
        </div>

        {/* Stats Row - Enhanced */}
        <div className="token-stats">
          <div className="stat-item highlight">
            <span className="stat-value">
              ${formatMarketCap(token.marketCap)}
              <span className={`value-change ${isPriceUp ? 'positive' : 'negative'}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d={isPriceUp 
                    ? "M8 12l4-4 4 4M12 8v12" 
                    : "M16 12l-4 4-4-4M12 16V4"} 
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
                {Math.abs(priceChange)}%
              </span>
            </span>
            <span className="stat-label">Market Cap</span>
          </div>
          
          {/* Improved Volume Display */}
          <div className="stat-item volume-stat">
            <span className="stat-value">
              ${formatMarketCap(token.dailyVolume)}
              <span className="value-currency">24h</span>
            </span>
            <span className="stat-label">Volume</span>
          </div>
        </div>

        {/* Creator Info - Enhanced */}
        <div className="token-creator">
          <div className="creator-badge">
            {truncatedCreator}
          </div>
          <div className="time-indicator">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <polyline points="12 6 12 12 16 14" strokeWidth="2" />
            </svg>
            {timeAgo} ago
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenCard;