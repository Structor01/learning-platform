import React, { useState, useEffect } from "react";
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
    Clock4
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

    // Função para buscar candidaturas
    const fetchTodasCandidaturas = async () => {
        try {
            setLoading(true);
            setError("");

            console.log("🔍 Buscando candidaturas...");

            const response = await axios.get(`${API_URL}/api/candidaturas`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            let candidaturas = response.data || [];

            if (candidaturas.length > 0) {
                console.log("🔄 Buscando dados DISC e entrevistas dos usuários...");

                const usuarioIdsUnicos = [...new Set(candidaturas.map(c => c.usuario_id))];
                const usuariosData = {};

                for (const usuarioId of usuarioIdsUnicos) {
                    console.log(`🔍 Processando usuário ${usuarioId}...`);

                    usuariosData[usuarioId] = {
                        entrevistas: [],
                        perfil_disc: null
                    };

                    // BUSCAR DADOS DISC
                    try {
                        const discData = await testService.getUserPsychologicalTests(usuarioId, 'completed', 1);

                        if (discData.tests && discData.tests.length > 0) {
                            const teste = discData.tests[0];
                            usuariosData[usuarioId].perfil_disc = {
                                principal: getPrincipalDisc(teste.disc_scores),
                                pontuacoes: teste.disc_scores,
                                analise: teste.overall_analysis,
                                recomendacoes: teste.recommendations
                            };
                            console.log(`✅ DISC adicionado para usuário ${usuarioId}`);
                        } else {
                            console.log(`❌ SEM DADOS DISC para usuário ${usuarioId}`);
                        }
                    } catch (discError) {
                        console.log(`💥 ERRO DISC para usuário ${usuarioId}:`, discError);
                    }
                }

                // MAPEAR DADOS PARA AS CANDIDATURAS
                candidaturas = candidaturas.map(candidatura => ({
                    ...candidatura,
                    usuario: {
                        ...candidatura.usuario,
                        perfil_disc: usuariosData[candidatura.usuario_id]?.perfil_disc || null,
                        entrevistas: []
                    }
                }));

                // BUSCAR ENTREVISTAS POR CANDIDATURA_ID - TODAS, INDEPENDENTE DO STATUS
                console.log("🎬 Buscando TODAS as entrevistas por candidatura...");
                for (const candidatura of candidaturas) {
                    try {
                        console.log(`🔍 Buscando entrevistas para candidatura ${candidatura.id}...`);

                        const interviewData = await interviewService.getCandidaturaInterviews(candidatura.id);
                        console.log(`🎬 RESPOSTA API para candidatura ${candidatura.id}:`, interviewData);

                        // Verificar se há entrevistas (qualquer status)
                        if (interviewData && interviewData.success && interviewData.interviews && Array.isArray(interviewData.interviews) && interviewData.interviews.length > 0) {
                            // Ordenar por data de criação (mais recente primeiro)
                            const entrevistasOrdenadas = interviewData.interviews.sort((a, b) =>
                                new Date(b.created_at) - new Date(a.created_at)
                            );

                            candidatura.usuario.entrevistas = entrevistasOrdenadas;
                            console.log(`✅ ${entrevistasOrdenadas.length} entrevista(s) encontrada(s) para candidatura ${candidatura.id}:`,
                                entrevistasOrdenadas.map(e => `ID ${e.id} - Status: ${e.status}`));

                            // LOG DETALHADO DAS ENTREVISTAS ENCONTRADAS
                            entrevistasOrdenadas.forEach(entrevista => {
                                console.log(`📋 Entrevista ID: ${entrevista.id}, Status: ${entrevista.status}, Candidatura: ${candidatura.id}`);
                            });
                        } else {
                            console.log(`❌ SEM ENTREVISTAS para candidatura ${candidatura.id} - resposta:`, interviewData);
                            candidatura.usuario.entrevistas = []; // Garantir array vazio
                        }
                    } catch (interviewError) {
                        console.error(`💥 ERRO ENTREVISTAS para candidatura ${candidatura.id}:`, interviewError);
                        candidatura.usuario.entrevistas = []; // Garantir array vazio em caso de erro
                    }
                }
            }

            console.log("🎉 Dados finais processados:", candidaturas);
            console.log("📊 Resumo de entrevistas por candidatura:",
                candidaturas.map(c => ({
                    candidaturaId: c.id,
                    usuarioNome: c.usuario?.nome || c.usuario?.name,
                    totalEntrevistas: c.usuario?.entrevistas?.length || 0,
                    entrevistasIDs: c.usuario?.entrevistas?.map(e => `ID: ${e.id} (${e.status})`) || []
                }))
            );
            setCandidaturas(candidaturas);

        } catch (err) {
            console.error("💥 ERRO:", err);
            setError(`Erro: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const buscarEmpresa = async (candidatura) => {
        try {
            const vagaResponse = await axios.get(`${API_URL}/api/vagas/${candidatura.vaga_id}`);
            const empresaId = vagaResponse.data.company_id;
            if (empresaId) {
                window.open(`/empresa/${empresaId}`, '_blank');
            } else {
                alert("Empresa não encontrada.");
            }
        } catch (error) {
            console.error("Erro ao buscar empresa:", error);
            alert("Erro ao buscar empresa.");
        }
    };

    // COMPONENTE INTERVIEW CARD - MOSTRA ID SEMPRE (QUALQUER STATUS)
    const InterviewCard = ({ entrevistas, usuario, candidaturaId }) => {
        // Debug para verificar dados
        console.log(`🎬 InterviewCard - Candidatura ${candidaturaId}:`, entrevistas);

        if (!entrevistas || entrevistas.length === 0) {
            return (
                <div className="relative w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center" title="Nenhuma entrevista encontrada">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] rounded-full w-3 h-3 flex items-center justify-center">
                        0
                    </div>
                </div>
            );
        }

        const ultimaEntrevista = entrevistas[0]; // Mais recente
        const statusColor = getInterviewStatusColor(ultimaEntrevista.status);

        return (
            <button
                onClick={() => {
                    console.log('🖱️ Clique no botão de entrevista:', { entrevistas, usuario, candidaturaId });
                    setModalInterview({
                        isOpen: true,
                        entrevistas: entrevistas,
                        nome: usuario?.nome || usuario?.name || 'Usuário',
                        candidaturaId: candidaturaId
                    });
                }}
                className={`
                relative w-8 h-8 bg-gradient-to-r ${statusColor} 
                rounded-lg flex items-center justify-center 
                cursor-pointer hover:scale-110 transition-all duration-200
                shadow-lg hover:shadow-xl group
            `}
                title={`Entrevista ID #${ultimaEntrevista.id} - ${getInterviewStatusText(ultimaEntrevista.status)} (${entrevistas.length} total)`}
            >
                <BarChart3 className="w-4 h-4 text-white" />

                {/* ID SEMPRE VISÍVEL - não só no hover */}
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[9px] rounded-full px-1 py-0.5 font-bold min-w-[16px] text-center leading-tight">
                    {ultimaEntrevista.id}
                </div>

                {/* Badge com quantidade se houver múltiplas */}
                {entrevistas.length > 1 && (
                    <div className="absolute -bottom-1 -left-1 bg-purple-500 text-white text-[8px] rounded-full w-3 h-3 flex items-center justify-center font-bold">
                        {entrevistas.length}
                    </div>
                )}
            </button>
        );
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
                                {/* Tabela de IDs no topo - Similar ao AdminPage */}
                                <div className="bg-white/5 rounded-lg p-4">
                                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-500" />
                                        IDs das Entrevistas
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {modalInterview.entrevistas.map((entrevista, index) => (
                                            <div
                                                key={entrevista.id}
                                                className={`
                                                px-3 py-1.5 rounded-lg text-sm font-medium border
                                                ${entrevista.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                                        entrevista.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                                            'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                    }
                                            `}
                                            >
                                                ID #{entrevista.id}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Resumo */}
                                <div className="bg-white/5 rounded-lg p-4">
                                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-blue-500" />
                                        Resumo Estatístico
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-white">
                                                {modalInterview.entrevistas.length}
                                            </div>
                                            <div className="text-sm text-gray-400">Total</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-400">
                                                {modalInterview.entrevistas.filter(e => e.status === 'completed').length}
                                            </div>
                                            <div className="text-sm text-gray-400">Concluídas</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-yellow-400">
                                                {modalInterview.entrevistas.filter(e => e.status === 'in_progress').length}
                                            </div>
                                            <div className="text-sm text-gray-400">Em Progresso</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-400">
                                                {modalInterview.entrevistas.filter(e => e.overall_score).length > 0
                                                    ? (modalInterview.entrevistas
                                                        .filter(e => e.overall_score)
                                                        .reduce((acc, e) => acc + parseFloat(e.overall_score || 0), 0)
                                                        / modalInterview.entrevistas.filter(e => e.overall_score).length
                                                    ).toFixed(1)
                                                    : '0.0'
                                                }
                                            </div>
                                            <div className="text-sm text-gray-400">Média</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Lista de Entrevistas Detalhada */}
                                <div>
                                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <Clock4 className="w-5 h-5 text-purple-500" />
                                        Detalhes por Entrevista
                                    </h4>
                                    <div className="space-y-4">
                                        {modalInterview.entrevistas.map((entrevista, index) => (
                                            <div key={entrevista.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors border border-white/10">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        {/* Badge do ID - DESTAQUE PRINCIPAL */}
                                                        <div className="flex items-center justify-center w-16 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-bold">
                                                            <div className="text-center">
                                                                <div className="text-xs text-blue-200">ID</div>
                                                                <div className="text-lg font-black">#{entrevista.id}</div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h5 className="font-medium text-white">
                                                                Entrevista #{entrevista.id}
                                                            </h5>
                                                            <p className="text-sm text-gray-400">
                                                                {new Date(entrevista.created_at).toLocaleDateString('pt-BR', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                            <p className="text-xs text-blue-400">
                                                                Candidatura #{modalInterview.candidaturaId}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${entrevista.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                        entrevista.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-blue-500/20 text-blue-400'
                                                        }`}>
                                                        {getInterviewStatusText(entrevista.status)}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                                    <div>
                                                        <div className="text-sm text-gray-400">Progresso</div>
                                                        <div className="text-white font-medium">
                                                            {entrevista.answered_questions || 0}/{entrevista.total_questions || 5}
                                                        </div>
                                                        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                                                            <div
                                                                className="bg-blue-500 h-1.5 rounded-full transition-all"
                                                                style={{
                                                                    width: `${((entrevista.answered_questions || 0) / (entrevista.total_questions || 5)) * 100}%`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-400">Pontuação</div>
                                                        <div className="text-white font-medium">
                                                            {entrevista.overall_score ? `${parseFloat(entrevista.overall_score).toFixed(1)}/10` : 'N/A'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-400">Duração</div>
                                                        <div className="text-white font-medium">
                                                            {entrevista.completed_at && entrevista.created_at ?
                                                                `${Math.round((new Date(entrevista.completed_at) - new Date(entrevista.created_at)) / (1000 * 60))} min`
                                                                : 'Em andamento'
                                                            }
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-400">Conclusão</div>
                                                        <div className="text-white font-medium">
                                                            {entrevista.completed_at ?
                                                                new Date(entrevista.completed_at).toLocaleDateString('pt-BR')
                                                                : '-'
                                                            }
                                                        </div>
                                                    </div>
                                                </div>

                                                {entrevista.status === 'completed' && entrevista.overall_score && (
                                                    <div className="border-t border-white/10 pt-3">
                                                        <div className="text-sm text-gray-400 mb-2">Análise Comportamental</div>
                                                        <div className="text-sm text-gray-300">
                                                            {entrevista.overall_score >= 8 ?
                                                                "Excelente performance demonstrada durante a entrevista. Candidato apresentou boa comunicação e confiança." :
                                                                entrevista.overall_score >= 6 ?
                                                                    "Performance satisfatória na entrevista. Demonstrou adequação para a vaga com pontos de melhoria." :
                                                                    "Performance abaixo do esperado. Recomenda-se nova avaliação ou desenvolvimento adicional."
                                                            }
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
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

    // Estatísticas calculadas
    const stats = {
        total: candidaturas.length,
        aprovadas: candidaturas.filter(c => c.status === "aprovado").length,
        pendentes: candidaturas.filter(c => c.status === "em_analise" || c.status === "pendente").length,
        reprovadas: candidaturas.filter(c => c.status === "reprovado").length
    };

    // Candidaturas filtradas com DEBUG de entrevistas
    const candidaturasFiltradas = candidaturas.filter(candidatura => {
        // Debug para verificar estrutura das entrevistas
        if (candidatura.usuario?.entrevistas) {
            console.log(`🔍 DEBUG Candidatura ${candidatura.id}:`, {
                usuarioNome: candidatura.usuario?.nome || candidatura.usuario?.name,
                entrevistas: candidatura.usuario.entrevistas,
                totalEntrevistas: candidatura.usuario.entrevistas.length
            });
        }

        const matchesSearch = candidatura.vaga?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidatura.vaga?.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidatura.usuario?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "todos" || candidatura.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

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
                                                        setModalCurriculo({
                                                            isOpen: true,
                                                            url: candidatura.usuario.curriculo_url,
                                                            nome: candidatura.usuario?.nome || candidatura.usuario?.name || 'Usuário'
                                                        });
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