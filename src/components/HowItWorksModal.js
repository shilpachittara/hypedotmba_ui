"use client";

import { useState } from "react";
import "../styles/HowItWorksModal.css";  // Import the styles

const HowItWorksModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      {/* Button to Open Modal */}
      <button onClick={openModal} className="how-it-works-btn">
        [how it works]
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">how it works</h2>
            <p className="modal-description">
              Hype.mba prevents rugs by making sure that all created tokens are safe.
              each coin on pump is a <span className="highlight">fair-launch</span> with 
              <span className="highlight"> no presale</span> and 
              <span className="highlight"> no team allocation</span>.
            </p>

            <ol className="modal-steps">
              <li>step 1: pick a coin that you like</li>
              <li>step 2: buy the coin on the bonding curve</li>
              <li>step 3: sell at any time to lock in your profits or losses</li>
              <li>step 4: when enough people buy, it reaches a market cap of $100k</li>
              <li>step 5: $17k of liquidity is deposited in Raydium and burned</li>
            </ol>

            <p className="modal-note">
              There is a 1% fee on all trades that happen on pump.
            </p>

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