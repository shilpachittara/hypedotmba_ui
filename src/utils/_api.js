import { ethers } from "ethers";
import axios from 'axios';
import dotenv from "dotenv";

dotenv.config();

const FACTORY_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const FACTORY_CONTRACT_ABI = [
  "function getDeployedTokens() public view returns (address[])"
];

const HYPE_TOKEN_ABI = [
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function description() public view returns (string)",
  "function image() public view returns (string)",
  "function getCurrentPrice() public view returns (uint256)",
  "function tokensSold() public view returns (uint256)",
  "function getMarketCap() public view returns (uint256)",
  "function get24HourVolume() public view returns (uint256)",
  "function get7DayVolumeChange() public view returns (uint256)",
  "function owner() public view returns (address)",
  "function createdOn() public view returns (uint256)",
  "function getHolders() public view returns (address[] memory)",
  "function balanceOf(address account) public view returns (uint256)",
  "function getPriceHistory() external view returns (uint256[] memory, uint256[] memory)",
  "function getCurrentPrice() public view returns (uint256)"
];

const EDU_PRICE_API = "https://api.coingecko.com/api/v3/simple/price?ids=edu-coin&vs_currencies=usd";

/**
 * Fetch EDU price in USD
 * @returns {number} - Current EDU price in USD
 */
const fetchEduPrice = async () => {
  try {
    const response = await axios.get(EDU_PRICE_API);
    return response.data["edu-coin"].usd || 0;
  } catch (error) {
    console.error("Error fetching EDU price:", error);
    return 0;
  }
};


/**
 * Fetch all deployed tokens with enhanced details
 * @returns {Array} - List of token details including sorting parameters
 */
export const fetchTokens = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed.");
    }

    const eduPrice = await fetchEduPrice();

    console.log("edu price : ", eduPrice);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const factoryContract = new ethers.Contract(
      FACTORY_CONTRACT_ADDRESS,
      FACTORY_CONTRACT_ABI,
      provider
    );

    const deployedTokens = await factoryContract.getDeployedTokens();
    const tokens = await Promise.all(
      deployedTokens.map(async (tokenAddress) => {
        const tokenContract = new ethers.Contract(
          tokenAddress,
          HYPE_TOKEN_ABI,
          provider
        );

        const [
          name,
          symbol,
          description,
          image,
          price,
          tokensSold,
          marketCap,
          dailyVolume,
          volume7dChange,
          creator,
          createdOn
        ] = await Promise.all([
          tokenContract.name(),
          tokenContract.symbol(),
          tokenContract.description(),
          tokenContract.image(),
          tokenContract.getCurrentPrice(),
          tokenContract.tokensSold(),
          tokenContract.getMarketCap(),
          tokenContract.get24HourVolume(),
          tokenContract.get7DayVolumeChange(),
          tokenContract.owner(),
          tokenContract.createdOn()
        ]);
        return {
          id: tokenAddress,
          name,
          symbol,
          description,
          image,
          price: ethers.formatEther(price),
          tokensSold: ethers.formatEther(tokensSold),
          marketCap: (ethers.formatEther(marketCap) * eduPrice).toFixed(2),
          dailyVolume: (ethers.formatEther(dailyVolume) * eduPrice).toFixed(2),
          volume7dChange: (ethers.formatEther(volume7dChange) * eduPrice).toFixed(2),
          creator,
          createdOn: Number(createdOn)
        };
      })
    );

    return tokens;
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return [];
  }
};

/**
 * Fetch single token details by contract address
 * @param {string} tokenAddress - The deployed token contract address
 * @returns {Object} - Token details (name, symbol, description, image, price, tokensSold, marketCap, creator)
 */
export const fetchTokenById = async (tokenAddress) => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed.");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);

    const tokenContract = new ethers.Contract(
      tokenAddress,
      HYPE_TOKEN_ABI,
      provider
    );

    const eduPrice = await fetchEduPrice();


    const [
      name,
      symbol,
      description,
      image,
      price,
      tokensSold,
      marketCap,
      dailyVolume,
      creator,
      createdOn,

    ] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.description(),
      tokenContract.image(),
      tokenContract.getCurrentPrice(),
      tokenContract.tokensSold(),
      tokenContract.getMarketCap(),
      tokenContract.get24HourVolume(),
      tokenContract.owner(),
      tokenContract.createdOn()
    ]);

    return {
      id: tokenAddress,
      name,
      symbol,
      description,
      image,
      price: ethers.formatEther(price),
      tokensSold: ethers.formatEther(tokensSold),
      marketCap: (ethers.formatEther(marketCap) * eduPrice).toFixed(2),
      dailyVolume: (ethers.formatEther(dailyVolume) * eduPrice).toFixed(2),
      creator,
      createdOn: Number(createdOn)
    };
  } catch (error) {
    console.error(`Error fetching token with ID ${tokenAddress}:`, error);
    return null;
  }
};



/**
 * Fetch holders and price history data for a token
 * @param {string} tokenAddress - The deployed token contract address
 * @param {object} provider - Ethers.js provider
 * @returns {object} - Contains holders data and price history
 */
export const fetchHoldersAndPriceData = async (tokenAddress, provider) => {
  const HYPE_TOKEN_ABI = [
    "function getHolders() public view returns (address[] memory)",
    "function balanceOf(address account) public view returns (uint256)",
    "function getPriceHistory() external view returns (uint256[] memory, uint256[] memory)"
  ];

  try {
    const tokenContract = new ethers.Contract(tokenAddress, HYPE_TOKEN_ABI, provider);

    // Fetch holders
    const holdersList = await tokenContract.getHolders();
    const holdersData = await Promise.all(
      holdersList
        .filter((address) => address.toLowerCase() !== tokenAddress.toLowerCase())
        .map(async (address) => {
          const balanceRaw = await tokenContract.balanceOf(address);
          return {
            address,
            balance: ethers.formatEther(balanceRaw)
          };
        })
    );

    // Fetch price history
    const [timestamps, prices] = await tokenContract.getPriceHistory();
    const chartData = timestamps.map((timestamp, index) => ({
      time: new Date(Number(timestamp) * 1000).toLocaleString(),
      price: ethers.formatEther(prices[index])
    }));

    return { holders: holdersData, priceHistory: chartData };
  } catch (error) {
    console.error("Error fetching holders and price data:", error);
    return { holders: [], priceHistory: [] };
  }
};
