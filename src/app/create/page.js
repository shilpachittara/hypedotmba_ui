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
  }
];

// Update BuyModal component
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
            
            <div className="cost-breakdown" style={{ marginTop: '15px', color: '#ccc' }}>
              <p style={{ fontSize: '0.85rem', marginBottom: '5px' }}>
                Creation fee: <span style={customStyles.gradientText}>0.0001</span> EDU
              </p>
              <p style={{ fontSize: '0.85rem', marginBottom: '5px' }}>
                Initial buy: <span style={customStyles.gradientText}>{initialBuyAmount ? parseFloat(initialBuyAmount).toFixed(6) : '0'}</span> EDU
              </p>
              <p style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                Total cost: <span style={customStyles.gradientText}>
                  {(0.0001 + (initialBuyAmount ? parseFloat(initialBuyAmount) : 0)).toFixed(6)}
                </span> EDU
              </p>
            </div>
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

  // Update the handleFinalSubmit function
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
      const FACTORY_ADDRESS = CONTRACT_ADDRESS;
      console.log("Using factory address:", FACTORY_ADDRESS);
      
      try {
        // Verify provider and access to signer
        if (!provider) {
          throw new Error("Provider not available. Please make sure your wallet is connected.");
        }
        
        const signer = await provider.getSigner();
        console.log("Signer address:", await signer.getAddress());

        // Create contract instance
        const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
        console.log("Contract instance created");

        // Verify contract is deployed
        const code = await provider.getCode(FACTORY_ADDRESS);
        console.log("Contract code:", code);
        if (code === "0x") {
          throw new Error("Contract not deployed at this address");
        }
        
        // Check if we need to do an initial buy
        const hasInitialBuy = initialBuyAmount && parseFloat(initialBuyAmount) > 0;
        
        // Show processing status
        setSuccessMessage("Processing your request...");
        
        // Format and limit social links
        const socialLinks = JSON.stringify({
          telegram: (telegram || "").trim().slice(0, 64),
          website: (website || "").trim().slice(0, 64),
          twitter: (twitter || "").trim().slice(0, 64)
        }).slice(0, 256);

        // Prepare token parameters with size limits
        const tokenParams = {
          name: name.trim().slice(0, 32),
          symbol: ticker.trim().slice(0, 8),
          description: description.trim().slice(0, 256),
          image: uploadedImageUrl.slice(0, 256),
          social: socialLinks
        };

        // Get creation fee from contract
        const creationFee = await factory.CREATION_FEE();
        const initialBuy = hasInitialBuy ? ethers.parseEther(initialBuyAmount) : ethers.parseEther("0");
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
          to: FACTORY_ADDRESS,
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
          to: FACTORY_ADDRESS,
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
          setSuccessMessage(`🎉 Token created successfully! Address: ${tokenAddress}`);
          setShowBuyModal(false);
        } else {
          setSuccessMessage(`Transaction successful but could not extract token address. TX: ${tx.hash}`);
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
        setIsLoading(false);
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