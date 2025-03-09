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
      { "internalType": "string", "name": "twitter", "type": "string" },
      { "internalType": "string", "name": "telegram", "type": "string" },
      { "internalType": "string", "name": "website", "type": "string" }
    ],
    "name": "createToken",
    "outputs": [],
    "stateMutability": "nonpayable",
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

      const signer = await provider.getSigner();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.createToken(name, ticker, description, imageUrl, twitter, telegram, website);
      await tx.wait();

      setSuccessMessage("🎉 Token Created Successfully!");
    } catch (error) {
      console.error("Error creating token:", error);
      setErrorMessage("❌ Token creation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle smooth scroll to bottom content
  const handleShowMore = () => {
    setShowMore(!showMore);
    
    // Wait for expansion animation to complete
    setTimeout(() => {
      if (!showMore && bottomSectionRef.current) {
        bottomSectionRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 300); // Timing aligned with expansion animation
  };

  return (
    <div>
      <Header />
      <div className="page-container">
        <button className="go-back" onClick={() => window.history.back()}>
          [go back]
        </button>

        <form className="create-form" onSubmit={handleSubmit}>
          <div className="form-content">
            <div className="form-sections">
              <h1 className="form-title">Create Your Token</h1>
              
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
                        placeholder="e.g. BTC"
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
                        <input type="text" placeholder="https://t.me/..." />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Website</label>
                      <div className="input-wrapper">
                        <input type="text" placeholder="https://..." />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Twitter</label>
                      <div className="input-wrapper">
                        <input type="text" placeholder="https://twitter.com/..." />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bottom-section" ref={bottomSectionRef}>
                  <button type="submit" className="create-btn">
                    Create Token
                  </button>
                  <p className="info-text">
                    When your coin completes its bonding curve you receive <span>5 EDU</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;