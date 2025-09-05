// src/components/CandidaturasPorVaga.jsx
import React, { useMemo } from 'react';
import {
    Search,
    AlertCircle,
    Briefcase,
    Building2,
    MapPin,
    FileText,
    Brain,
    Linkedin,
    Video,
    CheckCircle,
    Clock,
    Users,
    Eye
} from 'lucide-react';

const CandidaturasPorVaga = ({
    candidaturasFiltradas,
    loading,
    error,
    searchTerm,
    filterStatus,
    onRetry,
    onOpenInterviewModal,
    onViewCurriculo,
    onViewDisc,
    onViewLinkedin,
    onViewCandidateDetails
}) => {
    // Agrupar candidaturas por vaga
    const vagasComCandidaturas = useMemo(() => {
        const grupos = {};

        candidaturasFiltradas.forEach(candidatura => {
            const vagaId = candidatura.vaga_id;

            if (!grupos[vagaId]) {
                grupos[vagaId] = {
                    vaga: candidatura.vaga,
                    candidaturas: [],
                    entrevistas: [],
                    stats: {
                        totalCandidatos: 0,
                        totalEntrevistas: 0,
                        entrevistasCompletas: 0,
                        entrevistasPendentes: 0
                    }
                };
            }

            grupos[vagaId].candidaturas.push(candidatura);
            grupos[vagaId].stats.totalCandidatos++;

            // Verificar entrevistas de múltiplas fontes
            const entrevistas = [];

            // 1. Verificar candidatura.usuario.entrevistas
            if (candidatura.usuario?.entrevistas && Array.isArray(candidatura.usuario.entrevistas)) {
                entrevistas.push(...candidatura.usuario.entrevistas);
            }

            // 2. Verificar candidatura.interview
            if (candidatura.interview && !entrevistas.find(e => e.id === candidatura.interview.id)) {
                entrevistas.push(candidatura.interview);
            }

            // 3. Verificar se tem interview_id mas não tem entrevistas (adicionar placeholder)
            if (candidatura.interview_id && entrevistas.length === 0) {
                entrevistas.push({
                    id: candidatura.interview_id,
                    status: candidatura.status === 'entrevista_realizada' ? 'completed' : 'pending',
                    created_at: candidatura.created_at,
                    updated_at: candidatura.updated_at
                });
            }

            // Adicionar entrevistas encontradas
            entrevistas.forEach(entrevista => {
                grupos[vagaId].entrevistas.push({
                    ...entrevista,
                    candidato: candidatura.usuario,
                    candidaturaId: candidatura.id
                });
                grupos[vagaId].stats.totalEntrevistas++;

                if (entrevista.status === 'completed' || candidatura.status === 'entrevista_realizada') {
                    grupos[vagaId].stats.entrevistasCompletas++;
                } else {
                    grupos[vagaId].stats.entrevistasPendentes++;
                }
            });
        });

        return Object.values(grupos);
    }, [candidaturasFiltradas]);


    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="text-white">Carregando candidaturas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                    <h3 className="text-lg font-semibold text-red-300">Erro ao Carregar Dados</h3>
                </div>
                <p className="text-red-200 mb-4">{error}</p>
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    if (vagasComCandidaturas.length === 0) {
        return (
            <div className="text-center py-12">
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
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {vagasComCandidaturas.map((vagaData) => (
                <div key={vagaData.vaga?.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex flex-col h-fit">
                    {/* Header da Vaga - Otimizado para layout de 2 colunas */}
                    <div className="mb-4 pb-4 border-b border-white/10">
                        {/* Título e informações principais */}
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold text-white mb-1 leading-tight">
                                    {vagaData.vaga?.nome || 'Vaga não identificada'}
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Building2 className="w-3 h-3" />
                                        {vagaData.vaga?.empresa || 'Empresa não identificada'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {vagaData.vaga?.cidade}, {vagaData.vaga?.uf}
                                    </span>
                                    <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md">
                                        {vagaData.vaga?.modalidade}
                                    </span>
                                </div>
                                {vagaData.vaga?.remuneracao && (
                                    <div className="text-green-400 font-medium text-sm mt-1">
                                        {vagaData.vaga.remuneracao}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Seção de Todos os Candidatos - Otimizada para 2 colunas */}
                    <div>
                        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            Todos os Candidatos ({vagaData.candidaturas.length})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                            {vagaData.candidaturas.map((candidatura) => {
                                // Verificar entrevistas de múltiplas fontes
                                const entrevistas = [];
                                if (candidatura.usuario?.entrevistas && Array.isArray(candidatura.usuario.entrevistas)) {
                                    entrevistas.push(...candidatura.usuario.entrevistas);
                                }
                                if (candidatura.interview && !entrevistas.find(e => e.id === candidatura.interview.id)) {
                                    entrevistas.push(candidatura.interview);
                                }

                                const hasInterview = entrevistas.length > 0 ||
                                    candidatura.interview_id ||
                                    candidatura.status === 'entrevista_realizada';

                                const lastInterview = entrevistas.length > 0 ? entrevistas[0] :
                                    candidatura.interview ||
                                    (candidatura.interview_id ? {
                                        id: candidatura.interview_id,
                                        status: candidatura.status === 'entrevista_realizada' ? 'completed' : 'pending'
                                    } : null);

                                return (
                                    <div
                                        key={candidatura.id}
                                        className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 cursor-pointer transition-all"
                                        onClick={() => {
                                            if (hasInterview) {
                                                const entrevistasParaModal = entrevistas.length > 0 ? entrevistas :
                                                    candidatura.interview ? [candidatura.interview] :
                                                        candidatura.interview_id ? [{
                                                            id: candidatura.interview_id,
                                                            status: candidatura.status === 'entrevista_realizada' ? 'completed' : 'pending',
                                                            created_at: candidatura.created_at,
                                                            updated_at: candidatura.updated_at
                                                        }] : [];

                                                onOpenInterviewModal({
                                                    isOpen: true,
                                                    entrevistas: entrevistasParaModal,
                                                    nome: candidatura.usuario?.nome || candidatura.usuario?.name || 'Usuário',
                                                    candidaturaId: candidatura.id
                                                });
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${hasInterview
                                                ? lastInterview.status === 'completed'
                                                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                                                    : 'bg-gradient-to-r from-blue-500 to-blue-600'
                                                : 'bg-gray-600'
                                                }`}>
                                                {(candidatura.usuario?.nome || candidatura.usuario?.name || 'U').charAt(0).toUpperCase()}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-white text-sm truncate">
                                                    {candidatura.usuario?.nome || candidatura.usuario?.name || "Nome não informado"}
                                                </h4>
                                                <p className="text-xs text-gray-400 truncate">
                                                    #{candidatura.id} • {candidatura.status}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status da Entrevista */}
                                        {hasInterview ? (
                                            <div className="bg-blue-500/20 border border-blue-500/30 rounded-md px-2 py-1 mb-3">
                                                <div className="text-xs text-blue-300 text-center">
                                                    Entrevista #{lastInterview.id} • {lastInterview.status === 'completed' ? 'Completa' : 'Pendente'}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-700/50 border border-gray-600 rounded-md px-2 py-1 mb-3">
                                                <div className="text-xs text-gray-400 text-center">
                                                    Sem entrevista
                                                </div>
                                            </div>
                                        )}

                                        {/* Botões de Ação */}
                                        <div className="flex items-center justify-center gap-1">
                                            {/* Ver Perfil Completo */}
                                            <div
                                                className="w-6 h-6 rounded-md flex items-center justify-center text-xs bg-green-600 text-white cursor-pointer hover:bg-green-700 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewCandidateDetails(candidatura);
                                                }}
                                                title="Ver perfil completo"
                                            >
                                                <Eye className="w-3 h-3" />
                                            </div>

                                            {/* Currículo */}
                                            <div
                                                className="w-6 h-6 rounded-md flex items-center justify-center text-xs bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewCurriculo(
                                                        candidatura.usuario_id,
                                                        candidatura.usuario?.nome || candidatura.usuario?.name || 'Usuário'
                                                    );
                                                }}
                                                title="Ver currículo"
                                            >
                                                <FileText className="w-3 h-3" />
                                            </div>

                                            {/* DISC */}
                                            <div
                                                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${candidatura.usuario?.perfil_disc
                                                    ? 'bg-purple-600 text-white cursor-pointer hover:bg-purple-700'
                                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                    }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (candidatura.usuario?.perfil_disc) {
                                                        onViewDisc({
                                                            isOpen: true,
                                                            resultado: candidatura.usuario.perfil_disc,
                                                            nome: candidatura.usuario?.nome || candidatura.usuario?.name || 'Usuário'
                                                        });
                                                    }
                                                }}
                                                title="Ver DISC"
                                            >
                                                <Brain className="w-3 h-3" />
                                            </div>

                                            {/* LinkedIn */}
                                            <div
                                                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${candidatura.usuario?.linkedin
                                                    ? 'bg-blue-700 text-white cursor-pointer hover:bg-blue-800'
                                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                    }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (candidatura.usuario?.linkedin) {
                                                        onViewLinkedin(candidatura.usuario.linkedin);
                                                    }
                                                }}
                                                title="Ver LinkedIn"
                                            >
                                                <Linkedin className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CandidaturasPorVaga;