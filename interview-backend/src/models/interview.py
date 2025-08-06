from src.models.user import db
from datetime import datetime
import json

class Interview(db.Model):
    __tablename__ = 'interviews'
    
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, nullable=False)
    job_id = db.Column(db.Integer, nullable=False)
    interview_type = db.Column(db.Enum('simulada', 'real', 'tecnica', 'comportamental', name='interview_types'), default='simulada')
    status = db.Column(db.Enum('agendada', 'em_andamento', 'concluida', 'cancelada', 'processando', name='interview_status'), default='agendada')
    
    # Dados do vídeo
    video_file_path = db.Column(db.String(500))
    video_duration_seconds = db.Column(db.Integer)
    video_size_bytes = db.Column(db.BigInteger)
    video_quality = db.Column(db.Enum('baixa', 'media', 'alta', name='video_quality'), default='media')
    
    # Análise geral
    total_score = db.Column(db.Numeric(4, 2))
    confidence_score = db.Column(db.Numeric(4, 2))
    communication_score = db.Column(db.Numeric(4, 2))
    technical_score = db.Column(db.Numeric(4, 2))
    
    # Dados da análise facial (JSON)
    face_analysis_data = db.Column(db.Text)  # JSON string
    emotion_summary = db.Column(db.Text)     # JSON string
    behavior_insights = db.Column(db.Text)   # JSON string
    
    # Metadados
    questions_count = db.Column(db.Integer, default=0)
    answered_questions = db.Column(db.Integer, default=0)
    processing_status = db.Column(db.Enum('pendente', 'processando', 'concluido', 'erro', name='processing_status'), default='pendente')
    ai_feedback = db.Column(db.Text)
    recruiter_notes = db.Column(db.Text)
    
    # Timestamps
    scheduled_at = db.Column(db.DateTime)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    processed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    responses = db.relationship('InterviewResponse', backref='interview', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Converter para dicionário para serialização JSON"""
        return {
            'id': self.id,
            'candidate_id': self.candidate_id,
            'job_id': self.job_id,
            'interview_type': self.interview_type,
            'status': self.status,
            'video_file_path': self.video_file_path,
            'video_duration_seconds': self.video_duration_seconds,
            'video_size_bytes': self.video_size_bytes,
            'video_quality': self.video_quality,
            'total_score': float(self.total_score) if self.total_score else None,
            'confidence_score': float(self.confidence_score) if self.confidence_score else None,
            'communication_score': float(self.communication_score) if self.communication_score else None,
            'technical_score': float(self.technical_score) if self.technical_score else None,
            'face_analysis_data': json.loads(self.face_analysis_data) if self.face_analysis_data else None,
            'emotion_summary': json.loads(self.emotion_summary) if self.emotion_summary else None,
            'behavior_insights': json.loads(self.behavior_insights) if self.behavior_insights else None,
            'questions_count': self.questions_count,
            'answered_questions': self.answered_questions,
            'processing_status': self.processing_status,
            'ai_feedback': self.ai_feedback,
            'recruiter_notes': self.recruiter_notes,
            'scheduled_at': self.scheduled_at.isoformat() if self.scheduled_at else None,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'responses': [response.to_dict() for response in self.responses] if self.responses else []
        }
    
    def set_face_analysis_data(self, data):
        """Definir dados de análise facial (converte dict para JSON string)"""
        self.face_analysis_data = json.dumps(data) if data else None
    
    def set_emotion_summary(self, data):
        """Definir resumo de emoções (converte dict para JSON string)"""
        self.emotion_summary = json.dumps(data) if data else None
    
    def set_behavior_insights(self, data):
        """Definir insights comportamentais (converte dict para JSON string)"""
        self.behavior_insights = json.dumps(data) if data else None


class InterviewResponse(db.Model):
    __tablename__ = 'interview_responses'
    
    id = db.Column(db.Integer, primary_key=True)
    interview_id = db.Column(db.Integer, db.ForeignKey('interviews.id'), nullable=False)
    question_number = db.Column(db.Integer, nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.Enum('comportamental', 'tecnica', 'situacional', 'geral', name='question_types'), default='geral')
    
    # Resposta do candidato
    transcription = db.Column(db.Text)
    response_duration_seconds = db.Column(db.Integer)
    
    # Análise da resposta (JSON)
    analysis_data = db.Column(db.Text)  # JSON string
    score = db.Column(db.Numeric(4, 2))
    strengths = db.Column(db.Text)
    improvements = db.Column(db.Text)
    adequacy_score = db.Column(db.Numeric(4, 2))
    
    # Dados comportamentais específicos
    confidence_level = db.Column(db.Numeric(4, 2))
    emotion_detected = db.Column(db.String(50))
    face_analysis_samples = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Constraint única para evitar duplicatas
    __table_args__ = (db.UniqueConstraint('interview_id', 'question_number', name='unique_interview_question'),)
    
    def to_dict(self):
        """Converter para dicionário para serialização JSON"""
        return {
            'id': self.id,
            'interview_id': self.interview_id,
            'question_number': self.question_number,
            'question_text': self.question_text,
            'question_type': self.question_type,
            'transcription': self.transcription,
            'response_duration_seconds': self.response_duration_seconds,
            'analysis_data': json.loads(self.analysis_data) if self.analysis_data else None,
            'score': float(self.score) if self.score else None,
            'strengths': self.strengths,
            'improvements': self.improvements,
            'adequacy_score': float(self.adequacy_score) if self.adequacy_score else None,
            'confidence_level': float(self.confidence_level) if self.confidence_level else None,
            'emotion_detected': self.emotion_detected,
            'face_analysis_samples': self.face_analysis_samples,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def set_analysis_data(self, data):
        """Definir dados de análise (converte dict para JSON string)"""
        self.analysis_data = json.dumps(data) if data else None


class Job(db.Model):
    __tablename__ = 'jobs'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    company = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    requirements = db.Column(db.Text)
    location = db.Column(db.String(255))
    salary_range = db.Column(db.String(100))
    experience_level = db.Column(db.String(50))
    area = db.Column(db.String(100))
    status = db.Column(db.String(50), default='ativa')
    
    # Campos para IA
    created_via_ai = db.Column(db.Boolean, default=False)
    ai_prompt = db.Column(db.Text)
    custom_questions = db.Column(db.Text)  # JSON string
    analytics_data = db.Column(db.Text)    # JSON string
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Converter para dicionário para serialização JSON"""
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'description': self.description,
            'requirements': self.requirements,
            'location': self.location,
            'salary_range': self.salary_range,
            'experience_level': self.experience_level,
            'area': self.area,
            'status': self.status,
            'created_via_ai': self.created_via_ai,
            'ai_prompt': self.ai_prompt,
            'custom_questions': json.loads(self.custom_questions) if self.custom_questions else None,
            'analytics_data': json.loads(self.analytics_data) if self.analytics_data else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def set_custom_questions(self, data):
        """Definir perguntas customizadas (converte dict para JSON string)"""
        self.custom_questions = json.dumps(data) if data else None
    
    def set_analytics_data(self, data):
        """Definir dados de analytics (converte dict para JSON string)"""
        self.analytics_data = json.dumps(data) if data else None


class Candidate(db.Model):
    __tablename__ = 'candidates'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    linkedin_url = db.Column(db.String(500))
    curriculum_file_path = db.Column(db.String(500))
    bio = db.Column(db.Text)
    skills = db.Column(db.Text)  # JSON string
    experience_years = db.Column(db.Integer, default=0)
    location = db.Column(db.String(255))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Converter para dicionário para serialização JSON"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'linkedin_url': self.linkedin_url,
            'curriculum_file_path': self.curriculum_file_path,
            'bio': self.bio,
            'skills': json.loads(self.skills) if self.skills else None,
            'experience_years': self.experience_years,
            'location': self.location,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def set_skills(self, data):
        """Definir habilidades (converte list para JSON string)"""
        self.skills = json.dumps(data) if data else None

