"use client";

import HowItWorksModal from "./HowItWorksModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram, faInstagram, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { ethers } from "ethers";
import "../styles/Header.css";
import { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";

const Header = () => {
    const { connected, account, connectWallet, disconnectWallet } = useWallet();

    return (
        <header className="header">
            <nav className="nav-left">
                <div className="nav-top-row">
                    <HowItWorksModal />
                    <button className="advanced-btn">[advanced]</button>
                </div>

                <div className="nav-bottom-row">
                    <button className="support-btn">[support]</button>

                    {/* Social Media Icons */}
                    <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="icon-link">
                        <FontAwesomeIcon icon={faTelegram} />
                    </a>
                    <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="icon-link">
                        <FontAwesomeIcon icon={faXTwitter} />  {/* Updated to X icon */}
                    </a>
                    <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="icon-link">
                        <FontAwesomeIcon icon={faInstagram} />
                    </a>
                </div>
            </nav>

            {/*
    <div className="nav-center">
      <button className="highlight-btn">💊 8T9Ste bought 0.0500 SOL of MICHAEL</button>
      <button className="highlight-btn secondary">🏆 6hsDZ8 created #1 🥇 on 01/10/25</button>
    </div>
*/}
            <div className="nav-right">
                {connected ? (
                    <button onClick={disconnectWallet} className="wallet-btn">
                        [{account.slice(0, 6)}...{account.slice(-4)}] 🔌
                    </button>
                ) : (
                    <button onClick={connectWallet} className="wallet-btn">
                        [connect wallet]
                    </button>
                )}
            </div>
        </header>

    );
};

export default Header;