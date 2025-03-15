"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ethers } from "ethers";
import { fetchHoldersAndPriceData, fetchTokenById } from "../../../utils/_api";
import Header from "@/components/Header";
import "@/styles/TokenDetailPage.css";
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
import Image from "next/image";
import Chart from 'chart.js/auto';

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

// Function to generate dummy price history data based on token ID
const generatePriceHistory = (id, currentPrice, priceChange) => {
  const idNum = parseInt(id) || 1;
  const seed = idNum * 13;
  const days = 30; // 30 days of data
  const priceData = [];
  const labels = [];
  
  // Create a somewhat realistic price trend
  let price = parseFloat(currentPrice);
  // Work backwards to calculate what the price would have been 30 days ago
  const dailyChangePercent = parseFloat(priceChange) / 5; // Smoother trend than just the 24h change
  const startPrice = price / Math.pow(1 + (dailyChangePercent / 100), days);
  
  const now = new Date();
  
  // Generate day labels and prices
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    // Generate a price with some randomness but overall following the trend
    const volatilityFactor = 0.5 + (Math.sin(seed + i) * 0.5); // Value between 0 and 1
    const dayChange = (dailyChangePercent / 100) * volatilityFactor;
    
    if (i === days - 1) {
      // First day uses start price
      price = startPrice;
    } else {
      // Subsequent days add a bit of random noise to the trend
      price = price * (1 + dayChange + ((Math.sin(seed * i) * 0.02))); 
    }
    
    priceData.push(price);
  }
  
  return {
    labels,
    prices: priceData
  };
};

// Function to generate consistent dummy data based on ID
const generateDummyToken = (id) => {
  // Use ID to create somewhat deterministic but varied dummy data
  const idNum = parseInt(id) || 1;
  const seed = idNum * 13; // Simple seeding
  
  // Helper for deterministic "random" numbers
  const seededRandom = (min, max, seedOffset = 0) => {
    const x = Math.sin(seed + seedOffset) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };
  
  // Generate top holders (between 3-8)
  const holdersCount = Math.floor(seededRandom(3, 9, 15));
  const holders = [];
  let remainingPercent = 100;
  
  for (let i = 0; i < holdersCount; i++) {
    const isLast = i === holdersCount - 1;
    const percent = isLast ? remainingPercent : Math.floor(seededRandom(5, remainingPercent / 2, i + 20));
    remainingPercent -= percent;
    
    holders.push({
      address: `0x${Array(40).fill(0).map((_, j) => Math.floor(seededRandom(0, 16, i * 40 + j + 30)).toString(16)).join('')}`,
      percentage: percent
    });
  }
  
  // Generate token data
  return {
    id: id,
    name: `${["Cosmic", "Quantum", "Nebula", "Stellar", "Galaxy", "Nova", "Pulsar"][idNum % 7]} Token`,
    symbol: `${["CSM", "QTM", "NBL", "STR", "GLX", "NVA", "PLS"][idNum % 7]}`,
    price: seededRandom(0.00001, 0.01, 1).toFixed(8),
    marketCap: Math.floor(seededRandom(1000000, 100000000, 2)),
    dailyVolume: Math.floor(seededRandom(100000, 10000000, 3)),
    volume7dChange: (seededRandom(-50, 50, 4)).toFixed(2),
    priceChange24h: (seededRandom(-15, 15, 5)).toFixed(2),
    totalSupply: `${Math.floor(seededRandom(100000000, 10000000000, 6))}`,
    createdAt: new Date(Date.now() - seededRandom(1, 180, 7) * 24 * 60 * 60 * 1000).toISOString(),
    description: `${["Cosmic", "Quantum", "Nebula", "Stellar", "Galaxy", "Nova", "Pulsar"][idNum % 7]} Token is a revolutionary cryptocurrency designed to transform the digital economy. It features advanced smart contract capabilities, cross-chain compatibility, and unprecedented scalability for next-generation DeFi applications.`,
    website: `https://token${id}.crypto`,
    twitter: `https://twitter.com/token${id}`,
    telegram: `https://t.me/token${id}`,
    creator: `0x${Array(40).fill(0).map((_, i) => Math.floor(seededRandom(0, 16, i + 10)).toString(16)).join('')}`,
    image: idNum % 2 === 0 
      ? "https://cdn.pixabay.com/photo/2022/03/03/20/47/the-simpson-7046041_1280.jpg" 
      : "https://cdn.pixabay.com/photo/2022/02/18/16/09/ape-7020995_1280.png",
    chain: ["Ethereum", "Binance Smart Chain", "Solana", "Polygon"][idNum % 4],
    status: "Active",
    liquidity: Math.floor(seededRandom(100000, 5000000, 8)),
    holders,
    transactions: Math.floor(seededRandom(1000, 100000, 10)),
    createdOn: Math.floor(Date.now() / 1000 - seededRandom(1, 180, 11) * 24 * 60 * 60),
    contract: `0x${Array(40).fill(0).map((_, i) => Math.floor(seededRandom(0, 16, i + 20)).toString(16)).join('')}`,
    circulatingSupply: Math.floor(seededRandom(50000000, 8000000000, 12)),
    maxSupply: 10000000000,
  };
};

const CoinDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tradeType, setTradeType] = useState("buy"); // "buy" or "sell"
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [balance, setBalance] = useState("0.0");
  const { provider, account, connected } = useWallet();
  const [currentPrice, setCurrentPrice] = useState("0.0");
  const [calculatedTokens, setCalculatedTokens] = useState("0.0");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [eduBalance, setEduBalance] = useState(0);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [timePeriod, setTimePeriod] = useState('30D');
  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);

  // 🚀 Handle Buy/Sell Button State
  const isTradeButtonDisabled = !connected || isProcessing || !amount || parseFloat(amount) <= 0;

  const tradeButtonMessage = !connected
    ? "🔌 Please connect your wallet to place a trade."
    : "";

  useEffect(() => {
    const fetchToken = async () => {
      setIsLoading(true);
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/tokens/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch token data');
        }
        
        const data = await response.json();
        setToken(data);
        
        // Fetch initial chart data
        fetchChartData(id, data.price, data.priceChange24h, timePeriod);
      } catch (error) {
        console.error('Error fetching token data:', error);
        setIsLoading(false);
        setError('Failed to load token data. Please try again later.');
      }
    };

    if (id) {
      fetchToken();
    }
  }, [id]);

  useEffect(() => {
    // Initialize chart when token data is loaded
    if (token && chartRef.current) {
      // Clean up previous chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      // Generate price history based on token data
      const priceHistory = generatePriceHistory(
        token.id, 
        token.price, 
        token.priceChange24h
      );
      
      const ctx = chartRef.current.getContext('2d');
      
      // Determine gradient colors based on price trend
      const isPriceUp = parseFloat(token.priceChange24h) > 0;
      const gradientColor1 = isPriceUp ? 'rgba(0, 246, 170, 0.8)' : 'rgba(255, 91, 91, 0.8)';
      const gradientColor2 = isPriceUp ? 'rgba(0, 163, 255, 0.8)' : 'rgba(255, 30, 30, 0.8)';
      
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, gradientColor1);
      gradient.addColorStop(1, gradientColor2);
      
      const fillGradient = ctx.createLinearGradient(0, 0, 0, 400);
      fillGradient.addColorStop(0, isPriceUp ? 'rgba(0, 246, 170, 0.2)' : 'rgba(255, 91, 91, 0.2)');
      fillGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      // Create the chart
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: priceHistory.labels,
          datasets: [{
            label: 'Price (USD)',
            data: priceHistory.prices,
            borderColor: gradient,
            borderWidth: 2,
            pointBackgroundColor: 'rgba(0, 0, 0, 0)',
            pointBorderColor: 'rgba(0, 0, 0, 0)',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: gradientColor1,
            pointHoverRadius: 6,
            pointHoverBorderWidth: 3,
            fill: true,
            backgroundColor: fillGradient,
            tension: 0.4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              padding: 10,
              displayColors: false,
              callbacks: {
                label: function(context) {
                  return `$${context.parsed.y.toFixed(8)}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false,
                drawBorder: false,
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.5)',
                maxRotation: 0,
                callback: function(value, index) {
                  // Show fewer labels on x-axis to avoid clutter
                  return index % 5 === 0 ? this.getLabelForValue(value) : '';
                }
              }
            },
            y: {
              grid: {
                color: 'rgba(255, 255, 255, 0.05)',
                drawBorder: false,
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.5)',
                callback: function(value) {
                  return '$' + value.toFixed(6);
                }
              }
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          },
          elements: {
            point: {
              radius: 0, // Hide points by default
            }
          }
        }
      });
    }
  }, [token]);

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
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^(\d+\.?\d*|\.\d+)$/.test(value)) {
      setAmount(value);
    }
  };

  // ⏳ Handle percentage buttons for sell
  const setPercentage = (percent) => {
    if (!token) return;
    
    // Use a consistent balance approach for the trade UI
    const balance = tradeType === 'buy' ? 1000 : 100; // Placeholder values until real API
    const calculatedAmount = (balance * percent / 100).toFixed(6);
    setAmount(calculatedAmount);
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

  // Updated formatNumber function with null/undefined check
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Calculate time ago
  const calculateTimeAgo = (timestamp) => {
    const now = new Date();
    const createdDate = new Date(timestamp * 1000);
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }
  };

  // Truncate address
  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Handle trade
  const handleTrade = () => {
    if (!amount || parseFloat(amount) <= 0 || !token) return;
    
    // Use a simple alert for now, will be replaced with actual API call in production
    alert(`Successfully ${tradeType === 'buy' ? 'bought' : 'sold'} ${amount} ${tradeType === 'buy' ? 'USD worth of' : ''} ${token.symbol}`);
    setAmount('');
  };

  // Handle quick amount buttons
  const handleQuickAmount = (value) => {
    setAmount(value);
  };

  // Function to fetch price history data
  const fetchPriceHistory = async (tokenId, period) => {
    setChartLoading(true);
    setChartError(null);
    try {
      // In a real application, this would be your actual API endpoint
      // For now, we'll simulate an API call
      console.log(`Fetching price history for token ${tokenId}, period ${period}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use our fallback generator to simulate API data
      const data = generateFallbackPriceHistory(tokenId, token?.price, token?.priceChange24h, period);
      setChartLoading(false);
      return data;
    } catch (error) {
      console.error("Error fetching price history:", error);
      setChartError("Failed to load price data");
      setChartLoading(false);
      return null;
    }
  };

  // Generate price history data
  const generateFallbackPriceHistory = (id, currentPrice, priceChange, period) => {
    const idNum = parseInt(id) || 1;
    const seed = idNum * 13;
    let days;
    
    switch(period) {
      case '90D':
        days = 90;
        break;
      case '1Y':
        days = 365;
        break;
      case 'All':
        days = 730; // About 2 years
        break;
      default:
        days = 30; // Default 30D
    }
    
    // Default to reasonable values if not provided
    const price = parseFloat(currentPrice) || 1.0;
    const changePercent = parseFloat(priceChange) || 5.0;
    
    const priceData = [];
    const labels = [];
    const timestamps = [];
    
    // Create a somewhat realistic price trend
    const dailyChangePercent = changePercent / 30; // Distribute change over a month
    const volatilityFactor = period === 'All' ? 1.5 : 1; // More volatility for longer timeframes
    const startPrice = price / Math.pow(1 + (dailyChangePercent / 100), days / volatilityFactor);
    
    const now = new Date();
    let simulatedPrice = startPrice;
    
    // Generate day labels and prices
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      timestamps.push(date.getTime());
      
      // Format labels based on time period
      let label;
      if (period === '1Y' || period === 'All') {
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        // Only show periodic labels for longer timeframes to avoid clutter
        if (period === 'All' ? i % 30 !== 0 : i % 15 !== 0) {
          label = '';
        }
      } else {
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (i % 5 !== 0) { // Show every 5th day for shorter periods
          label = '';
        }
      }
      
      labels.push(label);
      
      // Generate a price with randomness following the overall trend
      const volatilityFactor = 0.5 + (Math.sin(seed + i) * 0.5);
      const dayChange = (dailyChangePercent / 100) * volatilityFactor;
      
      // Add randomness
      const randomFactor = period === 'All' ? 0.04 : 0.02;
      simulatedPrice = simulatedPrice * (1 + dayChange + ((Math.sin(seed * i) * randomFactor))); 
      
      priceData.push(parseFloat(simulatedPrice.toFixed(6)));
    }
    
    return {
      labels,
      timestamps,
      prices: priceData
    };
  };

  // Create or update the chart
  const updateChart = (data) => {
    if (!chartRef.current || !data || !data.prices || !data.labels) return;
    
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    
    // Use the exact same logic for gradient determination
    const isPriceUp = data.prices[data.prices.length - 1] >= data.prices[0];
    
    if (isPriceUp) {
      gradient.addColorStop(0, 'rgba(0, 246, 170, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 246, 170, 0)');
    } else {
      gradient.addColorStop(0, 'rgba(255, 58, 58, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 58, 58, 0)');
    }
    
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Price (USD)',
          data: data.prices,
          borderColor: isPriceUp ? '#00F6AA' : '#FF3A3A',
          backgroundColor: gradient,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointBackgroundColor: isPriceUp ? '#00F6AA' : '#FF3A3A',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 0,
              color: 'rgba(255, 255, 255, 0.5)',
              font: {
                size: 10
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawBorder: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.5)',
              font: {
                size: 10
              },
              callback: function(value) {
                return '$' + value.toFixed(2);
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleFont: {
              size: 12
            },
            bodyFont: {
              size: 12
            },
            padding: 10,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return `$${context.raw.toFixed(6)}`;
              }
            }
          }
        }
      }
    });
  };

  // Add useEffect hooks for data fetching and chart update
  useEffect(() => {
    if (token) {
      // Fetch price history data when component loads or when token/time period changes
      const loadPriceHistory = async () => {
        const data = await fetchPriceHistory(token.id, timePeriod);
        setChartData(data);
      };
      
      loadPriceHistory();
    }
  }, [token, timePeriod]);

  useEffect(() => {
    // Update chart when chart data changes
    if (chartData) {
      updateChart(chartData);
    }
  }, [chartData]);

  // Fetch chart data
  const fetchChartData = async (tokenId, currentPrice, priceChange, period) => {
    try {
      // Replace with your actual price history API endpoint
      const response = await fetch(`/api/tokens/${tokenId}/price-history?period=${period}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch price history');
      }
      
      const data = await response.json();
      setChartData(data);
      updateChart(data);
    } catch (error) {
      console.error('Error fetching price history:', error);
      // If API fails, we could fall back to generating synthetic data
      // or just show an error in the chart area
    }
  };

  // Update chart when time period changes
  useEffect(() => {
    if (token) {
      fetchChartData(token.id, token.price, token.priceChange24h, timePeriod);
    }
  }, [timePeriod, token]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <Header />
        <div className="spinner">
          <div className="double-bounce1"></div>
          <div className="double-bounce2"></div>
        </div>
        <p>Loading token data...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="token-page-container">
        <Header />
        <div className="go-back-container">
          <button onClick={() => router.push('/board')} className="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to All Tokens
          </button>
        </div>
        <h2>Token Not Found</h2>
        <p>Sorry, we couldn't find the token you're looking for.</p>
      </div>
    );
  }

  // Determine if price is up
  const isPriceUp = parseFloat(token.priceChange24h) >= 0;
  const priceChangeSymbol = isPriceUp ? '+' : '';
  
  // Calculate supply percentage
  const circulationPercentage = (token.circulatingSupply / token.maxSupply) * 100;

  return (
    <div className="token-page-container">
      {/* Enhanced Background Effects */}
      <div className="background-effects">
        <div className="digital-pulse"></div>
      </div>
      
      <Header />

      <div className="go-back-container">
        <button onClick={() => router.push('/board')} className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to All Tokens
        </button>
      </div>

      <div className="content-wrapper">
        <div className="left-section">
          {/* Enhanced Token Details Section */}
          <div className="token-details-section">
            <div className="details-container">
              <div className="token-image-container">
                <img 
                  src={token.image || "/default_image.png"} 
                  alt={token.name} 
                  className="token-detail-image" 
                />
              </div>
              
              <div className="token-text-details">
                <h1>{token.name} <span className="token-detail-symbol">({token.symbol})</span></h1>
                
                <div className="price-container">
                  <div className="current-price">${token.price}</div>
                  <div className={`price-change ${isPriceUp ? 'positive' : 'negative'}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d={isPriceUp ? "M7 13l5-5 5 5" : "M7 10l5 5 5-5"} />
                    </svg>
                    {priceChangeSymbol}{token.priceChange24h}%
                  </div>
                </div>
                
                <div className="additional-details">
                  <div className="detail-item">
                    <div className="detail-label">Market Cap</div>
                    <div className="detail-value">${formatNumber(token.marketCap)}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">24h Volume</div>
                    <div className="detail-value">${formatNumber(token.dailyVolume)}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Blockchain</div>
                    <div className="detail-value">{token.chain}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="creator-section">
              <div className="creator-info">
                <span className="creator-label">Creator:</span> 
                <span className="creator-address" title={token.creator} onClick={() => navigator.clipboard.writeText(token.creator)}>
                  {truncateAddress(token.creator)}
                </span>
                <span className="creation-time">Created {calculateTimeAgo(token.createdOn)}</span>
              </div>
              
              <div className="token-links">
                {token.website && 
                  <a href={token.website} target="_blank" rel="noopener noreferrer" className="token-link website">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <path d="M15 3h6v6" />
                      <path d="M10 14L21 3" />
                    </svg>
                    <span>Website</span>
                  </a>
                }
                {token.twitter && 
                  <a href={token.twitter} target="_blank" rel="noopener noreferrer" className="token-link twitter">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                    <span>Twitter</span>
                  </a>
                }
                {token.telegram && 
                  <a href={token.telegram} target="_blank" rel="noopener noreferrer" className="token-link telegram">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.5 2L2 10l7 4m7 8l-3-9 9-5m-9 5V22" />
                    </svg>
                    <span>Telegram</span>
                  </a>
                }
              </div>
            </div>
            
            <div className="token-description">
              <p>{token.description}</p>
            </div>
            
            <div className="progress-section">
              <h4>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                Circulating Supply
              </h4>
              <div className="supply-numbers">
                <div className="supply-fractions">
                  <span className="circulating-amount">{formatNumber(token.circulatingSupply || 3885867227)}</span>
                  <span className="supply-divider">/</span>
                  <span className="max-amount">{formatNumber(token.maxSupply || 10000000000)}</span>
                </div>
                <div className="supply-percentage-badge">
                  {circulationPercentage.toFixed(2)}%
                </div>
              </div>
              <div className="supply-progress-container">
                <div 
                  className="supply-progress-bar" 
                  style={{ width: `${circulationPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Chart Container */}
          <div className="chart-contract-row">
            {/* Chart Section - Takes width proportional to left section above */}
            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 6l-9.5 9.5-5-5L1 18" />
                    <path d="M17 6h6v6" />
                  </svg>
                  Price History
                </h3>
                <div className="time-period-selector">
                  <button 
                    className={`time-period-button ${timePeriod === '30D' ? 'active' : ''}`}
                    onClick={() => setTimePeriod('30D')}
                  >
                    30D
                  </button>
                  <button 
                    className={`time-period-button ${timePeriod === '90D' ? 'active' : ''}`}
                    onClick={() => setTimePeriod('90D')}
                  >
                    90D
                  </button>
                  <button 
                    className={`time-period-button ${timePeriod === '1Y' ? 'active' : ''}`}
                    onClick={() => setTimePeriod('1Y')}
                  >
                    1Y
                  </button>
                  <button 
                    className={`time-period-button ${timePeriod === 'All' ? 'active' : ''}`}
                    onClick={() => setTimePeriod('All')}
                  >
                    All
                  </button>
                </div>
              </div>
              <div className="chart-wrapper">
                <canvas ref={chartRef}></canvas>
              </div>
              <div className="legend-container">
                <span>{timePeriod === 'All' ? 'All time' : timePeriod} • Price in USD</span>
              </div>
            </div>
            
            
          </div>
        </div>
        
        
        <div className="right-section">
          {/* Enhanced Trade Section */}
          <div className="trade-section">
            <h3>Trade Token</h3>
            <div className="trade-box">
              <div className="trade-tabs">
                <button 
                  className={`trade-tab ${tradeType === 'buy' ? 'active' : ''}`}
                  onClick={() => setTradeType('buy')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Buy
                </button>
                <button 
                  className={`trade-tab ${tradeType === 'sell' ? 'active' : ''}`}
                  onClick={() => setTradeType('sell')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14" />
                  </svg>
                  Sell
                </button>
              </div>
              
              <div className="amount-container">
                <label>Amount</label>
                <div className="amount-input-wrapper">
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                  <span className="percentage-symbol">%</span>
                </div>
              </div>
              
              <div className="quick-amount-buttons">
                <button onClick={() => handleQuickAmount(25)}>25%</button>
                <button onClick={() => handleQuickAmount(50)}>50%</button>
                <button onClick={() => handleQuickAmount(75)}>75%</button>
                <button onClick={() => handleQuickAmount(100)}>100%</button>
              </div>
              
              <div className="token-value">
                <div className="value-label">Estimated value:</div>
                <div className="value-amount">${getEstimatedValue()}</div>
              </div>
              
              <button 
                className={`trade-button ${tradeType}`}
                onClick={handleTrade}
                disabled={!amount || isNaN(amount) || parseFloat(amount) <= 0}
              >
                {tradeType === 'buy' ? 'Buy' : 'Sell'} {token.symbol}
              </button>
              
              <div className="fee-info">
                Network fee: 0.5% • Slippage: 1%
              </div>
            </div>
          </div>
          
          {/* Enhanced Holders Section */}
          <div className="holders-container">
            <h3>Top Token Holders</h3>
            {token.holders && token.holders.map((holder, index) => (
              <div key={index} className="holder-row">
                <div className="holder-address" title={holder.address}>
                  {index + 1}. {truncateAddress(holder.address)}
                </div>
                <div className="holder-percentage">
                  <div className="percentage-bar" style={{ width: `${holder.percentage}%` }}></div>
                  <span>{holder.percentage}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Move the contract info section to the right side column */}
          <div className="token-sidebar">
            {/* Insert contract information here */}
            <div className="contract-info-section">
              <h4>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
                </svg>
                Contract Information
              </h4>
              
              <div className="contract-rows">
                <div className="contract-row">
                  <div className="contract-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <path d="M8 7h.01M12 7h.01M16 7h.01M7 12h10M7 16h10" />
                    </svg>
                    Contract Address
                  </div>
                  <div className="contract-value">
                    <span 
                      className="contract-address" 
                      title={token.contract || "0x1d23...2e83"}
                      onClick={() => copyToClipboard(token.contract || "0x1d232e83")}
                    >
                      {truncateAddress(token.contract || "0x1d232e83")}
                    </span>
                    <button 
                      className="copy-button" 
                      onClick={() => {
                        copyToClipboard(token.contract || "0x1d232e83");
                      }}
                      title="Copy contract address"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="contract-row">
                  <div className="contract-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    Total Supply
                  </div>
                  <div className="contract-value">
                    <span className="highlight-value">{formatNumber(token.totalSupply || 7743756632)}</span>
                  </div>
                </div>
                
                <div className="contract-row">
                  <div className="contract-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="1 6 1 22 23 22 23 6" />
                      <path d="M18 6L12 1 6 6" />
                      <line x1="12" y1="10" x2="12" y2="18" />
                      <line x1="8" y1="14" x2="16" y2="14" />
                    </svg>
                    Transactions
                  </div>
                  <div className="contract-value">
                    <span className="highlight-value">{formatNumber(token.transactions || 79799)}</span>
                  </div>
                </div>
                
                <div className="contract-row">
                  <div className="contract-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                    Explorer
                  </div>
                  <div className="contract-value">
                    <a 
                      href={`https://etherscan.io/token/${token.contract || "0x1d232e83"}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="explorer-link"
                    >
                      View on Etherscan
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                        <path d="M15 3h6v6" />
                        <path d="M10 14L21 3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinDetailPage;