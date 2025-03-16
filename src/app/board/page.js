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
      {/* Background Elements - Similar to Home Screen */}
      <div className="board-background">
        <div className="grid-background"></div>
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
        <div className="glow-orb orb-3"></div>
        <div className="grid-overlay"></div>
      </div>

      <Header />

      {/* Enhanced Board Controls with Lighter Design */}
      <div className="board-controls">
        <div className="filters-row">
          {/* Redesigned Sort Dropdown */}
          <div className="sort-container">
            <div className="futuristic-select-wrapper">
              <select
                className="futuristic-select"
                onChange={handleSortChange}
                value={currentSort}
              >
                <option value="">Sort By: Default</option>
                <option value="marketCap">Highest Market Cap</option>
                <option value="volume">Highest Volume</option>
                <option value="newest">Recently Added</option>
                <option value="oldest">Oldest First</option>
              </select>
              <div className="select-arrow">
                <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L7 7L13 1" stroke="#00F6AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="select-glow"></div>
            </div>
          </div>

          {/* Enhanced Search Container */}
          <div className="search-container">
            <div className="search-wrapper">
              <div className="search-icon-wrapper">
                <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" 
                    stroke="#00F6AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="pulse-ring"></div>
              </div>
              
              <div className="input-field-wrapper">
                <input
                  type="text"
                  className="enhanced-search-input"
                  placeholder="Search tokens by name or symbol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="input-glow"></div>
                <div className="typing-indicator">
                  {searchTerm && <span className="typing-dot"></span>}
                </div>
              </div>
              
              {searchTerm && (
                <button 
                  className="clear-search-button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="#00F6AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
            
            <button
              className="enhanced-search-button"
              onClick={() => handleSearch(searchTerm)}
            >
              <span className="button-text">Search</span>
              <span className="button-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 5L20 12L13 19M4 12H20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="button-glow"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Token Cards */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading tokens...</p>
        </div>
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