import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategoryImages, getImagePath } from '../../data/galleryData';
import './HomePage.css';

const HomePage = () => {
  // State per gestire indice immagine corrente di ogni categoria
  const [carouselIndexes, setCarouselIndexes] = useState({
    incisioni: 0,
    torte: 0,
    eventi: 0
  });

  // Carica immagini per ogni categoria
  const [categoryImages, setCategoryImages] = useState({
    incisioni: [],
    torte: [],
    eventi: []
  });

  useEffect(() => {
    // Carica immagini per ogni categoria
    const loadImages = () => {
      const incisioniImages = getCategoryImages('incisioni').map(img => ({
        ...img,
        fullPath: getImagePath(img.category, img.src)
      }));
      
      const torteImages = getCategoryImages('torte').map(img => ({
        ...img,
        fullPath: getImagePath(img.category, img.src)
      }));
      
      const eventiImages = getCategoryImages('eventi').map(img => ({
        ...img,
        fullPath: getImagePath(img.category, img.src)
      }));

      setCategoryImages({
        incisioni: incisioniImages,
        torte: torteImages,
        eventi: eventiImages
      });
    };

    loadImages();
  }, []);

  // Carosello automatico (cambia immagine ogni 4 secondi)
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndexes(prev => ({
        incisioni: (prev.incisioni + 1) % (categoryImages.incisioni.length || 1),
        torte: (prev.torte + 1) % (categoryImages.torte.length || 1),
        eventi: (prev.eventi + 1) % (categoryImages.eventi.length || 1)
      }));
    }, 3000); // ← CAMBIA QUI: millisecondi tra cambio immagine automatico

    return () => clearInterval(interval);
  }, [categoryImages]);

  // ✅ Funzioni per navigazione manuale
  const handlePrevImage = (categoryId, e) => {
    e.preventDefault(); // Previeni il click sul link
    e.stopPropagation();
    
    setCarouselIndexes(prev => {
      const currentIndex = prev[categoryId];
      const totalImages = categoryImages[categoryId].length;
      const newIndex = currentIndex === 0 ? totalImages - 1 : currentIndex - 1;
      
      return { ...prev, [categoryId]: newIndex };
    });
  };

  const handleNextImage = (categoryId, e) => {
    e.preventDefault(); // Previeni il click sul link
    e.stopPropagation();
    
    setCarouselIndexes(prev => {
      const currentIndex = prev[categoryId];
      const totalImages = categoryImages[categoryId].length;
      const newIndex = (currentIndex + 1) % totalImages;
      
      return { ...prev, [categoryId]: newIndex };
    });
  };

  // Dati delle card con link
  const categories = [
    {
      id: 'incisioni',
      icon: '🔥',
      title: 'Incisioni su Legno',
      description: 'Opere personalizzate realizzate a mano con pirografo',
      link: '/incisioni',
      images: categoryImages.incisioni
    },
    {
      id: 'torte',
      icon: '🎂',
      title: 'Torte Decorative',
      description: 'Torte scenografiche per eventi speciali',
      link: '/torte',
      images: categoryImages.torte
    },
    {
      id: 'eventi',
      icon: '🎉',
      title: 'Allestimento Eventi',
      description: 'Decori personalizzati per le tue celebrazioni',
      link: '/eventi',
      images: categoryImages.eventi
    }
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <img src="/logo.png" alt="ValiryArt Logo" className="hero-logo" />
          <p className="hero-subtitle">Creazioni Artigianali Uniche</p>
          <p className="hero-description">
            Trasforma le tue idee in opere d'arte. Incisioni su legno, torte decorative e allestimenti per eventi personalizzati.
          </p>
        </div>
      </section>
      
      {/* Categories Preview con Caroselli */}
      <section className="categories-preview">
        <div className="container">
          <h2 className="section-title">I Nostri Servizi</h2>
          
          <div className="categories-grid">
            {categories.map((category) => {
              const currentImage = category.images[carouselIndexes[category.id]];
              const backgroundImage = currentImage?.fullPath || '';

              return (
                <Link 
                  to={category.link} 
                  key={category.id}
                  className="category-card-link"
                >
                  <div 
                    className="category-card"
                    style={{
                      backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none'
                    }}
                  >
                    {/* Overlay sfocato per leggibilità */}
                    <div className="category-overlay"></div>
                    
                    {/* Contenuto */}
                    <div className="category-content">
                      <span className="category-icon">{category.icon}</span>
                      <h3>{category.title}</h3>
                      <p>{category.description}</p>
                    </div>

                    {/* ✅ Frecce navigazione manuale */}
                    {category.images.length > 1 && (
                      <>
                        <button 
                          className="carousel-arrow carousel-arrow-left"
                          onClick={(e) => handlePrevImage(category.id, e)}
                          aria-label="Immagine precedente"
                        >
                          ‹
                        </button>
                        <button 
                          className="carousel-arrow carousel-arrow-right"
                          onClick={(e) => handleNextImage(category.id, e)}
                          aria-label="Immagine successiva"
                        >
                          ›
                        </button>
                      </>
                    )}

                    {/* Indicatori carosello */}
                    {category.images.length > 0 && (
                      <div className="carousel-indicators">
                        {category.images.map((_, index) => (
                          <span 
                            key={index}
                            className={`indicator ${index === carouselIndexes[category.id] ? 'active' : ''}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* CTA Galleria */}
          <div className="gallery-cta-section">
            <p className="gallery-cta-text">
              Sfoglia la <Link to="/galleria" className="gallery-link">Galleria</Link> per lasciarti ispirare
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;