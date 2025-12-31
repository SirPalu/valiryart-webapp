// frontend/src/pages/user/CreateRequestPage.js - HUB NAVIGAZIONE

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import './CreateRequestPage.css';

const CreateRequestPage = () => {
  const navigate = useNavigate();
  const [showAltroMessage, setShowAltroMessage] = useState(false);

  const categories = [
    {
      id: 'incisioni',
      icon: '🪵',
      title: 'Incisioni su Legno',
      description: 'Opere personalizzate realizzate a mano con pirografo',
      path: '/incisioni',
      color: 'wood'
    },
    {
      id: 'torte',
      icon: '🎂',
      title: 'Torte Decorative',
      description: 'Torte scenografiche per eventi speciali',
      path: '/torte',
      color: 'cake'
    },
    {
      id: 'eventi',
      icon: '🎉',
      title: 'Allestimento Eventi',
      description: 'Decori personalizzati per le tue celebrazioni',
      path: '/eventi',
      color: 'party'
    },
    {
      id: 'altro',
      icon: '💡',
      title: 'Altro',
      description: 'Hai un\'idea diversa? Parliamone!',
      action: 'contact',
      color: 'custom'
    }
  ];

  const handleCategoryClick = (category) => {
    if (category.action === 'contact') {
      setShowAltroMessage(true);
    } else {
      navigate(category.path);
    }
  };

  return (
    <div className="create-request-page">
      <div className="page-header">
        <h1>✨ Cosa Vuoi Realizzare?</h1>
        <p>Scegli la categoria che ti interessa per iniziare</p>
      </div>

      <div className="categories-selection">
        <div className="categories-grid-hub">
          {categories.map((category) => {
            // Se è "Altro", usa onClick, altrimenti usa Link
            if (category.action === 'contact') {
              return (
                <div
                  key={category.id}
                  className={`category-card-hub ${category.color} ${
                    showAltroMessage ? 'selected' : ''
                  } category-card-clickable`}
                  onClick={() => setShowAltroMessage(true)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="category-icon-hub">{category.icon}</div>
                  <h3 className="category-title-hub">{category.title}</h3>
                  <p className="category-description-hub">{category.description}</p>
                  <div className="category-arrow">→</div>
                </div>
              );
            }

            // Per le altre categorie, usa Link
            return (
              <Link 
                key={category.id} 
                to={category.path}
                className="category-link"
              >
                <Card
                  hoverable
                  className={`category-card-hub ${category.color}`}
                >
                  <div className="category-icon-hub">{category.icon}</div>
                  <h3 className="category-title-hub">{category.title}</h3>
                  <p className="category-description-hub">{category.description}</p>
                  <div className="category-arrow">→</div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ✅ MESSAGGIO "ALTRO" CON CONTATTI SOCIAL */}
      {showAltroMessage && (
        <Card className="altro-message-card">
          <button 
            className="close-message-btn"
            onClick={() => setShowAltroMessage(false)}
            aria-label="Chiudi"
          >
            ✕
          </button>
          
          <div className="altro-content">
            <div className="altro-icon">💬</div>
            <h2>Hai un'Idea Speciale?</h2>
            <p className="altro-intro">
              Valeria ama le sfide creative! Se hai in mente qualcosa che non rientra 
              nelle categorie principali, saremo felici di ascoltare la tua idea e 
              trovare insieme il modo di realizzarla.
            </p>

            <div className="contact-methods">
              <h3>Contattaci direttamente:</h3>
              
              <div className="contact-buttons">
                <a
                  href="https://wa.me/393517543735?text=Ciao%20Valeria!%20Ho%20un'idea%20particolare%20che%20vorrei%20realizzare..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-btn whatsapp"
                >
                  <span className="contact-icon">📱</span>
                  <div className="contact-text">
                    <strong>WhatsApp</strong>
                    <span>Scrivi su WhatsApp</span>
                  </div>
                </a>

                <a
                  href="https://www.instagram.com/valiryart/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-btn instagram"
                >
                  <span className="contact-icon">📷</span>
                  <div className="contact-text">
                    <strong>Instagram</strong>
                    <span>Invia un messaggio</span>
                  </div>
                </a>

                <a
                  href="mailto:valiryart93@gmail.com?subject=Richiesta Personalizzata&body=Ciao Valeria, ho un'idea che vorrei realizzare..."
                  className="contact-btn email"
                >
                  <span className="contact-icon">✉️</span>
                  <div className="contact-text">
                    <strong>Email</strong>
                    <span>valiryart93@gmail.com</span>
                  </div>
                </a>
              </div>
            </div>

            <div className="altro-footer">
              <p className="footer-note">
                💡 <strong>Suggerimento:</strong> Se hai immagini di riferimento, 
                inviale insieme alla tua descrizione per aiutarci a capire meglio 
                cosa hai in mente!
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Info Box */}
      <Card className="info-box-request">
        <h3>❓ Come Funziona</h3>
        <ol className="steps-list">
          <li>Scegli la categoria che ti interessa</li>
          <li>Compila il form con i dettagli della tua richiesta</li>
          <li>Riceverai una conferma via email</li>
          <li>Valeria ti contatterà per discutere i dettagli e fornirti un preventivo</li>
        </ol>
        <p className="info-note">
          💬 Hai dubbi? Dai un'occhiata alla pagina{' '}
          <Link to="/come-funziona" className="info-link">
            Come Funziona
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default CreateRequestPage;