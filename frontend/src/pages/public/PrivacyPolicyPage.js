import React from 'react';
import './PrivacyPolicyPage.css';

const PrivacyPolicyPage = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-subtitle">
          Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
        </p>

        <div className="legal-content">
          {/* Introduzione */}
          <section className="legal-section">
            <h2>1. Introduzione</h2>
            <p>
              La presente Privacy Policy descrive come ValiryArt raccoglie, utilizza e protegge 
              i dati personali degli utenti in conformità al Regolamento UE 2016/679 (GDPR) e 
              al D.Lgs. 196/2003 (Codice Privacy italiano).
            </p>
          </section>

          {/* Titolare del Trattamento */}
          <section className="legal-section">
            <h2>2. Titolare del Trattamento</h2>
            <div className="info-box">
              <p><strong>ValiryArt</strong> (F.R.)</p>
              <p>Email: <a href="mailto:valiryart93@gmail.com">valiryart93@gmail.com</a></p>
              <p>Sede operativa: Roma, Italia</p>
            </div>
            <p>
              Per esercitare i tuoi diritti o per qualsiasi informazione relativa al trattamento 
              dei dati personali, puoi contattarci all'indirizzo email indicato.
            </p>
          </section>

          {/* Dati Raccolti */}
          <section className="legal-section">
            <h2>3. Dati Personali Raccolti</h2>
            <p>Raccogliamo i seguenti dati personali:</p>
            
            <h3>3.1 Dati forniti dall'utente</h3>
            <ul>
              <li><strong>Registrazione account:</strong> nome, cognome, email, telefono (opzionale)</li>
              <li><strong>Richieste personalizzate:</strong> dati di contatto, dettagli della richiesta, immagini caricate</li>
              <li><strong>Indirizzo di consegna:</strong> solo se necessario per la realizzazione dell'opera</li>
            </ul>

            <h3>3.2 Dati raccolti automaticamente</h3>
            <ul>
              <li><strong>Dati di navigazione:</strong> indirizzo IP, tipo di browser, pagine visitate</li>
              <li><strong>Cookie tecnici:</strong> necessari per il funzionamento del sito (Google reCAPTCHA)</li>
              <li><strong>Google OAuth:</strong> se utilizzi il login con Google, raccogliamo nome, email e foto profilo</li>
            </ul>
          </section>

          {/* Finalità del Trattamento */}
          <section className="legal-section">
            <h2>4. Finalità e Base Giuridica del Trattamento</h2>
            <p>I tuoi dati personali sono trattati per le seguenti finalità:</p>
            
            <div className="purpose-table">
              <div className="purpose-row">
                <div className="purpose-col"><strong>Finalità</strong></div>
                <div className="purpose-col"><strong>Base Giuridica</strong></div>
              </div>
              <div className="purpose-row">
                <div className="purpose-col">Gestione richieste e preventivi</div>
                <div className="purpose-col">Esecuzione di misure precontrattuali (Art. 6.1.b GDPR)</div>
              </div>
              <div className="purpose-row">
                <div className="purpose-col">Creazione e gestione account utente</div>
                <div className="purpose-col">Esecuzione del contratto (Art. 6.1.b GDPR)</div>
              </div>
              <div className="purpose-row">
                <div className="purpose-col">Comunicazioni relative agli ordini</div>
                <div className="purpose-col">Esecuzione del contratto (Art. 6.1.b GDPR)</div>
              </div>
              <div className="purpose-row">
                <div className="purpose-col">Sicurezza e prevenzione frodi</div>
                <div className="purpose-col">Legittimo interesse (Art. 6.1.f GDPR)</div>
              </div>
            </div>
          </section>

          {/* Conservazione */}
          <section className="legal-section">
            <h2>5. Conservazione dei Dati</h2>
            <p>
              I dati personali sono conservati per il tempo strettamente necessario alle finalità 
              per cui sono stati raccolti:
            </p>
            <ul>
              <li><strong>Account utente:</strong> fino alla cancellazione dell'account o su richiesta dell'utente</li>
              <li><strong>Richieste e preventivi:</strong> 5 anni dalla conclusione del rapporto contrattuale (obblighi fiscali)</li>
              <li><strong>Dati di navigazione:</strong> massimo 12 mesi</li>
            </ul>
          </section>

          {/* Condivisione */}
          <section className="legal-section">
            <h2>6. Condivisione dei Dati</h2>
            <p>I tuoi dati personali NON sono venduti a terze parti. Possono essere condivisi solo con:</p>
            <ul>
              <li><strong>Fornitori di servizi tecnici:</strong> hosting, server, infrastruttura (con garanzie GDPR)</li>
              <li><strong>Google LLC:</strong> per servizi OAuth e reCAPTCHA (Privacy Shield certificato)</li>
              <li><strong>Autorità competenti:</strong> solo se richiesto per legge</li>
            </ul>
          </section>

          {/* Diritti dell'Utente */}
          <section className="legal-section">
            <h2>7. Diritti dell'Utente (Art. 15-22 GDPR)</h2>
            <p>In qualsiasi momento puoi esercitare i seguenti diritti:</p>
            <ul>
              <li><strong>Diritto di accesso (Art. 15):</strong> ottenere conferma dei dati trattati e riceverne copia</li>
              <li><strong>Diritto di rettifica (Art. 16):</strong> correggere dati inesatti o incompleti</li>
              <li><strong>Diritto alla cancellazione (Art. 17):</strong> richiedere la cancellazione dei dati ("diritto all'oblio")</li>
              <li><strong>Diritto di limitazione (Art. 18):</strong> limitare il trattamento in determinate circostanze</li>
              <li><strong>Diritto alla portabilità (Art. 20):</strong> ricevere i dati in formato strutturato</li>
              <li><strong>Diritto di opposizione (Art. 21):</strong> opporsi al trattamento per motivi legittimi</li>
              <li><strong>Diritto di reclamo:</strong> presentare reclamo al Garante Privacy (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">www.garanteprivacy.it</a>)</li>
            </ul>
            <p>
              Per esercitare i tuoi diritti, invia una email a: <a href="mailto:valiryart93@gmail.com">valiryart93@gmail.com</a>
            </p>
          </section>

          {/* Cookie */}
          <section className="legal-section">
            <h2>8. Cookie e Tecnologie di Tracciamento</h2>
            <p>Il sito utilizza le seguenti tecnologie:</p>
            
            <h3>8.1 Cookie Tecnici (sempre attivi)</h3>
            <ul>
              <li><strong>Google reCAPTCHA:</strong> per prevenire spam e bot nei form di contatto</li>
              <li><strong>Session cookie:</strong> per mantenere attiva la sessione di login</li>
            </ul>

            <h3>8.2 Cookie di Terze Parti</h3>
            <ul>
              <li><strong>Google OAuth:</strong> per il login con account Google</li>
            </ul>

            <p>
              Puoi gestire o disabilitare i cookie dalle impostazioni del tuo browser. 
              Tuttavia, disabilitare i cookie tecnici potrebbe compromettere alcune funzionalità del sito.
            </p>
          </section>

          {/* Sicurezza */}
          <section className="legal-section">
            <h2>9. Sicurezza dei Dati</h2>
            <p>
              Adottiamo misure tecniche e organizzative adeguate per proteggere i dati personali 
              da accessi non autorizzati, perdita, distruzione o divulgazione:
            </p>
            <ul>
              <li>Crittografia SSL/TLS per le comunicazioni</li>
              <li>Password hashate con algoritmi sicuri (bcrypt)</li>
              <li>Accesso limitato ai dati solo al personale autorizzato</li>
              <li>Backup regolari dei dati</li>
              <li>Firewall e sistemi di monitoraggio</li>
            </ul>
          </section>

          {/* Modifiche */}
          <section className="legal-section">
            <h2>10. Modifiche alla Privacy Policy</h2>
            <p>
              Ci riserviamo il diritto di modificare questa Privacy Policy in qualsiasi momento. 
              Le modifiche saranno pubblicate su questa pagina con aggiornamento della data in alto. 
              Ti invitiamo a consultare regolarmente questa pagina.
            </p>
          </section>

          {/* Contatti */}
          <section className="legal-section">
            <h2>11. Contatti</h2>
            <p>Per qualsiasi domanda o richiesta relativa al trattamento dei dati personali:</p>
            <div className="contact-box">
              <p><strong>Email:</strong> <a href="mailto:valiryart93@gmail.com">valiryart93@gmail.com</a></p>
              <p><strong>Oggetto:</strong> "Richiesta Privacy GDPR"</p>
            </div>
          </section>
        </div>

        <div className="legal-footer">
          <p>
            Documento redatto in conformità al Regolamento UE 2016/679 (GDPR) e 
            al D.Lgs. 196/2003 (Codice Privacy).
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;