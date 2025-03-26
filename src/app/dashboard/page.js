"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import TokenCard from "@/components/TokenCard";
import "./dashboard.css";

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("tokens");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isLoading, setIsLoading] = useState(true);
  
  // New pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Show 5 transactions per page
  
  // Dummy user data
  const [userData, setUserData] = useState({
    name: "Crypto Innovator",
    walletAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    avatarUrl: "https://cdn.pixabay.com/photo/2023/01/10/17/09/technology-7710317_960_720.jpg",
    joinedDate: "Mar 2023",
    totalCreated: 8,
    totalVolume: "1.45M",
    followerCount: 348,
    bio: "Building the future of finance, one token at a time. DeFi enthusiast and blockchain developer.",
    twitterHandle: "@crypto_innov",
    websiteUrl: "https://crypto-innovator.io"
  });
  
  // Dummy tokens created by user with structure matching what TokenCard expects
  const [userTokens, setUserTokens] = useState([
    {
      id: "101",
      name: "Alpha Protocol",
      symbol: "ALPHA",
      image: "https://cdn.pixabay.com/photo/2022/03/01/02/51/galaxy-7040416_960_720.jpg",
      currentPrice: 0.0875,
      priceChange24h: 9.34,
      marketCap: 8750000,
      dailyVolume: 345000,
      volume24h: 345000,
      createdOn: 1686399045, // Unix timestamp for "2023-06-10T14:30:45Z"
      chain: "Ethereum",
      network: "Ethereum",
      status: "active",
      holderCount: 1240,
      creator: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
    },
    {
      id: "102",
      name: "Beta Finance",
      symbol: "BETA",
      image: "https://cdn.pixabay.com/photo/2022/02/19/10/25/coin-7022652_960_720.jpg",
      currentPrice: 0.0043,
      priceChange24h: -2.15,
      marketCap: 430000,
      dailyVolume: 83000,
      volume24h: 83000,
      createdOn: 1690020930, // Unix timestamp for "2023-07-22T10:15:30Z"
      chain: "Polygon",
      network: "Polygon",
      status: "active",
      holderCount: 578,
      creator: "0x1F86542a2Fb98d346Da43f554cd199c2211CfC02"
    },
    {
      id: "103",
      name: "Gamma Token",
      symbol: "GAMMA",
      image: "https://cdn.pixabay.com/photo/2021/05/24/09/15/ethereum-6278326_960_720.jpg",
      currentPrice: 0.1245,
      priceChange24h: 32.7,
      marketCap: 1245000,
      dailyVolume: 560000,
      volume24h: 560000,
      createdOn: 1683186015, // Unix timestamp for "2023-05-04T08:40:15Z"
      chain: "Ethereum",
      network: "Ethereum",
      status: "active",
      holderCount: 2140,
      creator: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD"
    },
    {
      id: "104",
      name: "Delta DAO",
      symbol: "DELTA",
      image: "https://cdn.pixabay.com/photo/2022/02/12/18/19/monkey-7009603_960_720.jpg",
      currentPrice: 2.34,
      priceChange24h: 15.42,
      marketCap: 23400000,
      dailyVolume: 4300000,
      volume24h: 4300000,
      createdOn: 1679167330, // Unix timestamp for "2023-03-18T19:22:10Z"
      chain: "Ethereum",
      network: "Avalanche",
      status: "active",
      holderCount: 3450,
      creator: "0x4b20993Bc481177ec7E8f571ceCaE8A9e22C02db"
    }
  ]);
  
  // Dummy transaction data
  const [userTransactions, setUserTransactions] = useState([
    {
      id: "tx1",
      type: "buy",
      token: "Gamma Token",
      amount: "250 GAMMA",
      value: "+$31.13",
      date: "2023-09-15T14:30:00Z",
      hash: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      status: "completed"
    },
    {
      id: "tx2",
      type: "sell",
      token: "Beta Finance",
      amount: "1200 BETA",
      value: "-$5.16",
      date: "2023-09-10T09:45:00Z",
      hash: "0x1F86542a2Fb98d346Da43f554cd199c2211CfC02",
      status: "completed"
    },
    {
      id: "tx3",
      type: "create",
      token: "Epsilon Yield",
      amount: "10000 EPSY",
      value: "$5000.00",
      date: "2023-08-28T16:20:00Z",
      hash: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
      status: "completed"
    }
  ]);
  
  // Convert loading state to false after 2 seconds to simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter tokens based on search term
  const filteredTokens = userTokens.filter(token => {
    if (!searchTerm) return true;
    return (
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // Sort tokens based on sort direction
  const sortedTokens = [...filteredTokens].sort((a, b) => {
    if (sortDirection === "asc") {
      return a.currentPrice - b.currentPrice;
    } else {
      return b.currentPrice - a.currentPrice;
    }
  });
  
  // Simple scroll handlers without using refs
  const handleScrollLeft = () => {
    const container = document.querySelector('.tokens-scroll-container');
    if (container) {
      container.scrollBy({
        left: -320, // Approximately one card width
        behavior: 'smooth'
      });
    }
  };
  
  const handleScrollRight = () => {
    const container = document.querySelector('.tokens-scroll-container');
    if (container) {
      container.scrollBy({
        left: 320, // Approximately one card width
        behavior: 'smooth'
      });
    }
  };
  
  // New pagination logic for transactions
  const indexOfLastTransaction = currentPage * itemsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - itemsPerPage;
  const currentTransactions = userTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(userTransactions.length / itemsPerPage);

  // Functions for pagination
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Sample function to handle buy/sell actions (placeholder)
  const handleTransactionAction = (action, tokenId, symbol) => {
    console.log(`${action} action for ${symbol} (${tokenId})`);
    // In a real app, this would open a modal or navigate to a buy/sell page
    alert(`${action} action for ${symbol} will be implemented in the next phase`);
  };
  
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-cosmos-bg">
        <div className="cosmos-gradient"></div>
        <div className="circuit-grid"></div>
        
        <div className="node-container">
          {[...Array(25)].map((_, i) => (
            <div 
              key={i} 
              className="digital-node" 
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                '--duration': `${Math.random() * 4 + 3}s`,
                '--delay': `${Math.random() * 5}s`
              }}
            ></div>
          ))}
        </div>
        
        <div className="holo-plane"></div>
        <div className="holo-plane"></div>
        <div className="holo-plane"></div>
        
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="data-flow" 
            style={{
              top: `${15 + i * 17}%`,
              animationDelay: `${i * 1.6}s`
            }}
          ></div>
        ))}
        
        <div className="binary-rain">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className="binary-column" 
              style={{
                left: `${Math.random() * 100}%`,
                '--duration': `${Math.random() * 10 + 15}s`,
                '--delay': `${Math.random() * 10}s`,
                '--opacity': `${Math.random() * 0.5 + 0.3}`
              }}
            >
              {Array(30).fill().map(() => Math.round(Math.random())).join('')}
            </div>
          ))}
        </div>
        
        <div className="ambient-orb primary-orb"></div>
        <div className="ambient-orb secondary-orb"></div>
        
        <div className="scan-line"></div>
      </div>
      
      <Header />
      
      <div className="profile-content">
        {/* User info card */}
        <div className="user-card">
          <div className="user-avatar-section">
            <div className="user-avatar">
              <Image 
                src={userData.avatarUrl} 
                alt="User avatar" 
                className="avatar-img" 
                width={120} 
                height={120}
              />
              <div className="avatar-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 11.5L11 13.5L15.5 9M5.8 18.5H18.2C19.8802 18.5 20.7202 18.5 21.362 18.173C21.9265 17.8854 22.3854 17.4265 22.673 16.862C23 16.2202 23 15.3802 23 13.7V10.3C23 8.61984 23 7.77976 22.673 7.13803C22.3854 6.57354 21.9265 6.1146 21.362 5.82698C20.7202 5.5 19.8802 5.5 18.2 5.5H5.8C4.11984 5.5 3.27976 5.5 2.63803 5.82698C2.07354 6.1146 1.6146 6.57354 1.32698 7.13803C1 7.77976 1 8.61984 1 10.3V13.7C1 15.3802 1 16.2202 1.32698 16.862C1.6146 17.4265 2.07354 17.8854 2.63803 18.173C3.27976 18.5 4.11984 18.5 5.8 18.5Z" 
                    stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="user-info-section">
            <div className="user-info-header">
              <div>
                <h1 className="user-name">{userData.name}</h1>
                <div className="user-wallet">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 5H6C4.89543 5 4 5.89543 4 7V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V11M13 5L19 11M13 5V11H19" 
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {userData.walletAddress.substring(0, 6)}...{userData.walletAddress.substring(userData.walletAddress.length - 4)}
                </div>
              </div>
              
              <div className="user-actions">
                <button className="edit-profile-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4C2.89543 4 2 4.89543 2 6V20C2 21.1046 2.89543 22 4 22H18C19.1046 22 20 21.1046 20 20V13M20.385 6.58499L17.415 3.61499C17.0246 3.22468 16.4751 3.00424 15.9033 3.00424C15.3315 3.00424 14.782 3.22468 14.3915 3.61499L8 10.015V16H13.985L20.385 9.59999C20.7752 9.20953 20.9956 8.66009 20.9956 8.08799C20.9956 7.51589 20.7752 6.96646 20.385 6.57599V6.58499Z" 
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Edit Profile
                </button>
                
                <button className="connect-wallet-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" 
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 20V19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19V20" 
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Connected
                </button>
              </div>
            </div>
            
            <div className="user-bio">
              {userData.bio}
            </div>
            
            <div className="user-meta">
              <div className="user-joined">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" 
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Joined {userData.joinedDate}
              </div>
              
              <div className="user-social">
                <a href={`https://twitter.com/${userData.twitterHandle.substring(1)}`} target="_blank" rel="noopener noreferrer" className="social-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 4.01C21 4.5 20.02 4.69 19 5C17.879 3.735 16.217 3.665 14.62 4.263C13.023 4.861 11.977 6.323 12 8.01V9.01C8.755 9.083 5.865 7.605 4 5.01C4 5.01 -0.182 12.433 8 16.01C6.128 17.247 4.261 18.088 2 18.01C6.308 20.183 10.913 20.651 14.634 19.137C18.793 17.43 21.226 13.77 21.999 9.064C22.002 8.716 22.002 8.368 22 8.02C22 7.31 22.5 5.52 22 4.02V4.01Z" 
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {userData.twitterHandle}
                </a>
                
                <a href={userData.websiteUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" 
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3.6 9H20.4M3.6 15H20.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11.5 3C9.26184 6.46451 8 9.18656 8 12C8 14.8134 9.26184 17.5355 11.5 21M12.5 3C14.7382 6.46451 16 9.18656 16 12C16 14.8134 14.7382 17.5355 12.5 21" 
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Website
                  </a>
              
           
              </div>
            </div>
            
            <div className="user-stats">
              <div className="stat-item">
                <div className="stat-value">{userData.totalCreated}</div>
                <div className="stat-label">Tokens Created</div>
              </div>
              
              <div className="stat-divider"></div>
              
              <div className="stat-item">
                <div className="stat-value">${userData.totalVolume}</div>
                <div className="stat-label">Total Volume</div>
              </div>
              
              <div className="stat-divider"></div>
              
              <div className="stat-item">
                <div className="stat-value">{userData.followerCount}</div>
                <div className="stat-label">Followers</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="profile-tabs">
          <div className="tab-nav">
            <div 
              className={`tab-nav-item ${activeTab === "tokens" ? "active" : ""}`} 
              onClick={() => setActiveTab("tokens")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 16.01L12.01 15.9989" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" 
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              My Tokens
            </div>
            
            <div 
              className={`tab-nav-item ${activeTab === "transactions" ? "active" : ""}`} 
              onClick={() => setActiveTab("transactions")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10L3 14L7 18M17 18L21 14L17 10M14 4L10 20" 
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Transactions
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="profile-tabs-container">
            {activeTab === "tokens" && (
              <div className="tab-content">
                <div className="section-header">
                  <h2 className="section-title">Tokens Created</h2>
                  
                  <div className="tokens-controls">
                    <div className="search-filter">
                      <div className="search-wrapper">
                        <div className="search-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
                              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <input 
                          type="text" 
                          className="search-input" 
                          placeholder="Search tokens" 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                          <button className="clear-search" onClick={() => setSearchTerm("")}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      className="sort-button" 
                      onClick={() => setSortDirection(sortDirection === "desc" ? "asc" : "desc")}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {sortDirection === "desc" ? (
                          <path d="M3 4H16M3 8H12M3 12H9M14 12L17 9M17 9L20 12M17 9V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        ) : (
                          <path d="M3 4H16M3 8H12M3 12H9M14 12L17 15M17 15L20 12M17 15V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        )}
                      </svg>
                      {sortDirection === "desc" ? "Highest First" : "Lowest First"}
                    </button>
                    
                    <button className="create-token-button">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4V20M20 12L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Create Token
                    </button>
                  </div>
                </div>
                
                {/* Tokens List */}
                {isLoading ? (
                  <div className="loading-container">
                    <div className="spinner"></div>
                    <p className="loading-text">Loading your tokens...</p>
                  </div>
                ) : (
                  <div className="tokens-container">
                    <div className="scroll-indicator left" onClick={handleScrollLeft}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 19L8 12L15 5" stroke="#00F6AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    
                    <div className="tokens-scroll-container">
                      {sortedTokens.length > 0 ? (
                        sortedTokens.map(token => (
                          <div key={token.id} className="token-card-container">
                            <TokenCard token={token} />
                          </div>
                        ))
                      ) : (
                        <div className="no-tokens-message">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.5 18C8.5 18 9 17 12 17C15 17 15.5 18 15.5 18M7 12.5C7 11.6716 7.44772 11 8 11C8.55228 11 9 11.6716 9 12.5C9 13.3284 8.55228 14 8 14C7.44772 14 7 13.3284 7 12.5ZM15 12.5C15 11.6716 15.4477 11 16 11C16.5523 11 17 11.6716 17 12.5C17 13.3284 16.5523 14 16 14C15.4477 14 15 13.3284 15 12.5ZM16.5 6.5L20 8M7.5 6.5L4 8M17 21H7C5.89543 21 5 20.1046 5 19V15.125M17 21C18.1046 21 19 20.1046 19 19V15.125M17 21H19.3284C19.7656 21 20.1056 20.6312 20.0702 20.1953L19.6341 15.125M19 15.125H19.6341M5 15.125H4.36593C3.9288 15.125 3.58883 15.4938 3.62419 15.9297L4.06029 20.1953C4.09445 20.6312 4.43444 21 4.87156 21H7M5 15.125V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V15.125" 
                              stroke="#7B8794" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <p>No tokens found matching "{searchTerm}"</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="scroll-indicator right" onClick={handleScrollRight}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 5L16 12L9 19" stroke="#00F6AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                )}
                
                {/* Token statistics cards */}
                <div className="token-stats-section">
                  <h3 className="stats-title">Token Performance</h3>
                  <div className="token-stats-cards">
                    <div className="stat-card best-performer">
                      <div className="stat-card-header">
                        <h4>Best Performer</h4>
                        <div className="performance-badge positive">+32.7%</div>
                      </div>
                      <div className="stat-card-content">
                        <img src="https://cdn.pixabay.com/photo/2021/05/24/09/15/ethereum-6278326_960_720.jpg" alt="Token" className="token-stat-logo" />
                        <div className="token-stat-info">
                          <div className="token-stat-name">Gamma Token</div>
                          <div className="token-stat-price">$0.1245</div>
                        </div>
                        <div className="mini-chart">
                          <svg viewBox="0 0 100 30" width="100" height="30">
                            <path d="M0,25 L10,20 L20,22 L30,15 L40,18 L50,10 L60,12 L70,5 L80,8 L90,2 L100,0" fill="none" stroke="#00F6AA" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="stat-card most-volume">
                      <div className="stat-card-header">
                        <h4>Highest Volume</h4>
                        <div className="volume-badge">$4.3M</div>
                      </div>
                      <div className="stat-card-content">
                        <img src="https://cdn.pixabay.com/photo/2022/02/12/18/19/monkey-7009603_960_720.jpg" alt="Token" className="token-stat-logo" />
                        <div className="token-stat-info">
                          <div className="token-stat-name">Delta DAO</div>
                          <div className="token-stat-price">$2.34</div>
                        </div>
                        <div className="mini-chart">
                          <svg viewBox="0 0 100 30" width="100" height="30">
                            <path d="M0,15 L10,18 L20,12 L30,16 L40,10 L50,15 L60,8 L70,12 L80,5 L90,10 L100,8" fill="none" stroke="#8A78FF" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "transactions" && (
              <div className="tab-content transactions-section">
                <h2 className="section-title">Transaction History</h2>
                
                {/* Transactions Table Header */}
                <div className="transactions-table">
                  <div className="transactions-table-header">
                    <div className="header-cell type-cell">Type</div>
                    <div className="header-cell token-cell">Token</div>
                    <div className="header-cell amount-cell">Amount</div>
                    <div className="header-cell value-cell">Value</div>
                    <div className="header-cell date-cell">Date</div>
                    <div className="header-cell status-cell">Status</div>
                    <div className="header-cell actions-cell">Actions</div>
                  </div>
                  
                  {/* Transactions List */}
                  <div className="transactions-list">
                    {currentTransactions.map(tx => (
                      <div key={tx.id} className="transaction-item">
                        {/* Type Cell with Icon */}
                        <div className="transaction-cell type-cell">
                          <div className={`transaction-icon ${tx.type}`}>
                            {tx.type === "buy" && (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" fill="rgba(0, 246, 170, 0.1)" />
                                <path d="M12 8L12 16M12 8L16 12M12 8L8 12" stroke="#00F6AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                            {tx.type === "sell" && (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" fill="rgba(255, 91, 91, 0.1)" />
                                <path d="M12 16L12 8M12 16L16 12M12 16L8 12" stroke="#FF5B5B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                            {tx.type === "create" && (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" fill="rgba(138, 120, 255, 0.1)" />
                                <path d="M12 8V16M8 12H16" stroke="#8A78FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                            <span className="transaction-type-text">
                              {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Token Cell */}
                        <div className="transaction-cell token-cell">
                          <span className="token-name-text">{tx.token}</span>
                          <span className="token-symbol-text">{tx.symbol}</span>
                        </div>
                        
                        {/* Amount Cell */}
                        <div className="transaction-cell amount-cell">
                          {tx.amount}
                        </div>
                        
                        {/* Value Cell */}
                        <div className="transaction-cell value-cell">
                          {tx.value ? tx.value : tx.type === "create" ? "-" : "N/A"}
                        </div>
                        
                        {/* Date Cell */}
                        <div className="transaction-cell date-cell">
                          {new Date(tx.date).toLocaleDateString()} 
                          <span className="time-ago">
                            {(() => {
                              const seconds = Math.floor((Date.now() - tx.date) / 1000);
                              const minutes = Math.floor(seconds / 60);
                              const hours = Math.floor(minutes / 60);
                              const days = Math.floor(hours / 24);
                              
                              if (days > 0) return `${days}d ago`;
                              if (hours > 0) return `${hours}h ago`;
                              if (minutes > 0) return `${minutes}m ago`;
                              return `${seconds}s ago`;
                            })()}
                          </span>
                        </div>
                        
                        {/* Status Cell */}
                        <div className="transaction-cell status-cell">
                          <span className={`status-badge ${tx.status}`}>
                            {tx.status}
                          </span>
                        </div>
                        
                        {/* Actions Cell */}
                        <div className="transaction-cell actions-cell">
                          {tx.type !== "create" && (
                            <div className="transaction-actions">
                              <button 
                                className="action-button buy-button"
                                onClick={() => handleTransactionAction("buy", tx.tokenId, tx.symbol)}
                              >
                                Buy
                              </button>
                              <button 
                                className="action-button sell-button"
                                onClick={() => handleTransactionAction("sell", tx.tokenId, tx.symbol)}
                              >
                                Sell
                              </button>
                            </div>
                          )}
                          {tx.type === "create" && (
                            <div className="transaction-actions">
                              <button 
                                className="action-button view-button"
                                onClick={() => handleTransactionAction("view", tx.tokenId, tx.symbol)}
                              >
                                View
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination Controls */}
                  <div className="pagination-controls">
                    <button 
                      className="pagination-button prev-button" 
                      onClick={prevPage}
                      disabled={currentPage === 1}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    
                    <div className="pagination-info">
                      Page {currentPage} of {totalPages}
                    </div>
                    
                    <button 
                      className="pagination-button next-button" 
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;