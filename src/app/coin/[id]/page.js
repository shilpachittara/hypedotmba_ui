"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ethers } from "ethers";
import { fetchTokenById } from "@/utils/_api";
import Header from "@/components/Header";
import "@/styles/TokenDetailPage.css";
import { useWallet } from "@/context/WalletContext";
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
import Chart from 'chart.js/auto';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, TimeScale);

const HYPE_TOKEN_ABI = [
  "function buyTokensWithEdu() payable",
  "function sellTokensForEdu(uint256 tokenAmount)",
  "function getCurrentPrice() view returns (uint256)",
  "function getBuyPrice(uint256 tokenAmount) view returns (uint256)",
  "function getSellPrice(uint256 tokenAmount) view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)"
];

const THRESHOLD = process.env.NEXT_PUBLIC_THESHOLD || 1000000;

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


const CoinDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [token, setToken] = useState(null);
  const [holders, setHolders] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
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

  // Add new state variables for the bidirectional calculation
  const [inputMode, setInputMode] = useState("spend"); // "spend" or "receive"
  const [spendAmount, setSpendAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");

  // 🚀 Handle Buy/Sell Button State
  const [isTradeButtonDisabled, setIsTradeButtonDisabled] = useState(true);

  const tradeButtonMessage = !connected
    ? "🔌 Please connect your wallet to place a trade."
    : "";

  // Calculate estimated value based on amount and price
  const getEstimatedValue = (amount, price) => {
    if (!amount || !price) return "0.00";
    const numAmount = parseFloat(amount);
    const numPrice = parseFloat(price);
    if (isNaN(numAmount) || isNaN(numPrice)) return "0.00";

    if (tradeType === 'buy') {
      // For buy: amount of EDU / price = tokens received
      return (numAmount / numPrice).toFixed(4);
    } else {
      // For sell: amount of tokens * price = EDU received
      return (numAmount * numPrice).toFixed(4);
    }
  };

  // Fix the dependency array issue
  useEffect(() => {
    const fetchToken = async () => {
      setIsLoading(true);
      try {
        // Use the new fetchTokenById function instead of mock data
        const tokenData = await fetchTokenById(id);

        console.log("Token data:", tokenData);
        if (!tokenData) {
          throw new Error('Failed to fetch token data');
        }

        // Ensure token has all required properties with defaults
        const enhancedToken = {
          ...tokenData,
          price: tokenData.price || 0,
          priceChange24h: tokenData.priceChange24h || 0,
          marketCap: tokenData.marketCap || 0,
          dailyVolume: tokenData.dailyVolume || 0,
          volume7dChange: tokenData.volume7dChange || 0,
          holders: tokenData.holders || [],
          social: tokenData.social || {},
          createdAt: tokenData.createdAt || Date.now().toString(),
          image: tokenData.image || "/default-token-image.png"
        };

        setToken(enhancedToken);

        // Fetch initial chart data
        fetchChartData(id, enhancedToken.price, enhancedToken.priceChange24h, timePeriod);
      } catch (error) {
        console.error('Error fetching token data:', error);

        fetchChartData(id, mockToken.price, mockToken.priceChange24h, timePeriod);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchToken();
    }
  }, [id]); // Remove timePeriod from dependency array

  // Add a separate effect for handling time period changes
  useEffect(() => {
    if (token) {
      fetchChartData(id, token.price, token.priceChange24h, timePeriod);
    }
  }, [timePeriod, token, id]); // This effect depends on timePeriod and token

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
                label: function (context) {
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
                callback: function (value, index) {
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
                callback: function (value) {
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

  // Fetch the token price directly from the contract with comprehensive error handling
  const fetchTokenPrice = async (tokenAddress) => {
    if (!provider || !tokenAddress) return "0.0";

    try {
      console.log("Fetching price for token:", tokenAddress);

      // First, check if the address is valid
      if (!ethers.isAddress(tokenAddress)) {
        console.error("Invalid token address:", tokenAddress);
        return "0.0";
      }

      // Let's try to understand the contract better
      // First, get the contract code to confirm it exists
      const code = await provider.getCode(tokenAddress);
      if (code === '0x' || code === '0x0') {
        console.error("No contract found at address:", tokenAddress);
        return "0.0";
      }

      console.log("Contract exists at address:", tokenAddress);

      // Let's try all possible price-related function names
      const priceFunctions = [
        "getCurrentPrice()",
        "getPrice()",
        "price()",
        "currentPrice()",
        "calculatePrice()",
        "getBuyPrice(uint256)",
        "getSellPrice(uint256)",
        "getBuyPrice()",
        "getSellPrice()"
      ];

      // Create a minimal interface with just the function signature
      for (const funcSig of priceFunctions) {
        try {
          // Extract function name and parameters
          const funcName = funcSig.split('(')[0];
          const hasParams = funcSig.includes('(uint256)');

          console.log(`Trying function: ${funcSig}`);

          // Create contract instance with just this function
          const abi = [`function ${funcSig} view returns (uint256)`];
          const tokenContract = new ethers.Contract(tokenAddress, abi, provider);

          // Call the function
          let priceRaw;
          if (hasParams) {
            // If the function requires a parameter, pass a small amount (1 token)
            const oneToken = ethers.parseEther("1");
            priceRaw = await tokenContract[funcName](oneToken);
          } else {
            priceRaw = await tokenContract[funcName]();
          }

          // If we get here, the function call succeeded
          console.log(`Success with function: ${funcSig}`);

          // Format the price from wei to ETH
          const formattedPrice = ethers.formatEther(priceRaw);
          console.log(`Price from ${funcSig}:`, formattedPrice);

          // Validate the price (should be a reasonable number)
          const numPrice = parseFloat(formattedPrice);
          if (numPrice > 0 && numPrice < 1000) {
            return formattedPrice;
          } else {
            console.log(`Price from ${funcSig} seems unreasonable:`, formattedPrice);
          }
        } catch (funcError) {
          // Log the specific error for this function
          if (funcError.message.includes("execution reverted")) {
            console.log(`Function ${funcSig} reverted`);
          } else if (funcError.message.includes("call revert exception")) {
            console.log(`Function ${funcSig} doesn't exist or reverted`);
          } else {
            console.log(`Error with ${funcSig}:`, funcError.message);
          }
        }
      }

      // If we get here, none of the direct price functions worked
      console.log("All direct price functions failed");

      // Let's try to get the contract's ABI from Etherscan or a similar service
      // This would require an API key and network-specific logic

      // For now, let's try a different approach: check if this is a HypeToken
      // by looking for specific functions that should be in the HypeToken contract
      try {
        const hypeTokenFunctions = [
          "function buyTokens() payable",
          "function sellTokens(uint256 amount)",
          "function balanceOf(address account) view returns (uint256)",
          "function symbol() view returns (string)"
        ];

        // Check if these functions exist to confirm it's a HypeToken
        let isHypeToken = true;
        for (const funcDef of hypeTokenFunctions) {
          try {
            const funcName = funcDef.split(' ')[1].split('(')[0];
            const tokenContract = new ethers.Contract(tokenAddress, [funcDef], provider);

            if (funcName === 'symbol') {
              const symbol = await tokenContract.symbol();
              console.log("Token symbol:", symbol);
            } else if (funcName === 'balanceOf') {
              // Just check if the function exists, don't need to call it
              isHypeToken = true;
            }
          } catch (error) {
            if (error.message.includes("call revert exception")) {
              console.log(`Function ${funcDef.split(' ')[1]} doesn't exist`);
              isHypeToken = false;
              break;
            }
          }
        }

        if (isHypeToken) {
          console.log("This appears to be a HypeToken contract");

          // For HypeToken, we know the price is calculated based on the bonding curve
          // Let's try to get the parameters needed for the calculation

          // Try to get the token's reserve balance (ETH held by the contract)
          const reserveBalance = await provider.getBalance(tokenAddress);
          console.log("Contract reserve balance:", ethers.formatEther(reserveBalance));

          // Try to get the total supply
          const totalSupplyContract = new ethers.Contract(
            tokenAddress,
            ["function totalSupply() view returns (uint256)"],
            provider
          );

          try {
            const totalSupply = await totalSupplyContract.totalSupply();
            console.log("Total supply:", ethers.formatEther(totalSupply));

            // If we have both reserve balance and total supply, we can estimate the price
            // using a simple formula based on the bonding curve
            if (reserveBalance > 0n && totalSupply > 0n) {
              // Simple price estimate: reserve / totalSupply
              const estimatedPrice = ethers.formatEther(
                (reserveBalance * ethers.parseEther("1")) / totalSupply
              );

              console.log("Estimated price from reserve/supply:", estimatedPrice);
              return estimatedPrice;
            }
          } catch (supplyError) {
            console.log("Error getting total supply:", supplyError.message);
          }
        }
      } catch (hypeTokenError) {
        console.log("Error checking if this is a HypeToken:", hypeTokenError.message);
      }

      // If all else fails, use the token's stored price or a default
      console.log("Using fallback price");
      return token?.price || "0.001";

    } catch (error) {
      console.error("Error in fetchTokenPrice:", error);
      return token?.price || "0.001";
    }
  };

  // Add this function to check if the contract exists and is valid
  const validateContract = async (contractAddress) => {
    if (!provider || !contractAddress) return false;
    
    try {
      // Check if the address is valid
      if (!ethers.isAddress(contractAddress)) {
        console.error("Invalid contract address format:", contractAddress);
        return false;
      }
      
      // Check if there's code at the address (i.e., it's a contract)
      const code = await provider.getCode(contractAddress);
      if (code === '0x' || code === '0x0') {
        console.error("No contract found at address:", contractAddress);
        return false;
      }
      
      console.log("Contract validated at address:", contractAddress);
      return true;
    } catch (error) {
      console.error("Error validating contract:", error);
      return false;
    }
  };

  // Function to fetch user's token balance and ETH balance
  const fetchBalanceAndPrice = async (token) => {
    if (!connected || !provider || !account || !token?.contractAddress) {
      console.log("Missing requirements for fetching balances");
      return;
    }
    
    try {
      console.log("Fetching balances for token:", token.contractAddress);
      
      // Fetch EDU balance first
      try {
        const eduBalance = await provider.getBalance(account);
        const formattedEduBalance = ethers.formatEther(eduBalance);
        setEduBalance(formattedEduBalance);
        console.log(`EDU balance: ${formattedEduBalance}`);
      } catch (eduError) {
        console.error("Error fetching EDU balance:", eduError);
        setEduBalance("0.0");
      }
      
      // Create token contract instance with multiple balance fetching methods
      const tokenContract = new ethers.Contract(
        token.contractAddress,
        [
          "function balanceOf(address) view returns (uint256)",
          "function getCurrentPrice() view returns (uint256)",
          "function price() view returns (uint256)",
          "function getPrice() view returns (uint256)"
        ],
        provider
      );
      
      // Try to fetch token balance
      let balanceRaw = null;
      try {
        console.log("Trying balanceOf method...");
        balanceRaw = await tokenContract.balanceOf(account);
        console.log("balanceOf succeeded:", balanceRaw.toString());
      } catch (balanceError) {
        console.warn("Error with balanceOf method:", balanceError.message);
        
        // Try alternative methods if available
        try {
          console.log("Trying alternative balance method...");
          // You could add alternative methods here if the contract has them
          // For example: balanceRaw = await tokenContract.getBalance(account);
        } catch (altError) {
          console.warn("Alternative balance method failed:", altError.message);
        }
      }
      
      if (balanceRaw === null) {
        console.error("All balance fetching methods failed");
        setBalance("0.0");
      } else {
        const formattedBalance = ethers.formatEther(balanceRaw);
        setBalance(formattedBalance);
        console.log(`Token balance: ${formattedBalance} ${token.symbol}`);
      }
      
      // Try to fetch current token price with multiple methods
      let priceRaw = null;
      
      // Try getCurrentPrice first
      try {
        console.log("Trying getCurrentPrice method...");
        priceRaw = await tokenContract.getCurrentPrice();
        console.log("getCurrentPrice succeeded:", priceRaw.toString());
      } catch (priceError) {
        console.warn("Error with getCurrentPrice method:", priceError.message);
        
        // Try price() method
        try {
          console.log("Trying price method...");
          priceRaw = await tokenContract.price();
          console.log("price method succeeded:", priceRaw.toString());
        } catch (altPriceError) {
          console.warn("price method failed:", altPriceError.message);
          
          // Try getPrice() method
          try {
            console.log("Trying getPrice method...");
            priceRaw = await tokenContract.getPrice();
            console.log("getPrice method succeeded:", priceRaw.toString());
          } catch (getpriceError) {
            console.warn("getPrice method failed:", getpriceError.message);
          }
        }
      }
      
      if (priceRaw === null) {
        console.error("All price fetching methods failed");
        setCurrentPrice("0.0");
      } else {
        const formattedPrice = ethers.formatEther(priceRaw);
        setCurrentPrice(formattedPrice);
        console.log(`Current price: ${formattedPrice} ETH per ${token.symbol}`);
      }
      
    } catch (error) {
      console.error("Error in fetchBalanceAndPrice:", error);
      setBalance("0.0");
      setCurrentPrice("0.0");
    }
  };

  const imageSrc = token && token.image && token.image !== "https://example.com/image.png" && token.image !== ""
    ? token.image
    : "/default_image.png";

  // Handle Buy/Sell Toggle
  const handleTradeTypeChange = (type) => {
    setTradeType(type);
    setSpendAmount("");
    setReceiveAmount("");
    setErrorMessage("");
    setInputMode("spend");
  };

  // Handle input change for spend amount
  const handleSpendAmountChange = async (value) => {
    if (value === '' || /^(\d+\.?\d*|\.\d+)$/.test(value)) {
      setSpendAmount(value);
      setInputMode("spend");
      setErrorMessage("");
      
      // Don't calculate if value is empty
      if (!value || value === '0') {
        setReceiveAmount("");
        return;
      }
      
      // Validate input value
      const inputValue = parseFloat(value);
      if (isNaN(inputValue) || inputValue <= 0) {
        setErrorMessage("Please enter a valid amount greater than 0");
        setReceiveAmount("");
        return;
      }
      
      // Check if user has sufficient balance
      const userBalance = tradeType === 'buy' 
        ? parseFloat(eduBalance) 
        : parseFloat(balance);
        
      if (inputValue > userBalance) {
        setErrorMessage(`Amount exceeds your balance. Your balance is ${userBalance.toFixed(4)} ${tradeType === 'buy' ? 'ETH' : token?.symbol}`);
      }
      
      // Calculate receive amount based on spend amount using contract functions
      try {
        let calculatedReceiveAmount;
        
        if (tradeType === 'buy') {
          // For buy: calculate tokens received for ETH spent
          // We need to calculate how many tokens we'll get for this ETH amount
          const ethAmount = value;
          // This is a simplified calculation - ideally use the contract's getBuyPrice
          calculatedReceiveAmount = await calculateTokensForEth(ethAmount);
        } else {
          // For sell: calculate ETH received for tokens sold
          // We need to calculate how much ETH we'll get for these tokens
          const tokenAmount = value;
          // This is a simplified calculation - ideally use the contract's getSellPrice
          calculatedReceiveAmount = await calculateEthForTokens(tokenAmount);
        }
        
        setReceiveAmount(calculatedReceiveAmount);
      } catch (error) {
        console.error("Calculation error:", error);
        setErrorMessage("Error calculating exchange amount");
        setReceiveAmount("");
      }
    }
  };

  // Helper function to calculate tokens for ETH
  const calculateTokensForEth = async (ethAmount) => {
    if (!ethAmount || parseFloat(ethAmount) === 0) return "0";
    
    try {
      // Use the current price from the contract
      const currentPriceValue = parseFloat(currentPrice);
      if (currentPriceValue <= 0) return "0";
      
      // Simple calculation: ETH / price = tokens
      // For more accuracy, use the contract's getBuyPrice function
      const tokens = parseFloat(ethAmount) / currentPriceValue;
      return tokens.toFixed(4);
    } catch (error) {
      console.error("Error calculating tokens:", error);
      return "0";
    }
  };

  // Helper function to calculate ETH for tokens
  const calculateEthForTokens = async (tokenAmount) => {
    if (!tokenAmount || parseFloat(tokenAmount) === 0) return "0";
    
    try {
      // Use the current price from the contract
      const currentPriceValue = parseFloat(currentPrice);
      if (currentPriceValue <= 0) return "0";
      
      // Simple calculation: tokens * price = ETH
      // For more accuracy, use the contract's getSellPrice function
      const eth = parseFloat(tokenAmount) * currentPriceValue;
      return eth.toFixed(4);
    } catch (error) {
      console.error("Error calculating ETH:", error);
      return "0";
    }
  };

  // Handle input change for receive amount
  const handleReceiveAmountChange = (value) => {
    if (value === '' || /^(\d+\.?\d*|\.\d+)$/.test(value)) {
      setReceiveAmount(value);
      setInputMode("receive");
      setErrorMessage("");
      
      // Don't calculate if value is empty
      if (!value || value === '0') {
        setSpendAmount("");
        return;
      }
      
      // Validate input value
      const inputValue = parseFloat(value);
      if (isNaN(inputValue) || inputValue <= 0) {
        setErrorMessage("Please enter a valid amount greater than 0");
        setSpendAmount("");
        return;
      }
      
      // Calculate spend amount based on receive amount
      if (parseFloat(currentPrice) > 0) {
        let calculatedSpendAmount;
        
        if (tradeType === 'buy') {
          // For buy: tokens to receive * price = EDU to spend
          calculatedSpendAmount = inputValue * parseFloat(currentPrice);
          
          // Check if calculated amount exceeds EDU balance
          const eduBalanceFloat = parseFloat(eduBalance);
          if (calculatedSpendAmount > eduBalanceFloat) {
            setErrorMessage(`Amount exceeds your balance. Your balance is ${eduBalanceFloat.toFixed(4)} EDU`);
          }
        } else {
          // For sell: EDU to receive / price = tokens to sell
          calculatedSpendAmount = inputValue / parseFloat(currentPrice);
          
          // Check if calculated amount exceeds token balance
          const tokenBalanceFloat = parseFloat(balance);
          if (calculatedSpendAmount > tokenBalanceFloat) {
            setErrorMessage(`Amount exceeds your balance. Your balance is ${tokenBalanceFloat.toFixed(4)} ${token?.symbol}`);
          }
        }
        
        setSpendAmount(calculatedSpendAmount.toFixed(4));
      } else {
        setErrorMessage("Unable to calculate: token price is invalid");
        setSpendAmount("");
      }
    }
  };

  // Update the quick amount buttons to work with both input modes
  const handleQuickAmount = (percentage) => {
    if (!connected) return;

    setErrorMessage("");
    const maxBalance = tradeType === 'buy' ? parseFloat(eduBalance) : parseFloat(balance);

    if (maxBalance <= 0) {
      setErrorMessage(`You don't have any ${tradeType === 'buy' ? 'ETH' : token?.symbol} to trade`);
      return;
    }

    // Calculate the amount based on percentage - don't round
    const amount = (maxBalance * (percentage / 100)).toString();
    console.log(`Setting ${percentage}% of balance: ${amount} (max: ${maxBalance})`);
    
    // Set the amount and trigger calculations
    setSpendAmount(amount);
    handleSpendAmountChange(amount);
  };

  // Helper function to log available contract methods
  const logContractMethods = (contract) => {
    console.log("Available contract methods:");
    for (const key in contract.interface.fragments) {
      const fragment = contract.interface.fragments[key];
      if (fragment.type === 'function') {
        console.log(`- ${fragment.name}(${fragment.inputs.map(i => `${i.type} ${i.name}`).join(', ')})`);
      }
    }
  };

  // Helper function to format error messages
  const formatErrorMessage = (error) => {
    if (!error) return "";
    
    // Check if it's the "EDU transfer failed" error
    if (error.message?.includes("EDU transfer failed")) {
      return "The contract doesn't have enough ETH to complete this transaction. Try selling a smaller amount.";
    }
    
    // Check if it's a revert error
    if (error.message?.includes("execution reverted")) {
      const revertReason = error.message.split("execution reverted:")[1]?.trim() || "Transaction reverted by the contract";
      return `Transaction failed: ${revertReason}`;
    }
    
    // Check if it's a user rejection
    if (error.message?.includes("user rejected")) {
      return "Transaction was rejected in your wallet";
    }
    
    // For other errors, truncate if too long
    const errorMsg = error.message || error.toString();
    if (errorMsg.length > 150) {
      return errorMsg.substring(0, 150) + "...";
    }
    
    return errorMsg;
  };

  // Update the handleSell function to use the formatErrorMessage helper
  const handleSell = async () => {
    if (!connected || !provider || !account) {
      setErrorMessage("Please connect your wallet first");
      return;
    }
    
    if (isProcessing) return;
    
    // Validate the contract first
    const isValidContract = await validateContract(token.contractAddress);
    if (!isValidContract) {
      setErrorMessage("Invalid contract address. Cannot perform transaction.");
      return;
    }
    
    // Check if the amount is valid
    const sellAmount = parseFloat(spendAmount);
    const tokenBalanceFloat = parseFloat(balance);
    
    if (isNaN(sellAmount) || sellAmount <= 0) {
      setErrorMessage("Please enter a valid amount greater than 0");
      return;
    }
    
    // Compare with a small epsilon to account for floating point precision
    const EPSILON = 1e-15;
    if (sellAmount > tokenBalanceFloat + EPSILON) {
      setErrorMessage(`Amount exceeds your balance. Your balance is ${formatTo8DecimalsNoRound(balance)} ${token?.symbol}`);
      return;
    }
    
    try {
      setIsProcessing(true);
      setErrorMessage("");
      
      // Get the signer from provider
      const signer = await provider.getSigner();
      
      // Create contract instance with signer
      const tokenContract = new ethers.Contract(
        token.contractAddress,
        HYPE_TOKEN_ABI,
        signer
      );
      
      // Check contract ETH balance first to see if it can pay
      const contractBalance = await provider.getBalance(token.contractAddress);
      console.log(`Contract ETH balance: ${ethers.formatEther(contractBalance)} ETH`);
      
      // Estimate how much ETH the user would receive
      let estimatedEthReturn;
      try {
        // Try to use the contract's getSellPrice function if available
        const sellPriceAbi = ["function getSellPrice(uint256) view returns (uint256)"];
        const priceContract = new ethers.Contract(token.contractAddress, sellPriceAbi, provider);
        
        // Get token decimals
        let decimals = 18;
        try {
          const decimalsAbi = ["function decimals() view returns (uint8)"];
          const decimalsContract = new ethers.Contract(token.contractAddress, decimalsAbi, provider);
          decimals = await decimalsContract.decimals();
        } catch (error) {
          console.warn("Could not get token decimals, using default 18");
        }
        
        // Parse the token amount with the correct decimals
        const tokenAmountWei = ethers.parseUnits(spendAmount, decimals);
        
        // Get the estimated ETH return
        estimatedEthReturn = await priceContract.getSellPrice(tokenAmountWei);
        console.log(`Estimated ETH return: ${ethers.formatEther(estimatedEthReturn)} ETH`);
        
        // Check if the contract has enough ETH
        if (estimatedEthReturn > contractBalance) {
          setErrorMessage("The contract doesn't have enough ETH to complete this transaction. Try selling a smaller amount.");
          setIsProcessing(false);
          return;
        }
      } catch (estimateError) {
        console.warn("Could not estimate ETH return:", estimateError.message);
        // Continue anyway, but log the warning
      }
      
      // Get token decimals
      let decimals = 18;
      try {
        const decimalsAbi = ["function decimals() view returns (uint8)"];
        const decimalsContract = new ethers.Contract(token.contractAddress, decimalsAbi, provider);
        decimals = await decimalsContract.decimals();
        console.log(`Token decimals: ${decimals}`);
      } catch (error) {
        console.warn("Could not get token decimals, using default 18:", error.message);
      }
      
      // If selling 100% of balance, use the exact balance value
      let tokenAmountWei;
      if (Math.abs(sellAmount - tokenBalanceFloat) < EPSILON) {
        // Get the exact balance in wei
        const exactBalanceWei = await tokenContract.balanceOf(account);
        tokenAmountWei = exactBalanceWei;
        console.log(`Selling 100% of balance: ${exactBalanceWei.toString()} wei`);
      } else {
        // Parse the token amount with the correct decimals
        tokenAmountWei = ethers.parseUnits(spendAmount, decimals);
      }
      
      console.log(`Selling ${spendAmount} ${token.symbol} tokens (${tokenAmountWei.toString()} wei)`);
      
      // Try to estimate gas first to catch errors before sending
      try {
        const gasEstimate = await tokenContract.sellTokensForEdu.estimateGas(tokenAmountWei);
        console.log(`Gas estimate for sell: ${gasEstimate.toString()}`);
      } catch (gasError) {
        console.error("Gas estimation failed:", gasError);
        
        if (gasError.message.includes("EDU transfer failed")) {
          setErrorMessage("The contract doesn't have enough ETH to complete this transaction. Try selling a smaller amount.");
        } else if (gasError.message.includes("execution reverted")) {
          const revertReason = gasError.message.split("execution reverted:")[1]?.trim() || "Transaction would fail";
          setErrorMessage(`Cannot execute transaction: ${revertReason}`);
        } else {
          setErrorMessage("Transaction would fail. Please try a smaller amount or contact support.");
        }
        
        setIsProcessing(false);
        return;
      }
      
      // Send sell transaction - using sellTokensForEdu
      const sellTx = await tokenContract.sellTokensForEdu(tokenAmountWei);
      
      // Wait for sell transaction to be mined
      console.log("Waiting for sell transaction to be mined...");
      const sellReceipt = await sellTx.wait();
      console.log("Sell transaction mined:", sellReceipt.hash);
      
      // Update balances after successful transaction
      await fetchBalanceAndPrice(token);
      
      // Show success message
      setSuccessMessage(`Successfully sold ${formatTo8DecimalsNoRound(spendAmount)} ${token.symbol} for ${receiveAmount} ETH!`);
      setTimeout(() => setSuccessMessage(""), 5000);
      
      // Reset form
      setSpendAmount("");
      setReceiveAmount("");
      
    } catch (error) {
      console.error("Sell transaction failed:", error);
      setErrorMessage(formatErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  // Update the handleBuy function to use the formatErrorMessage helper
  const handleBuy = async () => {
    if (!connected || !provider || !account) {
      setErrorMessage("Please connect your wallet first");
      return;
    }
    
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      setErrorMessage("");
      
      // Get the signer from provider
      const signer = await provider.getSigner();
      
      // Parse the spend amount (in native token/ETH)
      const spendAmountWei = ethers.parseEther(spendAmount);
    
      // Create contract instance with signer
      const tokenContract = new ethers.Contract(
        token.contractAddress,
        HYPE_TOKEN_ABI,
        signer
      );
      
      console.log(`Buying tokens with ${spendAmount} ETH...`);
      
      // Send buy transaction - using buyTokensWithEdu which is payable
      const buyTx = await tokenContract.buyTokensWithEdu({
        value: spendAmountWei
      });
      
      // Wait for buy transaction to be mined
      console.log("Waiting for buy transaction to be mined...");
      const buyReceipt = await buyTx.wait();
      console.log("Buy transaction mined:", buyReceipt.hash);
      
      // Update balances after successful transaction
      await fetchBalanceAndPrice(token);
      
      // Show success message
      setSuccessMessage(`Successfully purchased ${receiveAmount} ${token.symbol}!`);
      setTimeout(() => setSuccessMessage(""), 5000);
      
      // Reset form
      setSpendAmount("");
      setReceiveAmount("");
      
    } catch (error) {
      console.error("Buy transaction failed:", error);
      setErrorMessage(formatErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  // Improved formatNumber function to handle scientific notation and large numbers
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';

    // Convert to number if it's a string
    let numValue = typeof num === 'string' ? parseFloat(num) : num;

    // Handle invalid numbers
    if (isNaN(numValue)) return '0';

    // FIXED VERSION: Use explicit BigInt notation
    numValue = numValue / 1e18;

    // Format based on size
    if (numValue >= 1e24) return (numValue / 1e24).toFixed(2) + 'Y'; // Yotta (septillion)
    if (numValue >= 1e21) return (numValue / 1e21).toFixed(2) + 'Z'; // Zetta (sextillion)
    if (numValue >= 1e18) return (numValue / 1e18).toFixed(2) + 'E'; // Exa (quintillion)
    if (numValue >= 1e15) return (numValue / 1e15).toFixed(2) + 'P'; // Peta (quadrillion)
    if (numValue >= 1e12) return (numValue / 1e12).toFixed(2) + 'T'; // Trillion
    if (numValue >= 1e9) return (numValue / 1e9).toFixed(2) + 'B'; // Billion
    if (numValue >= 1e6) return (numValue / 1e6).toFixed(2) + 'M'; // Million
    if (numValue >= 1e3) return (numValue / 1e3).toFixed(2) + 'K'; // Thousand

    // For smaller numbers, use regular comma formatting
    return numValue.toLocaleString('en-US', {
      maximumFractionDigits: numValue >= 100 ? 0 : 2
    });
  };

  // Calculate time ago
  const calculateTimeAgo = (createdOn) => {
    if (!createdOn) return "__h";

    const now = new Date();
    // Check if timestamp is in milliseconds (13 digits) or seconds (10 digits)
    const createdDate = new Date(
      createdOn.toString().length > 10
        ? parseInt(createdOn) // Already in milliseconds
        : parseInt(createdOn) * 1000 // Convert seconds to milliseconds
    );

    // Check if date is valid
    if (isNaN(createdDate.getTime())) return "NaN$";

    const diff = now - createdDate; // Time difference in milliseconds

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);

    if (months > 0) return `${months}m`;
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
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

    switch (period) {
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
              callback: function (value) {
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
              label: function (context) {
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
        const data = await fetchPriceHistory(token.contractAddress, timePeriod);
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

  // Function to fetch chart data
  const fetchChartData = async (tokenId, currentPrice, priceChange, period) => {
    setChartLoading(true);
    setChartError(null);
    try {
      // In a real application, this would be your actual API endpoint
      // For now, we'll use our generator function
      const data = generatePriceHistory(tokenId, currentPrice, priceChange);
      setChartData(data);
      setChartLoading(false);
    } catch (error) {
      console.error("Error fetching price history:", error);
      setChartError("Failed to load price data");
      setChartLoading(false);
    }
  };

  // Update balance when wallet connection changes
  useEffect(() => {
    if (connected && provider && account && token) {
      console.log("Wallet connected, fetching balances");
      fetchBalanceAndPrice(token);
    }
  }, [connected, provider, account, token?.id]);

  // Set up a price update interval
  useEffect(() => {
    if (token && provider) {
      // Initial price fetch
      const updatePrice = async () => {
        const price = await fetchTokenPrice(token.contractAddress);
        if (price !== currentPrice) {
          setCurrentPrice(price);
          // Also update the token object
          setToken(prevToken => ({
            ...prevToken,
            price: price
          }));
        }
      };

      // Update price immediately
      updatePrice();

      // Set up interval to update price every 30 seconds
      const intervalId = setInterval(updatePrice, 30000);

      // Clean up interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [token?.id, provider]);

  // Determine if trade button should be disabled
  useEffect(() => {
    // Button should be enabled when:
    // 1. Wallet is connected
    // 2. Not currently processing a transaction
    // 3. Valid spend amount is entered (greater than 0)
    // 4. No error message is present
    // 5. User has sufficient balance

    const spendAmountNum = parseFloat(spendAmount);
    const receiveAmountNum = parseFloat(receiveAmount);
    console.log("spendAmountNum", spendAmountNum);
    console.log("receiveAmountNum", receiveAmountNum);

    const hasValidAmount = !isNaN(spendAmountNum) && spendAmountNum > 0 &&
      !isNaN(receiveAmountNum) && receiveAmountNum > 0;

    const hasBalance = tradeType === 'buy'
      ? spendAmountNum <= parseFloat(eduBalance)
      : spendAmountNum <= parseFloat(balance);

    const shouldBeDisabled = !connected ||
      isProcessing ||
      !hasValidAmount ||
      !hasBalance ||
      errorMessage !== "";

    setIsTradeButtonDisabled(shouldBeDisabled);

    console.log("connected", hasValidAmount, !hasBalance );
    // If there's a balance issue but no error message set yet, set one
    if (connected && hasValidAmount && !hasBalance && errorMessage === "") {
      setErrorMessage(`Insufficient ${tradeType === 'buy' ? 'EDU' : token?.symbol} balance`);
    }

  }, [connected, isProcessing, spendAmount, receiveAmount, eduBalance, balance, tradeType, errorMessage, token]);

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Show a temporary success message
        setSuccessMessage("Copied to clipboard!");
        setTimeout(() => {
          setSuccessMessage("");
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        setErrorMessage("Failed to copy to clipboard");
        setTimeout(() => {
          setErrorMessage("");
        }, 2000);
      });
  };

  // Enhanced function to fetch token balance with proper decimal handling
  const fetchTokenBalance = async (tokenAddress, userAddress) => {
    if (!provider || !tokenAddress || !userAddress) {
      console.log("Missing requirements for fetching token balance");
      return null;
    }
    
    console.log(`Fetching token balance for ${userAddress} on contract ${tokenAddress}`);
    
    try {
      // First, validate the contract
      const isValid = await validateContract(tokenAddress);
      if (!isValid) {
        console.error("Invalid token contract");
        return null;
      }
      
      // Try with standard ERC20 balanceOf and decimals methods
      try {
        const erc20Interface = [
          "function balanceOf(address) view returns (uint256)",
          "function decimals() view returns (uint8)"
        ];
        
        const tokenContract = new ethers.Contract(
          tokenAddress,
          erc20Interface,
          provider
        );
        
        // Get balance
        const balance = await tokenContract.balanceOf(userAddress);
        console.log("Standard balanceOf succeeded:", balance.toString());
        
        // Try to get decimals (default to 18 if it fails)
        let decimals = 18;
        try {
          decimals = await tokenContract.decimals();
          console.log(`Token decimals: ${decimals}`);
        } catch (decimalError) {
          console.warn("Could not get token decimals, using default 18");
        }
        
        // Format the balance according to decimals - don't round
        const formattedBalance = ethers.formatUnits(balance, decimals);
        console.log(`Token balance: ${formattedBalance} (using ${decimals} decimals)`);
        
        return formattedBalance;
      } catch (erc20Error) {
        console.warn("Standard ERC20 balanceOf failed:", erc20Error.message);
      }
      
      // If all methods fail, return null
      console.error("All balance fetching methods failed");
      return null;
    } catch (error) {
      console.error("Error in fetchTokenBalance:", error);
      return null;
    }
  };

  // Helper function to format a number to exactly 8 decimal places without rounding
  const formatTo8DecimalsNoRound = (value) => {
    if (!value) return "0.00000000";
    
    // Convert to string if it's not already
    const valueStr = value.toString();
    
    // Check if it contains a decimal point
    if (valueStr.includes('.')) {
      const [whole, decimal] = valueStr.split('.');
      // Pad with zeros if needed, or truncate to 8 decimal places
      const paddedDecimal = decimal.length >= 8 
        ? decimal.substring(0, 8) 
        : decimal.padEnd(8, '0');
      return `${whole}.${paddedDecimal}`;
    } else {
      // If no decimal point, add .00000000
      return `${valueStr}.00000000`;
    }
  };

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
              <path d="M19 12H5M12 19l-7-7 7-7" />
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
  const circulationPercentage = (token.tokensSold / token.totalSupply) * 100;

  console.log("Token:", token);

  return (
    <div className="token-page-container">
      {/* Enhanced Background Effects */}
      <div className="background-effects">
        <div className="digital-pulse"></div>
      </div>

      <Header />


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

                <div className="price-display">
                  <span className="price-label">Current Price:</span>
                  <span className="price-value">
                    1 {token?.symbol} = {parseFloat(currentPrice).toFixed(6)} EDU
                  </span>
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
                </div>
              </div>
            </div>

            <div className="creator-section">
              <div className="creator-info">
                <div className="creator-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="creator-icon">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className="creator-label">Creator</span>
                </div>
                
                <div className="creator-address-container" onClick={() => copyToClipboard(token.creatorAddress)}>
                  <span className="address-dot"></span>
                  <span className="creator-address" title={token.creatorAddress}>
                    {truncateAddress(token.creatorAddress)}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="copy-icon">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </div>
                
                <div className="creation-time-container">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="time-icon">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span className="creation-time">Created {calculateTimeAgo(token.createdAt)} ago</span>
                </div>
              </div>
              
              {token.social && (
                <div className="social-links">
                  {token.social.website && (
                    <a href={token.social.website} target="_blank" rel="noopener noreferrer" className="social-link website">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                    </a>
                  )}
                  {token.social.twitter && (
                    <a href={token.social.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                      </svg>
                    </a>
                  )}
                  {token.social.telegram && (
                    <a href={token.social.telegram} target="_blank" rel="noopener noreferrer" className="social-link telegram">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.5 2L2 10l7 4m7 8l-3-9 9-5m-9 5V22"></path>
                      </svg>
                    </a>
                  )}
                  {token.social.discord && (
                    <a href={token.social.discord} target="_blank" rel="noopener noreferrer" className="social-link discord">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 9a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v6a5 5 0 0 0 5 5h4"></path>
                        <circle cx="16" cy="16" r="3"></circle>
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="token-description-details">
              <p>{token.description}</p>
            </div>

            <div className="progress-section">
              <h4>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                Bonding Curve Progress
              </h4>
              <div className="supply-numbers">
                <div className="supply-fractions">
                  <span className="circulating-amount">{formatNumber(token.tokensSold )}</span>
                  <span className="supply-divider">/</span>
                  <span className="max-amount">{formatNumber(token.totalSupply)}</span>
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
                <span>{timePeriod === 'All' ? 'All time' : timePeriod} • Price in EDU</span>
              </div>
            </div>


          </div>
        </div>


        <div className="right-section">
          {/* Enhanced Trade Section */}
          <div className="token-trade-section">
            <h2 className="section-title">Trade {token?.symbol}</h2>
            
            <div className="trade-container">
              <div className="trade-type-selector">
                <button 
                  className={`trade-type-button ${tradeType === 'buy' ? 'active' : ''}`}
                  onClick={() => handleTradeTypeChange('buy')}
                >
                  Buy
                </button>
                <button 
                  className={`trade-type-button ${tradeType === 'sell' ? 'active' : ''}`}
                  onClick={() => handleTradeTypeChange('sell')}
                >
                  Sell
                </button>
              </div>
              
              <div className="price-display">
                <span className="price-label">Current Price:</span>
                <span className="price-value">
                  1 {token?.symbol} = {parseFloat(currentPrice).toFixed(6)} ETH
                </span>
              </div>
              
              <div className="trade-form">
                <div className="trade-input-group">
                  <label className="trade-label">
                    {tradeType === 'buy' ? 'You Spend (EDU)' : `You Sell (${token?.symbol})`}
                  </label>
                  <div className="trade-input-container">
                    <input
                      type="text"
                      className="trade-input"
                      value={spendAmount}
                      onChange={(e) => handleSpendAmountChange(e.target.value)}
                      placeholder="0"
                      disabled={!connected || isProcessing}
                    />
                    <span className="trade-input-suffix">
                      {tradeType === 'buy' ? 'EDU' : token?.symbol}
                    </span>
                  </div>
                  
                  {connected && (
                    <div className="balance-info">
                      Balance: {tradeType === 'buy' 
                        ? `${parseFloat(eduBalance).toFixed(4)} EDU` 
                        : `${formatTo8DecimalsNoRound(balance)} ${token?.symbol}`}
                    </div>
                  )}
                  
                  {connected && (
                    <div className="percentage-buttons">
                      {[25, 50, 75, 100].map((percentage) => (
                        <button
                          key={percentage}
                          className="percentage-button"
                          onClick={() => handleQuickAmount(percentage)}
                          disabled={isProcessing}
                        >
                          {percentage}%
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="trade-input-group">
                  <label className="trade-label">
                    {tradeType === 'buy' ? `You Receive (${token?.symbol})` : 'You Receive (EDU)'}
                  </label>
                  <div className="trade-input-container">
                    <input
                      type="text"
                      className="trade-input"
                      value={receiveAmount}
                      onChange={(e) => handleReceiveAmountChange(e.target.value)}
                      placeholder="0"
                      disabled={!connected || isProcessing}
                    />
                    <span className="trade-input-suffix">
                      {tradeType === 'buy' ? token?.symbol : 'EDU'}
                    </span>
                  </div>
                </div>
                
                {errorMessage && (
                  <div className="error-message">
                    <div className="error-content">
                      {errorMessage}
                    </div>
                    <button 
                      className="error-close-button"
                      onClick={() => setErrorMessage("")}
                      aria-label="Close error message"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                {successMessage && (
                  <div className="success-message">
                    {successMessage}
                  </div>
                )}
                
                <button
                  className={`trade-button ${tradeType}`}
                  onClick={tradeType === 'buy' ? handleBuy : handleSell}
                  disabled={isTradeButtonDisabled || isProcessing || !connected}
                >
                  {isProcessing ? (
                    <div className="button-loading">
                      <div className="loading-spinner"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${token?.symbol}`
                  )}
                </button>
                
                {!connected && (
                  <div className="connect-wallet-message">
                    Please connect your wallet to trade
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Holders Section */}
          <div className="holders-container">
            <h3>Top Token Holders</h3>
            {token.holders && token.holders.map((holder, index) => (
              <div key={index} className="holder-row">
                <div className="holder-address" title={holder.address}>
                  {index + 1}. {holder.address}
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
                      title={token.contractAddress}
                      onClick={() => copyToClipboard(token.contractAddress)}
                    >
                      {(token.contractAddress)}
                    </span>
                    <button
                      className="copy-button"
                      onClick={() => {
                        copyToClipboard(token.contractAddress);
                      }}
                      title="Copy contract address"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
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
                    <span className="highlight-value">{formatNumber(token.totalSupply)}</span>
                  </div>
                </div>


                <div className="contract-row">
                  <div className="contract-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    Explorer
                  </div>
                  <div className="contract-value">
                    <a
                      href={`https://edu-chain-testnet.blockscout.com/token/${token.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="explorer-link"
                    >
                      View
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
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