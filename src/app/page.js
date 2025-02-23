"use client";

import { useEffect } from 'react';
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

    const words = ['Create', 'Grow', 'Launch'];
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
              <h1 className="glitch" data-text="Launch Your Token in Seconds">
                Launch Your Token in Seconds
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
              <Link href="/create-token" className="neon-button">
                <span className="button-text">Start Now</span>
                <div className="wave-container">
                  <div className="wave"></div>
                </div>
              </Link>
              <button onClick={() => setShowHowItWorks(true)} className="learn-more-button">
                Learn More
              </button>
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
          <h3>Hype.mba empowers creators and communities to easily <span className="gradient-text"> launch their tokens, gather liquidity, and unlock value.</span> Once  <span className="gradient-text">liquidity reaches the threshold</span>, your token is automatically launched on the <span className="gradient-text">Sailfish DEX.</span></h3>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-content">
                <div className="feature-header">
                  <div>
                    <h3 className="feature-title">Instant Launch</h3>
                    <p className="feature-description">Deploy your token in seconds without coding</p>
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
                    <h3 className="feature-title">Auto Liquidity</h3>
                    <p className="feature-description">Liquidity added at $100k market cap</p>
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
                    <h3 className="feature-title">Secure & Verified</h3>
                    <p className="feature-description">Built on reliable smart contracts</p>
                  </div>
                  <div className="feature-icon-wrapper">
                    <span className="feature-icon">🔒</span>
                  </div>
                </div>
                <div className="feature-stats">
                  <span className="stat">100%</span>
                  <span className="stat-label">Safe Launch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content fade-in-scroll">
          <div className="futuristic-heading">
            <div className="glitch-wrapper">
              <h2 className="glitch" data-text="Ready to launch your own token?">
                Ready to launch your own token?
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
              <span>Start Now</span>
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