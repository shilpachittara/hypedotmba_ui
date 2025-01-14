"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import "../styles/TokenCard.css";

const TokenCard = ({ token }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/coin/${token.id}`);
  };

  // Fallback image if no token image is provided
  const imageSrc = token.image && token.image !== "https://example.com/image.png" && token.image !== ""
    ? token.image
    : "/default_image.png";

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
        <h3 className="token-title">{token.name} [{token.symbol}]</h3>
        <p className="market-cap">Market Cap: <strong>${token.marketCap}</strong> 📈</p>
        <p className="creator-text">Created by 🐸 {token.creator} · {token.timeAgo} ago</p>
        <p className="replies">Replies: {token.replies}</p>
        <p className="token-description">{token.description}</p>
      </div>
    </div>
  );
};

export default TokenCard;