import { ethers } from "ethers";
import axios from 'axios';
import dotenv from "dotenv";
import apolloClient from '../lib/apollo-client';
import { GET_ALL_TOKENS, GET_TOKEN_BY_ADDRESS, GET_TOKEN_HOLDERS, TEST_QUERY, GET_TOKENS_BY_FACTORY } from '../lib/graphql-queries';
import { gql } from '@apollo/client';

dotenv.config();

const FACTORY_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const FACTORY_CONTRACT_ABI = [
  "function getDeployedTokens() public view returns (address[])"
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

console.log('API_BASE_URL:', API_BASE_URL);

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
 * Fetch all tokens from the GraphQL API
 * @returns {Array} - List of token details including sorting parameters
 */
export const fetchTokens = async () => {
  try {
    // First test the connection with a simple query
    const testResult = await apolloClient.query({
      query: TEST_QUERY,
      errorPolicy: 'all'
    });
    
    console.log("GraphQL connection test:", testResult);
    
    const { data, error } = await apolloClient.query({
      query: GET_ALL_TOKENS,
      errorPolicy: 'all'
    });
    
    if (error) {
      console.error("GraphQL error:", error);
      throw new Error(`GraphQL error: ${error.message}`);
    }
    
    // Check if data exists and has the expected structure
    if (!data || !data.getAllTokens) {
      console.error("No data returned from GraphQL API or unexpected structure:", data);
      return []; // Return empty array instead of mock data
    }
    
    console.log(`Fetched ${data.getAllTokens.length} tokens successfully`);
    
    // Transform the data to match the expected format for TokenCard
    return data.getAllTokens.map(token => ({
      id: token.contractAddress,
      name: token.name,
      symbol: token.symbol,
      description: token.description || "",
      image: token.imageUrl || "/default-token-image.png",
      creator: token.creatorAddress || "",
      price: 0, // This isn't directly in your schema, might need calculation
      marketCap: token.marketCap || 0,
      dailyVolume: token.dailyVolume || 0,
      volume7dChange: token.volumeChangePercent || 0,
      priceChange24h: 0, // This isn't directly in your schema
      social: token.social ? JSON.parse(token.social) : {},
      createdAt: token.createdAt || new Date().toISOString(),
      holderCount: token.holderCount || 0,
      totalSupply: parseFloat(token.totalSupply) || 0,
      tokensSold: parseFloat(token.tokensSold) || 0
    }));
  } catch (error) {
    console.error("Error fetching tokens:", error);
    // Return empty array instead of mock data
    return [];
  }
};

/**
 * Fetch a specific token by ID
 * @param {string} tokenId - The token ID to fetch
 * @param {number} holderLimit - Optional limit for number of holders to fetch
 * @returns {Object} - Token details
 */
export const fetchTokenById = async (tokenId) => {
  try {
    const GET_TOKEN_BY_ID = gql`
      query GetTokenById($id: ID!) {
        getTokenById(id: $id) {
          id
          tokenAddress
          name
          symbol
          description
          imageUrl
          creatorAddress
          totalSupply
          tokensSold
          createdAt
          social
          factoryAddress
        }
      }
    `;

    const { data, error } = await apolloClient.query({
      query: GET_TOKEN_BY_ID,
      variables: { id: tokenId },
      errorPolicy: 'all'
    });
    
    if (error) {
      console.error("GraphQL error:", error);
      throw new Error(`GraphQL error: ${error.message}`);
    }
    
    if (!data || !data.getTokenById) {
      console.error(`No token found with ID ${tokenId}`);
      return null;
    }
    
    const token = data.getTokenById;
    
    return {
      id: token.id,
      contractAddress: token.tokenAddress,
      name: token.name,
      symbol: token.symbol,
      description: token.description || "",
      image: token.imageUrl || "/default-token-image.png",
      price: 0, // Calculate if needed
      marketCap: token.marketCap || 0,
      dailyVolume: token.dailyVolume || 0,
      volume7dChange: token.volumeChangePercent || 0,
      priceChange24h: 0, // Calculate if needed
      social: token.social ? JSON.parse(token.social) : {},
      createdAt: token.createdAt || new Date().toISOString(),
      updatedAt: token.updatedAt,
      holderCount: token.holderCount || 0,
      totalSupply: parseFloat(token.totalSupply) || 0,
      tokensSold: parseFloat(token.tokensSold) || 0,
      factoryAddress: token.factoryAddress,
      creatorAddress: token.creatorAddress,
      holders: token.holders || []
    };
  } catch (error) {
    console.error(`Error fetching token ${tokenId}:`, error);
    return null;
  }
};

/**
 * Buy tokens
 * @param {string} tokenAddress - The token contract address
 * @param {number} amount - The amount of tokens to buy
 * @param {ethers.Signer} signer - The ethers.js signer
 * @returns {Promise<ethers.TransactionReceipt>} - The transaction receipt
 */
export const buyTokens = async (tokenAddress, amount, signer) => {
  try {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        {
          "inputs": [],
          "name": "buyTokens",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        }
      ],
      signer
    );
    
    const tx = await tokenContract.buyTokens({ value: amount });
    return await tx.wait();
  } catch (error) {
    console.error("Error buying tokens:", error);
    throw error;
  }
};

/**
 * Sell tokens
 * @param {string} tokenAddress - The token contract address
 * @param {number} amount - The amount of tokens to sell
 * @param {ethers.Signer} signer - The ethers.js signer
 * @returns {Promise<ethers.TransactionReceipt>} - The transaction receipt
 */
export const sellTokens = async (tokenAddress, amount, signer) => {
  try {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        {
          "inputs": [
            {"internalType": "uint256", "name": "amount", "type": "uint256"}
          ],
          "name": "sellTokens",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
      signer
    );
    
    const tx = await tokenContract.sellTokens(amount);
    return await tx.wait();
  } catch (error) {
    console.error("Error selling tokens:", error);
    throw error;
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

/**
 * Generate mock token data for development/testing
 * @returns {Array} - List of mock token details
 */
const getMockTokens = () => {
  return [
    {
      id: "0x1234567890123456789012345678901234567890",
      name: "Example Token",
      symbol: "EXT",
      description: "This is an example token for development",
      image: "/default-token-image.png",
      price: 0.00123,
      marketCap: 123000,
      dailyVolume: 45000,
      volume7dChange: 5.2,
      priceChange24h: 2.3,
      social: { twitter: "https://twitter.com/example", website: "https://example.com" },
      createdAt: new Date().toISOString(),
      holderCount: 250,
      totalSupply: 1000000,
      tokensSold: 750000
    },
    {
      id: "0x0987654321098765432109876543210987654321",
      name: "Test Token",
      symbol: "TEST",
      description: "A test token for development purposes",
      image: "/default-token-image.png",
      price: 0.00456,
      marketCap: 456000,
      dailyVolume: 78000,
      volume7dChange: -2.1,
      priceChange24h: -1.4,
      social: { twitter: "https://twitter.com/test", website: "https://test.com" },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      holderCount: 120,
      totalSupply: 500000,
      tokensSold: 300000
    }
  ];
};

/**
 * Fetch all tokens from a specific factory
 * @param {string} factoryAddress - The factory contract address
 * @returns {Array} - List of token details
 */
export const fetchTokensByFactory = async (factoryAddress) => {
  try {
    if (!factoryAddress) {
      console.error("Factory address is required");
      return [];
    }
    
    console.log("Fetching tokens for factory:", factoryAddress);
    
    const { data, error } = await apolloClient.query({
      query: GET_TOKENS_BY_FACTORY,
      variables: { factoryAddress },
      errorPolicy: 'all'
    });
    
    console.log("Data:", data);
    console.log("Error:", error);

    if (error) {
      console.error("GraphQL error:", error);
      throw new Error(`GraphQL error: ${error.message}`);
    }
    
    // Check if data exists and has the expected structure
    if (!data) {
      console.error("No data returned from GraphQL API");
      return []; 
    }
    
    // Check if getTokensByFactory exists in the response
    if (!data.getTokensByFactory) {
      console.error("getTokensByFactory not found in response:", data);
      return [];
    }
    
    console.log(`Fetched ${data.getTokensByFactory.length} tokens for factory ${factoryAddress}`);
    
    // Transform the data to match the expected format for TokenCard
    return data.getTokensByFactory.map(token => ({
      id: token.tokenAddress,
      name: token.name,
      symbol: token.symbol,
      description: token.description || "",
      image: token.imageUrl || "/default-token-image.png",
      creator: token.creatorAddress || "",
      price: 0, // This will be fetched separately
      //marketCap: token.marketCap || 0,
      //dailyVolume: token.dailyVolume || 0,
      //volume7dChange: token.volumeChangePercent || 0,
      //priceChange24h: 0, // This isn't directly in your schema
      social: token.social ? JSON.parse(token.social) : {},
      createdAt: token.createdAt || new Date().toISOString(),
      holderCount: token.holderCount || 0,
      totalSupply: parseFloat(token.totalSupply) || 0,
      tokensSold: parseFloat(token.tokensSold) || 0,
      factoryAddress: token.factoryAddress
    }));
  } catch (error) {
    console.error("Error fetching tokens by factory:", error);
    return [];
  }
};
