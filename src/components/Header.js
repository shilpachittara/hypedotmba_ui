"use client";

import HowItWorksModal from "./HowItWorksModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram, faInstagram, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { useWallet } from "@/context/WalletContext";
import Link from "next/link";
import Image from "next/image";
import "../styles/Header.css";

const Header = () => {
    const { connected, account, connectWallet, disconnectWallet } = useWallet();

    return (
        <header className="header">
            {/* Left Section: Logo & Navigation */}
            <div className="nav-left">
                {/* Logo */}
                <Link href="/">
                    <Image
                        src="/hype.png"
                        alt="Hype.mba Logo"
                        width={50}
                        height={50}
                        className="logo"
                    />
                </Link>

                {/* Navigation Links */}
                <div className="nav-links">
                    {/* Top Row */}
                    <div className="nav-top-row">
                        <HowItWorksModal />
                        <Link href="/board" className="nav-btn">[board]</Link>
                    </div>

                    {/* Bottom Row */}
                    <div className="nav-bottom-row">
                        <Link href="/create" className="nav-btn">[create]</Link>
                        <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="icon-link">
                            <FontAwesomeIcon icon={faTelegram} />
                        </a>
                        <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="icon-link">
                            <FontAwesomeIcon icon={faXTwitter} />
                        </a>
                        <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="icon-link">
                            <FontAwesomeIcon icon={faInstagram} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Wallet Button */}
            <div className="nav-right">
                {connected ? (
                    <button onClick={disconnectWallet} className="wallet-btn connected">
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