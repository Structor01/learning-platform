from flask import Blueprint, request, jsonify, current_app
from src.models.psychological_test import db, PsychologicalTest, TestResponse, TestQuestion
from datetime import datetime
import json
import math

psych_test_bp = Blueprint('psychological_test', __name__)

# Banco de perguntas do teste unificado (25 perguntas)
UNIFIED_TEST_QUESTIONS = [
    # DISC - 10 perguntas (40%)
    {
        "question_number": 1,
        "question_text": "Em situações de trabalho, eu tendo a:",
        "category": "disc",
        "subcategory": "dominance",
        "options": [
            {"value": 4, "text": "Tomar decisões rapidamente e assumir o controle"},
            {"value": 3, "text": "Liderar quando necessário"},
            {"value": 2, "text": "Colaborar com outros na tomada de decisões"},
            {"value": 1, "text": "Preferir que outros tomem as decisões"}
        ],
        "scale_type": "choice_4"
    },
    {
        "question_number": 2,
        "question_text": "Quando trabalho em equipe, eu:",
        "category": "disc",
        "subcategory": "influence",
        "options": [
            {"value": 4, "text": "Motivo e inspiro os outros com entusiasmo"},
            {"value": 3, "text": "Contribuo com ideias criativas"},
            {"value": 2, "text": "Apoio as ideias dos outros"},
            {"value": 1, "text": "Prefiro trabalhar nos bastidores"}
        ],
        "scale_type": "choice_4"
    },
    {
        "question_number": 3,
        "question_text": "Minha abordagem para mudanças é:",
        "category": "disc",
        "subcategory": "steadiness",
        "options": [
            {"value": 1, "text": "Abraço mudanças rapidamente"},
            {"value": 2, "text": "Me adapto gradualmente"},
            {"value": 3, "text": "Prefiro estabilidade, mas aceito mudanças"},
            {"value": 4, "text": "Valorizo muito a estabilidade e rotina"}
        ],
        "scale_type": "choice_4"
    },
    {
        "question_number": 4,
        "question_text": "Ao realizar tarefas, eu:",
        "category": "disc",
        "subcategory": "conscientiousness",
        "options": [
            {"value": 4, "text": "Sigo procedimentos detalhados e verifico tudo"},
            {"value": 3, "text": "Planejo cuidadosamente antes de executar"},
            {"value": 2, "text": "Equilibro planejamento com ação"},
            {"value": 1, "text": "Prefiro agir rapidamente e ajustar depois"}
        ],
        "scale_type": "choice_4"
    },
    {
        "question_number": 5,
        "question_text": "Em conflitos, eu tendo a:",
        "category": "disc",
        "subcategory": "dominance",
        "options": [
            {"value": 4, "text": "Confrontar diretamente o problema"},
            {"value": 3, "text": "Buscar soluções assertivas"},
            {"value": 2, "text": "Mediar e buscar consenso"},
            {"value": 1, "text": "Evitar confrontos quando possível"}
        ],
        "scale_type": "choice_4"
    },
    {
        "question_number": 6,
        "question_text": "Meu estilo de comunicação é:",
        "category": "disc",
        "subcategory": "influence",
        "options": [
            {"value": 4, "text": "Expressivo e persuasivo"},
            {"value": 3, "text": "Amigável e otimista"},
            {"value": 2, "text": "Calmo e respeitoso"},
            {"value": 1, "text": "Direto e factual"}
        ],
        "scale_type": "choice_4"
    },
    {
        "question_number": 7,
        "question_text": "Prefiro ambientes de trabalho que sejam:",
        "category": "disc",
        "subcategory": "steadiness",
        "options": [
            {"value": 1, "text": "Dinâmicos e em constante mudança"},
            {"value": 2, "text": "Colaborativos com alguma variação"},
            {"value": 3, "text": "Estáveis com mudanças graduais"},
            {"value": 4, "text": "Previsíveis e bem estruturados"}
        ],
        "scale_type": "choice_4"
    },
    {
        "question_number": 8,
        "question_text": "Ao receber feedback, eu:",
        "category": "disc",
        "subcategory": "conscientiousness",
        "options": [
            {"value": 4, "text": "Analiso detalhadamente e implemento melhorias"},
            {"value": 3, "text": "Considero cuidadosamente as sugestões"},
            {"value": 2, "text": "Aceito e aplico quando relevante"},
            {"value": 1, "text": "Prefiro feedback direto e ação rápida"}
        ],
        "scale_type": "choice_4"
    },
    {
        "question_number": 9,
        "question_text": "Minha motivação principal no trabalho é:",
        "category": "disc",
        "subcategory": "dominance",
        "options": [
            {"value": 4, "text": "Alcançar resultados e superar desafios"},
            {"value": 3, "text": "Reconhecimento e impacto positivo"},
            {"value": 2, "text": "Harmonia e relacionamentos sólidos"},
            {"value": 1, "text": "Qualidade e precisão no trabalho"}
        ],
        "scale_type": "choice_4"
    },
    {
        "question_number": 10,
        "question_text": "Sob pressão, eu:",
        "category": "disc",
        "subcategory": "influence",
        "options": [
            {"value": 1, "text": "Mantenho o foco e tomo decisões rápidas"},
            {"value": 4, "text": "Busco apoio da equipe e mantenho o moral alto"},
            {"value": 3, "text": "Trabalho de forma consistente e confiável"},
            {"value": 2, "text": "Analiso cuidadosamente antes de agir"}
        ],
        "scale_type": "choice_4"
    },
    
    # Big Five - 10 perguntas (40%)
    {
        "question_number": 11,
        "question_text": "Eu me considero uma pessoa criativa e imaginativa:",
        "category": "big5",
        "subcategory": "openness",
        "options": [
            {"value": 1, "text": "Discordo totalmente"},
            {"value": 2, "text": "Discordo parcialmente"},
            {"value": 3, "text": "Concordo parcialmente"},
            {"value": 4, "text": "Concordo totalmente"}
        ],
        "scale_type": "likert_4"
    },
    {
        "question_number": 12,
        "question_text": "Gosto de experimentar coisas novas e diferentes:",
        "category": "big5",
        "subcategory": "openness",
        "options": [
            {"value": 1, "text": "Discordo totalmente"},
            {"value": 2, "text": "Discordo parcialmente"},
            {"value": 3, "text": "Concordo parcialmente"},
            {"value": 4, "text": "Concordo totalmente"}
        ],
        "scale_type": "likert_4"
    },
    {
        "question_number": 13,
        "question_text": "Sou uma pessoa organizada e disciplinada:",
        "category": "big5",
        "subcategory": "conscientiousness",
        "options": [
            {"value": 1, "text": "Discordo totalmente"},
            {"value": 2, "text": "Discordo parcialmente"},
            {"value": 3, "text": "Concordo parcialmente"},
            {"value": 4, "text": "Concordo totalmente"}
        ],
        "scale_type": "likert_4"
    },
    {
        "question_number": 14,
        "question_text": "Sempre cumpro meus compromissos e prazos:",
        "category": "big5",
        "subcategory": "conscientiousness",
        "options": [
            {"value": 1, "text": "Discordo totalmente"},
            {"value": 2, "text": "Discordo parcialmente"},
            {"value": 3, "text": "Concordo parcialmente"},
            {"value": 4, "text": "Concordo totalmente"}
        ],
        "scale_type": "likert_4"
    },
    {
        "question_number": 15,
        "question_text": "Me sinto energizado quando estou com outras pessoas:",
        "category": "big5",
        "subcategory": "extraversion",
        "options": [
            {"value": 1, "text": "Discordo totalmente"},
            {"value": 2, "text": "Discordo parcialmente"},
            {"value": 3, "text": "Concordo parcialmente"},
            {"value": 4, "text": "Concordo totalmente"}
        ],
        "scale_type": "likert_4"
    },
    {
        "question_number": 16,
        "question_text": "Gosto de ser o centro das atenções:",
        "category": "big5",
        "subcategory": "extraversion",
        "options": [
            {"value": 1, "text": "Discordo totalmente"},
            {"value": 2, "text": "Discordo parcialmente"},
            {"value": 3, "text": "Concordo parcialmente"},
            {"value": 4, "text": "Concordo totalmente"}
        ],
        "scale_type": "likert_4"
    },
    {
        "question_number": 17,
        "question_text": "Sou uma pessoa empática e compreensiva:",
        "category": "big5",
        "subcategory": "agreeableness",
        "options": [
            {"value": 1, "text": "Discordo totalmente"},
            {"value": 2, "text": "Discordo parcialmente"},
            {"value": 3, "text": "Concordo parcialmente"},
            {"value": 4, "text": "Concordo totalmente"}
        ],
        "scale_type": "likert_4"
    },
    {
        "question_number": 18,
        "question_text": "Prefiro cooperar a competir com outros:",
        "category": "big5",
        "subcategory": "agreeableness",
        "options": [
            {"value": 1, "text": "Discordo totalmente"},
            {"value": 2, "text": "Discordo parcialmente"},
            {"value": 3, "text": "Concordo parcialmente"},
            {"value": 4, "text": "Concordo totalmente"}
        ],
        "scale_type": "likert_4"
    },
    {
        "question_number": 19,
        "question_text": "Frequentemente me sinto ansioso ou preocupado:",
        "category": "big5",
        "subcategory": "neuroticism",
        "options": [
            {"value": 4, "text": "Discordo totalmente"},
            {"value": 3, "text": "Discordo parcialmente"},
            {"value": 2, "text": "Concordo parcialmente"},
            {"value": 1, "text": "Concordo totalmente"}
        ],
        "scale_type": "likert_4",
        "is_reverse_scored": True
    },
    {
        "question_number": 20,
        "question_text": "Mantenho a calma mesmo em situações estressantes:",
        "category": "big5",
        "subcategory": "neuroticism",
        "options": [
            {"value": 1, "text": "Discordo totalmente"},
            {"value": 2, "text": "Discordo parcialmente"},
            {"value": 3, "text": "Concordo parcialmente"},
            {"value": 4, "text": "Concordo totalmente"}
        ],
        "scale_type": "likert_4",
        "is_reverse_scored": True
    },
    
    # Liderança - 5 perguntas (20%)
    {
        "question_number": 21,
        "question_text": "Como líder, eu prefiro:",
        "category": "leadership",
        "subcategory": "autocratic",
        "options": [
            {"value": 4, "text": "Tomar decisões sozinho e dar instruções claras"},
            {"value": 3, "text": "Consultar a equipe mas decidir sozinho"},
            {"value": 2, "text": "Decidir em conjunto com a equipe"},
            {"value": 1, "text": "Deixar a equipe decidir autonomamente"}
        ],
        "scale_type": "choice_4"
    },
    {
        "question_number": 22,
        "question_text": "Minha abordagem para motivar a equipe é:",
        "category": "leadership",
        "subcategory": "transformational",
        "options": [
            {"value": 4, "text": "Inspirar com uma visão compartilhada"},
            {"value": 3, "text": "Reconhecer e recompensar bom desempenho"},
            {"value": 2, "text": "Estabelecer metas claras e acompanhar"},
            {"value": 1, "text": "Dar autonomia e confiar na equipe"}
        ],
        "scale_type": "choice_4"
    },
    {
        "question_number": 23,
        "question_text": "Quando há problemas na equipe, eu:",
        "category": "leadership",
        "subcategory": "democratic",
        "options": [
            {"value": 1, "text": "Resolvo rapidamente com autoridade"},
            {"value": 4, "text": "Facilito discussões para encontrar soluções"},
            {"value": 3, "text": "Negoceio acordos entre as partes"},
            {"value": 2, "text": "Permito que a equipe resolva sozinha"}
        ],
        "scale_type": "choice_4"
    },
    {
        "question_number": 24,
        "question_text": "Meu foco principal como líder é:",
        "category": "leadership",
        "subcategory": "transactional",
        "options": [
            {"value": 2, "text": "Desenvolver o potencial de cada pessoa"},
            {"value": 1, "text": "Criar uma cultura de inovação"},
            {"value": 4, "text": "Garantir que metas sejam atingidas"},
            {"value": 3, "text": "Manter harmonia e bem-estar da equipe"}
        ],
        "scale_type": "choice_4"
    },
    {
        "question_number": 25,
        "question_text": "Meu estilo de supervisão é:",
        "category": "leadership",
        "subcategory": "laissez_faire",
        "options": [
            {"value": 1, "text": "Supervisão próxima e constante"},
            {"value": 2, "text": "Acompanhamento regular com feedback"},
            {"value": 3, "text": "Supervisão moderada com autonomia"},
            {"value": 4, "text": "Máxima autonomia com mínima supervisão"}
        ],
        "scale_type": "choice_4"
    }
]

def initialize_test_questions():
    """Inicializar perguntas do teste no banco de dados"""
    try:
        # Verificar se já existem perguntas
        if TestQuestion.query.count() > 0:
            return True
        
        # Inserir perguntas
        for q_data in UNIFIED_TEST_QUESTIONS:
            question = TestQuestion(
                question_number=q_data['question_number'],
                question_text=q_data['question_text'],
                category=q_data['category'],
                subcategory=q_data['subcategory'],
                scale_type=q_data['scale_type'],
                is_reverse_scored=q_data.get('is_reverse_scored', False)
            )
            question.set_options(q_data['options'])
            db.session.add(question)
        
        db.session.commit()
        return True
        
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao inicializar perguntas: {e}")
        return False

def calculate_disc_scores(responses):
    """Calcular scores DISC baseado nas respostas"""
    disc_responses = [r for r in responses if r.question_category == 'disc']
    
    d_score = sum([r.answer_value for r in disc_responses if r.question_subcategory == 'dominance']) / 3
    i_score = sum([r.answer_value for r in disc_responses if r.question_subcategory == 'influence']) / 3
    s_score = sum([r.answer_value for r in disc_responses if r.question_subcategory == 'steadiness']) / 2
    c_score = sum([r.answer_value for r in disc_responses if r.question_subcategory == 'conscientiousness']) / 2
    
    # Normalizar para escala 0-10
    d_score = (d_score - 1) * 10 / 3
    i_score = (i_score - 1) * 10 / 3
    s_score = (s_score - 1) * 10 / 3
    c_score = (c_score - 1) * 10 / 3
    
    # Determinar estilo primário e secundário
    scores = {'D': d_score, 'I': i_score, 'S': s_score, 'C': c_score}
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    
    primary_style = sorted_scores[0][0]
    secondary_style = sorted_scores[1][0]
    
    return {
        'd_score': round(d_score, 2),
        'i_score': round(i_score, 2),
        's_score': round(s_score, 2),
        'c_score': round(c_score, 2),
        'primary_style': primary_style,
        'secondary_style': secondary_style
    }

def calculate_big5_scores(responses):
    """Calcular scores Big Five baseado nas respostas"""
    big5_responses = [r for r in responses if r.question_category == 'big5']
    
    openness = sum([r.answer_value for r in big5_responses if r.question_subcategory == 'openness']) / 2
    conscientiousness = sum([r.answer_value for r in big5_responses if r.question_subcategory == 'conscientiousness']) / 2
    extraversion = sum([r.answer_value for r in big5_responses if r.question_subcategory == 'extraversion']) / 2
    agreeableness = sum([r.answer_value for r in big5_responses if r.question_subcategory == 'agreeableness']) / 2
    neuroticism = sum([r.answer_value for r in big5_responses if r.question_subcategory == 'neuroticism']) / 2
    
    # Normalizar para escala 0-10
    openness = (openness - 1) * 10 / 3
    conscientiousness = (conscientiousness - 1) * 10 / 3
    extraversion = (extraversion - 1) * 10 / 3
    agreeableness = (agreeableness - 1) * 10 / 3
    neuroticism = (neuroticism - 1) * 10 / 3
    
    return {
        'openness': round(openness, 2),
        'conscientiousness': round(conscientiousness, 2),
        'extraversion': round(extraversion, 2),
        'agreeableness': round(agreeableness, 2),
        'neuroticism': round(neuroticism, 2)
    }

def calculate_leadership_scores(responses):
    """Calcular scores de liderança baseado nas respostas"""
    leadership_responses = [r for r in responses if r.question_category == 'leadership']
    
    # Mapear respostas para estilos
    autocratic = sum([r.answer_value for r in leadership_responses if r.question_subcategory == 'autocratic'])
    democratic = sum([r.answer_value for r in leadership_responses if r.question_subcategory == 'democratic'])
    transformational = sum([r.answer_value for r in leadership_responses if r.question_subcategory == 'transformational'])
    transactional = sum([r.answer_value for r in leadership_responses if r.question_subcategory == 'transactional'])
    laissez_faire = sum([r.answer_value for r in leadership_responses if r.question_subcategory == 'laissez_faire'])
    
    # Normalizar para escala 0-10
    autocratic = (autocratic - 1) * 10 / 3
    democratic = (democratic - 1) * 10 / 3
    transformational = (transformational - 1) * 10 / 3
    transactional = (transactional - 1) * 10 / 3
    laissez_faire = (laissez_faire - 1) * 10 / 3
    
    # Determinar estilo primário
    styles = {
        'Autocrático': autocratic,
        'Democrático': democratic,
        'Transformacional': transformational,
        'Transacional': transactional,
        'Laissez-faire': laissez_faire
    }
    primary_style = max(styles, key=styles.get)
    
    return {
        'autocratic': round(autocratic, 2),
        'democratic': round(democratic, 2),
        'transformational': round(transformational, 2),
        'transactional': round(transactional, 2),
        'laissez_faire': round(laissez_faire, 2),
        'primary_style': primary_style
    }

@psych_test_bp.route('/psychological-tests', methods=['GET'])
def get_tests():
    """Listar testes psicológicos"""
    try:
        candidate_id = request.args.get('candidate_id', type=int)
        status = request.args.get('status')
        
        query = PsychologicalTest.query
        
        if candidate_id:
            query = query.filter(PsychologicalTest.candidate_id == candidate_id)
        if status:
            query = query.filter(PsychologicalTest.status == status)
        
        tests = query.order_by(PsychologicalTest.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'tests': [test.to_dict() for test in tests]
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@psych_test_bp.route('/psychological-tests', methods=['POST'])
def create_test():
    """Iniciar novo teste psicológico"""
    try:
        data = request.get_json()
        
        if 'candidate_id' not in data:
            return jsonify({
                'success': False,
                'error': 'Campo obrigatório: candidate_id'
            }), 400
        
        # Inicializar perguntas se necessário
        initialize_test_questions()
        
        test = PsychologicalTest(
            candidate_id=data['candidate_id'],
            test_type=data.get('test_type', 'completo'),
            status='iniciado',
            total_questions=25
        )
        
        db.session.add(test)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'test': test.to_dict(),
            'message': 'Teste psicológico iniciado com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@psych_test_bp.route('/psychological-tests/<int:test_id>/questions', methods=['GET'])
def get_test_questions(test_id):
    """Obter perguntas do teste"""
    try:
        test = PsychologicalTest.query.get_or_404(test_id)
        
        # Obter perguntas ativas ordenadas por número
        questions = TestQuestion.query.filter_by(is_active=True).order_by(TestQuestion.question_number).all()
        
        return jsonify({
            'success': True,
            'test_id': test_id,
            'questions': [q.to_dict() for q in questions]
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@psych_test_bp.route('/psychological-tests/<int:test_id>/responses', methods=['POST'])
def submit_response(test_id):
    """Submeter resposta a uma pergunta"""
    try:
        test = PsychologicalTest.query.get_or_404(test_id)
        data = request.get_json()
        
        required_fields = ['question_number', 'answer_value']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Campo obrigatório: {field}'
                }), 400
        
        # Obter pergunta
        question = TestQuestion.query.filter_by(question_number=data['question_number']).first()
        if not question:
            return jsonify({
                'success': False,
                'error': 'Pergunta não encontrada'
            }), 404
        
        # Verificar se já existe resposta
        existing_response = TestResponse.query.filter_by(
            test_id=test_id,
            question_number=data['question_number']
        ).first()
        
        if existing_response:
            # Atualizar resposta existente
            existing_response.answer_value = data['answer_value']
            existing_response.answer_text = data.get('answer_text', '')
            existing_response.response_time_seconds = data.get('response_time_seconds', 0)
            existing_response.updated_at = datetime.utcnow()
        else:
            # Criar nova resposta
            response = TestResponse(
                test_id=test_id,
                question_number=data['question_number'],
                question_text=question.question_text,
                question_category=question.category,
                question_subcategory=question.subcategory,
                answer_value=data['answer_value'],
                answer_text=data.get('answer_text', ''),
                response_time_seconds=data.get('response_time_seconds', 0),
                weight=question.weight,
                is_reverse_scored=question.is_reverse_scored
            )
            db.session.add(response)
        
        # Atualizar progresso do teste
        test.questions_answered = TestResponse.query.filter_by(test_id=test_id).count()
        if not existing_response:
            test.questions_answered += 1
        
        test.completion_percentage = (test.questions_answered / test.total_questions) * 100
        test.status = 'em_andamento'
        test.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'test_progress': {
                'questions_answered': test.questions_answered,
                'total_questions': test.total_questions,
                'completion_percentage': float(test.completion_percentage)
            },
            'message': 'Resposta registrada com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@psych_test_bp.route('/psychological-tests/<int:test_id>/complete', methods=['POST'])
def complete_test(test_id):
    """Finalizar teste e calcular resultados"""
    try:
        test = PsychologicalTest.query.get_or_404(test_id)
        
        # Obter todas as respostas
        responses = TestResponse.query.filter_by(test_id=test_id).all()
        
        if len(responses) < test.total_questions:
            return jsonify({
                'success': False,
                'error': f'Teste incompleto. {len(responses)}/{test.total_questions} perguntas respondidas'
            }), 400
        
        # Calcular scores
        disc_scores = calculate_disc_scores(responses)
        big5_scores = calculate_big5_scores(responses)
        leadership_scores = calculate_leadership_scores(responses)
        
        # Atualizar teste com resultados
        test.disc_d_score = disc_scores['d_score']
        test.disc_i_score = disc_scores['i_score']
        test.disc_s_score = disc_scores['s_score']
        test.disc_c_score = disc_scores['c_score']
        test.disc_primary_style = disc_scores['primary_style']
        test.disc_secondary_style = disc_scores['secondary_style']
        
        test.big5_openness = big5_scores['openness']
        test.big5_conscientiousness = big5_scores['conscientiousness']
        test.big5_extraversion = big5_scores['extraversion']
        test.big5_agreeableness = big5_scores['agreeableness']
        test.big5_neuroticism = big5_scores['neuroticism']
        
        test.leadership_autocratic = leadership_scores['autocratic']
        test.leadership_democratic = leadership_scores['democratic']
        test.leadership_transformational = leadership_scores['transformational']
        test.leadership_transactional = leadership_scores['transactional']
        test.leadership_laissez_faire = leadership_scores['laissez_faire']
        test.leadership_primary_style = leadership_scores['primary_style']
        
        # Gerar análise básica
        test.personality_summary = f"Perfil DISC: {disc_scores['primary_style']}{disc_scores['secondary_style']}, Estilo de Liderança: {leadership_scores['primary_style']}"
        
        # Calcular confiabilidade baseada no número de respostas
        test.confidence_score = min(95.0, (len(responses) / test.total_questions) * 100)
        
        test.status = 'concluido'
        test.completed_at = datetime.utcnow()
        test.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'test': test.to_dict(),
            'message': 'Teste concluído e resultados calculados'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@psych_test_bp.route('/psychological-tests/<int:test_id>', methods=['GET'])
def get_test(test_id):
    """Obter detalhes de um teste específico"""
    try:
        test = PsychologicalTest.query.get_or_404(test_id)
        return jsonify({
            'success': True,
            'test': test.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@psych_test_bp.route('/psychological-tests/<int:test_id>', methods=['DELETE'])
def delete_test(test_id):
    """Deletar teste psicológico"""
    try:
        test = PsychologicalTest.query.get_or_404(test_id)
        
        db.session.delete(test)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Teste deletado com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

