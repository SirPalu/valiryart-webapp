import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestsAPI } from '../../services/api';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import './IncisioniPage.css';

// Dati prodotti
const PRODUCTS = {
  portafoto: {
    name: 'Portafoto',
    sizes: [{ label: '20 x 16 cm', price: 22 }],
    image: '/uploads/products/portafoto.jpg'
  },
  tronco: {
    name: 'Sezione Tronco',
    sizes: [
      { label: 'Piccola (13-14 cm)', price: 13 },
      { label: 'Grande (21-23 cm)', price: 23 }
    ],
    image: '/uploads/products/tronco.jpg'
  },
  portapenne: {
    name: 'Portapenne',
    sizes: [{ label: '8 x 8 x 10 cm', price: 15 }],
    image: '/uploads/products/portapenne.jpg'
  },
  portavino: {
    name: 'Porta Vino',
    sizes: [{ label: '35 x 9.8 x 10 cm', price: 38 }],
    image: '/uploads/products/portavino.jpg'
  },
  foglio: {
    name: 'Foglio di Legno',
    sizes: [
      { label: 'A5 (210 x 150 mm)', price: 11 },
      { label: 'A4 (300 x 210 mm)', price: 13 },
      { label: 'A3 (420 x 300 mm)', price: 16 },
      { label: 'Quadrato (300 x 300 mm)', price: 16 }
    ],
    image: '/uploads/products/foglio.jpg'
  },
  cofanetto: {
    name: 'Cofanetto',
    sizes: [
      { label: 'Mini (9 x 5 x 4.5 cm)', price: 15 },
      { label: 'Medio (14.8 x 10.2 x 6.3 cm)', price: 22 },
      { label: 'Grande (33.8 x 24.8 x 10 cm)', price: 42 }
    ],
    image: '/uploads/products/cofanetto.jpg'
  },
  tagliere: {
    name: 'Tagliere',
    sizes: [{ label: '30 x 20 cm', price: 28 }],
    image: '/uploads/products/tagliere.jpg'
  }
};

const COLOR_OPTIONS = [
  { value: 'none', label: 'Nessun Colore', price: 0 },
  { value: 'partial', label: 'Parzialmente Colorato', price: 5 },
  { value: 'full', label: 'Totalmente Colorato', price: 13 }
];

const DESIGN_CATEGORIES = [
  'fantasy', 'film', 'anime', 'floreali', 'geometrico', 'natura', 'altro'
];

const IncisioniPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    productType: '',
    sizeIndex: 0,
    imageSource: 'upload', // 'upload' o 'gallery'
    uploadedImage: null,
    selectedDesign: null,
    designCategory: '',
    colorOption: 'none',
    colors: ['', '', ''],
    notes: '',
    // Dati contatto (guest)
    email: user?.email || '',
    nome: user?.nome || '',
    telefono: user?.telefono || ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  // Calcola prezzo in tempo reale
  useEffect(() => {
    calculatePrice();
  }, [formData.productType, formData.sizeIndex, formData.colorOption]);

  const calculatePrice = () => {
    if (!formData.productType) {
      setCalculatedPrice(0);
      return;
    }

    const product = PRODUCTS[formData.productType];
    const basePrice = product.sizes[formData.sizeIndex].price;
    const colorPrice = COLOR_OPTIONS.find(opt => opt.value === formData.colorOption)?.price || 0;

    setCalculatedPrice(basePrice + colorPrice);
  };

  const handleProductSelect = (productKey) => {
    setFormData(prev => ({
      ...prev,
      productType: productKey,
      sizeIndex: 0
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'File troppo grande (max 10MB)' }));
        return;
      }
      setFormData(prev => ({ ...prev, uploadedImage: file }));
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleColorChange = (index, value) => {
    const newColors = [...formData.colors];
    newColors[index] = value;
    setFormData(prev => ({ ...prev, colors: newColors }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productType) {
      newErrors.product = 'Seleziona un prodotto';
    }

    if (formData.imageSource === 'upload' && !formData.uploadedImage) {
      newErrors.image = 'Carica un\'immagine o scegli dalla galleria';
    }

    if (formData.imageSource === 'gallery' && !formData.selectedDesign) {
      newErrors.image = 'Seleziona un disegno dalla galleria';
    }

    if (formData.colorOption !== 'none') {
      const hasColors = formData.colors.some(c => c.trim() !== '');
      if (!hasColors) {
        newErrors.colors = 'Indica almeno un colore desiderato';
      }
    }

    // Validazione contatti per guest
    if (!isAuthenticated) {
      if (!formData.email) {
        newErrors.email = 'Email obbligatoria';
      }
      if (!formData.nome) {
        newErrors.nome = 'Nome obbligatorio';
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
    const product = PRODUCTS[formData.productType];
    const selectedSize = product.sizes[formData.sizeIndex];

    const requestData = {
      categoria: 'incisioni',
      email_contatto: formData.email,
      nome_contatto: formData.nome,
      telefono_contatto: formData.telefono,
      descrizione: `Incisione su ${product.name} - ${selectedSize.label}`,
      dati_specifici: {
        product: formData.productType,
        productName: product.name,
        size: selectedSize.label,
        basePrice: selectedSize.price,
        colorOption: formData.colorOption,
        colors: formData.colorOption !== 'none' ? formData.colors.filter(c => c) : [],
        colorPrice: COLOR_OPTIONS.find(opt => opt.value === formData.colorOption)?.price || 0,
        totalPrice: calculatedPrice,
        imageSource: formData.imageSource,
        designCategory: formData.designCategory,
        notes: formData.notes
      }
    };

    // Se c'è immagine upload, usa FormData
    if (formData.uploadedImage) {
      const formDataToSend = new FormData();
      
      // ✅ Aggiungi tutti i campi
      Object.keys(requestData).forEach(key => {
        if (key === 'dati_specifici') {
          formDataToSend.append(key, JSON.stringify(requestData[key]));
        } else if (requestData[key]) { // ← Verifica che il valore non sia undefined/null
          formDataToSend.append(key, requestData[key]);
        }
      });
      
      // ✅ CORREZIONE: Usa 'files' invece di 'image'
      formDataToSend.append('files', formData.uploadedImage);
      
      // ✅ DEBUG: Verifica FormData (rimuovi dopo test)
      console.log('📦 FormData contents:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ':', pair[1] instanceof File ? `[File: ${pair[1].name}]` : pair[1]);
      }
      
      await requestsAPI.create(formDataToSend);
    } else {
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
    console.error('❌ Error response:', error.response?.data);
    toast.error(error.response?.data?.message || 'Errore nell\'invio della richiesta');
  } finally {
    setLoading(false);
  }
};

  if (showSummary) {
    return <OrderSummary 
      formData={formData} 
      product={PRODUCTS[formData.productType]}
      calculatedPrice={calculatedPrice}
      onBack={() => setShowSummary(false)}
      onConfirm={confirmSubmit}
      loading={loading}
    />;
  }

  return (
    <div className="incisioni-page">
      {/* Hero con info artigianale */}
      <section className="incisioni-hero">
        <div className="container">
          <h1>Incisioni su Legno</h1>
          <p className="hero-subtitle">Opere Personalizzate Realizzate a Mano con Pirografo</p>
          <div className="artisan-badge">
            <span className="badge-icon">🔥</span>
            <div className="badge-text">
              <strong>100% Artigianale</strong>
              <p>Ogni incisione è realizzata a mano libera, non usiamo stampanti laser. Questo rende ogni pezzo unico e valorizza le naturali venature del legno.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="incisioni-form-section">
        <div className="container">
          <form onSubmit={handleSubmit} className="incisioni-form">
            
            {/* Step 1: Selezione Prodotto */}
            <div className="form-step">
              <h2 className="step-title">1. Scegli l'Oggetto</h2>
              <div className="products-grid">
                {Object.entries(PRODUCTS).map(([key, product]) => (
                  <div 
                    key={key}
                    className={`product-card ${formData.productType === key ? 'selected' : ''}`}
                    onClick={() => handleProductSelect(key)}
                  >
                    <div className="product-image">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <h3>{product.name}</h3>
                    <p className="product-price">
                      da €{Math.min(...product.sizes.map(s => s.price))}
                    </p>
                  </div>
                ))}
              </div>
              {errors.product && <span className="error-message">{errors.product}</span>}
            </div>

            {/* Step 2: Dimensione */}
            {formData.productType && (
              <div className="form-step">
                <h2 className="step-title">2. Scegli la Dimensione</h2>
                <div className="size-options">
                  {PRODUCTS[formData.productType].sizes.map((size, index) => (
                    <label key={index} className="radio-card">
                      <input
                        type="radio"
                        name="size"
                        checked={formData.sizeIndex === index}
                        onChange={() => setFormData(prev => ({ ...prev, sizeIndex: index }))}
                      />
                      <div className="radio-content">
                        <span className="size-label">{size.label}</span>
                        <span className="size-price">€{size.price}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Immagine */}
            {formData.productType && (
              <div className="form-step">
                <h2 className="step-title">3. Scegli l'Immagine da Incidere</h2>
                <p className="step-note">
                  ⚠️ Il prezzo finale dipenderà dalla complessità dell'immagine scelta. Immagini molto dettagliate richiedono più tempo di lavorazione.
                </p>
                
                <div className="image-source-tabs">
                  <button
                    type="button"
                    className={`tab-button ${formData.imageSource === 'upload' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, imageSource: 'upload' }))}
                  >
                    📤 Carica la Tua Immagine
                  </button>
                  <button
                    type="button"
                    className={`tab-button ${formData.imageSource === 'gallery' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, imageSource: 'gallery' }))}
                  >
                    🎨 Scegli dalla Galleria
                  </button>
                </div>

                {formData.imageSource === 'upload' ? (
                  <div className="upload-area">
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="file-input"
                    />
                    <label htmlFor="imageUpload" className="upload-label">
                      <span className="upload-icon">📸</span>
                      <span>Clicca per caricare o trascina qui</span>
                      <small>Max 10MB - JPG, PNG</small>
                    </label>
                    {formData.uploadedImage && (
                      <div className="uploaded-preview">
                        ✅ {formData.uploadedImage.name}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="gallery-selector">
                    <p>🎨 Galleria disegni in arrivo! Per ora carica la tua immagine.</p>
                    {/* TODO: Implementare galleria quando avremo le immagini */}
                  </div>
                )}
                
                {errors.image && <span className="error-message">{errors.image}</span>}
              </div>
            )}

            {/* Step 4: Colore */}
            {formData.productType && (
              <div className="form-step">
                <h2 className="step-title">4. Applicazione Colore (Opzionale)</h2>
                <p className="step-note">Colori applicati a mano con pennello su tempera</p>
                
                <div className="color-options">
                  {COLOR_OPTIONS.map(option => (
                    <label key={option.value} className="radio-card">
                      <input
                        type="radio"
                        name="color"
                        value={option.value}
                        checked={formData.colorOption === option.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, colorOption: e.target.value }))}
                      />
                      <div className="radio-content">
                        <span className="color-label">{option.label}</span>
                        {option.price > 0 && (
                          <span className="color-price">+€{option.price}</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                {formData.colorOption !== 'none' && (
                  <div className="colors-input">
                    <label>Indica fino a 3 colori desiderati:</label>
                    {[0, 1, 2].map(index => (
                      <input
                        key={index}
                        type="text"
                        placeholder={`Colore ${index + 1} (es: Rosso, Blu scuro, etc.)`}
                        value={formData.colors[index]}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                        className="form-control"
                      />
                    ))}
                    {errors.colors && <span className="error-message">{errors.colors}</span>}
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Note */}
            {formData.productType && (
              <div className="form-step">
                <h2 className="step-title">5. Note Aggiuntive (Opzionale)</h2>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Indica eventuali preferenze: posizione dell'immagine, modifiche, urgenza, etc. (max 500 caratteri)"
                  maxLength={500}
                  rows={5}
                  className="form-control"
                />
                <small className="char-count">{formData.notes.length}/500</small>
              </div>
            )}

            {/* Step 6: Dati Contatto (solo guest) */}
            {!isAuthenticated && formData.productType && (
              <div className="form-step">
                <h2 className="step-title">6. I Tuoi Dati di Contatto</h2>
                <div className="contact-grid">
                  <div className="form-group">
                    <label>Nome *</label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      className={`form-control ${errors.nome ? 'error' : ''}`}
                    />
                    {errors.nome && <span className="error-message">{errors.nome}</span>}
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`form-control ${errors.email ? 'error' : ''}`}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label>Telefono</label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Prezzo Totale */}
            {calculatedPrice > 0 && (
              <div className="price-summary">
                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Prezzo Base:</span>
                    <span>€{PRODUCTS[formData.productType].sizes[formData.sizeIndex].price}</span>
                  </div>
                  {formData.colorOption !== 'none' && (
                    <div className="price-row">
                      <span>Colore:</span>
                      <span>+€{COLOR_OPTIONS.find(opt => opt.value === formData.colorOption)?.price}</span>
                    </div>
                  )}
                  <div className="price-row total">
                    <span>Totale Stimato:</span>
                    <span>€{calculatedPrice}</span>
                  </div>
                </div>
                <p className="price-note">
                  ⚠️ Prezzo orientativo. Il costo finale sarà comunicato dopo la valutazione dell'immagine.
                </p>
              </div>
            )}

            {/* Submit */}
            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!formData.productType}
              >
                Rivedi Riepilogo e Invia
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

// Componente Riepilogo Ordine
const OrderSummary = ({ formData, product, calculatedPrice, onBack, onConfirm, loading }) => {
  return (
    <div className="order-summary-page">
      <div className="container">
        <h1>Riepilogo Richiesta</h1>
        
        <div className="summary-card">
          <div className="summary-row">
            <strong>Prodotto:</strong>
            <span>{product.name}</span>
          </div>
          <div className="summary-row">
            <strong>Dimensione:</strong>
            <span>{product.sizes[formData.sizeIndex].label}</span>
          </div>
          <div className="summary-row">
            <strong>Immagine:</strong>
            <span>{formData.imageSource === 'upload' ? `File: ${formData.uploadedImage.name}` : 'Dalla galleria'}</span>
          </div>
          <div className="summary-row">
            <strong>Colore:</strong>
            <span>{COLOR_OPTIONS.find(opt => opt.value === formData.colorOption)?.label}</span>
          </div>
          {formData.colorOption !== 'none' && formData.colors.filter(c => c).length > 0 && (
            <div className="summary-row">
              <strong>Colori scelti:</strong>
              <span>{formData.colors.filter(c => c).join(', ')}</span>
            </div>
          )}
          {formData.notes && (
            <div className="summary-row">
              <strong>Note:</strong>
              <span>{formData.notes}</span>
            </div>
          )}
          <div className="summary-row total">
            <strong>Prezzo Stimato:</strong>
            <strong>€{calculatedPrice}</strong>
          </div>
        </div>

        <p className="summary-disclaimer">
          Riceverai una conferma via email e verrai ricontattato per definire i dettagli finali e il prezzo definitivo.
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

export default IncisioniPage;