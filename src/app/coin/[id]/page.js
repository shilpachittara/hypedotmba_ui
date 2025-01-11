"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ethers } from "ethers";
import { fetchTokenById } from "../../../utils/_api";
import Header from "@/components/Header";
import "../../../styles/TokenDetail.css";
import { useWallet } from "@/context/WalletContext";

const HYPE_TOKEN_ABI = [
  "function buyTokens(uint256 eduAmount) public",
  "function sellTokens(uint256 tokenAmount) public",
  "function getCurrentPrice() public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)"
];

const EDU_TOKEN_ADDRESS = "0xbe52762D8D68d183C7Cf4BB3e2aaa312e47C7084"; // EDU Token Address
const EDU_TOKEN_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)"
];

const TokenDetailPage = () => {
  const { id } = useParams();  // Token contract address
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tradeType, setTradeType] = useState("buy");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [balance, setBalance] = useState("0.0");
  const { provider, account, connected } = useWallet();
  const [currentPrice, setCurrentPrice] = useState("0.0");
  const [calculatedTokens, setCalculatedTokens] = useState("0.0");

  // Load token data and set provider
  useEffect(() => {
    const loadToken = async () => {
      if (id) {
        const tokenData = await fetchTokenById(id);
        setToken(tokenData);
        if (connected) {
          fetchBalanceAndPrice(tokenData);
        }
        setLoading(false);
      }
    };


    loadToken();
  }, [id, connected]);

  // Fetch the user's balance of the selected token
  const fetchBalanceAndPrice = async (tokenData) => {
    if (typeof window.ethereum !== "undefined") {
      try {
        console.log(provider)
        const tokenContract = new ethers.Contract(tokenData.id, HYPE_TOKEN_ABI, provider);
        const balanceRaw = await tokenContract.balanceOf(account);
        setBalance(ethers.formatEther(balanceRaw)); // Convert from Wei to ETH format
        const priceRaw = await tokenContract.getCurrentPrice();
        setCurrentPrice(ethers.formatEther(priceRaw));
        console.log("balance is : ", balanceRaw, priceRaw);

      } catch (error) {
        console.error("Error fetching token balance:", error);
      }
    } else {
      console.warn("MetaMask is not installed.");
    }
  };

  const imageSrc = token && token.image && token.image !== "https://example.com/image.png" && token.image !== ""
    ? token.image
    : "/default_image.png";

  // Handle Buy/Sell Toggle
  const handleTradeTypeChange = (type) => {
    setTradeType(type);
    setAmount("");
    setCalculatedTokens("0.0");
  };

  // 💵 Handle input change and calculate token amount
  const handleAmountChange = (value) => {
    setAmount(value);

    if (tradeType === "buy" && currentPrice > 0) {
      const eduAmount = ethers.parseUnits(value || "0", "ether");
      const priceInWei = ethers.parseUnits(currentPrice.toString(), "ether");
      const tokens = eduAmount / priceInWei;
      setCalculatedTokens(Number(tokens).toFixed(4));

    } else if (tradeType === "sell") {
      setCalculatedTokens(value);
    }
  };

  // ⏳ Handle percentage buttons for sell
  const handlePercentageClick = (percentage) => {
    const amount = parseFloat(balance) * percentage;
    setAmount(amount.toFixed(4));
    setCalculatedTokens(amount.toFixed(4));
  };

  // Handle Buy Transaction
  const handleBuy = async () => {
    if (!connected) {
      alert("Please connect your wallet.");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      setIsProcessing(true);

      const signer = await provider.getSigner();

      // Initialize EDU token contract
      const eduTokenContract = new ethers.Contract(EDU_TOKEN_ADDRESS, EDU_TOKEN_ABI, signer);

      // Convert amount to Wei
      const eduAmountInWei = ethers.parseEther(amount);

      // Approve token contract to spend EDU
      const approveTx = await eduTokenContract.approve(id, eduAmountInWei);
      await approveTx.wait();
      console.log("EDU approved");

      // Initialize the Token contract (HypeToken)

      const tokenContract = new ethers.Contract(id, HYPE_TOKEN_ABI, signer);

      // Call buyTokens
      const buyTx = await tokenContract.buyTokens(eduAmountInWei);
      await buyTx.wait();

      alert("Purchase successful!");
    } catch (error) {
      console.error("Error during purchase:", error);
      alert("Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Sell Transaction
  const handleSell = async () => {
    if (!connected) {
      alert("Please connect your wallet.");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      alert("You don't have enough tokens to sell.");
      return;
    }

    try {
      setIsProcessing(true);
      const signer = await provider.getSigner();

      const tokenContract = new ethers.Contract(id, HYPE_TOKEN_ABI, signer);
      const tokenAmountInWei = ethers.parseEther(amount);

      const tx = await tokenContract.sellTokens(tokenAmountInWei);
      await tx.wait();

      alert("Sell successful!");

      // Refresh the user's balance after selling
      await fetchUserTokenBalance();
    } catch (error) {
      console.error("Error during sale:", error);
      alert("Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <p>Loading token details...</p>
      </div>
    );
  }

  return (
    <div>
      <Header />
        <button className="go-back" onClick={() => window.history.back()}>
          [go back]
        </button>
      <div className="token-page-container">
        {/* Left: Trade Section */}
        <div className="trade-section">
          <div className="trade-box">
            {/* Buy/Sell Toggle Buttons */}
            <div className="trade-buttons">
              <button
                className={`trade-btn ${tradeType === "buy" ? "active" : ""}`}
                onClick={() => handleTradeTypeChange("buy")}
              >
                Buy
              </button>
              <button
                className={`trade-btn ${tradeType === "sell" ? "active" : ""}`}
                onClick={() => handleTradeTypeChange("sell")}
              >
                Sell
              </button>
            </div>

            {/* Input Field */}
            <div className="trade-input">
              <label>
                Amount ({tradeType === "buy" ? "EDU" : token.symbol})
              </label>
              <div className="input-wrapper">
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                />
                <span>{tradeType === "buy" ? "EDU" : token.symbol}</span>
              </div>
            </div>

            {/* Real-time Token Calculation */}
            {tradeType === "buy" && (
              <p className="calculated-tokens">
                You will receive: <strong>{calculatedTokens}</strong> {token.symbol}
              </p>
            )}


            {/* Show Percentage Buttons Only for Sell */}
            {tradeType === "sell" && (
              <div className="quick-buttons">
                <button onClick={() => handlePercentageClick(0)}>Reset</button>
                <button onClick={() => handlePercentageClick(0.25)}>25%</button>
                <button onClick={() => handlePercentageClick(0.5)}>50%</button>
                <button onClick={() => handlePercentageClick(0.75)}>75%</button>
                <button onClick={() => handlePercentageClick(1)}>100%</button>
              </div>
            )}

            {/* Buy/Sell Button */}
            <button
              className={`place-trade-btn ${tradeType === "sell" ? "sell" : "buy"}`}
              onClick={tradeType === "buy" ? handleBuy : handleSell}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Place Trade"}
            </button>
          </div>
        </div>

        {/* Right: Token Details */}
        <div className="token-details-section">
          <img src={imageSrc} alt={token.name} className="token-detail-image" />
          <h2>{token.name} ({token.symbol})</h2>
          <p>{token.description}</p>

          {/* Bonding Curve Progress */}
          <div className="progress-section">
            <p>Bonding Curve Progress: {(token.tokensSold / 800_000_000 * 100).toFixed(2)}%</p>
            <progress value={token.tokensSold} max="800000000"></progress>
          </div>
        </div>
      </div>
    </div>
  );


};

export default TokenDetailPage;