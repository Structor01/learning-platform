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
    Mail
} from "lucide-react";
import { API_URL } from "../utils/api";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "./Navbar";

const CandidaturasAdmPage = () => {
    const [candidaturas, setCandidaturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("todos");
    const { accessToken, isAuthenticated, isLoading } = useAuth();
    const [modalCurriculo, setModalCurriculo] = useState({ isOpen: false, url: "", nome: "" });
    const [modalDisc, setModalDisc] = useState({ isOpen: false, resultado: "", nome: "" });

    // Carregar dados da API
    useEffect(() => {
        console.log("Auth State:", { isLoading, isAuthenticated });
        if (!isLoading && isAuthenticated) {
            fetchTodasCandidaturas();
        }
    }, [isAuthenticated, isLoading]);

    // Função para buscar candidaturas
    const fetchTodasCandidaturas = async () => {
        try {
            setLoading(true);
            setError("");

            console.log("🔍 Buscando candidaturas...");

            const response = await axios.get(`${API_URL}/api/candidaturas`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            console.log("✅ Candidaturas recebidas:", response.data);

            let candidaturas = response.data || [];

            if (candidaturas.length > 0 && (!candidaturas[0].usuario || candidaturas[0].usuario.nome === "Usuário")) {
                console.log("🔄 Buscando dados dos usuários...");

                const usuarioIdsUnicos = [...new Set(candidaturas.map(c => c.usuario_id))];
                const usuariosData = {};

                for (const usuarioId of usuarioIdsUnicos) {
                    try {
                        const userResponse = await axios.get(`${API_URL}/api/usuarios/${usuarioId}`, {
                            headers: { Authorization: `Bearer ${accessToken}` }
                        });
                        usuariosData[usuarioId] = userResponse.data;
                        console.log(`✅ Usuário ${usuarioId} encontrado`);
                    } catch (userError) {
                        console.warn(`⚠️ Usuário ${usuarioId} não encontrado:`, userError.response?.status);
                        usuariosData[usuarioId] = {
                            id: usuarioId,
                            nome: "Usuário não encontrado",
                            name: "Usuário não encontrado",
                            email: "N/A"
                        };
                    }
                }

                candidaturas = candidaturas.map(candidatura => ({
                    ...candidatura,
                    usuario: usuariosData[candidatura.usuario_id] || candidatura.usuario
                }));
            }

            console.log("🎉 Dados finais processados:", candidaturas);
            setCandidaturas(candidaturas);

        } catch (err) {
            console.error("💥 ERRO:", err);
            if (err.response) {
                console.error("Status:", err.response.status);
                console.error("Data:", err.response.data);
                console.error("URL que falhou:", err.config?.url);

                if (err.response.status === 404) {
                    setError("Rota não encontrada. Verifique se a API está configurada corretamente.");
                } else if (err.response.status === 401) {
                    setError("Não autorizado. Faça login novamente.");
                } else if (err.response.status === 500) {
                    setError(`Erro interno do servidor: ${err.response.data?.message || 'Erro desconhecido'}`);
                } else {
                    setError(`Erro ${err.response.status}: ${err.response.data?.message || 'Erro no servidor'}`);
                }
            } else if (err.request) {
                setError("Não foi possível conectar à API. Verifique sua conexão ou se o servidor está rodando.");
            } else {
                setError(`Erro: ${err.message}`);
            }
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
        modalDisc.isOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 rounded-2xl w-full max-w-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
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
                        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                            <span className="text-3xl font-bold text-white">
                                {modalDisc.resultado?.charAt(0)}
                            </span>
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-2">
                            {modalDisc.resultado}
                        </h4>
                        <p className="text-gray-400 mb-6">
                            {getDescricaoDisc(modalDisc.resultado)}
                        </p>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {getCaracteristicasDisc(modalDisc.resultado).map((caracteristica, index) => (
                                <div key={index} className="bg-white/5 rounded-lg p-3">
                                    <span className="text-white">{caracteristica}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    );

    // Funções DISC
    const getDescricaoDisc = (perfil) => {
        const descricoes = {
            "Dominante": "Pessoa orientada para resultados, decisiva e assertiva",
            "Influente": "Comunicativo, entusiasta e orientado para pessoas",
            "Estável": "Paciente, leal e orientado para equipe",
            "Consciente": "Analítico, preciso e orientado para qualidade"
        };
        return descricoes[perfil] || "Perfil não identificado";
    };

    const getCaracteristicasDisc = (perfil) => {
        const caracteristicas = {
            "Dominante": ["Líder natural", "Focado em resultados", "Toma decisões rápidas", "Aceita desafios"],
            "Influente": ["Comunicativo", "Entusiasta", "Persuasivo", "Orientado a pessoas"],
            "Estável": ["Paciente", "Confiável", "Bom ouvinte", "Trabalha em equipe"],
            "Consciente": ["Analítico", "Detalhista", "Preciso", "Orientado a qualidade"]
        };
        return caracteristicas[perfil] || ["Sem dados disponíveis"];
    };

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

    // Componente: Estatísticas no topo
    const StatsCard = ({ title, value, subtitle, color, icon: Icon }) => (
        <div className={`relative overflow-hidden rounded-2xl p-4 ${color}`}>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white/80">{title}</h3>
                    <Icon className="w-5 h-5 text-white/60" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{value}</div>
                <div className="text-xs text-white/70">{subtitle}</div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        </div>
    );

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

    // Candidaturas filtradas
    const candidaturasFiltradas = candidaturas.filter(candidatura => {
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
                {/* Header com título e busca */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                Candidaturas dos Usuários
                            </h1>
                            <p className="text-gray-400">
                                Analise currículos, perfis DISC e gerencie candidaturas
                            </p>
                        </div>

                        {/* Busca e Filtros */}
                        <div className="flex flex-col sm:flex-row gap-3 min-w-0 sm:min-w-96">
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
                                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors"
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
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatsCard
                            title="Total"
                            value={stats.total}
                            subtitle="Candidaturas"
                            color="bg-gradient-to-br from-blue-600 to-blue-700"
                            icon={Briefcase}
                        />
                        <StatsCard
                            title="Aprovadas"
                            value={stats.aprovadas}
                            subtitle="Aceitas"
                            color="bg-gradient-to-br from-emerald-600 to-green-700"
                            icon={CheckCircle}
                        />
                        <StatsCard
                            title="Em Análise"
                            value={stats.pendentes}
                            subtitle="Aguardando"
                            color="bg-gradient-to-br from-amber-600 to-orange-700"
                            icon={Clock}
                        />
                        <StatsCard
                            title="Reprovadas"
                            value={stats.reprovadas}
                            subtitle="Não selecionadas"
                            color="bg-gradient-to-br from-red-600 to-rose-700"
                            icon={XCircle}
                        />
                    </div>
                </div>

                {/* Grid de Candidaturas */}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {candidaturasFiltradas.map((candidatura) => (
                            <div
                                key={candidatura.id}
                                className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="relative z-10">
                                    {/* Header do Card */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <User className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-white text-sm truncate">
                                                    {candidatura.usuario?.nome || candidatura.usuario?.name || "Nome não informado"}
                                                </h3>
                                                <p className="text-gray-400 text-xs truncate">
                                                    {candidatura.usuario?.email || "Email não informado"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(candidatura.status)}`}>
                                            {getStatusIcon(candidatura.status)}
                                            <span className="hidden sm:inline">
                                                {candidatura.status?.replace("_", " ")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Informações da Vaga */}
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-blue-400 text-sm mb-1 line-clamp-2">
                                            {candidatura.vaga?.nome || "Vaga não especificada"}
                                        </h4>
                                        <p className="text-orange-400 font-medium text-xs mb-2">
                                            {candidatura.vaga?.empresa || "Empresa não informada"}
                                        </p>

                                        <div className="flex flex-col gap-1 text-gray-400 text-xs">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate">
                                                    {candidatura.vaga?.cidade}, {candidatura.vaga?.uf}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3 h-3 flex-shrink-0" />
                                                <span>{candidatura.vaga?.modalidade}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3 flex-shrink-0" />
                                                <span>{formatDate(candidatura.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botões de Ação */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CompactAnalysisButton
                                                    type="curriculo"
                                                    data={candidatura.usuario?.curriculo_url}
                                                    usuario={candidatura.usuario}
                                                />
                                                <CompactAnalysisButton
                                                    type="disc"
                                                    data={candidatura.usuario?.perfil_disc}
                                                    usuario={candidatura.usuario}
                                                />
                                                <CompactAnalysisButton
                                                    type="linkedin"
                                                    data={candidatura.usuario?.linkedin}
                                                    usuario={candidatura.usuario}
                                                />
                                            </div>

                                            <button
                                                onClick={() => buscarEmpresa(candidatura)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
                                            >
                                                <Building2 className="w-3 h-3" />
                                                <span className="hidden sm:inline">Empresa</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </button>
                                        </div>

                                        {/* Footer do Card */}
                                        <div className="border-t border-white/10 pt-3">
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>#{candidatura.id}</span>
                                                <span>{formatDate(candidatura.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

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
};

export default CandidaturasAdmPage;