// frontend/src/components/gallery/DesignGalleryModal.js

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import './DesignGalleryModal.css';

// 📂 Configurazione categorie e file (basata su ls output)
const DESIGN_CATEGORIES = {
  Animali: { label: '🦁 Animali', count: 86, icon: '🦁' },
  Anime: { label: '🎭 Anime', count: 44, icon: '🎭' },
  Disney: { label: '🏰 Disney', count: 24, icon: '🏰' },
  Fantasy: { label: '🐉 Fantasy', count: 45, icon: '🐉' },
  Film: { label: '🎬 Film', count: 23, icon: '🎬' },
  Musica: { label: '🎵 Musica', count: 18, icon: '🎵' },
  Varie: { label: '✨ Varie', count: 24, icon: '✨' },
  Videogiochi: { label: '🎮 Videogiochi', count: 12, icon: '🎮' }
};

const DesignGalleryModal = ({ isOpen, onClose, onSelectDesign }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // 🎨 Genera lista completa immagini
  const allDesigns = useMemo(() => {
    const designs = [];
    
    Object.keys(DESIGN_CATEGORIES).forEach(category => {
      const count = DESIGN_CATEGORIES[category].count;
      
      for (let i = 1; i <= count; i++) {
        designs.push({
          id: `${category}_${i}`,
          category,
          filename: `${category}_${i}.jpg`,
          path: `/sceltadisegni/${category}/${category}_${i}.jpg`,
          label: `${category} ${i}`
        });
      }
    });
    
    return designs;
  }, []);

  // 🔍 Filtra disegni
  const filteredDesigns = useMemo(() => {
    let filtered = allDesigns;

    // Filtra per categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(d => d.category === selectedCategory);
    }

    // Filtra per ricerca
    if (searchTerm.trim()) {
      filtered = filtered.filter(d => 
        d.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [allDesigns, selectedCategory, searchTerm]);

  // ✅ Apri lightbox
  const handleImageClick = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // ✅ Navigazione lightbox
  const handleLightboxPrev = useCallback(() => {
    setLightboxIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleLightboxNext = useCallback(() => {
    setLightboxIndex(prev => Math.min(filteredDesigns.length - 1, prev + 1));
  }, [filteredDesigns.length]);

  // ✅ Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyPress = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') handleLightboxPrev();
      if (e.key === 'ArrowRight') handleLightboxNext();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [lightboxOpen, handleLightboxPrev, handleLightboxNext]);

  // ✅ Selezione finale da lightbox
  const handleConfirmSelection = () => {
    const selectedDesign = filteredDesigns[lightboxIndex];
    onSelectDesign(selectedDesign);
    setLightboxOpen(false);
    onClose();
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSearchTerm('');
    setLightboxOpen(false);
  };

  if (!isOpen) return null;

  const currentDesign = filteredDesigns[lightboxIndex];

  return (
    <div className="design-gallery-overlay" onClick={onClose}>
      <div className="design-gallery-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>🎨 Scegli un Disegno</h2>
            <p>Clicca su un'immagine per visualizzarla a schermo intero</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Filters */}
        <div className="modal-filters">
          {/* Search */}
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Cerca per nome o categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="search-clear"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="category-filters">
            <button
              className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryClick('all')}
            >
              📁 Tutte ({allDesigns.length})
            </button>
            {Object.entries(DESIGN_CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                className={`filter-btn ${selectedCategory === key ? 'active' : ''}`}
                onClick={() => handleCategoryClick(key)}
              >
                {cat.icon} {key} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* ✅ GRIGLIA COMPATTA */}
        <div className="designs-grid-compact">
          {filteredDesigns.length > 0 ? (
            filteredDesigns.map((design, index) => (
              <div
                key={design.id}
                className="design-thumbnail"
                onClick={() => handleImageClick(index)}
              >
                <img 
                  src={design.path} 
                  alt={design.label}
                  loading="lazy"
                />
                <div className="thumbnail-label">{design.category}</div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>🔍 Nessun disegno trovato</p>
              <button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
                Reset Filtri
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="results-count">
            {filteredDesigns.length} {filteredDesigns.length === 1 ? 'disegno' : 'disegni'} disponibili
          </div>
        </div>
      </div>

      {/* ✅ LIGHTBOX INTERNO */}
      {lightboxOpen && currentDesign && (
        <div className="internal-lightbox" onClick={() => setLightboxOpen(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button 
              className="lightbox-close-btn" 
              onClick={() => setLightboxOpen(false)}
            >
              ✕
            </button>

            {/* Navigation Buttons */}
            <button 
              className="lightbox-nav-btn prev" 
              onClick={handleLightboxPrev}
              disabled={lightboxIndex === 0}
            >
              ‹
            </button>

            {/* Image */}
            <div className="lightbox-image-container">
              <img 
                src={currentDesign.path} 
                alt={currentDesign.label}
                className="lightbox-image"
              />
            </div>

            {/* Navigation Buttons */}
            <button 
              className="lightbox-nav-btn next" 
              onClick={handleLightboxNext}
              disabled={lightboxIndex === filteredDesigns.length - 1}
            >
              ›
            </button>

            {/* Info Bar */}
            <div className="lightbox-info-bar">
              <div className="lightbox-design-info">
                <span className="design-category-badge">{currentDesign.category}</span>
                <span className="design-filename">{currentDesign.filename}</span>
              </div>
              <div className="lightbox-counter">
                {lightboxIndex + 1} / {filteredDesigns.length}
              </div>
            </div>

            {/* Select Button */}
            <div className="lightbox-actions">
              <button 
                className="btn-select-design"
                onClick={handleConfirmSelection}
              >
                ✓ Seleziona Questa Immagine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignGalleryModal;