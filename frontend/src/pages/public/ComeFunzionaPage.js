import React from 'react';
import { Link } from 'react-router-dom';
import './ComeFunzionaPage.css';

const ComeFunzionaPage = () => {
  return (
    <div className="come-funziona-page">
      {/* Hero */}
      <section className="come-funziona-hero">
        <div className="container">
          <h1 className="page-title">Come Funziona</h1>
          <p className="page-subtitle">
            Dal primo contatto alla consegna: scopri come trasformiamo la tua idea in realtà
          </p>
        </div>
      </section>

      {/* Processo Step by Step */}
      <section className="processo-section">
        <div className="container">
          <h2 className="section-title">Il Processo in 5 Semplici Passi</h2>

          <div className="steps-container">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>📸 Lasciati Ispirare</h3>
                <p>
                  Visita le nostre <Link to="/">gallerie fotografiche</Link> per vedere 
                  le realizzazioni passate. Sono un ottimo punto di partenza per trovare 
                  spunti creativi e capire cosa possiamo creare insieme.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>📝 Invia la Tua Richiesta</h3>
                <p>
                  Scegli il tipo di progetto che ti interessa e compila il form dedicato:
                </p>
                <ul className="service-list">
                  <li>
                    <Link to="/incisioni">🪵 Incisioni su Legno</Link> - Personalizza dimensioni, 
                    colori e carica la tua immagine
                  </li>
                  <li>
                    <Link to="/torte">🎂 Torte Decorative</Link> - Descrivi tema, colori 
                    e occasione speciale
                  </li>
                  <li>
                    <Link to="/eventi">🎉 Allestimento Eventi</Link> - Indica data, luogo 
                    e elementi decorativi
                  </li>
                  <li>
                    <Link to="/richiesta">💡 Richiesta Aperta</Link> - Per idee uniche 
                    fuori dalle categorie
                  </li>
                </ul>
                <p className="step-note">
                  <strong>Nota:</strong> Puoi inviare richieste anche come ospite, 
                  ma <Link to="/register">registrandoti</Link> avrai accesso allo storico 
                  completo e alla chat diretta con Valeria.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>💌 Ricevi una Proposta Personalizzata</h3>
                <p>
                  Ogni richiesta viene valutata con attenzione. Entro breve tempo 
                  riceverai una risposta via email con:
                </p>
                <ul>
                  <li>🎨 Possibilità di personalizzazione e varianti</li>
                  <li>💰 Prezzo definitivo (dipende da materiali, complessità, urgenza)</li>
                  <li>⏳ Tempi di realizzazione stimati</li>
                  <li>🚚 Modalità di consegna</li>
                </ul>
                <p className="step-note">
                  Il prezzo indicato nel form è solo orientativo. Quello finale 
                  viene calcolato dopo la valutazione dettagliata del progetto.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>💳 Conferma e Pagamento</h3>
                <p>
                  Se la proposta ti piace e vuoi procedere:
                </p>
                <ul>
                  <li>
                    🔗 Riceverai un link per il pagamento tramite <strong>PayPal</strong> 
                    con modalità "Beni e Servizi" per la massima sicurezza
                  </li>
                  <li>
                    🧾 Insieme al pagamento riceverai una <strong>fattura completa</strong> 
                    con descrizione dell'articolo artigianale
                  </li>
                  <li>
                    💬 Potrai discutere eventuali modifiche tramite la chat interna 
                    (se sei registrato) o via email
                  </li>
                </ul>
                <p className="highlight-box">
                  ⚠️ La tua richiesta <strong>non comporta alcun obbligo di acquisto</strong> 
                  fino a quando non confermi il preventivo e procedi al pagamento.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="step-card">
              <div className="step-number">5</div>
              <div className="step-content">
                <h3>🚚 Realizzazione e Consegna</h3>
                <p>
                  Una volta confermato il pagamento, inizia la magia:
                </p>
                <div className="delivery-info">
                  <div className="delivery-type">
                    <h4>🪵 Incisioni su Legno</h4>
                    <ul>
                      <li>Spedizione in tutta Italia tramite corriere</li>
                      <li>Codice tracking fornito appena affidato il pacco</li>
                      <li>Costo spedizione: ~€9 (gratis sopra €65)</li>
                    </ul>
                  </div>
                  <div className="delivery-type">
                    <h4>🎂 Torte Decorative</h4>
                    <ul>
                      <li>Consegna a mano solo Roma e provincia</li>
                      <li>Possibile ritiro presso Galleria PortaDiRoma</li>
                      <li>Consegna a domicilio con supplemento</li>
                    </ul>
                  </div>
                  <div className="delivery-type">
                    <h4>🎉 Allestimento Eventi</h4>
                    <ul>
                      <li>Solo Roma e provincia</li>
                      <li>Allestimento in loco il giorno dell'evento</li>
                      <li>Coordinamento catering/sala se richiesto</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="container">
          <h2 className="section-title">Domande Frequenti</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>❓ Posso modificare la richiesta dopo averla inviata?</h4>
              <p>
                Certo! Fino al momento del pagamento puoi discutere qualsiasi 
                modifica tramite chat o email.
              </p>
            </div>
            <div className="faq-item">
              <h4>❓ Quanto tempo ci vuole per ricevere un preventivo?</h4>
              <p>
                Solitamente entro 24-48 ore riceverai una risposta dettagliata. 
                Per richieste complesse potrebbe volerci un po' di più.
              </p>
            </div>
            <div className="faq-item">
              <h4>❓ Posso vedere l'avanzamento del lavoro?</h4>
              <p>
                Assolutamente! Se registrato, riceverai aggiornamenti tramite 
                la chat interna. Altrimenti via email.
              </p>
            </div>
            <div className="faq-item">
              <h4>❓ Cosa succede se non mi piace il risultato?</h4>
              <p>
                Ogni creazione viene concordata nei minimi dettagli prima della 
                realizzazione. In caso di problemi, contattami immediatamente.
              </p>
            </div>
            <div className="faq-item">
              <h4>❓ Accettate pagamenti in contanti?</h4>
              <p>
                Per ordini online solo PayPal. Per ritiri in presenza è possibile 
                concordare il pagamento in contanti.
              </p>
            </div>
            <div className="faq-item">
              <h4>❓ Fate spedizioni internazionali?</h4>
              <p>
                Al momento solo spedizioni nazionali per incisioni. Per eventi e 
                torte solo Roma e provincia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Finale */}
      <section className="come-funziona-cta">
        <div className="container">
          <h3>Pronto per Iniziare?</h3>
          <p>Scegli il servizio che ti interessa e inizia a creare qualcosa di unico</p>
          <div className="cta-buttons">
            <Link to="/incisioni" className="btn-cta primary">
              Incisioni su Legno
            </Link>
            <Link to="/torte" className="btn-cta primary">
              Torte Decorative
            </Link>
            <Link to="/eventi" className="btn-cta primary">
              Allestimento Eventi
            </Link>
          </div>
          <div className="contact-alternative">
            <p>Hai domande? Contattami direttamente:</p>
            <a 
              href="https://wa.me/393513720244" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              📱 WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComeFunzionaPage;