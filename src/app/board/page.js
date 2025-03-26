"use client";

import { useEffect, useState } from "react";
import TokenCard from "../../components/TokenCard";
import { fetchTokensByFactory } from "@/utils/_api";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import "../../styles/BoardPage.css";
import apolloClient from '../../lib/apollo-client';
import { gql } from '@apollo/client';
import LoadingSkeleton from "../../components/LoadingSkeleton";

const BoardPage = () => {
  const router = useRouter();
  const [tokens, setTokens] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [filterOption, setFilterOption] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const testGraphQLConnection = async () => {
    try {
      const { data } = await apolloClient.query({
        query: gql`
          query TestQuery {
            __typename
          }
        `,
        errorPolicy: 'all'
      });
      console.log("GraphQL connection successful:", data);
      return true;
    } catch (error) {
      console.error("GraphQL connection failed:", error);
      if (error.networkError) {
        console.error("Network error details:", error.networkError);
      }
      if (error.graphQLErrors) {
        console.error("GraphQL errors:", error.graphQLErrors);
      }
      return false;
    }
  };

  useEffect(() => {
    const loadTokens = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the factory address from environment variable
        const factoryAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

        if (!factoryAddress) {
          console.error("Factory address not configured");
          setError("Factory address not configured. Please check your environment variables.");
          setTokens([]);
          return;
        }

        console.log("Fetching tokens for factory:", factoryAddress);
        const tokensData = await fetchTokensByFactory(factoryAddress);

        if (tokensData.length === 0) {
          console.log("No tokens found for factory:", factoryAddress);
        } else {
          console.log(`Fetched ${tokensData.length} tokens`);
        }

        setTokens(tokensData);
      } catch (error) {
        console.error("Error loading tokens:", error);
        setError(`Failed to load tokens: ${error.message}`);
        setTokens([]);
      } finally {
        setLoading(false);
      }
    };

    loadTokens();
  }, []);

  // Sort tokens based on selected option
  const sortedTokens = [...tokens].sort((a, b) => {
    switch (sortOption) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'priceHigh':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'priceLow':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'volumeHigh':
        return parseFloat(b.dailyVolume) - parseFloat(a.dailyVolume);
      case 'marketCapHigh':
        return parseFloat(b.marketCap) - parseFloat(a.marketCap);
      default:
        return 0;
    }
  });

  // Filter tokens based on selected option
  const filteredTokens = sortedTokens.filter(token => {
    if (filterOption === 'all') return true;
    if (filterOption === 'trending') return parseFloat(token.volume7dChange) > 0;
    if (filterOption === 'new') {
      const tokenDate = new Date(token.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now - tokenDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7; // New tokens are less than 7 days old
    }

    // Then apply the search term
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      token.name.toLowerCase().includes(searchLower) ||
      token.symbol.toLowerCase().includes(searchLower);

    return passesFilter && matchesSearch;
  });

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const currentSort = sortOption;

  const handleSearch = (term) => {
    console.log("Searching for:", term);
  };

  return (
    <div className="board-container">
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
                  <path d="M1 1L7 7L13 1" stroke="#00F6AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                    stroke="#00F6AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                    <path d="M18 6L6 18M6 6L18 18" stroke="#00F6AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                  <path d="M13 5L20 12L13 19M4 12H20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="button-glow"></div>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : filteredTokens.length > 0 ? (
        <div className="token-list">
          {filteredTokens.map((token) => (
            <TokenCard key={token.id} token={token} />
          ))}
        </div>
      ) : (
        <div className="no-results-container">
          <div className="no-results-content">
            <div className="no-results-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                  stroke="#00F6AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 7V13" stroke="#00F6AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 10H13" stroke="#00F6AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="no-results-title">No Tokens Found</h3>
            <p className="no-results-message">
              We couldn't find any tokens matching "{searchTerm}".
            </p>
            <div className="no-results-suggestions">
              <p>Try:</p>
              <ul>
                <li>Checking for typos or misspellings</li>
                <li>Using more general search terms</li>
                <li>Searching by token symbol instead</li>
              </ul>
            </div>
            <button
              className="no-results-reset-button"
              onClick={() => setSearchTerm('')}
            >
              <span>Clear Search</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 5L5 19M5 5L19 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardPage;