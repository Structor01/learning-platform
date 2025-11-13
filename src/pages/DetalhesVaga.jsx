// src/components/DetalhesVaga.jsx - VERSÃO CORRIGIDA
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../components/utils/api';
import { MapPin, Clock, Building2, ArrowLeft } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import BotaoCandidatura from '../components/ui/BotaoCandidatura';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/ui/Notification';
import { decodeVaga } from '../components/utils/htmlDecode';

// Função helper para obter o token
const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const DetalhesVaga = () => {
    const { vagaId } = useParams();
    const navigate = useNavigate();
    const [vaga, setVaga] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userCandidaturas, setUserCandidaturas] = useState([]);

    // ✅ CORRIGIDO: Usar apenas o que existe no AuthContext
    const { user, isAuthenticated, isLoading } = useAuth();
    const { showNotification, NotificationComponent } = useNotification();

    useEffect(() => {
        const fetchVaga = async () => {
            try {
                ('🔍 Buscando detalhes da vaga:', vagaId);
                ('🌐 URL:', `${API_URL}/api/recruitment/jobs/${vagaId}`);

                const response = await axios.get(`${API_URL}/api/recruitment/jobs/${vagaId}`);
                ('✅ Vaga carregada:', response.data);
                // Decodificar HTML entities na vaga
                const vagaDecodificada = decodeVaga(response.data);
                setVaga(vagaDecodificada);
            } catch (error) {
                console.error('❌ Erro ao buscar detalhes da vaga:', error);
                console.error('📡 Status:', error.response?.status);
                console.error('📡 Data:', error.response?.data);
                console.error('🌐 URL tentada:', error.config?.url);
            }
        };

        if (vagaId) {
            fetchVaga();
        }
    }, [vagaId]);

    // ✅ ADICIONADO: Buscar candidaturas do usuário (igual ao CompanyPage)
    useEffect(() => {
        const fetchUserCandidaturas = async () => {
            if (isAuthenticated && user?.id) {
                try {
                    const response = await axios.get(`${API_URL}/api/candidaturas/usuario/${user.id}`, {
                        headers: getAuthHeader()
                    });
                    setUserCandidaturas(response.data);
                } catch (error) {
                    console.error('❌ Erro ao buscar candidaturas:', error);
                }
            } else {
                setUserCandidaturas([]);
            }
        };

        fetchUserCandidaturas();
    }, [isAuthenticated, user?.id]);

    // ✅ ADICIONADO: Função jaSeCandidata (igual ao CompanyPage)
    const jaSeCandidata = (vagaId) => {
        const vagaIdNum = parseInt(vagaId);
        const vagaIdStr = String(vagaId);

        return userCandidaturas.some(candidatura => {
            const candidaturaVagaId = candidatura.vaga_id;
            return candidaturaVagaId === vagaIdNum ||
                candidaturaVagaId === vagaIdStr ||
                parseInt(candidaturaVagaId) === vagaIdNum;
        });
    };

    // ✅ CORRIGIDO: Função de candidatura (igual ao CompanyPage)
    const handleEnviarCandidatura = async (vaga) => {
        if (isSubmitting) {
            ('⏳ Já enviando candidatura, ignorando clique...');
            return;
        }
        setIsSubmitting(true);

        try {
            const vagaNome = vaga.title || vaga.nome;
            ('🔄 Enviando candidatura:', {
                usuario_id: user.id,
                vaga_id: vaga.id,
                vaga_nome: vagaNome,
            });

            const response = await axios.post(`${API_URL}/api/candidaturas`, {
                usuario_id: user.id,
                vaga_id: vaga.id,
                mensagem: `Candidatura para a vaga: ${vagaNome}`
            }, {
                headers: getAuthHeader()
            });

            ('✅ Candidatura enviada:', response.data);

            // Adicionar na lista local
            setUserCandidaturas(prev => [...prev, response.data]);

            // Notificação de candidatura enviada
            showNotification({
                type: 'success',
                title: 'Candidatura Enviada!',
                message: `Sua candidatura para ${vagaNome} foi enviada com sucesso.`,
                duration: 5000
            });

        } catch (error) {
            console.error('❌ Erro COMPLETO:', error);

            if (error.response) {
                const vagaNome = vaga.title || vaga.nome;
                switch (error.response.status) {
                    case 409:
                        showNotification({
                            type: 'info',
                            title: 'Candidatura Existente',
                            message: `Você já se candidatou para a vaga: ${vagaNome}`,
                            duration: 4000
                        });

                        // Recarregar candidaturas
                        if (isAuthenticated && user?.id) {
                            try {
                                const response = await axios.get(`${API_URL}/api/candidaturas/usuario/${user.id}`, {
                                    headers: getAuthHeader()
                                });
                                setUserCandidaturas(response.data);
                            } catch (reloadError) {
                                console.error('Erro ao recarregar candidaturas:', reloadError);
                            }
                        }
                        break;
                    default:
                        alert(`❌ Erro ${error.response.status}: ${error.response.data?.message || 'Erro desconhecido'}`);
                }
            } else {
                alert(`❌ Erro: ${error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCandidatar = (vaga) => {
        if (!isAuthenticated) {
            navigate('/');  // ✅ CORRIGIDO: navegar para home/login
            return;
        }

        // Verificar se já se candidatou
        if (jaSeCandidata(vaga.id)) {
            const vagaNome = vaga.title || vaga.nome;
            showNotification({
                type: 'info',
                title: 'Candidatura Existente',
                message: `Você já se candidatou para a vaga: ${vagaNome}`,
                duration: 4000
            });
            return;
        }

        handleEnviarCandidatura(vaga);
    };

    // Mostrar loading enquanto verifica autenticação ou carrega vaga
    if (isLoading || !vaga) {
        return (
            <div className="min-h-screen bg-white text-black flex items-center justify-center">
                <div className="text-center">
                    <div className="relative mx-auto mb-4 w-12 h-12">
                        <div className="w-12 h-12 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-600">Carregando detalhes da vaga...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black">
            <Navbar
                currentView="vaga"
                onViewChange={() => { }}
                onAddTrilha={() => { }}
            />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                {/* Botão Voltar */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 group flex items-center gap-3 text-gray-700 hover:text-black transition-all duration-300 bg-gray-100/50 backdrop-blur rounded-xl px-4 py-2 hover:bg-gray-200 border border-gray-200"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Voltar
                </button>

                {/* Título */}
                <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-black">
                    {vaga.title || vaga.nome}
                </h1>

                {/* Informações rápidas */}
                <div className="flex flex-wrap gap-4 mb-8 text-gray-700">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span>
                            {vaga.location ||
                                (vaga.cidade && vaga.uf ? `${vaga.cidade}, ${vaga.uf}` : vaga.local || 'Não informado')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        {vaga.job_type || vaga.modalidade}
                    </div>
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-green-600" />
                        {vaga.company || vaga.local}
                    </div>
                </div>

                {/* Descrição */}
                {(vaga.description || vaga.descricao) && (
                    <section className="mb-8 bg-white border border-gray-200 rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-4 text-black flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                            Descrição
                        </h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{(vaga.description || vaga.descricao).replace(/\\n/g, '\n')}</p>
                    </section>
                )}

                {/* Requisitos */}
                {(vaga.requirements || vaga.criterios) && (
                    <section className="mb-8 bg-white border border-gray-200 rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-4 text-black flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                            Requisitos
                        </h2>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap space-y-2">
                            {(vaga.requirements || vaga.criterios).replace(/\\n/g, '\n').split('\n').map((linha, idx) =>
                                linha.trim() ? (
                                    <div key={idx} className="flex gap-3">
                                        <span className="text-green-600 font-bold flex-shrink-0">•</span>
                                        <span>{linha.trim()}</span>
                                    </div>
                                ) : null
                            )}
                        </div>
                    </section>
                )}

                {/* Benefícios */}
                {(vaga.benefits || vaga.beneficios) && (
                    <section className="mb-8 bg-white border border-gray-200 rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-4 text-black flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                            Benefícios
                        </h2>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap space-y-2">
                            {(vaga.benefits || vaga.beneficios).replace(/\\n/g, '\n').split('\n').map((linha, idx) =>
                                linha.trim() ? (
                                    <div key={idx} className="flex gap-3">
                                        <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                                        <span>{linha.trim()}</span>
                                    </div>
                                ) : null
                            )}
                        </div>
                    </section>
                )}

                {/* Resumo */}
                {vaga.summary && (
                    <section className="mb-8 bg-green-50 border border-green-200 rounded-xl p-4">
                        <h2 className="text-green-700 font-semibold mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                            Resumo
                        </h2>
                        <p className="text-green-800 whitespace-pre-wrap">{vaga.summary.replace(/\\n/g, '\n')}</p>
                    </section>
                )}

                {/* Remuneração */}
                {(vaga.salary_range || vaga.remuneracao) && (
                    <section className="mb-8 bg-green-50 border border-green-200 rounded-xl p-4">
                        <h2 className="text-green-700 font-semibold mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                            Remuneração
                        </h2>
                        <p className="text-green-800 whitespace-pre-wrap">{(vaga.salary_range || vaga.remuneracao).replace(/\\n/g, '\n')}</p>
                    </section>
                )}

                {/* Botão de candidatura */}
                <BotaoCandidatura
                    vaga={vaga}
                    isAuthenticated={isAuthenticated}
                    isSubmitting={isSubmitting}
                    jaSeCandidata={jaSeCandidata}
                    handleCandidatar={handleCandidatar}
                />
            </main>

            {NotificationComponent}
        </div>
    );
};

export default DetalhesVaga;
