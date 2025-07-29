// src/components/ui/CompanyPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, Clock, Building2, Users, ExternalLink, User, X } from 'lucide-react';
import LoginModal from './LoginModal';


const getApiUrl = () => {
    if (window.location.hostname !== 'localhost') {
        return 'https://learning-platform-backend-2x39.onrender.com';
    }
    return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

const API_URL = getApiUrl();

const CompanyPage = () => {
    const { id: companyId } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [vagas, setVagas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // ← Novo estado
    const [currentUser, setCurrentUser] = useState(null); // ← Dados do usuário logado
    const [selectedVaga, setSelectedVaga] = useState(null);
    const [userCandidaturas, setUserCandidaturas] = useState([]);

    // useEffect 1 - Recuperar login
    useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        const savedLoginStatus = localStorage.getItem('isUserLoggedIn');

        if (savedUser && savedLoginStatus === 'true') {
            try {
                const userData = JSON.parse(savedUser);
                setCurrentUser(userData);
                setIsUserLoggedIn(true);
                console.log('🔄 Login recuperado:', userData.name);
            } catch (error) {
                console.error('Erro ao recuperar login:', error);
                // Se der erro, limpar localStorage
                localStorage.removeItem('currentUser');
                localStorage.removeItem('isUserLoggedIn');
            }
        }
    }, []); // ← A

    // useEffect 2 - Buscar dados da empresa
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Buscar dados da empresa
                const companyResponse = await axios.get(`${API_URL}/api/companies/${companyId}`);
                setCompany(companyResponse.data);

                // Buscar vagas da empresa
                const vagasResponse = await axios.get(`${API_URL}/api/vagas/empresa/${companyId}`);
                setVagas(vagasResponse.data);

                setLoading(false);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [companyId]);

    // useEffect 3 - Buscar candidaturas do usuário
    useEffect(() => {
        const fetchUserCandidaturas = async () => {
            if (isUserLoggedIn && currentUser?.id) {
                try {
                    const response = await axios.get(`${API_URL}/api/candidaturas/usuario/${currentUser.id}`);
                    setUserCandidaturas(response.data);
                    console.log('📋 Candidaturas do usuário:', response.data);
                } catch (error) {
                    console.error('Erro ao buscar candidaturas:', error);
                }
            }
        };

        fetchUserCandidaturas();
    }, [isUserLoggedIn, currentUser]); // Executa quando usuário loga

    const handleLogin = async (loginData) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                email: loginData.email,
                password: loginData.password
            });

            const userData = response.data.user || response.data;

            // ✅ SALVAR NO LOCALSTORAGE:
            const userToStore = {
                id: userData.id,
                email: userData.email,
                name: userData.name
            };

            localStorage.setItem('currentUser', JSON.stringify(userToStore));
            localStorage.setItem('isUserLoggedIn', 'true');

            setCurrentUser(userToStore);
            setIsUserLoggedIn(true);
            setShowLoginModal(false);

            console.log('✅ Login realizado e salvo:', userData.name);

        } catch (error) {
            console.error('Erro detalhado:', error.response?.data);
            alert('❌ Erro no login. Verifique as credenciais.');
        }
    };

    const handleSignup = async (signupData) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/register`, {
                name: signupData.name,
                email: signupData.email,
                password: signupData.password
            });

            const userData = response.data.user || response.data;

            // ✅ SALVAR NO LOCALSTORAGE:
            const userToStore = {
                id: userData.id,
                email: userData.email,
                name: userData.name
            };

            localStorage.setItem('currentUser', JSON.stringify(userToStore));
            localStorage.setItem('isUserLoggedIn', 'true');

            setCurrentUser(userToStore);
            setIsUserLoggedIn(true);
            setShowLoginModal(false);

            console.log('✅ Cadastro realizado e salvo:', userData.name);

        } catch (error) {
            console.error('Erro no cadastro:', error);
            alert('⚠️ Cadastro não disponível. Use login.');
        }
    };

    const handleEnviarCandidatura = async (vaga) => {
        try {
            const response = await axios.post(`${API_URL}/api/candidaturas`, {
                usuario_id: currentUser.id,
                vaga_id: vaga.id,
                mensagem: `Candidatura para a vaga: ${vaga.nome}`
            });

            // ✅ ADICIONAR NA LISTA LOCAL:
            setUserCandidaturas(prev => [...prev, response.data]);

            alert(`✅ Candidatura enviada com sucesso para: ${vaga.nome}`);

        } catch (error) {
            console.error('Erro ao enviar candidatura:', error);
            alert('❌ Erro ao enviar candidatura. Tente novamente.');
        }
    };

    const handleCandidatar = (vaga) => {
        setSelectedVaga(vaga);

        if (!isUserLoggedIn) {
            setShowLoginModal(true);
            return;
        }

        // ✅ VERIFICAR SE JÁ SE CANDIDATOU:
        if (jaSeCandidata(vaga.id)) {
            alert(`✅ Você já se candidatou para a vaga: ${vaga.nome}\n\nSua candidatura já está registrada!`);
            return;
        }

        // Se chegou aqui, pode candidatar-se
        handleEnviarCandidatura(vaga);
    };

    const jaSeCandidata = (vagaId) => {
        return userCandidaturas.some(candidatura => candidatura.vaga_id === vagaId);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando informações da empresa...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header da empresa (como na Orbia) */}

            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="max-w-7xl mx-auto px-4 py-16 relative">
                    {/* Botão voltar */}
                    <button
                        onClick={() => navigate('/vagas')}
                        className="flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Voltar para empresas
                    </button>

                    {/* Indicador de usuário logado - canto superior direito */}
                    {isUserLoggedIn && (
                        <div className="absolute top-6 right-4">
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div className="text-sm">
                                    <p className="text-white font-medium">
                                        {currentUser?.name || 'Usuário'}
                                    </p>

                                </div>
                                <button
                                    onClick={() => {
                                        // ✅ LIMPAR LOCALSTORAGE:
                                        localStorage.removeItem('currentUser');
                                        localStorage.removeItem('isUserLoggedIn');

                                        setIsUserLoggedIn(false);
                                        setCurrentUser(null);

                                        console.log('👋 Usuário deslogado');
                                    }}
                                    className="ml-2 p-1 rounded-full hover:bg-white/10 transition-colors group"
                                    title="Sair"
                                >
                                    <X className="w-4 h-4 text-white/70 group-hover:text-white" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Conteúdo central */}
                    <div className="text-center">
                        <h1 className="text-4xl lg:text-6xl font-bold mb-4">
                            {company?.name || 'Empresa'}
                        </h1>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                            {company?.obs || 'Conectando talentos às melhores oportunidades'}
                        </p>

                        <div className="mt-8">
                            <button
                                onClick={() => document.getElementById('vagas-section').scrollIntoView({ behavior: 'smooth' })}
                                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                            >
                                Conheça as vagas →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sobre a empresa */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Sobre a empresa</h2>
                    <div className="prose max-w-none">
                        <p className="text-lg text-gray-700 leading-relaxed mb-6">
                            {company?.obs || 'Informações sobre a empresa serão carregadas aqui.'}
                        </p>

                        {company?.corporate_name && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Razão Social</h3>
                                    <p className="text-gray-600">{company.corporate_name}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Responsável</h3>
                                    <p className="text-gray-600">{company.responsible || 'Não informado'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Seção de Vagas */}
                <div id="vagas-section">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Vagas</h2>
                        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                            {vagas.length} vaga{vagas.length !== 1 ? 's' : ''} disponível{vagas.length !== 1 ? 'eis' : ''}
                        </div>
                    </div>

                    {vagas.length > 0 ? (
                        <div className="space-y-6">
                            {vagas.map(vaga => (
                                <div key={vaga.id} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{vaga.nome}</h3>

                                            <div className="flex flex-wrap gap-4 mb-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{vaga.cidade}, {vaga.uf}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{vaga.modalidade}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Building2 className="w-4 h-4" />
                                                    <span>{vaga.local}</span>
                                                </div>
                                            </div>

                                            <p className="text-gray-700 mb-4 leading-relaxed">
                                                {vaga.resumo || vaga.descricao}
                                            </p>

                                            {vaga.remuneracao && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                                    <h4 className="font-semibold text-green-800 mb-2">Remuneração</h4>
                                                    <p className="text-green-700">{vaga.remuneracao}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="lg:w-64 flex-shrink-0">
                                            <button
                                                onClick={() => handleCandidatar(vaga)}
                                                className={`w-full px-6 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 ${isUserLoggedIn && jaSeCandidata(vaga.id)
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                                                    }`}
                                                disabled={isUserLoggedIn && jaSeCandidata(vaga.id)}
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                                {!isUserLoggedIn
                                                    ? 'Login para candidatar-se'
                                                    : jaSeCandidata(vaga.id)
                                                        ? '✅ Já candidatado'
                                                        : 'Candidatar-se'
                                                }
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Nenhuma vaga disponível
                            </h3>
                            <p className="text-gray-600">
                                Esta empresa não possui vagas abertas no momento.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Login */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLogin={handleLogin}
                onSignup={handleSignup}
            />
        </div>
    );
};

export default CompanyPage;