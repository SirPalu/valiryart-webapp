import React from 'react';
import './ChiSiamoPage.css';

const ChiSiamoPage = () => {
  return (
    <div className="chi-siamo-page">
      {/* Hero Section */}
      <section className="chi-siamo-hero">
        <div className="container">
          <h1 className="page-title">Chi Sono</h1>
          <p className="page-subtitle">La persona dietro ValiryArt</p>
        </div>
      </section>

      {/* Contenuto Principale */}
      <section className="chi-siamo-content">
        <div className="container">
          <div className="content-grid">
            {/* Immagine Placeholder */}
            <div className="valeria-image">
              <div className="image-placeholder">
                <span>📸</span>
                <p>Foto Valeria</p>
              </div>
            </div>

            {/* Testo Biografia */}
            <div className="valeria-bio">
              <h2>Ciao, sono Valeria</h2>
              <div className="bio-text">
                <p>
                  La creatività ha sempre fatto parte di me, fin da quando, da ragazzina, 
                  ho deciso di studiare come orafa al liceo, imparando l'arte di trasformare 
                  la materia grezza in qualcosa di unico e personale.
                </p>

                <p>
                  La mia strada è poi proseguita all'<strong>Accademia di Belle Arti</strong>, 
                  dove ho approfondito non solo le tecniche artistiche, ma anche la ricerca 
                  del bello nelle piccole cose di ogni giorno. Ho voluto completare il mio 
                  percorso con i 24 CFU per l'insegnamento, perché credo che condividere 
                  le proprie passioni sia una delle forme più pure di creatività.
                </p>

                <p>
                  Negli anni, ho avuto anche l'opportunità di lavorare come orafa in un 
                  contesto prestigioso: un'esperienza preziosa, che mi ha insegnato 
                  l'importanza dei dettagli e del rispetto per ogni fase di creazione, 
                  ma che non ha mai cambiato il mio modo di vedere il mestiere: con 
                  semplicità, rispetto e grande amore per il lavoro artigianale.
                </p>

                <p>
                  <strong>ValiryArt nasce proprio da questo desiderio</strong>: creare oggetti 
                  personalizzati, pensati su misura per chi li desidera. Ogni incisione, 
                  ogni torta scenografica, ogni allestimento nasce da un ascolto attento 
                  delle idee dei clienti e da una lavorazione paziente e curata.
                </p>

                <p>
                  Lavoro con le mani, ma prima ancora con il cuore: per me non esistono 
                  richieste troppo piccole o troppo grandi, esiste solo la voglia di 
                  trasformare un'idea in qualcosa di concreto e speciale.
                </p>

                <p>
                  Se deciderai di affidarmi il tuo progetto, sappi che ogni creazione 
                  sarà trattata con la stessa dedizione con cui la creerei per le persone 
                  a me più care.
                </p>

                <p className="closing-text">
                  E se hai bisogno di ispirazione, le gallerie sul sito sono sempre 
                  aggiornate con le mie realizzazioni: dai un'occhiata, magari sarà 
                  il primo passo verso la tua idea personalizzata!
                </p>

                <p className="signature">
                  A presto!<br />
                  <strong>Valeria</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Sezione Competenze */}
          <div className="competenze-section">
            <h3>Le Mie Competenze</h3>
            <div className="competenze-grid">
              <div className="competenza-card">
                <span className="competenza-icon">🎓</span>
                <h4>Formazione Artistica</h4>
                <p>Liceo Artistico (Oreficeria) + Accademia di Belle Arti</p>
              </div>
              <div className="competenza-card">
                <span className="competenza-icon">💍</span>
                <h4>Esperienza Oreficeria</h4>
                <p>Anni di lavoro in contesti prestigiosi</p>
              </div>
              <div className="competenza-card">
                <span className="competenza-icon">🔥</span>
                <h4>Pirografia</h4>
                <p>Incisioni su legno a mano con pirografo</p>
              </div>
              <div className="competenza-card">
                <span className="competenza-icon">🎨</span>
                <h4>Decorazione</h4>
                <p>Torte scenografiche e allestimenti eventi</p>
              </div>
              <div className="competenza-card">
                <span className="competenza-icon">👩‍🏫</span>
                <h4>Insegnamento</h4>
                <p>24 CFU per condividere la passione artistica</p>
              </div>
              <div className="competenza-card">
                <span className="competenza-icon">❤️</span>
                <h4>Personalizzazione</h4>
                <p>Ogni progetto è unico e fatto su misura</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="chi-siamo-cta">
        <div className="container">
          <h3>Vuoi realizzare qualcosa di speciale?</h3>
          <p>Raccontami la tua idea e creiamo insieme qualcosa di unico</p>
          <div className="cta-buttons">
            <a href="/richiesta" className="btn-cta primary">
              Invia una Richiesta
            </a>
            <a 
              href="https://wa.me/393123456789" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-cta secondary"
            >
              Contattami su WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChiSiamoPage;