"use client";

import { useEffect, useState } from "react";
import TokenCard from "../../components/TokenCard";
import { fetchTokens } from "../../utils/_api";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";

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
      {/* Header */}
      <Header />

      {/* Start a New Coin */}
      <section className="start-coin">
        <button onClick={handleStartNewCoin} className="start-coin-btn">
          [start a new coin]
        </button>
        {/*
        <h2 className="king-text">king of the hill</h2>
        <div className="king-card">
          <img src="/king-avatar.png" alt="King of the Hill" />
          <div>
            <p>created by 🐸 B97Fik · 9m ago</p>
            <p>market cap: $7.9K 📈</p>
            <p>replies: 25</p>
            <strong>Lenda Learning Machine [LLM]</strong>
          </div>
        </div>
        */}
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

      {/* Filters */}
      {/*
      <div className="filters">
        <button className="filter-btn">sort: featured 🔥</button>
        <span>show animations: <button className="toggle-btn active">on</button> <button className="toggle-btn">off</button></span>
        <span>include nsfw: <button className="toggle-btn">on</button> <button className="toggle-btn active">off</button></span>
      </div>

      {/* Token Cards */}
      {loading ? (
        <p>Loading tokens...</p>
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