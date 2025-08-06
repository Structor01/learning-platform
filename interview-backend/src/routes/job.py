from flask import Blueprint, request, jsonify, current_app
from src.models.interview import db, Job
from datetime import datetime
import json
import requests
import os

job_bp = Blueprint('job', __name__)

def call_chatgpt_api(prompt, max_tokens=1500):
    """Chamar API do ChatGPT para gerar conteúdo"""
    try:
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            # Fallback: gerar vaga usando template baseado no prompt
            return generate_job_fallback(prompt)
        
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'model': 'gpt-3.5-turbo',
            'messages': [
                {
                    'role': 'system',
                    'content': 'Você é um especialista em recrutamento e recursos humanos. Crie vagas de emprego detalhadas e profissionais baseadas nas informações fornecidas.'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'max_tokens': max_tokens,
            'temperature': 0.7
        }
        
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return {
                'success': True,
                'content': result['choices'][0]['message']['content']
            }
        else:
            # Fallback em caso de erro na API
            return generate_job_fallback(prompt)
            
    except Exception as e:
        # Fallback em caso de erro
        return generate_job_fallback(prompt)

def generate_job_fallback(prompt):
    """Gerar vaga usando template quando API não está disponível"""
    
    # Analisar prompt para extrair informações
    prompt_lower = prompt.lower()
    
    # Detectar tecnologias/skills
    tech_keywords = {
        'python': ['Python', 'Django', 'Flask', 'FastAPI'],
        'javascript': ['JavaScript', 'React', 'Node.js', 'Vue.js'],
        'java': ['Java', 'Spring', 'Maven', 'Hibernate'],
        'php': ['PHP', 'Laravel', 'Symfony', 'WordPress'],
        'data': ['Python', 'SQL', 'Power BI', 'Excel'],
        'mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin'],
        'devops': ['Docker', 'Kubernetes', 'AWS', 'CI/CD']
    }
    
    detected_skills = []
    job_area = 'Tecnologia'
    
    for category, skills in tech_keywords.items():
        if category in prompt_lower:
            detected_skills.extend(skills[:3])  # Máximo 3 skills por categoria
            if category == 'data':
                job_area = 'Dados e Analytics'
            elif category == 'mobile':
                job_area = 'Desenvolvimento Mobile'
            elif category == 'devops':
                job_area = 'DevOps e Infraestrutura'
    
    if not detected_skills:
        detected_skills = ['Conhecimento técnico', 'Trabalho em equipe', 'Comunicação']
    
    # Detectar nível de experiência
    if any(word in prompt_lower for word in ['senior', 'especialista', 'lead']):
        experience_level = 'senior'
        salary_range = 'R$ 10.000 - R$ 15.000'
    elif any(word in prompt_lower for word in ['junior', 'iniciante', 'trainee']):
        experience_level = 'junior'
        salary_range = 'R$ 3.000 - R$ 5.000'
    else:
        experience_level = 'pleno'
        salary_range = 'R$ 6.000 - R$ 10.000'
    
    # Detectar tipo de vaga
    if 'python' in prompt_lower:
        title = f"Desenvolvedor Python {experience_level.title()}"
        description = f"""
        Estamos buscando um Desenvolvedor Python {experience_level} para integrar nossa equipe de tecnologia. 
        O profissional será responsável por desenvolver e manter aplicações web robustas, 
        trabalhar com APIs RESTful e contribuir para a arquitetura de sistemas escaláveis.
        
        Você terá a oportunidade de trabalhar em projetos desafiadores, utilizando as melhores 
        práticas de desenvolvimento e metodologias ágeis. Nossa equipe valoriza a inovação, 
        o aprendizado contínuo e a colaboração.
        """
        requirements = f"""
        - Experiência sólida com Python e frameworks como Django ou Flask
        - Conhecimento em bancos de dados relacionais (PostgreSQL, MySQL)
        - Experiência com versionamento de código (Git)
        - Conhecimento em APIs RESTful
        - {' '.join(detected_skills[:5])}
        """
    elif 'javascript' in prompt_lower or 'react' in prompt_lower:
        title = f"Desenvolvedor Frontend {experience_level.title()}"
        description = f"""
        Procuramos um Desenvolvedor Frontend {experience_level} apaixonado por criar interfaces 
        de usuário excepcionais. Você será responsável por desenvolver aplicações web modernas, 
        responsivas e com foco na experiência do usuário.
        
        Trabalhará em estreita colaboração com designers e desenvolvedores backend para 
        criar produtos digitais inovadores que impactam milhares de usuários.
        """
        requirements = f"""
        - Experiência com JavaScript moderno (ES6+)
        - Domínio de React.js e seu ecossistema
        - Conhecimento em HTML5, CSS3 e pré-processadores
        - Experiência com ferramentas de build (Webpack, Vite)
        - {' '.join(detected_skills[:5])}
        """
    else:
        title = f"Desenvolvedor {experience_level.title()}"
        description = f"""
        Buscamos um profissional {experience_level} para integrar nossa equipe de desenvolvimento. 
        O candidato ideal é alguém proativo, com paixão por tecnologia e disposição para 
        aprender e crescer em um ambiente dinâmico e colaborativo.
        
        Oferecemos oportunidades de crescimento, projetos desafiadores e um ambiente 
        de trabalho que valoriza a inovação e o desenvolvimento pessoal.
        """
        requirements = f"""
        - Experiência em desenvolvimento de software
        - Conhecimento em linguagens de programação modernas
        - Familiaridade com bancos de dados
        - Experiência com versionamento de código
        - {' '.join(detected_skills[:5])}
        """
    
    # Gerar JSON da vaga
    job_json = {
        "title": title,
        "company": "Empresa Inovadora",
        "description": description.strip(),
        "requirements": requirements.strip(),
        "location": "São Paulo, SP",
        "salary_range": salary_range,
        "experience_level": experience_level,
        "area": job_area,
        "benefits": [
            "Vale refeição e alimentação",
            "Plano de saúde e odontológico",
            "Horário flexível",
            "Home office híbrido",
            "Programa de capacitação"
        ],
        "custom_questions": [
            f"Conte sobre sua experiência com {detected_skills[0] if detected_skills else 'desenvolvimento'}",
            "Como você se mantém atualizado com as tecnologias do mercado?",
            "Descreva um projeto desafiador que você trabalhou recentemente"
        ]
    }
    
    return {
        'success': True,
        'content': json.dumps(job_json, ensure_ascii=False, indent=2)
    }

@job_bp.route('/jobs', methods=['GET'])
def get_jobs():
    """Listar todas as vagas com filtros opcionais"""
    try:
        # Parâmetros de filtro
        status = request.args.get('status')
        area = request.args.get('area')
        experience_level = request.args.get('experience_level')
        created_via_ai = request.args.get('created_via_ai')
        
        # Paginação
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Construir query
        query = Job.query
        
        if status:
            query = query.filter(Job.status == status)
        if area:
            query = query.filter(Job.area.ilike(f'%{area}%'))
        if experience_level:
            query = query.filter(Job.experience_level == experience_level)
        if created_via_ai is not None:
            query = query.filter(Job.created_via_ai == (created_via_ai.lower() == 'true'))
        
        # Ordenar por data de criação (mais recentes primeiro)
        query = query.order_by(Job.created_at.desc())
        
        # Paginação
        jobs = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'success': True,
            'jobs': [job.to_dict() for job in jobs.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': jobs.total,
                'pages': jobs.pages,
                'has_next': jobs.has_next,
                'has_prev': jobs.has_prev
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@job_bp.route('/jobs', methods=['POST'])
def create_job():
    """Criar nova vaga (manual ou via IA)"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['title', 'company']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Campo obrigatório: {field}'
                }), 400
        
        # Criar vaga
        job = Job(
            title=data['title'],
            company=data['company'],
            description=data.get('description', ''),
            requirements=data.get('requirements', ''),
            location=data.get('location', ''),
            salary_range=data.get('salary_range', ''),
            experience_level=data.get('experience_level', ''),
            area=data.get('area', ''),
            status=data.get('status', 'ativa'),
            created_via_ai=data.get('created_via_ai', False),
            ai_prompt=data.get('ai_prompt')
        )
        
        # Dados JSON
        if 'custom_questions' in data:
            job.set_custom_questions(data['custom_questions'])
        if 'analytics_data' in data:
            job.set_analytics_data(data['analytics_data'])
        
        db.session.add(job)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'job': job.to_dict(),
            'message': 'Vaga criada com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@job_bp.route('/jobs/generate-with-ai', methods=['POST'])
def generate_job_with_ai():
    """Gerar vaga completa usando ChatGPT"""
    try:
        data = request.get_json()
        
        if 'prompt' not in data:
            return jsonify({
                'success': False,
                'error': 'Campo obrigatório: prompt'
            }), 400
        
        user_prompt = data['prompt']
        
        # Prompt estruturado para o ChatGPT
        structured_prompt = f"""
        Baseado na seguinte descrição, crie uma vaga de emprego completa e profissional:
        
        DESCRIÇÃO: {user_prompt}
        
        Retorne APENAS um JSON válido no seguinte formato:
        {{
            "title": "Título da vaga",
            "company": "Nome da empresa (se não especificado, use 'Empresa Inovadora')",
            "description": "Descrição detalhada da vaga (mínimo 200 palavras)",
            "requirements": "Requisitos e qualificações necessárias",
            "location": "Localização (se não especificado, use 'São Paulo, SP')",
            "salary_range": "Faixa salarial estimada",
            "experience_level": "junior|pleno|senior",
            "area": "Área de atuação",
            "benefits": ["benefício1", "benefício2", "benefício3"],
            "custom_questions": [
                "Pergunta específica 1 para entrevista",
                "Pergunta específica 2 para entrevista",
                "Pergunta específica 3 para entrevista"
            ]
        }}
        
        Seja específico, profissional e use termos do mercado brasileiro.
        """
        
        # Chamar ChatGPT
        ai_response = call_chatgpt_api(structured_prompt)
        
        if not ai_response['success']:
            return jsonify({
                'success': False,
                'error': ai_response['error']
            }), 500
        
        # Tentar fazer parse do JSON retornado
        try:
            # Limpar resposta e extrair apenas o JSON
            content = ai_response['content'].strip()
            
            # Encontrar o JSON na resposta
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            
            if start_idx == -1 or end_idx == 0:
                raise ValueError('JSON não encontrado na resposta')
            
            json_content = content[start_idx:end_idx]
            job_data = json.loads(json_content)
            
        except (json.JSONDecodeError, ValueError) as e:
            return jsonify({
                'success': False,
                'error': f'Erro ao processar resposta da IA: {str(e)}',
                'raw_response': ai_response['content']
            }), 500
        
        # Criar vaga no banco de dados
        job = Job(
            title=job_data.get('title', 'Vaga Gerada por IA'),
            company=job_data.get('company', 'Empresa Inovadora'),
            description=job_data.get('description', ''),
            requirements=job_data.get('requirements', ''),
            location=job_data.get('location', 'São Paulo, SP'),
            salary_range=job_data.get('salary_range', 'A combinar'),
            experience_level=job_data.get('experience_level', 'pleno'),
            area=job_data.get('area', 'Geral'),
            status='ativa',
            created_via_ai=True,
            ai_prompt=user_prompt
        )
        
        # Adicionar perguntas customizadas se disponíveis
        if 'custom_questions' in job_data:
            job.set_custom_questions(job_data['custom_questions'])
        
        # Adicionar dados de analytics iniciais
        analytics_data = {
            'generated_at': datetime.utcnow().isoformat(),
            'ai_model': 'gpt-3.5-turbo',
            'benefits': job_data.get('benefits', []),
            'generation_source': 'chatgpt_api'
        }
        job.set_analytics_data(analytics_data)
        
        db.session.add(job)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'job': job.to_dict(),
            'ai_response': ai_response['content'],
            'message': 'Vaga gerada com IA e criada com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@job_bp.route('/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    """Obter detalhes de uma vaga específica"""
    try:
        job = Job.query.get_or_404(job_id)
        return jsonify({
            'success': True,
            'job': job.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@job_bp.route('/jobs/<int:job_id>', methods=['PUT'])
def update_job(job_id):
    """Atualizar dados de uma vaga"""
    try:
        job = Job.query.get_or_404(job_id)
        data = request.get_json()
        
        # Campos que podem ser atualizados
        updatable_fields = [
            'title', 'company', 'description', 'requirements', 'location',
            'salary_range', 'experience_level', 'area', 'status'
        ]
        
        for field in updatable_fields:
            if field in data:
                setattr(job, field, data[field])
        
        # Campos JSON especiais
        if 'custom_questions' in data:
            job.set_custom_questions(data['custom_questions'])
        if 'analytics_data' in data:
            job.set_analytics_data(data['analytics_data'])
        
        job.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'job': job.to_dict(),
            'message': 'Vaga atualizada com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@job_bp.route('/jobs/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    """Deletar vaga"""
    try:
        job = Job.query.get_or_404(job_id)
        
        # Verificar se há entrevistas associadas
        from src.models.interview import Interview
        interviews_count = Interview.query.filter_by(job_id=job_id).count()
        
        if interviews_count > 0:
            return jsonify({
                'success': False,
                'error': f'Não é possível deletar vaga com {interviews_count} entrevista(s) associada(s)'
            }), 400
        
        db.session.delete(job)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Vaga deletada com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@job_bp.route('/jobs/analytics', methods=['GET'])
def get_jobs_analytics():
    """Obter analytics das vagas"""
    try:
        # Estatísticas gerais
        total_jobs = Job.query.count()
        active_jobs = Job.query.filter_by(status='ativa').count()
        ai_generated_jobs = Job.query.filter_by(created_via_ai=True).count()
        
        # Estatísticas por status
        status_stats = db.session.query(
            Job.status,
            db.func.count(Job.id)
        ).group_by(Job.status).all()
        
        # Estatísticas por área
        area_stats = db.session.query(
            Job.area,
            db.func.count(Job.id)
        ).group_by(Job.area).order_by(db.func.count(Job.id).desc()).limit(10).all()
        
        # Estatísticas por nível de experiência
        experience_stats = db.session.query(
            Job.experience_level,
            db.func.count(Job.id)
        ).group_by(Job.experience_level).all()
        
        # Vagas por mês (últimos 6 meses)
        monthly_stats = db.session.query(
            db.func.date_format(Job.created_at, '%Y-%m').label('month'),
            db.func.count(Job.id)
        ).filter(
            Job.created_at >= datetime.utcnow().replace(day=1) - db.text('INTERVAL 6 MONTH')
        ).group_by('month').order_by('month').all()
        
        return jsonify({
            'success': True,
            'analytics': {
                'total_jobs': total_jobs,
                'active_jobs': active_jobs,
                'ai_generated_jobs': ai_generated_jobs,
                'ai_generation_rate': (ai_generated_jobs / total_jobs * 100) if total_jobs > 0 else 0,
                'status_distribution': dict(status_stats),
                'area_distribution': dict(area_stats),
                'experience_distribution': dict(experience_stats),
                'monthly_trend': dict(monthly_stats)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@job_bp.route('/jobs/suggest-improvements', methods=['POST'])
def suggest_job_improvements():
    """Sugerir melhorias para uma vaga usando IA"""
    try:
        data = request.get_json()
        
        if 'job_id' not in data:
            return jsonify({
                'success': False,
                'error': 'Campo obrigatório: job_id'
            }), 400
        
        job = Job.query.get_or_404(data['job_id'])
        
        # Prompt para sugestões de melhoria
        improvement_prompt = f"""
        Analise esta vaga de emprego e sugira melhorias específicas:
        
        VAGA ATUAL:
        Título: {job.title}
        Empresa: {job.company}
        Descrição: {job.description}
        Requisitos: {job.requirements}
        Localização: {job.location}
        Salário: {job.salary_range}
        Nível: {job.experience_level}
        Área: {job.area}
        
        Retorne APENAS um JSON válido com sugestões de melhoria:
        {{
            "title_suggestions": ["sugestão 1", "sugestão 2"],
            "description_improvements": ["melhoria 1", "melhoria 2"],
            "requirements_optimization": ["otimização 1", "otimização 2"],
            "salary_recommendations": "recomendação salarial",
            "additional_benefits": ["benefício 1", "benefício 2"],
            "seo_keywords": ["palavra-chave 1", "palavra-chave 2"],
            "overall_score": 8.5,
            "improvement_priority": "alta|média|baixa"
        }}
        """
        
        ai_response = call_chatgpt_api(improvement_prompt)
        
        if not ai_response['success']:
            return jsonify({
                'success': False,
                'error': ai_response['error']
            }), 500
        
        # Parse da resposta
        try:
            content = ai_response['content'].strip()
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            json_content = content[start_idx:end_idx]
            suggestions = json.loads(json_content)
            
        except (json.JSONDecodeError, ValueError) as e:
            return jsonify({
                'success': False,
                'error': f'Erro ao processar sugestões da IA: {str(e)}',
                'raw_response': ai_response['content']
            }), 500
        
        return jsonify({
            'success': True,
            'job_id': job.id,
            'suggestions': suggestions,
            'message': 'Sugestões de melhoria geradas com sucesso'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

