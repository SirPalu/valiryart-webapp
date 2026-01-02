import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="valiryart-footer">
      <div className="footer-container">
        {/* Colonna 1: Logo e Descrizione */}
        <div className="footer-column">
          <div className="footer-logo">
            <span className="footer-logo-text">ValiryArt</span>
            <span className="footer-tagline">Creazioni Artigianali</span>
          </div>
          <p className="footer-description">
            Ogni opera è realizzata a mano con passione e dedizione. 
            Trasforma le tue idee in creazioni uniche.
          </p>
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
              >
                <span className="icon">📱</span>
                <span>WhatsApp</span>
              </a>
            </li>
            <li>
              <a 
                href="https://instagram.com/valiryart" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-contact-link"
              >
                <span className="icon">📷</span>
                <span>Instagram</span>
              </a>
            </li>
            <li>
              <a 
                href="mailto:valiryart93@gmail.com"
                className="footer-contact-link"
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
  );
};

export default Footer;