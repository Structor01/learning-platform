// src/components/DetalhesVaga.jsx - VERSÃO CORRIGIDA
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { MapPin, Clock, Building2, ArrowLeft } from 'lucide-react';
import Navbar from './Navbar';
import BotaoCandidatura from '../ui/BotaoCandidatura';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../ui/Notification';

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
                console.log('🔍 Buscando detalhes da vaga:', vagaId);
                console.log('🌐 URL:', `${API_URL}/api/recruitment/jobs/${vagaId}`);
                
                const response = await axios.get(`${API_URL}/api/recruitment/jobs/${vagaId}`);
                console.log('✅ Vaga carregada:', response.data);
                setVaga(response.data);
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
                    const response = await axios.get(`${API_URL}/api/candidaturas/usuario/${user.id}`);
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
            console.log('⏳ Já enviando candidatura, ignorando clique...');
            return;
        }
        setIsSubmitting(true);

        try {
            const vagaNome = vaga.title || vaga.nome;
            console.log('🔄 Enviando candidatura:', {
                usuario_id: user.id,
                vaga_id: vaga.id,
                vaga_nome: vagaNome,
            });

            const response = await axios.post(`${API_URL}/api/candidaturas`, {
                usuario_id: user.id,
                vaga_id: vaga.id,
                mensagem: `Candidatura para a vaga: ${vagaNome}`
            });

            console.log('✅ Candidatura enviada:', response.data);

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
                                const response = await axios.get(`${API_URL}/api/candidaturas/usuario/${user.id}`);
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
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="relative mx-auto mb-4 w-12 h-12">
                        <div className="w-12 h-12 border-4 border-gray-700 border-t-orange-600 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-400">Carregando detalhes da vaga...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar
                currentView="vaga"
                onViewChange={() => { }}
                onAddTrilha={() => { }}
            />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                {/* Botão Voltar */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 group flex items-center gap-3 text-gray-300 hover:text-white transition-all duration-300 bg-white/5 backdrop-blur rounded-xl px-4 py-2 hover:bg-white/10 border border-white/10"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Voltar
                </button>

                {/* Título */}
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                    {vaga.title || vaga.nome}
                </h1>

                {/* Informações rápidas */}
                <div className="flex flex-wrap gap-4 mb-8 text-gray-400">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        {vaga.location || `${vaga.cidade}, ${vaga.uf}`}
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        {vaga.job_type || vaga.modalidade}
                    </div>
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-green-500" />
                        {vaga.company || vaga.local}
                    </div>
                </div>

                {/* Descrição */}
                {(vaga.description || vaga.descricao) && (
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">Descrição</h2>
                        <p className="text-gray-300 leading-relaxed text-justify">{vaga.description || vaga.descricao}</p>
                    </section>
                )}

                {/* Requisitos */}
                {(vaga.requirements || vaga.criterios) && (
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">Requisitos</h2>
                        <p className="text-gray-300 leading-relaxed text-justify">{vaga.requirements || vaga.criterios}</p>
                    </section>
                )}

                {/* Benefícios */}
                {(vaga.benefits || vaga.beneficios) && (
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">Benefícios</h2>
                        <p className="text-gray-300 leading-relaxed text-justify">{vaga.benefits || vaga.beneficios}</p>
                    </section>
                )}

                {/* Resumo */}
                {vaga.summary && (
                    <section className="mb-8 bg-blue-900/30 border border-blue-700/50 rounded-xl p-4">
                        <h2 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            Resumo
                        </h2>
                        <p className="text-blue-300">{vaga.summary}</p>
                    </section>
                )}

                {/* Remuneração */}
                {(vaga.salary_range || vaga.remuneracao) && (
                    <section className="mb-8 bg-green-900/30 border border-green-700/50 rounded-xl p-4">
                        <h2 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            Remuneração
                        </h2>
                        <p className="text-green-300">{vaga.salary_range || vaga.remuneracao}</p>
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