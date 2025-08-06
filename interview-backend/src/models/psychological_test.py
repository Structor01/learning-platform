from src.models.user import db
from datetime import datetime
import json

class PsychologicalTest(db.Model):
    __tablename__ = 'psychological_tests'
    
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, nullable=False)
    test_type = db.Column(db.Enum('completo', 'rapido', 'personalizado', name='test_types'), default='completo')
    status = db.Column(db.Enum('iniciado', 'em_andamento', 'concluido', 'abandonado', name='test_status'), default='iniciado')
    
    # Resultados DISC
    disc_d_score = db.Column(db.Numeric(4, 2))  # Dominante
    disc_i_score = db.Column(db.Numeric(4, 2))  # Influente
    disc_s_score = db.Column(db.Numeric(4, 2))  # Estável
    disc_c_score = db.Column(db.Numeric(4, 2))  # Consciente
    disc_primary_style = db.Column(db.String(20))
    disc_secondary_style = db.Column(db.String(20))
    
    # Resultados Big Five
    big5_openness = db.Column(db.Numeric(4, 2))        # Abertura
    big5_conscientiousness = db.Column(db.Numeric(4, 2))  # Conscienciosidade
    big5_extraversion = db.Column(db.Numeric(4, 2))    # Extroversão
    big5_agreeableness = db.Column(db.Numeric(4, 2))   # Amabilidade
    big5_neuroticism = db.Column(db.Numeric(4, 2))     # Neuroticismo
    
    # Resultados Estilo de Liderança
    leadership_autocratic = db.Column(db.Numeric(4, 2))    # Autocrático
    leadership_democratic = db.Column(db.Numeric(4, 2))    # Democrático
    leadership_laissez_faire = db.Column(db.Numeric(4, 2)) # Laissez-faire
    leadership_transformational = db.Column(db.Numeric(4, 2)) # Transformacional
    leadership_transactional = db.Column(db.Numeric(4, 2))    # Transacional
    leadership_primary_style = db.Column(db.String(30))
    
    # Análise e insights
    personality_summary = db.Column(db.Text)
    strengths = db.Column(db.Text)  # JSON string
    development_areas = db.Column(db.Text)  # JSON string
    career_recommendations = db.Column(db.Text)  # JSON string
    team_compatibility = db.Column(db.Text)  # JSON string
    
    # Metadados
    questions_answered = db.Column(db.Integer, default=0)
    total_questions = db.Column(db.Integer, default=25)
    completion_percentage = db.Column(db.Numeric(5, 2), default=0.0)
    time_spent_minutes = db.Column(db.Integer, default=0)
    confidence_score = db.Column(db.Numeric(4, 2))  # Confiabilidade dos resultados
    
    # Timestamps
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    responses = db.relationship('TestResponse', backref='test', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Converter para dicionário para serialização JSON"""
        return {
            'id': self.id,
            'candidate_id': self.candidate_id,
            'test_type': self.test_type,
            'status': self.status,
            'disc_results': {
                'd_score': float(self.disc_d_score) if self.disc_d_score else None,
                'i_score': float(self.disc_i_score) if self.disc_i_score else None,
                's_score': float(self.disc_s_score) if self.disc_s_score else None,
                'c_score': float(self.disc_c_score) if self.disc_c_score else None,
                'primary_style': self.disc_primary_style,
                'secondary_style': self.disc_secondary_style
            },
            'big5_results': {
                'openness': float(self.big5_openness) if self.big5_openness else None,
                'conscientiousness': float(self.big5_conscientiousness) if self.big5_conscientiousness else None,
                'extraversion': float(self.big5_extraversion) if self.big5_extraversion else None,
                'agreeableness': float(self.big5_agreeableness) if self.big5_agreeableness else None,
                'neuroticism': float(self.big5_neuroticism) if self.big5_neuroticism else None
            },
            'leadership_results': {
                'autocratic': float(self.leadership_autocratic) if self.leadership_autocratic else None,
                'democratic': float(self.leadership_democratic) if self.leadership_democratic else None,
                'laissez_faire': float(self.leadership_laissez_faire) if self.leadership_laissez_faire else None,
                'transformational': float(self.leadership_transformational) if self.leadership_transformational else None,
                'transactional': float(self.leadership_transactional) if self.leadership_transactional else None,
                'primary_style': self.leadership_primary_style
            },
            'analysis': {
                'personality_summary': self.personality_summary,
                'strengths': json.loads(self.strengths) if self.strengths else None,
                'development_areas': json.loads(self.development_areas) if self.development_areas else None,
                'career_recommendations': json.loads(self.career_recommendations) if self.career_recommendations else None,
                'team_compatibility': json.loads(self.team_compatibility) if self.team_compatibility else None
            },
            'metadata': {
                'questions_answered': self.questions_answered,
                'total_questions': self.total_questions,
                'completion_percentage': float(self.completion_percentage) if self.completion_percentage else 0.0,
                'time_spent_minutes': self.time_spent_minutes,
                'confidence_score': float(self.confidence_score) if self.confidence_score else None
            },
            'timestamps': {
                'started_at': self.started_at.isoformat() if self.started_at else None,
                'completed_at': self.completed_at.isoformat() if self.completed_at else None,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None
            },
            'responses': [response.to_dict() for response in self.responses] if self.responses else []
        }
    
    def set_strengths(self, data):
        """Definir pontos fortes (converte list para JSON string)"""
        self.strengths = json.dumps(data) if data else None
    
    def set_development_areas(self, data):
        """Definir áreas de desenvolvimento (converte list para JSON string)"""
        self.development_areas = json.dumps(data) if data else None
    
    def set_career_recommendations(self, data):
        """Definir recomendações de carreira (converte list para JSON string)"""
        self.career_recommendations = json.dumps(data) if data else None
    
    def set_team_compatibility(self, data):
        """Definir compatibilidade de equipe (converte dict para JSON string)"""
        self.team_compatibility = json.dumps(data) if data else None


class TestResponse(db.Model):
    __tablename__ = 'test_responses'
    
    id = db.Column(db.Integer, primary_key=True)
    test_id = db.Column(db.Integer, db.ForeignKey('psychological_tests.id'), nullable=False)
    question_number = db.Column(db.Integer, nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_category = db.Column(db.Enum('disc', 'big5', 'leadership', name='question_categories'), nullable=False)
    question_subcategory = db.Column(db.String(50))  # Ex: 'dominance', 'openness', 'democratic'
    
    # Resposta do usuário
    answer_value = db.Column(db.Integer, nullable=False)  # 1-4 ou 1-5 dependendo da escala
    answer_text = db.Column(db.String(200))  # Texto da opção escolhida
    response_time_seconds = db.Column(db.Integer, default=0)
    
    # Metadados
    weight = db.Column(db.Numeric(3, 2), default=1.0)  # Peso da pergunta no cálculo final
    is_reverse_scored = db.Column(db.Boolean, default=False)  # Se a pontuação deve ser invertida
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Constraint única para evitar duplicatas
    __table_args__ = (db.UniqueConstraint('test_id', 'question_number', name='unique_test_question'),)
    
    def to_dict(self):
        """Converter para dicionário para serialização JSON"""
        return {
            'id': self.id,
            'test_id': self.test_id,
            'question_number': self.question_number,
            'question_text': self.question_text,
            'question_category': self.question_category,
            'question_subcategory': self.question_subcategory,
            'answer_value': self.answer_value,
            'answer_text': self.answer_text,
            'response_time_seconds': self.response_time_seconds,
            'weight': float(self.weight) if self.weight else 1.0,
            'is_reverse_scored': self.is_reverse_scored,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class TestQuestion(db.Model):
    __tablename__ = 'test_questions'
    
    id = db.Column(db.Integer, primary_key=True)
    question_number = db.Column(db.Integer, nullable=False, unique=True)
    question_text = db.Column(db.Text, nullable=False)
    category = db.Column(db.Enum('disc', 'big5', 'leadership', name='question_categories'), nullable=False)
    subcategory = db.Column(db.String(50), nullable=False)
    
    # Opções de resposta (JSON)
    options = db.Column(db.Text, nullable=False)  # JSON string com as opções
    scale_type = db.Column(db.Enum('likert_4', 'likert_5', 'choice_4', name='scale_types'), default='likert_4')
    
    # Configurações de pontuação
    weight = db.Column(db.Numeric(3, 2), default=1.0)
    is_reverse_scored = db.Column(db.Boolean, default=False)
    
    # Metadados
    is_active = db.Column(db.Boolean, default=True)
    difficulty_level = db.Column(db.Enum('facil', 'medio', 'dificil', name='difficulty_levels'), default='medio')
    estimated_time_seconds = db.Column(db.Integer, default=30)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Converter para dicionário para serialização JSON"""
        return {
            'id': self.id,
            'question_number': self.question_number,
            'question_text': self.question_text,
            'category': self.category,
            'subcategory': self.subcategory,
            'options': json.loads(self.options) if self.options else None,
            'scale_type': self.scale_type,
            'weight': float(self.weight) if self.weight else 1.0,
            'is_reverse_scored': self.is_reverse_scored,
            'is_active': self.is_active,
            'difficulty_level': self.difficulty_level,
            'estimated_time_seconds': self.estimated_time_seconds,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def set_options(self, data):
        """Definir opções de resposta (converte list para JSON string)"""
        self.options = json.dumps(data, ensure_ascii=False) if data else None

