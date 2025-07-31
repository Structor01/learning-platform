// src/components/ui/VagasPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Building2, Briefcase, ArrowRight, Users, Globe, ChevronRight, User, ChevronDown } from 'lucide-react';
import PublicHeader from './PublicHeader';
import { API_URL } from '../utils/api';


const VagasPage = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('')
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    // Verificar se usuário está logado
    useEffect(() => {
        const savedUser = sessionStorage.getItem('currentUser');
        const savedLoginStatus = sessionStorage.getItem('isUserLoggedIn');

        if (savedUser && savedLoginStatus === 'true') {
            try {
                const userData = JSON.parse(savedUser);
                setCurrentUser(userData);
                setIsUserLoggedIn(true);
            } catch (error) {
                console.error('Erro ao recuperar login:', error);
                sessionStorage.removeItem('currentUser');
                sessionStorage.removeItem('isUserLoggedIn');
            }
        }
    }, []);

    useEffect(() => {
        axios.get(`${API_URL}/api/companies`)
            .then(res => {
                setCompanies(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Erro ao buscar empresas:', err);
                setLoading(false);
            });
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('isUserLoggedIn');
        setIsUserLoggedIn(false);
        setCurrentUser(null);
        setShowUserDropdown(false);
        console.log('👋 Usuário deslogado');
    };

    const handleMinhasCandidaturas = () => {
        navigate('/minhas-candidaturas');
        setShowUserDropdown(false);
    };

    const handleLogin = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando empresas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            {/* Header atualizado */}
            <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo/Title */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-green-700 bg-clip-text text-transparent">
                                    Oportunidades de Carreira
                                </h1>
                                <p className="text-sm text-gray-600">Conecte-se com as melhores empresas do agronegócio</p>
                            </div>
                        </div>

                        {/* User Area */}
                        <div className="flex items-center gap-4">
                            {isUserLoggedIn ? (
                                // Usuário logado
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                                        className="flex items-center gap-3 bg-white/60 backdrop-blur rounded-full px-4 py-2 border border-blue-200 hover:border-blue-300 transition-all duration-200"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-semibold">
                                                {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <span className="text-gray-700 font-medium hidden sm:block">
                                            {currentUser?.name || 'Usuário'}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showUserDropdown && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setShowUserDropdown(false)}
                                            />

                                            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-20">
                                                {/* User Info */}
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                                                            <span className="text-white text-sm font-semibold">
                                                                {currentUser?.name?.charAt(0)?.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{currentUser?.name}</p>
                                                            <p className="text-sm text-gray-500">{currentUser?.email}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Menu Items */}
                                                <div className="py-2">
                                                    <button
                                                        onClick={handleMinhasCandidaturas}
                                                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <Briefcase className="w-4 h-4 text-green-500" />
                                                        <span>Minhas Candidaturas</span>
                                                    </button>
                                                </div>

                                                {/* Logout */}
                                                <div className="border-t border-gray-100 pt-2">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        <span>Sair</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                // Usuário não logado
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleLogin}
                                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        <User className="w-4 h-4" />
                                        <span className="hidden sm:inline">Entrar</span>
                                    </button>

                                    <button
                                        onClick={handleLogin}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                                    >
                                        Fazer Login
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>


            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        Descubra Sua Próxima
                        <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                            Oportunidade Profissional
                        </span>
                    </h2>
                    <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
                        Conecte-se com empresas inovadoras e encontre oportunidades que impulsionarão
                        sua carreira no agronegócio e tecnologia.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Busque por empresa ou setor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 text-lg rounded-2xl bg-white/80 backdrop-blur border border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 shadow-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/60 backdrop-blur rounded-2xl p-6 text-center border border-white/20 shadow-lg">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{companies.length}+</h3>
                        <p className="text-gray-600">Empresas Parceiras</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur rounded-2xl p-6 text-center border border-white/20 shadow-lg">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {companies.reduce((acc, company) => acc + (company.jobCount || 0), 0) || '50'}+
                        </h3>
                        <p className="text-gray-600">Vagas Disponíveis</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur rounded-2xl p-6 text-center border border-white/20 shadow-lg">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">500+</h3>
                        <p className="text-gray-600">Profissionais Conectados</p>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="relative mx-auto mb-8 w-16 h-16">
                            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-green-400 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Carregando oportunidades</h3>
                        <p className="text-gray-600">Buscando as melhores empresas para você...</p>
                    </div>
                )}

                {/* Companies Grid */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {(searchTerm
                            ? companies.filter(company =>
                                company.name && company.name.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            : companies
                        ).map(company => (
                            <div
                                key={company.id}

                                className="group bg-white/70 backdrop-blur rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-white/50 hover:border-blue-200 hover:-translate-y-2 overflow-hidden"
                            >
                                {/* Header with gradient background */}
                                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 p-6 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-4">
                                            <Building2 className="w-8 h-8 text-white/90" />
                                            <div className="flex items-center bg-white/20 rounded-full px-3 py-1">

                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold mb-2 leading-tight">
                                            {company.name || 'Nome da Empresa'}
                                        </h3>

                                        <div className="flex items-center gap-2 text-white/80 text-sm">
                                            <Globe className="w-4 h-4" />
                                            <span>Agronegócio</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {company.corporate_name && (
                                        <p className="text-sm text-gray-500 mb-3 font-medium">
                                            {company.corporate_name}
                                        </p>
                                    )}

                                    <p className="text-gray-700 text-sm leading-relaxed mb-6">
                                        {company.obs || 'Empresa focada em soluções inovadoras para o agronegócio com tecnologia de ponta e sustentabilidade.'}
                                    </p>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4 text-blue-500" />
                                            <span>Brasil</span>
                                        </div>
                                        {company.responsible && (
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <Users className="w-4 h-4 text-green-500" />
                                                <span>Responsável: {company.responsible}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* CTA Button */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            <span className="text-xs text-gray-500 font-medium">Contratando agora</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:text-blue-700 transition-colors"
                                            onClick={() => navigate(`/empresa/${company.id}`)}
                                        >
                                            <span className="text-sm">Ver vagas</span>

                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && companies.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Search className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Nenhuma empresa encontrada
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-8">
                            Não encontramos empresas que correspondam à sua busca. Tente ajustar os filtros ou busque por outros termos.
                        </p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                        >
                            Limpar filtros
                        </button>
                    </div>
                )}

                {/* No Search Results */}
                {!loading && searchTerm && companies.filter(company =>
                    company.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 && companies.length > 0 && (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Search className="w-12 h-12 text-yellow-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Nenhum resultado para "{searchTerm}"
                            </h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-8">
                                Não encontramos empresas que correspondam à sua busca. Tente buscar por outros termos.
                            </p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                            >
                                Ver todas as empresas
                            </button>
                        </div>
                    )}
            </div>
        </div>
    );
}

export default VagasPage;