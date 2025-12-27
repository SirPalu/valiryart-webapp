// frontend/src/pages/public/GalleryPage.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Lightbox from '../../components/gallery/Lightbox';
import { getCategoryImages, getImagePath } from '../../data/galleryData';
import Button from '../../components/common/Button';
import './GalleryPage.css';

const GalleryPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [images, setImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, [activeCategory]);

  const loadImages = () => {
    setLoading(true);
    const categoryImages = getCategoryImages(activeCategory === 'all' ? null : activeCategory);
    
    const imagesWithPaths = categoryImages.map(img => ({
      ...img,
      fullPath: getImagePath(img.category, img.src)
    }));
    
    setImages(imagesWithPaths);
    
    // Simula caricamento per animazione smooth
    setTimeout(() => setLoading(false), 300);
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextImage = (jump = 1) => {
    setLightboxIndex((prev) => {
      const newIndex = prev + jump;
      if (newIndex >= images.length) return images.length - 1;
      if (newIndex < 0) return 0;
      return newIndex;
    });
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const categories = [
    { id: 'all', label: 'Tutte le Opere', icon: '🎨', count: 68 },
    { id: 'incisioni', label: 'Incisioni su Legno', icon: '🪵', count: 21 },
    { id: 'torte', label: 'Torte Decorative', icon: '🎂', count: 25 },
    { id: 'eventi', label: 'Allestimento Eventi', icon: '🎉', count: 26 }
  ];

  return (
    <div className="gallery-page">
      {/* Hero Section */}
      <div className="gallery-hero">
        <div className="hero-content">
          <h1 className="hero-title">Galleria ValiryArt</h1>
          <p className="hero-subtitle">
            Esplora le nostre creazioni uniche e lasciati ispirare per il tuo prossimo progetto
          </p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="gallery-filters">
        <div className="filters-container">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="filter-icon">{cat.icon}</span>
              <span className="filter-label">{cat.label}</span>
              <span className="filter-count">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="gallery-loading">
          <div className="spinner"></div>
          <p>Caricamento opere...</p>
        </div>
      ) : (
        <>
          <div className="gallery-info">
            <p className="results-text">
              Mostrando <strong>{images.length}</strong> opere
              {activeCategory !== 'all' && (
                <> di <strong>{categories.find(c => c.id === activeCategory)?.label}</strong></>
              )}
            </p>
          </div>

          <div className="gallery-grid">
            {images.map((image, index) => (
              <div
                key={`${image.category}-${image.src}`}
                className="gallery-item"
                onClick={() => openLightbox(index)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="gallery-item-inner">
                  <img
                    src={image.fullPath}
                    alt={`${image.label}`}
                    loading="lazy"
                    className="gallery-image"
                  />
                  <div className="gallery-overlay">
                    <span className="overlay-icon">🔍</span>
                    <span className="overlay-category">{image.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CTA Section */}
      <div className="gallery-cta">
        <div className="cta-content">
          <h2>Ti è piaciuto quello che hai visto?</h2>
          <p>Richiedi la tua creazione personalizzata e porta a casa un pezzo unico di arte</p>
          <div className="cta-buttons">
            <Link to="/richiesta">
              <Button variant="primary" size="lg">
                ✨ Richiedi il Tuo Progetto
              </Button>
            </Link>
            <Link to="/chi-sono">
              <Button variant="ghost" size="lg">
                Scopri di Più →
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
    </div>
  );
};

export default GalleryPage;