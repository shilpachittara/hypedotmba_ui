import { ethers } from "ethers";

const FACTORY_CONTRACT_ADDRESS = "0x3Ed72eaaB159e945a53a07A6F95608e80A66664e";
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
  "function liquidityAdded() public view returns (bool)"
];

export const fetchTokens = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed.");
    }

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

        const [name, symbol, description, image, price, tokensSold, liquidityAdded] =
          await Promise.all([
            tokenContract.name(),
            tokenContract.symbol(),
            tokenContract.description(),
            tokenContract.image(),
            tokenContract.getCurrentPrice(),
            tokenContract.tokensSold(),
            tokenContract.liquidityAdded()
          ]);

        return {
          id: tokenAddress,
          name,
          symbol,
          description,
          image,
          price: ethers.formatEther(price),
          tokensSold: ethers.formatEther(tokensSold),
          liquidityAdded
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
 * Fetch token details by contract address
 * @param {string} tokenAddress - The deployed token contract address
 * @returns {Object} - Token details (name, symbol, description, image, price, tokensSold, liquidityAdded)
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

    // Fetch token details in parallel for performance
    const [name, symbol, description, image, price, tokensSold, liquidityAdded] =
      await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.description(),
        tokenContract.image(),
        tokenContract.getCurrentPrice(),
        tokenContract.tokensSold(),
        tokenContract.liquidityAdded()
      ]);

    return {
      id: tokenAddress,
      name,
      symbol,
      description,
      image,
      price: ethers.formatEther(price),
      tokensSold: ethers.formatEther(tokensSold),
      liquidityAdded
    };
  } catch (error) {
    console.error(`Error fetching token with ID ${tokenAddress}:`, error);
    return null;
  }
};