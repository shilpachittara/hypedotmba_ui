"use client";

import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { ethers } from "ethers";
import "../../styles/CreatePage.css";
import { useWallet } from "@/context/WalletContext";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "symbol", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "string", "name": "image", "type": "string" },
      { "internalType": "string", "name": "social", "type": "string" }
    ],
    "name": "createToken",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

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

  // ✅ Form Validation: All required fields must be filled, and wallet connected
  const isFormValid = name && ticker && description && file && account;

  // 📂 Handle file upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSelectFileClick = () => {
    fileInputRef.current.click();
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

  // 🚀 Handle token creation
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!connected) {
      setErrorMessage("Please connect your wallet.");
      return;
    }

    if (!isFormValid) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const imageUrl = await uploadImageToS3(file);
      
      // Combine social media links into a single JSON string
      const socialData = JSON.stringify({
        twitter: twitter || "",
        telegram: telegram || "",
        website: website || ""
      });

      const signer = await provider.getSigner();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Call the contract with the creation fee
      const creationFee = ethers.parseEther("0.001");
      const tx = await contract.createToken(
        name, 
        ticker, 
        description, 
        imageUrl, 
        socialData,
        { value: creationFee }
      );
      
      await tx.wait();

      setSuccessMessage("🎉 Token Created Successfully!");
    } catch (error) {
      console.error("Error creating token:", error);
      
      // Extract a more user-friendly error message
      let errorMsg = "Token creation failed";
      
      if (error.message) {
        // Check for user denied transaction
        if (error.message.includes("user denied") || error.message.includes("User denied")) {
          errorMsg = "Transaction was rejected in your wallet";
        } 
        // Check for insufficient funds
        else if (error.message.includes("insufficient funds")) {
          errorMsg = "Insufficient funds for transaction";
        }
        // Other common errors can be handled here
        else {
          // Extract just the main part of the error message without the technical details
          const simpleMessage = error.message.split('(')[0].trim();
          errorMsg = `${errorMsg}: ${simpleMessage}`;
        }
      }
      
      setErrorMessage(`❌ ${errorMsg}`);
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
      
      {/* Add this CSS to your component */}
      <style jsx>{`
        .create-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .create-btn.processing {
          background: linear-gradient(45deg, #2a2a2a, #3a3a3a);
          cursor: not-allowed;
          opacity: 0.9;
        }
        
        .processing-text {
          display: inline-block;
          margin-right: 5px;
        }
        
        .processing-dots {
          display: inline-block;
          animation: dotAnimation 1.5s infinite;
        }
        
        @keyframes dotAnimation {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        
        .status-message {
          margin-top: 15px;
          padding: 10px 15px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          font-size: 0.9rem;
          animation: fadeIn 0.3s ease-in-out;
          border: 1px solid;
        }
        
        .error-message {
          background: rgba(255, 0, 0, 0.1);
          border-color: rgba(255, 0, 0, 0.3);
          color: #ff5555;
        }
        
        .success-message {
          background: rgba(0, 255, 0, 0.1);
          border-color: rgba(0, 255, 0, 0.3);
          color: #55ff55;
        }
        
        .status-icon {
          margin-right: 10px;
          font-size: 1.2rem;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CreatePage;