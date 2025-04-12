"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/context/WalletContext";
import { toast } from "react-hot-toast";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x4f992116f000F04c11b62D86633599aFC09DD4Dc";
const FACTORY_ABI = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "symbol", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "string", "name": "image", "type": "string" },
          { "internalType": "string", "name": "social", "type": "string" }
        ],
        "internalType": "struct HypeTokenFactory.TokenParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "createToken",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "TokenCreated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "CREATION_FEE",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_SUPPLY",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "BASE_PRICE",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "CURVE_FACTOR",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const CreateHardcodedTokenPage = () => {
  const [loading, setLoading] = useState(false);
  const { provider } = useWallet();

  const handleCreateToken = async () => {
    try {
      setLoading(true);
      if (!provider) throw new Error("Wallet not connected");

      const signer = await provider.getSigner();
      console.log("Signer address:", await signer.getAddress());

      // Create contract instance
      const factory = new ethers.Contract(CONTRACT_ADDRESS, FACTORY_ABI, signer);
      console.log("Contract instance created");

      // Verify contract is deployed
      const code = await provider.getCode(CONTRACT_ADDRESS);
      console.log("Contract code:", code);
      if (code === "0x") {
        throw new Error("Contract not deployed at this address");
      }

      // Prepare token parameters with size limits
      const tokenParams = {
        name: "DemoToken".slice(0, 32),
        symbol: "DMT".slice(0, 8),
        description: "This token was created from the frontend with one button.".slice(0, 256),
        image: "https://pumpedu.s3.amazonaws.com/uploads/demo-image.png".slice(0, 256),
        social: JSON.stringify({
          telegram: "https://t.me/demochat".slice(0, 64),
          website: "https://demotoken.io".slice(0, 64),
          twitter: "https://twitter.com/demotoken".slice(0, 64)
        }).slice(0, 256)
      };

      // Get creation fee from contract
      const creationFee = await factory.CREATION_FEE();
      const initialBuy = ethers.parseEther("0.0001"); // example
      const totalValue = creationFee + initialBuy;

      console.log("Creation fee:", ethers.formatEther(creationFee), "ETH");
      console.log("Total value:", ethers.formatEther(totalValue), "ETH");

      // Encode the function call
      const iface = new ethers.Interface(FACTORY_ABI);
      const data = iface.encodeFunctionData("createToken", [tokenParams]);
      console.log("Encoded function data:", data);

      // Estimate gas using provider
      console.log("Estimating gas for token creation...");
      const estimatedGas = await provider.estimateGas({
        to: CONTRACT_ADDRESS,
        data: data,
        value: totalValue
      });

      // Add 20% buffer to estimated gas
      const gasLimit = ethers.toBigInt(estimatedGas) * ethers.toBigInt(12) / ethers.toBigInt(10);
      console.log("Estimated gas:", estimatedGas.toString());
      console.log("Gas limit with buffer:", gasLimit.toString());

      // Add delay before transaction to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Send transaction
      const tx = await signer.sendTransaction({
        to: CONTRACT_ADDRESS,
        data: data,
        value: totalValue,
        gasLimit: gasLimit
      });

      toast.success("Transaction sent. Waiting for confirmation...");
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt);

      // Extract the token address from the event logs
      let tokenAddress = null;
      
      // Try using the contract interface to parse logs
      try {
        const tokenCreatedEvent = receipt.logs
          .filter(log => {
            try {
              const decoded = iface.parseLog(log);
              return decoded && decoded.name === "TokenCreated";
            } catch (e) {
              return false;
            }
          })[0];

        if (tokenCreatedEvent) {
          const decoded = iface.parseLog(tokenCreatedEvent);
          tokenAddress = decoded.args[1]; // The token address is the second indexed parameter
        }
      } catch (error) {
        console.log("Error parsing logs with contract interface:", error.message);
      }
      
      // Manual event parsing (backup method)
      if (!tokenAddress) {
        console.log("Trying manual event parsing...");
        const eventSignature = ethers.id("TokenCreated(address,address)");
        const tokenCreatedLog = receipt.logs.find(log => 
          log.topics && log.topics[0] === eventSignature
        );
        
        if (tokenCreatedLog) {
          tokenAddress = ethers.getAddress("0x" + tokenCreatedLog.topics[2].slice(26));
        }
      }

      if (tokenAddress) {
        toast.success(`Token created successfully! Address: ${tokenAddress}`);
      } else {
        toast.success(`Transaction successful but could not extract token address. TX: ${tx.hash}`);
      }

    } catch (err) {
      console.error("❌ Create token failed:", err);
      
      if (err.message.includes("429") || err.message.includes("Too many request")) {
        toast.error("Network busy - please wait a moment and try again");
      } else if (err.message.includes("user rejected")) {
        toast.error("Transaction was rejected by user");
      } else if (err.message.includes("insufficient funds")) {
        toast.error("Insufficient funds for transaction");
      } else if (err.message.includes("gas required exceeds allowance")) {
        toast.error("Gas limit too low. Please try again.");
      } else if (err.message.includes("missing revert data")) {
        toast.error("Contract call failed - please verify the contract address and network");
      } else {
        toast.error(err?.message || "Transaction failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Create Demo Token</h1>
        <button
          onClick={handleCreateToken}
          disabled={loading}
          className="bg-green-500 px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Token"}
        </button>
      </div>
    </div>
  );
};

export default CreateHardcodedTokenPage;