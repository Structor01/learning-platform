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
import interviewService from "../../services/interviewService";

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
    const getInterviewStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'from-green-500 to-green-600';
            case 'in_progress':
                return 'from-yellow-500 to-orange-500';
            case 'pending':
                return 'from-blue-500 to-blue-600';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

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

    const buscarEmpresa = (candidatura) => {
        // Função placeholder - pode ser implementada futuramente
        console.log('Ver empresa:', candidatura.vaga?.empresa);
        alert(`Empresa: ${candidatura.vaga?.empresa || 'Não informada'}`);
    };

    // 1. Função para buscar currículo de um candidato específico
    const handleViewCurriculoCandidato = async (usuarioId, nomeUsuario) => {
        console.log("🚀 INICIANDO handleViewCurriculoCandidato");
        console.log("📋 Parâmetros recebidos:", { usuarioId, nomeUsuario });

        try {
            // 1. VERIFICAR TOKEN
            const token = sessionStorage.getItem("accessToken") || accessToken;

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

            // OTIMIZAÇÃO: Usar endpoint com LEFT JOIN na coluna interview_id
            // Backend agora retorna candidaturas com entrevistas já incluídas via JOIN
            // Isso elimina a necessidade de múltiplas requisições por candidatura
            const response = await axios.get(`${API_URL}/api/candidaturas?include_interviews=true`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            let candidaturas = response.data || [];

            if (candidaturas.length > 0) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('🚀 Processando candidaturas com dados otimizados do LEFT JOIN...');
                }

                const usuarioIdsUnicos = [...new Set(candidaturas.map(c => c.usuario_id))];
                const usuariosData = {};

                // BUSCAR DADOS DISC EM PARALELO (entrevistas já vêm do LEFT JOIN)
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

                // MAPEAR DADOS OTIMIZADOS (entrevistas já incluídas via LEFT JOIN)
                candidaturas = candidaturas.map(candidatura => {
                    // Processar entrevistas que já vêm do backend via LEFT JOIN
                    // Podem vir em candidatura.entrevistas ou candidatura.interviews
                    const entrevistasRaw = candidatura.entrevistas || candidatura.interviews || [];
                    const entrevistas = Array.isArray(entrevistasRaw) ? entrevistasRaw : [];

                    // Ordenar entrevistas por data de criação (mais recente primeiro)
                    const entrevistasOrdenadas = entrevistas.sort((a, b) =>
                        new Date(b.created_at) - new Date(a.created_at)
                    );

                    // Log apenas se necessário para debug
                    if (process.env.NODE_ENV === 'development' && entrevistasOrdenadas.length > 0) {
                        console.log(`📋 Candidatura ${candidatura.id}: ${entrevistasOrdenadas.length} entrevistas via LEFT JOIN - IDs: ${entrevistasOrdenadas.map(e => `#${e.id}`).join(', ')}`);
                    }

                    return {
                        ...candidatura,
                        usuario: {
                            ...candidatura.usuario,
                            perfil_disc: usuariosData[candidatura.usuario_id]?.perfil_disc || null,
                            entrevistas: entrevistasOrdenadas
                        }
                    };
                });

                if (process.env.NODE_ENV === 'development') {
                    console.log(`✅ Processamento concluído: ${candidaturas.length} candidaturas com dados otimizados`);
                }
            }

            // Log de debug final das candidaturas processadas (apenas em desenvolvimento)
            if (process.env.NODE_ENV === 'development') {
                console.log('📊 Resumo final das candidaturas processadas:', candidaturas.map(c => ({
                    candidaturaId: c.id,
                    usuarioNome: c.usuario?.nome || c.usuario?.name,
                    totalEntrevistas: c.usuario?.entrevistas?.length || 0,
                    entrevistasIDs: c.usuario?.entrevistas?.map(e => `ID: ${e.id} (${e.status})`) || [],
                    temInterviewId: !!c.interview_id,
                    interviewId: c.interview_id
                })));
            }

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

    // Componente: Botão de Análise Compacto
    const CompactAnalysisButton = ({ type, data, usuario, size = "sm" }) => {
        const configs = {
            curriculo: {
                icon: FileText,
                color: "from-blue-500 to-blue-600",
                onClick: () => setModalCurriculo({
                    isOpen: true,
                    url: data,
                    nome: usuario?.nome || usuario?.name || 'Usuário'
                })
            },
            disc: {
                icon: Brain,
                color: "from-purple-500 to-purple-600",
                onClick: () => setModalDisc({
                    isOpen: true,
                    resultado: data,
                    nome: usuario?.nome || usuario?.name || 'Usuário'
                })
            },
            linkedin: {
                icon: Linkedin,
                color: "from-blue-600 to-blue-700",
                onClick: () => window.open(data, '_blank')
            }
        };

        const config = configs[type];
        const Icon = config.icon;
        const hasData = !!data;

        const sizeClasses = {
            sm: "w-8 h-8",
            md: "w-10 h-10"
        };

        return (
            <button
                onClick={hasData ? config.onClick : undefined}
                disabled={!hasData}
                className={`
                    ${sizeClasses[size]} rounded-lg flex items-center justify-center transition-all duration-200 
                    ${hasData
                        ? `bg-gradient-to-r ${config.color} hover:scale-110 hover:shadow-lg text-white cursor-pointer`
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }
                `}
                title={hasData ? `Ver ${type}` : `${type} não disponível`}
            >
                <Icon className={size === 'sm' ? "w-4 h-4" : "w-5 h-5"} />
            </button>
        );
    };

    // Funções de estilo e formatação
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "aprovado":
            case "aprovada":
                return "bg-green-100 text-green-800 border-green-200";
            case "reprovado":
            case "reprovada":
                return "bg-red-100 text-red-800 border-red-200";
            case "em_analise":
            case "pendente":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default:
                return "bg-blue-100 text-blue-800 border-blue-200";
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case "aprovado":
            case "aprovada":
                return <CheckCircle className="w-3 h-3" />;
            case "reprovado":
            case "reprovada":
                return <XCircle className="w-3 h-3" />;
            case "em_analise":
            case "pendente":
                return <Hourglass className="w-3 h-3" />;
            default:
                return <FileText className="w-3 h-3" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Data não disponível";
        try {
            return new Date(dateString).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        } catch (error) {
            return "Data inválida";
        }
    };

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

            {/* Navbar */}
            <Navbar />
            {/* Header */}
            <div className="mb-8 ">
                <h1 className="text-3xl  font-bold  text-white  mb-2 ">
                    CRM - Gestão de Leads
                </h1>
                <p className="text-gray-400 ">
                    Dados em tempo real da tabela users via API NestJS
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header com título e busca - VERSÃO HORIZONTAL */}
                <div className="mb-8">
                    <div className="flex items-center justify-between gap-6 mb-6">
                        {/* Título */}
                        <div className="min-w-0 flex-1">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Candidaturas dos Usuários
                            </h1>
                            <p className="text-gray-400 text-sm">
                                Analise currículos, perfis DISC, resumos de entrevistas e gerencie candidaturas
                            </p>
                        </div>

                        {/* Busca e Filtros */}
                        <div className="flex items-center gap-3 min-w-96">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar por vaga, empresa ou candidato..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors min-w-36"
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
                                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${loading
                                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                                    }`}
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <TrendingUp className="w-4 h-4" />
                                )}
                                Atualizar
                            </button>
                        </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        {/* Total */}
                        <div className="rounded-xl p-4 from-slate-900 via-gray-900 to-slate-800 border border-gray-800 text-center hover:border-gray-700 transition-colors">
                            <div className="w-10 h-10 mx-auto mb-3 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-xl font-bold text-white mb-1">{stats.total}</div>
                            <div className="text-sm text-gray-400">Total</div>
                        </div>

                        {/* Aprovadas */}
                        <div className="rounded-xl p-4 from-slate-900 via-gray-900 to-slate-800 border border-gray-800 text-center hover:border-gray-700 transition-colors">
                            <div className="w-10 h-10 mx-auto mb-3 bg-green-600 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-xl font-bold text-white mb-1">{stats.aprovadas}</div>
                            <div className="text-sm text-gray-400">Aprovadas</div>
                        </div>

                        {/* Em Análise */}
                        <div className="rounded-xl p-4 from-slate-900 via-gray-900 to-slate-800 border border-gray-800 text-center hover:border-gray-700 transition-colors">
                            <div className="w-10 h-10 mx-auto mb-3 bg-orange-600 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-xl font-bold text-white mb-1">{stats.pendentes}</div>
                            <div className="text-sm text-gray-400">Em Análise</div>
                        </div>

                        {/* Reprovadas */}
                        <div className="rounded-xl p-4 from-slate-900 via-gray-900 to-slate-800 border border-gray-800 text-center hover:border-gray-700 transition-colors">
                            <div className="w-10 h-10 mx-auto mb-3 bg-red-600 rounded-lg flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-xl font-bold text-white mb-1">{stats.reprovadas}</div>
                            <div className="text-sm text-gray-400">Reprovadas</div>
                        </div>
                    </div>
                </div>

                {/* Grid de Candidaturas - VERSÃO COMPACTA */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            <p className="text-white">Carregando candidaturas...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <AlertCircle className="w-6 h-6 text-red-400" />
                            <h3 className="text-lg font-semibold text-red-300">Erro ao Carregar Dados</h3>
                        </div>
                        <p className="text-red-200 mb-4">{error}</p>
                        <button
                            onClick={fetchTodasCandidaturas}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                        {candidaturasFiltradas.map((candidatura) => {
                            const hasInterview = candidatura.usuario?.entrevistas && candidatura.usuario.entrevistas.length > 0;
                            const lastInterview = hasInterview ? candidatura.usuario.entrevistas[0] : null;

                            return (
                                <div
                                    key={candidatura.id}
                                    className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 cursor-pointer"
                                    onClick={() => {
                                        if (hasInterview) {
                                            setModalInterview({
                                                isOpen: true,
                                                entrevistas: candidatura.usuario.entrevistas,
                                                nome: candidatura.usuario?.nome || candidatura.usuario?.name || 'Usuário',
                                                candidaturaId: candidatura.id
                                            });
                                        }
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

                                    <div className="relative z-10 text-center">
                                        {/* Ícone Principal */}
                                        <div className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center relative ${hasInterview
                                            ? `bg-gradient-to-r ${getInterviewStatusColor(lastInterview.status)}`
                                            : 'bg-gray-700'
                                            }`}>
                                            {hasInterview ? (
                                                <BarChart3 className="w-5 h-5 text-white" />
                                            ) : (
                                                <User className="w-5 h-5 text-gray-400" />
                                            )}

                                            {/* Badge do ID da Entrevista */}
                                            {hasInterview && (
                                                <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-[8px] rounded-full px-1 py-0.5 font-bold min-w-[14px] text-center leading-tight">
                                                    {lastInterview.id}
                                                </div>
                                            )}
                                        </div>

                                        {/* Nome do Candidato */}
                                        <h3 className="font-bold text-white text-xs mb-1 truncate">
                                            {candidatura.usuario?.nome || candidatura.usuario?.name || "Nome não informado"}
                                        </h3>

                                        {/* Subtitle - Empresa */}
                                        <p className="text-xs text-gray-400 mb-2 truncate">
                                            {candidatura.vaga?.empresa || "Empresa"}
                                        </p>

                                        {/* Status da Entrevista */}
                                        {hasInterview ? (
                                            <div className="bg-blue-500/20 border border-blue-500/30 rounded-md px-2 py-1 mb-2">
                                                <p className="text-xs text-blue-300 font-medium">
                                                    #{lastInterview.id}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {getInterviewStatusText(lastInterview.status)}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-700/50 border border-gray-600 rounded-md px-2 py-1 mb-2">
                                                <p className="text-xs text-gray-400">
                                                    Sem entrevista
                                                </p>
                                            </div>
                                        )}

                                        {/* Botões de Ação Compactos */}
                                        <div className="flex items-center justify-center gap-1 mb-2">
                                            {/* Currículo */}
                                            <div
                                                className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${candidatura.usuario?.curriculo_url
                                                    ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700'
                                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                    }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (candidatura.usuario?.curriculo_url) {
                                                        handleViewCurriculoCandidato(
                                                            candidatura.usuario_id,  // ID do usuário
                                                            candidatura.usuario?.nome || candidatura.usuario?.name || 'Usuário'
                                                        );
                                                    }
                                                }}
                                                title={candidatura.usuario?.curriculo_url ? "Ver currículo" : "Currículo não disponível"}
                                            >
                                                <FileText className="w-2.5 h-2.5" />
                                            </div>

                                            {/* DISC */}
                                            <div
                                                className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${candidatura.usuario?.perfil_disc
                                                    ? 'bg-purple-600 text-white cursor-pointer hover:bg-purple-700'
                                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                    }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (candidatura.usuario?.perfil_disc) {
                                                        setModalDisc({
                                                            isOpen: true,
                                                            resultado: candidatura.usuario.perfil_disc,
                                                            nome: candidatura.usuario?.nome || candidatura.usuario?.name || 'Usuário'
                                                        });
                                                    }
                                                }}
                                                title={candidatura.usuario?.perfil_disc ? "Ver perfil DISC" : "DISC não disponível"}
                                            >
                                                <Brain className="w-2.5 h-2.5" />
                                            </div>

                                            {/* LinkedIn */}
                                            <div
                                                className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${candidatura.usuario?.linkedin
                                                    ? 'bg-blue-700 text-white cursor-pointer hover:bg-blue-800'
                                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                    }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (candidatura.usuario?.linkedin) {
                                                        window.open(candidatura.usuario.linkedin, '_blank');
                                                    }
                                                }}
                                                title={candidatura.usuario?.linkedin ? "Ver LinkedIn" : "LinkedIn não disponível"}
                                            >
                                                <Linkedin className="w-2.5 h-2.5" />
                                            </div>

                                            {/* Empresa */}
                                            <div
                                                className="w-5 h-5 rounded-md flex items-center justify-center text-xs bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    buscarEmpresa(candidatura);
                                                }}
                                                title="Ver empresa"
                                            >
                                                <Building2 className="w-2.5 h-2.5" />
                                            </div>
                                        </div>

                                        {/* Footer Minimalista */}
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>#{candidatura.id}</span>
                                            <div className={`w-3 h-3 rounded-full flex items-center justify-center ${getStatusColor(candidatura.status).replace('bg-', 'bg-').replace('text-', 'text-').replace('border-', '')}`}>
                                                {getStatusIcon(candidatura.status)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Estado vazio */}
                        {candidaturasFiltradas.length === 0 && (
                            <div className="col-span-full text-center py-12">
                                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-medium text-white mb-2">Nenhuma candidatura encontrada</h3>
                                <p className="text-gray-400">
                                    {searchTerm || filterStatus !== "todos"
                                        ? "Tente ajustar os filtros de busca"
                                        : "Ainda não há candidaturas para exibir"
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CandidaturasAdmPage;
