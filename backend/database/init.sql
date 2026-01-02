-- ============================================
-- VALIRYART DATABASE SCHEMA
-- PostgreSQL 14+
-- ============================================

-- Estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUM TYPES (per garantire consistenza dati)
-- ============================================

CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE request_category AS ENUM ('incisioni', 'torte', 'eventi', 'altro');
CREATE TYPE request_status AS ENUM (
    'nuova',
    'in_valutazione', 
    'preventivo_inviato',
    'accettata',
    'in_lavorazione',
    'completata',
    'rifiutata',
    'annullata'
);
CREATE TYPE sender_type AS ENUM ('user', 'admin');
CREATE TYPE portfolio_category AS ENUM ('incisioni', 'torte', 'eventi');

-- ============================================
-- TABELLA: users
-- Gestisce utenti registrati e admin
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL se login solo con Google
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    indirizzo TEXT,
    citta VARCHAR(100),
    cap VARCHAR(10),
    provincia VARCHAR(2),
    
    -- Google OAuth
    google_id VARCHAR(255) UNIQUE,
    google_avatar_url TEXT,
    
    -- Ruolo e stato
    ruolo user_role DEFAULT 'user' NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    attivo BOOLEAN DEFAULT true,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Indici per performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_ruolo ON users(ruolo);

-- ============================================
-- TABELLA: requests
-- Gestisce tutte le richieste (anche guest)
-- ============================================
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Riferimento utente (NULL per guest)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Dati base richiesta
    categoria request_category NOT NULL,
    stato request_status DEFAULT 'nuova' NOT NULL,
    
    -- Dati contatto (per guest o override)
    email_contatto VARCHAR(255) NOT NULL,
    nome_contatto VARCHAR(100) NOT NULL,
    telefono_contatto VARCHAR(20),
    
    -- Descrizione richiesta
    descrizione TEXT NOT NULL,
    
    -- Dati specifici categoria (JSON per flessibilità)
    dati_specifici JSONB, -- {dimensioni, colore, urgenza, data_evento, etc}
    
    -- Preventivo e note admin
    preventivo_importo DECIMAL(10,2),
    preventivo_note TEXT,
    note_admin TEXT, -- Note private Valeria
    
    -- Date importanti
    data_evento DATE, -- Solo per eventi/torte
    data_consegna_prevista DATE,
    
    -- Località (per torte/eventi)
    citta VARCHAR(100),
    indirizzo_consegna TEXT,
    
    -- Timestamp e tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stato_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completata_at TIMESTAMP
);

-- Indici per performance
CREATE INDEX idx_requests_user_id ON requests(user_id);
CREATE INDEX idx_requests_categoria ON requests(categoria);
CREATE INDEX idx_requests_stato ON requests(stato);
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX idx_requests_email ON requests(email_contatto);

-- Indice GIN per ricerca in JSON
CREATE INDEX idx_requests_dati_specifici ON requests USING GIN (dati_specifici);

-- ============================================
-- TABELLA: request_attachments
-- Allegati/immagini caricate con richiesta
-- ============================================
CREATE TABLE request_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    
    -- File info
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER, -- bytes
    mime_type VARCHAR(100),
    
    -- Metadati
    descrizione TEXT,
    ordine INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachments_request_id ON request_attachments(request_id);

-- ============================================
-- TABELLA: messages
-- Thread conversazioni richieste
-- ============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    
    -- Mittente
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sender_type sender_type NOT NULL, -- 'user' o 'admin'
    sender_email VARCHAR(255), -- Per guest users
    
    -- Contenuto
    messaggio TEXT NOT NULL,
    
    -- Allegati (array di ID o paths)
    allegati JSONB, -- [{filename, path, size}, ...]
    
    -- Stato lettura
    read_by_admin BOOLEAN DEFAULT false,
    read_by_user BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_request_id ON messages(request_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_unread_admin ON messages(read_by_admin) WHERE sender_type = 'user';

-- ============================================
-- TABELLA: portfolio
-- Opere/progetti completati da mostrare
-- ============================================
CREATE TABLE portfolio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Categorizzazione
    categoria portfolio_category NOT NULL,
    titolo VARCHAR(255) NOT NULL,
    descrizione TEXT,
    
    -- Immagine principale
    immagine_url TEXT NOT NULL,
    immagine_thumbnail_url TEXT, -- Versione ottimizzata
    
    -- Metadati opera
    dimensioni VARCHAR(100), -- es: "30x40 cm"
    materiali TEXT,
    tempo_realizzazione VARCHAR(50), -- es: "2 settimane"
    prezzo_riferimento DECIMAL(10,2), -- Prezzo indicativo
    
    -- SEO
    alt_text VARCHAR(255),
    tags TEXT[], -- Array di tag per ricerca futura
    
    -- Visibilità e ordinamento
    pubblicato BOOLEAN DEFAULT true,
    in_evidenza BOOLEAN DEFAULT false, -- Per homepage
    ordine INTEGER DEFAULT 0,
    
    -- Statistiche
    visualizzazioni INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_portfolio_categoria ON portfolio(categoria);
CREATE INDEX idx_portfolio_pubblicato ON portfolio(pubblicato);
CREATE INDEX idx_portfolio_evidenza ON portfolio(in_evidenza) WHERE in_evidenza = true;
CREATE INDEX idx_portfolio_ordine ON portfolio(categoria, ordine);

-- ============================================
-- TABELLA: design_gallery
-- Galleria disegni selezionabili per incisioni
-- ============================================
CREATE TABLE design_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    titolo VARCHAR(255) NOT NULL,
    descrizione TEXT,
    
    -- Immagine
    immagine_url TEXT NOT NULL,
    immagine_thumbnail_url TEXT,
    
    -- Categorizzazione
    categoria VARCHAR(50), -- es: "animali", "natura", "geometrico"
    tags TEXT[],
    
    -- Complessità (influenza prezzo)
    complessita VARCHAR(20), -- 'semplice', 'media', 'complessa'
    
    -- Visibilità
    pubblicato BOOLEAN DEFAULT true,
    popolare BOOLEAN DEFAULT false,
    ordine INTEGER DEFAULT 0,
    
    -- Statistiche
    volte_scelto INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_designs_pubblicato ON design_gallery(pubblicato);
CREATE INDEX idx_designs_categoria ON design_gallery(categoria);
CREATE INDEX idx_designs_complessita ON design_gallery(complessita);

-- ============================================
-- TABELLA: prices
-- Listino prezzi base per calcolo preventivi
-- ============================================
CREATE TABLE prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Categoria servizio
    categoria request_category NOT NULL,
    
    -- Parametri pricing (JSON per flessibilità)
    parametri JSONB NOT NULL, -- {dimensione: "20x30", complessita: "media", etc}
    
    -- Prezzi
    prezzo_base DECIMAL(10,2) NOT NULL,
    prezzo_con_colore DECIMAL(10,2), -- Solo per incisioni
    
    -- Descrizione
    descrizione TEXT,
    note TEXT,
    
    -- Validità
    attivo BOOLEAN DEFAULT true,
    valido_dal DATE DEFAULT CURRENT_DATE,
    valido_fino DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prices_categoria ON prices(categoria);
CREATE INDEX idx_prices_attivo ON prices(attivo);

-- ============================================
-- TABELLA: shipping_rates
-- Tariffe spedizione
-- ============================================
CREATE TABLE shipping_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parametri spedizione
    peso_min DECIMAL(5,2), -- kg
    peso_max DECIMAL(5,2),
    zona VARCHAR(50), -- 'nazionale', 'isole', etc
    
    -- Costi
    costo_base DECIMAL(10,2) NOT NULL,
    costo_assicurazione DECIMAL(10,2) DEFAULT 0,
    
    -- Tempi consegna stimati
    giorni_consegna_min INTEGER,
    giorni_consegna_max INTEGER,
    
    attivo BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELLA: content_pages
-- Contenuti pagine statiche editabili
-- ============================================
CREATE TABLE content_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificatore pagina
    slug VARCHAR(100) UNIQUE NOT NULL, -- 'chi-sono', 'come-funziona', etc
    titolo VARCHAR(255) NOT NULL,
    
    -- Contenuto
    contenuto TEXT NOT NULL, -- HTML o Markdown
    meta_description VARCHAR(255), -- SEO
    meta_keywords TEXT,
    
    -- Versioning
    versione INTEGER DEFAULT 1,
    
    -- Pubblicazione
    pubblicato BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_content_slug ON content_pages(slug);

-- ============================================
-- TABELLA: notifications
-- Log notifiche email inviate
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Riferimenti
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
    
    -- Destinatario
    destinatario_email VARCHAR(255) NOT NULL,
    
    -- Tipo notifica
    tipo VARCHAR(50) NOT NULL, -- 'nuova_richiesta', 'cambio_stato', 'nuovo_messaggio', etc
    
    -- Contenuto
    oggetto VARCHAR(255) NOT NULL,
    corpo TEXT NOT NULL,
    
    -- Stato invio
    inviata BOOLEAN DEFAULT false,
    inviata_at TIMESTAMP,
    errore TEXT,
    tentativi INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_request ON notifications(request_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_inviata ON notifications(inviata);

-- ============================================
-- TABELLA: activity_log
-- Log azioni admin per audit
-- ============================================
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Azione
    azione VARCHAR(100) NOT NULL, -- 'create_request', 'update_status', 'upload_image', etc
    entita VARCHAR(50) NOT NULL, -- 'request', 'portfolio', 'user', etc
    entita_id UUID,
    
    -- Dettagli
    dettagli JSONB, -- Dati prima/dopo modifica
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_user ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_entita ON activity_log(entita, entita_id);

-- ============================================
-- TABELLA: settings
-- Configurazioni generali piattaforma
-- ============================================
CREATE TABLE settings (
    chiave VARCHAR(100) PRIMARY KEY,
    valore TEXT,
    tipo VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    descrizione TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

-- Inserimento settings base
INSERT INTO settings (chiave, valore, tipo, descrizione) VALUES
('email_notifiche', 'valiryart93@gmail.com', 'string', 'Email admin per notifiche'),
('whatsapp_numero', '+39xxxxxxxxxx', 'string', 'Numero WhatsApp per contatti'),
('instagram_username', 'valiryart', 'string', 'Username Instagram'),
('spedizione_base_costo', '10.00', 'number', 'Costo base spedizione nazionale'),
('richieste_max_allegati', '5', 'number', 'Max allegati per richiesta'),
('allegato_max_size_mb', '10', 'number', 'Dimensione max allegato in MB');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Funzione per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger su tabelle con updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_updated_at BEFORE UPDATE ON portfolio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prices_updated_at BEFORE UPDATE ON prices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funzione per tracciare cambio stato richieste
CREATE OR REPLACE FUNCTION track_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stato IS DISTINCT FROM OLD.stato THEN
        NEW.stato_changed_at = CURRENT_TIMESTAMP;
        IF NEW.stato = 'completata' THEN
            NEW.completata_at = CURRENT_TIMESTAMP;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER track_request_status BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION track_request_status_change();

-- ============================================
-- VIEWS UTILI
-- ============================================

-- Vista richieste con dati utente
CREATE VIEW v_requests_full AS
SELECT 
    r.*,
    u.nome as user_nome,
    u.cognome as user_cognome,
    u.email as user_email,
    u.telefono as user_telefono,
    (SELECT COUNT(*) FROM messages m WHERE m.request_id = r.id) as totale_messaggi,
    (SELECT COUNT(*) FROM messages m WHERE m.request_id = r.id AND m.read_by_admin = false AND m.sender_type = 'user') as messaggi_non_letti
FROM requests r
LEFT JOIN users u ON r.user_id = u.id;

-- Vista statistiche dashboard admin
CREATE VIEW v_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM requests WHERE stato = 'nuova') as richieste_nuove,
    (SELECT COUNT(*) FROM requests WHERE stato = 'in_valutazione') as richieste_in_valutazione,
    (SELECT COUNT(*) FROM requests WHERE stato = 'in_lavorazione') as richieste_in_lavorazione,
    (SELECT COUNT(*) FROM requests WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as richieste_ultimo_mese,
    (SELECT COUNT(*) FROM users WHERE ruolo = 'user') as utenti_registrati,
    (SELECT COUNT(*) FROM messages WHERE read_by_admin = false AND sender_type = 'user') as messaggi_non_letti_totali;

-- ============================================
-- SAMPLE DATA (per testing)
-- ============================================

-- Admin user (password: Admin123!)
INSERT INTO users (email, password_hash, nome, cognome, ruolo, email_verified) VALUES
('valeria@valiryart.it', crypt('Admin123!', gen_salt('bf')), 'Valeria', 'Admin', 'admin', true);

-- Pagine contenuti base
INSERT INTO content_pages (slug, titolo, contenuto, pubblicato) VALUES
('chi-sono', 'Chi Sono', '<h2>Ciao! Sono Valeria</h2><p>Testo da definire...</p>', true),
('come-funziona', 'Come Funziona', '<h2>Come funziona il servizio</h2><p>Testo da definire...</p>', true),
('privacy-policy', 'Privacy Policy', '<p>Testo da definire...</p>', true),
('termini-servizio', 'Termini di Servizio', '<p>Testo da definire...</p>', true);

-- ============================================
-- COMMENTI FINALI
-- ============================================

-- Per verificare la creazione:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Per vedere gli enum:
-- SELECT typname, typtype FROM pg_type WHERE typtype = 'e';

COMMENT ON DATABASE valiryart IS 'Database principale ValiryArt Web App';