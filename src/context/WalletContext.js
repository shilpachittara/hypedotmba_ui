"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

// ✅ Create Context
const WalletContext = createContext();

// ✅ Custom Hook for easier access
export const useWallet = () => useContext(WalletContext);

// ✅ Provider Component
export const WalletProvider = ({ children }) => {
    const [connected, setConnected] = useState(false);
    const [account, setAccount] = useState("");
    const [provider, setProvider] = useState(null);

    // ✅ Check if wallet is connected on page load
    useEffect(() => {
        checkWalletConnection();
    }, []);

    const checkWalletConnection = async () => {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum, {
                chainId: 656476,
                name: "opencampus"
              });
            const accounts = await provider.send("eth_accounts", []);
            if (accounts.length > 0) {
                setConnected(true);
                setAccount(accounts[0]);
                setProvider(provider);
            }
        }
    };

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
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

    const disconnectWallet = () => {
        setConnected(false);
        setAccount("");
        setProvider(null);
        localStorage.removeItem("walletConnected");
    };

    return (
        <WalletContext.Provider
            value={{
                connected,
                account,
                provider,
                connectWallet,
                disconnectWallet
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};