"use client";

import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import { ethers } from "ethers";
import "../../styles/CreatePage.css";
import "../../styles/HowItWorksModal.css";
import { useWallet } from "@/context/WalletContext";
import { toast } from "react-hot-toast";

// Custom styles for BuyModal inside CreatePage
const customStyles = {
  modalInput: {
    background: 'rgba(13, 14, 33, 0.6)',
    border: '1px solid rgba(0, 246, 170, 0.3)',
    borderRadius: '8px',
    padding: '10px 12px',
    marginTop: '10px',
    marginBottom: '15px',
    width: '100%',
    color: '#fff',
    position: 'relative',
  },
  gradientText: {
    background: 'linear-gradient(90deg, #00F6AA 0%, #02A4FF 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 'bold'
  },
  estimateText: {
    fontSize: '1rem',
    marginTop: '8px',
    color: '#fff'
  }
};

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
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
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "tokenAddress", "type": "address" }
    ],
    "name": "buyInitialTokens",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "hypeTokenImplementation",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_feeCollector", "type": "address" }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "tokenAddress", "type": "address" }
    ],
    "name": "TokenCreated",
    "type": "event"
  }
];

// Add HypeToken ABI for direct interaction with the token contract
const HYPETOKEN_ABI = [
  {
    "inputs": [],
    "name": "buyTokens",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

// Update BuyModal component to match HowItWorksModal design
const BuyModal = ({ 
  name, 
  initialBuyAmount, 
  setInitialBuyAmount, 
  calculateEstimatedTokens, 
  estimatedTokens, 
  handleFinalSubmit, 
  isLoading,
  onClose
}) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-glow"></div>

      <button className="modal-close-btn" onClick={onClose}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="modal-header">
        <h2 className="modal-title">Create <span className="gradient-text">{name}</span> Token</h2>
        <div className="title-decoration"></div>
      </div>
      
      <div className="modal-steps-container">
        <div className="step-card">
          <div className="step-content">
            <h3 className="step-title">Initial Token Purchase</h3>
            <p className="step-description">
              <span style={customStyles.gradientText}>Jumpstart your token</span> by making the first purchase! The initial buy sets the starting price and gives your token immediate liquidity. 
              <br/><br/>
              <span style={{color: '#00F6AA', fontWeight: 'bold'}}>Pro tip:</span> Starting with a small amount (0.005-0.01 EDU) creates the perfect entry point for your community.
            </p>
            
            <div className="input-wrapper" style={customStyles.modalInput}>
              <input
                type="number"
                value={initialBuyAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (parseFloat(value) >= 0 && !isNaN(parseFloat(value)))) {
                    setInitialBuyAmount(value);
                    calculateEstimatedTokens(value);
                  }
                }}
                placeholder="0.0 (optional)"
                step="0.000001"
                min="0"
                max="0.01"
                autoFocus
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  width: 'calc(100% - 45px)',
                  outline: 'none'
                }}
              />
              <span className="currency-label" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#00F6AA' }}>EDU</span>
            </div>

            {initialBuyAmount && (
              <p style={customStyles.estimateText}>
                Estimated tokens: <span style={customStyles.gradientText}>{estimatedTokens.toString()}</span>
              </p>
            )}
            
            <p className="tip-text" style={{ fontSize: '0.85rem', marginTop: '15px', color: '#ccc' }}>
              Total cost: <span style={customStyles.gradientText}>{initialBuyAmount ? parseFloat(initialBuyAmount).toFixed(6) : '0'}</span> EDU
            </p>
          </div>
          <div className="step-decoration">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M5 5L35 35M5 35L35 5" stroke="rgba(0, 246, 170, 0.1)" strokeWidth="2"/>
            </svg>
          </div>
        </div>
        
      </div>

      <button 
        onClick={handleFinalSubmit}
        disabled={isLoading}
        className="launch-btn"
      >
        <span className="btn-text">{isLoading ? "Processing..." : "Create Token"}</span>
        <div className="btn-glow"></div>
        <span className="btn-icon">🚀</span>
      </button>
    </div>
  </div>
);


const CreatePage = () => {
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { provider, connected, account } = useWallet();

  const fileInputRef = useRef(null);
  const expandableRef = useRef(null);
  const bottomSectionRef = useRef(null);

  // Add this state for background particles
  const [particles, setParticles] = useState([]);
  const [cryptoParticles, setCryptoParticles] = useState([]);
  
  // Generate consistent particles on component mount
  useEffect(() => {
    // Generate background particles
    const bgParticles = Array(20).fill().map((_, i) => ({
      id: `particle-${i}`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.5 + 0.3,
      transform: `scale(${Math.random() * 1.5 + 0.5})`
    }));
    setParticles(bgParticles);
    
    // Generate crypto particles
    const cParticles = Array(10).fill().map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`
    }));
    setCryptoParticles(cParticles);
  }, []);

  // Add new state for initial buy
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [initialBuyAmount, setInitialBuyAmount] = useState("");
  const [estimatedTokens, setEstimatedTokens] = useState("0");

  // Store last attempt time to prevent rapid repeated submissions
  const [lastAttemptTime, setLastAttemptTime] = useState(0);

  // ✅ Form Validation: All required fields must be filled, and wallet connected
  const isFormValid = name && ticker && description && file && account;

  // 📂 Handle file upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSelectFileClick = () => {
    fileInputRef.current.click();
  };

  // Modal open/close functions
  const openBuyModal = () => {
    setShowBuyModal(true);
    // Add body class to prevent scrolling when modal is open like in HowItWorksModal
    document.body.classList.add('modal-open');
  };
  
  const closeBuyModal = () => {
    setShowBuyModal(false);
    // Remove the body class when modal is closed
    document.body.classList.remove('modal-open');
  };

  // 📤 Upload image to S3 (or server)
  const uploadImageToS3 = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Image upload failed");
    const data = await response.json();
    return data.imageUrl;
  };

  // Update the calculateEstimatedTokens function
  const calculateEstimatedTokens = (eduAmount) => {
    if (!eduAmount) {
      setEstimatedTokens("0");
      return;
    }
    
    try {
      // Using contract constants from deployment
      const BASE_PRICE = BigInt(10000000000000); // 0.00001 EDU in wei (10 * 1e12)
      const eduWei = ethers.parseEther(eduAmount);
      const tokens = (eduWei * BigInt(1e18)) / BASE_PRICE;
      setEstimatedTokens(tokens.toString());
    } catch (error) {
      console.error("Error calculating tokens:", error);
      setErrorMessage("Failed to calculate estimated tokens");
    }
  };

  // Update handleSubmit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!connected) {
      setErrorMessage("Please connect your wallet.");
      return;
    }

    if (!isFormValid) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    // Clear any existing messages
    setErrorMessage("");
    setSuccessMessage("");
    
    // Show buy modal
    openBuyModal();
  };

  // Update the handleFinalSubmit function to remove creation fee logic
  const handleFinalSubmit = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      // Upload image to S3 first
      let uploadedImageUrl = "";
      if (file) {
        try {
          uploadedImageUrl = await uploadImageToS3(file);
          console.log("Image uploaded successfully:", uploadedImageUrl);
        } catch (error) {
          console.error("Error uploading image:", error);
          setErrorMessage("Failed to upload image");
          setIsLoading(false);
          return;
        }
      }

      // Validate inputs
      if (name.trim().length === 0 || ticker.trim().length === 0) {
        throw new Error("Name and ticker are required");
      }

      // Set up contract interaction
      const FACTORY_ADDRESS = CONTRACT_ADDRESS || "0x4f992116f000F04c11b62D86633599aFC09DD4Dc";
      console.log("Using factory address:", FACTORY_ADDRESS);
      
      try {
        // Verify provider and access to signer
        if (!provider) {
          throw new Error("Provider not available. Please make sure your wallet is connected.");
        }
        
        const signer = await provider.getSigner();
        if (!signer) {
          throw new Error("Could not get signer from provider. Please check your wallet connection.");
        }
        
        const factory = new ethers.Contract(FACTORY_ADDRESS, CONTRACT_ABI, signer);
        
        // Check if we need to do an initial buy
        const hasInitialBuy = initialBuyAmount && parseFloat(initialBuyAmount) > 0;
        
        // Show processing status
        setSuccessMessage("Processing your request...");
        
        // Format the token parameters
        const tokenParamsStruct = {
          name: name.trim() || "Unnamed Token",
          symbol: ticker.trim().toUpperCase() || "TOKEN",
          description: description.trim() || "No description",
          image: uploadedImageUrl.trim() || "",
          social: "" // Simplified to eliminate encoding issues
        };

        // Keep track of transaction state
        let currentStep = "creation";
        let tokenAddress = null;
        
        try {
          // STEP 1: Create the token
          setSuccessMessage("Creating your token...");
          console.log("Sending transaction to create token");
          
          let createTokenTx;
          
          try {
            // Try direct transaction method first (bypass MetaMask checks silently)
            console.log("Attempting direct transaction method");
            
            const functionData = factory.interface.encodeFunctionData("createToken", [tokenParamsStruct]);
            const txRequest = {
              to: FACTORY_ADDRESS,
              from: account,
              data: functionData,
              // Explicitly set gas
              gasLimit: "0x" + (3000000).toString(16) // 3 million gas in hex
            };
            
            const txHash = await window.ethereum.request({
              method: 'eth_sendTransaction',
              params: [txRequest],
            });
            
            console.log("Transaction sent directly:", txHash);
            createTokenTx = { hash: txHash };
          } catch (directTxError) {
            console.log("Direct transaction method failed, falling back to standard approach", directTxError);
            
            // Use the standard approach as fallback
            try {
              // Use a simpler approach that avoids rate limits and supports legacy networks
              console.log("Preparing transaction with legacy parameters only");
              
              // Use a fixed gas price since getFeeData is causing rate limit issues
              const gasPrice = ethers.parseUnits("10", "gwei"); // 10 gwei is usually reasonable
              console.log("Using fixed gas price:", ethers.formatUnits(gasPrice, "gwei"), "gwei");
              
              // Estimate gas with a simple approach
              const gasEstimate = await factory.createToken.estimateGas(tokenParamsStruct);
              console.log("Gas estimate:", gasEstimate.toString());
              
              // Use a simpler transaction object with only legacy parameters
              const txOptions = {
                gasLimit: Math.floor(Number(gasEstimate) * 1.2), // Add 20% buffer
                gasPrice: gasPrice,
                // Explicitly avoid any EIP-1559 parameters
                type: 0 // Force legacy transaction type
              };
              
              console.log("Using transaction options:", txOptions);
              
              // Add a short delay to avoid rate limits
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Send the transaction
              createTokenTx = await factory.createToken(
                tokenParamsStruct,
                txOptions
              );
            } catch (fallbackError) {
              // Handle rate limit errors
              if (fallbackError.message && (
                  fallbackError.message.includes("429") || 
                  fallbackError.message.includes("Too many request") ||
                  fallbackError.message.includes("rate limit"))) {
                console.error("Rate limit hit. Please wait a moment and try again.");
                toast.error("Network busy - please wait a moment and try again");
                setIsLoading(false);
                return;
              }
              
              // Re-throw other errors
              throw fallbackError;
            }
          }
          
          console.log("Token creation transaction sent:", createTokenTx.hash);
          setSuccessMessage("Token creation in progress. Please wait for confirmation...");
          
          // Wait for the transaction to be mined
          const receipt = await provider.waitForTransaction(createTokenTx.hash);
          console.log("Token creation confirmed:", receipt);
          
          // Extract the token address from the event logs
          for (const log of receipt.logs) {
            try {
              const decoded = factory.interface.parseLog(log);
              if (decoded && decoded.name === "TokenCreated") {
                tokenAddress = decoded.args[1];
                console.log("Created token address:", tokenAddress);
                break;
              }
            } catch (e) {
              // Skip logs that don't match
            }
          }
          
          if (!tokenAddress) {
            throw new Error("Failed to extract token address from transaction logs");
          }
          
          // If no initial buy, we're done
          if (!hasInitialBuy) {
            setSuccessMessage(`🎉 Token created successfully! Address: ${tokenAddress}`);
            setShowBuyModal(false);
            return;
          }
          
          // STEP 2: Buy initial tokens directly from the token contract
          currentStep = "buying";
          try {
            // Small delay to allow UI to update and prepare for the next step
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const buyAmount = ethers.parseEther(initialBuyAmount);
            console.log("Buying initial tokens:", ethers.formatEther(buyAmount), "EDU");
            setSuccessMessage(`Token created! Now purchasing initial tokens...`);
            
            // Create a contract instance for the token
            const tokenContract = new ethers.Contract(
              tokenAddress,
              HYPETOKEN_ABI,
              signer
            );
            
            let buyTx;
            
            try {
              // Try direct transaction method first for buying tokens
              console.log("Attempting direct transaction method for token purchase");
              
              const functionData = tokenContract.interface.encodeFunctionData("buyTokens", []);
              const txRequest = {
                to: tokenAddress,
                from: account,
                value: buyAmount.toString(),
                data: functionData,
                gasLimit: "0x" + (2000000).toString(16) // 2 million gas in hex
              };
              
              const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [txRequest],
              });
              
              console.log("Token purchase sent directly:", txHash);
              buyTx = { hash: txHash };
            } catch (directBuyError) {
              console.log("Direct purchase method failed, falling back to standard approach", directBuyError);
              
              // Use standard approach as fallback
              try {
                // Use a simpler approach for buying tokens
                console.log("Preparing token purchase with legacy parameters");
                
                // Use a fixed gas price
                const gasPrice = ethers.parseUnits("10", "gwei"); // 10 gwei
                console.log("Using fixed gas price for purchase:", ethers.formatUnits(gasPrice, "gwei"), "gwei");
                
                // Add a short delay before the next transaction to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Standard ethers.js approach for ethers.js v6
                buyTx = await tokenContract.buyTokens({
                  value: buyAmount,
                  gasLimit: 2000000, // Use a number instead of BigInt string
                  gasPrice: gasPrice,
                  type: 0 // Force legacy transaction type
                });
              } catch (fallbackBuyError) {
                // Handle rate limit errors
                if (fallbackBuyError.message && (
                    fallbackBuyError.message.includes("429") || 
                    fallbackBuyError.message.includes("Too many request") ||
                    fallbackBuyError.message.includes("rate limit"))) {
                  console.error("Rate limit hit during token purchase. Please wait a moment and try again.");
                  setSuccessMessage(`Token created successfully at ${tokenAddress}. 
Initial token purchase failed due to network congestion. You can try buying tokens later.`);
                  setIsLoading(false);
                  setShowBuyModal(false);
                  return;
                }
                
                // Re-throw other errors
                throw fallbackBuyError;
              }
            }
            
            console.log("Token buy transaction sent:", buyTx.hash);
            setSuccessMessage(`Initial token purchase in progress. Please wait for confirmation...`);
            
            // Wait for the buy transaction to be mined
            const buyReceipt = await provider.waitForTransaction(buyTx.hash);
            console.log("Token buy confirmed:", buyReceipt);
            
            // Success for both transactions
            setSuccessMessage(`🎉 Success! Your token "${name}" has been created and initial tokens purchased.
Address: ${tokenAddress}`);
          } catch (error) {
            console.error("Error buying initial tokens:", error);
            if (error.message.includes("user rejected")) {
              // User rejected the buy transaction, but token creation was successful
              setSuccessMessage(`Token created successfully at ${tokenAddress}. 
You chose not to proceed with the initial token purchase.`);
            } else {
              // Other error with buying, but token creation was successful
              setSuccessMessage(`Token created successfully at ${tokenAddress}. 
Initial token purchase failed: ${error.message}`);
            }
          }
        } catch (error) {
          console.error("Transaction error:", error);
          // Check for specific error types
          if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
            console.error("Gas estimation failed. This often means the transaction would fail.");
          }
          if (error.reason) {
            console.error("Error reason:", error.reason);
          }
          if (error.data) {
            console.error("Error data:", error.data);
          }
          if (error.transaction) {
            console.error("Transaction details:", {
              from: error.transaction.from,
              to: error.transaction.to,
              data: error.transaction.data?.substring(0, 100) + '...' // Truncate for readability
            });
          }
          
          // Display appropriate error message to user
          toast.error(`Error creating token: ${error.message || "Unknown error"}`);
          setIsLoading(false);
          return;
        }
        
        setShowBuyModal(false);
      } catch (providerError) {
        console.error("Provider or wallet error:", providerError);
        setErrorMessage(`Wallet connection error: ${providerError.message}`);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error in overall process:", error);
        setErrorMessage(`❌ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle smooth scroll to bottom content
  const handleShowMore = () => {
    setShowMore(!showMore);
    
    // Wait for expansion animation to complete
    // setTimeout(() => {
    //   if (!showMore && bottomSectionRef.current) {
    //     bottomSectionRef.current.scrollIntoView({
    //       behavior: 'smooth',
    //       block: 'center'
    //     });
    //   }
    // }, 300); // Timing aligned with expansion animation
  };

  return (
    <div>
      <Header />
      <div className="page-container">
        {/* Background effects */}
        <div className="background-effects">
          <div className="grid-lines" />
          
          {/* Glow spots */}
          <div className="glow-spot" style={{ 
            top: '20%', 
            left: '20%',
            animationDelay: '0s'
          }} />
          <div className="glow-spot" style={{ 
            top: '60%', 
            right: '25%',
            animationDelay: '-5s'
          }} />
          
          {/* Background particles - now using pre-generated values */}
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="bg-particle"
              style={{
                left: particle.left,
                top: particle.top,
                opacity: particle.opacity,
                transform: particle.transform
              }}
            />
          ))}
        </div>

        <button className="go-back" onClick={() => window.history.back()}>
          [go back]
        </button>

        <form className="create-form" onSubmit={handleSubmit}>
          {/* Outer border effects */}
          <div className="form-border-effects">
            <div className="border-trace">
              {/* Data flow lines */}
              <div className="data-line data-line-h data-line-1" />
              <div className="data-line data-line-h data-line-2" />
              <div className="data-line data-line-h data-line-3" />
              <div className="data-line data-line-v data-line-4" />
              <div className="data-line data-line-v data-line-5" />
              <div className="data-line data-line-h data-line-6" />
              <div className="data-line data-line-h data-line-7" />
              <div className="data-line data-line-v data-line-8" />
              <div className="data-line data-line-v data-line-9" />
            </div>
            
            {/* Cyber corners */}
            <div className="cyber-corner corner-tl" />
            <div className="cyber-corner corner-tr" />
            <div className="cyber-corner corner-bl" />
            <div className="cyber-corner corner-br" />
            
            {/* Energy field */}
            <div className="energy-field" />
          </div>

          <div className="form-content">
            <div className="form-sections">
              <h1 className="form-title">
                <span className="form-title-text">Create Your Token</span>
                
                {/* Crypto particles - now using pre-generated values */}
                <div className="crypto-particles">
                  {cryptoParticles.map((particle) => (
                    <div
                      key={particle.id}
                      className="particle"
                      style={{
                        left: particle.left,
                        top: particle.top,
                        animationDelay: particle.animationDelay
                      }}
                    />
                  ))}
                </div>
              </h1>
              
              <div className="main-fields">
                {/* Name and Symbol inputs */}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Token Name</label>
                    <div className="input-wrapper">
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter token name"
                        maxLength={50}
                      />
                      <span className="char-counter">{name.length}/50</span>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Token Symbol</label>
                    <div className="input-wrapper">
                      <input 
                        type="text" 
                        value={ticker} 
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        maxLength={5}
                        placeholder="e.g. EDC"
                      />
                      <span className="char-counter">{ticker.length}/5</span>
                    </div>
                  </div>
                </div>

                {/* Description and Upload row */}
                <div className="description-upload-row">
                  <div className="form-group description-group">
                    <label>Description</label>
                    <div className="input-wrapper">
                      <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your token..."
                        maxLength={500}
                      />
                      <span className="char-counter">{description.length}/500</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Token Image</label>
                    <div 
                      className="file-upload" 
                      onClick={() => document.getElementById('file-input').click()}
                    >
                      <div className="upload-icon">
                        {file ? '📎' : '📤'}
                      </div>
                      {file ? (
                        <p className="file-name">{file.name}</p>
                      ) : (
                        <p>Drop image or click to browse</p>
                      )}
                      <input 
                        id="file-input"
                        type="file"
                        hidden
                        onChange={(e) => setFile(e.target.files[0])}
                        accept="image/*,video/*"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="button-sections">
                <div className="show-more-section">
                  <button 
                    type="button"
                    className="show-more-btn"
                    onClick={handleShowMore}
                  >
                    {showMore ? 'Show Less' : 'Show More Options'} 
                    <span>{showMore ? '↑' : '↓'}</span>
                  </button>
                </div>

                <div className={`expandable-content ${showMore ? 'expanded' : ''}`}>
                  <div className="optional-fields-grid">
                    <div className="form-group">
                      <label>Telegram Link</label>
                      <div className="input-wrapper">
                        <input 
                          type="text" 
                          value={telegram}
                          onChange={(e) => setTelegram(e.target.value)}
                          placeholder="https://t.me/..." 
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Website</label>
                      <div className="input-wrapper">
                        <input 
                          type="text" 
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://..." 
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Twitter</label>
                      <div className="input-wrapper">
                        <input 
                          type="text" 
                          value={twitter}
                          onChange={(e) => setTwitter(e.target.value)}
                          placeholder="https://twitter.com/..." 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bottom-section" ref={bottomSectionRef}>
                  <button 
                    type="submit" 
                    className={`create-btn ${isLoading ? 'processing' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="processing-text">Processing</span>
                        <span className="processing-dots">...</span>
                      </>
                    ) : (
                      "Create Token"
                    )}
                  </button>
                  
                  {/* Status Messages */}
                  {errorMessage && (
                    <div className="status-message error-message">
                      <div className="status-icon">❌</div>
                      <div className="status-text">{errorMessage}</div>
                    </div>
                  )}
                  
                  {successMessage && (
                    <div className="status-message success-message">
                      <div className="status-icon">🎉</div>
                      <div className="status-text">{successMessage}</div>
                    </div>
                  )}
                  
                  <p className="info-text">
                    When your coin completes its bonding curve you receive <span>5 EDU</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      {showBuyModal && (
        <BuyModal 
          name={name}
          initialBuyAmount={initialBuyAmount}
          setInitialBuyAmount={setInitialBuyAmount}
          calculateEstimatedTokens={calculateEstimatedTokens}
          estimatedTokens={BigInt(estimatedTokens)/BigInt(1e18)}
          handleFinalSubmit={handleFinalSubmit}
          isLoading={isLoading}
          onClose={closeBuyModal}
        />
      )}
    </div>
  );
};

export default CreatePage;