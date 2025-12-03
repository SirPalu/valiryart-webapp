import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestsAPI } from '../../services/api';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import './EventiPage.css';

const ELEMENTI_DECORATIVI = [
  { id: 'arco_palloncini', label: '🎈 Arco Palloncini' },
  { id: 'porta_spumante', label: '🍾 Porta Spumante' },
  { id: 'mongolfiera', label: '🎈 Mongolfiera' },
  { id: 'dono_invitati', label: '🎁 Dono per gli Invitati' },
  { id: 'torta', label: '🎂 Torta Decorativa' },
  { id: 'centro_tavola', label: '🌸 Centro Tavola' },
  { id: 'tableau', label: '🖼️ Tableau Segnaposti' },
  { id: 'pedana_legno', label: '🪵 Pedana in Legno' },
  { id: 'segnaposti', label: '📍 Segnaposti' }
];

const EventiPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tipoEvento: '',
    dataEvento: '',
    tema: '',
    colori: ['', '', ''],
    elementiDecorativi: [],
    numeroPartecipanti: '',
    luogoEvento: '',
    indirizzoEvento: '',
    cittaEvento: '',
    capEvento: '',
    
    // Servizi aggiuntivi
    richiestaCartering: false,
    richiestaLocation: false,
    
    note: '',
    
    // Contatti guest
    email: user?.email || '',
    nome: user?.nome || '',
    telefono: user?.telefono || ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleColorChange = (index, value) => {
    const newColors = [...formData.colori];
    newColors[index] = value;
    setFormData(prev => ({ ...prev, colori: newColors }));
  };

  const toggleElemento = (elementoId) => {
    setFormData(prev => ({
      ...prev,
      elementiDecorativi: prev.elementiDecorativi.includes(elementoId)
        ? prev.elementiDecorativi.filter(id => id !== elementoId)
        : [...prev.elementiDecorativi, elementoId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tipoEvento.trim()) {
      newErrors.tipoEvento = 'Indica il tipo di evento';
    }

    if (!formData.dataEvento) {
      newErrors.dataEvento = 'Seleziona la data dell\'evento';
    }

    if (!formData.luogoEvento.trim()) {
      newErrors.luogoEvento = 'Indica dove si terrà l\'evento';
    }

    if (formData.elementiDecorativi.length === 0) {
      newErrors.elementi = 'Seleziona almeno un elemento decorativo';
    }

    // Validazione contatti guest
    if (!isAuthenticated) {
      if (!formData.email) newErrors.email = 'Email obbligatoria';
      if (!formData.nome) newErrors.nome = 'Nome obbligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    setShowSummary(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);

    try {
      const indirizzoCompleto = [
        formData.indirizzoEvento,
        formData.cittaEvento,
        formData.capEvento
      ].filter(Boolean).join(', ');

      const requestData = {
        categoria: 'eventi',
        email_contatto: formData.email,
        nome_contatto: formData.nome,
        telefono_contatto: formData.telefono,
        descrizione: `Allestimento ${formData.tipoEvento}`,
        data_evento: formData.dataEvento,
        citta: formData.cittaEvento || 'Roma',
        indirizzo_consegna: indirizzoCompleto || formData.luogoEvento,
        dati_specifici: {
          tipoEvento: formData.tipoEvento,
          tema: formData.tema,
          colori: formData.colori.filter(c => c.trim() !== ''),
          elementiDecorativi: formData.elementiDecorativi.map(id => 
            ELEMENTI_DECORATIVI.find(el => el.id === id)?.label
          ),
          numeroPartecipanti: formData.numeroPartecipanti,
          luogoEvento: formData.luogoEvento,
          richiestaCartering: formData.richiestaCartering,
          richiestaLocation: formData.richiestaLocation,
          note: formData.note
        }
      };

      await requestsAPI.create(requestData);

      toast.success('Richiesta inviata con successo!');
      
      if (isAuthenticated) {
        navigate('/user/requests');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Errore nell\'invio della richiesta');
    } finally {
      setLoading(false);
    }
  };

  if (showSummary) {
    return (
      <EventiSummary 
        formData={formData}
        onBack={() => setShowSummary(false)}
        onConfirm={confirmSubmit}
        loading={loading}
      />
    );
  }

  return (
    <div className="eventi-page">
      {/* Hero */}
      <section className="eventi-hero">
        <div className="container">
          <h1>🎉 Allestimento Eventi</h1>
          <p className="hero-subtitle">
            Decori personalizzati per rendere unico ogni momento speciale
          </p>
          <div className="hero-notice">
            <p>
              💡 <strong>Cerchi ispirazione?</strong> Guarda la nostra{' '}
              <a href="/" target="_blank" rel="noopener noreferrer">
                galleria di allestimenti realizzati →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="eventi-info">
        <div className="container">
          <div className="info-card">
            <h3>🎨 Cosa Realizziamo</h3>
            <p>
              Valeria crea allestimenti completi per ogni tipo di evento: compleanni, 
              matrimoni, battesimi, anniversari e molto altro. Ogni decorazione è 
              <strong> studiata su misura</strong> per rispecchiare il tema e i colori 
              che hai in mente.
            </p>
          </div>

          <div className="services-extra">
            <div className="service-card">
              <h4>🍽️ Servizio Catering</h4>
              <p>
                In collaborazione con <strong>Novelli's Food s.r.l.</strong>, possiamo 
                organizzare anche il catering per il tuo evento. Dopo aver ricevuto 
                la tua richiesta, Valeria ti metterà in contatto per definire il menù 
                e i dettagli.
              </p>
              <a 
                href="https://www.instagram.com/novellisfood" 
                target="_blank" 
                rel="noopener noreferrer"
                className="service-link"
              >
                📷 Segui Novelli's Food su Instagram
              </a>
            </div>

            <div className="service-card">
              <h4>🏛️ Location per Eventi</h4>
              <p>
                Hai bisogno anche di una sala? Possiamo aiutarti a prenotare presso 
                <strong> Casa Rotta</strong>, una location elegante e versatile. 
                Segnaleremo la tua necessità e ti metteremo in contatto diretto con 
                la struttura.
              </p>
              <a 
                href="https://www.casarotta.net/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="service-link"
              >
                🌐 Visita Casa Rotta
              </a>
            </div>
          </div>

          <div className="info-notice">
            <p>
              📍 <strong>Servizio disponibile solo per Roma e provincia</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="eventi-form-section">
        <div className="container">
          <form onSubmit={handleSubmit} className="eventi-form">
            
            {/* Step 1: Info Base */}
            <div className="form-step">
              <h2 className="step-title">1. Informazioni Evento</h2>
              
              <div className="form-group">
                <label>Tipo di Evento *</label>
                <input
                  type="text"
                  value={formData.tipoEvento}
                  onChange={(e) => handleChange('tipoEvento', e.target.value)}
                  placeholder="Es: Compleanno, Matrimonio, Anniversario, Battesimo..."
                  className={`form-control ${errors.tipoEvento ? 'error' : ''}`}
                />
                {errors.tipoEvento && <span className="error-message">{errors.tipoEvento}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Data Evento *</label>
                  <input
                    type="date"
                    value={formData.dataEvento}
                    onChange={(e) => handleChange('dataEvento', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`form-control ${errors.dataEvento ? 'error' : ''}`}
                  />
                  {errors.dataEvento && <span className="error-message">{errors.dataEvento}</span>}
                </div>

                <div className="form-group">
                  <label>Numero Partecipanti (stima)</label>
                  <input
                    type="number"
                    value={formData.numeroPartecipanti}
                    onChange={(e) => handleChange('numeroPartecipanti', e.target.value)}
                    placeholder="Es: 50"
                    className="form-control"
                  />
                  <small className="form-hint">Utile per dimensionare l'allestimento</small>
                </div>
              </div>
            </div>

            {/* Step 2: Tema e Colori */}
            <div className="form-step">
              <h2 className="step-title">2. Tema e Colori</h2>
              
              <div className="form-group">
                <label>Tema dell'Evento</label>
                <input
                  type="text"
                  value={formData.tema}
                  onChange={(e) => handleChange('tema', e.target.value)}
                  placeholder="Es: Musica, Sport, Film, Natura, Principesse..."
                  className="form-control"
                />
                <small className="form-hint">
                  Indica un tema se vuoi che i decori richiamino uno stile specifico
                </small>
              </div>

              <div className="form-group">
                <label>Colori Preferiti (fino a 3)</label>
                <div className="colors-grid">
                  {[0, 1, 2].map(index => (
                    <input
                      key={index}
                      type="text"
                      placeholder={`Colore ${index + 1}`}
                      value={formData.colori[index]}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="form-control"
                    />
                  ))}
                </div>
                <small className="form-hint">
                  Es: Rosso, Oro, Bianco
                </small>
              </div>
            </div>

            {/* Step 3: Elementi Decorativi */}
            <div className="form-step">
              <h2 className="step-title">3. Elementi Decorativi *</h2>
              <p className="step-note">
                Seleziona gli elementi che desideri per il tuo allestimento
              </p>
              
              <div className="elementi-grid">
                {ELEMENTI_DECORATIVI.map(elemento => (
                  <label 
                    key={elemento.id}
                    className={`elemento-card ${formData.elementiDecorativi.includes(elemento.id) ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.elementiDecorativi.includes(elemento.id)}
                      onChange={() => toggleElemento(elemento.id)}
                    />
                    <span className="elemento-label">{elemento.label}</span>
                  </label>
                ))}
              </div>
              
              {errors.elementi && <span className="error-message">{errors.elementi}</span>}
            </div>

            {/* Step 4: Luogo */}
            <div className="form-step">
              <h2 className="step-title">4. Luogo Evento</h2>
              
              <div className="form-group">
                <label>Nome Location o Descrizione Luogo *</label>
                <input
                  type="text"
                  value={formData.luogoEvento}
                  onChange={(e) => handleChange('luogoEvento', e.target.value)}
                  placeholder="Es: Casa privata, Sala ricevimenti, Ristorante..."
                  className={`form-control ${errors.luogoEvento ? 'error' : ''}`}
                />
                {errors.luogoEvento && <span className="error-message">{errors.luogoEvento}</span>}
              </div>

              <div className="form-group">
                <label>Indirizzo Completo</label>
                <input
                  type="text"
                  value={formData.indirizzoEvento}
                  onChange={(e) => handleChange('indirizzoEvento', e.target.value)}
                  placeholder="Via, Numero Civico"
                  className="form-control"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Città</label>
                  <input
                    type="text"
                    value={formData.cittaEvento}
                    onChange={(e) => handleChange('cittaEvento', e.target.value)}
                    placeholder="Roma"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>CAP</label>
                  <input
                    type="text"
                    value={formData.capEvento}
                    onChange={(e) => handleChange('capEvento', e.target.value)}
                    placeholder="00139"
                    className="form-control"
                  />
                </div>
              </div>
            </div>

            {/* Step 5: Servizi Aggiuntivi */}
            <div className="form-step">
              <h2 className="step-title">5. Servizi Aggiuntivi (Opzionali)</h2>
              
              <div className="servizi-aggiuntivi">
                <label className="checkbox-card">
                  <input
                    type="checkbox"
                    checked={formData.richiestaCartering}
                    onChange={(e) => handleChange('richiestaCartering', e.target.checked)}
                  />
                  <div className="checkbox-content">
                    <h4>🍽️ Richiedi informazioni sul Catering</h4>
                    <p>
                      Saremo felici di metterti in contatto con Novelli's Food per 
                      organizzare il menù perfetto per il tuo evento
                    </p>
                  </div>
                </label>

                <label className="checkbox-card">
                  <input
                    type="checkbox"
                    checked={formData.richiestaLocation}
                    onChange={(e) => handleChange('richiestaLocation', e.target.checked)}
                  />
                  <div className="checkbox-content">
                    <h4>🏛️ Richiedi informazioni sulla Location</h4>
                    <p>
                      Ti metteremo in contatto con Casa Rotta per verificare disponibilità 
                      e prezzi della sala
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 6: Note */}
            <div className="form-step">
              <h2 className="step-title">6. Note Aggiuntive</h2>
              <textarea
                value={formData.note}
                onChange={(e) => handleChange('note', e.target.value)}
                placeholder="Descrivi in dettaglio la tua idea, eventuali preferenze particolari, budget orientativo..."
                maxLength={1000}
                rows={6}
                className="form-control"
              />
              <small className="char-count">{formData.note.length}/1000</small>
            </div>

            {/* Step 7: Contatti Guest */}
            {!isAuthenticated && (
              <div className="form-step">
                <h2 className="step-title">7. I Tuoi Dati di Contatto</h2>
                <div className="contact-grid">
                  <div className="form-group">
                    <label>Nome *</label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleChange('nome', e.target.value)}
                      className={`form-control ${errors.nome ? 'error' : ''}`}
                    />
                    {errors.nome && <span className="error-message">{errors.nome}</span>}
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`form-control ${errors.email ? 'error' : ''}`}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label>Telefono</label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer Prezzo */}
            <div className="price-disclaimer">
              <h3>💰 Informazioni sul Preventivo</h3>
              <p>
                Il costo dell'allestimento varia in base a diversi fattori: numero e 
                complessità degli elementi decorativi, dimensioni della location, 
                materiali richiesti. Dopo aver ricevuto la tua richiesta, Valeria ti 
                contatterà per discutere i dettagli e fornirti un <strong>preventivo 
                personalizzato gratuito</strong>.
              </p>
            </div>

            {/* Submit */}
            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                size="lg"
              >
                Rivedi e Invia Richiesta
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

// Componente Riepilogo
const EventiSummary = ({ formData, onBack, onConfirm, loading }) => {
  const elementiSelezionati = formData.elementiDecorativi.map(id => 
    ELEMENTI_DECORATIVI.find(el => el.id === id)?.label
  );

  return (
    <div className="order-summary-page">
      <div className="container">
        <h1>Riepilogo Richiesta Allestimento</h1>
        
        <div className="summary-card">
          <div className="summary-section">
            <h3>Informazioni Evento</h3>
            <div className="summary-row">
              <strong>Tipo:</strong>
              <span>{formData.tipoEvento}</span>
            </div>
            <div className="summary-row">
              <strong>Data:</strong>
              <span>{new Date(formData.dataEvento).toLocaleDateString('it-IT')}</span>
            </div>
            {formData.numeroPartecipanti && (
              <div className="summary-row">
                <strong>Partecipanti:</strong>
                <span>{formData.numeroPartecipanti}</span>
              </div>
            )}
          </div>

          {(formData.tema || formData.colori.filter(c => c).length > 0) && (
            <div className="summary-section">
              <h3>Tema e Colori</h3>
              {formData.tema && <p><strong>Tema:</strong> {formData.tema}</p>}
              {formData.colori.filter(c => c).length > 0 && (
                <p><strong>Colori:</strong> {formData.colori.filter(c => c).join(', ')}</p>
              )}
            </div>
          )}

          <div className="summary-section">
            <h3>Elementi Decorativi</h3>
            <ul className="elementi-list">
              {elementiSelezionati.map((el, index) => (
                <li key={index}>{el}</li>
              ))}
            </ul>
          </div>

          <div className="summary-section">
            <h3>Luogo</h3>
            <p>{formData.luogoEvento}</p>
            {formData.indirizzoEvento && (
              <p>
                {formData.indirizzoEvento}
                {formData.cittaEvento && `, ${formData.cittaEvento}`}
                {formData.capEvento && ` ${formData.capEvento}`}
              </p>
            )}
          </div>

          {(formData.richiestaCartering || formData.richiestaLocation) && (
            <div className="summary-section">
              <h3>Servizi Aggiuntivi Richiesti</h3>
              {formData.richiestaCartering && <p>✓ Informazioni Catering</p>}
              {formData.richiestaLocation && <p>✓ Informazioni Location</p>}
            </div>
          )}

          {formData.note && (
            <div className="summary-section">
              <h3>Note</h3>
              <p>{formData.note}</p>
            </div>
          )}
        </div>

        <p className="summary-disclaimer">
          Riceverai una conferma via email e Valeria ti contatterà per discutere i dettagli 
          e fornirti un preventivo personalizzato gratuito.
        </p>

        <div className="summary-actions">
          <Button variant="outline" onClick={onBack} disabled={loading}>
            ← Modifica
          </Button>
          <Button variant="primary" onClick={onConfirm} loading={loading}>
            Conferma e Invia Richiesta
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventiPage;