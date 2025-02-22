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
        <>
            <header className="header-container">
                <div className="header-content">
                    {/* Logo */}
                    <Link href="/" className="logo-link">
                        <Image
                            src="/hype.png"
                            alt="Hype.mba Logo"
                            width={50}
                            height={50}
                            className="logo"
                        />
                        <span className="logo-text">Hype.mba</span>
                    </Link>

                    {/* Navigation Menu */}
                    <nav className="nav-menu">
                        <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
                            Home
                        </Link>
                        <Link href="/board" className={`nav-link ${pathname === '/board' ? 'active' : ''}`}>
                            Board
                        </Link>
                        <button 
                            onClick={() => setShowHowItWorks(true)} 
                            className="nav-link"
                        >
                            How it Works
                        </button>
                        <Link href="/create" className={`nav-link ${pathname === '/create' ? 'active' : ''}`}>
                            Create
                        </Link>
                    </nav>

                    {/* Connect Wallet Button */}
                    <div className="wallet-section">
                        {connected ? (
                            <button onClick={disconnectWallet} className="wallet-btn connected">
                                {account.slice(0, 6)}...{account.slice(-4)}
                            </button>
                        ) : (
                            <button onClick={connectWallet} className="wallet-btn">
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}
        </>
    );
};

export default Header;