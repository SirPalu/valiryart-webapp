import React from 'react';
import './TermsOfServicePage.css';

const TermsOfServicePage = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1 className="legal-title">Termini di Servizio</h1>
        <p className="legal-subtitle">
          Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
        </p>

        <div className="legal-content">
          {/* Introduzione */}
          <section className="legal-section">
            <h2>1. Premessa</h2>
            <p>
              I presenti Termini di Servizio regolano l'utilizzo del sito web ValiryArt e 
              la fruizione dei servizi offerti. Utilizzando questo sito, accetti integralmente 
              i presenti termini e le condizioni qui descritte.
            </p>
            <p>
              ValiryArt è un'attività artigianale che offre creazioni personalizzate su commissione 
              nelle seguenti categorie: incisioni su legno, torte decorative e allestimenti per eventi.
            </p>
          </section>

          {/* Prestatore di Servizio */}
          <section className="legal-section">
            <h2>2. Prestatore di Servizio</h2>
            <div className="info-box">
              <p><strong>ValiryArt</strong> (F.R.)</p>
              <p>Prestazioni occasionali ex art. 2222 c.c.</p>
              <p>Email: <a href="mailto:valiryart93@gmail.com">valiryart93@gmail.com</a></p>
              <p>WhatsApp: <a href="https://wa.me/393517543735" target="_blank" rel="noopener noreferrer">+39 351 754 3735</a></p>
              <p>Instagram: <a href="https://www.instagram.com/v4lyri4rt/?igsh=MTYxNXVxMWplcWJhbw%3D%3D#" target="_blank" rel="noopener noreferrer">@valiryart</a></p>
              <p>Sede operativa: Roma, Italia</p>
            </div>
          </section>

          {/* Servizi Offerti */}
          <section className="legal-section">
            <h2>3. Servizi Offerti</h2>
            <p>ValiryArt offre i seguenti servizi personalizzati:</p>
            
            <h3>3.1 Incisioni su Legno</h3>
            <p>
              Opere artigianali realizzate a mano con pirografo su diversi supporti in legno 
              (portafoto, taglieri, cofanetti, fogli, sezioni di tronco, ecc.). Ogni incisione 
              è unica e personalizzata secondo le richieste del cliente.
            </p>

            <h3>3.2 Torte Decorative</h3>
            <p>
              Torte scenografiche personalizzate per eventi speciali (compleanni, matrimoni, battesimi). 
              Disponibili sia torte con dolci che torte esclusivamente decorative (finte).
            </p>

            <h3>3.3 Allestimento Eventi</h3>
            <p>
              Servizi di allestimento e decorazione per eventi privati (compleanni, battesimi, 
              anniversari, feste) con elementi personalizzati come archi di palloncini, tableau, 
              centrotavola e altro. Servizio disponibile solo per Roma e provincia.
            </p>
          </section>

          {/* Processo di Ordine */}
          <section className="legal-section">
            <h2>4. Processo di Richiesta e Ordine</h2>
            
            <h3>4.1 Richiesta di Preventivo</h3>
            <p>Il processo di ordine si articola nei seguenti passaggi:</p>
            <ul>
              <li><strong>Passo 1:</strong> L'utente compila il form di richiesta sul sito indicando i dettagli dell'opera desiderata</li>
              <li><strong>Passo 2:</strong> ValiryArt riceve la richiesta e valuta la fattibilità</li>
              <li><strong>Passo 3:</strong> Viene inviato un preventivo personalizzato via email o messaggio</li>
              <li><strong>Passo 4:</strong> L'utente conferma l'ordine e si concorda il pagamento</li>
              <li><strong>Passo 5:</strong> Realizzazione dell'opera su commissione</li>
              <li><strong>Passo 6:</strong> Consegna o ritiro dell'opera finita</li>
            </ul>

            <h3>4.2 Preventivi Gratuiti</h3>
            <p>
              Tutti i preventivi sono gratuiti e senza impegno. Il preventivo ha validità di 30 giorni 
              dalla data di invio, salvo diverso accordo.
            </p>

            <h3>4.3 Accettazione Preventivo</h3>
            <p>
              L'ordine si considera confermato solo dopo esplicita accettazione scritta (email o messaggio) 
              da parte del cliente. La conferma costituisce accettazione integrale dei presenti termini.
            </p>
          </section>

          {/* Prezzi e Pagamenti */}
          <section className="legal-section">
            <h2>5. Prezzi e Modalità di Pagamento</h2>
            
            <h3>5.1 Determinazione del Prezzo</h3>
            <p>
              I prezzi sono determinati in base a diversi fattori:
            </p>
            <ul>
              <li>Complessità dell'opera richiesta</li>
              <li>Materiali utilizzati</li>
              <li>Tempo di lavorazione necessario</li>
              <li>Dimensioni e quantità</li>
              <li>Urgenza della consegna</li>
            </ul>
            <p>
              Per questo motivo <strong>non forniamo listini prezzi fissi</strong> ma solo preventivi 
              personalizzati su ogni singola richiesta.
            </p>

            <h3>5.2 Modalità di Pagamento</h3>
            <p>
              Il pagamento può essere effettuato tramite:
            </p>
            <ul>
              <li>Bonifico bancario (coordinate fornite nel preventivo)</li>
              <li>Contanti alla consegna (per importi entro i limiti di legge)</li>
              <li>Altre modalità da concordare privatamente</li>
            </ul>

            <h3>5.3 Acconto</h3>
            <p>
              Per opere particolarmente elaborate o costose, potrebbe essere richiesto un acconto 
              del 30-50% all'accettazione del preventivo. L'importo esatto sarà comunicato caso per caso.
            </p>
          </section>

          {/* Tempi di Realizzazione */}
          <section className="legal-section">
            <h2>6. Tempi di Realizzazione e Consegna</h2>
            
            <h3>6.1 Tempi Indicativi</h3>
            <p>
              I tempi di realizzazione variano in base alla complessità dell'opera:
            </p>
            <ul>
              <li><strong>Incisioni semplici:</strong> 3-7 giorni lavorativi</li>
              <li><strong>Incisioni elaborate:</strong> 7-15 giorni lavorativi</li>
              <li><strong>Torte decorative:</strong> minimo 7 giorni di preavviso</li>
              <li><strong>Allestimenti eventi:</strong> minimo 10-15 giorni di preavviso</li>
            </ul>
            <p>
              I tempi esatti saranno concordati e confermati nel preventivo personalizzato.
            </p>

            <h3>6.2 Consegna</h3>
            <p>
              <strong>Incisioni su legno:</strong> Spedizione in tutta Italia tramite corriere espresso. 
              Costi di spedizione comunicati nel preventivo.
            </p>
            <p>
              <strong>Torte decorative:</strong> Solo ritiro presso Galleria PortaDiRoma (Roma) o 
              consegna a domicilio entro Roma e provincia (supplemento da concordare).
            </p>
            <p>
              <strong>Allestimenti eventi:</strong> Servizio disponibile solo per Roma e provincia. 
              Montaggio e smontaggio inclusi nel preventivo.
            </p>
          </section>

          {/* Diritto di Recesso */}
          <section className="legal-section">
            <h2>7. Diritto di Recesso e Annullamento</h2>
            
            <h3>7.1 Opere Personalizzate</h3>
            <p>
              In conformità all'art. 59, comma 1, lettera c) del Codice del Consumo (D.Lgs. 206/2005), 
              <strong> il diritto di recesso NON si applica</strong> ai contratti per la fornitura di 
              beni confezionati su misura o chiaramente personalizzati.
            </p>
            <p>
              Tutte le opere realizzate da ValiryArt sono <strong>creazioni uniche e personalizzate</strong> 
              su specifica richiesta del cliente, pertanto non è possibile esercitare il diritto di 
              recesso dopo la conferma dell'ordine.
            </p>

            <h3>7.2 Annullamento Ordine</h3>
            <p>
              È possibile annullare un ordine <strong>entro 24 ore dalla conferma</strong> senza penali, 
              salvo diverso accordo. Oltre tale termine, in caso di annullamento:
            </p>
            <ul>
              <li>Se i lavori non sono ancora iniziati: rimborso totale dell'eventuale acconto (meno spese amministrative €10)</li>
              <li>Se i lavori sono in corso: trattenuta dell'acconto e/o addebito dei materiali già acquistati</li>
              <li>Se l'opera è completata: nessun rimborso</li>
            </ul>
          </section>

          {/* Garanzie e Difetti */}
          <section className="legal-section">
            <h2>8. Garanzie e Difetti di Conformità</h2>
            
            <h3>8.1 Garanzia di Qualità</h3>
            <p>
              Tutte le opere sono realizzate con materiali di qualità e con la massima cura artigianale. 
              Garantiamo la conformità dell'opera rispetto a quanto concordato nel preventivo.
            </p>

            <h3>8.2 Difetti o Non Conformità</h3>
            <p>
              In caso di difetti di realizzazione o non conformità rispetto a quanto pattuito, 
              il cliente deve segnalarlo entro <strong>48 ore dalla consegna</strong> tramite email 
              con foto documentative.
            </p>
            <p>
              ValiryArt si impegna a:
            </p>
            <ul>
              <li>Riparare o sostituire l'opera difettosa gratuitamente, oppure</li>
              <li>Rimborsare integralmente l'importo pagato</li>
            </ul>

            <h3>8.3 Esclusioni</h3>
            <p>
              La garanzia non copre:
            </p>
            <ul>
              <li>Danni causati da uso improprio o negligenza</li>
              <li>Normale usura nel tempo</li>
              <li>Modifiche apportate dal cliente</li>
              <li>Differenze estetiche minori dovute alla natura artigianale dell'opera</li>
            </ul>
          </section>

          {/* Proprietà Intellettuale */}
          <section className="legal-section">
            <h2>9. Proprietà Intellettuale</h2>
            
            <h3>9.1 Diritti d'Autore</h3>
            <p>
              Le opere create da ValiryArt sono protette dal diritto d'autore. Con l'acquisto, 
              il cliente acquisisce la proprietà materiale dell'oggetto fisico, ma <strong>NON i diritti 
              di riproduzione, distribuzione o commercializzazione</strong> del design.
            </p>

            <h3>9.2 Utilizzo Immagini</h3>
            <p>
              ValiryArt si riserva il diritto di fotografare le opere realizzate e pubblicarle sul 
              sito web, sui social media e in materiale promozionale, salvo esplicita richiesta 
              contraria del cliente al momento dell'ordine.
            </p>

            <h3>9.3 Materiali Forniti dal Cliente</h3>
            <p>
              Il cliente garantisce di avere tutti i diritti necessari su immagini, loghi o design 
              forniti per la realizzazione dell'opera e solleva ValiryArt da ogni responsabilità 
              per violazioni di diritti di terzi.
            </p>
          </section>

          {/* Limitazioni di Responsabilità */}
          <section className="legal-section">
            <h2>10. Limitazioni di Responsabilità</h2>
            <p>
              ValiryArt non è responsabile per:
            </p>
            <ul>
              <li>Ritardi dovuti a cause di forza maggiore (maltempo, scioperi, interruzioni servizi)</li>
              <li>Danni derivanti da informazioni errate fornite dal cliente</li>
              <li>Impossibilità di realizzare opere tecnicamente non fattibili (comunicato prima della conferma)</li>
              <li>Allergie o intolleranze alimentari non comunicate per le torte decorative</li>
              <li>Danni a cose o persone derivanti da uso improprio delle opere</li>
            </ul>
          </section>

          {/* Utilizzo del Sito */}
          <section className="legal-section">
            <h2>11. Utilizzo del Sito Web</h2>
            
            <h3>11.1 Account Utente</h3>
            <p>
              La registrazione al sito è facoltativa. Gli utenti registrati hanno accesso a 
              funzionalità aggiuntive come lo storico delle richieste e la gestione del profilo.
            </p>
            <p>
              L'utente è responsabile della sicurezza delle proprie credenziali di accesso e 
              si impegna a non condividerle con terzi.
            </p>

            <h3>11.2 Uso Lecito</h3>
            <p>
              L'utente si impegna a utilizzare il sito in modo lecito e a non:
            </p>
            <ul>
              <li>Violare leggi o regolamenti vigenti</li>
              <li>Trasmettere contenuti offensivi, diffamatori o illeciti</li>
              <li>Tentare di accedere ad aree riservate del sito</li>
              <li>Sovraccaricare o danneggiare l'infrastruttura del sito</li>
            </ul>
          </section>

          {/* Modifiche */}
          <section className="legal-section">
            <h2>12. Modifiche ai Termini di Servizio</h2>
            <p>
              ValiryArt si riserva il diritto di modificare i presenti Termini di Servizio in 
              qualsiasi momento. Le modifiche saranno pubblicate su questa pagina con aggiornamento 
              della data. Gli ordini già confermati rimangono soggetti ai termini vigenti al momento 
              della conferma.
            </p>
          </section>

          {/* Legge Applicabile */}
          <section className="legal-section">
            <h2>13. Legge Applicabile e Foro Competente</h2>
            <p>
              I presenti Termini di Servizio sono regolati dalla legge italiana. Per qualsiasi 
              controversia sarà competente il Foro di Roma, salvo diversa previsione inderogabile 
              di legge (es. foro del consumatore).
            </p>
          </section>

          {/* Contatti */}
          <section className="legal-section">
            <h2>14. Contatti e Risoluzione Controversie</h2>
            <p>
              Per qualsiasi chiarimento, informazione o reclamo relativi ai presenti Termini di Servizio:
            </p>
            <div className="contact-box">
              <p><strong>Email:</strong> <a href="mailto:valiryart93@gmail.com">valiryart93@gmail.com</a></p>
              <p><strong>WhatsApp:</strong> <a href="https://wa.me/393517543735" target="_blank" rel="noopener noreferrer">+39 351 754 3735</a></p>
              <p><strong>Instagram:</strong> <a href="https://instagram.com/valiryart" target="_blank" rel="noopener noreferrer">@valiryart</a></p>
            </div>
            <p>
              Prima di intraprendere azioni legali, le parti si impegnano a cercare una risoluzione 
              amichevole della controversia attraverso un dialogo diretto.
            </p>
          </section>
        </div>

        <div className="legal-footer">
          <p>
            Documento redatto in conformità al Codice del Consumo (D.Lgs. 206/2005) e 
            alla normativa italiana vigente in materia di prestazioni occasionali.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;