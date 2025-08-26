import React, { useState, useEffect } from 'react';
import {
    X,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    FileText,
    Brain,
    Linkedin,
    ExternalLink,
    Clock,
    CheckCircle,
    XCircle,
    Building2,
    MessageSquare,
    Award,
    Download,
    Eye,
    Loader2
} from 'lucide-react';
import { API_URL } from '../utils/api';
import { useAuth } from '@/contexts/AuthContext';
import testService from '../../services/testService';

const discConfig = {
    D: { name: "Dominância", color: "from-red-500 to-red-600", description: "Pessoa direta, assertiva e orientada a resultados" },
    I: { name: "Influência", color: "from-yellow-500 to-orange-500", description: "Pessoa sociável, comunicativa e entusiasta" },
    S: { name: "Estabilidade", color: "from-green-500 to-green-600", description: "Pessoa colaborativa, paciente e leal" },
    C: { name: "Conformidade", color: "from-blue-500 to-blue-600", description: "Pessoa analítica, precisa e detalhista" }
};

const CandidateDetailsModal = ({ isOpen, candidatura, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [candidateDetails, setCandidateDetails] = useState(null);
    const [discResult, setDiscResult] = useState(null);
    const { accessToken } = useAuth();

    useEffect(() => {
        if (isOpen && candidatura) {
            fetchCandidateDetails();
        }
    }, [isOpen, candidatura, accessToken]);

    const fetchCandidateDetails = async () => {
        if (!candidatura) return;

        setLoading(true);
        try {
            console.log('🔍 Verificando dados do candidato já disponíveis...');

            // OTIMIZAÇÃO: Usar dados já carregados do LEFT JOIN primeiro
            if (candidatura.usuario && Object.keys(candidatura.usuario).length > 2) {
                console.log('✅ Usando dados já carregados do LEFT JOIN!');
                setCandidateDetails({
                    ...candidatura.usuario,
                    // Garantir compatibilidade com diferentes formatos
                    nome: candidatura.usuario?.nome || candidatura.usuario?.name,
                    skills: candidatura.usuario?.skills || candidatura.usuario?.competencias
                });
            } else {
                // Fallback: buscar dados completos apenas se necessário
                console.log('⚠️ Dados incompletos, fazendo busca adicional...');
                
                const token = localStorage.getItem("accessToken") || accessToken;

                if (!token) {
                    console.warn('⚠️ Token de acesso não encontrado');
                    setCandidateDetails({
                        nome: candidatura.usuario?.nome || candidatura.usuario?.name || 'Nome não disponível',
                        email: 'Email não disponível',
                        skills: candidatura.usuario?.skills || candidatura.usuario?.competencias
                    });
                    return;
                }

                const userResponse = await fetch(`${API_URL}/api/users/${candidatura.usuario_id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    console.log('📋 Dados completos obtidos via API:', userData);
                    setCandidateDetails(userData);
                } else {
                    console.error('❌ Erro ao buscar dados do usuário:', {
                        status: userResponse.status,
                        statusText: userResponse.statusText
                    });
                    
                    // Use dados básicos como fallback
                    setCandidateDetails({
                        nome: candidatura.usuario?.nome || candidatura.usuario?.name || 'Nome não disponível',
                        email: candidatura.usuario?.email || 'Email não disponível',
                        telefone: candidatura.usuario?.telefone,
                        cidade: candidatura.usuario?.cidade,
                        estado: candidatura.usuario?.estado,
                        skills: candidatura.usuario?.skills || candidatura.usuario?.competencias
                    });
                }
            }

            // Buscar resultado DISC se ainda não temos
            if (!candidatura.usuario?.perfil_disc) {
                try {
                    const discData = await testService.getUserPsychologicalTests(candidatura.usuario_id, 'completed', 1);
                    if (discData.tests && discData.tests.length > 0) {
                        const teste = discData.tests[0];
                        setDiscResult({
                            principal: getPrincipalDisc(teste.disc_scores),
                            pontuacoes: teste.disc_scores,
                            analise: teste.overall_analysis,
                            recomendacoes: teste.recommendations
                        });
                    }
                } catch (discError) {
                    console.warn('Erro ao buscar dados DISC:', discError);
                }
            } else {
                setDiscResult(candidatura.usuario.perfil_disc);
            }

        } catch (error) {
            console.error('Erro ao buscar detalhes do candidato:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const handleDownloadCurriculo = async () => {
        try {
            const token = localStorage.getItem("accessToken") || accessToken;

            if (!token) {
                alert("Sessão expirada. Faça login novamente.");
                return;
            }

            const response = await fetch(`${API_URL}/api/users/${candidatura.usuario_id}/curriculo`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    alert("Currículo não encontrado para este candidato.");
                } else if (response.status === 401) {
                    alert("Sessão expirada. Faça login novamente.");
                } else {
                    const errorText = await response.text();
                    alert(`Erro ${response.status}: ${errorText}`);
                }
                return;
            }

            const blob = await response.blob();

            if (blob.size === 0) {
                alert("Arquivo de currículo está vazio.");
                return;
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `curriculo_${candidatura.usuario?.nome || candidatura.usuario?.name || 'candidato'}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Erro ao baixar currículo:', error);
            alert(`Erro ao carregar currículo: ${error.message}`);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "aprovado":
            case "aceito":
                return "bg-green-100 text-green-800 border-green-200";
            case "reprovado":
            case "rejeitado":
                return "bg-red-100 text-red-800 border-red-200";
            case "em_analise":
            case "pendente":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "em_entrevista":
                return "bg-blue-100 text-blue-800 border-blue-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case "aprovado":
            case "aceito":
                return <CheckCircle className="w-4 h-4" />;
            case "reprovado":
            case "rejeitado":
                return <XCircle className="w-4 h-4" />;
            case "em_analise":
            case "pendente":
                return <Clock className="w-4 h-4" />;
            case "em_entrevista":
                return <Eye className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-gray-900 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Perfil do Candidato</h3>
                            <p className="text-gray-400">{candidatura?.usuario?.nome || candidatura?.usuario?.name || 'Carregando...'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                <p className="text-gray-400">Carregando informações do candidato...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Informações Básicas */}
                            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-500" />
                                    Informações Básicas
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Lado esquerdo */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-lg">
                                                    {(candidatura?.usuario?.nome || candidatura?.usuario?.name || 'U').charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h5 className="text-white font-semibold text-lg">
                                                    {candidatura?.usuario?.nome || candidatura?.usuario?.name || 'Nome não informado'}
                                                </h5>
                                                <p className="text-gray-400 text-sm">Candidato #{candidatura?.id}</p>
                                            </div>
                                        </div>

                                        {candidateDetails?.email && (
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <Mail className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm">{candidateDetails.email}</span>
                                            </div>
                                        )}

                                        {candidateDetails?.telefone && (
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <Phone className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm">{candidateDetails.telefone}</span>
                                            </div>
                                        )}

                                        {(candidateDetails?.cidade || candidateDetails?.estado) && (
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <MapPin className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm">
                                                    {candidateDetails.cidade}{candidateDetails.cidade && candidateDetails.estado ? ', ' : ''}{candidateDetails.estado}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Lado direito */}
                                    <div className="space-y-4">
                                        {/* Status da Candidatura */}
                                        <div>
                                            <label className="text-gray-400 text-sm font-medium block mb-2">Status da Candidatura</label>
                                            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor(candidatura?.status)}`}>
                                                {getStatusIcon(candidatura?.status)}
                                                {candidatura?.status || 'Não informado'}
                                            </div>
                                        </div>

                                        {/* Data da Candidatura */}
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <span className="text-gray-400 text-xs block">Data da Candidatura</span>
                                                <span className="text-sm">
                                                    {candidatura?.data_candidatura ?
                                                        new Date(candidatura.data_candidatura).toLocaleDateString('pt-BR') :
                                                        'Não informada'
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        {/* LinkedIn */}
                                        {candidatura?.usuario?.linkedin && (
                                            <div className="flex items-center gap-3">
                                                <Linkedin className="w-4 h-4 text-blue-500" />
                                                <a
                                                    href={candidatura.usuario.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
                                                >
                                                    Ver perfil LinkedIn
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Experiência Profissional e Competências */}
                            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-orange-500" />
                                    Experiência e Competências
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Cargo Atual */}
                                    {candidateDetails?.current_position && (
                                        <div className="bg-white/5 rounded-lg p-4 border border-white/10 md:col-span-2 lg:col-span-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-4 h-4 text-purple-500" />
                                                <span className="text-gray-400 text-sm font-medium">Cargo Atual</span>
                                            </div>
                                            <div className="text-white font-semibold text-lg">
                                                {candidateDetails.current_position}
                                            </div>
                                        </div>
                                    )}

                                    {/* Nível de Experiência */}
                                    {candidateDetails?.experience_level && (
                                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Briefcase className="w-4 h-4 text-orange-500" />
                                                <span className="text-gray-400 text-sm font-medium">Nível de Experiência</span>
                                            </div>
                                            <div className="text-white font-semibold capitalize">
                                                {candidateDetails.experience_level.replace('_', ' ')}
                                            </div>
                                        </div>
                                    )}

                                    {/* Nível de Educação */}
                                    {candidateDetails?.education_level && (
                                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Award className="w-4 h-4 text-blue-500" />
                                                <span className="text-gray-400 text-sm font-medium">Formação</span>
                                            </div>
                                            <div className="text-white font-semibold capitalize">
                                                {candidateDetails.education_level.replace('_', ' ')}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tipo de Trabalho Preferido */}
                                    {candidateDetails?.preferred_job_type && (
                                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin className="w-4 h-4 text-green-500" />
                                                <span className="text-gray-400 text-sm font-medium">Modalidade Preferida</span>
                                            </div>
                                            <div className="text-white font-semibold capitalize">
                                                {candidateDetails.preferred_job_type.replace('_', ' ')}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Skills/Competências */}
                                {(() => {
                                    // Buscar competências de múltiplas fontes
                                    const skills = candidateDetails?.skills || 
                                                  candidateDetails?.competencias || 
                                                  candidatura?.usuario?.skills || 
                                                  candidatura?.usuario?.competencias;
                                    
                                    console.log('🔍 Competências encontradas:', skills);
                                    
                                    if (!skills) return null;
                                    
                                    let skillsArray = [];
                                    if (typeof skills === 'string') {
                                        // Dividir por vírgula, ponto e vírgula ou quebra de linha
                                        skillsArray = skills.split(/[,;\n]/).map(s => s.trim()).filter(s => s.length > 0);
                                    } else if (Array.isArray(skills)) {
                                        skillsArray = skills.filter(s => s && s.toString().trim());
                                    }
                                    
                                    if (skillsArray.length === 0) return null;
                                    
                                    return (
                                        <div className="mt-4">
                                            <h6 className="text-white font-semibold mb-3 flex items-center gap-2">
                                                <Award className="w-4 h-4 text-purple-500" />
                                                Competências ({skillsArray.length})
                                            </h6>
                                            <div className="flex flex-wrap gap-2">
                                                {skillsArray.map((skill, index) => (
                                                    <span key={index} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-md text-sm border border-blue-500/30">
                                                        {skill.toString().trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Biografia/Sobre (se houver) */}
                                {candidateDetails?.bio && (
                                    <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
                                        <h6 className="text-white font-semibold mb-2">Sobre o Candidato</h6>
                                        <p className="text-gray-300 text-sm leading-relaxed">{candidateDetails.bio}</p>
                                    </div>
                                )}
                            </div>

                            {/* Informações da Vaga */}
                            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-purple-500" />
                                    Vaga Aplicada
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div>
                                            <h5 className="text-white font-semibold text-lg">{candidatura?.vaga?.nome || 'Vaga não identificada'}</h5>
                                            <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                                                <Building2 className="w-4 h-4" />
                                                {candidatura?.vaga?.empresa || 'Empresa não identificada'}
                                            </div>
                                        </div>

                                        {candidatura?.vaga?.descricao && (
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                {candidatura.vaga.descricao}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm">
                                                {candidatura?.vaga?.cidade}, {candidatura?.vaga?.uf}
                                            </span>
                                        </div>

                                        {candidatura?.vaga?.modalidade && (
                                            <div className="inline-block bg-blue-500/20 text-blue-300 px-3 py-1 rounded-md text-sm">
                                                {candidatura.vaga.modalidade}
                                            </div>
                                        )}

                                        {candidatura?.vaga?.remuneracao && (
                                            <div className="text-green-400 font-semibold">
                                                {candidatura.vaga.remuneracao}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Mensagem do Candidato */}
                            {candidatura?.mensagem && (
                                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-green-500" />
                                        Mensagem do Candidato
                                    </h4>
                                    <div className="bg-gray-800/50 rounded-lg p-4">
                                        <p className="text-gray-200 leading-relaxed">{candidatura.mensagem}</p>
                                    </div>
                                </div>
                            )}

                            {/* Perfil DISC */}
                            {discResult && (
                                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <Brain className="w-5 h-5 text-purple-500" />
                                        Perfil Comportamental DISC
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="text-center">
                                            <div className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-r ${discConfig[discResult.principal]?.color || 'from-purple-500 to-pink-600'} rounded-full flex items-center justify-center`}>
                                                <span className="text-3xl font-bold text-white">{discResult.principal}</span>
                                            </div>
                                            <h5 className="text-xl font-bold text-white mb-2">
                                                {discConfig[discResult.principal]?.name || discResult.principal}
                                            </h5>
                                            <p className="text-gray-400 text-sm">
                                                {discConfig[discResult.principal]?.description || "Perfil comportamental"}
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <h6 className="text-white font-semibold">Pontuações DISC</h6>
                                            <div className="grid grid-cols-2 gap-2">
                                                {Object.entries(discResult.pontuacoes || {}).map(([letra, pontuacao]) => (
                                                    <div key={letra} className="bg-white/5 rounded-lg p-3 text-center">
                                                        <div className="text-white font-bold">{letra}</div>
                                                        <div className="text-gray-300 text-sm">{pontuacao.toFixed(1)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {discResult.analise && (
                                        <div className="mt-4 bg-white/5 rounded-lg p-4">
                                            <h6 className="text-white font-semibold mb-2">Análise</h6>
                                            <p className="text-gray-300 text-sm">{discResult.analise}</p>
                                        </div>
                                    )}

                                    {discResult.recomendacoes && (
                                        <div className="mt-4 bg-white/5 rounded-lg p-4">
                                            <h6 className="text-white font-semibold mb-2">Recomendações</h6>
                                            <p className="text-gray-300 text-sm">{discResult.recomendacoes}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Documentos e Ações */}
                            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    Documentos e Ações
                                </h4>

                                <div className="flex flex-wrap gap-3">
                                    {/* Ver Currículo */}
                                    <button
                                        onClick={handleDownloadCurriculo}
                                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yello2-700 text-white rounded-lg transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Ver Currículo
                                    </button>

                                    {/* LinkedIn */}
                                    {candidatura?.usuario?.linkedin && (
                                        <a
                                            href={candidatura.usuario.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors"
                                        >
                                            <Linkedin className="w-4 h-4" />
                                            Ver LinkedIn
                                        </a>
                                    )}


                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CandidateDetailsModal;