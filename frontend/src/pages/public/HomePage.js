import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEO/SEOHead';
import { getCategoryImages, getImagePath } from '../../data/galleryData';
import { reviewsAPI } from '../../services/api';
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

  // ✅ NUOVO: State per recensioni
  const [reviews, setReviews] = useState([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

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

  // ✅ NUOVO: Carica recensioni
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getPublic({ limit: 10 });
      setReviews(response.data.data.reviews);
    } catch (error) {
      console.error('Fetch reviews error:', error);
    }
  };

  // Carosello automatico (cambia immagine ogni 4 secondi)
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndexes(prev => ({
        incisioni: (prev.incisioni + 1) % (categoryImages.incisioni.length || 1),
        torte: (prev.torte + 1) % (categoryImages.torte.length || 1),
        eventi: (prev.eventi + 1) % (categoryImages.eventi.length || 1)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [categoryImages]);

  // ✅ Funzioni per navigazione manuale categorie
  const handlePrevImage = (categoryId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setCarouselIndexes(prev => {
      const currentIndex = prev[categoryId];
      const totalImages = categoryImages[categoryId].length;
      const newIndex = currentIndex === 0 ? totalImages - 1 : currentIndex - 1;
      
      return { ...prev, [categoryId]: newIndex };
    });
  };

  const handleNextImage = (categoryId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setCarouselIndexes(prev => {
      const currentIndex = prev[categoryId];
      const totalImages = categoryImages[categoryId].length;
      const newIndex = (currentIndex + 1) % totalImages;
      
      return { ...prev, [categoryId]: newIndex };
    });
  };

  // ✅ NUOVO: Funzioni navigazione recensioni
  const handlePrevReview = () => {
    setCurrentReviewIndex(prev => 
      prev === 0 ? reviews.length - 1 : prev - 1
    );
  };

  const handleNextReview = () => {
    setCurrentReviewIndex(prev => 
      (prev + 1) % reviews.length
    );
  };

  const getRatingStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
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
    <>
      {/* SEO Meta Tags */}
      <SEOHead
        title="ValiryArt - Creazioni Artigianali Personalizzate"
        description="Incisioni su legno a mano con pirografo, torte scenografiche e allestimenti eventi a Roma. Ogni opera è unica e pensata su misura per te."
        keywords="valiryart, incisioni legno, pirografia, pirografo, torte decorative, torte finte, torte scenografiche, allestimento eventi, regali artigianali, creazioni su misura, arco palloncini, allestimento, decori, decori feste"
        url="https://www.valiryart.com"
        image="/logo.png"
        type="website"
      />

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

                    {/* Frecce navigazione manuale */}
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

      {/* ✅ NUOVA SEZIONE RECENSIONI */}
      {reviews.length > 0 && (
        <section className="reviews-section">
          <div className="container">
            <h2 className="section-title">💬 Cosa Dicono i Nostri Clienti</h2>
            
            <div className="reviews-stats">
              <div className="stat-item">
                <span className="stat-value">⭐ {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}</span>
                <span className="stat-label">Media Valutazione</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{reviews.length}+</span>
                <span className="stat-label">Clienti Soddisfatti</span>
              </div>
            </div>

            <div className="reviews-carousel">
              <button 
                className="carousel-nav prev"
                onClick={handlePrevReview}
                aria-label="Recensione precedente"
              >
                ‹
              </button>

              <div className="review-card-main">
                {reviews[currentReviewIndex] && (
                  <>
                    <div className="review-rating-display">
                      {getRatingStars(reviews[currentReviewIndex].rating)}
                    </div>
                    
                    {reviews[currentReviewIndex].titolo && (
                      <h3 className="review-title-display">
                        "{reviews[currentReviewIndex].titolo}"
                      </h3>
                    )}
                    
                    <p className="review-text-display">
                      "{reviews[currentReviewIndex].testo}"
                    </p>
                    
                    {/* ✅ FOTO RECENSIONE */}
                    {reviews[currentReviewIndex].foto_url && (
                      <div className="review-photo-display">
                        <img 
                          src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${reviews[currentReviewIndex].foto_url}`}
                          alt="Foto recensione"
                        />
                      </div>
                    )}
                    
                    <div className="review-author">
                      <strong>{reviews[currentReviewIndex].user_nome} {reviews[currentReviewIndex].user_cognome}</strong>
                      <span className="review-category">
                        {reviews[currentReviewIndex].request_categoria}
                      </span>
                    </div>

                    {reviews[currentReviewIndex].risposta_admin && (
                      <div className="admin-reply-display">
                        <div className="reply-header">
                          <span className="reply-icon">💬</span>
                          <strong>Risposta di Valeria:</strong>
                        </div>
                        <p>{reviews[currentReviewIndex].risposta_admin}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <button 
                className="carousel-nav next"
                onClick={handleNextReview}
                aria-label="Recensione successiva"
              >
                ›
              </button>
            </div>

            <div className="carousel-dots">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentReviewIndex ? 'active' : ''}`}
                  onClick={() => setCurrentReviewIndex(index)}
                  aria-label={`Vai alla recensione ${index + 1}`}
                />
              ))}
            </div>

            <div className="reviews-cta">
              <p>Hai già lavorato con ValiryArt?</p>
              <Link to="/login" className="cta-link">
                Lascia la tua recensione →
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
   </> 
  );
};

export default HomePage;