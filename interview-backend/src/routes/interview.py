from flask import Blueprint, request, jsonify, current_app
from src.models.interview import db, Interview, InterviewResponse, Job, Candidate
from datetime import datetime
import os
import json
import uuid
from werkzeug.utils import secure_filename

interview_bp = Blueprint('interview', __name__)

# Configurações para upload de vídeo
UPLOAD_FOLDER = 'uploads/videos'
ALLOWED_EXTENSIONS = {'mp4', 'webm', 'avi', 'mov'}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def ensure_upload_folder():
    """Garantir que a pasta de upload existe"""
    upload_path = os.path.join(current_app.root_path, UPLOAD_FOLDER)
    os.makedirs(upload_path, exist_ok=True)
    return upload_path

@interview_bp.route('/interviews', methods=['GET'])
def get_interviews():
    """Listar todas as entrevistas com filtros opcionais"""
    try:
        # Parâmetros de filtro
        candidate_id = request.args.get('candidate_id', type=int)
        job_id = request.args.get('job_id', type=int)
        status = request.args.get('status')
        interview_type = request.args.get('type')
        
        # Paginação
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Construir query
        query = Interview.query
        
        if candidate_id:
            query = query.filter(Interview.candidate_id == candidate_id)
        if job_id:
            query = query.filter(Interview.job_id == job_id)
        if status:
            query = query.filter(Interview.status == status)
        if interview_type:
            query = query.filter(Interview.interview_type == interview_type)
        
        # Ordenar por data de criação (mais recentes primeiro)
        query = query.order_by(Interview.created_at.desc())
        
        # Paginação
        interviews = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'success': True,
            'interviews': [interview.to_dict() for interview in interviews.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': interviews.total,
                'pages': interviews.pages,
                'has_next': interviews.has_next,
                'has_prev': interviews.has_prev
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@interview_bp.route('/interviews', methods=['POST'])
def create_interview():
    """Criar nova entrevista"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['candidate_id', 'job_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Campo obrigatório: {field}'
                }), 400
        
        # Verificar se candidato e vaga existem
        candidate = Candidate.query.get(data['candidate_id'])
        job = Job.query.get(data['job_id'])
        
        if not candidate:
            return jsonify({
                'success': False,
                'error': 'Candidato não encontrado'
            }), 404
            
        if not job:
            return jsonify({
                'success': False,
                'error': 'Vaga não encontrada'
            }), 404
        
        # Criar entrevista
        interview = Interview(
            candidate_id=data['candidate_id'],
            job_id=data['job_id'],
            interview_type=data.get('interview_type', 'simulada'),
            status=data.get('status', 'agendada'),
            scheduled_at=datetime.fromisoformat(data['scheduled_at']) if data.get('scheduled_at') else None,
            questions_count=data.get('questions_count', 0)
        )
        
        db.session.add(interview)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'interview': interview.to_dict(),
            'message': 'Entrevista criada com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@interview_bp.route('/interviews/<int:interview_id>', methods=['GET'])
def get_interview(interview_id):
    """Obter detalhes de uma entrevista específica"""
    try:
        interview = Interview.query.get_or_404(interview_id)
        return jsonify({
            'success': True,
            'interview': interview.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@interview_bp.route('/interviews/<int:interview_id>', methods=['PUT'])
def update_interview(interview_id):
    """Atualizar dados de uma entrevista"""
    try:
        interview = Interview.query.get_or_404(interview_id)
        data = request.get_json()
        
        # Campos que podem ser atualizados
        updatable_fields = [
            'status', 'interview_type', 'video_file_path', 'video_duration_seconds',
            'video_size_bytes', 'video_quality', 'total_score', 'confidence_score',
            'communication_score', 'technical_score', 'questions_count', 
            'answered_questions', 'processing_status', 'ai_feedback', 
            'recruiter_notes', 'started_at', 'completed_at', 'processed_at'
        ]
        
        for field in updatable_fields:
            if field in data:
                if field in ['started_at', 'completed_at', 'processed_at'] and data[field]:
                    setattr(interview, field, datetime.fromisoformat(data[field]))
                else:
                    setattr(interview, field, data[field])
        
        # Campos JSON especiais
        if 'face_analysis_data' in data:
            interview.set_face_analysis_data(data['face_analysis_data'])
        if 'emotion_summary' in data:
            interview.set_emotion_summary(data['emotion_summary'])
        if 'behavior_insights' in data:
            interview.set_behavior_insights(data['behavior_insights'])
        
        interview.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'interview': interview.to_dict(),
            'message': 'Entrevista atualizada com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@interview_bp.route('/interviews/<int:interview_id>/upload-video', methods=['POST'])
def upload_video(interview_id):
    """Upload do vídeo da entrevista"""
    try:
        interview = Interview.query.get_or_404(interview_id)
        
        if 'video' not in request.files:
            return jsonify({
                'success': False,
                'error': 'Nenhum arquivo de vídeo enviado'
            }), 400
        
        file = request.files['video']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'Nenhum arquivo selecionado'
            }), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': 'Tipo de arquivo não permitido. Use: mp4, webm, avi, mov'
            }), 400
        
        # Verificar tamanho do arquivo
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({
                'success': False,
                'error': f'Arquivo muito grande. Máximo: {MAX_FILE_SIZE // (1024*1024)}MB'
            }), 400
        
        # Gerar nome único para o arquivo
        filename = secure_filename(file.filename)
        unique_filename = f"{interview_id}_{uuid.uuid4().hex}_{filename}"
        
        # Salvar arquivo
        upload_path = ensure_upload_folder()
        file_path = os.path.join(upload_path, unique_filename)
        file.save(file_path)
        
        # Atualizar entrevista
        interview.video_file_path = file_path
        interview.video_size_bytes = file_size
        interview.status = 'processando'
        interview.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Vídeo enviado com sucesso',
            'file_path': file_path,
            'file_size': file_size,
            'interview': interview.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@interview_bp.route('/interviews/<int:interview_id>/responses', methods=['GET'])
def get_interview_responses(interview_id):
    """Obter todas as respostas de uma entrevista"""
    try:
        interview = Interview.query.get_or_404(interview_id)
        responses = InterviewResponse.query.filter_by(interview_id=interview_id).order_by(InterviewResponse.question_number).all()
        
        return jsonify({
            'success': True,
            'interview_id': interview_id,
            'responses': [response.to_dict() for response in responses]
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@interview_bp.route('/interviews/<int:interview_id>/responses', methods=['POST'])
def add_interview_response():
    """Adicionar resposta a uma pergunta da entrevista"""
    try:
        data = request.get_json()
        interview_id = data.get('interview_id')
        
        # Validar dados obrigatórios
        required_fields = ['interview_id', 'question_number', 'question_text']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Campo obrigatório: {field}'
                }), 400
        
        # Verificar se entrevista existe
        interview = Interview.query.get_or_404(interview_id)
        
        # Verificar se já existe resposta para esta pergunta
        existing_response = InterviewResponse.query.filter_by(
            interview_id=interview_id,
            question_number=data['question_number']
        ).first()
        
        if existing_response:
            return jsonify({
                'success': False,
                'error': 'Resposta já existe para esta pergunta'
            }), 400
        
        # Criar resposta
        response = InterviewResponse(
            interview_id=interview_id,
            question_number=data['question_number'],
            question_text=data['question_text'],
            question_type=data.get('question_type', 'geral'),
            transcription=data.get('transcription'),
            response_duration_seconds=data.get('response_duration_seconds'),
            score=data.get('score'),
            strengths=data.get('strengths'),
            improvements=data.get('improvements'),
            adequacy_score=data.get('adequacy_score'),
            confidence_level=data.get('confidence_level'),
            emotion_detected=data.get('emotion_detected'),
            face_analysis_samples=data.get('face_analysis_samples', 0)
        )
        
        # Dados JSON
        if 'analysis_data' in data:
            response.set_analysis_data(data['analysis_data'])
        
        db.session.add(response)
        
        # Atualizar contador de respostas na entrevista
        interview.answered_questions = InterviewResponse.query.filter_by(interview_id=interview_id).count() + 1
        interview.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'response': response.to_dict(),
            'message': 'Resposta adicionada com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@interview_bp.route('/interviews/<int:interview_id>/responses/<int:question_number>', methods=['PUT'])
def update_interview_response(interview_id, question_number):
    """Atualizar resposta específica de uma entrevista"""
    try:
        response = InterviewResponse.query.filter_by(
            interview_id=interview_id,
            question_number=question_number
        ).first_or_404()
        
        data = request.get_json()
        
        # Campos que podem ser atualizados
        updatable_fields = [
            'transcription', 'response_duration_seconds', 'score', 'strengths',
            'improvements', 'adequacy_score', 'confidence_level', 'emotion_detected',
            'face_analysis_samples'
        ]
        
        for field in updatable_fields:
            if field in data:
                setattr(response, field, data[field])
        
        # Dados JSON
        if 'analysis_data' in data:
            response.set_analysis_data(data['analysis_data'])
        
        response.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'response': response.to_dict(),
            'message': 'Resposta atualizada com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@interview_bp.route('/interviews/<int:interview_id>/complete', methods=['POST'])
def complete_interview(interview_id):
    """Marcar entrevista como concluída e processar dados finais"""
    try:
        interview = Interview.query.get_or_404(interview_id)
        data = request.get_json() or {}
        
        # Atualizar status
        interview.status = 'concluida'
        interview.completed_at = datetime.utcnow()
        interview.processing_status = 'concluido'
        interview.processed_at = datetime.utcnow()
        
        # Atualizar scores finais se fornecidos
        if 'total_score' in data:
            interview.total_score = data['total_score']
        if 'confidence_score' in data:
            interview.confidence_score = data['confidence_score']
        if 'communication_score' in data:
            interview.communication_score = data['communication_score']
        if 'technical_score' in data:
            interview.technical_score = data['technical_score']
        if 'ai_feedback' in data:
            interview.ai_feedback = data['ai_feedback']
        
        # Dados de análise facial final
        if 'face_analysis_data' in data:
            interview.set_face_analysis_data(data['face_analysis_data'])
        if 'emotion_summary' in data:
            interview.set_emotion_summary(data['emotion_summary'])
        if 'behavior_insights' in data:
            interview.set_behavior_insights(data['behavior_insights'])
        
        interview.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'interview': interview.to_dict(),
            'message': 'Entrevista concluída com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@interview_bp.route('/interviews/<int:interview_id>', methods=['DELETE'])
def delete_interview(interview_id):
    """Deletar entrevista e todos os dados relacionados"""
    try:
        interview = Interview.query.get_or_404(interview_id)
        
        # Deletar arquivo de vídeo se existir
        if interview.video_file_path and os.path.exists(interview.video_file_path):
            try:
                os.remove(interview.video_file_path)
            except OSError:
                pass  # Ignorar erro se não conseguir deletar arquivo
        
        # Deletar entrevista (respostas são deletadas automaticamente por cascade)
        db.session.delete(interview)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Entrevista deletada com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@interview_bp.route('/interviews/analytics', methods=['GET'])
def get_interviews_analytics():
    """Obter analytics das entrevistas"""
    try:
        # Estatísticas gerais
        total_interviews = Interview.query.count()
        completed_interviews = Interview.query.filter_by(status='concluida').count()
        avg_score = db.session.query(db.func.avg(Interview.total_score)).filter(Interview.total_score.isnot(None)).scalar()
        
        # Estatísticas por status
        status_stats = db.session.query(
            Interview.status,
            db.func.count(Interview.id)
        ).group_by(Interview.status).all()
        
        # Estatísticas por tipo
        type_stats = db.session.query(
            Interview.interview_type,
            db.func.count(Interview.id)
        ).group_by(Interview.interview_type).all()
        
        # Entrevistas por mês (últimos 6 meses)
        monthly_stats = db.session.query(
            db.func.date_format(Interview.created_at, '%Y-%m').label('month'),
            db.func.count(Interview.id)
        ).filter(
            Interview.created_at >= datetime.utcnow().replace(day=1) - db.text('INTERVAL 6 MONTH')
        ).group_by('month').order_by('month').all()
        
        return jsonify({
            'success': True,
            'analytics': {
                'total_interviews': total_interviews,
                'completed_interviews': completed_interviews,
                'completion_rate': (completed_interviews / total_interviews * 100) if total_interviews > 0 else 0,
                'average_score': float(avg_score) if avg_score else 0,
                'status_distribution': dict(status_stats),
                'type_distribution': dict(type_stats),
                'monthly_trend': dict(monthly_stats)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

