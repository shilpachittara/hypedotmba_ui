"use client";

import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import "../styles/Home.css"; // Changed to global CSS
import Header from "@/components/Header";

export default function Home() {
  return (
    <div>
      {/* SEO Meta Tags */}
      <Head>
        <title>Hype.mba | Launch Your Token Effortlessly</title>
        <meta
          name="description"
          content="Hype.mba is the fastest way to launch your token and generate liquidity. Create a token and launch it seamlessly on Sailfish DEX."
        />
        <meta name="keywords" content="Token Creation, Crypto, Memecoin, Sailfish DEX, Launchpad, Liquidity" />
        <meta name="author" content="Hype.mba" />
        <meta property="og:title" content="Hype.mba | Launch Your Token Effortlessly" />
        <meta
          property="og:description"
          content="Create and launch your token seamlessly on Sailfish DEX. Hype.mba simplifies token creation and liquidity generation."
        />
      </Head>

      {/* Logo */}
      <Header />

      {/* Hero Section */}
      <section className="hero">
        <h1 className="title">🚀 Launch Your Token in Seconds</h1>
        <p className="subtitle">Create, grow, and launch your token effortlessly with Hype.mba.</p>

        <div className="button-group">
          <Link href="/board">
            <button className="view-board-btn">📈 View Board</button>
          </Link>

          <Link href="/create">
            <button className="create-token-btn">🪙 Create Token</button>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <div className="about-content">
          <h2>✨ Why <span>Hype.mba</span>? ✨</h2>
          <p>
            <strong>Hype.mba</strong> empowers creators and communities to easily launch their tokens,
            <span className="highlight"> gather liquidity</span>, and
            <span className="highlight"> unlock value</span>.
            Once liquidity reaches the threshold, your token is <span className="highlight">automatically launched</span> on the Sailfish DEX.
          </p>
          <div className="features">
            <div className="feature-card">
              🚀 <h3>Instant Token Launch</h3>
              <p>Deploy your token in seconds without coding.</p>
            </div>
            <div className="feature-card">
              💧 <h3>Automated Liquidity</h3>
              <p>Liquidity is auto-added when the threshold is hit.</p>
            </div>
            <div className="feature-card">
              🔒 <h3>Secure & Decentralized</h3>
              <p>Powered by smart contracts on Sailfish DEX.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <h3>Ready to launch your own token?</h3>
        <Link href="/create">
          <button className="create-now-btn">🚀 Start Now</button>
        </Link>
      </section>
    </div>
  );
}