"use client";

import "../styles/HowItWorksModal.css";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HowItWorksModal = ({ onClose }) => {
  const router = useRouter();
  
  useEffect(() => {
    // Add body class to prevent scrolling when modal is open
    document.body.classList.add('modal-open');
    
    // Cleanup function
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);
  
  // Handle navigation to create screen
  const handleLaunch = () => {
    onClose(); // Close the modal first
    router.push('/create'); // Navigate to create screen
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-glow"></div>
        
        <button className="modal-close-btn" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        
        <div className="modal-header">
          <h2 className="modal-title">How It <span className="gradient-text">Works</span></h2>
          <div className="title-decoration"></div>
        </div>
        
        <div className="modal-steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3 className="step-title">Create Your Token</h3>
              <p className="step-description">Choose your name, symbol, and supply, then deploy in one click.</p>
            </div>
            <div className="step-decoration">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M5 5L35 35M5 35L35 5" stroke="rgba(0, 246, 170, 0.1)" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          
          <div className="step-connector">
            <div className="connector-line"></div>
            <div className="connector-dot"></div>
          </div>
          
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3 className="step-title">Start Trading Instantly</h3>
              <p className="step-description">Your token is immediately listed with automatic liquidity.</p>
            </div>
            <div className="step-decoration">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M5 5L35 35M5 35L35 5" stroke="rgba(0, 246, 170, 0.1)" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          
          <div className="step-connector">
            <div className="connector-line"></div>
            <div className="connector-dot"></div>
          </div>
          
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3 className="step-title">Amplify the Hype</h3>
              <p className="step-description">Share with your community, build excitement, and watch your token take flight!</p>
            </div>
            <div className="step-decoration">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M5 5L35 35M5 35L35 5" stroke="rgba(0, 246, 170, 0.1)" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
        
        <button onClick={handleLaunch} className="launch-btn">
          <span className="btn-text">I'm ready to launch!</span>
          <div className="btn-glow"></div>
          <span className="btn-icon">🚀</span>
        </button>
      </div>
    </div>
  );
};

export default HowItWorksModal;