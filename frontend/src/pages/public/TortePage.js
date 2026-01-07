import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../../components/SEO/SEOHead';
import { useAuth } from '../../context/AuthContext';
import { requestsAPI } from '../../services/api';
import ReCAPTCHA from 'react-google-recaptcha';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import './TortePage.css';

const CAKE_SIZES = [
  { value: 'piccola', label: 'Piccola - Diametro base 20 cm' },
  { value: 'media', label: 'Media - Diametro base 30 cm' },
  { value: 'grande', label: 'Grande - Diametro base 40 cm' }
];

const DELIVERY_OPTIONS = [
  { 
    value: 'ritiro', 
    label: '📍 Ritiro presso Galleria PortaDiRoma',
    address: 'Via Alberto Lionello, 201, 00139 Roma RM',
    mapsLink: 'https://maps.google.com/?q=Via+Alberto+Lionello,+201,+00139+Roma+RM'
  },
  { 
    value: 'consegna', 
    label: '🚗 Consegna a domicilio (solo Roma e provincia)',
    note: 'Supplemento da concordare in base alla distanza'
  }
];

const TortePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // ✅ reCAPTCHA refs
  const recaptchaRef = useRef(null);

  const [formData, setFormData] = useState({
    tipoEvento: '',
    tipologiaTorta: 'dolci', // 'dolci' o 'finta'
    numeroStrati: 3,
    dimensione: 'media',
    
    // Per torte con dolci
    tipiDolci: '',
    elementoDecorativo1: '',
    elementoDecorativo2: '',
    
    // Per torte finte
    tema: '',
    colori: ['', '', ''],
    
    // Comune
    immagineTorta: null,
    note: '',
    dataEvento: '',
    
    // Consegna
    modalitaConsegna: 'ritiro',
    indirizzoConsegna: '',
    cittaConsegna: '',
    capConsegna: '',
    
    // Contatti guest
    email: user?.email || '',
    nome: user?.nome || '',
    telefono: user?.telefono || ''
  });

  // ✅ reCAPTCHA state
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // ✅ reCAPTCHA handler
  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
    if (errors.recaptcha) {
      setErrors(prev => ({ ...prev, recaptcha: '' }));
    }
  };

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'File troppo grande (max 10MB)' }));
        return;
      }
      setFormData(prev => ({ ...prev, immagineTorta: file }));
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tipoEvento.trim()) {
      newErrors.tipoEvento = 'Indica il tipo di evento';
    }

    if (!formData.dataEvento) {
      newErrors.dataEvento = 'Indica la data dell\'evento';
    }

    if (formData.tipologiaTorta === 'dolci') {
      if (!formData.tipiDolci.trim()) {
        newErrors.tipiDolci = 'Indica quali dolci desideri';
      }
    }

    if (formData.tipologiaTorta === 'finta') {
      if (!formData.tema.trim()) {
        newErrors.tema = 'Indica un tema per la torta';
      }
    }

    if (formData.modalitaConsegna === 'consegna') {
      if (!formData.indirizzoConsegna.trim()) {
        newErrors.indirizzoConsegna = 'Inserisci l\'indirizzo di consegna';
      }
      if (!formData.cittaConsegna.trim()) {
        newErrors.cittaConsegna = 'Inserisci la città';
      }
    }

    // Validazione contatti guest
    if (!isAuthenticated) {
      if (!formData.email) newErrors.email = 'Email obbligatoria';
      if (!formData.nome) newErrors.nome = 'Nome obbligatorio';
      
      // ✅ VERIFICA RECAPTCHA per guest
      if (!recaptchaToken) {
        newErrors.recaptcha = 'Completa la verifica reCAPTCHA';
      }
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
      const requestData = {
        categoria: 'torte',
        email_contatto: formData.email,
        nome_contatto: formData.nome,
        telefono_contatto: formData.telefono,
        descrizione: `Torta ${formData.tipologiaTorta === 'dolci' ? 'con Dolci' : 'Decorativa'} per ${formData.tipoEvento}`,
        data_evento: formData.dataEvento,
        citta: formData.modalitaConsegna === 'consegna' ? formData.cittaConsegna : 'Roma',
        indirizzo_consegna: formData.modalitaConsegna === 'consegna' 
          ? `${formData.indirizzoConsegna}, ${formData.cittaConsegna}, ${formData.capConsegna}`
          : 'Ritiro Galleria PortaDiRoma',
        dati_specifici: {
          tipoEvento: formData.tipoEvento,
          tipologiaTorta: formData.tipologiaTorta,
          numeroStrati: formData.numeroStrati,
          dimensione: formData.dimensione,
          tipiDolci: formData.tipologiaTorta === 'dolci' ? formData.tipiDolci : null,
          elementiDecorativi: formData.tipologiaTorta === 'dolci' 
            ? [formData.elementoDecorativo1, formData.elementoDecorativo2].filter(Boolean)
            : null,
          tema: formData.tipologiaTorta === 'finta' ? formData.tema : null,
          colori: formData.tipologiaTorta === 'finta' 
            ? formData.colori.filter(c => c.trim() !== '')
            : null,
          note: formData.note,
          modalitaConsegna: formData.modalitaConsegna
        }
      };

      if (formData.immagineTorta) {
        const formDataToSend = new FormData();
        Object.keys(requestData).forEach(key => {
          if (key === 'dati_specifici') {
            formDataToSend.append(key, JSON.stringify(requestData[key]));
          } else if (requestData[key]) {
            formDataToSend.append(key, requestData[key]);
          }
        });
        formDataToSend.append('files', formData.immagineTorta);
        
        // ✅ AGGIUNGI RECAPTCHA TOKEN (solo per guest)
        if (!isAuthenticated && recaptchaToken) {
          formDataToSend.append('recaptchaToken', recaptchaToken);
        }
        
        await requestsAPI.create(formDataToSend);
      } else {
        // ✅ AGGIUNGI RECAPTCHA TOKEN (solo per guest)
        if (!isAuthenticated && recaptchaToken) {
          requestData.recaptchaToken = recaptchaToken;
        }
        
        await requestsAPI.create(requestData);
      }

      toast.success('Richiesta inviata con successo!');
      
      if (isAuthenticated) {
        navigate('/user/requests');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      toast.error(error.response?.data?.message || 'Errore nell\'invio della richiesta');
      
      // ✅ RESET RECAPTCHA in caso di errore
      if (!isAuthenticated && recaptchaRef.current) {
        recaptchaRef.current.reset();
        setRecaptchaToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  if (showSummary) {
    return (
      <TorteSummary 
        formData={formData}
        onBack={() => setShowSummary(false)}
        onConfirm={confirmSubmit}
        loading={loading}
      />
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <SEOHead
        title="Torte Scenografiche Personalizzate Roma | ValiryArt"
        description="Torte decorative per compleanni, matrimoni e eventi. Con dolci o solo decorative. Servizio Roma e provincia."
        keywords="valiryart, torte decorative, torte finte, torte scenografiche, cake design, allestimento eventi, regali artigianali, creazioni su misura"
        url="https://www.valiryart.com/torte"
        image="/logo.png"
        type="website"
      />
    <div className="torte-page">
      {/* Hero */}
      <section className="torte-hero">
        <div className="container">
          <h1>🎂 Torte Decorative</h1>
          <p className="hero-subtitle">
            Torte scenografiche uniche per rendere speciale ogni evento
          </p>
          <div className="hero-notice">
            <p>
              💡 <strong>Cerchi ispirazione?</strong> Guarda la nostra{' '}
              <a href="/galleria" target="_blank" rel="noopener noreferrer">
                galleria di torte realizzate →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="torte-form-section">
        <div className="container">
          <form onSubmit={handleSubmit} className="torte-form">
            
            {/* Step 1: Info Base */}
            <div className="form-step">
              <h2 className="step-title">1. Informazioni Base</h2>
              
              <div className="form-group">
                <label>Tipo di Evento *</label>
                <input
                  type="text"
                  value={formData.tipoEvento}
                  onChange={(e) => handleChange('tipoEvento', e.target.value)}
                  placeholder="Es: Compleanno, Matrimonio, Battesimo..."
                  className={`form-control ${errors.tipoEvento ? 'error' : ''}`}
                />
                {errors.tipoEvento && <span className="error-message">{errors.tipoEvento}</span>}
              </div>

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
            </div>

            {/* Step 2: Tipologia Torta */}
            <div className="form-step">
              <h2 className="step-title">2. Tipologia Torta</h2>
              
              <div className="torta-type-selector">
                <label className={`type-card ${formData.tipologiaTorta === 'dolci' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="tipologiaTorta"
                    value="dolci"
                    checked={formData.tipologiaTorta === 'dolci'}
                    onChange={(e) => handleChange('tipologiaTorta', e.target.value)}
                  />
                  <div className="type-content">
                    <span className="type-icon">🍬</span>
                    <h3>Con Dolci</h3>
                    <p>Torta decorata con cioccolatini, caramelle e dolciumi vari</p>
                  </div>
                </label>

                <label className={`type-card ${formData.tipologiaTorta === 'finta' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="tipologiaTorta"
                    value="finta"
                    checked={formData.tipologiaTorta === 'finta'}
                    onChange={(e) => handleChange('tipologiaTorta', e.target.value)}
                  />
                  <div className="type-content">
                    <span className="type-icon">🎨</span>
                    <h3>Solo Finta (Decorativa)</h3>
                    <p>Torta scenografica con decori tematici personalizzati</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 3: Dimensioni */}
            <div className="form-step">
              <h2 className="step-title">3. Dimensioni e Struttura</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Numero Strati</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={formData.numeroStrati}
                    onChange={(e) => handleChange('numeroStrati', parseInt(e.target.value))}
                    className="form-control"
                  />
                  <small className="form-hint">Da 1 a 6 strati (tipicamente 3-4)</small>
                </div>

                <div className="form-group">
                  <label>Dimensione Base</label>
                  <select
                    value={formData.dimensione}
                    onChange={(e) => handleChange('dimensione', e.target.value)}
                    className="form-control"
                  >
                    {CAKE_SIZES.map(size => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 4: Dettagli Specifici */}
            <div className="form-step">
              <h2 className="step-title">4. Dettagli Personalizzazione</h2>

              {formData.tipologiaTorta === 'dolci' ? (
                <>
                  <div className="form-group">
                    <label>Tipi di Dolci Desiderati *</label>
                    <textarea
                      value={formData.tipiDolci}
                      onChange={(e) => handleChange('tipiDolci', e.target.value)}
                      placeholder="Es: Cioccolatini Ferrero Rocher, Kinder, caramelle gommose, marshmallow..."
                      rows={3}
                      className={`form-control ${errors.tipiDolci ? 'error' : ''}`}
                    />
                    {errors.tipiDolci && <span className="error-message">{errors.tipiDolci}</span>}
                    <small className="form-hint">
                      💰 Il prezzo finale dipenderà dai dolci scelti e dalla marca
                    </small>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Elemento Decorativo 1</label>
                      <input
                        type="text"
                        value={formData.elementoDecorativo1}
                        onChange={(e) => handleChange('elementoDecorativo1', e.target.value)}
                        placeholder="Es: Fiori freschi, bottigliette, palloncini..."
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label>Elemento Decorativo 2</label>
                      <input
                        type="text"
                        value={formData.elementoDecorativo2}
                        onChange={(e) => handleChange('elementoDecorativo2', e.target.value)}
                        placeholder="Es: Sagome cartoncino, statuine, led..."
                        className="form-control"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Tema della Torta *</label>
                    <input
                      type="text"
                      value={formData.tema}
                      onChange={(e) => handleChange('tema', e.target.value)}
                      placeholder="Es: Musica, Sport, Film, Natura..."
                      className={`form-control ${errors.tema ? 'error' : ''}`}
                    />
                    {errors.tema && <span className="error-message">{errors.tema}</span>}
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
                  </div>
                </>
              )}
            </div>

            {/* Step 5: Immagine Riferimento */}
            <div className="form-step">
              <h2 className="step-title">5. Immagine di Riferimento (Opzionale)</h2>
              <p className="step-note">
                Hai visto una torta che ti piace? Carica l'immagine per darci un'idea del risultato desiderato
              </p>

              <div className="upload-area">
                <input
                  type="file"
                  id="cakeImage"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="file-input"
                />
                <label htmlFor="cakeImage" className="upload-label">
                  <span className="upload-icon">📸</span>
                  <span>Clicca per caricare un'immagine di riferimento</span>
                  <small>Max 10MB - JPG, PNG</small>
                </label>
                {formData.immagineTorta && (
                  <div className="uploaded-preview">
                    ✅ {formData.immagineTorta.name}
                  </div>
                )}
              </div>
            </div>

            {/* Step 6: Note */}
            <div className="form-step">
              <h2 className="step-title">6. Note Aggiuntive</h2>
              <textarea
                value={formData.note}
                onChange={(e) => handleChange('note', e.target.value)}
                placeholder="Descrivi in dettaglio la tua idea, eventuali preferenze particolari, allergeni da evitare, etc..."
                maxLength={1000}
                rows={6}
                className="form-control"
              />
              <small className="char-count">{formData.note.length}/1000</small>
            </div>

            {/* Step 7: Consegna */}
            <div className="form-step">
              <h2 className="step-title">7. Modalità Consegna</h2>
              <p className="step-note">
                ⚠️ Le torte non possono essere spedite. Solo ritiro o consegna locale.
              </p>

              <div className="delivery-options">
                {DELIVERY_OPTIONS.map(option => (
                  <label 
                    key={option.value}
                    className={`delivery-card ${formData.modalitaConsegna === option.value ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="consegna"
                      value={option.value}
                      checked={formData.modalitaConsegna === option.value}
                      onChange={(e) => handleChange('modalitaConsegna', e.target.value)}
                    />
                    <div className="delivery-content">
                      <h4>{option.label}</h4>
                      {option.address && (
                        <p className="delivery-address">
                          {option.address}
                          <a 
                            href={option.mapsLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            🗺️ Vedi su Maps
                          </a>
                        </p>
                      )}
                      {option.note && (
                        <small className="delivery-note">{option.note}</small>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {formData.modalitaConsegna === 'consegna' && (
                <div className="delivery-address-form">
                  <h4>Indirizzo di Consegna</h4>
                  <div className="form-group">
                    <label>Indirizzo Completo *</label>
                    <input
                      type="text"
                      value={formData.indirizzoConsegna}
                      onChange={(e) => handleChange('indirizzoConsegna', e.target.value)}
                      placeholder="Via, Numero Civico"
                      className={`form-control ${errors.indirizzoConsegna ? 'error' : ''}`}
                    />
                    {errors.indirizzoConsegna && <span className="error-message">{errors.indirizzoConsegna}</span>}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Città *</label>
                      <input
                        type="text"
                        value={formData.cittaConsegna}
                        onChange={(e) => handleChange('cittaConsegna', e.target.value)}
                        placeholder="Roma"
                        className={`form-control ${errors.cittaConsegna ? 'error' : ''}`}
                      />
                      {errors.cittaConsegna && <span className="error-message">{errors.cittaConsegna}</span>}
                    </div>
                    <div className="form-group">
                      <label>CAP</label>
                      <input
                        type="text"
                        value={formData.capConsegna}
                        onChange={(e) => handleChange('capConsegna', e.target.value)}
                        placeholder="00139"
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 8: Contatti Guest */}
            {!isAuthenticated && (
              <div className="form-step">
                <h2 className="step-title">8. I Tuoi Dati di Contatto</h2>
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

            {/* ✅ Step 9: reCAPTCHA (solo guest) */}
            {!isAuthenticated && (
              <div className="form-step">
                <h2 className="step-title">9. Verifica di Sicurezza</h2>
                <p className="step-note">
                  🛡️ Completa la verifica per confermare che non sei un robot
                </p>
                <div className="recaptcha-container">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                    onChange={handleRecaptchaChange}
                    theme="dark"
                  />
                </div>
                {errors.recaptcha && (
                  <span className="error-message" style={{ display: 'block', textAlign: 'center', marginTop: '0.5rem' }}>
                    {errors.recaptcha}
                  </span>
                )}
              </div>
            )}

            {/* Disclaimer Prezzo */}
            <div className="price-disclaimer">
              <h3>💰 Informazioni sul Prezzo</h3>
              <p>
                Il costo di una torta decorativa varia notevolmente in base a diversi fattori:
              </p>
              <ul>
                <li>Numero di strati e dimensioni</li>
                <li>Tipologia e marca dei dolci utilizzati</li>
                <li>Complessità delle decorazioni</li>
                <li>Elementi decorativi speciali richiesti</li>
              </ul>
              <p className="disclaimer-note">
                Per questo motivo, <strong>non forniamo un preventivo automatico</strong>. 
                Dopo aver ricevuto la tua richiesta, Valeria ti contatterà con un preventivo 
                dettagliato personalizzato sulla tua torta.
              </p>
            </div>

            {/* Submit */}
            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!isAuthenticated && !recaptchaToken}
              >
                Rivedi e Invia Richiesta
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
    </>
  );
};

// Componente Riepilogo
const TorteSummary = ({ formData, onBack, onConfirm, loading }) => {
  return (
    <div className="order-summary-page">
      <div className="container">
        <h1>Riepilogo Richiesta Torta</h1>
        
        <div className="summary-card">
          <div className="summary-section">
            <h3>Informazioni Base</h3>
            <div className="summary-row">
              <strong>Evento:</strong>
              <span>{formData.tipoEvento}</span>
            </div>
            <div className="summary-row">
              <strong>Data:</strong>
              <span>{new Date(formData.dataEvento).toLocaleDateString('it-IT')}</span>
            </div>
          </div>

          <div className="summary-section">
            <h3>Torta</h3>
            <div className="summary-row">
              <strong>Tipologia:</strong>
              <span>{formData.tipologiaTorta === 'dolci' ? 'Con Dolci' : 'Solo Decorativa'}</span>
            </div>
            <div className="summary-row">
              <strong>Strati:</strong>
              <span>{formData.numeroStrati}</span>
            </div>
            <div className="summary-row">
              <strong>Dimensione:</strong>
              <span>{CAKE_SIZES.find(s => s.value === formData.dimensione)?.label}</span>
            </div>
          </div>

          {formData.tipologiaTorta === 'dolci' && formData.tipiDolci && (
            <div className="summary-section">
              <h3>Dolci e Decorazioni</h3>
              <p>{formData.tipiDolci}</p>
              {formData.elementoDecorativo1 && <p>• {formData.elementoDecorativo1}</p>}
              {formData.elementoDecorativo2 && <p>• {formData.elementoDecorativo2}</p>}
            </div>
          )}

          {formData.tipologiaTorta === 'finta' && (
            <div className="summary-section">
              <h3>Tema e Colori</h3>
              <p><strong>Tema:</strong> {formData.tema}</p>
              {formData.colori.filter(c => c).length > 0 && (
                <p><strong>Colori:</strong> {formData.colori.filter(c => c).join(', ')}</p>
              )}
            </div>
          )}

          {formData.note && (
            <div className="summary-section">
              <h3>Note</h3>
              <p>{formData.note}</p>
            </div>
          )}

          <div className="summary-section">
            <h3>Consegna</h3>
            <p>
              {formData.modalitaConsegna === 'ritiro' 
                ? '📍 Ritiro presso Galleria PortaDiRoma'
                : `🚗 Consegna a: ${formData.indirizzoConsegna}, ${formData.cittaConsegna}`
              }
            </p>
          </div>
        </div>

        <p className="summary-disclaimer">
          Riceverai una conferma via email e verrai ricontattato da Valeria per discutere i dettagli e ricevere un preventivo personalizzato.
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

export default TortePage;