import React from 'react';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">ValiryArt</h1>
          <p className="hero-subtitle">Creazioni Artigianali Uniche</p>
          <p className="hero-description">
            Trasforma le tue idee in opere d'arte. Incisioni su legno, torte decorative e allestimenti per eventi personalizzati.
          </p>
        </div>
      </section>
      
      <section className="categories-preview">
        <div className="container">
          <h2 className="section-title">I Nostri Servizi</h2>
          <div className="categories-grid">
            <div className="category-card">
              <h3>🪵 Incisioni su Legno</h3>
              <p>Opere personalizzate realizzate a mano con pirografo</p>
            </div>
            <div className="category-card">
              <h3>🎂 Torte Decorative</h3>
              <p>Torte scenografiche per eventi speciali</p>
            </div>
            <div className="category-card">
              <h3>🎉 Allestimento Eventi</h3>
              <p>Decori personalizzati per le tue celebrazioni</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;