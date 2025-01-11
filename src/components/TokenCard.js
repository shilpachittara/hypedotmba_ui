"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';

const TokenCard = ({ token }) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/coin/${token.id}`);
    };

    const imageSrc = token.image && token.image !== "https://example.com/image.png" && token.image !== ""
    ? token.image
    : "/default_image.png";

    return (
        <div className="token-card" onClick={handleClick} style={{ cursor: "pointer" }}>
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
                <p className="creator-text">created by 🐸 {token.creator} · {token.timeAgo} ago</p>
                <p className="market-cap">market cap: ${token.marketCap} 📈</p>
                <p className="replies">replies: {token.replies}</p>

                <h3 className="token-title">{token.name} [{token.symbol}]</h3>
                <p className="token-description">{token.description}</p>
            </div>
        </div>
    );
};

export default TokenCard;