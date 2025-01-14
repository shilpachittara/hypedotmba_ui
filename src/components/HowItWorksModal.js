"use client";

import { useState } from "react";
import "../styles/HowItWorksModal.css"; // Import updated styles

const HowItWorksModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      {/* Open Modal Button */}
      <button onClick={openModal} className="how-it-works-btn">
        [how it works]
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">How It Works</h2>
            <p className="modal-description">
              <strong>Hype.mba</strong> prevents rugs by ensuring all created tokens are safe. 
              Every coin on the platform is a <span className="highlight">fair launch</span> with 
              <span className="highlight"> no presale</span> and 
              <span className="highlight"> no team allocation</span>.
            </p>

            <ol className="modal-steps">
              <li>Step 1: Pick a coin that you like.</li>
              <li>Step 2: Buy the coin on the bonding curve.</li>
              <li>Step 3: Sell anytime to lock in profits or losses.</li>
              <li>Step 4: Reach $100k market cap to trigger liquidity.</li>
              <li>Step 5: $17k liquidity added to Raydium and burned.</li>
            </ol>

            <p className="modal-note">⚠️ A 1% fee applies to all trades on Hype.mba.</p>

            <button onClick={closeModal} className="ready-btn">
              [I'm ready to pump!]
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default HowItWorksModal;