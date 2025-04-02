"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

// Helper function to add delay between requests to avoid rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function useFetchTokenPrice(tokenAddress) {
  const [priceData, setPriceData] = useState({
    price: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchPrice = async () => {
      if (!tokenAddress || !window.ethereum) return;
      
      setPriceData(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Define minimal ABI with just the functions we need
        const minimalABI = [
          // Try all possible price-fetching functions
          "function getPrice(uint256) view returns (uint256)",
          "function getCurrentPrice(uint256) view returns (uint256)",
          "function calculatePrice() view returns (uint256)", 
          "function getTokenPrice() view returns (uint256)"
        ];
        
        const contract = new ethers.Contract(tokenAddress, minimalABI, provider);
        
        // Function to attempt calling a method with fallback handling
        const tryMethod = async (methodName, ...args) => {
          try {
            if (contract[methodName]) {
              return await contract[methodName](...args);
            }
          } catch (error) {
            console.log(`Method ${methodName} failed:`, error.message);
            return null;
          }
          return null;
        };
        
        // Try different price fetching methods with pauses between attempts
        let price = null;
        
        // Try getPrice with 1 token (in wei/ether format)
        price = await tryMethod('getPrice', ethers.parseEther("1"));
        if (price !== null) {
          console.log("Retrieved price using getPrice(1 ether)");
          setPriceData({ price, loading: false, error: null });
          return;
        }
        
        await delay(300); // Add delay to avoid rate limiting
        
        // Try getCurrentPrice with 1 token
        price = await tryMethod('getCurrentPrice', ethers.parseEther("1"));
        if (price !== null) {
          console.log("Retrieved price using getCurrentPrice(1 ether)");
          setPriceData({ price, loading: false, error: null });
          return;
        }
        
        await delay(300);
        
        // Try calculatePrice without arguments
        price = await tryMethod('calculatePrice');
        if (price !== null) {
          console.log("Retrieved price using calculatePrice()");
          setPriceData({ price, loading: false, error: null });
          return;
        }
        
        await delay(300);
        
        // Try getTokenPrice without arguments
        price = await tryMethod('getTokenPrice');
        if (price !== null) {
          console.log("Retrieved price using getTokenPrice()");
          setPriceData({ price, loading: false, error: null });
          return;
        }
        
        // If we get here, all methods failed
        setPriceData({
          price: null, 
          loading: false, 
          error: "Could not fetch token price. Contract may not implement standard price methods."
        });
        
      } catch (error) {
        console.error("Error fetching token price:", error);
        setPriceData({
          price: null,
          loading: false,
          error: `Failed to fetch price: ${error.message}`
        });
      }
    };

    fetchPrice();
    
    // Set up a refresh interval (every 30 seconds)
    const intervalId = setInterval(fetchPrice, 30000);
    
    return () => clearInterval(intervalId);
  }, [tokenAddress]);

  return priceData;
} 