"use client";

import { useEffect, useState } from "react";
import TokenCard from "../../components/TokenCard";
import { fetchTokens } from "../../utils/_api";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import "../../styles/BoardPage.css";

const BoardPage = () => {
  const router = useRouter();
  const [tokens, setTokens] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("volume24h");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTokens = async () => {
      setLoading(true);
      const data = await fetchTokens();
      setLoading(false);
    };

    loadTokens();
  }, []);

  const filteredTokens = tokens
    .filter((token) =>
      token.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "volume24h") return b.dailyVolume - a.dailyVolume;
      if (sortOption === "volume7dChange") return b.volume7dChange - a.volume7dChange;
      if (sortOption === "marketCap") return b.marketCap - a.marketCap;
      return 0;
    });

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const currentSort = sortOption;

  const handleSearch = (term) => {
    // Implement search functionality
    console.log("Searching for:", term);
  };

  return (
    <div className="board-container">
      <Header />

      {/* Board Controls */}
      <div className="board-controls">
        {/* Create Button - Top Center */}
        <div className="create-section">
          <button
            className="create-coin-btn"
            onClick={() => router.push('/create')}
          >
            <span>Create New Coin</span>
          </button>
        </div>

        {/* Sort and Search - Bottom Row */}
        <div className="filters-row">
          {/* Sort - Left */}
          <div className="sort-container">
            <select
              className="sort-select"
              onChange={handleSortChange}
              value={currentSort}
            >
              <option value="">Sort By: Default</option>
              <option value="marketCap">Highest Market Cap</option>
              <option value="volume">Highest Volume</option>
              <option value="newest">Recently Added</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Search - Right */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search coins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="search-button"
              onClick={() => handleSearch(searchTerm)}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Token Cards */}
      {loading ? (
        <p className="loading-text">Loading tokens...</p>
      ) : (
        <div className="token-list">
          {filteredTokens.map((token) => (
            <TokenCard key={token.id} token={token} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BoardPage;