"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ethers } from "ethers";
import { fetchHoldersAndPriceData, fetchTokenById } from "../../../utils/_api";
import Header from "@/components/Header";
import "../../../styles/TokenDetailPage.css";
import { useWallet } from "@/context/WalletContext";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  TimeScale
} from "chart.js";
import 'chartjs-adapter-date-fns';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, TimeScale);

const HYPE_TOKEN_ABI = [
  "function buyTokens() public payable",
  "function sellTokens(uint256 tokenAmount) public",
  "function getCurrentPrice() public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)"
];

const EDU_TOKEN_ADDRESS = "0xbe52762D8D68d183C7Cf4BB3e2aaa312e47C7084"; // EDU Token Address
const EDU_TOKEN_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)"
];

const THRESHOLD = process.env.NEXT_PUBLIC_THESHOLD;


const TokenDetailPage = () => {
  const { id } = useParams();  // Token contract address
  const [token, setToken] = useState(null);
  const [holders, setHolders] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tradeType, setTradeType] = useState("buy");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [balance, setBalance] = useState("0.0");
  const { provider, account, connected } = useWallet();
  const [currentPrice, setCurrentPrice] = useState("0.0");
  const [calculatedTokens, setCalculatedTokens] = useState("0.0");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [eduBalance, setEduBalance] = useState(0);

  // 🚀 Handle Buy/Sell Button State
  const isTradeButtonDisabled = !connected || isProcessing || !amount || parseFloat(amount) <= 0;

  const tradeButtonMessage = !connected
    ? "🔌 Please connect your wallet to place a trade."
    : "";

  // Load token data and set provider
  useEffect(() => {
    const loadToken = async () => {
      if (id) {
        const tokenData = await fetchTokenById(id);
        setToken(tokenData);

        if (connected) {
          fetchBalanceAndPrice(tokenData);
          const { holders, priceHistory } = await fetchHoldersAndPriceData(id, provider);
          setHolders(holders);
          setPriceHistory(priceHistory);

          setErrorMessage("");
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
        const nativeBalanceRaw = await provider.getBalance(account);
        setEduBalance(ethers.formatEther(nativeBalanceRaw));
        const tokenContract = new ethers.Contract(tokenData.id, HYPE_TOKEN_ABI, provider);
        const balanceRaw = await tokenContract.balanceOf(account);
        setBalance(ethers.formatEther(balanceRaw)); // Convert from Wei to ETH format
        const priceRaw = await tokenContract.getCurrentPrice();
        setCurrentPrice(ethers.formatEther(priceRaw));
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
    setErrorMessage("");
    if (tradeType === "buy" && currentPrice > 0) {
      const eduAmount = ethers.parseUnits(value || "0", "ether");
      const priceInWei = ethers.parseUnits(currentPrice.toString(), "ether");
      const tokens = Number(eduAmount) / Number(priceInWei);
      setCalculatedTokens(Number(tokens).toFixed(4));
      if( eduBalance < value){
        setErrorMessage(`Input cannot exceed User Balance. Your Balance is ${eduBalance}`, )
      }

    } else if (tradeType === "sell") {
      if( balance < value){
        setErrorMessage(`Input cannot exceed User Balance. Your Balance is ${balance}`, )
      }
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
      const approveTx = await eduTokenContract.approve(id, eduAmountInWei);
      await approveTx.wait();
      console.log("EDU approved");

      // Initialize the Token contract (HypeToken)

      const tokenContract = new ethers.Contract(id, HYPE_TOKEN_ABI, signer);

      // Call buyTokens
      const buyTx = await tokenContract.buyTokens({
        value: eduAmountInWei,
      });
      await buyTx.wait();

      setSuccessMessage("Purchase successful!");
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

      const tokenContract = new ethers.Contract(id, HYPE_TOKEN_ABI, signer);
      const tokenAmountInWei = ethers.parseEther(amount);

      const tx = await tokenContract.sellTokens(tokenAmountInWei);
      await tx.wait();

      setSuccessMessage("Sell successful!");

      // Refresh the user's balance after selling
      await fetchBalanceAndPrice();
    } catch (error) {
      console.error("Error during sale:", error);
      setErrorMessage("Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  
  const chartConfig = {
    
    labels: priceHistory.map((data) => data.time), // X-axis labels (timestamps from the API)
    datasets: [
      {
        label: "Price History (USD)",
        data: priceHistory.map((data) => data.price*100), // Dynamic Y-axis values
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
          gradient.addColorStop(0, "rgba(34, 197, 94, 0.3)");
          gradient.addColorStop(1, "rgba(220, 38, 38, 0.3)");
          return gradient;
        },
        borderColor: "#22c55e",
        tension: 0.4, // Smooth curve
        pointRadius: 0, // Hide points
      },
    ],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // Hide legend
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              const value = parseFloat(tooltipItem.raw);
              return `Price: $${value.toFixed(6)}`; // Tooltip with 6 decimal places
            },
          },
          backgroundColor: "#1e293b",
          borderColor: "#22c55e",
          borderWidth: 1,
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
        },
      },
      scales: {
        x: {
          type: "time", // X-axis for time-series data
          time: {
            unit: "hour", // Adjust based on data granularity
            displayFormats: {
              hour: "MMM dd, HH:mm",
            },
          },
          grid: {
            display: false, // Hide gridlines for X-axis
          },
          ticks: {
            color: "#9ca3af", // X-axis tick label color
          },
        },
        y: {
          
          min: 0,
          grid: {
            color: "rgba(255, 255, 255, 0.1)", // Y-axis gridline color
          },
          title: {
            display: true,
            text: "Price (USD)",
            color: "#ffffff",
            font: {
              size: 14,
            },
          },
        },
      },
    },
  };

  console.log(chartConfig.datasets, priceHistory)

  if (loading) {
    return (
      <div className="loading-container">
        <Header />
        <div className="spinner">
          <div className="double-bounce1"></div>
          <div className="double-bounce2"></div>
        </div>
        <p>Loading token details...</p>
      </div>
    );
  }
  return (
    <div>
      <Header />

      <div className="token-page-container">
        {/* Centered Go Back Button */}
        <div className="go-back-container">
          <button className="go-back" onClick={() => window.history.back()}>
            [go back]
          </button>
        </div>

        {/* Content Wrapper */}
        <div className="content-wrapper">
          {/* Left Section */}
          <div className="left-section">
            {/* Token Details */}
            <div className="token-details-section">
              {/* Flex container for image and details */}
              <div className="details-container">
                {/* Token Image */}
                <div className="token-image-container">
                  <img
                    src={imageSrc}
                    alt={token.name}
                    className="token-detail-image"
                  />
                </div>

                {/* Token Name and Details */}
                <div className="token-text-details">
                  <h2>
                    {token.name} ({token.symbol})
                  </h2>
                  <p>{token.description}</p>

                  {/* Additional Details */}
                  <div >
                    <p>
                      <strong>Market Cap:</strong> ${token.marketCap}
                    </p>
                    <p>
                      <strong>24hr Volume:</strong> ${token.dailyVolume}
                    </p>
                    <p>
                      <strong>Created By:</strong>{" "}
                      <span
                        className="creator-address"
                        title={token.creator}
                      >
                        {/*`${token.creator.slice(0, 6)}...${token.creator.slice(-4)}`*/}
                        {token.creator}
                      </span>
                    </p>
                    <p>
                      <strong>Created On:</strong>{" "}
                      {new Date(token.createdOn * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bonding Curve Progress */}
              <div className="progress-section">
                <p>
                  Bonding Curve Progress:{" "}
                  {((token.tokensSold / THRESHOLD) * 100).toFixed(2)}%
                </p>
                <progress
                  value={token.tokensSold}
                  max={THRESHOLD}
                  style={{
                    width: "100%",
                    height: "12px",
                    borderRadius: "10px",
                    overflow: "hidden", // Ensures rounded corners display properly
                  }}
                ></progress>
              </div>
            </div>

            {/* Chart Section */}
            <div className="chart-container">
              <h3>Price History</h3>
              <Line data={chartConfig} />
              <div className="legend-container">
                <span>Price History (USD)</span>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="right-section">
            {/* Buy/Sell Feature */}
            <div className="trade-section">
              <div className="trade-box">
                {/* Buy/Sell Toggle Buttons */}
                <div className="trade-buttons">
                  <button
                    className={`trade-btn ${tradeType === "buy" ? "active" : ""
                      }`}
                    onClick={() => handleTradeTypeChange("buy")}
                  >
                    Buy
                  </button>
                  <button
                    className={`trade-btn ${tradeType === "sell" ? "active" : ""
                      }`}
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
                    You will receive: <strong>{calculatedTokens}</strong>{" "}
                    {token.symbol}
                  </p>
                )}

                {/* Percentage Buttons for Sell */}
                {tradeType === "sell" && (
                  <div className="quick-buttons">
                    <button onClick={() => handlePercentageClick(0)}>
                      Reset
                    </button>
                    <button onClick={() => handlePercentageClick(0.25)}>
                      25%
                    </button>
                    <button onClick={() => handlePercentageClick(0.5)}>
                      50%
                    </button>
                    <button onClick={() => handlePercentageClick(0.75)}>
                      75%
                    </button>
                    <button onClick={() => handlePercentageClick(1)}>
                      100%
                    </button>
                  </div>
                )}

                {/* Buy/Sell Button */}
                <button
                  className={`place-trade-btn ${tradeType === "sell" ? "sell" : "buy"
                    }`}
                  onClick={tradeType === "buy" ? handleBuy : handleSell}
                  disabled={isTradeButtonDisabled}
                >
                  {isProcessing ? "Processing..." : "Place Trade"}
                </button>
                {successMessage && (
                  <p className="success-message">{successMessage}</p>
                )}
                {errorMessage && (
                  <p className="error-message">{errorMessage}</p>
                )}
              </div>
            </div>

            {/* Holders List */}
            <div className="holders-container">
              <h3>Holders</h3>
              <ul>
                {holders.map((holder, index) => (
                  <li key={index}>
                    {holder.address} - {holder.balance} {token?.symbol}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDetailPage;