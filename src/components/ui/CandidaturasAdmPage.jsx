import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
    Briefcase,
    MapPin,
    Clock,
    Building2,
    Calendar,
    Eye,
    CheckCircle,
    XCircle,
    Hourglass,
    FileText,
    Users,
    TrendingUp,
    Filter,
    Search,
    Download,
    ExternalLink,
    Brain,
    User,
    X,
    AlertCircle,
    Linkedin,
    Mail,
    Video,
    Play,
    BarChart3,
    Award,
    Clock4,
    MessageSquare
} from "lucide-react";
import { API_URL } from "../utils/api";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "./Navbar";
import testService from "../../services/testService";
import CandidaturasPorVaga from './CandidaturasPorVaga';
import InterviewDetailsModal from "./InterviewDetailsModal";
import CandidateDetailsModal from "./CandidateDetailsModal";

const discConfig = {
    D: { name: "Dominância", color: "from-red-500 to-red-600" },
    I: { name: "Influência", color: "from-yellow-500 to-orange-500" },
    S: { name: "Estabilidade", color: "from-green-500 to-green-600" },
    C: { name: "Conformidade", color: "from-blue-500 to-blue-600" }
};

const CandidaturasAdmPage = () => {
    const [candidaturas, setCandidaturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("todos");
    const { accessToken, isAuthenticated, isLoading } = useAuth();
    const [modalCurriculo, setModalCurriculo] = useState({ isOpen: false, url: "", nome: "" });
    const [modalDisc, setModalDisc] = useState({ isOpen: false, resultado: "", nome: "" });
    const [modalInterview, setModalInterview] = useState({ isOpen: false, entrevistas: [], nome: "", candidaturaId: null });
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [candidateDetailsModal, setCandidateDetailsModal] = useState({ isOpen: false, candidatura: null });

    // Carregar dados da API
    useEffect(() => {
        console.log("Auth State:", { isLoading, isAuthenticated });
        if (!isLoading && isAuthenticated) {
            fetchTodasCandidaturas();
        }
    }, [isAuthenticated, isLoading]);

    const getPrincipalDisc = (discScores) => {
        if (!discScores) return null;
        let maxScore = 0;
        let principal = null;
        Object.entries(discScores).forEach(([letra, pontuacao]) => {
            if (pontuacao > maxScore) {
                maxScore = pontuacao;
                principal = letra;
            }
        });
        return principal;
    };

    // FUNÇÕES AUXILIARES PARA ENTREVISTAS

    const getInterviewStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'Concluída';
            case 'in_progress':
                return 'Em Progresso';
            case 'pending':
                return 'Pendente';
            default:
                return 'Desconhecido';
        }
    };

    // Função para visualizar detalhes da entrevista
    const handleViewInterviewDetails = async (interview) => {
        try {
            setLoading(true);
            console.log('🔍 Iniciando busca de detalhes da entrevista:', {
                interviewId: interview.id,
                status: interview.status,
                candidato: interview.candidato?.nome || interview.candidato?.name
            });

            // Verificar se temos token de acesso
            const token = localStorage.getItem("accessToken") || accessToken;
            if (!token) {
                throw new Error('❌ Token de acesso não encontrado. Faça login novamente.');
            }

            console.log('🔐 Token encontrado, fazendo requisição...');

            // Tentar buscar detalhes completos primeiro
            let response = await fetch(`${API_URL}/api/interviews/${interview.id}/details`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Se endpoint /details não existir, usar método alternativo
            if (!response.ok && response.status === 404) {
                console.log('📋 Endpoint /details não encontrado, usando método alternativo...');
                return await handleViewInterviewDetailsAlternative(interview.id, token);
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erro na requisição:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText
                });
                throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Detalhes da entrevista carregados:', {
                id: result.id,
                questionsCount: result.questions?.length || 0,
                status: result.status
            });

            // Resultado processado - aqui poderia abrir modal específico de detalhes da entrevista
            console.log('Detalhes da entrevista carregados:', result);

        } catch (error) {
            console.error('❌ Erro completo ao buscar detalhes da entrevista:', {
                message: error.message,
                stack: error.stack
            });
            alert('Erro ao carregar detalhes da entrevista: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Método alternativo para buscar detalhes da entrevista
    const handleViewInterviewDetailsAlternative = async (interviewId, token) => {
        try {
            console.log('🔄 Usando método alternativo para buscar detalhes...');

            // Buscar entrevista básica
            console.log(`📋 Buscando entrevista básica: ${API_URL}/api/interviews/${interviewId}`);
            const interviewResponse = await fetch(`${API_URL}/api/interviews/${interviewId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!interviewResponse.ok) {
                const errorText = await interviewResponse.text();
                console.error('❌ Erro ao buscar entrevista básica:', {
                    status: interviewResponse.status,
                    error: errorText
                });
                throw new Error(`Erro ao buscar entrevista: ${interviewResponse.status} - ${interviewResponse.statusText}`);
            }

            const interview = await interviewResponse.json();
            console.log('✅ Entrevista básica carregada:', {
                id: interview.id,
                status: interview.status,
                candidate_name: interview.candidate_name
            });

            // Buscar respostas
            console.log(`📋 Buscando respostas: ${API_URL}/api/interviews/${interviewId}/responses`);
            const responsesResponse = await fetch(`${API_URL}/api/interviews/${interviewId}/responses`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            let responses = [];
            if (responsesResponse.ok) {
                responses = await responsesResponse.json();
                console.log('✅ Respostas carregadas:', {
                    count: responses.length,
                    ids: responses.map(r => r.id)
                });
            } else {
                const errorText = await responsesResponse.text();
                console.warn('⚠️ Não foi possível buscar respostas:', {
                    status: responsesResponse.status,
                    error: errorText
                });
            }

            // Estruturar dados no formato esperado pelo modal
            const detailedInterview = {
                ...interview,
                questions: mapResponsesToQuestions(responses),
                user: interview.user || {
                    name: interview.candidate_name,
                    email: interview.candidate_email
                }
            };

            console.log('✅ Dados estruturados para modal:', {
                id: detailedInterview.id,
                questionsCount: detailedInterview.questions.length,
                userName: detailedInterview.user?.name
            });

            // Dados estruturados processados - aqui poderia abrir modal específico
            console.log('Dados da entrevista processados:', detailedInterview);

        } catch (error) {
            console.error('❌ Erro no método alternativo:', error);
            throw error;
        }
    };

    // Mapear respostas para formato de perguntas esperado pelo modal
    const mapResponsesToQuestions = (responses) => {
        if (!Array.isArray(responses)) return [];

        return responses.map((response, index) => ({
            id: response.id || `q-${index}`,
            order: response.question_number || index + 1,
            question: response.question || `Pergunta ${index + 1}`,
            answers: response ? [{
                id: response.id,
                bunny_video_id: response.bunny_video_id,
                bunny_library_id: response.bunny_library_id || '265939',
                video_url: response.video_url,
                stream_url: response.stream_url,
                thumbnail_url: response.thumbnail_url,
                video_size_bytes: response.video_size_bytes,
                processing_status: response.processing_status || 'completed',
                transcription: response.transcription,
                analysis: response.analysis ? {
                    score: response.analysis.score,
                    feedback: response.analysis.feedback,
                    timestamp: response.analysis.timestamp
                } : null,
                created_at: response.created_at,
                updated_at: response.updated_at
            }] : []
        }));
    };

    // 1. Função para buscar currículo de um candidato específico
    const handleViewCurriculoCandidato = async (usuarioId, nomeUsuario) => {
        console.log("🚀 INICIANDO handleViewCurriculoCandidato");
        console.log("📋 Parâmetros recebidos:", { usuarioId, nomeUsuario });

        try {
            // 1. VERIFICAR TOKEN
            const token = localStorage.getItem("accessToken") || accessToken;

            if (!token) {
                console.error("❌ ERRO: Token não encontrado");
                alert("Sessão expirada. Faça login novamente.");
                return;
            }

            // 2. CONSTRUIR URL
            const url = `${API_URL}/api/users/${usuarioId}/curriculo`;
            console.log("🌐 URL da requisição:", url);
            console.log("🌐 API_URL:", API_URL);

            console.log("📡 Fazendo requisição...");

            // 3. FAZER REQUISIÇÃO
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("📨 Resposta recebida:");
            console.log("   - Status:", response.status);
            console.log("   - StatusText:", response.statusText);
            console.log("   - OK:", response.ok);

            // 4. VERIFICAR STATUS
            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ ERRO na resposta:");
                console.error("   - Status:", response.status);
                console.error("   - Texto:", errorText);

                if (response.status === 404) {
                    alert("Currículo não encontrado para este candidato.");
                } else if (response.status === 401) {
                    alert("Sessão expirada. Faça login novamente.");
                } else {
                    alert(`Erro ${response.status}: ${errorText}`);
                }
                return;
            }

            console.log("✅ Resposta OK, processando blob...");

            // 5. PROCESSAR BLOB
            const blob = await response.blob();
            console.log("📄 Blob criado:");
            console.log("   - Tamanho:", blob.size, "bytes");
            console.log("   - Tipo:", blob.type);

            if (blob.size === 0) {
                console.error("❌ ERRO: Blob vazio");
                alert("Arquivo de currículo está vazio.");
                return;
            }

            // 6. CRIAR URL DO BLOB
            const blobUrl = window.URL.createObjectURL(blob);
            console.log("🔗 URL do blob criada:", blobUrl);

            // 7. ABRIR MODAL
            console.log("🎬 Abrindo modal...");
            setModalCurriculo({
                isOpen: true,
                url: blobUrl,
                nome: nomeUsuario || 'Usuário'
            });

            console.log("✅ Modal aberto com sucesso!");

            // 8. LIMPAR MEMORIA
            setTimeout(() => {
                console.log("🧹 Limpando URL do blob...");
                window.URL.revokeObjectURL(blobUrl);
            }, 60000);

        } catch (error) {
            console.error("💥 ERRO CAPTURADO:");
            console.error("   - Tipo:", error.name);
            console.error("   - Mensagem:", error.message);
            console.error("   - Stack:", error.stack);
            alert(`Erro ao carregar currículo: ${error.message}`);
        }
    };

    // Função para buscar candidaturas com LEFT JOIN otimizado
    const fetchTodasCandidaturas = async () => {
        try {
            setLoading(true);
            setError("");

            // OTIMIZAÇÃO: Usar endpoint com LEFT JOIN completo
            // Backend retorna candidaturas com entrevistas, dados de usuário e DISC incluídos via JOIN
            // Isso elimina múltiplas requisições HTTP por candidatura
            const response = await axios.get(`${API_URL}/api/candidaturas?include_interviews=true&include_users=true&include_disc=true`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            let candidaturas = response.data || [];

            if (candidaturas.length > 0) {
                console.log('🚀 Processando candidaturas com dados completos do LEFT JOIN otimizado...');

                // VERIFICAR SE O BACKEND JÁ RETORNOU DADOS DISC
                const precisaBuscarDisc = candidaturas.some(c => !c.usuario?.perfil_disc && !c.usuario?.disc_data);
                let usuariosData = {};

                if (precisaBuscarDisc) {
                    console.log('⚠️ Dados DISC não vieram do backend, fazendo busca em paralelo...');
                    const usuarioIdsUnicos = [...new Set(candidaturas.map(c => c.usuario_id))];

                    // BUSCAR DADOS DISC EM PARALELO apenas se necessário
                    const discPromises = usuarioIdsUnicos.map(async (usuarioId) => {
                        try {
                            const discData = await testService.getUserPsychologicalTests(usuarioId, 'completed', 1);

                            if (discData.tests && discData.tests.length > 0) {
                                const teste = discData.tests[0];
                                return {
                                    usuarioId,
                                    perfil_disc: {
                                        principal: getPrincipalDisc(teste.disc_scores),
                                        pontuacoes: teste.disc_scores,
                                        analise: teste.overall_analysis,
                                        recomendacoes: teste.recommendations
                                    }
                                };
                            }
                        } catch (discError) {
                            console.warn(`Erro ao buscar DISC para usuário ${usuarioId}:`, discError);
                        }
                        return { usuarioId, perfil_disc: null };
                    });

                    // Aguardar todos os perfis DISC em paralelo
                    const discResults = await Promise.allSettled(discPromises);
                    discResults.forEach((result) => {
                        if (result.status === 'fulfilled' && result.value) {
                            usuariosData[result.value.usuarioId] = {
                                perfil_disc: result.value.perfil_disc
                            };
                        }
                    });
                } else {
                    console.log('✅ Dados DISC já vieram do backend via LEFT JOIN!');
                }

                // MAPEAR DADOS OTIMIZADOS (entrevistas já incluídas via LEFT JOIN)
                candidaturas = candidaturas.map(candidatura => {
                    // Processar entrevistas que vêm em diferentes estruturas do backend
                    let entrevistas = [];

                    // 1. Verificar candidatura.usuario.entrevistas (array do JSON)
                    if (candidatura.usuario?.entrevistas && Array.isArray(candidatura.usuario.entrevistas)) {
                        entrevistas = [...candidatura.usuario.entrevistas];
                    }

                    // 2. Verificar candidatura.interview (objeto único)
                    if (candidatura.interview && !entrevistas.find(e => e.id === candidatura.interview.id)) {
                        entrevistas.push(candidatura.interview);
                    }

                    // 3. Verificar outras possíveis estruturas (fallback)
                    if (entrevistas.length === 0) {
                        const entrevistasRaw = candidatura.entrevistas || candidatura.interviews || [];
                        entrevistas = Array.isArray(entrevistasRaw) ? entrevistasRaw : [];
                    }

                    // Ordenar entrevistas por data de criação (mais recente primeiro)
                    const entrevistasOrdenadas = entrevistas
                        .filter(e => e && e.id) // Filtrar entrevistas válidas
                        .sort((a, b) => {
                            const dateA = new Date(a.updated_at || a.created_at || 0);
                            const dateB = new Date(b.updated_at || b.created_at || 0);
                            return dateB - dateA;
                        });

                    // Log de debug
                    if (entrevistasOrdenadas.length > 0 || candidatura.interview_id) {
                        console.log(`📋 Candidatura ${candidatura.id}:`, {
                            interview_id: candidatura.interview_id,
                            entrevistas_encontradas: entrevistasOrdenadas.length,
                            entrevistas_ids: entrevistasOrdenadas.map(e => `#${e.id} (${e.status})`),
                            status_candidatura: candidatura.status
                        });
                    }

                    return {
                        ...candidatura,
                        usuario: {
                            ...candidatura.usuario,
                            // Usar dados DISC do backend primeiro, depois fallback para busca manual
                            perfil_disc: candidatura.usuario?.perfil_disc || 
                                        candidatura.usuario?.disc_data || 
                                        usuariosData[candidatura.usuario_id]?.perfil_disc || null,
                            entrevistas: entrevistasOrdenadas
                        }
                    };
                });

                console.log(`✅ Processamento concluído: ${candidaturas.length} candidaturas com dados otimizados`);
            }

            // Log de debug final das candidaturas processadas
            console.log('📊 Resumo final das candidaturas processadas:', candidaturas.map(c => ({
                candidaturaId: c.id,
                usuarioNome: c.usuario?.nome || c.usuario?.name,
                totalEntrevistas: c.usuario?.entrevistas?.length || 0,
                entrevistasIDs: c.usuario?.entrevistas?.map(e => `ID: ${e.id} (${e.status})`) || [],
                temInterviewId: !!c.interview_id,
                interviewId: c.interview_id
            })));

            setCandidaturas(candidaturas);

        } catch (err) {
            console.error("💥 ERRO:", err);
            setError(`Erro: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // MODAL DE HISTÓRICO DE ENTREVISTAS
    const InterviewHistoryModal = () => (
        modalInterview.isOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                                <Video className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Histórico de Entrevistas</h3>
                                <p className="text-gray-400">{modalInterview.nome}</p>
                                <p className="text-xs text-blue-400">Candidatura #{modalInterview.candidaturaId}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setModalInterview({ isOpen: false, entrevistas: [], nome: "", candidaturaId: null })}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>

                    {/* Conteúdo */}
                    <div className="p-6">
                        {modalInterview.entrevistas.length === 0 ? (
                            <div className="text-center py-12">
                                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h4 className="text-lg font-medium text-white mb-2">Nenhuma entrevista realizada</h4>
                                <p className="text-gray-400">Esta candidatura ainda não possui entrevistas associadas.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Lista de Entrevistas Detalhada */}
                                <div>
                                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-purple-500" />
                                        Entrevistas Realizadas
                                    </h4>
                                    {modalInterview.entrevistas.map((entrevista) => {
                                        const totalQuestions = entrevista.questions ? entrevista.questions.length : 0;
                                        const answeredQuestions = entrevista.questions ?
                                            entrevista.questions.filter(q => q.answers && q.answers.length > 0).length : 0;
                                        const completionRate = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

                                        return (
                                            <div key={entrevista.id} className="mb-8 bg-white/5 rounded-xl p-6 border border-white/10">
                                                {/* Header da Entrevista */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <div className="font-bold text-white text-lg">
                                                            Entrevista #{entrevista.id}
                                                        </div>
                                                        <div className="text-gray-400 text-sm">
                                                            {entrevista.created_at ? new Date(entrevista.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${entrevista.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                            entrevista.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                                                'bg-gray-500/20 text-gray-400'
                                                            }`}>
                                                            {getInterviewStatusText(entrevista.status)}
                                                        </div>
                                                        <div className="text-gray-400 text-sm mt-1">
                                                            {answeredQuestions}/{totalQuestions} respondidas ({completionRate}%)
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Progresso */}
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                                                        <span>Progresso da Entrevista</span>
                                                        <span>{completionRate}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${completionRate}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                {/* Perguntas e Respostas */}
                                                <div className="space-y-4">
                                                    <h5 className="text-white font-semibold flex items-center gap-2">
                                                        <MessageSquare className="w-4 h-4" />
                                                        Perguntas e Respostas ({totalQuestions})
                                                    </h5>

                                                    {entrevista.questions && entrevista.questions.length > 0 ? (
                                                        entrevista.questions.map((question) => {
                                                            const hasAnswers = question.answers && question.answers.length > 0;
                                                            const firstAnswer = hasAnswers ? question.answers[0] : null;

                                                            return (
                                                                <div key={question.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                                                    {/* Header da Pergunta */}
                                                                    <div className="flex items-start justify-between mb-3">
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs font-medium">
                                                                                    Pergunta {question.order}
                                                                                </span>
                                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${hasAnswers ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                                                                    }`}>
                                                                                    {hasAnswers ? 'Respondida' : 'Não Respondida'}
                                                                                </span>
                                                                            </div>
                                                                            <div className="text-white font-medium">{question.title}</div>
                                                                            <div className="text-gray-400 text-sm mt-1">{question.description}</div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Resposta */}
                                                                    {hasAnswers && firstAnswer && (
                                                                        <div className="bg-gray-800/50 rounded-lg p-4 mt-3">
                                                                            {/* Transcrição */}
                                                                            <div className="mb-3">
                                                                                <div className="text-gray-300 text-sm font-medium mb-1">Transcrição:</div>
                                                                                <div className="text-gray-200 text-sm bg-gray-700/50 rounded p-2">
                                                                                    {firstAnswer.answers || 'Transcrição não disponível'}
                                                                                </div>
                                                                            </div>

                                                                            {/* Análise IA */}
                                                                            {firstAnswer.analysis && (
                                                                                <div className="mb-3">
                                                                                    <div className="text-gray-300 text-sm font-medium mb-2">Análise IA:</div>
                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3">
                                                                                            <div className="text-blue-400 text-xs font-medium">PONTUAÇÃO</div>
                                                                                            <div className="text-blue-300 text-lg font-bold">
                                                                                                {firstAnswer.analysis.score || 'N/A'}/10
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="bg-purple-500/10 border border-purple-500/20 rounded p-3">
                                                                                            <div className="text-purple-400 text-xs font-medium">RECOMENDAÇÃO</div>
                                                                                            <div className="text-purple-300 text-sm">
                                                                                                {firstAnswer.analysis.recommendation || 'N/A'}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>

                                                                                    {/* Pontos Fortes e Melhorias */}
                                                                                    {(firstAnswer.analysis.strengths || firstAnswer.analysis.improvements) && (
                                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                                                                            {firstAnswer.analysis.strengths && (
                                                                                                <div>
                                                                                                    <div className="text-green-400 text-xs font-medium mb-1">PONTOS FORTES</div>
                                                                                                    <div className="text-gray-300 text-xs">
                                                                                                        {Array.isArray(firstAnswer.analysis.strengths)
                                                                                                            ? firstAnswer.analysis.strengths.join(', ')
                                                                                                            : firstAnswer.analysis.strengths}
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}
                                                                                            {firstAnswer.analysis.improvements && (
                                                                                                <div>
                                                                                                    <div className="text-orange-400 text-xs font-medium mb-1">MELHORIAS</div>
                                                                                                    <div className="text-gray-300 text-xs">
                                                                                                        {Array.isArray(firstAnswer.analysis.improvements)
                                                                                                            ? firstAnswer.analysis.improvements.join(', ')
                                                                                                            : firstAnswer.analysis.improvements}
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}

                                                                            {/* Botão de Vídeo */}
                                                                            {firstAnswer.bunny_video_id && firstAnswer.bunny_library_id && (
                                                                                <div className="mb-3">
                                                                                    <button
                                                                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedVideo &&
                                                                                            selectedVideo.bunny_video_id === firstAnswer.bunny_video_id
                                                                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                                                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                                            }`}
                                                                                        onClick={() => {
                                                                                            const isVideoOpen = selectedVideo &&
                                                                                                selectedVideo.bunny_video_id === firstAnswer.bunny_video_id;
                                                                                            setSelectedVideo(isVideoOpen ? null : {
                                                                                                bunny_library_id: firstAnswer.bunny_library_id,
                                                                                                bunny_video_id: firstAnswer.bunny_video_id,
                                                                                                order: question.order
                                                                                            });
                                                                                        }}
                                                                                    >
                                                                                        <Play className="w-4 h-4" />
                                                                                        {selectedVideo && selectedVideo.bunny_video_id === firstAnswer.bunny_video_id
                                                                                            ? "Fechar Vídeo"
                                                                                            : "Assistir Resposta"}
                                                                                    </button>

                                                                                    {/* Player de Vídeo */}
                                                                                    {selectedVideo && selectedVideo.bunny_video_id === firstAnswer.bunny_video_id && (
                                                                                        <div className="mt-3 rounded-lg overflow-hidden" style={{ position: 'relative', paddingTop: '56.25%' }}>
                                                                                            <iframe
                                                                                                src={`https://iframe.mediadelivery.net/embed/${selectedVideo.bunny_library_id}/${selectedVideo.bunny_video_id}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
                                                                                                loading="lazy"
                                                                                                style={{
                                                                                                    border: 0,
                                                                                                    position: 'absolute',
                                                                                                    top: 0,
                                                                                                    left: 0,
                                                                                                    width: '100%',
                                                                                                    height: '100%',
                                                                                                    borderRadius: '8px'
                                                                                                }}
                                                                                                allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
                                                                                                allowFullScreen
                                                                                                title={`Resposta da pergunta ${question.order}`}
                                                                                            ></iframe>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}

                                                                            {/* Metadados */}
                                                                            <div className="text-xs text-gray-500 mt-2 flex items-center gap-4">
                                                                                <span>Status: {firstAnswer.processing_status}</span>
                                                                                <span>Tamanho: {Math.round(parseInt(firstAnswer.video_size_bytes || 0) / 1024)}KB</span>
                                                                                {firstAnswer.analysis?.timestamp && (
                                                                                    <span>Analisado: {new Date(firstAnswer.analysis.timestamp).toLocaleDateString('pt-BR')}</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Estado não respondida */}
                                                                    {!hasAnswers && (
                                                                        <div className="text-center py-4 text-gray-500">
                                                                            <div className="text-sm">Esta pergunta não foi respondida</div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="text-center py-4 text-gray-500">
                                                            <div className="text-sm">Nenhuma pergunta encontrada para esta entrevista</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    );

    // Modal de Currículo PDF
    const CurriculoModal = () => (
        modalCurriculo.isOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <div>
                            <h3 className="text-xl font-bold text-white">Currículo</h3>
                            <p className="text-gray-400">{modalCurriculo.nome}</p>
                        </div>
                        <button
                            onClick={() => setModalCurriculo({ isOpen: false, url: "", nome: "" })}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>
                    <div className="flex-1 p-6">
                        <div className="w-full h-full bg-white rounded-lg">
                            <iframe
                                src={modalCurriculo.url}
                                className="w-full h-full rounded-lg"
                                title={`Currículo de ${modalCurriculo.nome}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    );

    // Modal de Resultado DISC
    const DiscModal = () => (
        modalDisc.isOpen && modalDisc.resultado && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 rounded-2xl w-full max-w-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 bg-gradient-to-r ${discConfig[modalDisc.resultado.principal]?.color || 'from-purple-500 to-pink-600'} rounded-lg`}>
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Perfil DISC</h3>
                                <p className="text-gray-400">{modalDisc.nome}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setModalDisc({ isOpen: false, resultado: "", nome: "" })}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>

                    <div className="text-center">
                        <div className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-r ${discConfig[modalDisc.resultado.principal]?.color || 'from-purple-500 to-pink-600'} rounded-full flex items-center justify-center`}>
                            <span className="text-3xl font-bold text-white">
                                {modalDisc.resultado.principal}
                            </span>
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-2">
                            {discConfig[modalDisc.resultado.principal]?.name || modalDisc.resultado.principal}
                        </h4>
                        <p className="text-gray-400 mb-6">
                            {modalDisc.resultado.analise || "Análise não disponível"}
                        </p>

                        {/* Pontuações DISC */}
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                            {Object.entries(modalDisc.resultado.pontuacoes || {}).map(([letra, pontuacao]) => (
                                <div key={letra} className="bg-white/5 rounded-lg p-3">
                                    <div className="font-bold text-white">{letra}: {pontuacao.toFixed(1)}</div>
                                </div>
                            ))}
                        </div>

                        {/* Recomendações */}
                        <div className="bg-white/5 rounded-lg p-3 text-left">
                            <h5 className="font-bold text-white mb-2">Recomendações:</h5>
                            <p className="text-gray-300 text-sm">{modalDisc.resultado.recomendacoes}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    );


    // Estatísticas calculadas com memoization
    const stats = useMemo(() => ({
        total: candidaturas.length,
        aprovadas: candidaturas.filter(c => c.status === "aprovado").length,
        pendentes: candidaturas.filter(c => c.status === "em_analise" || c.status === "pendente").length,
        reprovadas: candidaturas.filter(c => c.status === "reprovado").length
    }), [candidaturas]);

    // Candidaturas filtradas com memoization para otimizar performance
    const candidaturasFiltradas = useMemo(() => {
        return candidaturas.filter(candidatura => {
            const matchesSearch = !searchTerm ||
                candidatura.vaga?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidatura.vaga?.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidatura.usuario?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterStatus === "todos" || candidatura.status === filterStatus;
            return matchesSearch && matchesFilter;
        });
    }, [candidaturas, searchTerm, filterStatus]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
            {/* Modais */}
            <CurriculoModal />
            <DiscModal />
            <InterviewHistoryModal />
            <CandidateDetailsModal
                isOpen={candidateDetailsModal.isOpen}
                candidatura={candidateDetailsModal.candidatura}
                onClose={() => setCandidateDetailsModal({ isOpen: false, candidatura: null })}
            />

            {/* Navbar */}
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Header com título e busca - Responsivo */}
                <div className="mt-20 sm:mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 mb-6">
                        {/* Título */}
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                Candidaturas por Vagas
                            </h1>
                            <p className="text-gray-400 text-sm">
                                Visualize entrevistas agrupadas por vaga e gerencie candidaturas
                            </p>
                        </div>

                        {/* Busca e Filtros - Responsivos */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto lg:min-w-80 xl:min-w-96">
                            <div className="relative flex-1 lg:min-w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar por vaga, empresa ou candidato..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base"
                                />
                            </div>
                            <div className="flex gap-3">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base flex-1 sm:flex-none sm:min-w-36"
                                >
                                    <option value="todos">Todos Status</option>
                                    <option value="aprovado">Aprovados</option>
                                    <option value="em_analise">Em Análise</option>
                                    <option value="pendente">Pendentes</option>
                                    <option value="reprovado">Reprovados</option>
                                </select>
                                <button
                                    onClick={fetchTodasCandidaturas}
                                    disabled={loading}
                                    className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base flex-shrink-0 ${loading
                                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                                        }`}
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <TrendingUp className="w-4 h-4" />
                                    )}
                                    <span className="hidden sm:inline">Atualizar</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Estatísticas - Responsivas */}
                    <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        {/* Total */}
                        <div className="rounded-xl p-3 sm:p-4 bg-white/5 border border-gray-800 text-center hover:border-gray-700 transition-colors">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="text-lg sm:text-xl font-bold text-white mb-1">{stats.total}</div>
                            <div className="text-xs sm:text-sm text-gray-400">Total</div>
                        </div>

                        {/* Aprovadas */}
                        <div className="rounded-xl p-3 sm:p-4 bg-white/5 border border-gray-800 text-center hover:border-gray-700 transition-colors">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 bg-green-600 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="text-lg sm:text-xl font-bold text-white mb-1">{stats.aprovadas}</div>
                            <div className="text-xs sm:text-sm text-gray-400">Aprovadas</div>
                        </div>

                        {/* Em Análise */}
                        <div className="rounded-xl p-3 sm:p-4 bg-white/5 border border-gray-800 text-center hover:border-gray-700 transition-colors">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 bg-orange-600 rounded-lg flex items-center justify-center">
                                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="text-lg sm:text-xl font-bold text-white mb-1">{stats.pendentes}</div>
                            <div className="text-xs sm:text-sm text-gray-400">Em Análise</div>
                        </div>

                        {/* Reprovadas */}
                        <div className="rounded-xl p-3 sm:p-4 bg-white/5 border border-gray-800 text-center hover:border-gray-700 transition-colors">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 bg-red-600 rounded-lg flex items-center justify-center">
                                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="text-lg sm:text-xl font-bold text-white mb-1">{stats.reprovadas}</div>
                            <div className="text-xs sm:text-sm text-gray-400">Reprovadas</div>
                        </div>
                    </div>
                </div>

                {/* Componente de Candidaturas Agrupadas por Vaga */}
                <CandidaturasPorVaga
                    candidaturasFiltradas={candidaturasFiltradas}
                    loading={loading}
                    error={error}
                    searchTerm={searchTerm}
                    filterStatus={filterStatus}
                    onRetry={fetchTodasCandidaturas}
                    onOpenInterviewModal={setModalInterview}
                    onViewCurriculo={handleViewCurriculoCandidato}
                    onViewDisc={setModalDisc}
                    onViewLinkedin={(url) => window.open(url, '_blank')}
                    onViewInterviewDetails={handleViewInterviewDetails}
                    onViewCandidateDetails={(candidatura) => setCandidateDetailsModal({ isOpen: true, candidatura })}
                />
            </div>
        </div>
    );
};

export default CandidaturasAdmPage;
