-- ============================================================================
-- SCRIPT DE MELHORIAS DO BANCO DE DADOS - FASES 2 E 3
-- Plataforma de Entrevistas com IA
-- Data: 01/08/2025
-- ============================================================================

-- Verificar se as tabelas já existem antes de criar
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';

-- ============================================================================
-- 1. EXPANSÃO DA TABELA DE USUÁRIOS (Perfis Aprimorados)
-- ============================================================================

-- Adicionar colunas para perfil aprimorado
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500) NULL COMMENT 'URL do perfil LinkedIn do usuário',
ADD COLUMN IF NOT EXISTS curriculum_file_path VARCHAR(500) NULL COMMENT 'Caminho do arquivo de currículo',
ADD COLUMN IF NOT EXISTS profile_completeness_score INT DEFAULT 0 COMMENT 'Score de completude do perfil (0-100)',
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL COMMENT 'Telefone do usuário',
ADD COLUMN IF NOT EXISTS bio TEXT NULL COMMENT 'Biografia/resumo profissional',
ADD COLUMN IF NOT EXISTS skills JSON NULL COMMENT 'Habilidades do usuário em formato JSON',
ADD COLUMN IF NOT EXISTS experience_years INT DEFAULT 0 COMMENT 'Anos de experiência profissional',
ADD COLUMN IF NOT EXISTS education_level ENUM('ensino_medio', 'tecnico', 'superior_incompleto', 'superior_completo', 'pos_graduacao', 'mestrado', 'doutorado') NULL COMMENT 'Nível de escolaridade',
ADD COLUMN IF NOT EXISTS location VARCHAR(255) NULL COMMENT 'Localização do usuário',
ADD COLUMN IF NOT EXISTS availability ENUM('disponivel', 'empregado_aberto', 'empregado_fechado', 'indisponivel') DEFAULT 'disponivel' COMMENT 'Status de disponibilidade',
ADD COLUMN IF NOT EXISTS salary_expectation VARCHAR(100) NULL COMMENT 'Expectativa salarial',
ADD COLUMN IF NOT EXISTS last_profile_update TIMESTAMP NULL COMMENT 'Última atualização do perfil';

-- ============================================================================
-- 2. TABELA DE TESTES PSICOLÓGICOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS psychological_tests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    test_type ENUM('DISC', 'BIG_FIVE', 'LEADERSHIP', 'UNIFIED') NOT NULL DEFAULT 'UNIFIED',
    questions_data JSON NOT NULL COMMENT 'Perguntas e respostas do teste',
    results JSON NOT NULL COMMENT 'Resultados calculados do teste',
    disc_profile JSON NULL COMMENT 'Perfil DISC detalhado',
    big_five_profile JSON NULL COMMENT 'Perfil Big Five detalhado',
    leadership_style JSON NULL COMMENT 'Estilo de liderança identificado',
    total_score DECIMAL(4,2) NULL COMMENT 'Pontuação total do teste',
    completion_time_seconds INT NULL COMMENT 'Tempo de conclusão em segundos',
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_test_type (user_id, test_type),
    INDEX idx_completed_at (completed_at),
    INDEX idx_test_type (test_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Armazena resultados dos testes psicológicos unificados';

-- ============================================================================
-- 3. EXPANSÃO DA TABELA DE VAGAS
-- ============================================================================

-- Adicionar colunas para vagas criadas via IA
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS created_via_ai BOOLEAN DEFAULT FALSE COMMENT 'Indica se a vaga foi criada via IA',
ADD COLUMN IF NOT EXISTS ai_prompt TEXT NULL COMMENT 'Prompt usado para gerar a vaga via IA',
ADD COLUMN IF NOT EXISTS custom_questions JSON NULL COMMENT 'Perguntas personalizadas para entrevista',
ADD COLUMN IF NOT EXISTS analytics_data JSON NULL COMMENT 'Dados de analytics da vaga',
ADD COLUMN IF NOT EXISTS required_skills JSON NULL COMMENT 'Habilidades obrigatórias em formato JSON',
ADD COLUMN IF NOT EXISTS preferred_skills JSON NULL COMMENT 'Habilidades preferenciais em formato JSON',
ADD COLUMN IF NOT EXISTS benefits JSON NULL COMMENT 'Benefícios oferecidos em formato JSON',
ADD COLUMN IF NOT EXISTS work_model ENUM('presencial', 'remoto', 'hibrido') DEFAULT 'presencial' COMMENT 'Modelo de trabalho',
ADD COLUMN IF NOT EXISTS contract_type ENUM('clt', 'pj', 'estagio', 'temporario', 'freelancer') DEFAULT 'clt' COMMENT 'Tipo de contrato',
ADD COLUMN IF NOT EXISTS urgency_level ENUM('baixa', 'media', 'alta', 'urgente') DEFAULT 'media' COMMENT 'Nível de urgência',
ADD COLUMN IF NOT EXISTS auto_generated_content JSON NULL COMMENT 'Conteúdo gerado automaticamente pela IA';

-- ============================================================================
-- 4. SISTEMA DE ENTREVISTAS COMPLETO
-- ============================================================================

-- Tabela principal de entrevistas
CREATE TABLE IF NOT EXISTS interviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT NOT NULL,
    job_id INT NOT NULL,
    interview_type ENUM('simulada', 'real', 'tecnica', 'comportamental') DEFAULT 'simulada',
    status ENUM('agendada', 'em_andamento', 'concluida', 'cancelada', 'processando') DEFAULT 'agendada',
    
    -- Dados do vídeo
    video_file_path VARCHAR(500) NULL COMMENT 'Caminho do arquivo de vídeo',
    video_duration_seconds INT NULL COMMENT 'Duração do vídeo em segundos',
    video_size_bytes BIGINT NULL COMMENT 'Tamanho do arquivo em bytes',
    video_quality ENUM('baixa', 'media', 'alta') DEFAULT 'media',
    
    -- Análise geral
    total_score DECIMAL(4,2) NULL COMMENT 'Pontuação total da entrevista (0-10)',
    confidence_score DECIMAL(4,2) NULL COMMENT 'Score de confiança geral (0-10)',
    communication_score DECIMAL(4,2) NULL COMMENT 'Score de comunicação (0-10)',
    technical_score DECIMAL(4,2) NULL COMMENT 'Score técnico (0-10)',
    
    -- Dados da análise facial
    face_analysis_data JSON NULL COMMENT 'Dados completos da análise facial',
    emotion_summary JSON NULL COMMENT 'Resumo das emoções detectadas',
    behavior_insights JSON NULL COMMENT 'Insights comportamentais',
    
    -- Metadados
    questions_count INT DEFAULT 0 COMMENT 'Número total de perguntas',
    answered_questions INT DEFAULT 0 COMMENT 'Número de perguntas respondidas',
    processing_status ENUM('pendente', 'processando', 'concluido', 'erro') DEFAULT 'pendente',
    ai_feedback TEXT NULL COMMENT 'Feedback geral gerado pela IA',
    recruiter_notes TEXT NULL COMMENT 'Notas do recrutador',
    
    -- Timestamps
    scheduled_at TIMESTAMP NULL COMMENT 'Data/hora agendada',
    started_at TIMESTAMP NULL COMMENT 'Início da entrevista',
    completed_at TIMESTAMP NULL COMMENT 'Conclusão da entrevista',
    processed_at TIMESTAMP NULL COMMENT 'Conclusão do processamento',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_candidate_job (candidate_id, job_id),
    INDEX idx_status (status),
    INDEX idx_completed_at (completed_at),
    INDEX idx_total_score (total_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Armazena dados completos das entrevistas realizadas';

-- Tabela de respostas por pergunta
CREATE TABLE IF NOT EXISTS interview_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    interview_id INT NOT NULL,
    question_number INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('comportamental', 'tecnica', 'situacional', 'geral') DEFAULT 'geral',
    
    -- Resposta do candidato
    transcription TEXT NULL COMMENT 'Transcrição da resposta',
    response_duration_seconds INT NULL COMMENT 'Duração da resposta em segundos',
    
    -- Análise da resposta
    analysis_data JSON NULL COMMENT 'Análise completa da resposta',
    score DECIMAL(4,2) NULL COMMENT 'Pontuação da resposta (0-10)',
    strengths TEXT NULL COMMENT 'Pontos fortes identificados',
    improvements TEXT NULL COMMENT 'Pontos de melhoria',
    adequacy_score DECIMAL(4,2) NULL COMMENT 'Adequação à pergunta (0-10)',
    
    -- Dados comportamentais específicos
    confidence_level DECIMAL(4,2) NULL COMMENT 'Nível de confiança (0-10)',
    emotion_detected VARCHAR(50) NULL COMMENT 'Emoção predominante detectada',
    face_analysis_samples INT DEFAULT 0 COMMENT 'Número de amostras da análise facial',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    INDEX idx_interview_question (interview_id, question_number),
    INDEX idx_score (score),
    UNIQUE KEY unique_interview_question (interview_id, question_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Armazena respostas individuais das entrevistas';

-- ============================================================================
-- 5. SISTEMA DE CANDIDATURAS AVANÇADO
-- ============================================================================

CREATE TABLE IF NOT EXISTS job_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    candidate_id INT NOT NULL,
    
    -- Status da candidatura
    status ENUM('aplicado', 'triagem', 'entrevista_agendada', 'entrevistado', 'aprovado', 'rejeitado', 'desistiu') DEFAULT 'aplicado',
    source ENUM('organica', 'coresignal', 'linkedin', 'indicacao', 'headhunter') DEFAULT 'organica',
    
    -- Dados da aplicação
    cover_letter TEXT NULL COMMENT 'Carta de apresentação',
    salary_expectation VARCHAR(100) NULL COMMENT 'Expectativa salarial informada',
    availability_date DATE NULL COMMENT 'Data de disponibilidade',
    
    -- Avaliação do recrutador
    recruiter_rating DECIMAL(3,1) NULL COMMENT 'Avaliação do recrutador (0-5)',
    recruiter_notes TEXT NULL COMMENT 'Notas do recrutador',
    rejection_reason TEXT NULL COMMENT 'Motivo da rejeição',
    
    -- Matching automático
    auto_match_score DECIMAL(4,2) NULL COMMENT 'Score de matching automático (0-10)',
    skills_match_percentage DECIMAL(5,2) NULL COMMENT 'Percentual de match de skills',
    experience_match BOOLEAN DEFAULT FALSE COMMENT 'Match de experiência',
    location_match BOOLEAN DEFAULT FALSE COMMENT 'Match de localização',
    
    -- Timestamps
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_interaction_at TIMESTAMP NULL,
    status_updated_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_job_status (job_id, status),
    INDEX idx_candidate_status (candidate_id, status),
    INDEX idx_applied_at (applied_at),
    INDEX idx_auto_match_score (auto_match_score),
    UNIQUE KEY unique_job_candidate (job_id, candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Gerencia candidaturas e processo seletivo';

-- ============================================================================
-- 6. SISTEMA DE INTEGRAÇÃO CORESIGNAL
-- ============================================================================

-- Tabela de buscas realizadas no Coresignal
CREATE TABLE IF NOT EXISTS coresignal_searches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    search_query JSON NOT NULL COMMENT 'Query de busca enviada para Coresignal',
    search_filters JSON NULL COMMENT 'Filtros aplicados na busca',
    chatgpt_params JSON NULL COMMENT 'Parâmetros gerados pelo ChatGPT',
    
    -- Resultados da busca
    total_results INT DEFAULT 0 COMMENT 'Total de resultados encontrados',
    processed_results INT DEFAULT 0 COMMENT 'Resultados processados e salvos',
    search_cost DECIMAL(10,2) NULL COMMENT 'Custo da busca na API',
    
    -- Status e metadados
    status ENUM('iniciada', 'processando', 'concluida', 'erro') DEFAULT 'iniciada',
    error_message TEXT NULL COMMENT 'Mensagem de erro se houver',
    processing_time_seconds INT NULL COMMENT 'Tempo de processamento',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    created_by INT NOT NULL,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_job_created (job_id, created_at),
    INDEX idx_status (status),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Histórico de buscas realizadas no Coresignal';

-- Tabela de candidatos encontrados via Coresignal
CREATE TABLE IF NOT EXISTS coresignal_candidates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    search_id INT NOT NULL,
    job_id INT NOT NULL,
    
    -- Dados do LinkedIn/Coresignal
    linkedin_url VARCHAR(500) NULL,
    coresignal_id VARCHAR(100) NULL COMMENT 'ID único no Coresignal',
    full_name VARCHAR(255) NOT NULL,
    current_position VARCHAR(255) NULL,
    current_company VARCHAR(255) NULL,
    location VARCHAR(255) NULL,
    experience_years INT NULL,
    
    -- Dados estruturados
    skills JSON NULL COMMENT 'Habilidades extraídas do perfil',
    education JSON NULL COMMENT 'Formação acadêmica',
    work_history JSON NULL COMMENT 'Histórico profissional',
    contact_info JSON NULL COMMENT 'Informações de contato disponíveis',
    coresignal_data JSON NULL COMMENT 'Dados completos retornados pela API',
    
    -- Análise de adequação
    adequacy_score DECIMAL(4,2) NULL COMMENT 'Score de adequação à vaga (0-10)',
    adequacy_analysis JSON NULL COMMENT 'Análise detalhada de adequação',
    ai_insights TEXT NULL COMMENT 'Insights gerados pela IA',
    
    -- Status de contato
    contact_status ENUM('nao_contatado', 'contatado', 'respondeu', 'interessado', 'nao_interessado', 'importado') DEFAULT 'nao_contatado',
    contact_method ENUM('linkedin', 'email', 'whatsapp', 'telefone') NULL,
    contacted_at TIMESTAMP NULL,
    responded_at TIMESTAMP NULL,
    
    -- Importação para plataforma
    imported_to_platform BOOLEAN DEFAULT FALSE,
    imported_user_id INT NULL COMMENT 'ID do usuário criado na plataforma',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (search_id) REFERENCES coresignal_searches(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (imported_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_search_adequacy (search_id, adequacy_score),
    INDEX idx_job_status (job_id, contact_status),
    INDEX idx_adequacy_score (adequacy_score),
    INDEX idx_contact_status (contact_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Candidatos encontrados via busca Coresignal';

-- ============================================================================
-- 7. SISTEMA DE CAMPANHAS DE RECRUTAMENTO
-- ============================================================================

CREATE TABLE IF NOT EXISTS recruitment_campaigns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    search_id INT NULL COMMENT 'Busca Coresignal relacionada',
    
    -- Dados da campanha
    campaign_name VARCHAR(255) NOT NULL,
    campaign_type ENUM('linkedin', 'email', 'whatsapp', 'mista') DEFAULT 'linkedin',
    message_template TEXT NOT NULL COMMENT 'Template da mensagem de convite',
    
    -- Configurações
    target_audience JSON NULL COMMENT 'Critérios do público-alvo',
    send_schedule JSON NULL COMMENT 'Agendamento de envios',
    personalization_rules JSON NULL COMMENT 'Regras de personalização',
    
    -- Métricas
    total_sent INT DEFAULT 0,
    total_delivered INT DEFAULT 0,
    total_opened INT DEFAULT 0,
    total_responses INT DEFAULT 0,
    total_interested INT DEFAULT 0,
    total_applications INT DEFAULT 0,
    
    -- Status
    status ENUM('rascunho', 'ativa', 'pausada', 'concluida', 'cancelada') DEFAULT 'rascunho',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (search_id) REFERENCES coresignal_searches(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_job_status (job_id, status),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Campanhas de recrutamento e convites';

-- ============================================================================
-- 8. SISTEMA DE ANALYTICS E MÉTRICAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_type ENUM('page_view', 'job_view', 'application', 'interview_start', 'interview_complete', 'search_linkedin', 'candidate_contact') NOT NULL,
    entity_type ENUM('job', 'user', 'interview', 'campaign', 'search') NOT NULL,
    entity_id INT NOT NULL,
    
    -- Dados do evento
    user_id INT NULL COMMENT 'Usuário que gerou o evento',
    session_id VARCHAR(100) NULL COMMENT 'ID da sessão',
    event_data JSON NULL COMMENT 'Dados específicos do evento',
    
    -- Contexto
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    referrer VARCHAR(500) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_event_type_date (event_type, created_at),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_user_date (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Eventos para analytics e métricas';

-- ============================================================================
-- 9. VIEWS PARA RELATÓRIOS E ANALYTICS
-- ============================================================================

-- View para estatísticas de vagas
CREATE OR REPLACE VIEW job_statistics AS
SELECT 
    j.id,
    j.title,
    j.company,
    j.status,
    j.created_at,
    COUNT(DISTINCT ja.id) as total_applications,
    COUNT(DISTINCT CASE WHEN ja.status = 'aprovado' THEN ja.id END) as approved_applications,
    COUNT(DISTINCT i.id) as total_interviews,
    COUNT(DISTINCT CASE WHEN i.status = 'concluida' THEN i.id END) as completed_interviews,
    AVG(i.total_score) as avg_interview_score,
    COUNT(DISTINCT cs.id) as linkedin_searches,
    COUNT(DISTINCT cc.id) as linkedin_candidates_found,
    AVG(cc.adequacy_score) as avg_candidate_adequacy
FROM jobs j
LEFT JOIN job_applications ja ON j.id = ja.job_id
LEFT JOIN interviews i ON j.id = i.job_id
LEFT JOIN coresignal_searches cs ON j.id = cs.job_id
LEFT JOIN coresignal_candidates cc ON j.id = cc.job_id
GROUP BY j.id;

-- View para perfil completo de candidatos
CREATE OR REPLACE VIEW candidate_profiles AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.linkedin_url,
    u.phone,
    u.location,
    u.experience_years,
    u.education_level,
    u.skills,
    u.profile_completeness_score,
    COUNT(DISTINCT ja.id) as total_applications,
    COUNT(DISTINCT i.id) as total_interviews,
    AVG(i.total_score) as avg_interview_score,
    MAX(i.completed_at) as last_interview_date,
    pt.disc_profile,
    pt.big_five_profile,
    pt.leadership_style
FROM users u
LEFT JOIN job_applications ja ON u.id = ja.candidate_id
LEFT JOIN interviews i ON u.id = i.candidate_id
LEFT JOIN psychological_tests pt ON u.id = pt.user_id AND pt.test_type = 'UNIFIED'
WHERE u.role = 'candidate'
GROUP BY u.id;

-- ============================================================================
-- 10. TRIGGERS PARA MANUTENÇÃO AUTOMÁTICA
-- ============================================================================

-- Trigger para atualizar score de completude do perfil
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS update_profile_completeness 
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    DECLARE completeness INT DEFAULT 0;
    
    -- Calcular score baseado nos campos preenchidos
    IF NEW.name IS NOT NULL AND NEW.name != '' THEN SET completeness = completeness + 10; END IF;
    IF NEW.email IS NOT NULL AND NEW.email != '' THEN SET completeness = completeness + 10; END IF;
    IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN SET completeness = completeness + 10; END IF;
    IF NEW.linkedin_url IS NOT NULL AND NEW.linkedin_url != '' THEN SET completeness = completeness + 15; END IF;
    IF NEW.curriculum_file_path IS NOT NULL AND NEW.curriculum_file_path != '' THEN SET completeness = completeness + 15; END IF;
    IF NEW.bio IS NOT NULL AND NEW.bio != '' THEN SET completeness = completeness + 10; END IF;
    IF NEW.skills IS NOT NULL THEN SET completeness = completeness + 10; END IF;
    IF NEW.experience_years > 0 THEN SET completeness = completeness + 10; END IF;
    IF NEW.education_level IS NOT NULL THEN SET completeness = completeness + 5; END IF;
    IF NEW.location IS NOT NULL AND NEW.location != '' THEN SET completeness = completeness + 5; END IF;
    
    SET NEW.profile_completeness_score = completeness;
    SET NEW.last_profile_update = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

-- Trigger para atualizar estatísticas de entrevista
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS update_interview_stats 
AFTER UPDATE ON interviews
FOR EACH ROW
BEGIN
    IF NEW.status = 'concluida' AND OLD.status != 'concluida' THEN
        -- Atualizar contadores de perguntas respondidas
        UPDATE interviews 
        SET answered_questions = (
            SELECT COUNT(*) 
            FROM interview_responses 
            WHERE interview_id = NEW.id AND transcription IS NOT NULL
        )
        WHERE id = NEW.id;
    END IF;
END$$
DELIMITER ;

-- ============================================================================
-- 11. ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ============================================================================

-- Índices para otimizar consultas de analytics
CREATE INDEX IF NOT EXISTS idx_jobs_created_status ON jobs(created_at, status);
CREATE INDEX IF NOT EXISTS idx_applications_date_status ON job_applications(applied_at, status);
CREATE INDEX IF NOT EXISTS idx_interviews_date_score ON interviews(completed_at, total_score);
CREATE INDEX IF NOT EXISTS idx_users_role_updated ON users(role, last_profile_update);

-- Índices para busca de texto
CREATE FULLTEXT INDEX IF NOT EXISTS idx_jobs_search ON jobs(title, description, requirements);
CREATE FULLTEXT INDEX IF NOT EXISTS idx_users_search ON users(name, bio);

-- ============================================================================
-- 12. DADOS INICIAIS E CONFIGURAÇÕES
-- ============================================================================

-- Inserir configurações padrão para testes psicológicos
INSERT IGNORE INTO psychological_tests (user_id, test_type, questions_data, results, completed_at) VALUES
(1, 'UNIFIED', '{"sample": "test"}', '{"sample": "result"}', NULL);

-- Restaurar configurações originais
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

SELECT 'Script de melhorias do banco de dados executado com sucesso!' as status;

