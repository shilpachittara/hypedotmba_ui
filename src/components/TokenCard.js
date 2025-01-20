"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import "../styles/TokenCard.css";

const TokenCard = ({ token }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/coin/${token.id}`);
  };

  // Fallback image if no token image is provided
  const imageSrc =
    token.image &&
    token.image !== "https://example.com/image.png" &&
    token.image !== ""
      ? token.image
      : "/default_image.png";

  // Truncate the creator address
  const truncatedCreator = `${token.creator.slice(0, 6)}...${token.creator.slice(
    -4
  )}`;

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

  return (
    <div className="token-card" onClick={handleClick}>
      {/* Left: Token Image */}
      <div className="token-image-container">
        <Image
          src={imageSrc}
          alt={token.name}
          className="token-image"
          width={80}
          height={80}
          priority
        />
      </div>

      {/* Right: Token Details */}
      <div className="token-details">
        <h3 className="token-title">
          {token.name} [{token.symbol}]
        </h3>
        <p className="market-cap">
          Market Cap: <strong>{token.marketCap} $</strong> 📈
        </p>
        <p className="creator-text">
          Created by 🐸{" "}
          <span className="creator" title={token.creator}>
            {truncatedCreator}
          </span>{" "}
          · {timeAgo} ago
        </p>
        <p>
          Daily Volume: <strong>{token.dailyVolume} $</strong>
        </p>
        <p className="token-description">{token.description}</p>
      </div>
    </div>
  );
};

export default TokenCard;