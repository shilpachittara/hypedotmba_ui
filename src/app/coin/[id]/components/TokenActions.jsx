"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

const HypeTokenABI = [
  // Add only the functions you need from your contract
  "function getPrice(uint256 tokenAmount) view returns (uint256)",
  "function getCurrentPrice(uint256 tokenAmount) view returns (uint256)",
  "function getTokensForEdu(uint256 eduAmount) view returns (uint256)",
  "function buyTokens() payable",
  "function sellTokens(uint256 tokenAmount)",
  "function balanceOf(address account) view returns (uint256)"
];

export default function TokenActions({ tokenAddress }) {
  const [amount, setAmount] = useState("");
  const [buyPrice, setBuyPrice] = useState(null);
  const [sellPrice, setSellPrice] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Initialize and fetch price
    const fetchData = async () => {
      if (typeof window.ethereum !== "undefined" && tokenAddress) {
        try {
          // Get provider and signer
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          
          // Create contract instance
          const contract = new ethers.Contract(tokenAddress, HypeTokenABI, signer);
          
          // Fetch prices
          const oneTok = ethers.parseEther("1");
          const price = await contract.getPrice(oneTok);
          setBuyPrice(price);
          setSellPrice(price);
          
          // Fetch user's token balance
          const userAddress = await signer.getAddress();
          const userBalance = await contract.balanceOf(userAddress);
          setBalance(userBalance);
        } catch (err) {
          console.error("Failed to fetch token data:", err);
          setError("Failed to load token data");
        }
      }
    };
    
    fetchData();
  }, [tokenAddress]);

  // Convert Wei to ETH for display
  const formatWei = (wei) => {
    if (!wei) return "0";
    return ethers.formatEther(wei);
  };
  
  // Format token amount for display
  const formatTokens = (tokens) => {
    if (!tokens) return "0";
    // For token amounts, divide by 10^18 if your token has 18 decimals
    return ethers.formatEther(tokens);
  };

  const handleBuy = async () => {
    if (!amount) {
      setError("Please enter an amount");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create contract instance
      const contract = new ethers.Contract(tokenAddress, HypeTokenABI, signer);
      
      // Calculate ETH amount needed based on token amount
      const tokenAmount = ethers.parseEther(amount);
      const ethAmount = await contract.getPrice(tokenAmount);
      
      // Execute buy transaction
      const tx = await contract.buyTokens({
        value: ethAmount,
        gasLimit: 300000
      });
      
      await tx.wait();
      
      // Update balance after purchase
      const userAddress = await signer.getAddress();
      const newBalance = await contract.balanceOf(userAddress);
      setBalance(newBalance);
      
      setSuccess(`Successfully bought ${amount} tokens!`);
    } catch (err) {
      console.error("Error buying tokens:", err);
      setError(err.message || "Failed to buy tokens");
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async () => {
    if (!amount) {
      setError("Please enter an amount");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create contract instance
      const contract = new ethers.Contract(tokenAddress, HypeTokenABI, signer);
      
      // Convert amount to wei
      const tokenAmount = ethers.parseEther(amount);
      
      // Execute sell transaction
      const tx = await contract.sellTokens(tokenAmount, {
        gasLimit: 300000
      });
      
      await tx.wait();
      
      // Update balance after selling
      const userAddress = await signer.getAddress();
      const newBalance = await contract.balanceOf(userAddress);
      setBalance(newBalance);
      
      setSuccess(`Successfully sold ${amount} tokens!`);
    } catch (err) {
      console.error("Error selling tokens:", err);
      setError(err.message || "Failed to sell tokens");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Buy/Sell Tokens</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-400">Your Balance: {balance ? formatTokens(balance) : "Loading..."} tokens</p>
        <p className="text-sm text-gray-400">Buy Price: {buyPrice ? formatWei(buyPrice) : "Loading..."} EDU per token</p>
        <p className="text-sm text-gray-400">Sell Price: {sellPrice ? formatWei(sellPrice) : "Loading..."} EDU per token</p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Amount (tokens)</label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter token amount"
          className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}
      
      <div className="flex space-x-2">
        <button
          onClick={handleBuy}
          disabled={loading}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? "Processing..." : "Buy"}
        </button>
        <button
          onClick={handleSell}
          disabled={loading}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? "Processing..." : "Sell"}
        </button>
      </div>
    </div>
  );
} 