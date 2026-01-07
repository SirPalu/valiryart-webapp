import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Schema.org Organization Markup */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ValiryArt",
            "url": "https://www.valiryart.com",
            "logo": "https://www.valiryart.com/logo.png",
            "description": "Creazioni artigianali personalizzate: incisioni su legno, torte decorative e allestimenti eventi",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Via Monte Cremasco, 179",
              "addressLocality": "Roma",
              "postalCode": "00188",
              "addressCountry": "IT"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+393513720244",
              "contactType": "customer service",
              "availableLanguage": ["Italian"],
              "areaServed": "IT"
            },
            "sameAs": [
              "https://www.instagram.com/v4lyri4rt/",
              "https://wa.me/393513720244"
            ]
          })}
        </script>
      </Helmet>

      <footer className="valiryart-footer" itemScope itemType="https://schema.org/LocalBusiness">
        <div className="footer-container">
          {/* Colonna 1: Logo e Descrizione */}
          <div className="footer-column">
            <div className="footer-logo">
              <span className="footer-logo-text" itemProp="name">ValiryArt</span>
              <span className="footer-tagline">Creazioni Artigianali</span>
            </div>
            <p className="footer-description" itemProp="description">
              Ogni opera è realizzata a mano con passione e dedizione. 
              Trasforma le tue idee in creazioni uniche.
            </p>
            
            {/* Schema.org Address (hidden) */}
            <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress" style={{ display: 'none' }}>
              <span itemProp="streetAddress">Via Monte Cremasco, 179</span>
              <span itemProp="addressLocality">Roma</span>
              <span itemProp="postalCode">00188</span>
              <span itemProp="addressCountry">IT</span>
            </div>
          </div>

          {/* Colonna 2: Link Rapidi */}
          <div className="footer-column">
            <h4 className="footer-title">Servizi</h4>
            <ul className="footer-links">
              <li><Link to="/incisioni">Incisioni su Legno</Link></li>
              <li><Link to="/torte">Torte Decorative</Link></li>
              <li><Link to="/eventi">Allestimento Eventi</Link></li>
              <li><Link to="/richiesta">Richiesta Personalizzata</Link></li>
            </ul>
          </div>

          {/* Colonna 3: Info */}
          <div className="footer-column">
            <h4 className="footer-title">Informazioni</h4>
            <ul className="footer-links">
              <li><Link to="/chi-siamo">Chi Sono</Link></li>
              <li><Link to="/come-funziona">Come Funziona</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/termini-servizio">Termini di Servizio</Link></li>
            </ul>
          </div>

          {/* Colonna 4: Contatti e Social */}
          <div className="footer-column">
            <h4 className="footer-title">Contatti</h4>
            <ul className="footer-contacts">
              <li>
                <a 
                  href="https://wa.me/393513720244" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-contact-link"
                  itemProp="telephone"
                >
                  <span className="icon">📱</span>
                  <span>WhatsApp</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.instagram.com/v4lyri4rt/?igsh=MTYxNXVxMWplcWJhbw%3D%3D#" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-contact-link"
                  itemProp="sameAs"
                >
                  <span className="icon">📷</span>
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:valiryart93@gmail.com"
                  className="footer-contact-link"
                  itemProp="email"
                >
                  <span className="icon">📧</span>
                  <span>Email</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <div className="footer-container">
            <p className="footer-copyright">
              © {currentYear} ValiryArt. Tutti i diritti riservati.
            </p>
            <p className="footer-credits">
              Realizzato con ❤️ da <strong>ValiryArt Team</strong>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;