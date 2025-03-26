"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import "../styles/Home.css"; // Changed to global CSS
import Header from "@/components/Header";
import "./page.css";  // Add this import

export default function Home() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in-scroll').forEach((element) => {
      observer.observe(element);
    });

    const cards = document.querySelectorAll('.feature-card');
    
    const handleMouseMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / card.clientWidth) * 100;
      const y = ((e.clientY - rect.top) / card.clientHeight) * 100;
      
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    };

    cards.forEach(card => {
      card.addEventListener('mousemove', handleMouseMove);
    });

    const words = [ 'Launch', 'Trade', 'Hype'];
    let wordIndex = 0;
    let charIndex = 0;
    const wordElement = document.querySelector('.word-switch');
    const letterDelay = 170; // Increased from 130 to 170ms (30% slower)
    const wordDelay = 650;   // Increased from 500 to 650ms (30% slower)

    function typeWord() {
      const currentWord = words[wordIndex];
      
      if (charIndex < currentWord.length) {
        wordElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        setTimeout(typeWord, letterDelay);
      } else {
        setTimeout(() => {
          charIndex = 0;
          wordIndex = (wordIndex + 1) % words.length;
          wordElement.textContent = '';
          setTimeout(typeWord, letterDelay);
        }, wordDelay);
      }
    }

    if (wordElement) {
      wordElement.textContent = '';
      typeWord();
    }

    return () => {
      observer.disconnect();
      cards.forEach(card => {
        card.removeEventListener('mousemove', handleMouseMove);
      });
      if (wordElement) {
        wordElement.textContent = '';
      }
    };
  }, []);

  return (
    <div className="main-container">
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

      {/* Background Pattern */}
      <div className="background-patterns">
        {[...Array(24)].map((_, i) => (
          <div key={i} className={`hexagon hex-${i}`}>
            <div className="hexagon-inner" />
          </div>
        ))}
      </div>

      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content fade-in">
          <div className="hero-text">
            <div className="glitch-wrapper hero-glitch">
          <h1 className="glitch" data-text="Launch Trade & Hype Your Token in Seconds!">
              Launch Trade & Hype Your Token in Seconds!
              </h1>
            </div>
            <p className="hero-subtitle">
              <span className="animated-sentence">
                <span className="word-container">
                  <span className="word-switch"></span>
                </span>
                <span className="static-part">your token effortlessly with Hype.mba</span>
              </span>
            </p>
            <div className="button-container fade-up">
              <Link href="/create" className="neon-button">
                <span className="button-text">Launch Now</span>
                <div className="wave-container">
                  <div className="wave"></div>
                </div>
              </Link>
              <Link href="/board" className="learn-more-button">
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="floating-elements">
          <div className="hex-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`hex-element hex-${i}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="glass-container fade-in-scroll">
          <h2 className="section-title">
            Why <span className="gradient-text">Hype.mba</span>?
          </h2>
          <h3>Hype.MBA is the ultimate platform where anyone can <span className="gradient-text">launch tokens instantly, trade securely, and build vibrant communities.</span> No private allocations, no insiders—just <span className="gradient-text">fair launches accessible to everyone.</span> You can easily launch your tokens, gather liquidity, and unlock value. Once <span className="gradient-text">liquidity reaches the threshold</span>, your token is automatically launched on the <span className="gradient-text">Sailfish DEX.</span></h3>
          
          <div className="features-grid four-card-layout">
            <div className="feature-card">
              <div className="feature-content">
                <div className="feature-header">
                  <div>
                    <h3 className="feature-title">Instant Launches</h3>
                    <p className="feature-description">Deploy your token effortlessly in seconds—no coding required!</p>
                  </div>
                  <div className="feature-icon-wrapper">
                    <span className="feature-icon">🚀</span>
                  </div>
                </div>
                <div className="feature-stats">
                  <span className="stat">24h</span>
                  <span className="stat-label">•</span>
                  <span className="stat">7d</span>
                </div>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-content">
                <div className="feature-header">
                  <div>
                    <h3 className="feature-title">Fair Distribution</h3>
                    <p className="feature-description">No pre-minting, no VCs. Tokens are 100% community-owned.</p>
                  </div>
                  <div className="feature-icon-wrapper">
                    <span className="feature-icon">💧</span>
                  </div>
                </div>
                <div className="feature-stats">
                  <span className="stat">$17k</span>
                  <span className="stat-label">Liquidity Added</span>
                </div>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-content">
                <div className="feature-header">
                  <div>
                    <h3 className="feature-title">Seamless Trading</h3>
                    <p className="feature-description">Immediate on-chain liquidity, allowing instant buying and selling.</p>
                  </div>
                  <div className="feature-icon-wrapper">
                    <span className="feature-icon">🔒</span>
                  </div>
                </div>
                <div className="feature-stats">
                  <span className="stat">100%</span>
                  <span className="stat-label">Community Driven</span>
                </div>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-content">
                <div className="feature-header">
                  <div>
                    <h3 className="feature-title">Community Driven</h3>
                    <p className="feature-description">Grow your token through transparent and organic hype.</p>
                  </div>
                  <div className="feature-icon-wrapper">
                    <span className="feature-icon">🌐</span>
                  </div>
                </div>
                <div className="feature-stats">
                  <span className="stat">10k+</span>
                  <span className="stat-label">Active Users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section className="how-it-works-section">
        <div className="how-it-works-container">
          <div className="section-header-enhanced">
            <h2 className="section-heading-enhanced">
              How It <span className="accent-text-enhanced">Works</span>
            </h2>
            <div className="header-decoration">
              <div className="header-line"></div>
              <div className="header-dot"></div>
              <div className="header-line"></div>
            </div>
          </div>
          
          <div className="steps-container-enhanced">
            <div className="step-card-enhanced">
              <div className="step-marker-enhanced">
                <div className="step-number-enhanced">1</div>
                <div className="marker-pulse-enhanced"></div>
              </div>
              <div className="step-details-enhanced">
                <div className="step-icon-wrapper">
                  <div className="step-icon-enhanced">🚀</div>
                  <div className="icon-highlight"></div>
                </div>
                <h3 className="step-title-enhanced">Create Your Token</h3>
                <p className="step-description-enhanced">Choose your <strong>name</strong>, <strong>symbol</strong>, and <strong>supply</strong>, then deploy in one click.</p>
              </div>
              <div className="card-glow-enhanced"></div>
              <div className="card-decoration">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 10L50 50" stroke="rgba(0, 246, 170, 0.1)" strokeWidth="2"/>
                  <path d="M10 50L50 10" stroke="rgba(0, 246, 170, 0.1)" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            
            <div className="steps-connector-enhanced">
              <div className="connector-line-enhanced"></div>
              <div className="connector-dot-enhanced"></div>
            </div>
            
            <div className="step-card-enhanced">
              <div className="step-marker-enhanced">
                <div className="step-number-enhanced">2</div>
                <div className="marker-pulse-enhanced"></div>
              </div>
              <div className="step-details-enhanced">
                <div className="step-icon-wrapper">
                  <div className="step-icon-enhanced">💱</div>
                  <div className="icon-highlight"></div>
                </div>
                <h3 className="step-title-enhanced">Start Trading Instantly</h3>
                <p className="step-description-enhanced">Your token is <strong>immediately listed</strong> with <strong>automatic liquidity</strong>.</p>
              </div>
              <div className="card-glow-enhanced"></div>
              <div className="card-decoration">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 10L50 50" stroke="rgba(0, 246, 170, 0.1)" strokeWidth="2"/>
                  <path d="M10 50L50 10" stroke="rgba(0, 246, 170, 0.1)" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            
            <div className="steps-connector-enhanced">
              <div className="connector-line-enhanced"></div>
              <div className="connector-dot-enhanced"></div>
            </div>
            
            <div className="step-card-enhanced">
              <div className="step-marker-enhanced">
                <div className="step-number-enhanced">3</div>
                <div className="marker-pulse-enhanced"></div>
              </div>
              <div className="step-details-enhanced">
                <div className="step-icon-wrapper">
                  <div className="step-icon-enhanced">📈</div>
                  <div className="icon-highlight"></div>
                </div>
                <h3 className="step-title-enhanced">Amplify the Hype</h3>
                <p className="step-description-enhanced">Share with your <strong>community</strong>, build <strong>excitement</strong>, and watch your token take flight!</p>
              </div>
              <div className="card-glow-enhanced"></div>
              <div className="card-decoration">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 10L50 50" stroke="rgba(0, 246, 170, 0.1)" strokeWidth="2"/>
                  <path d="M10 50L50 10" stroke="rgba(0, 246, 170, 0.1)" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
           {/* Built for Memes, Degens & Innovators Section */}
           <section className="audience-section">
        <div className="audience-container">
          <div className="audience-header">
            <h2 className="audience-heading">
              Built for <span className="highlight-text">Memes, Degens & Innovators</span>
            </h2>
          </div>
          
          <div className="audience-description">
            <p>Whether you're launching the next big meme coin, raising funds, or exploring new ideas, Hype.MBA provides a level playing field for everyone to succeed.</p>
          </div>
          
          <div className="audience-tiles">
            <div className="audience-tile">
              <div className="tile-icon-container">
                <span className="tile-icon">🐸</span>
              </div>
              <h3 className="tile-title">Meme Lords</h3>
              <div className="tile-line"></div>
              <p className="tile-desc">Turn viral content into valuable tokens</p>
            </div>
            
            <div className="audience-tile">
              <div className="tile-icon-container">
                <span className="tile-icon">🔥</span>
              </div>
              <h3 className="tile-title">Degens</h3>
              <div className="tile-line"></div>
              <p className="tile-desc">Trade fast with maximum opportunities</p>
            </div>
            
            <div className="audience-tile">
              <div className="tile-icon-container">
                <span className="tile-icon">💡</span>
              </div>
              <h3 className="tile-title">Innovators</h3>
              <div className="tile-line"></div>
              <p className="tile-desc">Test ideas and build engaged communities</p>
            </div>
            
            <div className="audience-tile">
              <div className="tile-icon-container">
                <span className="tile-icon">🌐</span>
              </div>
              <h3 className="tile-title">Creators</h3>
              <div className="tile-line"></div>
              <p className="tile-desc">Monetize your brand and following</p>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content fade-in-scroll">
          <div className="futuristic-heading">
            <div className="glitch-wrapper">
              <h2 className="glitch" data-text="Ready to Go Viral?">
              Ready to Go Viral?
              </h2>
            </div>
            <div className="cyber-dots">
              {[...Array(3)].map((_, i) => (
                <span key={i} className="dot"></span>
              ))}
            </div>
          </div>
          <div className="button-container">
            <button className="neon-button">
            <Link href="/create" className="cta-button">

              <span> Launch Your Token Now!</span>
              </Link>
              <div className="wave-container">
                <div className="wave"></div>
              </div>
            </button>
          </div>
        </div>
      </section>

 
    </div>
  );
}