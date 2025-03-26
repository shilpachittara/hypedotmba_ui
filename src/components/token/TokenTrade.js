"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const HYPE_TOKEN_ABI = [
  "function buyTokens() public payable",
  "function sellTokens(uint256 tokenAmount) public",
  "function getCurrentPrice() public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)"
];

const EDU_TOKEN_ADDRESS = "0xbe52762D8D68d183C7Cf4BB3e2aaa312e47C7084";
const EDU_TOKEN_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)"
];

const TokenTrade = ({ token, provider, account, connected }) => {
  const [tradeType, setTradeType] = useState('buy');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [balance, setBalance] = useState("0.0");
  const [currentPrice, setCurrentPrice] = useState("0.0");
  const [calculatedTokens, setCalculatedTokens] = useState("0.0");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [eduBalance, setEduBalance] = useState(0);

  // Handle trade button state
  const isTradeButtonDisabled = !connected || isProcessing || !amount || parseFloat(amount) <= 0;

  // Fetch balances and price when component mounts or when connected/token changes
  useEffect(() => {
    if (connected && token && provider && account) {
      fetchBalanceAndPrice();
    }
  }, [connected, token, provider, account]);

  // Fetch the user's balance of the selected token
  const fetchBalanceAndPrice = async () => {
    if (typeof window.ethereum !== "undefined" && connected && provider && token) {
      try {
        // Get EDU balance
        const nativeBalanceRaw = await provider.getBalance(account);
        setEduBalance(ethers.formatEther(nativeBalanceRaw));
        
        // Get token balance
        const tokenContract = new ethers.Contract(token.id, HYPE_TOKEN_ABI, provider);
        const balanceRaw = await tokenContract.balanceOf(account);
        setBalance(ethers.formatEther(balanceRaw)); // Convert from Wei to ETH format
        
        // Get current price
        const priceRaw = await tokenContract.getCurrentPrice();
        setCurrentPrice(ethers.formatEther(priceRaw));
      } catch (error) {
        console.error("Error fetching token balance:", error);
      }
    }
  };

  // Handle Buy/Sell Toggle
  const handleTradeTypeChange = (type) => {
    setTradeType(type);
    setAmount("");
    setCalculatedTokens("0.0");
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Handle input change and calculate token amount
  const handleAmountChange = (value) => {
    if (value === '' || /^(\d+\.?\d*|\.\d+)$/.test(value)) {
      setAmount(value);
      setErrorMessage("");
      
      if (tradeType === "buy" && parseFloat(currentPrice) > 0) {
        const eduAmount = parseFloat(value || "0");
        const tokens = eduAmount / parseFloat(currentPrice);
        setCalculatedTokens(tokens.toFixed(4));
        
        if (eduBalance < eduAmount) {
          setErrorMessage(`Input cannot exceed your balance. Your balance is ${eduBalance} EDU`);
        }
      } else if (tradeType === "sell") {
        setCalculatedTokens(value);
        
        if (parseFloat(balance) < parseFloat(value)) {
          setErrorMessage(`Input cannot exceed your balance. Your balance is ${balance} ${token?.symbol}`);
        }
      }
    }
  };

  // Handle percentage buttons
  const handleQuickAmount = (percentage) => {
    const maxAmount = tradeType === 'buy' ? eduBalance : balance;
    const amount = (parseFloat(maxAmount) * (percentage / 100)).toFixed(6);
    handleAmountChange(amount);
  };

  // Handle Buy Transaction
  const handleBuy = async () => {
    if (!connected) {
      setErrorMessage("Please connect your wallet.");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage("Please enter a valid amount.");
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage("");
      setSuccessMessage("");

      const signer = await provider.getSigner();

      // Initialize EDU token contract
      const eduTokenContract = new ethers.Contract(EDU_TOKEN_ADDRESS, EDU_TOKEN_ABI, signer);

      // Convert amount to Wei
      const eduAmountInWei = ethers.parseEther(amount);

      // Approve token contract to spend EDU
      const approveTx = await eduTokenContract.approve(token.id, eduAmountInWei);
      await approveTx.wait();
      console.log("EDU approved");

      // Initialize the Token contract
      const tokenContract = new ethers.Contract(token.id, HYPE_TOKEN_ABI, signer);

      // Call buyTokens
      const buyTx = await tokenContract.buyTokens({
        value: eduAmountInWei,
      });
      await buyTx.wait();

      setSuccessMessage("Purchase successful!");
      fetchBalanceAndPrice();
    } catch (error) {
      console.error("Error during purchase:", error);
      setErrorMessage("Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Sell Transaction
  const handleSell = async () => {
    if (!connected) {
      setErrorMessage("Please connect your wallet.");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage("Please enter a valid amount.");
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      setErrorMessage("You don't have enough tokens to sell.");
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage("");
      setSuccessMessage("");

      const signer = await provider.getSigner();

      const tokenContract = new ethers.Contract(token.id, HYPE_TOKEN_ABI, signer);
      const tokenAmountInWei = ethers.parseEther(amount);

      const tx = await tokenContract.sellTokens(tokenAmountInWei);
      await tx.wait();

      setSuccessMessage("Sell successful!");
      fetchBalanceAndPrice();
    } catch (error) {
      console.error("Error during sale:", error);
      setErrorMessage("Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="trade-section">
      <h3>Trade Token</h3>
      <div className="trade-box">
        <div className="trade-tabs">
          <button 
            className={`trade-tab ${tradeType === 'buy' ? 'active' : ''}`}
            onClick={() => handleTradeTypeChange('buy')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Buy
          </button>
          <button 
            className={`trade-tab ${tradeType === 'sell' ? 'active' : ''}`}
            onClick={() => handleTradeTypeChange('sell')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
            </svg>
            Sell
          </button>
        </div>
        
        <div className="balance-display">
          <span>Your Balance: </span>
          <span className="balance-amount">
            {tradeType === 'buy' 
              ? `${parseFloat(eduBalance).toFixed(4)} EDU` 
              : `${parseFloat(balance).toFixed(4)} ${token?.symbol}`}
          </span>
        </div>
        
        <div className="amount-container">
          <label>Amount</label>
          <div className="amount-input-wrapper">
            <input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
            />
            <span className="percentage-symbol">
              {tradeType === 'buy' ? 'EDU' : token?.symbol || 'TOKEN'}
            </span>
          </div>
        </div>
        
        {tradeType === "buy" && (
          <p className="calculated-tokens">
            You will receive: <strong>{calculatedTokens}</strong> {token?.symbol}
          </p>
        )}
        
        <div className="quick-amount-buttons">
          <button onClick={() => handleQuickAmount(25)}>25%</button>
          <button onClick={() => handleQuickAmount(50)}>50%</button>
          <button onClick={() => handleQuickAmount(75)}>75%</button>
          <button onClick={() => handleQuickAmount(100)}>100%</button>
        </div>
        
        <button
          className={`trade-button ${tradeType}`}
          onClick={tradeType === 'buy' ? handleBuy : handleSell}
          disabled={isTradeButtonDisabled}
        >
          {isProcessing 
            ? 'Processing...' 
            : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${token?.symbol}`}
        </button>
        
        {!connected && (
          <p className="connect-wallet-message">
            Please connect your wallet to trade
          </p>
        )}
        
        {successMessage && (
          <div className="success-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenTrade;