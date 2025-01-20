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



  return (
    <div>
      <Header />
      <div className="page-container">
        <button className="go-back" onClick={() => window.history.back()}>
          [go back]
        </button>

        <form className="create-form" onSubmit={handleSubmit}>

          <label>name</label>
          <input
            type="text"
            placeholder="Token Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>ticker</label>
          <input
            type="text"
            placeholder="$"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            maxLength={5}
            required
          />

          <label>description</label>
          <textarea
            placeholder="Describe your token..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            required
          />

          <label>image or video</label>
          <div className="file-upload">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <FontAwesomeIcon icon={faUpload} size="3x" className="upload-icon" />
            <p>{file ? file.name : "drag and drop an image or video"}</p>
            <button type="button" onClick={handleSelectFileClick} className="select-file-btn">
              select file
            </button>
          </div>

          <p className="show-more" onClick={() => setShowMore(!showMore)}>
            {showMore ? "hide more options ↑" : "show more options ↓"}
          </p>

          {showMore && (
            <div className="more-options">
              <label>Telegram</label>
              <input type="text" placeholder="Telegram link" value={telegram} onChange={(e) => setTelegram(e.target.value)} />
              <label>Website</label>
              <input type="text" placeholder="Website link" value={website} onChange={(e) => setWebsite(e.target.value)} />
              <label>Twitter</label>
              <input type="text" placeholder="Twitter link" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
            </div>
          )}

          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          
          <button
            type="submit"
            className={`create-btn ${isFormValid ? "enabled" : "disabled"}`}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? "Creating..." : "create coin"}
          </button>

          <p className="info-text">
            when your coin completes its bonding curve you receive 5 EDU
          </p>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;