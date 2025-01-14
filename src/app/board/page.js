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

  const filteredTokens = tokens.filter((token) =>
    token.name.toLowerCase().includes(search.toLowerCase())
  );

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