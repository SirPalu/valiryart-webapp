-- ============================================
-- MIGRATION: ADD REVIEWS TABLE
-- ============================================
-- Tabella per gestire le recensioni degli utenti
-- Solo utenti con almeno 1 richiesta completata possono recensire

CREATE TABLE IF NOT EXISTS reviews (
    -- Chiave primaria
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relazioni
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    
    -- Contenuto recensione
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    titolo VARCHAR(100),
    testo TEXT NOT NULL CHECK (char_length(testo) <= 500),
    
    -- Media (foto lavoro completato)
    foto_url TEXT,
    
    -- Risposta admin
    risposta_admin TEXT,
    risposta_admin_at TIMESTAMP,
    risposta_admin_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Moderazione
    approvata BOOLEAN DEFAULT false,
    pubblicata BOOLEAN DEFAULT true,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: 1 recensione per richiesta
    UNIQUE(user_id, request_id)
);

-- ============================================
-- INDICI PER PERFORMANCE
-- ============================================
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_request ON reviews(request_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_approvata ON reviews(approvata, pubblicata);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);

-- ============================================
-- TRIGGER PER UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

-- ============================================
-- COMMENTI TABELLA
-- ============================================
COMMENT ON TABLE reviews IS 'Recensioni utenti per richieste completate';
COMMENT ON COLUMN reviews.rating IS 'Valutazione da 1 a 5 stelle';
COMMENT ON COLUMN reviews.testo IS 'Testo recensione (max 500 caratteri)';
COMMENT ON COLUMN reviews.approvata IS 'Recensione approvata da admin';
COMMENT ON COLUMN reviews.pubblicata IS 'Recensione visibile pubblicamente';