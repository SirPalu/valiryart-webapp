// frontend/src/pages/user/CreateRequestPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './CreateRequestPage.css';

const CreateRequestPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form data
  const [formData, setFormData] = useState({
    categoria: '',
    nome_contatto: user?.nome || '',
    email_contatto: user?.email || '',
    telefono_contatto: user?.telefono || '',
    descrizione: '',
    data_evento: '',
    citta: user?.citta || '',
    indirizzo_consegna: user?.indirizzo || '',
    
    // Dati specifici per categoria
    dati_specifici: {}
  });

  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle dati specifici change
  const handleDatiSpecificiChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      dati_specifici: {
        ...prev.dati_specifici,
        [key]: value
      }
    }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (files.length + selectedFiles.length > 5) {
      toast.error('Puoi caricare massimo 5 file');
      return;
    }

    setFiles(prev => [...prev, ...selectedFiles]);

    // Create previews
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews(prev => [...prev, {
          name: file.name,
          url: reader.result,
          type: file.type
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove file
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.categoria) {
      toast.error('Seleziona una categoria');
      return;
    }
    if (!formData.descrizione.trim()) {
      toast.error('Inserisci una descrizione');
      return;
    }

    try {
      setLoading(true);

      // Create FormData for multipart upload
      const submitData = new FormData();
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        if (key === 'dati_specifici') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      // Append files
      files.forEach(file => {
        submitData.append('files', file);
      });

      console.log('📤 Submitting request with files:', files.length);

      const response = await api.post('/requests', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Request created:', response.data);

      toast.success('Richiesta inviata con successo!');
      
      if (isAuthenticated) {
        navigate('/user/requests');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      toast.error(error.response?.data?.message || 'Errore nell\'invio della richiesta');
    } finally {
      setLoading(false);
    }
  };

  // Render category-specific fields
  const renderCategoryFields = () => {
    switch (formData.categoria) {
      case 'incisioni':
        return (
          <div className="category-fields">
            <h3>🪵 Dettagli Incisione</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Tipo di Oggetto</label>
                <select
                  value={formData.dati_specifici.tipo_oggetto || ''}
                  onChange={(e) => handleDatiSpecificiChange('tipo_oggetto', e.target.value)}
                  required
                >
                  <option value="">Seleziona...</option>
                  <option value="tagliere">Tagliere</option>
                  <option value="vassoio">Vassoio</option>
                  <option value="cornice">Cornice</option>
                  <option value="porta_chiavi">Porta Chiavi</option>
                  <option value="altro">Altro</option>
                </select>
              </div>

              <div className="form-group">
                <label>Dimensioni (cm)</label>
                <input
                  type="text"
                  value={formData.dati_specifici.dimensioni || ''}
                  onChange={(e) => handleDatiSpecificiChange('dimensioni', e.target.value)}
                  placeholder="Es: 30x20"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Testo da Incidere</label>
              <textarea
                value={formData.dati_specifici.testo_incisione || ''}
                onChange={(e) => handleDatiSpecificiChange('testo_incisione', e.target.value)}
                rows={3}
                placeholder="Inserisci il testo che vuoi incidere..."
              />
            </div>

            <div className="form-group">
              <label>Stile Preferito</label>
              <select
                value={formData.dati_specifici.stile || ''}
                onChange={(e) => handleDatiSpecificiChange('stile', e.target.value)}
              >
                <option value="">Seleziona...</option>
                <option value="classico">Classico</option>
                <option value="moderno">Moderno</option>
                <option value="rustico">Rustico</option>
                <option value="personalizzato">Personalizzato</option>
              </select>
            </div>
          </div>
        );

      case 'torte':
        return (
          <div className="category-fields">
            <h3>🎂 Dettagli Torta</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Numero di Persone</label>
                <input
                  type="number"
                  value={formData.dati_specifici.numero_persone || ''}
                  onChange={(e) => handleDatiSpecificiChange('numero_persone', e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Numero di Piani</label>
                <select
                  value={formData.dati_specifici.numero_piani || ''}
                  onChange={(e) => handleDatiSpecificiChange('numero_piani', e.target.value)}
                  required
                >
                  <option value="">Seleziona...</option>
                  <option value="1">1 Piano</option>
                  <option value="2">2 Piani</option>
                  <option value="3">3 Piani</option>
                  <option value="4+">4+ Piani</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Gusti Preferiti</label>
              <input
                type="text"
                value={formData.dati_specifici.gusti || ''}
                onChange={(e) => handleDatiSpecificiChange('gusti', e.target.value)}
                placeholder="Es: Cioccolato, Vaniglia, Fragola..."
              />
            </div>

            <div className="form-group">
              <label>Tema/Stile Decorazione</label>
              <input
                type="text"
                value={formData.dati_specifici.tema || ''}
                onChange={(e) => handleDatiSpecificiChange('tema', e.target.value)}
                placeholder="Es: Matrimonio, Compleanno bambini, Elegante..."
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.dati_specifici.pasta_di_zucchero || false}
                  onChange={(e) => handleDatiSpecificiChange('pasta_di_zucchero', e.target.checked)}
                />
                Decorazioni in Pasta di Zucchero
              </label>
            </div>
          </div>
        );

      case 'eventi':
        return (
          <div className="category-fields">
            <h3>🎉 Dettagli Evento</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Tipo di Evento</label>
                <select
                  value={formData.dati_specifici.tipo_evento || ''}
                  onChange={(e) => handleDatiSpecificiChange('tipo_evento', e.target.value)}
                  required
                >
                  <option value="">Seleziona...</option>
                  <option value="matrimonio">Matrimonio</option>
                  <option value="compleanno">Compleanno</option>
                  <option value="battesimo">Battesimo</option>
                  <option value="comunione">Comunione/Cresima</option>
                  <option value="laurea">Laurea</option>
                  <option value="aziendale">Evento Aziendale</option>
                  <option value="altro">Altro</option>
                </select>
              </div>

              <div className="form-group">
                <label>Numero Invitati</label>
                <input
                  type="number"
                  value={formData.dati_specifici.numero_invitati || ''}
                  onChange={(e) => handleDatiSpecificiChange('numero_invitati', e.target.value)}
                  min="1"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Elementi da Allestire</label>
              <textarea
                value={formData.dati_specifici.elementi_allestimento || ''}
                onChange={(e) => handleDatiSpecificiChange('elementi_allestimento', e.target.value)}
                rows={3}
                placeholder="Es: Tavoli, Bomboniere, Centrotavola, Backdrop..."
              />
            </div>

            <div className="form-group">
              <label>Colori Tema</label>
              <input
                type="text"
                value={formData.dati_specifici.colori_tema || ''}
                onChange={(e) => handleDatiSpecificiChange('colori_tema', e.target.value)}
                placeholder="Es: Bianco e oro, Rosa e grigio..."
              />
            </div>
          </div>
        );

      case 'altro':
        return (
          <div className="category-fields">
            <h3>💡 Dettagli Richiesta Personalizzata</h3>
            <div className="form-group">
              <label>Specifica la tua idea</label>
              <textarea
                value={formData.dati_specifici.dettagli_personalizzati || ''}
                onChange={(e) => handleDatiSpecificiChange('dettagli_personalizzati', e.target.value)}
                rows={5}
                placeholder="Descrivi la tua idea in dettaglio..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="create-request-page">
      <div className="page-header">
        <h1>✨ Nuova Richiesta Personalizzata</h1>
        <p>Raccontaci la tua idea e creiamo insieme qualcosa di unico!</p>
      </div>

      <form onSubmit={handleSubmit} className="request-form">
        {/* Step 1: Categoria */}
        <Card className="form-section">
          <h2>1️⃣ Scegli la Categoria</h2>
          <div className="categories-grid">
            {[
              { value: 'incisioni', icon: '🪵', label: 'Incisioni su Legno' },
              { value: 'torte', icon: '🎂', label: 'Torte Decorative' },
              { value: 'eventi', icon: '🎉', label: 'Allestimento Eventi' },
              { value: 'altro', icon: '💡', label: 'Altro' }
            ].map(cat => (
              <div
                key={cat.value}
                className={`category-card ${formData.categoria === cat.value ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, categoria: cat.value })}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-label">{cat.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Step 2: Dettagli Categoria */}
        {formData.categoria && (
          <Card className="form-section">
            <h2>2️⃣ Dettagli Specifici</h2>
            {renderCategoryFields()}
          </Card>
        )}

        {/* Step 3: Descrizione Generale */}
        <Card className="form-section">
          <h2>3️⃣ Descrizione Generale</h2>
          <div className="form-group">
            <label>Descrivi la tua richiesta *</label>
            <textarea
              name="descrizione"
              value={formData.descrizione}
              onChange={handleChange}
              rows={5}
              required
              placeholder="Fornisci tutti i dettagli che ritieni utili..."
            />
          </div>
        </Card>

        {/* Step 4: Upload Immagini */}
        <Card className="form-section">
          <h2>4️⃣ Carica Immagini di Riferimento</h2>
          <p className="help-text">
            Carica foto di ispirazione o esempi di quello che hai in mente (max 5 file, 10MB ciascuno)
          </p>

          <div className="file-upload-area">
            <input
              type="file"
              id="file-upload"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="file-upload-button">
              📷 Scegli Immagini
            </label>
          </div>

          {filePreviews.length > 0 && (
            <div className="file-previews">
              {filePreviews.map((preview, index) => (
                <div key={index} className="file-preview">
                  {preview.type.startsWith('image/') ? (
                    <img src={preview.url} alt={preview.name} />
                  ) : (
                    <div className="file-icon">📄</div>
                  )}
                  <span className="file-name">{preview.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="remove-file"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Step 5: Info Contatto */}
        <Card className="form-section">
          <h2>5️⃣ Informazioni di Contatto</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Nome Completo *</label>
              <input
                type="text"
                name="nome_contatto"
                value={formData.nome_contatto}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email_contatto"
                value={formData.email_contatto}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Telefono</label>
              <input
                type="tel"
                name="telefono_contatto"
                value={formData.telefono_contatto}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Data Evento (se applicabile)</label>
              <input
                type="date"
                name="data_evento"
                value={formData.data_evento}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Città</label>
              <input
                type="text"
                name="citta"
                value={formData.citta}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Indirizzo Consegna</label>
              <input
                type="text"
                name="indirizzo_consegna"
                value={formData.indirizzo_consegna}
                onChange={handleChange}
              />
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="form-actions">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            ← Annulla
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={loading || !formData.categoria}
          >
            {loading ? 'Invio in corso...' : '📩 Invia Richiesta'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequestPage;