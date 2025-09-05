# 🚀 ROADMAP DE MELHORIAS - PLATAFORMA DE ENTREVISTAS

## 📋 VISÃO GERAL
Este documento contém a lista de melhorias planejadas para a plataforma, com requisitos detalhados e especificações técnicas para implementação futura.

---

## 🧠 1. EXPANSÃO DOS TESTES PSICOLÓGICOS

### 📊 **Objetivo:**
Ampliar o sistema de avaliação psicológica atual (DISC) para incluir Big Five e Estilo de Liderança em um teste unificado.

### 🎯 **Requisitos Funcionais:**

#### **1.1 Integração dos Testes (Escopo Reduzido):**
- **RF001:** Unificar DISC, Big Five e Estilo de Liderança em uma única interface
- **RF002:** Criar questionário híbrido otimizado com **máximo 25 perguntas**
- **RF003:** Implementar algoritmo de pontuação simultânea para os três modelos
- **RF004:** Gerar relatório consolidado com os três perfis
- **RF005:** Distribuição estratégica: 10 DISC + 10 Big Five + 5 Liderança

#### **1.2 Big Five (OCEAN) - 10 Perguntas:**
- **RF006:** Avaliar Abertura à Experiência (2 perguntas-chave)
- **RF007:** Avaliar Conscienciosidade (2 perguntas-chave)
- **RF008:** Avaliar Extroversão (2 perguntas-chave)
- **RF009:** Avaliar Amabilidade (2 perguntas-chave)
- **RF010:** Avaliar Neuroticismo (2 perguntas-chave)
- **RF011:** Calcular percentis com algoritmo otimizado para poucas perguntas

#### **1.3 DISC - 10 Perguntas:**
- **RF012:** Identificar perfil Dominante (3 perguntas estratégicas)
- **RF013:** Identificar perfil Influente (3 perguntas estratégicas)
- **RF014:** Identificar perfil Estável (2 perguntas estratégicas)
- **RF015:** Identificar perfil Consciente (2 perguntas estratégicas)

#### **1.4 Estilo de Liderança - 5 Perguntas:**
- **RF016:** Identificar tendência Autocrática vs Democrática (2 perguntas)
- **RF017:** Identificar tendência Transformacional vs Transacional (2 perguntas)
- **RF018:** Identificar tendência Servant Leadership (1 pergunta)

### 🔧 **Requisitos Técnicos:**
- **RT001:** Banco de dados otimizado para 25 perguntas estratégicas
- **RT002:** Algoritmos de cálculo adaptados para menor amostra
- **RT003:** Sistema de geração de relatórios em PDF
- **RT004:** Interface responsiva para teste rápido (5-8 minutos)
- **RT005:** Integração com ChatGPT para interpretação dos resultados
- **RT006:** Sistema de validação estatística para confiabilidade

### 📊 **Entregáveis:**
- **Questionário compacto (25 perguntas)** - tempo estimado: 5-8 minutos
- Dashboard com visualização dos três perfis
- Relatório PDF consolidado
- Sistema de recomendações baseado nos perfis
- **Algoritmo de compensação** para menor número de perguntas

### 🎯 **Estratégia de Otimização:**

#### **Seleção de Perguntas:**
- **Perguntas multidimensionais:** Cada pergunta avalia múltiplos aspectos
- **Validação estatística:** Perguntas com maior poder discriminativo
- **Balanceamento:** Cobertura equilibrada dos três modelos
- **Eficiência temporal:** Máximo 8 minutos de teste

#### **Algoritmo Compensatório:**
- **Pesos ajustados:** Maior peso para perguntas-chave
- **Interpolação inteligente:** IA preenche lacunas baseada em padrões
- **Validação cruzada:** Consistência entre os três modelos
- **Margem de erro:** Transparência sobre limitações do teste reduzido

---

## 👤 2. APRIMORAMENTO DO PERFIL DO USUÁRIO

### 📊 **Objetivo:**
Enriquecer o perfil do candidato com informações profissionais essenciais para recrutamento.

### 🎯 **Requisitos Funcionais:**

#### **2.1 Integração LinkedIn:**
- **RF017:** Campo para inserir URL do perfil LinkedIn
- **RF018:** Validação de URL do LinkedIn
- **RF019:** Extração automática de dados públicos do LinkedIn (se possível)
- **RF020:** Exibição do link no perfil do candidato
- **RF021:** Botão "Ver LinkedIn" nas listas de candidatos

#### **2.2 Upload de Currículo:**
- **RF022:** Upload de arquivos PDF, DOC, DOCX
- **RF023:** Validação de formato e tamanho (máx 5MB)
- **RF024:** Armazenamento seguro dos arquivos
- **RF025:** Visualização/download do currículo
- **RF026:** Extração automática de texto do currículo
- **RF027:** Análise do currículo com IA para matching com vagas

#### **2.3 Perfil Enriquecido:**
- **RF028:** Seção "Links Profissionais" no perfil
- **RF029:** Histórico de currículos enviados
- **RF030:** Status de verificação do perfil
- **RF031:** Score de completude do perfil

### 🔧 **Requisitos Técnicos:**
- **RT006:** Sistema de upload de arquivos
- **RT007:** Validação de URLs do LinkedIn
- **RT008:** Armazenamento de arquivos (AWS S3 ou similar)
- **RT009:** Parser de documentos (PDF, DOC)
- **RT010:** API para extração de dados do LinkedIn
- **RT011:** Sistema de backup dos arquivos

### 📊 **Entregáveis:**
- Interface de upload de currículo
- Validador de links LinkedIn
- Visualizador de documentos
- Sistema de análise de currículo com IA

---

## 🎥 3. SISTEMA DE GESTÃO DE ENTREVISTAS

### 📊 **Objetivo:**
Criar um sistema completo para armazenar, gerenciar e visualizar entrevistas realizadas na plataforma.

### 🎯 **Requisitos Funcionais:**

#### **3.1 Armazenamento de Entrevistas:**
- **RF032:** Salvar vídeo completo da entrevista no backend
- **RF033:** Armazenar dados de análise de cada pergunta
- **RF034:** Vincular entrevista ao candidato e vaga específica
- **RF035:** Salvar metadados (duração, data, qualidade do vídeo)
- **RF036:** Armazenar dados da análise facial (Face API)
- **RF037:** Salvar transcrições completas das respostas

#### **3.2 Módulo de Visualização:**
- **RF038:** Lista de todas as entrevistas realizadas
- **RF039:** Filtros por candidato, vaga, data, status
- **RF040:** Busca por nome do candidato ou vaga
- **RF041:** Ordenação por data, pontuação, duração
- **RF042:** Paginação para grandes volumes de dados
- **RF043:** Exportação de dados em CSV/Excel

#### **3.3 Detalhes da Entrevista:**
- **RF044:** Player de vídeo com controles avançados
- **RF045:** Timeline com marcadores das perguntas
- **RF046:** Painel lateral com análise de cada pergunta
- **RF047:** Gráficos de análise comportamental
- **RF048:** Comparação com outras entrevistas da mesma vaga
- **RF049:** Sistema de comentários/notas do recrutador

#### **3.4 Relatórios e Analytics:**
- **RF050:** Dashboard com estatísticas gerais
- **RF051:** Relatório de performance por vaga
- **RF052:** Análise de tendências comportamentais
- **RF053:** Comparativo entre candidatos
- **RF054:** Métricas de qualidade das entrevistas

### 🔧 **Requisitos Técnicos:**
- **RT012:** Armazenamento de vídeos (AWS S3, CloudFlare)
- **RT013:** Banco de dados para metadados das entrevistas
- **RT014:** Sistema de streaming de vídeo
- **RT015:** API para upload de vídeos grandes
- **RT016:** Compressão automática de vídeos
- **RT017:** CDN para distribuição de conteúdo
- **RT018:** Sistema de backup automático
- **RT019:** Controle de acesso e permissões

### 📊 **Entregáveis:**
- Interface de gestão de entrevistas
- Player de vídeo customizado
- Dashboard de analytics
- Sistema de relatórios
- API de integração

---

## 💼 4. SISTEMA AVANÇADO DE GESTÃO DE VAGAS

### 📊 **Objetivo:**
Aprimorar o sistema de vagas com criação via IA, gestão de candidatos e visualização de entrevistas.

### 🎯 **Requisitos Funcionais:**

#### **4.1 Criação de Vagas via IA:**
- **RF055:** Modal com prompt para descrição da vaga
- **RF056:** Integração com ChatGPT para gerar dados estruturados
- **RF057:** Campos automáticos: título, descrição, requisitos, benefícios
- **RF058:** Sugestão de salário baseado no mercado
- **RF059:** Geração de perguntas específicas para entrevista
- **RF060:** Validação e edição dos dados gerados
- **RF061:** Salvamento automático no banco de dados

#### **4.2 Gestão de Candidatos por Vaga:**
- **RF062:** Lista de candidatos inscritos na vaga
- **RF063:** Status de cada candidatura (Novo, Entrevistado, Aprovado, Rejeitado)
- **RF064:** Filtros por status, pontuação, data de inscrição
- **RF065:** Ações em lote (aprovar/rejeitar múltiplos)
- **RF066:** Sistema de notas/comentários por candidato
- **RF067:** Ranking automático baseado em critérios

#### **4.3 Visualização de Entrevistas:**
- **RF068:** Acesso direto às entrevistas do candidato
- **RF069:** Player integrado na página da vaga
- **RF070:** Comparação lado a lado de entrevistas
- **RF071:** Destaque de melhores respostas
- **RF072:** Sistema de favoritos/marcadores
- **RF073:** Compartilhamento de entrevistas com equipe

#### **4.4 Analytics da Vaga:**
- **RF074:** Estatísticas de candidaturas
- **RF075:** Tempo médio de entrevista
- **RF076:** Pontuação média dos candidatos
- **RF077:** Taxa de conversão (inscrição → entrevista → aprovação)
- **RF078:** Análise de palavras-chave nas respostas
- **RF079:** Relatório de adequação dos candidatos

#### **4.5 Integração Coresignal para Busca de Candidatos:**
- **RF080:** Botão "Buscar no LinkedIn" na página de Recrutamento (lista de vagas)
- **RF081:** Integração ChatGPT para gerar parâmetros de busca baseados nos dados da vaga
- **RF082:** Mapeamento automático dos parâmetros ChatGPT para formato API Coresignal
- **RF083:** Filtros inteligentes por localização, experiência e skills
- **RF084:** Exibição dos resultados em modal/página dedicada
- **RF085:** Importação de candidatos encontrados para o banco de dados
- **RF086:** Sistema de convite automático para candidatos via LinkedIn/email
- **RF087:** Tracking de candidatos contatados vs respondidos
- **RF088:** Cache de buscas para evitar consultas duplicadas
- **RF089:** Análise de adequação automática (candidato vs vaga) usando IA
- **RF090:** Sistema de scoring para ranking dos candidatos encontrados

### 🔧 **Requisitos Técnicos:**
- **RT020:** Integração avançada com ChatGPT
- **RT021:** Sistema de templates para vagas
- **RT022:** Algoritmo de ranking de candidatos
- **RT023:** Sistema de notificações
- **RT024:** API para integração com outros sistemas
- **RT025:** Cache para otimização de performance
- **RT026:** Sistema de auditoria de ações
- **RT027:** Integração robusta com API Coresignal
- **RT028:** Sistema de parsing automático de dados da vaga para query
- **RT029:** Cache inteligente para buscas Coresignal (evitar custos desnecessários)
- **RT030:** Sistema de rate limiting para API Coresignal
- **RT031:** Algoritmo de matching candidato-vaga usando IA
- **RT032:** Sistema de importação em lote de candidatos
- **RT033:** API para envio de convites automatizados
- **RT034:** Sistema de tracking de campanhas de recrutamento

### 📊 **Entregáveis:**
- Interface de criação de vagas com IA
- Dashboard de gestão de candidatos
- Sistema de visualização de entrevistas
- Relatórios de analytics por vaga
- Sistema de notificações
- **Módulo de busca Coresignal integrado**
- **Interface de resultados de busca LinkedIn**
- **Sistema de convites automatizados**
- **Dashboard de campanhas de recrutamento**

---

## 🗂️ 5. ESTRUTURA DE BANCO DE DADOS

### 📊 **Tabelas Necessárias:**

#### **5.1 Perfis e Testes:**
```sql
-- Expansão da tabela de usuários
ALTER TABLE users ADD COLUMN linkedin_url VARCHAR(255);
ALTER TABLE users ADD COLUMN curriculum_file_path VARCHAR(500);
ALTER TABLE users ADD COLUMN profile_completeness_score INT DEFAULT 0;

-- Nova tabela para resultados dos testes psicológicos
CREATE TABLE psychological_tests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    test_type ENUM('DISC', 'BIG_FIVE', 'LEADERSHIP', 'UNIFIED'),
    results JSON,
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### **5.2 Sistema de Entrevistas:**
```sql
-- Tabela principal de entrevistas
CREATE TABLE interviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT,
    job_id INT,
    video_file_path VARCHAR(500),
    duration_seconds INT,
    total_score DECIMAL(4,2),
    face_analysis_data JSON,
    status ENUM('COMPLETED', 'PROCESSING', 'FAILED'),
    created_at TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES users(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- Tabela de respostas por pergunta
CREATE TABLE interview_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    interview_id INT,
    question_number INT,
    question_text TEXT,
    transcription TEXT,
    analysis_data JSON,
    score DECIMAL(4,2),
    response_duration_seconds INT,
    FOREIGN KEY (interview_id) REFERENCES interviews(id)
);
```

#### **5.3 Sistema de Vagas Avançado:**
```sql
-- Expansão da tabela de vagas
ALTER TABLE jobs ADD COLUMN created_via_ai BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN ai_prompt TEXT;
ALTER TABLE jobs ADD COLUMN custom_questions JSON;
ALTER TABLE jobs ADD COLUMN analytics_data JSON;

-- Tabela de candidaturas com status
CREATE TABLE job_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT,
    candidate_id INT,
    status ENUM('APPLIED', 'INTERVIEWED', 'APPROVED', 'REJECTED'),
    recruiter_notes TEXT,
    applied_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (candidate_id) REFERENCES users(id)
);
```

#### **5.4 Sistema de Integração Coresignal:**
```sql
-- Tabela de buscas realizadas no Coresignal
CREATE TABLE coresignal_searches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT,
    search_query JSON,
    search_filters JSON,
    total_results INT,
    search_cost DECIMAL(10,2),
    created_at TIMESTAMP,
    created_by INT,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabela de candidatos encontrados via Coresignal
CREATE TABLE coresignal_candidates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    search_id INT,
    job_id INT,
    linkedin_url VARCHAR(500),
    full_name VARCHAR(255),
    current_position VARCHAR(255),
    current_company VARCHAR(255),
    location VARCHAR(255),
    experience_years INT,
    skills JSON,
    education JSON,
    contact_info JSON,
    coresignal_data JSON,
    adequacy_score DECIMAL(4,2),
    contact_status ENUM('NOT_CONTACTED', 'CONTACTED', 'RESPONDED', 'INTERESTED', 'NOT_INTERESTED'),
    contacted_at TIMESTAMP,
    responded_at TIMESTAMP,
    imported_to_platform BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    FOREIGN KEY (search_id) REFERENCES coresignal_searches(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- Tabela de campanhas de convites
CREATE TABLE recruitment_campaigns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT,
    search_id INT,
    campaign_name VARCHAR(255),
    message_template TEXT,
    total_sent INT DEFAULT 0,
    total_responses INT DEFAULT 0,
    total_interested INT DEFAULT 0,
    status ENUM('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (search_id) REFERENCES coresignal_searches(id)
);
```

---

## 📅 6. CRONOGRAMA SUGERIDO

### **Fase 1 - Fundação (4-6 semanas):**
- Expansão do sistema de testes psicológicos
- Aprimoramento do perfil do usuário
- Estruturação do banco de dados

### **Fase 2 - Core Features (6-8 semanas):**
- Sistema de armazenamento de entrevistas
- Módulo de visualização básico
- Criação de vagas via IA

### **Fase 3 - Analytics e UX (4-6 semanas):**
- Dashboard de analytics
- Sistema avançado de gestão de candidatos
- Relatórios e comparações

### **Fase 4 - Otimização (2-4 semanas):**
- Performance e escalabilidade
- Testes e correções
- Documentação final

---

## 🎯 7. MÉTRICAS DE SUCESSO

### **Quantitativas:**
- Aumento de 40% no tempo de permanência na plataforma
- Redução de 60% no tempo de análise de candidatos
- Aumento de 25% na taxa de conversão de entrevistas

### **Qualitativas:**
- Melhoria na experiência do recrutador
- Maior precisão na seleção de candidatos
- Feedback positivo dos usuários

---

## 🔧 8. CONSIDERAÇÕES TÉCNICAS

### **Performance:**
- Otimização para vídeos grandes
- Cache inteligente para dados frequentes
- CDN para distribuição global

### **Segurança:**
- Criptografia de dados sensíveis
- Controle de acesso granular
- Backup automático e redundância

### **Escalabilidade:**
- Arquitetura de microserviços
- Auto-scaling para picos de uso
- Monitoramento em tempo real

---

*Documento criado em: 01/08/2025*
*Versão: 1.0*
*Status: Planejamento*

