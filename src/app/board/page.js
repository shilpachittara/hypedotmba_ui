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
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("volume24h");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTokens = async () => {
      setLoading(true);
      const data = await fetchTokens();
      setTokens(data);
      setLoading(false);
    };

    loadTokens();
  }, []);

  const filteredTokens = tokens
    .filter((token) =>
      token.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "volume24h") return b.dailyVolume - a.dailyVolume;
      if (sortOption === "volume7dChange") return b.volume7dChange - a.volume7dChange;
      if (sortOption === "marketCap") return b.marketCap - a.marketCap;
      return 0;
    });

  const handleStartNewCoin = () => {
    router.push("/create");
  };

  return (
    <div className="board-container">
      <Header />

      {/* Start a New Coin */}
      <section className="start-coin">
        <button onClick={handleStartNewCoin} className="start-coin-btn">
          [start a new coin]
        </button>
      </section>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="search for token"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />
        <button className="search-btn">search</button>
      </div>

      {/* Sort Options */}
      <div className="sort-container">
        <label htmlFor="sort">Sort By:</label>
        <select
          id="sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="sort-select"
        >
          <option value="volume24h">Volume (24h)</option>
          <option value="volume7dChange">7d % Change</option>
          <option value="marketCap">Market Cap</option>
        </select>
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