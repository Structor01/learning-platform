import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Briefcase,
  MapPin,
  Clock,
  Building2,
  CheckCircle,
  XCircle,
  Hourglass,
  FileText,
  Search,
  TrendingUp,
  BarChart3,
  Brain,
  User,
  X,
  AlertCircle,
  Linkedin,
  Video,
  Clock4,
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
  C: { name: "Conformidade", color: "from-blue-500 to-blue-600" },
};

const CandidaturasAdmPage = () => {
  const [candidaturas, setCandidaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const { accessToken, isAuthenticated, isLoading } = useAuth();
  const [modalCurriculo, setModalCurriculo] = useState({ isOpen: false, url: "", nome: "" });
  const [modalDisc, setModalDisc] = useState({ isOpen: false, resultado: null, nome: "" });
  const [modalInterview, setModalInterview] = useState({ isOpen: false, entrevistas: [], nome: "", candidaturaId: null });

  // Cache para evitar requisições duplicadas
  const [discCache, setDiscCache] = useState(new Map());
  const [interviewCache, setInterviewCache] = useState(new Map());

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchTodasCandidaturas();
    }
    // eslint-disable-next-line
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

  const getInterviewStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "from-green-500 to-green-600";
      case "in_progress":
        return "from-yellow-500 to-orange-500";
      case "pending":
        return "from-blue-500 to-blue-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getInterviewStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Concluída";
      case "in_progress":
        return "Em Progresso";
      case "pending":
        return "Pendente";
      default:
        return "Desconhecido";
    }
  };

  // Buscar dados DISC em paralelo
  const fetchDiscDataBatch = async (usuarioIds) => {
    const idsToFetch = usuarioIds.filter((id) => !discCache.has(id));
    if (idsToFetch.length === 0) return;
    const discPromises = idsToFetch.map(async (usuarioId) => {
      try {
        const discData = await testService.getUserPsychologicalTests(usuarioId, "completed", 1);
        let perfilDisc = null;
        if (discData.tests && discData.tests.length > 0) {
          const teste = discData.tests[0];
          perfilDisc = {
            principal: getPrincipalDisc(teste.disc_scores),
            pontuacoes: teste.disc_scores,
            analise: teste.overall_analysis,
            recomendacoes: teste.recommendations,
          };
        }
        return { usuarioId, perfilDisc };
      } catch {
        return { usuarioId, perfilDisc: null };
      }
    });
    const results = await Promise.allSettled(discPromises);
    const newDiscCache = new Map(discCache);
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const { usuarioId, perfilDisc } = result.value;
        newDiscCache.set(usuarioId, perfilDisc);
      }
    });
    setDiscCache(newDiscCache);
  };

  // Buscar entrevistas em paralelo
  const fetchInterviewsBatch = async (candidaturaIds) => {
    const idsToFetch = candidaturaIds.filter((id) => !interviewCache.has(id));
    if (idsToFetch.length === 0) return;
    const interviewPromises = idsToFetch.map(async (candidaturaId) => {
      try {
        const interviewData = await interviewService.getCandidaturaInterviews(candidaturaId);
        let entrevistas = [];
        if (
          interviewData &&
          interviewData.success &&
          interviewData.interviews &&
          Array.isArray(interviewData.interviews)
        ) {
          entrevistas = interviewData.interviews.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
        }
        return { candidaturaId, entrevistas };
      } catch {
        return { candidaturaId, entrevistas: [] };
      }
    });
    const results = await Promise.allSettled(interviewPromises);
    const newInterviewCache = new Map(interviewCache);
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const { candidaturaId, entrevistas } = result.value;
        newInterviewCache.set(candidaturaId, entrevistas);
      }
    });
    setInterviewCache(newInterviewCache);
  };

  const handleViewCurriculoCandidato = async (usuarioId, nomeUsuario) => {
    try {
      const token = sessionStorage.getItem("accessToken") || accessToken;
      if (!token) {
        alert("Sessão expirada. Faça login novamente.");
        return;
      }
      const url = `${API_URL}/api/users/${usuarioId}/curriculo`;
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 404) alert("Currículo não encontrado para este candidato.");
        else if (response.status === 401) alert("Sessão expirada. Faça login novamente.");
        else alert(`Erro ${response.status}: ${errorText}`);
        return;
      }
      const blob = await response.blob();
      if (blob.size === 0) {
        alert("Arquivo de currículo está vazio.");
        return;
      }
      const blobUrl = window.URL.createObjectURL(blob);
      setModalCurriculo({ isOpen: true, url: blobUrl, nome: nomeUsuario || "Usuário" });
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 60000);
    } catch (error) {
      alert(`Erro ao carregar currículo: ${error.message}`);
    }
  };

  // Busca principal
  const fetchTodasCandidaturas = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API_URL}/api/candidaturas`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      let candidaturas = response.data || [];
      if (candidaturas.length > 0) {
        const usuarioIdsUnicos = [...new Set(candidaturas.map((c) => c.usuario_id))];
        const candidaturaIds = candidaturas.map((c) => c.id);
        await Promise.all([
          fetchDiscDataBatch(usuarioIdsUnicos),
          fetchInterviewsBatch(candidaturaIds),
        ]);
        candidaturas = candidaturas.map((candidatura) => ({
          ...candidatura,
          usuario: {
            ...candidatura.usuario,
            perfil_disc: discCache.get(candidatura.usuario_id) || null,
            entrevistas: interviewCache.get(candidatura.id) || [],
          },
        }));
      }
      setCandidaturas(candidaturas);
    } catch (err) {
      setError(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filtros e estatísticas
  const stats = useMemo(
    () => ({
      total: candidaturas.length,
      aprovadas: candidaturas.filter((c) => c.status === "aprovado").length,
      pendentes: candidaturas.filter((c) => ["em_analise", "pendente"].includes(c.status)).length,
      reprovadas: candidaturas.filter((c) => c.status === "reprovado").length,
    }),
    [candidaturas]
  );

  const candidaturasFiltradas = useMemo(() => {
    return candidaturas.filter((candidatura) => {
      const matchesSearch =
        candidatura.vaga?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidatura.vaga?.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidatura.usuario?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "todos" || candidatura.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [candidaturas, searchTerm, filterStatus]);

  // Modal Currículo
  const CurriculoModal = () =>
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
    );

  // Modal DISC
  const DiscModal = () =>
    modalDisc.isOpen && modalDisc.resultado && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-2xl w-full max-w-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-gradient-to-r ${discConfig[modalDisc.resultado.principal]?.color || "from-purple-500 to-pink-600"} rounded-lg`}>
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Perfil DISC</h3>
                <p className="text-gray-400">{modalDisc.nome}</p>
              </div>
            </div>
            <button
              onClick={() => setModalDisc({ isOpen: false, resultado: null, nome: "" })}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
          <div className="text-center">
            <div className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-r ${discConfig[modalDisc.resultado.principal]?.color || "from-purple-500 to-pink-600"} rounded-full flex items-center justify-center`}>
              <span className="text-3xl font-bold text-white">{modalDisc.resultado.principal}</span>
            </div>
            <h4 className="text-2xl font-bold text-white mb-2">{discConfig[modalDisc.resultado.principal]?.name || modalDisc.resultado.principal}</h4>
            <p className="text-gray-400 mb-6">{modalDisc.resultado.analise || "Análise não disponível"}</p>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              {Object.entries(modalDisc.resultado.pontuacoes || {}).map(([letra, pontuacao]) => (
                <div key={letra} className="bg-white/5 rounded-lg p-3">
                  <div className="font-bold text-white">{letra}: {pontuacao.toFixed(1)}</div>
                </div>
              ))}
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-left">
              <h5 className="font-bold text-white mb-2">Recomendações:</h5>
              <p className="text-gray-300 text-sm">{modalDisc.resultado.recomendacoes}</p>
            </div>
          </div>
        </div>
      </div>
    );

  // Modal Entrevista
  const InterviewHistoryModal = () =>
    modalInterview.isOpen && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
          <div className="p-6">
            {modalInterview.entrevistas.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-white mb-2">Nenhuma entrevista realizada</h4>
                <p className="text-gray-400">Esta candidatura ainda não possui entrevistas associadas.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock4 className="w-5 h-5 text-purple-500" />
                    Detalhes por Entrevista
                  </h4>
                  <div className="space-y-4">
                    {modalInterview.entrevistas.map((entrevista) => (
                      <div key={entrevista.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors border border-white/10">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-16 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-bold">
                              <div className="text-center">
                                <div className="text-xs text-blue-200">ID</div>
                                <div className="text-lg font-black">#{entrevista.id}</div>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-white">Entrevista #{entrevista.id}</h5>
                              <p className="text-sm text-gray-400">
                                {new Date(entrevista.created_at).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              <p className="text-xs text-blue-400">Candidatura #{modalInterview.candidaturaId}</p>
                            </div>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              entrevista.status === "completed"
                                ? "bg-green-500/20 text-green-400"
                                : entrevista.status === "in_progress"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
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
                                  width: `${((entrevista.answered_questions || 0) / (entrevista.total_questions || 5)) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Pontuação</div>
                            <div className="text-white font-medium">
                              {entrevista.overall_score ? `${parseFloat(entrevista.overall_score).toFixed(1)}/10` : "N/A"}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Duração</div>
                            <div className="text-white font-medium">
                              {entrevista.completed_at && entrevista.created_at
                                ? `${Math.round((new Date(entrevista.completed_at) - new Date(entrevista.created_at)) / (1000 * 60))} min`
                                : "Em andamento"}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Conclusão</div>
                            <div className="text-white font-medium">
                              {entrevista.completed_at
                                ? new Date(entrevista.completed_at).toLocaleDateString("pt-BR")
                                : "-"}
                            </div>
                          </div>
                        </div>
                        {entrevista.status === "completed" && entrevista.overall_score && (
                          <div className="border-t border-white/10 pt-3">
                            <div className="text-sm text-gray-400 mb-2">Análise Comportamental</div>
                            <div className="text-sm text-gray-300">
                              {entrevista.overall_score >= 8
                                ? "Excelente performance demonstrada durante a entrevista. Candidato apresentou boa comunicação e confiança."
                                : entrevista.overall_score >= 6
                                ? "Performance satisfatória na entrevista. Demonstrou adequação para a vaga com pontos de melhoria."
                                : "Performance abaixo do esperado. Recomenda-se nova avaliação ou desenvolvimento adicional."}
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
    );

  // Busca empresa (placeholder)
  const buscarEmpresa = (candidatura) => {
    // Implementar lógica de busca de empresa
  };

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <CurriculoModal />
      <DiscModal />
      <InterviewHistoryModal />
      <Navbar />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">CRM - Gestão de Leads</h1>
        <p className="text-gray-400">Dados em tempo real da tabela users via API NestJS</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-6 mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">Candidaturas dos Usuários</h1>
            <p className="text-gray-400 text-sm">
              Analise currículos, perfis DISC, resumos de entrevistas e gerencie candidaturas
            </p>
          </div>
        </div>
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 mb-6">
            <div className="relative flex-1 lg:max-w-md xl:max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por vaga, empresa ou candidato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base"
              />
            </div>
            <div className="flex gap-2 sm:gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base min-w-0 sm:min-w-36"
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
                className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 text-sm sm:text-base whitespace-nowrap ${
                  loading
                    ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg"
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
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl p-4 from-slate-900 via-gray-900 to-slate-800 border border-gray-800 text-center hover:border-gray-700 transition-colors">
              <div className="w-10 h-10 mx-auto mb-3 bg-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div className="text-xl font-bold text-white mb-1">{stats.total}</div>
              <div className="text-sm text-gray-400">Total</div>
            </div>
            <div className="rounded-xl p-4 from-slate-900 via-gray-900 to-slate-800 border border-gray-800 text-center hover:border-gray-700 transition-colors">
              <div className="w-10 h-10 mx-auto mb-3 bg-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-xl font-bold text-white mb-1">{stats.aprovadas}</div>
              <div className="text-sm text-gray-400">Aprovadas</div>
            </div>
            <div className="rounded-xl p-4 from-slate-900 via-gray-900 to-slate-800 border border-gray-800 text-center hover:border-gray-700 transition-colors">
              <div className="w-10 h-10 mx-auto mb-3 bg-orange-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="text-xl font-bold text-white mb-1">{stats.pendentes}</div>
              <div className="text-sm text-gray-400">Em Análise</div>
            </div>
            <div className="rounded-xl p-4 from-slate-900 via-gray-900 to-slate-800 border border-gray-800 text-center hover:border-gray-700 transition-colors">
              <div className="w-10 h-10 mx-auto mb-3 bg-red-600 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-xl font-bold text-white mb-1">{stats.reprovadas}</div>
              <div className="text-sm text-gray-400">Reprovadas</div>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-red-300">Erro ao Carregar Dados</h3>
            </div>
            <p className="text-red-200 mb-4 text-sm sm:text-base">{error}</p>
            <button
              onClick={fetchTodasCandidaturas}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Tentar Novamente
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {candidaturasFiltradas.length === 0 ? (
              <div className="col-span-full text-center py-8 sm:py-12 lg:py-16">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-white mb-2">Nenhuma candidatura encontrada</h3>
                <p className="text-gray-400 text-sm sm:text-base px-4">
                  {searchTerm || filterStatus !== "todos"
                    ? "Tente ajustar os filtros de busca"
                    : "Ainda não há candidaturas para exibir"}
                </p>
              </div>
            ) : (
              candidaturasFiltradas.map((candidatura) => {
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
                          nome: candidatura.usuario?.nome || candidatura.usuario?.name || "Usuário",
                          candidaturaId: candidatura.id,
                        });
                      }
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                    <div className="relative z-10 text-center">
                      <div className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center relative ${hasInterview ? `bg-gradient-to-r ${getInterviewStatusColor(lastInterview.status)}` : "bg-gray-700"}`}>
                        {hasInterview ? <BarChart3 className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-gray-400" />}
                        {hasInterview && (
                          <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-[8px] rounded-full px-1 py-0.5 font-bold min-w-[14px] text-center leading-tight">
                            {lastInterview.id}
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-white text-xs mb-1 truncate">{candidatura.usuario?.nome || candidatura.usuario?.name || "Nome não informado"}</h3>
                      <p className="text-xs text-gray-400 mb-2 truncate">{candidatura.vaga?.empresa || "Empresa"}</p>
                      {hasInterview ? (
                        <div className="bg-blue-500/20 border border-blue-500/30 rounded-md px-2 py-1 mb-2">
                          <p className="text-xs text-blue-300 font-medium">#{lastInterview.id}</p>
                          <p className="text-xs text-gray-400">{getInterviewStatusText(lastInterview.status)}</p>
                        </div>
                      ) : (
                        <div className="bg-gray-700/50 border border-gray-600 rounded-md px-2 py-1 mb-2">
                          <p className="text-xs text-gray-400">Sem entrevista</p>
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${candidatura.usuario?.curriculo_url ? "bg-blue-600 text-white cursor-pointer hover:bg-blue-700" : "bg-gray-700 text-gray-500 cursor-not-allowed"}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (candidatura.usuario?.curriculo_url) {
                              handleViewCurriculoCandidato(candidatura.usuario_id, candidatura.usuario?.nome || candidatura.usuario?.name || "Usuário");
                            }
                          }}
                          title={candidatura.usuario?.curriculo_url ? "Ver currículo" : "Currículo não disponível"}
                        >
                          <FileText className="w-2.5 h-2.5" />
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${candidatura.usuario?.perfil_disc ? "bg-purple-600 text-white cursor-pointer hover:bg-purple-700" : "bg-gray-700 text-gray-500 cursor-not-allowed"}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (candidatura.usuario?.perfil_disc) {
                              setModalDisc({
                                isOpen: true,
                                resultado: candidatura.usuario.perfil_disc,
                                nome: candidatura.usuario?.nome || candidatura.usuario?.name || "Usuário",
                              });
                            }
                          }}
                          title={candidatura.usuario?.perfil_disc ? "Ver perfil DISC" : "DISC não disponível"}
                        >
                          <Brain className="w-2.5 h-2.5" />
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${candidatura.usuario?.linkedin ? "bg-blue-700 text-white cursor-pointer hover:bg-blue-800" : "bg-gray-700 text-gray-500 cursor-not-allowed"}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (candidatura.usuario?.linkedin) {
                              window.open(candidatura.usuario.linkedin, "_blank");
                            }
                          }}
                          title={candidatura.usuario?.linkedin ? "Ver LinkedIn" : "LinkedIn não disponível"}
                        >
                          <Linkedin className="w-2.5 h-2.5" />
                        </div>
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
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>#{candidatura.id}</span>
                        <div className="w-3 h-3 rounded-full flex items-center justify-center">
                          {candidatura.status === "aprovado" ? <CheckCircle className="w-3 h-3 text-green-600" /> : candidatura.status === "reprovado" ? <XCircle className="w-3 h-3 text-red-600" /> : candidatura.status === "em_analise" || candidatura.status === "pendente" ? <Hourglass className="w-3 h-3 text-yellow-600" /> : <FileText className="w-3 h-3 text-blue-600" />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidaturasAdmPage;