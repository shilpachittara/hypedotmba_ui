"use client";

import { useWallet } from "@/context/WalletContext";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import HowItWorksModal from "./HowItWorksModal";
import "../styles/Header.css";

const Header = () => {
    const { connected, account, connectWallet, disconnectWallet } = useWallet();
    const pathname = usePathname();
    const [showHowItWorks, setShowHowItWorks] = useState(false);

    return (
        <header className="header-wrapper">
            <div className="header-container">
                {/* Logo */}
                <Link href="/" className="logo-link">
                    <div className="logo-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#00F6AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="#00F6AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="#00F6AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <span className="logo-text">Hype.mba</span>
                </Link>

                {/* Navigation Menu */}
                <nav className="nav-menu">
                    <div className="nav-links">
                        <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
                            Home
                        </Link>
                        <Link href="/board" className={`nav-link ${pathname === '/board' ? 'active' : ''}`}>
                            Board
                        </Link>
                        <Link href="/create" className={`nav-link ${pathname === '/create' ? 'active' : ''}`}>
                            Create
                        </Link>
                        <button 
                            onClick={() => setShowHowItWorks(true)} 
                            className={`nav-link ${pathname === '/faq' ? 'active' : ''}`}
                        >
                            FAQ
                        </button>
                    </div>
                </nav>

                {/* Book Now Button */}
                <div className="action-section">
                    {connected ? (
                        <button onClick={disconnectWallet} className="book-now-btn connected">
                            {account.slice(0, 6)}...{account.slice(-4)}
                        </button>
                    ) : (
                        <button onClick={connectWallet} className="book-now-btn">
                            Connect Wallet
                        </button>
                    )}
                </div>
            </div>

            {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}
        </header>
    );
};

export default Header;