// src/components/ui/CompanyPage.jsx - TOTALMENTE CORRIGIDO
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, Clock, Building2, Users, ExternalLink, Briefcase, Globe, ChevronRight } from 'lucide-react';
import LoginModal from './LoginModal';
import { API_URL } from '../utils/api';
import Navbar from './Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '../ui/Notification';
import BotaoCandidatura from './BotaoCandidatura';

const CompanyPage = () => {
    const { id: companyId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, login, signup } = useAuth(); // ✅ ADICIONADO signup
    const { showNotification, NotificationComponent } = useNotification();
    const [company, setCompany] = useState(null);
    const [vagas, setVagas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedVaga, setSelectedVaga] = useState(null);
    const [userCandidaturas, setUserCandidaturas] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Buscar dados da empresa e vagas
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Buscar dados da empresa
                const companyResponse = await axios.get(`${API_URL}/api/companies/${companyId}`);
                setCompany(companyResponse.data);

                // Buscar vagas da empresa
                const vagasResponse = await axios.get(`${API_URL}/api/vagas/empresa/${companyId}`);
                setVagas(vagasResponse.data);

            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [companyId]);

    // Buscar candidaturas do usuário
    useEffect(() => {
        const fetchUserCandidaturas = async () => {

            if (isAuthenticated && user?.id) {
                try {
                    console.log('🔍 Buscando candidaturas para usuário:', user.id);
                    console.log('🌐 URL:', `${API_URL}/api/candidaturas/usuario/${user.id}`);

                    const response = await axios.get(`${API_URL}/api/candidaturas/usuario/${user.id}`);
                    setUserCandidaturas(response.data);
                    console.log('✅ Candidaturas carregadas:', response.data);
                } catch (error) {
                    console.error('❌ Erro ao buscar candidaturas:', error);
                }
            } else {
                setUserCandidaturas([]);
            }
        };

        fetchUserCandidaturas();
    }, [companyId, isAuthenticated, user?.id]);

    const handleLogin = async (loginData) => {
        try {
            await login(loginData.email, loginData.password);
            setShowLoginModal(false);
            console.log('✅ Login realizado via AuthContext');
        } catch (error) {
            console.error('Erro detalhado:', error);
            alert(`❌ Erro no login: ${error.message}`);
        }
    };

    const handleSignup = async (signupData) => {
        try {
            await signup({
                name: signupData.name,
                email: signupData.email,
                password: signupData.password
            });
            setShowLoginModal(false);
            console.log('✅ Cadastro realizado via AuthContext');
        } catch (error) {
            console.error('Erro no cadastro:', error);
            alert(`❌ Erro no cadastro: ${error.message}`);
        }
    };

    const handleEnviarCandidatura = async (vaga) => {
        if (isSubmitting) {
            console.log('⏳ Já enviando candidatura, ignorando clique...');
            return;
        }
        setIsSubmitting(true);

        try {
            console.log('🔄 Enviando candidatura:', {
                usuario_id: user.id,
                vaga_id: vaga.id,
                vaga_nome: vaga.nome,
            });

            const response = await axios.post(`${API_URL}/api/candidaturas`, {
                usuario_id: user.id,
                vaga_id: vaga.id,
                mensagem: `Candidatura para a vaga: ${vaga.nome}`
            });

            console.log('✅ Candidatura enviada:', response.data);

            // Adicionar na lista local
            setUserCandidaturas(prev => [...prev, response.data]);

            // Notificação de candidatura enviada
            showNotification({
                type: 'success',
                title: 'Candidatura Enviada!',
                message: `Sua candidatura para ${vaga.nome} foi enviada com sucesso.`,
                duration: 5000
            });

        } catch (error) {
            console.error('❌ Erro COMPLETO:', error);

            if (error.response) {
                console.error('📡 Status:', error.response.status);
                console.error('📡 Data:', error.response.data);

                switch (error.response.status) {
                    case 409:
                        showNotification({
                            type: 'info',
                            title: 'Candidatura Existente',
                            message: `Você já se candidatou para a vaga: ${vaga.nome}`,
                            duration: 4000
                        });

                        // Recarregar candidaturas
                        if (isAuthenticated && user?.id) {
                            try {
                                const response = await axios.get(`${API_URL}/api/candidaturas/usuario/${user.id}`);
                                setUserCandidaturas(response.data);
                                console.log('🔄 Candidaturas recarregadas:', response.data);
                            } catch (reloadError) {
                                console.error('Erro ao recarregar candidaturas:', reloadError);
                            }
                        }
                        break;
                    case 400:
                        alert(`❌ Dados inválidos: ${error.response.data?.message || 'Verifique as informações'}`);
                        break;
                    case 404:
                        alert('❌ Endpoint não encontrado. Verifique se a API está rodando.');
                        break;
                    case 500:
                        alert('❌ Erro interno do servidor. Tente novamente.');
                        break;
                    default:
                        alert(`❌ Erro ${error.response.status}: ${error.response.data?.message || 'Erro desconhecido'}`);
                }
            } else if (error.request) {
                console.error('📡 Sem resposta do servidor');
                alert('❌ Erro de conexão. Verifique se a API está rodando.');
            } else {
                console.error('⚙️ Erro de configuração');
                alert(`❌ Erro: ${error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCandidatar = (vaga) => {
        setSelectedVaga(vaga);

        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }

        // Verificar se já se candidatou
        if (jaSeCandidata(vaga.id)) {
            showNotification({
                type: 'info',
                title: 'Candidatura Existente',
                message: `Você já se candidatou para a vaga: ${vaga.nome}`,
                duration: 4000
            });
            return;
        }

        handleEnviarCandidatura(vaga);
    };

    const jaSeCandidata = (vagaId) => {
        const vagaIdNum = parseInt(vagaId);
        const vagaIdStr = String(vagaId);

        const resultado = userCandidaturas.some(candidatura => {
            const candidaturaVagaId = candidatura.vaga_id;
            return candidaturaVagaId === vagaIdNum ||
                candidaturaVagaId === vagaIdStr ||
                parseInt(candidaturaVagaId) === vagaIdNum;
        });

        console.log(`🔍 Verificando candidatura para vaga ${vagaId}:`, {
            resultado,
            candidaturas: userCandidaturas.length
        });

        return resultado;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black">
                <Navbar
                    currentView="empresa"
                    onViewChange={(view) => console.log('View changed:', view)}
                    onAddTrilha={() => console.log('Add trilha')}
                />

                <main className="pt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                        <div className="text-center">
                            <div className="relative mx-auto mb-8 w-16 h-16">
                                <div className="w-16 h-16 border-4 border-gray-700 border-t-orange-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-red-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Carregando empresa</h3>
                            <p className="text-gray-400">Buscando informações e vagas disponíveis...</p>
                        </div>
<<<<<<< HEAD
                      </div>

                      {/* Botão de candidatura */}
                      <div className="xl:w flex-shrink-0 flex gap-4">
                        <button
                          onClick={() => handleCandidatar(vaga)}
                          className={`w-full px-6 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 ${
                            isUserLoggedIn && jaSeCandidata(vaga.id)
                              ? "bg-gray-600 cursor-not-allowed text-gray-300"
                              : "bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 hover:-translate-y-0.5"
                          }`}
                          disabled={isUserLoggedIn && jaSeCandidata(vaga.id)}
                        >
                          {!isUserLoggedIn ? (
                            <>
                              <ExternalLink className="w-5 h-5" />
                              Fazer login
                            </>
                          ) : jaSeCandidata(vaga.id) ? (
                            <>
                              <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                                <span className="text-xs">✓</span>
                              </div>
                              Candidatura enviada
                            </>
                          ) : (
                            <>
                              <ExternalLink className="w-5 h-5" />
                              Candidatar-se
                            </>
                          )}
                        </button>

                        {isUserLoggedIn && jaSeCandidata(vaga.id) && (
                          <p className="text-xs text-green-400 text-center mt-2 xl:w-45">
                            Sua candidatura foi registrada
                          </p>
                        )}
                        {/* Botão de detalhes */}
                        <div className="xl:w-80 flex-shrink-0">
                          <button
                            onClick={() => navigate(`/vaga/${vaga.id}`)}
                            className="w-full px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center justify-center gap-2"
                          >
                            <Briefcase className="w-4 h-4" />
                            Ver detalhes
                          </button>
                        </div>
                      </div>
=======
>>>>>>> origin/dev1
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <Navbar
                currentView="empresa"
                onViewChange={(view) => console.log('View changed:', view)}
                onAddTrilha={() => console.log('Add trilha')}
            />

            <main className="pt-16">
                {/* Hero Section */}
                <section className="relative overflow-hidden">
                    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-l from-purple-500/10 to-blue-500/10 rounded-full blur-3xl"></div>

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10">
                            <div className="mb-8 sm:mb-12">
                                <button
                                    onClick={() => navigate('/vagas')}
                                    className="group flex items-center gap-3 text-gray-300 hover:text-white transition-all duration-300 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-white/10 border border-white/10"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                    <span className="font-medium">Voltar para empresas</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                                <div className="space-y-6 lg:space-y-8">
                                    <div className="space-y-4">
                                        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-orange-500/20">
                                            <Building2 className="w-5 h-5 text-orange-400" />
                                            <span className="text-orange-200 font-medium text-sm">Empresa Parceira</span>
                                        </div>

                                        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                                            {company?.name || 'Empresa'}
                                        </h1>

                                        <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl">
                                            {company?.obs || 'Conectando talentos às melhores oportunidades no agronegócio com tecnologia inovadora e sustentabilidade.'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <MapPin className="w-5 h-5 text-blue-400" />
                                                <span className="text-white font-semibold">Localização</span>
                                            </div>
                                            <p className="text-gray-300 text-sm">Brasil • Nacional</p>
                                        </div>

                                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Users className="w-5 h-5 text-green-400" />
                                                <span className="text-white font-semibold">Setor</span>
                                            </div>
                                            <p className="text-gray-300 text-sm">Agronegócio • Tecnologia</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={() => document.getElementById('vagas-section')?.scrollIntoView({ behavior: 'smooth' })}
                                            className="group bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3.5 rounded-xl font-semibold hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                                        >
                                            <Briefcase className="w-5 h-5" />
                                            Ver {vagas.length} vaga{vagas.length !== 1 ? 's' : ''}
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                        </button>

                                        <button
                                            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                                            className="bg-white/10 backdrop-blur-sm text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center justify-center gap-2"
                                        >
                                            Sobre a empresa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Container principal */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                    {/* Sobre a empresa */}
                    <section className="mb-12 lg:mb-16">
                        <div className="bg-gray-900/80 backdrop-blur border-gray-800 rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 border">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Sobre a empresa</h2>
                            <div className="prose max-w-none">
                                <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-6">
                                    {company?.obs || 'Empresa focada em soluções inovadoras para o agronegócio com tecnologia de ponta e sustentabilidade.'}
                                </p>

                                {(company?.corporate_name || company?.responsible) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-gray-800">
                                        {company?.corporate_name && (
                                            <div>
                                                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-orange-500" />
                                                    Razão Social
                                                </h3>
                                                <p className="text-gray-400">{company.corporate_name}</p>
                                            </div>
                                        )}
                                        {company?.responsible && (
                                            <div>
                                                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-green-500" />
                                                    Responsável
                                                </h3>
                                                <p className="text-gray-400">{company.responsible}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Seção de Vagas */}
                    <section id="vagas-section">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Vagas Disponíveis</h2>
                                <p className="text-gray-400">Explore as oportunidades e candidate-se</p>
                            </div>
                            <div className="bg-orange-600/20 text-orange-400 px-4 py-2 rounded-full border border-orange-600/30 text-center">
                                <span className="font-semibold">{vagas.length} vaga{vagas.length !== 1 ? 's' : ''}</span>
                            </div>
                        </div>

                        {vagas.length > 0 ? (
                            <div className="space-y-6 lg:space-y-8">
                                {vagas.map(vaga => (
                                    <article
                                        key={vaga.id}
                                        className="bg-gray-900/80 backdrop-blur border-gray-800 rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 hover:bg-gray-800/80 transition-all duration-300 border hover:border-gray-700"
                                    >
                                        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                                            <div className="flex-1 min-w-0">
                                                <header className="mb-6">
                                                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 line-clamp-2">
                                                        {vaga.nome}
                                                    </h3>

                                                    <div className="flex flex-wrap gap-3 sm:gap-4">
                                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                                            <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                                            <span>{vaga.cidade}, {vaga.uf}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                                            <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                            <span>{vaga.modalidade}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                                            <Building2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                            <span>{vaga.local}</span>
                                                        </div>
                                                    </div>
                                                </header>

                                                <div className="space-y-4 mb-6">
                                                    {vaga.descricao && (
                                                        <div>
                                                            <h4 className="font-semibold text-white mb-2">Descrição</h4>
                                                            <p className="text-gray-300 leading-relaxed">{vaga.descricao}</p>
                                                        </div>
                                                    )}

                                                    {vaga.criterios && (
                                                        <div>
                                                            <h4 className="font-semibold text-white mb-2">Critérios</h4>
                                                            <p className="text-gray-300 leading-relaxed">{vaga.criterios}</p>
                                                        </div>
                                                    )}

                                                    {vaga.beneficios && (
                                                        <div>
                                                            <h4 className="font-semibold text-white mb-2">Benefícios</h4>
                                                            <p className="text-gray-300 leading-relaxed">{vaga.beneficios}</p>
                                                        </div>
                                                    )}

                                                    {vaga.remuneracao && (
                                                        <div className="bg-green-900/30 border border-green-700/50 rounded-xl p-4">
                                                            <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                                                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                                Remuneração
                                                            </h4>
                                                            <p className="text-green-300">{vaga.remuneracao}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Botões de ação */}
                                            <div className="xl:w-64 flex-shrink-0 space-y-3">
                                                {/* Botão de candidatura */}
                                                <BotaoCandidatura
                                                    vaga={vaga}
                                                    isAuthenticated={isAuthenticated}
                                                    isSubmitting={isSubmitting}
                                                    jaSeCandidata={jaSeCandidata}
                                                    handleCandidatar={handleCandidatar}
                                                />

                                                {/* Botão de detalhes */}
                                                <button
                                                    onClick={() => navigate(`/vagas/${vaga.id}`)}
                                                    className="w-full px-6 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                    Detalhes da Vaga
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 sm:py-20">
                                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-800 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Briefcase className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                                    Nenhuma vaga disponível
                                </h3>
                                <p className="text-gray-400 max-w-md mx-auto mb-8 px-4">
                                    Esta empresa não possui vagas abertas no momento. Volte em breve para verificar novas oportunidades.
                                </p>
                                <button
                                    onClick={() => navigate('/vagas')}
                                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium flex items-center gap-2 mx-auto"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Ver outras empresas
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLogin={handleLogin}
                onSignup={handleSignup}
            />
            {NotificationComponent}
        </div>
    );
};

export default CompanyPage;