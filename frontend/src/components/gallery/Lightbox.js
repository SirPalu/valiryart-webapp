// frontend/src/components/gallery/Lightbox.js

import React, { useEffect, useCallback } from 'react';
import './Lightbox.css';

const Lightbox = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyPress]);

  if (currentIndex === null || !images[currentIndex]) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>
        ✕
      </button>

      <button 
        className="lightbox-nav lightbox-prev" 
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        disabled={currentIndex === 0}
      >
        ‹
      </button>

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img 
          src={currentImage.fullPath} 
          alt={`${currentImage.label} ${currentIndex + 1}`}
          className="lightbox-image"
        />
        <div className="lightbox-info">
          <span className="lightbox-category">{currentImage.label}</span>
          <span className="lightbox-counter">{currentIndex + 1} / {images.length}</span>
        </div>
      </div>

      <button 
        className="lightbox-nav lightbox-next" 
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        disabled={currentIndex === images.length - 1}
      >
        ›
      </button>

      {/* Thumbnails Strip */}
      <div className="lightbox-thumbnails">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`lightbox-thumb ${idx === currentIndex ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onNext(idx - currentIndex);
            }}
          >
            <img src={img.fullPath} alt="" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lightbox;