-- Script SQL para criar tabelas de candidatos e buscas

-- Tabela para armazenar buscas realizadas
CREATE TABLE IF NOT EXISTS candidate_searches (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL,
    search_provider VARCHAR(50) NOT NULL DEFAULT 'coresignal', -- 'coresignal', 'phantombuster', etc.
    search_filters JSONB, -- Filtros utilizados na busca
    search_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'error'
    total_results INTEGER DEFAULT 0,
    search_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para performance
    INDEX idx_candidate_searches_job_id (job_id),
    INDEX idx_candidate_searches_status (search_status),
    INDEX idx_candidate_searches_provider (search_provider),
    INDEX idx_candidate_searches_time (search_time)
);

-- Tabela para armazenar candidatos encontrados
CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    search_id INTEGER NOT NULL,
    external_id VARCHAR(255), -- ID do candidato no provedor (Coresignal, etc.)
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    company VARCHAR(255),
    location VARCHAR(255),
    profile_url TEXT,
    image_url TEXT,
    industry VARCHAR(255),
    experience_years INTEGER,
    skills JSONB, -- Array de habilidades
    education JSONB, -- Array de educação
    summary TEXT,
    connections_count INTEGER,
    premium BOOLEAN DEFAULT FALSE,
    confidence_score DECIMAL(3,2), -- Score de confiança (0.00 a 1.00)
    last_updated TIMESTAMP,
    raw_data JSONB, -- Dados brutos do provedor
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Relacionamento com busca
    FOREIGN KEY (search_id) REFERENCES candidate_searches(id) ON DELETE CASCADE,
    
    -- Índices para performance
    INDEX idx_candidates_search_id (search_id),
    INDEX idx_candidates_external_id (external_id),
    INDEX idx_candidates_name (name),
    INDEX idx_candidates_company (company),
    INDEX idx_candidates_location (location),
    INDEX idx_candidates_experience (experience_years),
    INDEX idx_candidates_confidence (confidence_score)
);

-- Tabela para armazenar interações com candidatos
CREATE TABLE IF NOT EXISTS candidate_interactions (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL,
    interaction_type VARCHAR(50) NOT NULL, -- 'viewed', 'contacted', 'interested', 'rejected'
    notes TEXT,
    user_id INTEGER, -- ID do usuário que fez a interação
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Relacionamento com candidato
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    
    -- Índices
    INDEX idx_candidate_interactions_candidate_id (candidate_id),
    INDEX idx_candidate_interactions_type (interaction_type),
    INDEX idx_candidate_interactions_user_id (user_id),
    INDEX idx_candidate_interactions_created (created_at)
);

-- Tabela para armazenar tags/etiquetas dos candidatos
CREATE TABLE IF NOT EXISTS candidate_tags (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL,
    tag_name VARCHAR(100) NOT NULL,
    tag_color VARCHAR(7) DEFAULT '#3B82F6', -- Cor em hex
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Relacionamento com candidato
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    
    -- Evitar tags duplicadas para o mesmo candidato
    UNIQUE KEY unique_candidate_tag (candidate_id, tag_name),
    
    -- Índices
    INDEX idx_candidate_tags_candidate_id (candidate_id),
    INDEX idx_candidate_tags_name (tag_name)
);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas
CREATE TRIGGER update_candidate_searches_updated_at 
    BEFORE UPDATE ON candidate_searches 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at 
    BEFORE UPDATE ON candidates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de exemplo (opcional)
-- INSERT INTO candidate_searches (job_id, search_provider, search_filters, search_status, total_results) 
-- VALUES (1, 'coresignal', '{"title": "engenheiro", "location": "Brazil"}', 'completed', 25);

-- Views úteis para relatórios
CREATE OR REPLACE VIEW candidate_search_summary AS
SELECT 
    cs.id,
    cs.job_id,
    cs.search_provider,
    cs.search_status,
    cs.total_results,
    cs.search_time,
    COUNT(c.id) as candidates_saved,
    COUNT(ci.id) as total_interactions,
    COUNT(CASE WHEN ci.interaction_type = 'contacted' THEN 1 END) as contacted_count,
    COUNT(CASE WHEN ci.interaction_type = 'interested' THEN 1 END) as interested_count
FROM candidate_searches cs
LEFT JOIN candidates c ON cs.id = c.search_id
LEFT JOIN candidate_interactions ci ON c.id = ci.candidate_id
GROUP BY cs.id, cs.job_id, cs.search_provider, cs.search_status, cs.total_results, cs.search_time;

CREATE OR REPLACE VIEW top_candidates AS
SELECT 
    c.*,
    cs.job_id,
    COUNT(ci.id) as interaction_count,
    MAX(ci.created_at) as last_interaction
FROM candidates c
JOIN candidate_searches cs ON c.search_id = cs.id
LEFT JOIN candidate_interactions ci ON c.id = ci.candidate_id
GROUP BY c.id, cs.job_id
ORDER BY c.confidence_score DESC, interaction_count DESC;

-- Comentários nas tabelas
COMMENT ON TABLE candidate_searches IS 'Armazena informações sobre buscas de candidatos realizadas';
COMMENT ON TABLE candidates IS 'Armazena dados dos candidatos encontrados nas buscas';
COMMENT ON TABLE candidate_interactions IS 'Registra interações dos usuários com os candidatos';
COMMENT ON TABLE candidate_tags IS 'Tags/etiquetas para categorizar candidatos';

COMMENT ON COLUMN candidate_searches.search_filters IS 'Filtros JSON utilizados na busca (keywords, localização, etc.)';
COMMENT ON COLUMN candidates.raw_data IS 'Dados brutos completos retornados pelo provedor da API';
COMMENT ON COLUMN candidates.confidence_score IS 'Score de confiança/relevância do candidato (0.00 a 1.00)';

