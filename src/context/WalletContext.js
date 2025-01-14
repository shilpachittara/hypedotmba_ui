"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

// ✅ Create Context
const WalletContext = createContext();

// ✅ Custom Hook for easier access
export const useWallet = () => useContext(WalletContext);

// ✅ OpenCampus Network Details
const OPEN_CAMPUS_CHAIN_ID_DEC = Number(process.env.NEXT_PUBLIC_CHAIN_ID); // Decimal Chain ID
const OPEN_CAMPUS_CHAIN_ID_HEX =  "0x" + OPEN_CAMPUS_CHAIN_ID_DEC.toString(16);; // Hexadecimal Chain ID

const OPEN_CAMPUS_PARAMS = {
  chainId: OPEN_CAMPUS_CHAIN_ID_HEX,
  chainName: "OpenCampus",
  nativeCurrency: {
    name: "OpenCampus Token",
    symbol: "EDU",
    decimals: 18,
  },
  rpcUrls: [process.env.NEXT_PUBLIC_EDU_RPC_URL],
  blockExplorerUrls: ["https://opencampus.explorer.com"], // Replace with actual explorer URL
};

// ✅ Provider Component
export const WalletProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);

  // ✅ Check wallet connection on page load
  useEffect(() => {
    checkWalletConnection();
    if (window.ethereum) {
      window.ethereum.on("chainChanged", handleChainChanged);
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }
  }, []);

  // ✅ Check if wallet is connected and on the correct network
  const checkWalletConnection = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_accounts", []);
      const network = await provider.getNetwork();

      if (accounts.length > 0) {
        if (Number(network.chainId) !== OPEN_CAMPUS_CHAIN_ID_DEC) {
          await switchToOpenCampusNetwork();
        }

        setConnected(true);
        setAccount(accounts[0]);
        setProvider(provider);
      }
    }
  };

  // ✅ Connect Wallet and Ensure Correct Network
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const network = await provider.getNetwork();

        if (Number(network.chainId) !== OPEN_CAMPUS_CHAIN_ID_DEC) {
          await switchToOpenCampusNetwork();
        }

        setConnected(true);
        setAccount(accounts[0]);
        setProvider(provider);
      } catch (error) {
        console.error("Connection failed:", error);
      }
    } else {
      alert("Please install MetaMask to connect your wallet.");
    }
  };

  // ✅ Disconnect Wallet
  const disconnectWallet = () => {
    setConnected(false);
    setAccount("");
    setProvider(null);
    localStorage.removeItem("walletConnected");
  };

  // ✅ Switch to OpenCampus Network (Add first if not present)
  const switchToOpenCampusNetwork = async () => {
    try {
      // ✅ Attempt to switch to OpenCampus
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId:  OPEN_CAMPUS_CHAIN_ID_HEX}],
      });
      console.log("✅ Switched to OpenCampus Network");
    } catch (switchError) {
      // ❌ If network is not added, add it first
      console.log("Error : ", switchError)
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [OPEN_CAMPUS_PARAMS],
          });
          console.log("✅ OpenCampus Network added and switched.");
        } catch (addError) {
          console.error("❌ Failed to add OpenCampus network:", addError);
        }
      } else {
        console.error("❌ Failed to switch network:", switchError);
      }
    }
  };

  // ✅ Handle network changes
  const handleChainChanged = async () => {
    console.log("🔄 Network changed. Checking connection...");
    await checkWalletConnection();
  };

  // ✅ Handle account changes
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        connected,
        account,
        provider,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};