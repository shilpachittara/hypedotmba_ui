import Image from "next/image";
import { useRouter } from "next/navigation";
import '../styles/TokenCard.css';

const TokenCard = ({ token }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/coin/${token.id}`);
  };

  // Use default coin image if none provided
  const imageSrc = token.image || "/default-token-image.png";
  
  // Format market cap with currency symbol
  const formatMarketCap = (value) => {
    if (value === undefined || value === null) return "0";
    return parseFloat(value).toLocaleString('en-US', {
      maximumFractionDigits: 0
    });
  };

  // Truncate creator address
  const truncatedCreator = token.creator 
    ? `${token.creator.slice(0, 6)}...${token.creator.slice(-4)}`
    : "0xb200...d021";

  // Calculate time ago
  const calculateTimeAgo = (createdOn) => {
    if (!createdOn) return "__h";
    
    const now = new Date();
    // Check if timestamp is in milliseconds (13 digits) or seconds (10 digits)
    const createdDate = new Date(
      createdOn.toString().length > 10 
        ? parseInt(createdOn) // Already in milliseconds
        : parseInt(createdOn) * 1000 // Convert seconds to milliseconds
    );
    
    // Check if date is valid
    if (isNaN(createdDate.getTime())) return "NaN$";
    
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

  const timeAgo = calculateTimeAgo(token.createdAt);
  
  // Truncate description to ensure consistent height
  const truncateDescription = (text, maxLength = 50) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="custom-token-card" onClick={handleClick}>
      <div className="token-card-inner">
        {/* Image Section */}
        <div className="token-image-section">
          <Image
            src={imageSrc}
            alt={token.name || "Token"}
            className="token-image"
            width={400}
            height={300}
            priority
          />
        </div>

        {/* Content Section */}
        <div className="token-content">
          {/* Token Symbol */}
          <div className="token-symbol">{token.symbol}</div>
          
          {/* Token Name and Description */}
          <div className="token-details">
            <div className="token-name">{token.name}</div>
            <div className="token-description">{truncateDescription(token.description)}</div>
          </div>

          {/* Market Stats */}
          <div className="token-stats">
            <div className="stat-item highlight">
              <span className="stat-value">
                ${formatMarketCap(token.marketCap)}
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

          {/* Creator Info */}
          <div className="creator-info-card">
            <div className="creator-address">
              <span className="address-dot"></span>
              {truncatedCreator}
            </div>
            <div className="creation-time-card">
              {timeAgo} ago
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenCard;